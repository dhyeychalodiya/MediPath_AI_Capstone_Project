// hospitalProvider.js
// Live hospital search: Google Places (New API) → Overpass mirrors → Nominatim fallback
// Each step has a timeout and falls through to the next on failure.

const fs = require('fs');
const path = require('path');

const GOOGLE_PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';

// Multiple Overpass API mirrors in priority order
const OVERPASS_MIRRORS = [
  process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Nominatim search endpoint (no auth needed, 1 req/sec limit, very reliable)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Simple in-memory cache: { cacheKey: { timestamp, data } }
const resultCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ── Google Places Persistent Disk-backed Usage Counter ───────────────────────
const USAGE_FILE = path.join(__dirname, '../data/google_usage.json');
const MAX_DAILY_LIMIT = parseInt(process.env.GOOGLE_PLACES_DAILY_LIMIT, 10) || 100;

function getTodayString() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function loadGoogleUsage() {
  const today = getTodayString();
  let data = { date: today, calls: 0, maxDailyLimit: MAX_DAILY_LIMIT, quotaHit: false, lastUpdated: new Date().toISOString() };
  try {
    if (fs.existsSync(USAGE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
      if (raw && raw.date === today) {
        data = {
          date: today,
          calls: typeof raw.calls === 'number' ? raw.calls : 0,
          maxDailyLimit: MAX_DAILY_LIMIT,
          quotaHit: Boolean(raw.quotaHit),
          reason: raw.reason || null,
          lastUpdated: raw.lastUpdated || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Could not read google_usage.json:', err.message);
  }
  return data;
}

function saveGoogleUsage(usage) {
  try {
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write google_usage.json:', err.message);
  }
}

let googleUsage = loadGoogleUsage();

function getGooglePlacesUsage() {
  googleUsage = loadGoogleUsage();
  return {
    ...googleUsage,
    remaining: Math.max(0, googleUsage.maxDailyLimit - googleUsage.calls),
  };
}

function trackGoogleCall() {
  const today = getTodayString();
  if (googleUsage.date !== today) {
    googleUsage = { date: today, calls: 0, maxDailyLimit: MAX_DAILY_LIMIT, quotaHit: false, lastUpdated: new Date().toISOString() };
  }
  googleUsage.calls++;
  if (googleUsage.calls >= googleUsage.maxDailyLimit) {
    googleUsage.quotaHit = true;
    googleUsage.reason = `Reached maximum daily limit of ${googleUsage.maxDailyLimit} calls`;
  }
  googleUsage.lastUpdated = new Date().toISOString();
  saveGoogleUsage(googleUsage);
  return getGooglePlacesUsage();
}

function markGoogleQuotaHit(reason = 'Google Places quota exceeded') {
  const today = getTodayString();
  if (googleUsage.date !== today) {
    googleUsage = { date: today, calls: 0, maxDailyLimit: MAX_DAILY_LIMIT, quotaHit: false, lastUpdated: new Date().toISOString() };
  }
  googleUsage.quotaHit = true;
  googleUsage.reason = reason;
  googleUsage.lastUpdated = new Date().toISOString();
  saveGoogleUsage(googleUsage);
  console.warn(`[Google Places] Quota hit recorded: ${reason} (calls today: ${googleUsage.calls})`);
  return getGooglePlacesUsage();
}

function resetGooglePlacesUsage() {
  const today = getTodayString();
  googleUsage = { date: today, calls: 0, maxDailyLimit: MAX_DAILY_LIMIT, quotaHit: false, lastUpdated: new Date().toISOString() };
  saveGoogleUsage(googleUsage);
  return getGooglePlacesUsage();
}

function hasLiveProvider() {
  // Always true — we have Nominatim as a no-key fallback
  return true;
}

function getApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.HOSPITALS_API_KEY;
}

function buildSearchText({ city, state, locationScope, condition }) {
  const place =
    locationScope === 'country'
      ? 'India'
      : locationScope === 'state'
      ? state || 'India'
      : [city, state].filter(Boolean).join(', ') || 'India';
  const specialty = condition?.specialization || 'healthcare';
  return `${specialty} hospitals in ${place}`;
}

function calculateDistanceKm(a, b) {
  if (!a || !b) return 0;
  const toRad = v => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return +(6371 * 2 * Math.asin(Math.sqrt(h))).toFixed(1);
}

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

function mapGooglePlace(place, condition, origin) {
  const loc = place.location || {};
  const lat = Number(loc.latitude) || 0;
  const lng = Number(loc.longitude) || 0;
  return {
    hospital_id: `google-${place.id}`,
    hospital_name: (place.displayName && place.displayName.text) || place.name || 'Hospital',
    city: (place.formattedAddress && place.formattedAddress.split(',')[0]) || '',
    state: '',
    latitude: lat,
    longitude: lng,
    google_rating: place.rating || 0,
    total_beds: place.userRatingCount || 0,
    nabh_accredited: false,
    tier: 'mid',
    specializations: condition?.specialization || '',
    procedures_offered: condition?.procedure || '',
    address: place.formattedAddress || '',
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
    website: place.websiteUri || '',
    distanceKm: origin ? calculateDistanceKm(origin, { lat, lng }) : 0,
    source: 'Google Places',
  };
}

const SPECIALTY_OSM_QUERIES = {
  'dermatology': ['skin clinic', 'dermatology clinic', 'skin hospital', 'dermatologist'],
  'ophthalmology': ['eye hospital', 'eye clinic', 'eye care', 'ophthalmologist'],
  'dentistry': ['dental clinic', 'dental hospital', 'dentist'],
  'gynecology': ['maternity hospital', 'women hospital', 'maternity home', 'gynecologist'],
  'obstetrics': ['maternity hospital', 'women hospital', 'maternity home'],
  'ob-gyn': ['maternity hospital', 'women hospital', 'maternity home'],
  'ob/gyn': ['maternity hospital', 'women hospital', 'maternity home'],
  'psychiatry': ['mental hospital', 'psychiatric clinic', 'hospital'],
  'orthopedics': ['orthopedic hospital', 'bone joint clinic', 'joint replacement', 'bone hospital'],
  'cardiology': ['heart hospital', 'cardiac hospital', 'heart institute'],
  'pulmonology': ['chest hospital', 'chest clinic', 'pulmonologist', 'respiratory hospital'],
  'ent': ['ent hospital', 'ent clinic', 'ear nose throat hospital'],
  'gastroenterology': ['gastroenterology hospital', 'digestive clinic', 'gastro hospital'],
  'urology': ['urology hospital', 'kidney hospital', 'dialysis center'],
  'nephrology': ['kidney hospital', 'dialysis center', 'nephrology clinic'],
  'neurology': ['neuro hospital', 'brain hospital', 'neurology clinic'],
  'oncology': ['cancer hospital', 'cancer institute', 'oncology clinic'],
  'pediatrics': ['children hospital', 'pediatric clinic', 'child hospital'],
  'general surgery': ['surgical hospital', 'general hospital', 'multispeciality hospital'],
  'general medicine': ['multispeciality hospital', 'general hospital', 'clinic'],
  'emergency medicine': ['emergency hospital', 'trauma center', 'multispeciality hospital'],
};

function getOsmSearchTerms(condition) {
  const spec = String(condition?.specialization || condition?.specialty || condition?.condition || '').toLowerCase().trim();
  for (const [key, terms] of Object.entries(SPECIALTY_OSM_QUERIES)) {
    if (spec === key || new RegExp(`\\b${key}\\b`, 'i').test(spec)) {
      return terms;
    }
  }
  return ['multispeciality hospital', 'general hospital', 'hospital'];
}

function inferOsmHospitalSpecialties(name, condition) {
  const n = String(name || '').toLowerCase();
  const condSpec = String(condition?.specialization || condition?.specialty || '').trim();
  const matched = [];

  if (/eye|netram|drishti|ophthal/i.test(n)) matched.push('Ophthalmology');
  if (/skin|derma|cutis|cosmetic/i.test(n)) matched.push('Dermatology');
  if (/dental|dento|tooth|teeth|smile/i.test(n)) matched.push('Dentistry');
  if (/maternity|mother|women|gynec|female|prasuti/i.test(n)) matched.push('Gynecology', 'OB/GYN');
  if (/heart|cardiac|cardio/i.test(n)) matched.push('Cardiology');
  if (/ortho|bone|joint|fracture|spine/i.test(n)) matched.push('Orthopedics');
  if (/neuro|brain/i.test(n)) matched.push('Neurology');
  if (/cancer|onco/i.test(n)) matched.push('Oncology');
  if (/child|pediatric|shishu|bal/i.test(n)) matched.push('Pediatrics');
  if (/chest|pulmo|respiratory|lung/i.test(n)) matched.push('Pulmonology');
  if (/gastro|digestive|liver|hepat/i.test(n)) matched.push('Gastroenterology');
  if (/kidney|uro|nephro|dialysis/i.test(n)) matched.push('Urology', 'Nephrology');
  if (/mental|psych|mind|behavior/i.test(n)) matched.push('Psychiatry');
  if (/\bent\b|ear|throat/i.test(n)) matched.push('ENT');

  if (matched.length === 0) {
    if (condSpec) {
      matched.push(condSpec, 'General Medicine');
    } else {
      matched.push('General Medicine');
    }
  } else if (!matched.includes(condSpec) && /multispeciality|multi-speciality|general|civil|trust|teaching/i.test(n)) {
    if (condSpec) matched.push(condSpec);
    matched.push('General Medicine');
  }

  return matched.join(', ');
}

function mapOsmHospital(element, condition, origin) {
  const tags = element.tags || {};
  const loc = element.center || element;
  const lat = Number(loc.lat) || 0;
  const lng = Number(loc.lon) || 0;
  const hospName = tags.name || tags['name:en'] || 'Hospital';
  const inferredSpecs = inferOsmHospitalSpecialties(hospName, condition);

  return {
    hospital_id: `osm-${element.type}-${element.id}`,
    hospital_name: hospName,
    city: tags['addr:city'] || tags['addr:town'] || '',
    state: tags['addr:state'] || '',
    latitude: lat,
    longitude: lng,
    google_rating: 4.1,
    total_beds: parseInt(tags.beds) || 50,
    nabh_accredited: false,
    tier: 'mid',
    specializations: inferredSpecs,
    procedures_offered: condition?.procedure || '',
    address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']]
      .filter(Boolean).join(', '),
    phone: tags.phone || tags['contact:phone'] || '',
    website: tags.website || tags['contact:website'] || '',
    distanceKm: origin ? calculateDistanceKm(origin, { lat, lng }) : 0,
    source: 'OpenStreetMap',
  };
}

function mapNominatimResult(item, condition, origin) {
  const lat = Number(item.lat) || 0;
  const lng = Number(item.lon) || 0;
  const addressParts = item.address || {};
  const hospName = item.display_name ? item.display_name.split(',')[0].trim() : 'Hospital';
  const inferredSpecs = inferOsmHospitalSpecialties(hospName, condition);

  return {
    hospital_id: `nominatim-${item.place_id}`,
    hospital_name: hospName,
    city: addressParts.city || addressParts.town || addressParts.village || addressParts.county || '',
    state: addressParts.state || '',
    latitude: lat,
    longitude: lng,
    google_rating: 4.2,
    total_beds: 50,
    nabh_accredited: false,
    tier: 'mid',
    specializations: inferredSpecs,
    procedures_offered: condition?.procedure || '',
    address: item.display_name || '',
    phone: '',
    website: '',
    distanceKm: origin ? calculateDistanceKm(origin, { lat, lng }) : 0,
    source: 'OpenStreetMap',
  };
}

// ── Strategy 1: Google Places (New API) ────────────────────────────────────
// Throws a special QuotaError when the daily limit is hit (HTTP 429 or 403 RESOURCE_EXHAUSTED).
class GoogleQuotaError extends Error {
  constructor(msg) { super(msg); this.name = 'GoogleQuotaError'; }
}

async function searchGooglePlaces(options) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Google Places] No API key configured');
    return [];
  }

  // Pre-flight check: if daily limit reached or already marked quota hit, skip immediately
  const currentUsage = getGooglePlacesUsage();
  if (currentUsage.quotaHit || currentUsage.calls >= currentUsage.maxDailyLimit) {
    console.warn(`[Google Places] Skipping: quota reached (${currentUsage.calls}/${currentUsage.maxDailyLimit} calls)`);
    throw new GoogleQuotaError(`Google Places daily limit reached (${currentUsage.calls}/${currentUsage.maxDailyLimit})`);
  }

  const textQuery = buildSearchText(options);
  const body = {
    textQuery,
    languageCode: 'en',
    maxResultCount: 20,
    includedType: 'hospital',
  };

  if (options.origin && options.locationScope === 'city') {
    const radiusMeters = Math.min(Math.max((options.radiusKm || 20) * 1000, 1000), 50000);
    body.locationBias = {
      circle: {
        center: { latitude: options.origin.lat, longitude: options.origin.lng },
        radius: radiusMeters,
      },
    };
  }

  const response = await fetchWithTimeout(
    GOOGLE_PLACES_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri',
      },
      body: JSON.stringify(body),
    },
    7000
  );

  if (!response.ok) {
    const errText = await response.text();
    const isQuotaOrLimit =
      response.status === 429 ||
      response.status === 403 ||
      errText.includes('RESOURCE_EXHAUSTED') ||
      errText.includes('RATE_LIMIT') ||
      errText.includes('quota') ||
      errText.includes('Quota') ||
      errText.includes('OVER_QUERY_LIMIT') ||
      errText.includes('BILLING');

    if (isQuotaOrLimit) {
      markGoogleQuotaHit(`HTTP ${response.status}: ${errText.slice(0, 120)}`);
      throw new GoogleQuotaError(`Google Places daily quota exceeded (HTTP ${response.status})`);
    }
    throw new Error(`Google Places HTTP ${response.status}: ${errText.slice(0, 150)}`);
  }

  const payload = await response.json();
  const places = payload.places || [];
  trackGoogleCall(); // Count this successful Google Places API query
  return places.map(p => mapGooglePlace(p, options.condition, options.origin));
}

// ── Strategy 2: Overpass API (multiple mirrors) ────────────────────────────
async function searchOverpass(options) {
  if (!options.origin) return [];

  const radiusMeters = Math.min(Math.max((options.radiusKm || 20) * 1000, 1000), 50000);
  const { lat, lng } = options.origin;
  const query =
    options.locationScope === 'country'
      ? `[out:json][timeout:10];area["ISO3166-1"="IN"][admin_level=2]->.s;(nwr["amenity"="hospital"](area.s););out center tags 40;`
      : `[out:json][timeout:10];(nwr["amenity"="hospital"](around:${radiusMeters},${lat},${lng}););out center tags 40;`;

  for (const mirrorUrl of OVERPASS_MIRRORS) {
    try {
      const response = await fetchWithTimeout(
        `${mirrorUrl}?data=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MediPath-AI-Capstone/1.0 (student project)',
          },
        },
        1500
      );

      if (!response.ok) {
        console.warn(`Overpass mirror ${mirrorUrl} returned HTTP ${response.status}`);
        continue;
      }

      const payload = await response.json();
      const elements = payload.elements || [];
      if (elements.length > 0) {
        console.log(`✓ Overpass: ${elements.length} hospitals from ${mirrorUrl}`);
        return elements
          .filter(e => e.tags && e.tags.name) // only named hospitals
          .map(e => mapOsmHospital(e, options.condition, options.origin));
      }
    } catch (err) {
      console.warn(`Overpass mirror ${mirrorUrl} failed/timed out: ${err.message}`);
    }
  }
  return [];
}

// ── Strategy 3: Nominatim (most reliable, no quota) ───────────────────────
async function searchNominatim(options) {
  const city = options.city || '';
  const state = options.state || '';
  const place = [city, state, 'India'].filter(Boolean).join(', ');
  const targetTerms = getOsmSearchTerms(options.condition);
  const primarySearchTerm = targetTerms[0] || 'hospital';

  const params = new URLSearchParams({
    q: `${primarySearchTerm} in ${place}`,
    format: 'json',
    addressdetails: '1',
    limit: '12',
    countrycodes: 'in',
  });

  if (options.origin) {
    // Bias results toward the search location using viewbox
    const { lat, lng } = options.origin;
    const delta = 0.5; // ~55km box
    params.set('viewbox', `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`);
    params.set('bounded', '1');
  }

  let results = [];
  try {
    const response = await fetchWithTimeout(
      `${NOMINATIM_URL}?${params}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'MediPath-AI-Capstone/1.0 (student project, dhyey@medipath.ai)',
        },
      },
      6000
    );

    if (response.ok) {
      results = await response.json();
    }
  } catch (err) {
    console.warn(`Nominatim primary query error: ${err.message}`);
  }

  // If specialty search yielded fewer than 5 results, supplement with general hospitals in the area
  if (results.length < 5) {
    try {
      const fallbackParams = new URLSearchParams({
        q: `hospital in ${place}`,
        format: 'json',
        addressdetails: '1',
        limit: String(10 - results.length),
        countrycodes: 'in',
      });
      if (options.origin) {
        const { lat, lng } = options.origin;
        const delta = 0.5;
        fallbackParams.set('viewbox', `${lng - delta},${lat + delta},${lng + delta},${lat - delta}`);
        fallbackParams.set('bounded', '1');
      }
      const fbResponse = await fetchWithTimeout(
        `${NOMINATIM_URL}?${fallbackParams}`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'MediPath-AI-Capstone/1.0 (student project, dhyey@medipath.ai)',
          },
        },
        4000
      );
      if (fbResponse.ok) {
        const fbResults = await fbResponse.json();
        const seen = new Set(results.map(r => r.place_id));
        for (const item of fbResults) {
          if (!seen.has(item.place_id)) {
            seen.add(item.place_id);
            results.push(item);
          }
        }
      }
    } catch (fbErr) {
      console.warn(`Nominatim fallback query error: ${fbErr.message}`);
    }
  }

  console.log(`✓ Nominatim: ${results.length} results for "${primarySearchTerm} in ${place}"`);

  return results
    .filter(r => {
      const type = (r.type || '').toLowerCase();
      const cls = (r.class || '').toLowerCase();
      const name = (r.display_name || '').toLowerCase();
      return (
        (cls === 'amenity' && (type === 'hospital' || type === 'clinic' || type === 'doctors' || type === 'dentist')) ||
        name.includes('hospital') ||
        name.includes('clinic') ||
        name.includes('center') ||
        name.includes('centre') ||
        name.includes('care')
      );
    })
    .map(r => mapNominatimResult(r, options.condition, options.origin));
}

// ── Public: searchLiveHospitals ────────────────────────────────────────────
// Tries Google Places → Overpass mirrors → Nominatim, in order.
// Returns array of mapped hospital objects (may be empty).
async function searchLiveHospitals(options) {
  const cacheKey = `${options.city || ''}-${options.state || ''}-${options.condition?.specialization || ''}-${options.locationScope}`;
  const cached = resultCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`✓ Cache hit for "${cacheKey}" (${cached.data.length} hospitals)`);
    return cached.data;
  }

  let results = [];

  // 1️⃣ Google Places
  if (getApiKey()) {
    try {
      results = await searchGooglePlaces(options);
      if (results.length > 0) {
        console.log(`✓ Google Places: ${results.length} hospitals`);
        resultCache.set(cacheKey, { timestamp: Date.now(), data: results });
        return results;
      }
    } catch (err) {
      console.warn(`Google Places failed: ${err.message}`);
    }
  }

  // 2️⃣ Overpass API mirrors
  try {
    results = await searchOverpass(options);
    if (results.length > 0) {
      resultCache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results;
    }
  } catch (err) {
    console.warn(`All Overpass mirrors failed: ${err.message}`);
  }

  // 3️⃣ Nominatim (most reliable, always works)
  try {
    results = await searchNominatim(options);
    if (results.length > 0) {
      resultCache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results;
    }
  } catch (err) {
    console.warn(`Nominatim failed: ${err.message}`);
  }

  console.warn('All live providers failed — returning empty results');
  return [];
}

// ── Public: searchOpenStreetMap ────────────────────────────────────────────
// Nominatim is the primary, specialty-targeted OpenStreetMap search engine; Overpass as mirror fallback.
async function searchOpenStreetMap(options) {
  try {
    const nominatimResults = await searchNominatim(options);
    if (nominatimResults.length > 0) return nominatimResults;
  } catch (nomErr) {
    console.warn(`Nominatim search error, attempting Overpass fallback: ${nomErr.message}`);
  }
  return searchOverpass(options);
}

// Legacy alias kept for any callers that still use the old name
const searchFreeHospitals = searchOpenStreetMap;

module.exports = {
  hasLiveProvider,
  searchGooglePlaces,
  searchOpenStreetMap,
  searchFreeHospitals,   // backwards-compat alias
  searchLiveHospitals,
  GoogleQuotaError,
  getGooglePlacesUsage,
  resetGooglePlacesUsage,
  markGoogleQuotaHit,
};