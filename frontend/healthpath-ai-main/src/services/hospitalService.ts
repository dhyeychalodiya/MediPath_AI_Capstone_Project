// Import kept for types only - data now comes from backend API
import hospitalsData from "@/data/hospitals.json";
import citiesMappingData from "@/data/cities-mapping.json";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export type ModelVersion = "_MedP_AI_V1.0" | "_MedP_AI_V1.5" | "_MedP_AI_V2.0";
export type ModelStatus = "checking" | "online" | "offline";

export async function getModelStatus(): Promise<ModelStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/model/health`);
    if (!response.ok) return "offline";
    const data = await response.json();
    return data.loaded === true ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export async function getAvailableModelVersions(): Promise<ModelVersion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/model/health`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.models || []).filter((model: { available: boolean }) => model.available).map((model: { id: ModelVersion }) => model.id);
  } catch {
    return [];
  }
}

export type Tier = "Premium" | "Mid-tier" | "Budget";

export type RawHospital = {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  nabh: boolean;
  tier: Tier;
  specialties: string[];
  procedures?: string[];
  address?: string;
  phone?: string;
  website?: string;
  emergencyCare?: boolean;
  status?: "open" | "closed";
  source?: string;
};

export type AssessmentStatus =
  | "needs_mandatory_followup"
  | "needs_more_information"
  | "possible_cause_ready"
  | "safe_defer"
  | "emergency_override";

export type AssessmentState = {
  initialSymptoms: string;
  additionalSymptoms: string[];
  confirmedSymptoms: string[];
  rejectedSymptoms: string[];
  askedQuestions: string[];
  previouslyPresentedOptions: string[];
  currentCandidates: DoctorTriageV2Candidate[];
  currentModelConfidence: number | null;
  mandatoryFirstFollowupCompleted: boolean;
  userSelectedNoMoreSymptoms: boolean;
  assessmentStatus: AssessmentStatus;
  safeDeferReason?: string | null;
};

export type HospitalCostBreakdown = {
  doctorFeeMin: number;
  doctorFeeMax: number;
  diagnostics: number;
  medicines: number;
  stayDays: number;
  perDayBase: number;
  roomRentBase: number;
  baseCostMin: number;
  baseCostMax: number;
  tier: string;
  tierMult: number;
  isNabh: boolean;
  nabhMult: number;
  totalMult: number;
  costMin: number;
  costMax: number;
  perDayHospital?: number;
  roomRentHospital?: number;
  roomRent?: number;
};

export type EnrichedHospital = RawHospital & {
  distanceKm: number;
  costMin: number;
  costMax: number;
  stayDays: number;
  perDay: number;
  doctorFeeMin?: number;
  doctorFeeMax?: number;
  diagnostics?: number;
  medicines?: number;
  roomRent?: number;
  roomRentBase?: number;
  baseCostMin?: number;
  baseCostMax?: number;
  tierMult?: number;
  nabhMult?: number;
  totalMult?: number;
  costBreakdown?: HospitalCostBreakdown;
  matchScore: number;
  matchTier?: number;
  matchCategory?: string;
  matchedSpecialties: string[];
  matchedPrimarySpecialties?: string[];
  matchedFallbackSpecialties?: string[];
  matchedProcedures: string[];
  matchReason: string;
  isBestMatch?: boolean;
  /** Per-hospital data source: 'Verified Registry' | 'Google Places' */
  source?: string;
};

export type ConditionInfo = {
  condition: string;
  icd10: string;
  procedure: string;
  specialty: string;
  confidence: number;
  baseConfidence: number; // Static confidence, before adjusting for results
  base: { min: number; max: number; stayDays: number; perDay: number; diagnostics: number; medicines: number; contingencyPct: number };
  lowConfidence?: boolean;
  followUpQuestions?: string[];
  modelProbability?: number | null;
  threshold?: number | null;
  passesThreshold?: boolean;
  decisionSource?: string;
  assessmentStatus?: string;
  safeDeferReason?: string | null;
  topCandidates?: DoctorTriageV2Candidate[];
  urgency?: string;
};

export type PredictionInfo = Pick<ConditionInfo, "condition" | "icd10" | "specialty" | "procedure" | "confidence"> & {
  condition_id: string;
};

export type SearchFilters = {
  radiusKm: number;
  tiers: Tier[];     // empty = all
  nabhOnly: boolean;
  minRating: number; // 0..5
  hospitalName: string;
  procedure: string;
  specialization: string;
  emergencyCare: "all" | "available" | "unavailable";
  status: "all" | "open" | "closed";
  minCost: number;
  maxBudget: number | null;
  sortBy: "distance" | "cost" | "rating";
};

export type CityData = {
  city: string;
  state: string;
  lat: number;
  lng: number;
  hospitalCount: number;
};

export const defaultFilters: SearchFilters = {
  radiusKm: 20,
  tiers: [],
  nabhOnly: false,
  minRating: 0,
  hospitalName: "",
  procedure: "all",
  specialization: "all",
  emergencyCare: "all",
  status: "all",
  minCost: 0,
  maxBudget: null,
  sortBy: "distance",
};

export type BackendHospitalRecord = {
  id?: string;
  hospital_id?: string;
  name?: string;
  hospital_name?: string;
  city?: string;
  state?: string;
  lat?: number | string;
  lng?: number | string;
  latitude?: number | string;
  longitude?: number | string;
  rating?: number | string;
  google_rating?: number | string;
  reviews?: number | string;
  user_ratings_total?: number | string;
  total_beds?: number | string;
  nabh?: boolean | string;
  nabh_accredited?: boolean | string;
  tier?: string;
  tier_category?: string;
  specialties?: string[] | string;
  specializations?: string[] | string;
  procedures?: string[] | string;
  procedures_offered?: string[] | string;
  address?: string;
  address_line?: string;
  pincode?: number | string;
  phone?: string;
  phone_number?: string;
  contact_number?: string;
  website?: string;
  website_url?: string;
  emergencyCare?: boolean | string;
  emergency_care?: boolean | string;
  emergency_services?: boolean | string;
  status?: "open" | "closed";
  source?: string;
  distanceKm?: number;
  distance?: number | string;
  costMin?: number;
  costMax?: number;
  stayDays?: number;
  perDay?: number;
  doctorFeeMin?: number;
  doctorFeeMax?: number;
  diagnostics?: number;
  medicines?: number;
  roomRent?: number;
  roomRentBase?: number;
  baseCostMin?: number;
  baseCostMax?: number;
  tierMult?: number;
  nabhMult?: number;
  totalMult?: number;
  costBreakdown?: HospitalCostBreakdown | Record<string, unknown>;
  matchScore?: number;
  matchTier?: number;
  matchCategory?: string;
  matchedSpecialties?: string[];
  matchedPrimarySpecialties?: string[];
  matchedFallbackSpecialties?: string[];
  matchedProcedures?: string[];
  matchReason?: string;
};

// Transform backend hospital format to frontend format
function transformHospital(rawHosp: BackendHospitalRecord): RawHospital {
  // Handle both backend format (hospital_id, hospital_name, etc.) and frontend format (id, name, etc.)
  const id = rawHosp.id || rawHosp.hospital_id || "unknown";
  const name = rawHosp.name || rawHosp.hospital_name || "Unknown";
  const city = rawHosp.city || "Unknown";
  const state = rawHosp.state || "Unknown";
  
  // Parse coordinates - backend sends as strings or numbers, convert safely to numbers
  const latVal = rawHosp.lat ?? rawHosp.latitude ?? "0";
  const lat = typeof latVal === "number" ? latVal : parseFloat(String(latVal)) || 0;

  const lngVal = rawHosp.lng ?? rawHosp.longitude ?? "0";
  const lng = typeof lngVal === "number" ? lngVal : parseFloat(String(lngVal)) || 0;
  
  // Parse rating - backend sends as string or number
  const ratingVal = rawHosp.rating ?? rawHosp.google_rating ?? "3.8";
  const rating = typeof ratingVal === "number" ? ratingVal : parseFloat(String(ratingVal)) || 3.8;
  
  // Reviews count - use total_beds or user_ratings_total if reviews is not provided
  let reviews = 100;
  if (typeof rawHosp.reviews === "number") {
    reviews = rawHosp.reviews;
  } else if (typeof rawHosp.reviews === "string") {
    reviews = parseInt(rawHosp.reviews, 10) || 100;
  } else if (typeof rawHosp.user_ratings_total === "number") {
    reviews = rawHosp.user_ratings_total;
  } else if (typeof rawHosp.user_ratings_total === "string") {
    reviews = parseInt(rawHosp.user_ratings_total, 10) || 100;
  } else if (typeof rawHosp.total_beds === "number") {
    reviews = rawHosp.total_beds;
  } else if (typeof rawHosp.total_beds === "string") {
    reviews = parseInt(rawHosp.total_beds, 10) || 100;
  }
  
  // Parse NABH - backend sends as boolean or string "TRUE"/"FALSE"
  const nabhValue = rawHosp.nabh_accredited ?? rawHosp.nabh;
  const nabh = nabhValue === true || String(nabhValue).trim().toLowerCase() === "true";
  
  // Normalize tier
  const tierRaw = (rawHosp.tier || "mid").toLowerCase();
  let tier: Tier = "Mid-tier";
  if (tierRaw.includes("premium")) tier = "Premium";
  else if (tierRaw.includes("budget")) tier = "Budget";
  else tier = "Mid-tier";
  
  // Parse specialties - backend sends as comma-separated string or array
  let specialties: string[] = [];
  if (Array.isArray(rawHosp.specialties)) {
    specialties = rawHosp.specialties;
  } else if (typeof rawHosp.specializations === "string") {
    specialties = rawHosp.specializations.split(",").map((s: string) => s.trim()).filter(Boolean);
  } else {
    specialties = [];
  }

  const procedures = Array.isArray(rawHosp.procedures)
    ? rawHosp.procedures
    : typeof rawHosp.procedures_offered === "string"
      ? rawHosp.procedures_offered.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
  
  const address = rawHosp.address || rawHosp.address_line || (rawHosp.pincode ? `${city}, ${state} - ${rawHosp.pincode}` : undefined);
  const phone = rawHosp.phone || rawHosp.phone_number || rawHosp.contact_number;
  const website = rawHosp.website || rawHosp.website_url;

  return {
    id,
    name,
    city,
    state,
    lat,
    lng,
    rating,
    reviews,
    nabh,
    tier,
    specialties,
    procedures,
    address,
    phone,
    website,
    emergencyCare: typeof rawHosp.emergencyCare === "boolean"
      ? rawHosp.emergencyCare
      : typeof rawHosp.emergency_care === "boolean"
        ? rawHosp.emergency_care
        : undefined,
    status: rawHosp.status === "open" || rawHosp.status === "closed" ? rawHosp.status : undefined,
    // Preserve per-hospital source tag from backend
    source: rawHosp.source as string | undefined,
  };
}

// --- Dynamic city data (extracted from hospitals data) ---
function extractCitiesFromHospitals(hospitals: (RawHospital | BackendHospitalRecord)[]): { coords: Record<string, { lat: number; lng: number; state: string }>, statesCities: Record<string, string[]> } {
  const cityMap: Record<string, { lats: number[], lngs: number[], state: string }> = {};
  
  hospitals.forEach(h => {
    if (!h.city || !h.state) return;
    
    const cityKey = h.city;
    if (!cityMap[cityKey]) {
      cityMap[cityKey] = {
        lats: [],
        lngs: [],
        state: h.state,
      };
    }
    
    if (h.lat && h.lng) {
      cityMap[cityKey].lats.push(typeof h.lat === 'string' ? parseFloat(h.lat) : h.lat);
      cityMap[cityKey].lngs.push(typeof h.lng === 'string' ? parseFloat(h.lng) : h.lng);
    }
  });

  const cityCoords: Record<string, { lat: number; lng: number; state: string }> = {};
  const statesCities: Record<string, string[]> = {};

  Object.keys(cityMap).forEach(city => {
    const cityData = cityMap[city];
    const avgLat = cityData.lats.length > 0 ? cityData.lats.reduce((a, b) => a + b) / cityData.lats.length : 0;
    const avgLng = cityData.lngs.length > 0 ? cityData.lngs.reduce((a, b) => a + b) / cityData.lngs.length : 0;
    
    cityCoords[city] = {
      lat: avgLat,
      lng: avgLng,
      state: cityData.state,
    };

    if (!statesCities[cityData.state]) {
      statesCities[cityData.state] = [];
    }
    statesCities[cityData.state].push(city);
  });

  // Sort cities within each state
  Object.keys(statesCities).forEach(state => {
    statesCities[state].sort();
  });

  return { coords: cityCoords, statesCities };
}

export let CITY_COORDS: Record<string, { lat: number; lng: number; state: string }> = {};
export let STATES_WITH_CITIES: Record<string, string[]> = {};

// City coordinates mapping for all 285 cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Andhra Pradesh
  Visakhapatnam: { lat: 17.6869, lng: 83.2185 }, Vijayawada: { lat: 16.5062, lng: 80.6480 }, Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Guntur: { lat: 16.2833, lng: 80.4472 }, Nellore: { lat: 14.4426, lng: 79.9864 }, Tirupati: { lat: 13.1939, lng: 79.8941 },
  Vizag: { lat: 17.6869, lng: 83.2185 }, Rajahmundry: { lat: 16.9891, lng: 81.8044 }, Kurnool: { lat: 15.8281, lng: 78.6355 },
  Kadapa: { lat: 14.4676, lng: 78.8239 }, Ongole: { lat: 15.5057, lng: 80.0449 }, Rajamundry: { lat: 16.9891, lng: 81.8044 },
  Karimnagar: { lat: 18.4386, lng: 79.1288 }, Warangal: { lat: 17.9689, lng: 79.5941 }, Khammam: { lat: 17.2696, lng: 80.6340 },
  Ananthapur: { lat: 13.6298, lng: 77.6022 }, Chittoor: { lat: 13.1939, lng: 79.1065 }, Madanapalle: { lat: 13.7268, lng: 79.1406 },
  Tenali: { lat: 16.2402, lng: 80.6489 }, Hindupur: { lat: 13.6317, lng: 77.2867 }, Kothagudem: { lat: 17.2897, lng: 80.6164 },
  Miryalaguda: { lat: 17.3356, lng: 79.2113 }, Nalgonda: { lat: 17.0535, lng: 79.1316 }, Shamshabad: { lat: 17.3297, lng: 78.6722 },
  Secunderabad: { lat: 17.3699, lng: 78.5044 }, Kukatpally: { lat: 17.4687, lng: 78.4277 }, Rangareddy: { lat: 17.2500, lng: 78.3667 },
  Eldurga: { lat: 15.5667, lng: 76.9333 }, Gajuwaka: { lat: 17.7044, lng: 83.3158 }, Gudivada: { lat: 16.3819, lng: 80.8928 },
  Eastgodavari: { lat: 17.0107, lng: 81.7853 }, Westgodavari: { lat: 16.1852, lng: 80.8663 }, Eluru: { lat: 16.7099, lng: 81.0899 },
  Machlipatanam: { lat: 16.1844, lng: 80.8444 }, Tadepalligudam: { lat: 16.4667, lng: 80.7000 }, Krishna: { lat: 16.2550, lng: 80.8750 },
  Himayatnagar: { lat: 17.3483, lng: 78.9908 }, Pattan: { lat: 15.0000, lng: 80.0000 },

  // Assam
  Guwahati: { lat: 26.1445, lng: 91.7362 }, Dibrugarh: { lat: 27.4728, lng: 94.9142 }, Silchar: { lat: 24.8333, lng: 88.6333 },
  Tinsukia: { lat: 27.4884, lng: 95.3603 }, Sonitpur: { lat: 26.9333, lng: 93.0000 },

  // Bihar
  Patna: { lat: 25.5941, lng: 85.1376 }, Bihar: { lat: 25.5941, lng: 85.1376 },

  // Chattisgarh
  Raipur: { lat: 21.2514, lng: 81.6296 }, Bilaspur: { lat: 22.0796, lng: 82.1506 }, Durg: { lat: 21.1911, lng: 81.2864 },
  Bhilai: { lat: 21.1864, lng: 81.4048 }, Korba: { lat: 22.3596, lng: 82.7421 },

  // Delhi
  "New Delhi": { lat: 28.5355, lng: 77.3910 }, Delhi: { lat: 28.7041, lng: 77.1025 }, Nangloi: { lat: 28.6781, lng: 77.0565 },

  // Goa
  Margao: { lat: 15.2993, lng: 73.8343 }, Goa: { lat: 15.2993, lng: 73.8343 },

  // Gujarat
  Ahmedabad: { lat: 23.0225, lng: 72.5714 }, Surat: { lat: 21.1702, lng: 72.8311 }, Vadodara: { lat: 22.3072, lng: 73.1812 },
  Rajkot: { lat: 22.3039, lng: 70.8022 }, Jamnagar: { lat: 22.4707, lng: 70.0883 }, Baroda: { lat: 22.3072, lng: 73.1812 },
  Gandhinagar: { lat: 23.2156, lng: 72.6369 }, Bhavnagar: { lat: 21.7645, lng: 71.9520 }, Porbandar: { lat: 21.6420, lng: 69.6093 },
  Kutch: { lat: 22.2500, lng: 70.3500 }, Mehsana: { lat: 23.5904, lng: 72.4427 }, Nadiad: { lat: 22.6407, lng: 72.8640 },
  Patan: { lat: 23.8584, lng: 72.1121 }, Bharuch: { lat: 21.6117, lng: 72.9962 }, Godhra: { lat: 22.7758, lng: 73.6050 },
  Amraiwadi: { lat: 23.0580, lng: 72.5810 },

  // Haryana
  Faridabad: { lat: 28.4089, lng: 77.3178 }, Gurgaon: { lat: 28.4595, lng: 77.0266 }, Hisar: { lat: 29.1539, lng: 75.7400 },
  Rohtak: { lat: 28.8955, lng: 76.5656 }, Panipat: { lat: 29.3910, lng: 76.9589 }, Karnal: { lat: 29.6200, lng: 77.1051 },
  Ambala: { lat: 30.3776, lng: 76.7748 }, Panchkula: { lat: 30.6396, lng: 76.6553 }, Kurukshetra: { lat: 29.9689, lng: 76.8738 },
  Sonepat: { lat: 28.9957, lng: 77.0071 }, Yamunanagar: { lat: 30.1230, lng: 76.9805 }, Ballabgarh: { lat: 28.3667, lng: 77.3167 },
  Hissar: { lat: 29.1539, lng: 75.7400 }, Jhajjar: { lat: 28.6167, lng: 76.6500 }, Jind: { lat: 29.3161, lng: 76.3167 },
  Ranipat: { lat: 29.0222, lng: 76.9289 }, Rewari: { lat: 28.0314, lng: 76.6844 },

  // Himachal Pradesh
  Shimla: { lat: 31.7724, lng: 77.1025 }, Kullu: { lat: 32.2206, lng: 77.1103 }, Nahan: { lat: 30.5479, lng: 77.2908 },
  Mandi: { lat: 31.5885, lng: 76.9270 },

  // Jammu & Kashmir
  Srinagar: { lat: 34.0837, lng: 74.7973 }, Jammu: { lat: 32.7214, lng: 74.8479 },

  // Jharkhand
  Ranchi: { lat: 23.3441, lng: 85.3096 }, Dhanbad: { lat: 23.7957, lng: 86.4304 }, Jamshedpur: { lat: 22.8046, lng: 86.1829 },

  // Karnataka
  Bengaluru: { lat: 12.9716, lng: 77.5946 }, Mangalore: { lat: 12.8656, lng: 74.8450 }, Mysore: { lat: 12.2958, lng: 76.6394 },
  Hubli: { lat: 15.3647, lng: 75.1240 }, Belgaum: { lat: 15.8497, lng: 74.4977 }, Davangere: { lat: 14.4644, lng: 75.9218 },
  Tumkur: { lat: 13.2167, lng: 77.1333 }, Gulbarga: { lat: 17.3297, lng: 76.4940 }, Hassan: { lat: 13.3333, lng: 75.7167 },
  Shimoga: { lat: 13.9299, lng: 75.5681 }, Udupi: { lat: 13.3357, lng: 74.7421 }, Raichur: { lat: 16.2120, lng: 77.3567 },
  Bijapur: { lat: 16.8303, lng: 75.7097 }, Bidar: { lat: 17.9689, lng: 77.5245 }, Chickmagalur: { lat: 13.3186, lng: 75.7697 },
  Kolar: { lat: 13.1439, lng: 78.1304 }, Karwar: { lat: 14.8092, lng: 74.1239 }, Anekal: { lat: 12.7167, lng: 77.7000 },
  Chikkaballapur: { lat: 13.4333, lng: 77.9833 }, Chitradurga: { lat: 14.2167, lng: 75.9167 }, Bagalkot: { lat: 15.9136, lng: 75.6714 },
  Ankola: { lat: 14.6333, lng: 74.6500 }, Bantwal: { lat: 12.8833, lng: 74.9833 }, Belthangady: { lat: 13.1500, lng: 75.1833 },
  Bhadravathi: { lat: 13.8442, lng: 75.4681 }, Chanapatna: { lat: 12.6667, lng: 77.2667 }, Channarayapatna: { lat: 12.9333, lng: 76.4333 },
  Chellakere: { lat: 13.5167, lng: 76.3833 }, Dakshinakannada: { lat: 12.8000, lng: 74.8000 }, Gangavathi: { lat: 15.3167, lng: 75.6500 },
  Guttahalli: { lat: 15.3667, lng: 75.4167 }, "Hsr Layout": { lat: 12.9352, lng: 77.6245 }, Kadur: { lat: 13.8333, lng: 75.5000 },
  Kumta: { lat: 14.4236, lng: 74.6400 }, Kundalahalli: { lat: 12.9333, lng: 77.5833 }, Kundapur: { lat: 13.6282, lng: 74.6733 },
  Mandya: { lat: 12.5333, lng: 76.8833 }, Nagarbhavi: { lat: 12.9500, lng: 77.5500 }, Puttur: { lat: 12.7647, lng: 75.2342 },
  Ramanagaram: { lat: 12.7333, lng: 77.3167 }, Ranbennur: { lat: 14.5333, lng: 75.4333 }, Ujjire: { lat: 13.7333, lng: 75.6000 },
  Virajpet: { lat: 12.0833, lng: 75.8333 },

  // Kerala
  Kochi: { lat: 9.9312, lng: 76.2673 }, Cochin: { lat: 9.9312, lng: 76.2673 }, Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Trivandrum: { lat: 8.5241, lng: 76.9366 }, Thrissur: { lat: 10.5276, lng: 76.2144 }, Trichur: { lat: 10.5276, lng: 76.2144 },
  Kozhikode: { lat: 11.2588, lng: 75.7804 }, Kozhicode: { lat: 11.2588, lng: 75.7804 }, Calicut: { lat: 11.2588, lng: 75.7804 },
  Ernakulam: { lat: 9.9312, lng: 76.2673 }, Kannur: { lat: 11.8745, lng: 75.3704 }, Kasaragod: { lat: 12.4817, lng: 75.2341 },
  Pathanamthitta: { lat: 9.2741, lng: 76.7871 }, Kottayam: { lat: 9.5941, lng: 76.5214 }, Kollam: { lat: 8.8932, lng: 76.6100 },
  Alleppey: { lat: 9.4867, lng: 76.3419 }, Palakkad: { lat: 10.7867, lng: 76.6550 }, Alappuzha: { lat: 9.4867, lng: 76.3419 },
  Idukki: { lat: 9.8500, lng: 76.9167 }, Malappuram: { lat: 11.0079, lng: 76.0408 }, Malapuram: { lat: 11.0079, lng: 76.0408 },
  Wayanad: { lat: 11.6000, lng: 75.9500 }, Aluva: { lat: 10.1108, lng: 76.3464 }, Kayamkulam: { lat: 9.1460, lng: 76.4243 },
  Koratty: { lat: 10.2167, lng: 76.3833 }, Kunnamkulam: { lat: 10.4000, lng: 76.1167 }, Manacaud: { lat: 8.4789, lng: 76.9629 },

  // Madhya Pradesh
  Indore: { lat: 22.7196, lng: 75.8577 }, Bhopal: { lat: 23.1815, lng: 79.9864 }, Gwalior: { lat: 26.2183, lng: 78.1629 },
  Jabalpur: { lat: 23.1815, lng: 79.9864 }, Ujjain: { lat: 23.1808, lng: 75.7728 }, Ratlam: { lat: 23.4117, lng: 75.0417 },
  Sagar: { lat: 23.8360, lng: 78.7374 }, Dewas: { lat: 22.9719, lng: 75.8203 }, Scheme: { lat: 22.0000, lng: 75.0000 },

  // Maharashtra
  Mumbai: { lat: 19.0760, lng: 72.8777 }, Pune: { lat: 18.5204, lng: 73.8567 }, Nagpur: { lat: 21.1458, lng: 79.0882 },
  Ahmednagar: { lat: 19.0960, lng: 74.7421 }, Aurangabad: { lat: 19.8762, lng: 75.3433 }, Nashik: { lat: 19.9975, lng: 73.7898 },
  Thane: { lat: 19.2183, lng: 72.9781 }, Kolhapur: { lat: 17.6599, lng: 73.7997 }, Solapur: { lat: 17.6599, lng: 75.9064 },
  Sholapur: { lat: 17.6599, lng: 75.9064 }, Amravati: { lat: 20.8449, lng: 77.7539 }, Raigad: { lat: 18.4981, lng: 73.3516 },
  "Navi Mumbai": { lat: 19.0330, lng: 73.0297 }, "Mira Road": { lat: 19.2813, lng: 72.8289 }, Bhiwandi: { lat: 19.2881, lng: 73.0508 },
  Badlapur: { lat: 19.1686, lng: 73.2833 }, Ulhasnagar: { lat: 19.2139, lng: 73.1333 }, Jalgaon: { lat: 21.1458, lng: 75.5644 },
  Parbhani: { lat: 19.2681, lng: 76.7597 }, Baramati: { lat: 18.6333, lng: 73.8333 }, Buldana: { lat: 20.5305, lng: 76.1726 },
  Kheda: { lat: 22.2667, lng: 72.7333 }, Ratnagiri: { lat: 16.9891, lng: 73.3168 }, Sangli: { lat: 16.8628, lng: 74.5654 },
  Sindhudurga: { lat: 16.1667, lng: 73.8333 }, Wardha: { lat: 20.7505, lng: 78.6000 }, Uran: { lat: 19.1333, lng: 72.9167 },
  Bhosari: { lat: 18.6356, lng: 73.8097 }, Jamkhed: { lat: 18.0833, lng: 74.8833 }, Koparkhairane: { lat: 19.0853, lng: 73.1067 },
  Malegaon: { lat: 20.5595, lng: 74.6181 }, Nalasopara: { lat: 19.3959, lng: 72.7640 },

  // Orissa
  Bhubaneswar: { lat: 20.2961, lng: 85.8245 }, Cuttack: { lat: 20.4625, lng: 85.8830 }, Rourkela: { lat: 22.2261, lng: 84.8737 },
  Berhamapur: { lat: 19.3155, lng: 84.7941 }, Bargarh: { lat: 21.5000, lng: 83.5000 }, Bhubneshwar: { lat: 20.2961, lng: 85.8245 },
  Dhenkanal: { lat: 20.6833, lng: 85.5833 }, Jagatsinghapur: { lat: 20.0500, lng: 86.4500 }, Kendrapada: { lat: 20.5167, lng: 86.4000 },
  Khurda: { lat: 19.9833, lng: 85.6667 }, Sambalpur: { lat: 21.4667, lng: 83.9833 },

  // Punjab
  Chandigarh: { lat: 30.7333, lng: 76.7794 }, Ludhiana: { lat: 30.9010, lng: 75.8573 }, Amritsar: { lat: 31.6340, lng: 74.8723 },
  Patiala: { lat: 30.3398, lng: 76.3868 }, Jalandhar: { lat: 31.7264, lng: 75.5761 }, Bhatinda: { lat: 29.9679, lng: 74.9597 },
  Sangrur: { lat: 30.2667, lng: 75.5500 }, Ferozepur: { lat: 30.9667, lng: 74.5500 }, Gurdaspur: { lat: 32.1807, lng: 75.4054 },
  Mohali: { lat: 30.6435, lng: 76.8012 }, Muktsar: { lat: 30.1936, lng: 74.5383 }, Barnala: { lat: 30.1333, lng: 75.5333 },

  // Rajasthan
  Jaipur: { lat: 26.9124, lng: 75.7873 }, Jodhpur: { lat: 26.2389, lng: 73.0243 }, Udaipur: { lat: 24.5854, lng: 73.7125 },
  Kota: { lat: 25.2138, lng: 75.8648 }, Ajmer: { lat: 26.4499, lng: 74.6399 }, Bikaner: { lat: 28.0229, lng: 71.8324 },
  Alwar: { lat: 27.5719, lng: 76.6289 }, Bharatpur: { lat: 27.2141, lng: 77.4872 }, Chittorgarh: { lat: 24.8934, lng: 74.6289 },
  Jhalawar: { lat: 24.6400, lng: 75.6186 }, Sriganganagar: { lat: 29.9117, lng: 71.8844 },

  // Tamilnadu
  Chennai: { lat: 13.0827, lng: 80.2707 }, Coimbatore: { lat: 11.0066, lng: 76.9485 }, Madurai: { lat: 9.9252, lng: 78.1198 },
  Salem: { lat: 11.6643, lng: 78.1460 }, Trichy: { lat: 10.7905, lng: 78.7047 }, Tiruchirapalli: { lat: 10.7905, lng: 78.7047 },
  Tiruppur: { lat: 11.1085, lng: 77.3411 }, Tirupur: { lat: 11.1085, lng: 77.3411 }, Erode: { lat: 11.3919, lng: 77.7175 },
  Nagercoil: { lat: 8.1928, lng: 77.4244 }, Tirunelveli: { lat: 8.7139, lng: 77.7567 }, Kanyakumari: { lat: 8.0883, lng: 77.5385 },
  Vellore: { lat: 12.9689, lng: 79.1288 }, Krishnagiri: { lat: 12.5193, lng: 78.8978 }, Dharmapuri: { lat: 12.1725, lng: 78.5696 },
  Chengalpattu: { lat: 12.6667, lng: 80.1667 }, Kanchipuram: { lat: 12.8342, lng: 79.7029 }, Thiruvallur: { lat: 13.1288, lng: 79.8997 },
  Villupuram: { lat: 12.9675, lng: 79.4914 }, Cuddalore: { lat: 11.7502, lng: 79.7604 }, Pondicherry: { lat: 11.9416, lng: 79.8083 },
  Karaikudi: { lat: 10.2667, lng: 78.7667 }, Karur: { lat: 10.9597, lng: 78.0855 }, Kumbakonam: { lat: 10.9597, lng: 79.3833 },
  Tanjore: { lat: 10.7870, lng: 79.1378 }, Sivagangai: { lat: 9.8667, lng: 78.4667 }, Sivakasi: { lat: 9.2508, lng: 77.7697 },
  Theni: { lat: 10.0188, lng: 77.4667 }, Hosur: { lat: 12.7396, lng: 77.8303 }, Pollachi: { lat: 10.6703, lng: 76.7442 },
  "Ashok Nagar": { lat: 13.0905, lng: 80.2361 }, Nanganallur: { lat: 12.9352, lng: 80.2245 }, Tiruchendur: { lat: 8.1897, lng: 77.2754 },
  Tuticorin: { lat: 8.8007, lng: 78.1963 }, Valapady: { lat: 10.5667, lng: 76.5667 }, Virudhunagar: { lat: 9.5369, lng: 77.9533 },
  Dindigul: { lat: 10.3669, lng: 77.9814 }, Kuzhithurai: { lat: 8.3333, lng: 77.2500 },

  // Uttar Pradesh
  Lucknow: { lat: 26.8467, lng: 80.9462 }, Kanpur: { lat: 26.4499, lng: 80.3319 }, Varanasi: { lat: 25.3176, lng: 82.9739 },
  Agra: { lat: 27.1767, lng: 78.0081 }, Ghaziabad: { lat: 28.6692, lng: 77.4538 }, Meerut: { lat: 28.9845, lng: 77.7064 },
  Noida: { lat: 28.5355, lng: 77.3910 }, Bareilly: { lat: 28.3670, lng: 79.4304 }, Moradabad: { lat: 28.8385, lng: 77.7597 },
  Aligarh: { lat: 27.8974, lng: 77.8920 }, Allahabad: { lat: 25.4358, lng: 81.8463 }, Azamgarh: { lat: 26.0733, lng: 83.1857 },
  Bijnor: { lat: 29.3842, lng: 78.1302 }, Hapur: { lat: 28.7403, lng: 77.7719 }, Vaishali: { lat: 25.9269, lng: 85.1157 },

  // Uttarakhand
  Dehradun: { lat: 30.3165, lng: 78.0322 }, Haldwani: { lat: 29.2168, lng: 79.5136 }, Hardwar: { lat: 29.9457, lng: 78.1644 },
  Nainital: { lat: 29.3919, lng: 79.4504 },

  // Uttaranchal (same as Uttarakhand)
  // Already covered above

  // West Bengal
  Kolkata: { lat: 22.5726, lng: 88.3639 }, Siliguri: { lat: 26.7271, lng: 88.4230 }, Darjeeling: { lat: 27.0360, lng: 88.2605 },
  Howrah: { lat: 22.5958, lng: 88.2636 }, Durgapur: { lat: 23.8103, lng: 87.3118 }, Burdwan: { lat: 23.2500, lng: 87.8667 },
  Asansol: { lat: 23.6840, lng: 86.9641 }, Jalpaiguri: { lat: 26.5203, lng: 88.7253 }, "Cooch Behar": { lat: 26.3230, lng: 88.8000 },
  Malda: { lat: 25.2500, lng: 88.3833 }, Murshidabad: { lat: 24.1833, lng: 88.2500 }, Birbhum: { lat: 24.1000, lng: 87.6500 },
  Bankura: { lat: 23.8333, lng: 87.0667 }, Garia: { lat: 22.4667, lng: 88.4000 }, Hooghly: { lat: 22.8333, lng: 88.3833 },
  "North24Paraganas": { lat: 22.6333, lng: 88.5833 }, Titagarh: { lat: 22.7743, lng: 88.3882 },
};

// Initialize states and cities from comprehensive mapping
function initializeStatesAndCities() {
  STATES_WITH_CITIES = JSON.parse(JSON.stringify(citiesMappingData));
  
  // Generate CITY_COORDS with defaults
  Object.entries(STATES_WITH_CITIES).forEach(([state, cities]) => {
    cities.forEach(city => {
      if (CITY_COORDINATES[city]) {
        CITY_COORDS[city] = {
          lat: CITY_COORDINATES[city].lat,
          lng: CITY_COORDINATES[city].lng,
          state: state,
        };
      } else {
        // Provide a default coordinate if not found
        CITY_COORDS[city] = {
          lat: 20.5937 + Math.random() * 10,
          lng: 78.9629 + Math.random() * 10,
          state: state,
        };
      }
    });
  });
}

// Initialize cities from local hospitals data
let citiesLoaded = false;
export async function loadCitiesFromHospitals() {
  if (citiesLoaded) return;
  
  try {
    // Initialize with comprehensive cities mapping
    initializeStatesAndCities();
    console.log(`✓ Loaded ${Object.keys(CITY_COORDS).length} cities from cities mapping`);
    console.log(`✓ States: ${Object.keys(STATES_WITH_CITIES).length}`);

    // Then try to fetch from backend to get complete dataset with actual hospital data
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/cities`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data)) {
          const backendCoords: Record<string, { lat: number; lng: number; state: string }> = {};
          const backendStatesCities: Record<string, string[]> = {};
          
          result.data.forEach((city: CityData) => {
            backendCoords[city.city] = {
              lat: city.lat,
              lng: city.lng,
              state: city.state,
            };
            
            if (!backendStatesCities[city.state]) {
              backendStatesCities[city.state] = [];
            }
            backendStatesCities[city.state].push(city.city);
          });
          
          // Sort cities within each state
          Object.keys(backendStatesCities).forEach(state => {
            backendStatesCities[state].sort();
          });
          
          CITY_COORDS = backendCoords;
          STATES_WITH_CITIES = backendStatesCities;
          console.log(`✓ Enhanced: Loaded ${Object.keys(backendCoords).length} cities from backend API`);
        }
      }
    } catch (apiError) {
      console.warn("Backend cities API not available, using cities mapping:", apiError);
    }
  } catch (error) {
    console.error("Failed to load cities:", error);
  }
  
  citiesLoaded = true;
}

// --- Condition catalog (replaceable with Claude / backend later) ---
export const CONDITION_CATALOG: Record<string, ConditionInfo> = {
  knee: {
    condition: "Osteoarthritis of Knee",
    icd10: "M17.9",
    procedure: "Total Knee Replacement (TKR)",
    specialty: "orthopedics",
    baseConfidence: 92,
    confidence: 92,
    base: { min: 140000, max: 420000, stayDays: 5, perDay: 5500, diagnostics: 18000, medicines: 12000, contingencyPct: 10 },
  },
  cardiac: {
    condition: "Suspected Stable Angina (CAD)",
    icd10: "I20.9",
    procedure: "Cardiac Workup + Angiography",
    specialty: "cardiology",
    baseConfidence: 78,
    confidence: 78,
    base: { min: 18000, max: 85000, stayDays: 2, perDay: 6500, diagnostics: 14000, medicines: 4500, contingencyPct: 15 },
  },
  cancer: {
    condition: "Oncology Consultation & Treatment Planning",
    icd10: "C80.1",
    procedure: "Multidisciplinary Cancer Care",
    specialty: "oncology",
    baseConfidence: 84,
    confidence: 84,
    base: { min: 80000, max: 480000, stayDays: 7, perDay: 5000, diagnostics: 35000, medicines: 28000, contingencyPct: 12 },
  },
  neuro: {
    condition: "Neurological Evaluation",
    icd10: "G93.9",
    procedure: "Neuro Workup + Imaging",
    specialty: "neurology",
    baseConfidence: 76,
    confidence: 76,
    base: { min: 25000, max: 180000, stayDays: 3, perDay: 6000, diagnostics: 22000, medicines: 8000, contingencyPct: 12 },
  },
  general: {
    condition: "General Health Consultation",
    icd10: "Z00.0",
    procedure: "Outpatient Diagnostic Evaluation",
    specialty: "general",
    baseConfidence: 70,
    confidence: 70,
    base: { min: 1500, max: 4500, stayDays: 0, perDay: 0, diagnostics: 3500, medicines: 1200, contingencyPct: 10 },
  },
};

export function classifyQuery(query: string): ConditionInfo {
  const q = query.toLowerCase();
  if (q.match(/knee|joint|ghutn|orthop/)) return CONDITION_CATALOG.knee;
  if (q.match(/chest|heart|angina|seene|cardiac/)) return CONDITION_CATALOG.cardiac;
  if (q.match(/cancer|tumor|onco/)) return CONDITION_CATALOG.cancer;
  if (q.match(/brain|stroke|neuro|migraine/)) return CONDITION_CATALOG.neuro;
  return CONDITION_CATALOG.general;
}

// Haversine distance in km
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Calculate adjusted confidence based on search results
function calculateAdjustedConfidence(baseConfidence: number, hospitals: EnrichedHospital[]): number {
  if (hospitals.length === 0) return Math.max(baseConfidence - 20, 40); // Reduce confidence if no hospitals
  
  // Adjust confidence based on:
  // 1. Number of hospitals (more hospitals = higher confidence)
  // 2. Average rating (higher rating = higher confidence)
  // 3. Data availability
  
  const hospitalCountBonus = Math.min(hospitals.length / 10, 1) * 5; // Up to +5% for 10+ hospitals
  const avgRating = hospitals.reduce((sum, h) => sum + h.rating, 0) / hospitals.length;
  const ratingBonus = (avgRating / 5) * 8 - 8 + 8; // Scale 0-5 rating to 0-8 bonus
  const nabhCount = hospitals.filter(h => h.nabh).length;
  const nabhBonus = (nabhCount / Math.max(hospitals.length, 1)) * 3; // Up to +3% for NABH hospitals
  
  const adjustedConfidence = Math.min(
    baseConfidence + hospitalCountBonus + ratingBonus + nabhBonus,
    98 // Cap at 98% to maintain honest uncertainty
  );
  
  return Math.round(adjustedConfidence);
}

// Real hospital bill formula: Total Treatment Cost = Base Medical Cost * Hospital Tier * Accreditation Factor
function priceFor(condition: ConditionInfo, h: RawHospital) {
  const tier = (h.tier || "Mid-tier").toLowerCase();
  // Step 2: Multiply by Hospital Tier
  const tierMult = tier.includes("premium") ? 1.75 : tier.includes("budget") ? 0.60 : 1.00;
  // Step 3: Multiply by Accreditation Factor
  const isNabh = Boolean(h.nabh);
  const nabhMult = isNabh ? 1.05 : 1.00;
  const totalMult = Number((tierMult * nabhMult).toFixed(4));

  // Step 1: Calculate Base Medical Cost
  const base = condition?.base || { min: 500, max: 800, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 600, contingencyPct: 5 };
  const doctorFeeMin = Number(base.min || 500);
  const doctorFeeMax = Number(base.max || doctorFeeMin);
  const diagnostics = Number(base.diagnostics || 0);
  const medicines = Number(base.medicines || 0);
  const stayDays = Number(base.stayDays || 0);
  const perDayBase = Number(base.perDay || 0);
  const roomRentBase = stayDays * perDayBase;

  const baseCostMin = doctorFeeMin + diagnostics + medicines + roomRentBase;
  const baseCostMax = doctorFeeMax + diagnostics + medicines + roomRentBase;

  const costMin = Math.round(baseCostMin * totalMult);
  const costMax = Math.round(baseCostMax * totalMult);
  const perDay = Math.round(perDayBase * totalMult);
  const roomRentHospital = stayDays * perDay;

  return {
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
      tier: h.tier,
      tierMult,
      isNabh,
      nabhMult,
      totalMult,
      costMin,
      costMax,
      perDayHospital: perDay,
      roomRentHospital,
      roomRent: roomRentHospital,
    },
  };
}

function applyHospitalFilters(
  hospitals: EnrichedHospital[], 
  filters: SearchFilters, 
  locationScope: SearchInput["locationScope"] = "city",
  expandedRadius: boolean = false
): EnrichedHospital[] {
  return hospitals.filter((h) => {
    // Distance filter (skip distance cutoff if backend automatically expanded radius for rural/referral cases)
    if (!expandedRadius && locationScope === "city" && filters.radiusKm && h.distanceKm > filters.radiusKm) {
      return false;
    }
    // Tier filter
    if (filters.tiers && filters.tiers.length > 0) {
      const hTier = (h.tier || "Mid-tier").toLowerCase();
      const matchTier = filters.tiers.some(t => t.toLowerCase() === hTier || (t === "Mid-tier" && hTier.includes("mid")));
      if (!matchTier) return false;
    }
    // NABH filter
    if (filters.nabhOnly && !h.nabh) {
      return false;
    }
    // Min Rating filter
    if (filters.minRating > 0 && h.rating < filters.minRating) {
      return false;
    }
    // Hospital Name filter
    if (filters.hospitalName && !h.name.toLowerCase().includes(filters.hospitalName.toLowerCase().trim())) {
      return false;
    }
    // Procedure filter
    if (filters.procedure && filters.procedure !== "all") {
      const procTerm = filters.procedure.toLowerCase().trim();
      const hasProc = (h.procedures || []).some(p => p.toLowerCase().includes(procTerm));
      if (!hasProc) return false;
    }
    // Specialization filter
    if (filters.specialization && filters.specialization !== "all") {
      const specTerm = filters.specialization.toLowerCase().trim();
      const hasSpec = (h.specialties || []).some(s => s.toLowerCase().includes(specTerm));
      if (!hasSpec) return false;
    }
    // Emergency Care filter
    if (filters.emergencyCare !== "all") {
      if (h.emergencyCare !== undefined && h.emergencyCare !== (filters.emergencyCare === "available")) {
        return false;
      }
    }
    // Status filter
    if (filters.status !== "all" && h.status && h.status !== filters.status) {
      return false;
    }
    // Budget filter
    if (filters.maxBudget && filters.maxBudget > 0 && h.costMin > filters.maxBudget) {
      return false;
    }
    if (filters.minCost && filters.minCost > 0 && h.costMax < filters.minCost) {
      return false;
    }
    return true;
  });
}


export type SearchInput = {
  query: string;
  origin: { lat: number; lng: number };
  filters: SearchFilters;
  city?: string;
  state?: string;
  modelVersion: ModelVersion;
  locationScope: "city" | "state" | "country";
  confirmedCondition?: string;
  confirmedConfidence?: number;
  directRouting?: boolean;
};

export type SearchOutput = {
  query: string;
  condition: ConditionInfo;
  hospitals: EnrichedHospital[];
  totalMatching: number;
  predictions: PredictionInfo[];
  followUpQuestions: string[];
  dataSource?: string;
  liveProviderConfigured?: boolean;
  geminiConfigured?: boolean;
  aiRecommendation?: { summary?: string; recommendedHospitalIds?: string[]; reasons?: string[] } | null;
  expandedRadius?: boolean;
  referralNotice?: string | null;
  radiusKm?: number;
  googlePlacesUsage?: {
    calls: number;
    maxDailyLimit?: number;
    remaining?: number;
    quotaHit: boolean;
    date: string;
    reason?: string | null;
  } | null;
};

export type DoctorTriageV2Candidate = {
  condition_id: string;
  condition: string;
  specialization: string;
  specialty?: string;
  specializationTerms?: string[];
  primarySpecializationTerms?: string[];
  fallbackSpecializationTerms?: string[];
  icd10?: string;
  urgency?: string;
  procedure?: string;
  procedureTerms?: string[];
  confidence: number | null;
  modelProbability?: number | null;
  threshold?: number | null;
  passesThreshold?: boolean;
  decisionSource?: string;
  topSymptoms?: string[];
};

export type DoctorTriageV2Result = {
  success: boolean;
  modelVersion: "_MedP_AI_V2.0";
  isDoctorAI: boolean;
  isConfident: boolean;
  confidence: number | null;
  confidenceChange?: number | null;
  previousConfidence?: number | null;
  remainingCandidateCount?: number;
  modelProbability?: number | null;
  threshold?: number | null;
  passesThreshold?: boolean;
  decisionSource?: string;
  ruleTriggered?: string | null;
  safetyRuleTriggered?: string | null;
  clinicalAssessment: string;
  counterQuestion: string | null;
  quickOptions: string[];
  canonicalFollowUpQuestion?: string | null;
  canonicalQuickOptions?: string[];
  canonicalClinicalAssessment?: string | null;
  canonicalSafeDeferReason?: string | null;
  recommendedNextStep?: string;
  condition: DoctorTriageV2Candidate | null;
  topCondition?: DoctorTriageV2Candidate | null;
  topCandidates?: DoctorTriageV2Candidate[];
  assessmentStatus?: AssessmentStatus;
  safeDeferReason?: string | null;
  assessmentState?: AssessmentState;
  language?: string;
  conversationLanguage?: string;
  originalSymptoms?: string;
  translatedSymptoms?: string | null;
  translationError?: boolean;
  message?: string;
};

export async function evaluateDoctorTriageV2(params: {
  symptoms: string;
  chatHistory?: { role?: string; text: string; canonicalText?: string; sender?: string }[];
  turnCount?: number;
  noMoreSymptoms?: boolean;
  assessmentState?: AssessmentState | null;
  language?: string;
  canonicalSymptoms?: string;
}): Promise<DoctorTriageV2Result> {
  try {
    const res = await fetch(`${API_BASE_URL}/triage/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptoms: params.symptoms,
        chatHistory: params.chatHistory || [],
        turnCount: params.turnCount || 0,
        noMoreSymptoms: Boolean(params.noMoreSymptoms),
        assessmentState: params.assessmentState || null,
        modelVersion: "_MedP_AI_V2.0",
        language: params.language || "en",
        canonicalSymptoms: params.canonicalSymptoms || null,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (data.translationError) {
      return {
        success: false,
        translationError: true,
        message: data.message || "Translation service unavailable. Please retry or enter symptoms in English.",
        modelVersion: "_MedP_AI_V2.0",
        isDoctorAI: true,
        isConfident: false,
        confidence: null,
        clinicalAssessment: data.message || "Unable to translate your input. Please switch to English or try again.",
        counterQuestion: null,
        quickOptions: [],
        condition: null,
        topCondition: null,
        topCandidates: [],
        language: params.language,
      };
    }

    return {
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: Boolean(data.isConfident),
      confidence: typeof data.confidence === "number" ? data.confidence : (data.condition?.confidence ?? null),
      confidenceChange: typeof data.confidenceChange === "number" ? data.confidenceChange : null,
      previousConfidence: typeof data.previousConfidence === "number" ? data.previousConfidence : null,
      remainingCandidateCount: typeof data.remainingCandidateCount === "number" ? data.remainingCandidateCount : (data.topCandidates?.length ?? 0),
      modelProbability: typeof data.modelProbability === "number" ? data.modelProbability : (data.condition?.modelProbability ?? null),
      threshold: typeof data.threshold === "number" ? data.threshold : (data.condition?.threshold ?? null),
      passesThreshold: typeof data.passesThreshold === "boolean" ? data.passesThreshold : Boolean(data.condition?.passesThreshold),
      decisionSource: data.decisionSource || "ml_model",
      ruleTriggered: data.ruleTriggered || null,
      safetyRuleTriggered: data.safetyRuleTriggered || null,
      clinicalAssessment: data.data?.clinicalAssessment || "",
      counterQuestion: data.data?.followUpQuestion || null,
      quickOptions: Array.isArray(data.data?.quickOptions) ? data.data.quickOptions : [],
      canonicalFollowUpQuestion: data.data?.canonicalFollowUpQuestion || null,
      canonicalQuickOptions: Array.isArray(data.data?.canonicalQuickOptions) ? data.data.canonicalQuickOptions : [],
      recommendedNextStep: data.data?.recommendedNextStep || "",
      condition: data.condition || null,
      topCondition: data.topCondition || data.condition || null,
      topCandidates: data.topCandidates || [],
      assessmentStatus: data.assessmentStatus || (data.isConfident ? "possible_cause_ready" : "needs_more_information"),
      safeDeferReason: data.safeDeferReason || null,
      assessmentState: data.assessmentState || undefined,
      language: data.language || params.language || "en",
      originalSymptoms: data.originalSymptoms || params.symptoms,
      translatedSymptoms: data.translatedSymptoms || null,
    };
  } catch (err) {
    console.warn("evaluateDoctorTriageV2 API error:", err);
    return {
      success: false,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: null,
      modelProbability: null,
      threshold: null,
      passesThreshold: false,
      decisionSource: "fallback",
      clinicalAssessment: "Dr. MediPath is analyzing your reported symptoms. A safe offline evaluation is provided.",
      counterQuestion: "Could you describe where the discomfort is located or what sensations you feel?",
      quickOptions: ["Head / Neck", "Chest / Heart area", "Abdomen / Stomach", "Joints or Muscles", "No more symptoms"],
      canonicalFollowUpQuestion: "Could you describe where the discomfort is located or what sensations you feel?",
      canonicalQuickOptions: ["Head / Neck", "Chest / Heart area", "Abdomen / Stomach", "Joints or Muscles", "No more symptoms"],
      condition: null,
      topCondition: null,
      topCandidates: [],
    };
  }
}

/**
 * Translates arbitrary text into target language using backend translation service
 */
export async function translateFrontendText(text: string, targetLang: string = "en"): Promise<string> {
  const trimmed = String(text || "").trim();
  if (!trimmed || targetLang === "en") return trimmed;
  try {
    const res = await fetch(`${API_BASE_URL}/triage/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, targetLang }),
    });
    if (!res.ok) return trimmed;
    const data = await res.json();
    return data.translatedText || trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Backend-integrated function: Calls the Express API to search hospitals
 * Falls back to local data if backend is unavailable
 */
export async function findHospitals(input: SearchInput): Promise<SearchOutput> {
  // Ensure cities are loaded from local hospitals data
  await loadCitiesFromHospitals();
  
  const baseCondition = classifyQuery(input.query);
  
  try {
    // Try to fetch from backend API
    const searchParams = new URLSearchParams({
      q: input.query,
      lat: input.origin.lat.toString(),
      lng: input.origin.lng.toString(),
      city: input.locationScope === "city" ? input.city || "" : "",
      state: input.locationScope === "country" ? "" : input.state || "",
      modelVersion: input.modelVersion,
      locationScope: input.locationScope,
      radiusKm: input.filters.radiusKm.toString(),
      minRating: input.filters.minRating.toString(),
    });

    if (input.confirmedCondition) {
      searchParams.append("confirmedCondition", input.confirmedCondition);
    }
    if (input.confirmedConfidence !== undefined && input.confirmedConfidence !== null) {
      searchParams.append("confidence", input.confirmedConfidence.toString());
    } else if (input.confirmedCondition) {
      const lowerCond = input.confirmedCondition.toLowerCase();
      const isEmergencyCond = (input as { isEmergency?: boolean }).isEmergency || /emergency|heart attack|stroke|coronary|appendic|paralysis|bleeding|seizure/i.test(lowerCond);
      if (isEmergencyCond) {
        searchParams.append("isEmergency", "true");
      } else {
        searchParams.append("confidence", "null");
        searchParams.append("isSafeDefer", "true");
      }
    }
    if (input.filters.tiers.length > 0) {
      searchParams.append("tiers", input.filters.tiers.join(","));
    }
    if (input.filters.nabhOnly) {
      searchParams.append("nabhOnly", "true");
    }
    if (input.filters.maxBudget) {
      searchParams.append("maxBudget", input.filters.maxBudget.toString());
    }
    if (input.filters.hospitalName) searchParams.append("hospitalName", input.filters.hospitalName);
    if (input.filters.procedure !== "all") searchParams.append("procedure", input.filters.procedure);
    if (input.filters.specialization !== "all") searchParams.append("specialization", input.filters.specialization);
    if (input.filters.emergencyCare !== "all") searchParams.append("emergencyCare", input.filters.emergencyCare);
    if (input.filters.status !== "all") searchParams.append("status", input.filters.status);
    if (input.filters.minCost && input.filters.minCost > 0) searchParams.append("minCost", input.filters.minCost.toString());
    if (input.filters.sortBy) searchParams.append("sortBy", input.filters.sortBy);
    if (input.directRouting) searchParams.append("directRouting", "true");

    const response = await fetch(`${API_BASE_URL}/hospitals/search?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiData = await response.json();
    
    if (apiData.success && apiData.data) {
      let hospitals = (apiData.data as BackendHospitalRecord[]).map((hospital) => {
        const transformed = transformHospital(hospital);
        const distKm = typeof hospital.distanceKm === "number" ? hospital.distanceKm : (typeof hospital.distance === "number" ? hospital.distance : 0);
        return {
          ...transformed,
          distanceKm: distKm,
          costMin: typeof hospital.costMin === "number" ? hospital.costMin : 1000,
          costMax: typeof hospital.costMax === "number" ? hospital.costMax : 5000,
          stayDays: typeof hospital.stayDays === "number" ? hospital.stayDays : 0,
          perDay: typeof hospital.perDay === "number" ? hospital.perDay : 0,
          doctorFeeMin: hospital.doctorFeeMin ?? hospital.costBreakdown?.doctorFeeMin,
          doctorFeeMax: hospital.doctorFeeMax ?? hospital.costBreakdown?.doctorFeeMax,
          diagnostics: hospital.diagnostics ?? hospital.costBreakdown?.diagnostics,
          medicines: hospital.medicines ?? hospital.costBreakdown?.medicines,
          roomRent: hospital.roomRent ?? hospital.costBreakdown?.roomRent ?? hospital.costBreakdown?.roomRentHospital,
          roomRentBase: hospital.roomRentBase ?? hospital.costBreakdown?.roomRentBase,
          baseCostMin: hospital.baseCostMin ?? hospital.costBreakdown?.baseCostMin,
          baseCostMax: hospital.baseCostMax ?? hospital.costBreakdown?.baseCostMax,
          tierMult: hospital.tierMult ?? hospital.costBreakdown?.tierMult,
          nabhMult: hospital.nabhMult ?? hospital.costBreakdown?.nabhMult,
          totalMult: hospital.totalMult ?? hospital.costBreakdown?.totalMult,
          costBreakdown: hospital.costBreakdown,
          matchScore: typeof hospital.matchScore === "number" ? hospital.matchScore : 50,
          matchTier: typeof hospital.matchTier === "number" ? hospital.matchTier : 4,
          matchCategory: hospital.matchCategory || "regional_referral",
          matchedSpecialties: Array.isArray(hospital.matchedSpecialties) ? hospital.matchedSpecialties : [],
          matchedPrimarySpecialties: Array.isArray(hospital.matchedPrimarySpecialties) ? hospital.matchedPrimarySpecialties : [],
          matchedFallbackSpecialties: Array.isArray(hospital.matchedFallbackSpecialties) ? hospital.matchedFallbackSpecialties : [],
          matchedProcedures: Array.isArray(hospital.matchedProcedures) ? hospital.matchedProcedures : [],
          matchReason: hospital.matchReason || (hospital.matchTier === 1 ? "Verified Specialist Match" : "General-care fallback facility for evaluation and referral"),
          source: hospital.source || "Verified Registry",
        } as EnrichedHospital;
      });
      hospitals = applyHospitalFilters(hospitals, input.filters, input.locationScope, Boolean(apiData.expandedRadius));
      
      // Authoritative confidence contract:
      // For Model 2.0 or when confirmedCondition is present, medical confidence is solely determined by Model 2.0 assessment.
      // Hospital count / rating / NABH bonuses must NEVER recalculate or alter medical confidence.
      const isModelV2OrConfirmed = Boolean(input.confirmedCondition) || input.modelVersion === "_MedP_AI_V2.0";
      const authoritativeConfidence = isModelV2OrConfirmed
        ? (apiData.condition?.confidence !== undefined ? apiData.condition.confidence : (input.confirmedConfidence ?? null))
        : (apiData.condition?.confidence ?? calculateAdjustedConfidence(baseCondition.baseConfidence, hospitals));

      const condition: ConditionInfo = apiData.condition
        ? {
            ...baseCondition,
            condition: apiData.condition.condition,
            icd10: apiData.condition.icd10,
            specialty: apiData.condition.specialization || apiData.condition.specialty || baseCondition.specialty,
            procedure: apiData.condition.procedure || baseCondition.procedure,
            confidence: authoritativeConfidence,
            baseConfidence: authoritativeConfidence ?? baseCondition.baseConfidence,
            lowConfidence: isModelV2OrConfirmed
              ? authoritativeConfidence === null
              : Boolean(apiData.lowConfidence),
            followUpQuestions: apiData.followUpQuestions || [],
            base: apiData.condition.base || baseCondition.base,
            modelProbability: apiData.condition.modelProbability ?? null,
            threshold: apiData.condition.threshold ?? null,
            passesThreshold: apiData.condition.passesThreshold ?? false,
            decisionSource: apiData.condition.decisionSource || "ml_model",
            assessmentStatus: apiData.condition.assessmentStatus,
            safeDeferReason: apiData.condition.safeDeferReason,
            topCandidates: apiData.predictions || [],
          }
        : { ...baseCondition, confidence: authoritativeConfidence };
      
      // Apply sorting: ALWAYS preserve strict sequence:
      // Priority 0: Verified Registry (always first)
      // Priority 1: Google Places (always second)
      // Priority 2: OpenStreetMap (always third)
      const SOURCE_PRIORITY: Record<string, number> = {
        'Verified Registry': 0,
        'Google Places': 1,
        'OpenStreetMap': 2,
      };
      const f = input.filters;
      hospitals.sort((a, b) => {
        const aSource = a.source || 'Verified Registry';
        const bSource = b.source || 'Verified Registry';
        const aPrio = SOURCE_PRIORITY[aSource] ?? 3;
        const bPrio = SOURCE_PRIORITY[bSource] ?? 3;

        // Strict grouping by source priority first
        if (aPrio !== bPrio) {
          return aPrio - bPrio;
        }

        // Within the same source group, sort by user's chosen criteria
        if (f.sortBy === "cost")   return a.costMin - b.costMin;
        if (f.sortBy === "rating") return b.rating  - a.rating;
        return a.distanceKm - b.distanceKm;
      });

      return { 
        query: input.query, 
        condition, 
        hospitals, 
        totalMatching: hospitals.length,
        predictions: apiData.predictions || [],
        followUpQuestions: apiData.followUpQuestions || [],
        dataSource: apiData.dataSource,
        liveProviderConfigured: apiData.liveProviderConfigured,
        geminiConfigured: apiData.geminiConfigured,
        aiRecommendation: apiData.aiRecommendation,
        expandedRadius: apiData.expandedRadius,
        referralNotice: apiData.referralNotice,
        radiusKm: apiData.radiusKm,
        googlePlacesUsage: apiData.googlePlacesUsage ?? null,
      };
    }
  } catch (error) {
    console.warn("Backend API failed, falling back to local data:", error);
  }


  // FALLBACK: Use local data if backend is unavailable
  const rawHospitals = (hospitalsData as unknown as BackendHospitalRecord[]).map(transformHospital);
  const all = rawHospitals as RawHospital[];

  // First try to filter by specialty
  let enriched: EnrichedHospital[] = all
    .filter((h) => {
      if (baseCondition.specialty === "general") return true;
      // Check if any of hospital's specialties match the required specialty (case-insensitive)
      return h.specialties.some(s => s.toLowerCase().includes(baseCondition.specialty.toLowerCase()));
    })
    .map((h) => {
      const p = priceFor(baseCondition, h);
      const dist = +distanceKm(input.origin, h).toFixed(1);
      const matchedSpecs = h.specialties.filter(s => s.toLowerCase().includes(baseCondition.specialty.toLowerCase()));
      const matchedProcs = (h.procedures || []).filter(proc => proc.toLowerCase().includes((baseCondition.procedure || '').toLowerCase()));
      const specScore = matchedSpecs.length > 0 ? 40 : 15;
      const procScore = matchedProcs.length > 0 ? 30 : 0;
      const ratingScore = ((h.rating || 3.5) / 5) * 10;
      const matchScore = Math.round(specScore + procScore + ratingScore + (h.nabh ? 5 : 0));
      const reason = matchedSpecs.length > 0
        ? `Primary specialization match: ${matchedSpecs[0]}`
        : 'General-care fallback for initial clinical evaluation';
      return {
        ...h,
        distanceKm: dist,
        ...p,
        matchScore,
        matchedSpecialties: matchedSpecs,
        matchedProcedures: matchedProcs,
        matchReason: reason,
        source: h.source || 'Verified Registry',
      };
    });

  // If no results and not a general query, fall back to all hospitals in the area
  if (enriched.length === 0 && baseCondition.specialty !== "general") {
    enriched = all
      .map((h) => {
        const p = priceFor(baseCondition, h);
        const dist = +distanceKm(input.origin, h).toFixed(1);
        const matchedSpecs = h.specialties.filter(s => s.toLowerCase().includes(baseCondition.specialty.toLowerCase()));
        const matchedProcs = (h.procedures || []).filter(proc => proc.toLowerCase().includes((baseCondition.procedure || '').toLowerCase()));
        const matchScore = Math.round(((h.rating || 3.5) / 5) * 10 + (h.nabh ? 5 : 0));
        return {
          ...h,
          distanceKm: dist,
          ...p,
          matchScore,
          matchedSpecialties: matchedSpecs,
          matchedProcedures: matchedProcs,
          matchReason: 'General-care fallback for initial clinical evaluation',
          source: h.source || 'Verified Registry',
        };
      });
  }

  const f = input.filters;
  const filtered = applyHospitalFilters(enriched, f, input.locationScope);

  filtered.sort((a, b) => {
    if (f.sortBy === "cost") return a.costMin - b.costMin;
    if (f.sortBy === "rating") return b.rating - a.rating;
    return a.distanceKm - b.distanceKm;
  });

  // Calculate adjusted confidence based on filtered results
  const adjustedConfidence = calculateAdjustedConfidence(baseCondition.baseConfidence, filtered);
  const condition: ConditionInfo = {
    ...baseCondition,
    condition: input.confirmedCondition || baseCondition.condition,
    confidence: typeof input.confirmedConfidence === "number" ? input.confirmedConfidence : adjustedConfidence,
    lowConfidence: input.confirmedCondition ? false : baseCondition.lowConfidence,
  };

  // Simulate network latency for the "AI thinking" UX
  await new Promise((r) => setTimeout(r, 250));

  return {
    query: input.query,
    condition,
    hospitals: filtered,
    totalMatching: filtered.length,
    predictions: [],
    followUpQuestions: ["When did these symptoms start?", "How severe are the symptoms?", "What is the patient's age?"],
  };
}

export function formatINR(n: number | undefined | null): string {
  const val = typeof n === "number" && !isNaN(n) ? Math.round(n) : 0;
  return "₹" + val.toLocaleString("en-IN");
}