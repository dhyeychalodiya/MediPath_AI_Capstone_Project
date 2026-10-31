const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');
const XLSX = require('xlsx');
const { predictConditions, getFollowUpQuestions, loadModel, getSpecializationTerms, EMERGENCY_WARNING_PATTERNS } = require('../models/symptomModel');
const { hasLiveProvider, searchGooglePlaces, searchOpenStreetMap, GoogleQuotaError, getGooglePlacesUsage, resetGooglePlacesUsage, markGoogleQuotaHit } = require('../services/hospitalProvider');
const { isConfigured: isGeminiConfigured, normalizeSymptoms, recommendHospitals } = require('../services/geminiProvider');

// Load hospitals: Prefer backend/data/hospitals.json (920 records), fallback to XLSX if present
let hospitals = [];
const jsonPath = path.join(__dirname, '../data/hospitals.json');
const xlsxPath = path.join(__dirname, '../../Datasets/hospital.xlsx');

if (fs.existsSync(jsonPath)) {
  try {
    hospitals = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error('Failed to parse hospitals.json:', err);
  }
}

if (!hospitals.length && fs.existsSync(xlsxPath)) {
  try {
    const hospitalWorkbook = XLSX.readFile(xlsxPath);
    hospitals = XLSX.utils.sheet_to_json(hospitalWorkbook.Sheets[hospitalWorkbook.SheetNames[0]], { defval: '' });
  } catch (err) {
    console.error('Failed to read hospital.xlsx:', err);
  }
}

// Build list of unique cities in local dataset for fuzzy search
const uniqueCities = [...new Set(hospitals.map(h => String(h.city || '').trim()).filter(Boolean))];
const cityFuse = new Fuse(uniqueCities.map(name => ({ name })), {
  keys: ['name'],
  threshold: 0.35,
});

// Common Indian city alternative spellings/names
const CITY_ALIASES = {
  bengaluru: 'bangalore',
  bangalore: 'bengaluru',
  gurugram: 'gurgaon',
  gurgaon: 'gurugram',
  mumbai: 'bombay',
  bombay: 'mumbai',
  kolkata: 'calcutta',
  calcutta: 'kolkata',
  chennai: 'madras',
  madras: 'chennai',
  kochi: 'cochin',
  cochin: 'kochi',
  varanasi: 'banaras',
  banaras: 'varanasi',
  puducherry: 'pondicherry',
  pondicherry: 'puducherry',
  mysuru: 'mysore',
  mysore: 'mysuru',
  visakhapatnam: 'vizag',
  vizag: 'visakhapatnam',
  secunderabad: 'hyderabad',
  kukatpally: 'hyderabad',
  noida: 'delhi',
  ghaziabad: 'delhi',
  faridabad: 'delhi',
};

function matchesCityFuzzy(hospitalCity, searchCity) {
  if (!searchCity) return true;
  const hCity = String(hospitalCity || '').trim().toLowerCase();
  const sCity = String(searchCity || '').trim().toLowerCase();
  if (!hCity) return false;

  if (hCity === sCity) return true;
  if (hCity.includes(sCity) || sCity.includes(hCity)) return true;

  const alias = CITY_ALIASES[sCity];
  if (alias && (hCity === alias || hCity.includes(alias))) return true;

  const searchResults = cityFuse.search(sCity);
  if (searchResults.length > 0 && searchResults[0].item.name.toLowerCase() === hCity) {
    return true;
  }
  return false;
}

// Realistic clinical cost profiles across Indian healthcare tiers (in INR ₹)
// Doctor/Procedure Fee (min/max), Lab & Tests (diagnostics), Medicines (medicines), Days in Hospital (stayDays), Room Rent per Day (perDay)
const CONDITION_COST_PROFILES = {
  // --- 56 MedP_AI V2.0 Conditions ---
  // Skin (8)
  acne: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 400, medicines: 1200, contingencyPct: 5 },
  eczema_atopic_dermatitis: { min: 600, max: 1200, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 1300, contingencyPct: 5 },
  psoriasis: { min: 700, max: 1500, stayDays: 0, perDay: 0, diagnostics: 700, medicines: 1800, contingencyPct: 5 },
  contact_dermatitis: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 1100, contingencyPct: 5 },
  seborrheic_dermatitis: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 400, medicines: 1000, contingencyPct: 5 },
  cellulitis: { min: 10000, max: 20000, stayDays: 3, perDay: 3000, diagnostics: 5000, medicines: 6000, contingencyPct: 10 },
  allergic_reaction_urticaria: { min: 800, max: 1800, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1800, contingencyPct: 8 },
  viral_warts: { min: 600, max: 1500, stayDays: 0, perDay: 0, diagnostics: 400, medicines: 800, contingencyPct: 5 },

  // Eye (4)
  conjunctivitis: { min: 400, max: 800, stayDays: 0, perDay: 0, diagnostics: 400, medicines: 700, contingencyPct: 5 },
  allergic_conjunctivitis: { min: 500, max: 900, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 800, contingencyPct: 5 },
  blepharitis: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 400, medicines: 900, contingencyPct: 5 },
  stye_chalazion: { min: 500, max: 1200, stayDays: 0, perDay: 0, diagnostics: 400, medicines: 600, contingencyPct: 5 },

  // Respiratory and ENT (11)
  common_cold_upper_respiratory_infection: { min: 500, max: 700, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 600, contingencyPct: 5 },
  influenza: { min: 500, max: 900, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 900, contingencyPct: 5 },
  allergic_rhinitis: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 1100, contingencyPct: 5 },
  sinusitis: { min: 600, max: 1200, stayDays: 0, perDay: 0, diagnostics: 900, medicines: 1000, contingencyPct: 5 },
  pharyngitis_strep_throat: { min: 500, max: 700, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 600, contingencyPct: 5 },
  tonsillitis: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 800, contingencyPct: 5 },
  otitis_media: { min: 600, max: 1200, stayDays: 0, perDay: 0, diagnostics: 900, medicines: 900, contingencyPct: 5 },
  otitis_externa: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 700, medicines: 800, contingencyPct: 5 },
  bronchitis: { min: 800, max: 1800, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1400, contingencyPct: 5 },
  asthma: { min: 1000, max: 2500, stayDays: 0, perDay: 0, diagnostics: 2500, medicines: 2500, contingencyPct: 8 },
  pneumonia: { min: 25000, max: 50000, stayDays: 4, perDay: 4500, diagnostics: 9000, medicines: 8000, contingencyPct: 10 },

  // Digestive (8)
  gastroenteritis: { min: 600, max: 1500, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1500, contingencyPct: 8 },
  gastritis: { min: 500, max: 1200, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1100, contingencyPct: 5 },
  gastroesophageal_reflux_disease_gerd: { min: 800, max: 1800, stayDays: 0, perDay: 0, diagnostics: 3000, medicines: 1500, contingencyPct: 5 },
  irritable_bowel_syndrome_ibs: { min: 800, max: 1600, stayDays: 0, perDay: 0, diagnostics: 2000, medicines: 1500, contingencyPct: 5 },
  peptic_ulcer_disease: { min: 1000, max: 2500, stayDays: 0, perDay: 0, diagnostics: 3500, medicines: 2000, contingencyPct: 5 },
  hemorrhoids: { min: 18000, max: 35000, stayDays: 1, perDay: 3000, diagnostics: 4500, medicines: 3500, contingencyPct: 8 },
  anal_fissure: { min: 600, max: 1500, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1500, contingencyPct: 8 },
  appendicitis: { min: 30000, max: 45000, stayDays: 3, perDay: 3000, diagnostics: 7000, medicines: 5000, contingencyPct: 10 },

  // Urinary and reproductive (9)
  urinary_tract_infection_uti: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1200, contingencyPct: 5 },
  kidney_stones: { min: 20000, max: 40000, stayDays: 1, perDay: 3500, diagnostics: 7000, medicines: 4500, contingencyPct: 8 },
  prostatitis: { min: 800, max: 1800, stayDays: 0, perDay: 0, diagnostics: 1800, medicines: 1600, contingencyPct: 5 },
  benign_prostatic_hyperplasia_bph: { min: 18000, max: 35000, stayDays: 1, perDay: 3500, diagnostics: 4500, medicines: 2500, contingencyPct: 8 },
  vaginal_candidiasis_yeast_infection: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 600, medicines: 900, contingencyPct: 5 },
  bacterial_vaginosis: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 700, medicines: 1000, contingencyPct: 5 },
  pelvic_inflammatory_disease_pid: { min: 12000, max: 25000, stayDays: 2, perDay: 3000, diagnostics: 5500, medicines: 4500, contingencyPct: 10 },
  endometriosis: { min: 15000, max: 30000, stayDays: 1, perDay: 3500, diagnostics: 6000, medicines: 3000, contingencyPct: 10 },
  uterine_fibroids: { min: 20000, max: 40000, stayDays: 2, perDay: 4000, diagnostics: 8000, medicines: 4000, contingencyPct: 10 },

  // Bone, joint and muscle (6)
  osteoarthritis: { min: 90000, max: 180000, stayDays: 5, perDay: 5000, diagnostics: 12000, medicines: 10000, contingencyPct: 10 },
  cervical_spondylosis: { min: 800, max: 2000, stayDays: 0, perDay: 0, diagnostics: 3500, medicines: 2000, contingencyPct: 8 },
  sciatica: { min: 800, max: 2200, stayDays: 0, perDay: 0, diagnostics: 4000, medicines: 2200, contingencyPct: 8 },
  frozen_shoulder: { min: 700, max: 1800, stayDays: 0, perDay: 0, diagnostics: 2500, medicines: 1500, contingencyPct: 8 },
  carpal_tunnel_syndrome: { min: 8000, max: 15000, stayDays: 0, perDay: 0, diagnostics: 3000, medicines: 1500, contingencyPct: 8 },
  muscle_strain_sprain: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1200, contingencyPct: 5 },

  // Neurological and balance (3)
  migraine: { min: 600, max: 1400, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1400, contingencyPct: 5 },
  tension_headache: { min: 400, max: 900, stayDays: 0, perDay: 0, diagnostics: 600, medicines: 800, contingencyPct: 5 },
  vertigo_bppv: { min: 700, max: 1600, stayDays: 0, perDay: 0, diagnostics: 2000, medicines: 1200, contingencyPct: 5 },

  // Mental health (3)
  anxiety_disorder: { min: 800, max: 1800, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 1500, contingencyPct: 5 },
  panic_attack_panic_disorder: { min: 900, max: 2000, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1800, contingencyPct: 8 },
  depressive_symptoms: { min: 800, max: 2000, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 1600, contingencyPct: 5 },

  // Endocrine and blood (2)
  hypothyroidism: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 1400, medicines: 800, contingencyPct: 5 },
  iron_deficiency_anaemia: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1000, contingencyPct: 5 },

  // Dental (2)
  gingivitis_periodontal_disease: { min: 600, max: 1500, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 600, contingencyPct: 5 },
  dental_abscess: { min: 1500, max: 5000, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1500, contingencyPct: 8 },

  // --- Backwards-compatibility aliases ---
  common_cold: { min: 500, max: 700, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 600, contingencyPct: 5 },
  acute_sinusitis: { min: 600, max: 1200, stayDays: 0, perDay: 0, diagnostics: 900, medicines: 1000, contingencyPct: 5 },
  pharyngitis: { min: 500, max: 700, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 600, contingencyPct: 5 },
  acute_gastroenteritis: { min: 600, max: 1500, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1500, contingencyPct: 8 },
  gerd: { min: 800, max: 1800, stayDays: 0, perDay: 0, diagnostics: 3000, medicines: 1500, contingencyPct: 5 },
  peptic_ulcer: { min: 1000, max: 2500, stayDays: 0, perDay: 0, diagnostics: 3500, medicines: 2000, contingencyPct: 5 },
  uti: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 1200, medicines: 1200, contingencyPct: 5 },
  kidney_stone: { min: 20000, max: 40000, stayDays: 1, perDay: 3500, diagnostics: 7000, medicines: 4500, contingencyPct: 8 },
  iron_deficiency_anemia: { min: 500, max: 1000, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1000, contingencyPct: 5 },
  knee_osteoarthritis: { min: 90000, max: 180000, stayDays: 5, perDay: 5000, diagnostics: 12000, medicines: 10000, contingencyPct: 10 },
  vertigo: { min: 700, max: 1600, stayDays: 0, perDay: 0, diagnostics: 2000, medicines: 1200, contingencyPct: 5 },
  eczema: { min: 600, max: 1200, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 1300, contingencyPct: 5 },
  depressive_disorder: { min: 800, max: 2000, stayDays: 0, perDay: 0, diagnostics: 800, medicines: 1600, contingencyPct: 5 },
};

function getConditionCostProfile(condition) {
  if (condition?.condition_id && CONDITION_COST_PROFILES[condition.condition_id]) {
    return CONDITION_COST_PROFILES[condition.condition_id];
  }
  if (condition?.urgency === 'emergency') {
    return { min: 35000, max: 70000, stayDays: 4, perDay: 6000, diagnostics: 15000, medicines: 12000, contingencyPct: 15 };
  }
  if (condition?.urgency === 'urgent') {
    return { min: 15000, max: 30000, stayDays: 2, perDay: 3500, diagnostics: 7000, medicines: 5000, contingencyPct: 10 };
  }
  return { min: 500, max: 800, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 600, contingencyPct: 5 };
}

function normalizeTier(value) {
  const tier = String(value || '').trim().toLowerCase();
  if (tier === 'premium') return 'premium';
  if (tier === 'mid' || tier === 'mid-tier' || tier === 'mid tier') return 'mid';
  return 'budget';
}

function isNabhAccredited(value) {
  return ['yes', 'true', '1'].includes(String(value || '').trim().toLowerCase());
}

// Transform backend hospital format to frontend format
function transformHospital(h) {
  const normalizedTier = normalizeTier(h.tier);
  const tier = normalizedTier === 'premium' ? 'Premium' 
    : normalizedTier === 'mid' ? 'Mid-tier' 
    : 'Budget';

  let rawSpecs = h.specializations || h.specialties || h.specialty || '';
  if (Array.isArray(rawSpecs)) {
    rawSpecs = rawSpecs.join(', ');
  }
  const specialties = String(rawSpecs).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  let rawProcs = h.procedures_offered || h.procedures || h.procedure || '';
  if (Array.isArray(rawProcs)) {
    rawProcs = rawProcs.join(', ');
  }
  const procedures = String(rawProcs).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  
  return {
    id: String(h.hospital_id || h.id || Math.random().toString(36).substring(2)),
    hospital_id: String(h.hospital_id || h.id || ''),
    name: h.hospital_name || h.name || 'Hospital',
    hospital_name: h.hospital_name || h.name || 'Hospital',
    city: h.city || '',
    state: h.state || '',
    lat: parseFloat(h.latitude || h.lat) || 0,
    lng: parseFloat(h.longitude || h.lng) || 0,
    rating: parseFloat(h.google_rating || h.rating) || 3.8,
    reviews: parseInt(h.total_beds || h.reviews) || 50,
    nabh: isNabhAccredited(h.nabh_accredited || h.nabh),
    tier: tier,
    specialties: specialties,
    procedures: procedures,
    address: h.address || h.address_line || (h.pincode ? `${h.city}, ${h.state} - ${h.pincode}` : ''),
    phone: h.phone || h.phone_number || '',
    website: h.website || h.website_url || '',
  };
}

function distanceKm(a, b) {
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(b.lat)) return 0;
  const R = 6371;
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function enrichHospital(hospital, condition, origin) {
  const costProfile = getConditionCostProfile(condition);
  const tier = normalizeTier(hospital.tier);
  // Step 2: Multiply by Hospital Tier
  // Budget / Trust / Community: 0.60 (40% cheaper)
  // Standard Private (Mid-Tier): 1.00 (Normal market rate)
  // Big Corporate / Super-Specialty: 1.75 (75% premium for 5-star facilities)
  const tierMult = tier === 'premium' ? 1.75 : tier === 'budget' ? 0.60 : 1.00;

  // Step 3: Multiply by Accreditation Factor
  // NABH Accredited: 1.05 (adds 5% for certified quality & safety standards)
  // Non-Accredited: 1.00 (no change)
  const isNabh = isNabhAccredited(hospital.nabh_accredited || hospital.nabh);
  const nabhMult = isNabh ? 1.05 : 1.00;
  const totalMult = Number((tierMult * nabhMult).toFixed(4));

  // Step 1: Calculate the "Base Medical Cost"
  // Base Medical Cost = Doctor / Procedure Fee + Lab & Tests + Medicines + (Days in Hospital * Room Rent per Day)
  const doctorFeeMin = Number(costProfile.min || costProfile.doctorFee || 500);
  const doctorFeeMax = Number(costProfile.max || costProfile.doctorFee || doctorFeeMin);
  const diagnostics = Number(costProfile.diagnostics || 0);
  const medicines = Number(costProfile.medicines || 0);
  const stayDays = Number(costProfile.stayDays || 0);
  const perDayBase = Number(costProfile.perDay || 0);
  const roomRentBase = stayDays * perDayBase;

  const baseCostMin = doctorFeeMin + diagnostics + medicines + roomRentBase;
  const baseCostMax = doctorFeeMax + diagnostics + medicines + roomRentBase;

  // Total Treatment Cost = Base Medical Cost * Hospital Tier * Accreditation Factor
  const costMin = Math.round(baseCostMin * totalMult);
  const costMax = Math.round(baseCostMax * totalMult);
  const perDay = Math.round(perDayBase * totalMult);
  const roomRentHospital = stayDays * perDay;

  const transformed = transformHospital(hospital);
  const hospitalSpecialties = transformed.specialties;
  const hospitalProcedures = transformed.procedures || [];

  const distance = origin ? distanceKm(origin, { lat: transformed.lat, lng: transformed.lng }) : 0;

  const primaryTerms = condition
    ? (condition.primarySpecializationTerms || (condition.specializationTerms || [condition.specialization || ''])).map(term => String(term || '').toLowerCase().trim())
    : [];
  const fallbackTerms = condition
    ? (condition.fallbackSpecializationTerms || []).map(term => String(term || '').toLowerCase().trim())
    : [];
  const procTerms = condition
    ? (condition.procedureTerms || [condition.procedure || '']).map(term => String(term || '').toLowerCase().trim())
    : [];

  const matchedPrimarySpecialties = primaryTerms.filter(term =>
    term && hospitalSpecialties.some(value => value.includes(term) || (term.length > 3 && term.includes(value)))
  );
  const matchedFallbackSpecialties = fallbackTerms.filter(term =>
    term && hospitalSpecialties.some(value => value.includes(term) || (term.length > 3 && term.includes(value)))
  );
  const matchedProcedures = procTerms.filter(term =>
    term && hospitalProcedures.some(value => value.includes(term) || (term.length > 3 && term.includes(value)))
  );

  // Match Tier:
  // 1 = Direct primary specialization match
  // 2 = Direct procedure match
  // 3 = Nearby fallback initial-care facility (General Medicine / Internal Medicine)
  // 4 = General regional referral hospital
  let matchTier = 4;
  let matchCategory = 'regional_referral';
  let primaryReason = 'General regional referral facility';

  if (matchedPrimarySpecialties.length > 0) {
    matchTier = 1;
    matchCategory = 'primary_specialist';
    primaryReason = `Primary specialization match: ${matchedPrimarySpecialties[0]}`;
  } else if (matchedProcedures.length > 0) {
    matchTier = 2;
    matchCategory = 'procedure_match';
    primaryReason = `Direct procedure match: ${matchedProcedures[0]}`;
  } else if (matchedFallbackSpecialties.length > 0) {
    matchTier = 3;
    matchCategory = 'general_care_fallback';
    primaryReason = `General-care fallback for initial clinical evaluation (${matchedFallbackSpecialties[0]})`;
  }

  const additionalReasons = [];
  if (matchedProcedures.length > 0 && matchTier !== 2) {
    additionalReasons.push(`Procedure: ${matchedProcedures[0]}`);
  }
  if (distance > 0) {
    additionalReasons.push(`${Number(distance.toFixed(1))} km away`);
  }
  if (transformed.rating) {
    additionalReasons.push(`${transformed.rating}★ rating`);
  }
  if (transformed.nabh) {
    additionalReasons.push('NABH accredited');
  }
  if (costMin) {
    additionalReasons.push(`Est. ₹${costMin.toLocaleString('en-IN')}`);
  }

  const fullMatchReason = primaryReason + (additionalReasons.length > 0 ? ` • ${additionalReasons.join(', ')}` : '');

  const tierBonus = (5 - matchTier) * 100;
  const primarySpecialtyScore = matchedPrimarySpecialties.length > 0 ? 40 : 0;
  const fallbackSpecialtyScore = matchedFallbackSpecialties.length > 0 && !primarySpecialtyScore ? 15 : 0;
  const procedureScore = Math.min(matchedProcedures.length / 2, 1) * 30;
  const ratingScore = ((transformed.rating || 3.5) / 5) * 10;
  const nabhScore = transformed.nabh ? 5 : 0;
  const baseMatchScore = Math.round(tierBonus + primarySpecialtyScore + fallbackSpecialtyScore + procedureScore + ratingScore + nabhScore);

  return {
    ...transformed,
    distanceKm: Number(distance.toFixed(1)),
    costMin,
    costMax,
    stayDays,
    perDay,
    doctorFeeMin,
    doctorFeeMax,
    diagnostics,
    medicines,
    roomRent: roomRentHospital,
    roomRentBase,
    baseCostMin,
    baseCostMax,
    tierMult,
    nabhMult,
    totalMult,
    costBreakdown: {
      doctorFeeMin,
      doctorFeeMax,
      diagnostics,
      medicines,
      stayDays,
      perDayBase,
      roomRentBase,
      baseCostMin,
      baseCostMax,
      tier,
      tierMult,
      isNabh,
      nabhMult,
      totalMult,
      costMin,
      costMax,
      perDayHospital: perDay,
      roomRentHospital,
    },
    matchTier,
    matchCategory,
    matchScore: baseMatchScore,
    matchedSpecialties: matchedPrimarySpecialties.length > 0 ? matchedPrimarySpecialties : (matchedFallbackSpecialties.length > 0 ? matchedFallbackSpecialties : []),
    matchedPrimarySpecialties,
    matchedFallbackSpecialties,
    matchedProcedures,
    matchReason: fullMatchReason,
    source: hospital.source || 'Verified Registry',
  };
}

exports.getAllHospitals = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedHospitals = hospitals.slice(startIndex, endIndex).map(transformHospital);

    res.json({
      success: true,
      data: paginatedHospitals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(hospitals.length / limit),
        totalHospitals: hospitals.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalById = (req, res) => {
  try {
    const hospital = hospitals.find(h => String(h.hospital_id || h.id) === String(req.params.id));
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
    res.json({ success: true, data: transformHospital(hospital) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchHospitals = async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    if (!query) return res.status(400).json({ success: false, message: 'Search query required' });

    const modelVersion = req.query.modelVersion;
    let normalizedQuery = query;
    if (isGeminiConfigured()) {
      try {
        normalizedQuery = await normalizeSymptoms(query);
      } catch (normalizationError) {
        console.warn(`Multilingual normalization failed; using original query: ${normalizationError.message}`);
      }
    }

    let topPrediction = null;
    let predictions = [];
    const isDirectRouting = req.query.directRouting === 'true';

    // Tier 2 Emergency Red-Flag Shield (<50ms Immediate Override for Hospital Matching)
    // Check if query or confirmed condition matches any Tier 2 Emergency Warning Patterns
    const condParam = String(req.query.confirmedCondition || '').toLowerCase().trim();
    const queryParam = String(normalizedQuery || query || '').toLowerCase().trim();
    const emergencyMatch = (Array.isArray(EMERGENCY_WARNING_PATTERNS) ? EMERGENCY_WARNING_PATTERNS : []).find(ep => {
      if (condParam) {
        if (ep.regex.test(condParam)) return true;
        const lowerCond = ep.condition.toLowerCase();
        if (condParam.includes(lowerCond) || lowerCond.includes(condParam)) return true;
      }
      if (req.query.isEmergency === 'true' && condParam) {
        const lowerCond = ep.condition.toLowerCase();
        return condParam.includes(lowerCond) || lowerCond.includes(condParam);
      }
      if (!req.query.confirmedCondition && queryParam) {
        return ep.regex.test(queryParam);
      }
      return false;
    });

    if (emergencyMatch) {
      topPrediction = {
        condition_id: emergencyMatch.condition_id || 'acute_medical_emergency',
        condition: emergencyMatch.condition,
        specialization: emergencyMatch.specialization,
        specializationTerms: ['emergency medicine', 'critical care', 'casualty', 'trauma center', 'icu'],
        primarySpecializationTerms: emergencyMatch.primarySpecializationTerms || ['emergency medicine', 'critical care', 'casualty', 'trauma center'],
        fallbackSpecializationTerms: ['general medicine', 'internal medicine'],
        icd10: emergencyMatch.icd10 || 'R68.89',
        urgency: 'emergency',
        procedure: emergencyMatch.procedure || 'Immediate Emergency Resuscitation & Clinical Triage',
        procedureTerms: emergencyMatch.procedureTerms || ['emergency opd', 'trauma center', 'casualty', 'icu'],
        confidence: 100,
        modelProbability: 1.0,
        threshold: 0.8,
        passesThreshold: true,
        decisionSource: 'emergency_override',
      };
      predictions = [topPrediction];
    } else if (req.query.confirmedCondition) {
      const condStr = String(req.query.confirmedCondition).toLowerCase().trim();
      const isExplicitSafeDefer = req.query.isSafeDefer === 'true' ||
        req.query.confidence === 'null' ||
        req.query.confidence === 'none' ||
        condStr.includes('unsupported') ||
        condStr.includes('uncertain') ||
        condStr.includes('safe_defer');

      if (isExplicitSafeDefer) {
        topPrediction = {
          condition_id: 'unsupported_uncertain_condition',
          condition: req.query.confirmedCondition.includes('General')
            ? req.query.confirmedCondition
            : 'System fallback: Unsupported / Uncertain Condition',
          specialization: 'General Medicine',
          specializationTerms: ['general medicine', 'internal medicine', 'general physician', 'family medicine'],
          primarySpecializationTerms: ['general medicine', 'internal medicine', 'general physician', 'family medicine'],
          fallbackSpecializationTerms: [],
          icd10: 'R69',
          urgency: 'routine',
          procedure: 'Comprehensive In-Person Clinical Assessment',
          procedureTerms: ['general opd', 'physician consultation'],
          confidence: null,
          modelProbability: null,
          threshold: null,
          passesThreshold: false,
          safeDeferReason: req.query.safeDeferReason || 'Inconclusive symptom evidence safely deferred for in-person clinical evaluation',
          decisionSource: 'safe_defer',
        };
        predictions = [topPrediction];
      } else if (isDirectRouting || condStr.includes('general medicine') || condStr.includes('physician consultation')) {
        // Direct disease selection or General Medicine: ML MODEL IS COMPLETELY BYPASSED & IGNORED!
        if (condStr.includes('general medicine') || condStr.includes('physician consultation')) {
          topPrediction = {
            condition_id: 'general_medicine_consultation',
            condition: 'General Medicine / Physician Consultation',
            specialization: 'General Medicine',
            specializationTerms: ['general medicine', 'internal medicine', 'general physician', 'family medicine'],
            primarySpecializationTerms: ['general medicine', 'internal medicine', 'general physician', 'family medicine'],
            fallbackSpecializationTerms: [],
            icd10: 'Z00.00',
            urgency: 'routine',
            procedure: 'Comprehensive In-Person Clinical Assessment & Diagnostic Workup',
            procedureTerms: ['general opd', 'physician consultation', 'clinical assessment'],
            confidence: 100,
            modelProbability: 1.0,
            threshold: 0.8,
            passesThreshold: true,
            decisionSource: 'direct_routing',
          };
        } else {
          // Look up directly in verified model labels without running predictConditions
          const loaded = loadModel(modelVersion);
          const staticLabel = loaded && loaded.labels ? loaded.labels.find(l => 
            String(l.condition || '').toLowerCase() === condStr ||
            String(l.condition_id || '').toLowerCase() === condStr ||
            condStr.includes(String(l.condition || '').toLowerCase()) ||
            String(l.condition || '').toLowerCase().includes(condStr)
          ) : null;

          if (staticLabel) {
            topPrediction = {
              ...staticLabel,
              confidence: 100,
              modelProbability: 1.0,
              passesThreshold: true,
              decisionSource: 'direct_routing',
            };
          } else {
            topPrediction = {
              condition_id: condStr.replace(/\s+/g, '_'),
              condition: req.query.confirmedCondition,
              specialization: 'General Medicine',
              specializationTerms: ['general medicine', 'internal medicine'],
              icd10: 'R69',
              urgency: 'routine',
              procedure: 'Clinical Specialist Evaluation',
              procedureTerms: ['clinical evaluation', 'consultation'],
              confidence: 100,
              modelProbability: 1.0,
              passesThreshold: true,
              decisionSource: 'direct_routing',
            };
          }
        }
        predictions = [topPrediction];
      } else {
        const loaded = loadModel(modelVersion);
        const liveMatch = loaded && loaded.labels ? loaded.labels.find(l => 
          String(l.condition || '').toLowerCase() === condStr ||
          String(l.condition_id || '').toLowerCase() === condStr
        ) : null;
        if (liveMatch) {
          topPrediction = { ...liveMatch };
        }
        if (topPrediction) {
          const paramConf = parseInt(req.query.confidence, 10);
          if (Number.isFinite(paramConf) && paramConf > 0) {
            topPrediction.confidence = paramConf;
          }
          predictions = [topPrediction];
        }
      }
    }
    if (!topPrediction) {
      predictions = predictConditions(normalizedQuery, modelVersion);
      topPrediction = predictions[0] || null;
    }
    if (topPrediction) {
      const specTerms = getSpecializationTerms(topPrediction.condition, topPrediction.specialization);
      topPrediction.primarySpecializationTerms = specTerms.primarySpecializationTerms;
      topPrediction.fallbackSpecializationTerms = specTerms.fallbackSpecializationTerms;
    }
    const hasConfirmedCondition = Boolean(req.query.confirmedCondition);
    const lowConfidence = (!topPrediction || topPrediction.confidence === null || topPrediction.confidence < 25);
    const costProfile = getConditionCostProfile(topPrediction);
    const doctorFeeMin = Number(costProfile.min || costProfile.doctorFee || 500);
    const doctorFeeMax = Number(costProfile.max || costProfile.doctorFee || doctorFeeMin);
    const diagnostics = Number(costProfile.diagnostics || 0);
    const medicines = Number(costProfile.medicines || 0);
    const stayDays = Number(costProfile.stayDays || 0);
    const perDayBase = Number(costProfile.perDay || 0);
    const roomRentBase = stayDays * perDayBase;
    const baseCostMin = doctorFeeMin + diagnostics + medicines + roomRentBase;
    const baseCostMax = doctorFeeMax + diagnostics + medicines + roomRentBase;

    const condition = topPrediction ? {
      ...topPrediction,
      primarySpecializationTerms: topPrediction.primarySpecializationTerms,
      fallbackSpecializationTerms: topPrediction.fallbackSpecializationTerms,
      lowConfidence,
      followUpQuestions: getFollowUpQuestions(normalizedQuery),
      base: {
        ...costProfile,
        doctorFeeMin,
        doctorFeeMax,
        diagnostics,
        medicines,
        stayDays,
        perDay: perDayBase,
        roomRent: roomRentBase,
        baseCostMin,
        baseCostMax,
      },
    } : null;

    const city = String(req.query.city || '').trim();
    const state = String(req.query.state || '').trim().toLowerCase();
    const origin = Number.isFinite(Number(req.query.lat)) && Number.isFinite(Number(req.query.lng))
      ? { lat: Number(req.query.lat), lng: Number(req.query.lng) }
      : null;
    const requestedRadiusKm = Number(req.query.radiusKm) || 20;
    const locationScope = req.query.locationScope === 'state' || req.query.locationScope === 'country'
      ? req.query.locationScope
      : 'city';
    const minRating = Number(req.query.minRating) || 0;
    const minCost = Number(req.query.minCost) || 0;
    const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null;
    const hospitalNameFilter = String(req.query.hospitalName || '').trim().toLowerCase();
    const procedureFilter = String(req.query.procedure || '').trim().toLowerCase();
    const specializationFilter = String(req.query.specialization || '').trim().toLowerCase();
    const emergencyCareFilter = String(req.query.emergencyCare || 'all').toLowerCase();
    const statusFilter = String(req.query.status || 'all').toLowerCase();
    const sortBy = String(req.query.sortBy || 'distance').toLowerCase();
    const preferredSource = String(req.query.source || 'auto').toLowerCase();

    const tiers = String(req.query.tiers || '').split(',').filter(Boolean).map(value => {
      const normalized = value.toLowerCase();
      if (normalized === 'mid-tier' || normalized === 'mid tier') return 'mid';
      return normalized;
    });

    const primarySpecialtyTerms = condition
      ? (condition.primarySpecializationTerms || (condition.specializationTerms || [condition.specialization || ''])).map(term => term.toLowerCase().trim())
      : [];
    const fallbackSpecialtyTerms = condition
      ? (condition.fallbackSpecializationTerms || []).map(term => term.toLowerCase().trim())
      : [];
    const procedureTerms = condition
      ? (condition.procedureTerms || (condition.procedure ? [condition.procedure] : [])).map(term => term.toLowerCase().trim())
      : [];

    // Filter local candidates from verified hospitals.json
    let localCandidates = hospitals.filter(h => {
      if (city && locationScope === 'city' && !matchesCityFuzzy(h.city, city)) return false;
      if (state && locationScope !== 'country' && String(h.state).toLowerCase() !== state) return false;
      return true;
    }).map(h => ({ ...h, source: 'Verified Registry' }));

    // Specialty matching on local candidates
    if (primarySpecialtyTerms.length || procedureTerms.length || fallbackSpecialtyTerms.length) {
      const primaryOrProc = localCandidates.filter(h => {
        const specialties = String(h.specializations || '').toLowerCase();
        const procedures = String(h.procedures_offered || '').toLowerCase();
        return (
          primarySpecialtyTerms.some(term => specialties.includes(term) || (term.length > 3 && term.includes(specialties))) ||
          procedureTerms.some(term => procedures.includes(term) || (term.length > 3 && term.includes(procedures)))
        );
      });
      const fallbackOnly = localCandidates.filter(h => {
        const specialties = String(h.specializations || '').toLowerCase();
        return (
          fallbackSpecialtyTerms.some(term => specialties.includes(term) || (term.length > 3 && term.includes(specialties))) &&
          !primaryOrProc.includes(h)
        );
      });

      if (primaryOrProc.length > 0) {
        // Primary specialists found: prioritize them, include nearby general fallback
        localCandidates = [...primaryOrProc, ...fallbackOnly.slice(0, 5)];
      } else if (fallbackOnly.length > 0) {
        // No primary specialists found locally: provide fallback initial-care facilities
        localCandidates = fallbackOnly;
      }
    }

    // GUARANTEE: Verified Registry must NEVER be empty.
    // If no direct local candidates exist in this city/district, pull the nearest verified referral hospitals.
    if (localCandidates.length === 0) {
      let stateCandidates = state
        ? hospitals.filter(h => String(h.state).toLowerCase().includes(state))
        : [];
      let pool = stateCandidates.length > 0 ? stateCandidates : hospitals;

      const stateSpecialists = pool.filter(h => {
        const specs = String(h.specializations || '').toLowerCase();
        const procs = String(h.procedures_offered || '').toLowerCase();
        return primarySpecialtyTerms.some(term => specs.includes(term)) || procedureTerms.some(term => procs.includes(term));
      });
      if (stateSpecialists.length > 0) {
        pool = stateSpecialists;
      }

      if (origin) {
        pool = [...pool].sort((a, b) => {
          const latA = parseFloat(a.latitude || a.lat) || 0;
          const lngA = parseFloat(a.longitude || a.lng) || 0;
          const latB = parseFloat(b.latitude || b.lat) || 0;
          const lngB = parseFloat(b.longitude || b.lng) || 0;
          const distA = distanceKm(origin, { lat: latA, lng: lngA });
          const distB = distanceKm(origin, { lat: latB, lng: lngB });
          return distA - distB;
        });
      }
      localCandidates = pool.slice(0, 10).map(h => ({ ...h, source: 'Verified Registry' }));
    }

    let candidates = [];
    let dataSource = 'Verified Registry';

    if (preferredSource === 'registry' || preferredSource === 'local') {
      // User explicitly requested local verified registry only
      candidates = localCandidates.length > 0 ? localCandidates : hospitals.slice(0, 15).map(h => ({ ...h, source: 'Verified Registry' }));
      dataSource = 'Verified Registry';
    } else if (preferredSource === 'live') {
      // User explicitly requested live Google Places only
      try {
        const liveHospitals = await searchGooglePlaces({
          city: req.query.city, state: req.query.state,
          locationScope, condition, origin, radiusKm: requestedRadiusKm,
        });
        candidates = liveHospitals.length > 0 ? liveHospitals : localCandidates;
        dataSource = liveHospitals.length > 0 ? 'Google Places' : 'Verified Registry';
      } catch (liveErr) {
        console.warn('Live search error:', liveErr.message);
        candidates = localCandidates;
        dataSource = 'Verified Registry';
      }
    } else {
      // ── Auto mode: STRICT SEQUENCE ──────────────────────────────────────────
      // 1) Verified Registry (1st)
      // 2) Google Places (2nd - if daily quota not hit)
      // 3) OpenStreetMap (3rd - community map fallback)

      const liveOptions = {
        city: req.query.city, state: req.query.state,
        locationScope, condition, origin, radiusKm: requestedRadiusKm,
      };

      const currentGoogleUsage = getGooglePlacesUsage();
      let googleQuotaHit = currentGoogleUsage.quotaHit || currentGoogleUsage.calls >= currentGoogleUsage.maxDailyLimit;

      // Only invoke Google Places if quota has NOT been reached
      let googlePromise = Promise.resolve([]);
      if (!googleQuotaHit && hasLiveProvider()) {
        googlePromise = searchGooglePlaces(liveOptions).catch(err => {
          if (err instanceof GoogleQuotaError || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('429')) {
            googleQuotaHit = true;
            markGoogleQuotaHit(err.message);
          }
          console.warn('[Google Places search]', err.message);
          return [];
        });
      }

      const osmPromise = origin ? searchOpenStreetMap(liveOptions).catch(err => {
        console.warn('[OpenStreetMap search]', err.message);
        return [];
      }) : Promise.resolve([]);

      const [googleHospitals, osmHospitals] = await Promise.all([googlePromise, osmPromise]);

      // Deduplicate by normalised hospital name; preserve insertion order
      const seen = new Set();
      const dedup = (list) => (list || []).filter(h => {
        const key = String(h.hospital_name || h.name || '').trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // 1️⃣ Verified Registry first (ALWAYS PRIORITY 1)
      dedup(localCandidates).forEach(h => candidates.push(h));

      // 2️⃣ Google Places second (ALWAYS PRIORITY 2, only when quota not exhausted)
      if (!googleQuotaHit && googleHospitals.length > 0) {
        dedup(googleHospitals.map(h => ({ ...h, source: 'Google Places' }))).forEach(h => candidates.push(h));
      }

      // 3️⃣ OpenStreetMap third (ALWAYS PRIORITY 3)
      if (osmHospitals.length > 0) {
        dedup(osmHospitals.map(h => ({ ...h, source: 'OpenStreetMap' }))).forEach(h => candidates.push(h));
      }

      // Build human-readable dataSource label reflecting actual sequence
      const activeSources = [
        'Verified Registry',
        (!googleQuotaHit && googleHospitals.length > 0) ? 'Google Places' : null,
        osmHospitals.length > 0 ? 'OpenStreetMap' : null,
      ].filter(Boolean);

      dataSource = activeSources.join(' + ');
    }

    // Enrich candidates with cost model, distance, and specialties
    let enriched = candidates.map(h => enrichHospital(h, condition, origin));

    // Apply all interactive filters
    if (tiers.length > 0) {
      enriched = enriched.filter(h => tiers.includes(normalizeTier(h.tier)));
    }
    if (req.query.nabhOnly === 'true') {
      enriched = enriched.filter(h => h.nabh === true);
    }
    if (minRating > 0) {
      enriched = enriched.filter(h => (h.rating || 0) >= minRating);
    }
    if (minCost > 0) {
      enriched = enriched.filter(h => (h.costMin || 0) >= minCost);
    }
    if (maxBudget && maxBudget > 0) {
      enriched = enriched.filter(h => (h.costMin || 0) <= maxBudget);
    }
    if (hospitalNameFilter) {
      enriched = enriched.filter(h => 
        String(h.name || '').toLowerCase().includes(hospitalNameFilter) ||
        String(h.address || '').toLowerCase().includes(hospitalNameFilter) ||
        String(h.city || '').toLowerCase().includes(hospitalNameFilter)
      );
    }
    if (procedureFilter && procedureFilter !== 'all') {
      enriched = enriched.filter(h => (h.procedures || []).some(p => String(p).toLowerCase().includes(procedureFilter)));
    }
    if (specializationFilter && specializationFilter !== 'all') {
      enriched = enriched.filter(h => (h.specialties || []).some(s => String(s).toLowerCase().includes(specializationFilter)));
    }
    if (emergencyCareFilter === 'available') {
      enriched = enriched.filter(h => h.emergencyCare === true || (h.specialties || []).some(s => s.toLowerCase().includes('emergency') || s.toLowerCase().includes('critical')));
    } else if (emergencyCareFilter === 'unavailable') {
      enriched = enriched.filter(h => !h.emergencyCare);
    }
    if (statusFilter === 'open') {
      enriched = enriched.filter(h => !h.status || h.status === 'open');
    } else if (statusFilter === 'closed') {
      enriched = enriched.filter(h => h.status === 'closed');
    }

    // Radius filtering & Automatic Radius Expansion if < 3 results
    let radiusKm = requestedRadiusKm;
    let results = enriched;
    let expandedRadius = false;
    let referralNotice = null;

    if (origin && locationScope === 'city') {
      results = enriched.filter(h => (typeof h.distanceKm !== 'number' || h.distanceKm <= radiusKm));

      // Only auto-expand if no specific user filters were applied and requested radius >= 20
      const hasSpecificUserFilters = minRating > 0 || minCost > 0 || maxBudget || hospitalNameFilter || procedureFilter !== 'all' || specializationFilter !== 'all' || tiers.length > 0;
      if (results.length < 3 && !hasSpecificUserFilters && requestedRadiusKm >= 20) {
        const within50 = enriched.filter(h => h.distanceKm <= 50);
        if (within50.length >= 3) {
          results = within50;
          radiusKm = 50;
          expandedRadius = true;
          referralNotice = `Fewer than 3 specialized centers were found within ${requestedRadiusKm} km. Showing hospitals within an expanded radius of 50 km in neighboring districts.`;
        } else {
          const within100 = enriched.filter(h => h.distanceKm <= 100);
          if (within100.length > results.length) {
            results = within100;
            radiusKm = 100;
            expandedRadius = true;
            referralNotice = `Limited specialty facilities in immediate locality. Showing tertiary referral centers within 100 km across the region.`;
          } else if (results.length === 0 && enriched.length > 0) {
            results = enriched.slice(0, 8);
            expandedRadius = true;
            referralNotice = `No specialized centers found within ${requestedRadiusKm} km. Showing the nearest recommended hospitals across the region.`;
          }
        }
      }
    }

    // Score and rank hospitals
    const maxDistance = Math.max(radiusKm, 1);
    const maxCost = Math.max(...results.map(h => h.costMin), 1);

    // Assign source priority so grouping survives the sort:
    // 0 = Verified Registry, 1 = Google Places, 2 = OpenStreetMap
    const SOURCE_PRIORITY = { 'Verified Registry': 0, 'Google Places': 1, 'OpenStreetMap': 2 };
    results.forEach(h => {
      const tierBonus = (5 - (h.matchTier || 4)) * 100;
      const primarySpecialtyScore = (h.matchedPrimarySpecialties?.length || 0) > 0 ? 40 : 0;
      const fallbackSpecialtyScore = (h.matchedFallbackSpecialties?.length || 0) > 0 && !primarySpecialtyScore ? 15 : 0;
      const procedureScore = Math.min((h.matchedProcedures?.length || 0) / 2, 1) * 30;
      const distanceScore = Math.max(0, 1 - (h.distanceKm || 0) / maxDistance) * 15;
      const ratingScore = ((h.rating || 3.5) / 5) * 10;
      const nabhScore = h.nabh ? 5 : 0;
      const costScore = Math.max(0, 1 - h.costMin / maxCost) * 5;

      h.matchScore = Math.round(tierBonus + primarySpecialtyScore + fallbackSpecialtyScore + procedureScore + distanceScore + ratingScore + nabhScore + costScore);
      h.sourcePriority = SOURCE_PRIORITY[h.source] ?? 3;
    });

    // Sort: user chosen criteria within/across sources
    results.sort((a, b) => {
      if (sortBy === 'cost') {
        return (a.costMin || 0) - (b.costMin || 0) || a.sourcePriority - b.sourcePriority;
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0) || a.sourcePriority - b.sourcePriority;
      }
      // Default: source priority, then matchTier (1 > 2 > 3 > 4), then matchScore, then distance
      return a.sourcePriority - b.sourcePriority ||
        a.matchTier - b.matchTier ||
        b.matchScore - a.matchScore ||
        a.distanceKm - b.distanceKm;
    });
    if (results.length) results[0].isBestMatch = true;

    // Notice when only fallback hospitals are available
    const hasSpecialistMatches = results.some(h => h.matchTier === 1 || h.matchTier === 2);
    if (!hasSpecialistMatches && results.some(h => h.matchTier === 3)) {
      referralNotice = "No directly matched specialist center was found nearby. Showing General Medicine facilities for initial clinical evaluation.";
    }

    // AI recommendation using Gemini
    let aiRecommendation = null;
    if (isGeminiConfigured()) {
      try {
        aiRecommendation = await recommendHospitals({
          query: normalizedQuery,
          condition,
          hospitals: results,
          locationLabel: [city, state].filter(Boolean).join(', ') || 'India',
        });
      } catch (recommendationError) {
        console.warn(`Gemini recommendation failed: ${recommendationError.message}`);
      }
    }

    res.json({
      success: true,
      data: results,
      condition,
      predictions,
      lowConfidence,
      followUpQuestions: getFollowUpQuestions(normalizedQuery),
      count: results.length,
      dataSource,
      liveProviderConfigured: hasLiveProvider(),
      freeProvider: 'OpenStreetMap',
      aiRecommendation,
      geminiConfigured: isGeminiConfigured(),
      normalizedQuery,
      expandedRadius,
      referralNotice,
      radiusKm,
      googlePlacesUsage: getGooglePlacesUsage(), // { calls, quotaHit, date }
    });
  } catch (error) {
    console.error('searchHospitals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.filterHospitals = (req, res) => {
  try {
    let filtered = [...hospitals];
    const { city, state, tier, nabh_accredited, minRating, specialization } = req.body;

    if (city) filtered = filtered.filter(h => matchesCityFuzzy(h.city, city));
    if (state) filtered = filtered.filter(h => h.state && h.state.toLowerCase().includes(state.toLowerCase()));
    if (tier) filtered = filtered.filter(h => normalizeTier(h.tier) === normalizeTier(tier));
    if (nabh_accredited !== undefined) filtered = filtered.filter(h => isNabhAccredited(h.nabh_accredited) === Boolean(nabh_accredited));
    if (minRating) filtered = filtered.filter(h => parseFloat(h.google_rating) >= parseFloat(minRating));
    if (specialization) filtered = filtered.filter(h => h.specializations && h.specializations.toLowerCase().includes(specialization.toLowerCase()));

    res.json({ success: true, data: filtered.map(transformHospital), count: filtered.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalsByCity = (req, res) => {
  try {
    const city = req.params.city;
    const filtered = hospitals.filter(h => matchesCityFuzzy(h.city, city));
    res.json({ success: true, data: filtered.map(transformHospital), count: filtered.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalsBySpecialization = (req, res) => {
  try {
    const spec = req.params.spec;
    const filtered = hospitals.filter(h => h.specializations && h.specializations.toLowerCase().includes(spec.toLowerCase()));
    res.json({ success: true, data: filtered.map(transformHospital), count: filtered.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCities = (req, res) => {
  try {
    const cityMap = {};
    hospitals.forEach(h => {
      if (!h.city || !h.state) return;
      const cityKey = h.city.toLowerCase();
      if (!cityMap[cityKey]) {
        cityMap[cityKey] = {
          city: h.city,
          state: h.state,
          lats: [],
          lngs: [],
          hospitalCount: 0
        };
      }
      if (h.latitude && h.longitude) {
        cityMap[cityKey].lats.push(parseFloat(h.latitude));
        cityMap[cityKey].lngs.push(parseFloat(h.longitude));
      }
      cityMap[cityKey].hospitalCount++;
    });

    const citiesData = Object.values(cityMap)
      .filter(c => c.lats.length > 0)
      .map(c => ({
        city: c.city,
        state: c.state,
        lat: c.lats.reduce((a, b) => a + b, 0) / c.lats.length,
        lng: c.lngs.reduce((a, b) => a + b, 0) / c.lngs.length,
        hospitalCount: c.hospitalCount
      }))
      .sort((a, b) => a.city.localeCompare(b.city));

    res.json({ 
      success: true, 
      data: citiesData, 
      count: citiesData.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProviderStatus = (req, res) => {
  try {
    const usage = getGooglePlacesUsage();
    res.json({
      success: true,
      providers: {
        verifiedRegistry: {
          name: 'Verified Registry',
          status: 'active',
          count: hospitals.length,
          priority: 1,
        },
        googlePlaces: {
          name: 'Google Places',
          status: usage.quotaHit ? 'quota_exhausted' : 'active',
          callsToday: usage.calls,
          maxDailyLimit: usage.maxDailyLimit,
          remaining: usage.remaining,
          quotaHit: usage.quotaHit,
          priority: 2,
        },
        openStreetMap: {
          name: 'OpenStreetMap',
          status: 'active',
          priority: 3,
        },
      },
      googlePlacesUsage: usage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetQuota = (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    const expectedKey = process.env.ADMIN_API_KEY || 'medipath-admin-secret-2026';
    if (!adminKey || adminKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Valid administrative credentials required to reset provider quota.',
      });
    }

    const usage = resetGooglePlacesUsage();
    res.json({ success: true, message: 'Google Places usage counter reset', googlePlacesUsage: usage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset provider quota' });
  }
};

exports.detectLocation = async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const isLocal = !rawIp || rawIp === '::1' || rawIp === '127.0.0.1' || rawIp.startsWith('192.168.') || rawIp.startsWith('10.');
    const targetUrl = isLocal ? 'https://ipwho.is/' : `https://ipwho.is/${rawIp}`;

    const fetchFn = globalThis.fetch;
    if (fetchFn) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const response = await fetchFn(targetUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success !== false && data.latitude && data.longitude) {
          return res.json({
            success: true,
            city: data.city || 'Surat',
            state: data.region || 'Gujarat',
            country: data.country || 'India',
            lat: Number(data.latitude),
            lng: Number(data.longitude),
            source: 'ip',
          });
        }
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // Safe fallback to Surat, Gujarat
  res.json({
    success: true,
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    lat: 21.1702,
    lng: 72.8311,
    source: 'fallback',
  });
};

exports.reverseGeocode = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng query parameters required' });
    }

    const fetchFn = globalThis.fetch;

    // 1. Try BigDataCloud Client API first
    if (fetchFn) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const bdcRes = await fetchFn(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (bdcRes.ok) {
          const data = await bdcRes.json();
          const city = data.city || data.locality;
          const state = data.principalSubdivision;
          if (city) {
            return res.json({ success: true, city, state, country: data.countryName || 'India', source: 'bigdatacloud' });
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // 2. Try OpenStreetMap Nominatim with proper User-Agent
    if (fetchFn) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const osmRes = await fetchFn(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'MediPath-AI-Healthcare/2.0 (capstone-project)' },
          }
        );
        clearTimeout(timeout);
        if (osmRes.ok) {
          const data = await osmRes.json();
          const a = data.address || {};
          const city = a.city || a.state_district || a.town || a.suburb || a.village || a.county;
          const state = a.state;
          if (city) {
            return res.json({ success: true, city, state, country: a.country || 'India', source: 'nominatim' });
          }
        }
      } catch (e) {
        // Continue
      }
    }

    // 3. Fallback to nearest city in verified registry
    let nearestCity = 'Surat';
    let nearestState = 'Gujarat';
    let minD = Infinity;
    for (const h of hospitals) {
      const hLat = parseFloat(h.latitude || h.lat);
      const hLng = parseFloat(h.longitude || h.lng);
      if (Number.isFinite(hLat) && Number.isFinite(hLng)) {
        const d = distanceKm({ lat, lng }, { lat: hLat, lng: hLng });
        if (d < minD) {
          minD = d;
          nearestCity = h.city || nearestCity;
          nearestState = h.state || nearestState;
        }
      }
    }

    return res.json({ success: true, city: nearestCity, state: nearestState, source: 'nearest_registry' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.enrichHospital = enrichHospital;
exports.loadHospitalData = () => hospitals;
