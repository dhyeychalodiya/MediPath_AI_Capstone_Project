const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('PASTE_YOUR'));
}

function validateTriageSchema(res) {
  if (!res || typeof res !== 'object') return false;
  if (typeof res.clinicalAssessment !== 'string' || !res.clinicalAssessment.trim()) return false;
  const validUrgencies = ['Emergency', 'Urgent', 'Prompt', 'Routine'];
  if (!validUrgencies.includes(res.urgencyLevel)) return false;
  if (!Array.isArray(res.redFlags)) return false;
  if (typeof res.recommendedSpecialist !== 'string') return false;
  if (typeof res.recommendedNextStep !== 'string') return false;
  if (res.followUpQuestion !== null && typeof res.followUpQuestion !== 'string') return false;
  if (!Array.isArray(res.quickOptions)) return false;
  return true;
}

function validateHospitalRecommendationSchema(res) {
  if (!res || typeof res !== 'object') return false;
  if (typeof res.summary !== 'string') return false;
  if (!Array.isArray(res.recommendedHospitalIds)) return false;
  if (!Array.isArray(res.reasons)) return false;
  return true;
}

function extractJson(text) {
  const cleaned = String(text || '').replace(/^```json\s*|\s*```$/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

const GEMINI_TIMEOUT_MS = 3500;

async function callGemini(prompt, responseMimeType = 'application/json', temperature = 0.2, timeoutMs = GEMINI_TIMEOUT_MS) {
  if (!isConfigured()) return null;
  const key = process.env.GEMINI_API_KEY.trim();

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, responseMimeType },
        }),
        signal: controller.signal,
      });
      clearTimeout(timerId);

      if (response.status === 429) {
        // Quota limit hit: silently continue or fallback to local triage
        continue;
      }
      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return responseMimeType === 'application/json' ? extractJson(text) : text;
    } catch {
      // Ignore network errors, timeouts, and continue to next model/fallback
    } finally {
      clearTimeout(timerId);
    }
  }
  return null;
}


async function normalizeSymptoms(text) {
  if (!isConfigured()) return text;
  const prompt = `Translate and normalize the user's symptoms into concise English medical symptom words for a classifier. The input may be Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia, Assamese, or another language used in India. Preserve symptom meaning, duration, severity, and body parts. Do not diagnose. Return JSON only: {"normalizedSymptoms":"..."}. User input: ${text}`;
  
  try {
    const res = await callGemini(prompt, 'application/json', 0);
    return res?.normalizedSymptoms || text;
  } catch (err) {
    console.warn('Gemini symptom normalization skipped:', err.message);
    return text;
  }
}

async function recommendHospitals({ query, condition, hospitals, locationLabel }) {
  if (!isConfigured() || !hospitals.length) return null;

  const hospitalData = hospitals.slice(0, 8).map(hospital => ({
    id: hospital.id,
    name: hospital.name,
    city: hospital.city,
    state: hospital.state,
    rating: hospital.rating,
    distanceKm: hospital.distanceKm,
    costMin: hospital.costMin,
    costMax: hospital.costMax,
    nabh: hospital.nabh,
    specialties: hospital.specialties,
  }));
  const prompt = `You are MediPath AI, a healthcare navigation assistant. Recommend hospitals using only the supplied data. Do not diagnose, invent facts, or claim a hospital is medically superior. Return JSON only with keys summary (string), recommendedHospitalIds (array of supplied ids), and reasons (array of short strings). Prefer relevant specialty, high rating, reasonable distance, NABH accreditation, and cost, while explaining that the user should verify availability.\n\nUser query: ${query}\nDetected condition: ${condition?.condition || 'General care'}\nSpecialization: ${condition?.specialty || 'General'}\nLocation: ${locationLabel}\nHospitals: ${JSON.stringify(hospitalData)}`;
  
  try {
    const raw = await callGemini(prompt, 'application/json', 0.2);
    if (validateHospitalRecommendationSchema(raw)) {
      return raw;
    }
    return null;
  } catch (err) {
    console.warn('Gemini hospital recommendation skipped:', err.message);
    return null;
  }
}

/**
 * Intelligent Rule-Based Clinical Triage Engine (Offline Doctor Fallback)
 * Activates whenever Gemini is unconfigured, rate-limited (HTTP 429), or unavailable.
 */
function evaluateLocalTriage({ symptoms, chatHistory = [], condition = null }) {
  const query = String(symptoms || '').toLowerCase();
  const allText = [query, ...chatHistory.map(m => String(m.text || '').toLowerCase())].join(' ');
  const userMessages = chatHistory.filter(m => m.role === 'patient' || m.sender === 'user');
  const turnCount = userMessages.length;

  // Categorize complaint
  const isCardiac = /chest|heart|angina|palpitation|sweat|seene|chhati|heart attack/.test(allText);
  const isRespiratory = /breath|saans|cough|khansi|wheeze|asthma|lungs/.test(allText);
  const isOrtho = /knee|joint|bone|fracture|ghutn|back pain|kamar|shoulder|arthritis/.test(allText);
  const isGastro = /stomach|pet|abdomen|vomit|ulti|dast|diarrhea|acidity|gas|constipation|motion/.test(allText);
  const isNeuro = /headache|sir dard|dizzy|chakkar|faint|seizure|stroke|numbness/.test(allText);
  const isFever = /fever|bukhar|shivering|chills|infection|typhoid|malaria|dengue/.test(allText);

  // Determine specialty & condition label
  let detectedCondition = condition?.condition || condition?.name || 'General Health Concern';
  let specialist = condition?.specialization || 'General Physician';
  let redFlags = ['Sudden unbearable pain', 'Shortness of breath', 'Loss of consciousness or confusion', 'Uncontrolled bleeding'];

  if (isCardiac) {
    specialist = 'Cardiologist';
    detectedCondition = condition?.condition || 'Suspected Angina / Cardiovascular Symptoms';
    redFlags = ['Pain radiating to left arm, neck or jaw', 'Cold sweating with chest pressure', 'Sudden breathlessness or dizziness'];
  } else if (isRespiratory) {
    specialist = 'Pulmonologist / Chest Physician';
    detectedCondition = condition?.condition || 'Respiratory Evaluation / Bronchial Symptoms';
    redFlags = ['Inability to speak full sentences', 'Bluish lips or fingernails', 'SpO2 falling below 92%'];
  } else if (isOrtho) {
    specialist = 'Orthopedic Specialist';
    detectedCondition = condition?.condition || 'Joint or Musculoskeletal Discomfort';
    redFlags = ['Inability to bear weight on the limb', 'Visible joint deformity', 'Sudden severe swelling after trauma'];
  } else if (isGastro) {
    specialist = 'Gastroenterologist / General Surgeon';
    detectedCondition = condition?.condition || 'Abdominal / Gastrointestinal Concern';
    redFlags = ['Severe sharp pain in right lower abdomen', 'Blood in vomit or black stools', 'Persistent vomiting unable to keep liquids'];
  } else if (isNeuro) {
    specialist = 'Neurologist';
    detectedCondition = condition?.condition || 'Neurological / Headache Evaluation';
    redFlags = ['Sudden "thunderclap" headache', 'Facial drooping or slurred speech', 'One-sided arm or leg weakness'];
  } else if (isFever) {
    specialist = 'Internal Medicine Specialist';
    detectedCondition = condition?.condition || 'Febrile Illness / Acute Infection';
    redFlags = ['High fever (>103°F) not subsiding with medication', 'Severe rash with fever', 'Extreme drowsiness or stiff neck'];
  }

  // Determine urgency
  let urgencyLevel = 'Routine';
  const hasSevereRedFlag = /left arm|jaw|sweat|blackout|faint|paralysis|thunderclap|vomiting blood|severe chest|heavy pressure/.test(allText);
  const hasModerateSign = /moderate|severe|2 days|3 days|sharp|worse|fever|swelling/.test(allText);

  if (isCardiac && (hasSevereRedFlag || /severe|radiat/.test(allText))) {
    urgencyLevel = 'Emergency';
  } else if (hasSevereRedFlag) {
    urgencyLevel = 'Emergency';
  } else if (hasModerateSign || isCardiac || isRespiratory) {
    urgencyLevel = 'Urgent';
  } else if (turnCount >= 1) {
    urgencyLevel = 'Prompt';
  } else {
    urgencyLevel = 'Routine';
  }

  // Multi-turn conversational question tree
  let followUpQuestion = null;
  let quickOptions = [];
  let clinicalAssessment = '';
  let recommendedNextStep = '';

  if (turnCount === 0) {
    // Turn 1: Onset & Duration
    clinicalAssessment = `Hello, I am Dr. MediPath. I have reviewed your concern regarding "${symptoms}". Based on clinical indicators, this points toward a ${detectedCondition}. To assist with triage and recommend the right hospital tier, let me ask a few quick clarifying questions.`;
    followUpQuestion = 'When did these symptoms first begin, and did they come on suddenly or gradually?';
    quickOptions = ['Started today (sudden)', '2 to 3 days ago', 'Over 1 week ago', 'Occurs intermittently for weeks'];
    recommendedNextStep = urgencyLevel === 'Emergency' ? 'Seek immediate emergency attention at the nearest tertiary care hospital.' : `Consult a ${specialist} for formal clinical evaluation.`;
  } else if (turnCount === 1) {
    // Turn 2: Character, Triggers & Severity
    clinicalAssessment = `Thank you for the update. Duration and onset help narrow down whether this is acute or progressive.`;
    if (isCardiac) {
      followUpQuestion = 'Does the chest discomfort radiate anywhere (like your left arm, jaw, back), and is it worse when walking or climbing stairs?';
      quickOptions = ['Radiates to left arm/jaw', 'Worse during exertion or walking', 'Only when taking deep breaths', 'Constant ache with no radiation'];
    } else if (isOrtho) {
      followUpQuestion = 'How is the pain affecting your mobility? Is there noticeable swelling, clicking, or morning stiffness?';
      quickOptions = ['Difficulty walking or climbing stairs', 'Swelling and warmth in joint', 'Severe stiffness in mornings', 'Mild ache only after long standing'];
    } else if (isGastro) {
      followUpQuestion = 'Where in your abdomen is the discomfort centered, and is it linked to meals or accompanied by nausea?';
      quickOptions = ['Upper abdomen / burning after meals', 'Right lower side with tenderness', 'Lower abdomen with cramping', 'General diffuse bloating'];
    } else if (isRespiratory) {
      followUpQuestion = 'Is your cough dry or producing phlegm, and do you feel short of breath when lying flat?';
      quickOptions = ['Dry hacking cough', 'Cough with yellow/green phlegm', 'Shortness of breath on lying down', 'Mild wheezing only'];
    } else {
      followUpQuestion = 'On a scale of mild, moderate, or severe, how intense is the discomfort right now?';
      quickOptions = ['Mild - manageable with rest', 'Moderate - interferes with routine', 'Severe - intense and distressing'];
    }
    recommendedNextStep = `Please avoid strenuous activity while we complete your clinical assessment.`;
  } else if (turnCount === 2) {
    // Turn 3: Danger Signs & Red Flags
    clinicalAssessment = `Understood. I am cross-referencing this with our clinical triage guidelines for ${detectedCondition}.`;
    followUpQuestion = 'Are you experiencing any associated danger signs like cold sweating, dizziness, fever, or sudden breathlessness?';
    quickOptions = ['No other danger signs', 'Mild dizziness or weakness', 'Fever or chills present', 'Yes, sweating and breathlessness'];
    recommendedNextStep = urgencyLevel === 'Emergency' ? 'Immediate hospital emergency visit advised.' : `Plan a consultation with a ${specialist} within 24 to 48 hours.`;
  } else {
    // Final Assessment: Conclude Triage
    followUpQuestion = null;
    quickOptions = [];
    clinicalAssessment = `Clinical triage complete. Your symptom pattern and responses are consistent with ${detectedCondition}. Recommended Specialist: ${specialist}. Urgency Category: ${urgencyLevel}.`;
    recommendedNextStep = urgencyLevel === 'Emergency'
      ? 'CRITICAL: Please visit the nearest hospital Emergency Room (ICU / Cath Lab) without delay.'
      : urgencyLevel === 'Urgent'
        ? `We recommend scheduling an OPD appointment with a verified ${specialist} today or tomorrow.`
        : `Consult a qualified ${specialist} or General Physician at your convenience for diagnostic confirmation.`;
  }

  return {
    clinicalAssessment,
    urgencyLevel,
    redFlags,
    recommendedSpecialist: specialist,
    recommendedNextStep,
    followUpQuestion,
    quickOptions,
    isOfflineFallback: true,
  };
}

async function evaluateTriage({ symptoms, chatHistory = [], condition = null, language = "en" }) {
  // If Gemini is configured and quota is available, attempt generative triage
  if (isConfigured()) {
    const prompt = `You are "Dr. MediPath", a helpful, empathetic clinical triage doctor in India.
Assess symptoms, ask relevant clinical follow-up questions to understand severity, and triage the patient (Emergency, Urgent, Prompt, or Routine).
Do not issue final definitive diagnoses. Always provide compassionate, safe guidance.

Patient reported symptoms: "${symptoms}"
Identified potential condition from ML model: ${condition ? JSON.stringify(condition) : "Under evaluation"}
Conversation History:
${JSON.stringify(chatHistory)}

Output JSON ONLY with the following schema:
{
  "clinicalAssessment": "A warm, concise 2-3 sentence clinical assessment of what might be happening.",
  "urgencyLevel": "Emergency" | "Urgent" | "Prompt" | "Routine",
  "redFlags": ["string", "string"],
  "recommendedSpecialist": "e.g. Cardiologist, Pulmonologist, General Physician",
  "recommendedNextStep": "Concise guidance on immediate actions",
  "followUpQuestion": "A targeted clinical question. If sufficient information is provided (after 2-3 turns), set to null.",
  "quickOptions": ["Short option 1", "Short option 2", "Short option 3"]
}`;

    try {
      const result = await callGemini(prompt, 'application/json', 0.3);
      if (validateTriageSchema(result)) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini triage failed; falling back to local clinical triage engine:', err.message);
    }
  }

  // Robust, intelligent offline Clinical Decision Engine fallback
  return evaluateLocalTriage({ symptoms, chatHistory, condition, language });
}

module.exports = { isConfigured, callGemini, normalizeSymptoms, recommendHospitals, evaluateTriage, evaluateLocalTriage };
