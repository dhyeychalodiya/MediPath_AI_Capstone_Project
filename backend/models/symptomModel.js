const fs = require('fs');
const path = require('path');

const MODEL_FILES = {
  '_MedP_AI_V1.0': path.join('MedP_AI_V1.0', 'symptom-model_MedP_AI_V1.0.json'),
  '_MedP_AI_V1.5': path.join('MedP_AI_V1.5', 'symptom-model_MedP_AI_V1.5.json'),
  '_MedP_AI_V2.0': path.join('MedP_AI_V2.0', 'symptom-model_MedP_AI_V2.0.json'),
};
const models = new Map();

function normalizeModelVersion(version) {
  return MODEL_FILES[version] ? version : '_MedP_AI_V2.0';
}

function loadModel(version = '_MedP_AI_V2.0') {
  const modelVersion = normalizeModelVersion(version);
  if (models.has(modelVersion)) return models.get(modelVersion);
  const modelPath = path.join(__dirname, MODEL_FILES[modelVersion]);
  if (!fs.existsSync(modelPath)) return null;
  const loaded = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  models.set(modelVersion, loaded);
  return loaded;
}

// Medical synonym & colloquial-phrase normalization layer
// Exactly matching Python training pipeline in train_v2_multilabel.py
const SYNONYM_REPLACEMENTS = [
  // Multi-lingual & Indian phrases
  [/सीने में दर्द|seene mein dard|seene me dard/gi, 'chest pain'],
  [/सांस लेने में तकलीफ|saans lene mein takleef|saans ki dikkat/gi, 'shortness of breath'],
  [/घुटने में दर्द|ghutne mein dard|ghutna dard/gi, 'knee pain'],
  [/बुखार|bukhar|tez bukhar/gi, 'fever'],
  [/सूखी खांसी|sukhi khansi|sukhi khaansi/gi, 'dry cough'],
  [/खांसी|khansi|khaansi/gi, 'cough'],
  [/सिर दर्द|sir dard|sar dard/gi, 'headache'],
  [/पेट में दर्द|pet mein dard|pet dard/gi, 'abdominal pain'],
  [/उल्टी|ulti/gi, 'vomiting'],
  [/दस्त|dast/gi, 'diarrhea'],
  [/आंखों में दर्द|आंख में दर्द|aankhon mein dard|aankh mein dard|aankh dard/gi, 'eye pain'],
  [/जलन के साथ पेशाब|peshab mein jalan|peshab karte samay jalan/gi, 'painful urination'],

  // Mandatory medical synonym and colloquial-phrase normalization layer
  [/\b(room spinning|spinning sensation|head spinning|world spinning)\b/gi, 'vertigo dizziness loss of balance spinning'],
  [/\b(watery eyes|watering eyes|water in eyes?|excessive tearing|tearing)\b/gi, 'lacrimation excessive tearing watery eyes'],
  [/\b(pink eye|pink eyes)\b/gi, 'conjunctivitis eye redness eye discharge'],
  [/\b(painful eyelid lump|eyelid lump|lump on eyelid|lump in eyelid)\b/gi, 'eyelid lump mass on eyelid skin growth stye chalazion'],
  [/\b(pins and needles|tingling and numbness|tingling sensation|numbness and tingling|thumb[/-]index[/-]finger tingling|finger.*tingling|tingling.*night)\b/gi, 'paresthesia numbness tingling wrist hand finger loss of sensation'],
  [/\b(burning pee|burning urination|burning while peeing|pain while peeing|painful urination)\b/gi, 'painful urination burning urination burning'],
  [/\b(acid coming into my mouth|acid taste in mouth|sour taste in mouth|sour regurgitation|acid regurgitation|acid reflux)\b/gi, 'regurgitation acid reflux heartburn acid'],
  [/\b(blocked nose|stuffy nose|stuffy nasal|blocked nasal)\b/gi, 'nasal congestion stuffy nose blocked'],
  [/\b(tooth swelling with pus|tooth abscess|pus in tooth|swelling in tooth with pus|pus draining from gum|pus around tooth|tooth.*pus|pus.*tooth)\b/gi, 'dental abscess toothache jaw toothache swelling pus'],
  [/\b(lower[- ]right stomach pain|lower[- ]right abdominal pain|right lower quadrant abdominal pain|pain in right lower abdomen|right lower stomach pain)\b/gi, 'right lower quadrant abdominal pain appendicitis abdominal pain'],
  [/\b(feeling low|low mood|persistent sadness|extreme sadness|feeling depressed)\b/gi, 'depressed mood depression sadness'],
  [/\b(loss of interest|lack of interest|loss of pleasure|no interest in anything)\b/gi, 'anhedonia lack of interest depression'],
  [/\b(heart racing|racing heart|heart pounding|pounding heart|rapid heart beat|fast heart beat)\b/gi, 'palpitations rapid heartbeat anxiety'],
  [/\b(rash after using|rash from new soap|rash.*soap|rash.*detergent)\b/gi, 'skin irritation itching rash contact dermatitis'],
  [/\b(raised hives|hives after food|hives.*itching)\b/gi, 'hives skin swelling itching allergic reaction'],
  [/\b(pallor|pale skin)\b/gi, 'pallor fatigue weakness dizziness anaemia'],

  // Indian-English and common colloquial terms
  [/\b(loose motions?|watery stools?)\b/gi, 'diarrhea loose motion'],
  [/\b(pimples?|zits|breakouts?)\b/gi, 'acne pimples'],
  [/\b(stomach ache|belly pain|tummy pain)\b/gi, 'abdominal pain stomach ache'],
  [/\b(runny nose|running nose)\b/gi, 'coryza runny nose runny nose'],
  [/\b(ear ache|earache)\b/gi, 'ear pain earache'],
  [/\b(sore throat|throat pain)\b/gi, 'sore throat throat pain'],
  [/\b(redness in eyes?|red eyes?)\b/gi, 'eye redness red eyes'],
  [/\b(itchy eyes?|itching in eyes?)\b/gi, 'itchiness of eye itchy eyes'],
  [/\b(flaky scalp|dandruff flakes|scalp itching and flaking)\b/gi, 'flaky scalp dandruff seborrheic'],
  [/\b(discharge from eye|eye discharge)\b/gi, 'eye discharge discharge from eye'],
];

function normalizeSymptomText(text) {
  if (!text) return '';
  let normalized = String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  for (const [pattern, replacement] of SYNONYM_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.toLowerCase().trim();
}

function tokenize(text) {
  const norm = normalizeSymptomText(text);
  return norm.match(/[a-z0-9]+/g) || [];
}

function vectorize(text, vectorizer) {
  const tokens = tokenize(text);
  const counts = new Map();
  const add = (term) => counts.set(term, (counts.get(term) || 0) + 1);
  tokens.forEach(add);
  for (let i = 0; i < tokens.length - 1; i += 1) {
    add(`${tokens[i]} ${tokens[i + 1]}`);
  }

  const vector = new Array(vectorizer.idf.length).fill(0);
  counts.forEach((count, term) => {
    const index = vectorizer.vocabulary[term];
    if (index !== undefined) {
      vector[index] = count * vectorizer.idf[index];
    }
  });

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return norm ? vector.map(value => value / norm) : vector;
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function softmax(scores) {
  const max = Math.max(...scores);
  const exps = scores.map(score => Math.exp(score - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map(value => value / total);
}

function getSpecializationTerms(conditionName, specialization) {
  let specLower = String(specialization || '').toLowerCase();
  if (!specLower && conditionName) {
    specLower = String(conditionName).toLowerCase();
  }
  const fallbackTerms = ['general medicine', 'internal medicine', 'general physician', 'family medicine'];

  const specMap = {
    'cardiology': ['cardiology', 'cardiologist', 'cardiac surgery', 'interventional cardiology', 'heart specialist', 'cardio'],
    'neurology': ['neurology', 'neurologist', 'neurosurgery', 'brain specialist', 'neuro sciences', 'stroke care', 'neuro'],
    'oncology': ['oncology', 'oncologist', 'cancer care', 'surgical oncology', 'medical oncology', 'radiation oncology', 'cancer'],
    'pediatrics': ['pediatrics', 'pediatric', 'pediatrician', 'neonatology', 'child healthcare', 'child specialist'],
    'urology': ['urology', 'nephrology', 'urologist', 'kidney care', 'dialysis', 'prostate care', 'renal'],
    'nephrology': ['nephrology', 'urology', 'dialysis', 'kidney care', 'nephrologist', 'renal'],
    'dermatology': ['dermatology', 'skin specialist', 'dermatologist', 'cosmetology', 'allergist', 'skin care', 'skin'],
    'ophthalmology': ['ophthalmology', 'eye specialist', 'ophthalmologist', 'eye care', 'cornea', 'cataract', 'refractive surgery', 'eye'],
    'pulmonology': ['pulmonology', 'pulmonologist', 'chest specialist', 'chest physician', 'respiratory medicine', 'lung care', 'chest'],
    'orthopedics': ['orthopedics', 'orthopedic', 'orthopedic surgeon', 'bone specialist', 'joint replacement', 'spine surgery', 'arthroscopy', 'rheumatology', 'bone'],
    'gastroenterology': ['gastroenterology', 'gastroenterologist', 'stomach specialist', 'hepatology', 'gi surgery', 'endoscopy', 'digestive sciences', 'gastro'],
    'ent': ['ent', 'ear nose throat', 'otolaryngology', 'otolaryngologist', 'rhinology', 'audiology'],
    'psychiatry': ['psychiatry', 'psychiatrist', 'psychology', 'behavioral health', 'mental health', 'counseling', 'de-addiction'],
    'dentistry': ['dentistry', 'dental', 'dentist', 'oral surgeon', 'oral surgery', 'endodontics', 'periodontics', 'teeth care', 'dental clinic'],
    'endocrinology': ['endocrinology', 'endocrinologist', 'diabetology', 'diabetes', 'thyroid specialist', 'hormone specialist'],
    'hematology': ['hematology', 'hematologist', 'blood specialist', 'oncology'],
    'general surgery': ['general surgery', 'surgery', 'general surgeon', 'laparoscopy', 'surgical'],
    'gynecology': ['gynecology', 'gynaecology', 'obstetrics', 'ob-gyn', 'ob/gyn', 'womens health', 'maternity', 'female healthcare'],
    'obstetrics': ['obstetrics', 'gynecology', 'gynaecology', 'ob-gyn', 'ob/gyn', 'womens health', 'maternity'],
    'emergency medicine': ['emergency medicine', 'critical care', 'trauma center', 'casualty', 'icu', 'emergency'],
    'general medicine': ['general medicine', 'internal medicine', 'general physician', 'family medicine', 'physician'],
  };

  let primaryTerms = [];
  for (const [key, terms] of Object.entries(specMap)) {
    const isKeyMatch =
      specLower === key ||
      (key !== 'ent' && specLower.includes(key)) ||
      (key === 'ent' && (specLower === 'ent' || /\bent\b/i.test(specLower)));

    const isTermMatch = terms.some(t => {
      if (t.length <= 3) {
        return specLower === t || new RegExp(`\\b${t}\\b`, 'i').test(specLower);
      }
      return specLower === t || specLower.includes(t);
    });

    if (isKeyMatch || isTermMatch) {
      primaryTerms = [...terms];
      break;
    }
  }
  if (primaryTerms.length === 0) {
    primaryTerms = [specLower];
  }

  const isPrimaryGeneral = primaryTerms.some(t => fallbackTerms.includes(t));
  return {
    primarySpecializationTerms: primaryTerms,
    fallbackSpecializationTerms: isPrimaryGeneral ? [] : fallbackTerms,
  };
}

function predictCondition(text, version = '_MedP_AI_V2.0') {
  const predictions = predictConditions(text, version, 1);
  return predictions[0] || null;
}

function predictConditions(text, version = '_MedP_AI_V2.0', maxResults = 5) {
  const loaded = loadModel(version);
  if (!loaded) return [];

  const vector = vectorize(text, loaded.vectorizer);
  const scores = loaded.classifier.coef.map((row, index) =>
    row.reduce((sum, value, featureIndex) => sum + value * vector[featureIndex], loaded.classifier.intercept[index])
  );

  // Model V2.0 uses independent binary sigmoid probabilities (genuine multi-label learning)
  const isMultiLabel = version === '_MedP_AI_V2.0' || loaded.classifier.type === 'OneVsRest_Independent_Binary_Sigmoid';
  const probabilities = isMultiLabel ? scores.map(sigmoid) : softmax(scores);

  return probabilities
    .map((probability, index) => {
      const label = loaded.labels[index];
      const threshold = label && label.threshold !== undefined ? label.threshold : 0.45;
      const terms = getSpecializationTerms(label?.condition, label?.specialization);
      return {
        ...label,
        primarySpecializationTerms: terms.primarySpecializationTerms,
        fallbackSpecializationTerms: terms.fallbackSpecializationTerms,
        confidence: Math.round(Math.min(99, probability * 100)),
        modelProbability: Math.round(probability * 10000) / 10000,
        threshold,
        passesThreshold: probability >= threshold,
      };
    })
    .sort((a, b) => b.modelProbability - a.modelProbability)
    .slice(0, maxResults);
}

// 11 Mandatory Emergency Warning Sign Patterns (rules override model predictions)
const EMERGENCY_WARNING_PATTERNS = [
  {
    regex: /\b(crushing chest pain|severe chest pain|acute chest pain|chest pain radiating|radiating to left arm|radiating to jaw|radiating to back|sweating and chest pain|chest pain and sweating|heart attack|myocardial infarction|cardiac arrest|cardiac emergency|angina pectoris|angina)\b|^(chest pain|chest pressure|chest tightness)$/i,
    condition: 'Acute Coronary Syndrome / Suspected Heart Attack',
    condition_id: 'acute_coronary_syndrome',
    specialization: 'Emergency Medicine / Cardiology',
    procedure: 'Immediate Emergency Resuscitation & Cardiac Catheterization',
    primarySpecializationTerms: ['emergency medicine', 'cardiology', 'critical care', 'casualty', 'cardiac care'],
    procedureTerms: ['emergency opd', 'cardiac care', 'icu', 'casualty', 'coronary care', 'emergency room'],
    message: 'CRITICAL EMERGENCY: Warning signs of an acute cardiac event (heart attack). Immediately call emergency services (112/108) or go to the nearest emergency hospital.',
  },
  {
    regex: /\b(face drooping|facial droop|slurred speech|speech difficulty|sudden loss of speech|sudden weakness in arm|sudden weakness|paralysis|sudden paralysis|facial paralysis|one[- ]sided weakness|sudden numbness on one side|hemiplegia|stroke|brain stroke|cerebrovascular accident|cva)\b/i,
    condition: 'Suspected Acute Stroke (FAST)',
    condition_id: 'suspected_acute_stroke',
    specialization: 'Emergency Medicine / Neurology',
    procedure: 'Immediate Emergency Thrombolysis & Stroke Triage',
    primarySpecializationTerms: ['emergency medicine', 'neurology', 'critical care', 'stroke unit', 'casualty'],
    procedureTerms: ['emergency opd', 'stroke unit', 'casualty', 'icu', 'emergency room', 'neuro intensive care'],
    message: 'CRITICAL EMERGENCY: Warning signs of an acute stroke (facial droop, arm weakness, or speech difficulty). Immediate emergency hospitalization is vital within the golden hour.',
  },
  {
    regex: /\b(severe breathing difficulty|severe breathlessness|acute shortness of breath|cannot breathe|cant breathe|gasping for air|blue lips|cyanosis|coughing up blood|hemoptysis|pulmonary embolism|pneumothorax|choking|respiratory arrest|suffocation)\b/i,
    condition: 'Acute Pulmonary Emergency',
    condition_id: 'acute_pulmonary_emergency',
    specialization: 'Emergency Medicine / Pulmonology',
    procedure: 'Immediate Emergency Airway Management & Oxygenation',
    primarySpecializationTerms: ['emergency medicine', 'pulmonology', 'critical care', 'casualty'],
    procedureTerms: ['emergency opd', 'icu', 'casualty', 'trauma center', 'emergency room'],
    message: 'CRITICAL EMERGENCY: Severe breathing difficulty or coughing blood requires immediate emergency hospital evaluation and oxygen support.',
  },
  {
    regex: /\b(worst[- ]?(ever|of my life)? headache|thunderclap headache|sudden severe headache|severe headache with neck stiffness|stiff neck with high fever|meningitis|encephalitis|brain hemorrhage)\b/i,
    condition: 'Acute Neurological / Meningeal Emergency',
    condition_id: 'acute_neurological_emergency',
    specialization: 'Emergency Medicine / Neurology',
    procedure: 'Immediate Emergency Neuro-Triage & CT Brain',
    primarySpecializationTerms: ['emergency medicine', 'neurology', 'critical care', 'casualty'],
    procedureTerms: ['emergency opd', 'stroke unit', 'casualty', 'icu', 'emergency room'],
    message: 'CRITICAL EMERGENCY: Sudden worst-ever headache or fever with neck stiffness is a critical neurological emergency requiring immediate hospitalization.',
  },
  {
    regex: /\b(appendix|appendicitis|appendix pain|acute appendicitis|burst appendix|ruptured appendix|perforated appendix)\b|\b(right[- ]lower abdominal pain|lower[- ]right stomach pain|pain in right lower quadrant).*(fever|vomiting|movement tenderness|rebound tenderness)|(fever|vomiting).*(right[- ]lower abdominal pain|lower[- ]right stomach pain)|(severe|acute)?\s*appendicitis\b/i,
    condition: 'Suspected Acute Appendicitis with Warning Signs',
    condition_id: 'acute_appendicitis',
    specialization: 'Emergency Medicine / General Surgery',
    procedure: 'Emergency Surgical Evaluation & Appendectomy',
    primarySpecializationTerms: ['emergency medicine', 'general surgery', 'casualty', 'trauma center'],
    procedureTerms: ['emergency opd', 'general surgery', 'casualty', 'emergency room', 'operation theater', 'icu'],
    message: 'CRITICAL EMERGENCY: Severe right lower-quadrant abdominal pain with fever or vomiting suggests acute appendicitis requiring immediate emergency surgical evaluation.',
  },
  {
    regex: /\b(loss of consciousness|passed out|blackout|syncope with severe pain|fainting with severe pain|unconscious|seizure|seizures|convulsion|convulsions|epileptic fit|status epilepticus|collapsed|circulatory shock|septic shock)\b/i,
    condition: 'Acute Collapse / Shock',
    condition_id: 'acute_collapse_shock',
    specialization: 'Emergency Medicine',
    procedure: 'Immediate Emergency Resuscitation & Stabilization',
    primarySpecializationTerms: ['emergency medicine', 'critical care', 'casualty', 'trauma center', 'icu'],
    procedureTerms: ['emergency opd', 'trauma center', 'casualty', 'icu'],
    message: 'CRITICAL EMERGENCY: Loss of consciousness or fainting with severe pain indicates potential acute shock or circulatory emergency requiring immediate hospital resuscitation.',
  },
  {
    regex: /\b(uncontrolled bleeding|massive bleeding|profuse bleeding|vomiting blood|hematemesis|black tarry stools|melena|hemorrhage|internal bleeding|arterial bleed)\b/i,
    condition: 'Acute Hemorrhagic Emergency',
    condition_id: 'acute_hemorrhagic_emergency',
    specialization: 'Emergency Medicine / Surgery',
    procedure: 'Immediate Emergency Hemostasis & Blood Transfusion',
    primarySpecializationTerms: ['emergency medicine', 'general surgery', 'casualty', 'trauma center'],
    procedureTerms: ['emergency opd', 'general surgery', 'casualty', 'emergency room', 'icu'],
    message: 'CRITICAL EMERGENCY: Active uncontrolled or gastrointestinal bleeding requires immediate emergency medical resuscitation.',
  },
  {
    regex: /\b(sudden loss of vision|sudden vision loss|acute vision loss|blindness sudden|curtain falling over eye|retinal detachment|chemical in eye|chemical burn to eye)\b/i,
    condition: 'Acute Retinal Detachment / Ocular Emergency',
    condition_id: 'acute_ocular_emergency',
    specialization: 'Emergency Ophthalmology',
    procedure: 'Immediate Emergency Ophthalmic Evaluation',
    primarySpecializationTerms: ['emergency ophthalmology', 'ophthalmology', 'casualty'],
    procedureTerms: ['emergency opd', 'ophthalmic emergency', 'casualty'],
    message: 'CRITICAL EMERGENCY: Sudden loss of vision or curtain-like vision defect is an urgent ophthalmic emergency requiring immediate evaluation to prevent permanent blindness.',
  },
  {
    regex: /\b(pregnancy with severe pain|pregnant with severe pain|pregnancy with bleeding|pregnant with vaginal bleeding|ectopic pregnancy|placental abruption|heavy bleeding during pregnancy|severe abdominal pain in pregnancy|postpartum hemorrhage)\b/i,
    condition: 'Acute Obstetric Emergency',
    condition_id: 'acute_obstetric_emergency',
    specialization: 'Emergency Medicine / Obstetrics & Gynecology',
    procedure: 'Immediate Emergency Obstetric Resuscitation & Ultrasound',
    primarySpecializationTerms: ['emergency medicine', 'obstetrics', 'gynecology', 'casualty'],
    procedureTerms: ['emergency opd', 'labor room', 'casualty', 'icu'],
    message: 'CRITICAL EMERGENCY: Pregnancy complicated by severe abdominal pain or bleeding requires immediate emergency obstetric evaluation.',
  },
  {
    regex: /\b(sudden severe testicular pain|acute scrotum pain|testicular pain with sudden onset|testicular torsion|twisted testicle)\b/i,
    condition: 'Suspected Testicular Torsion',
    condition_id: 'testicular_torsion',
    specialization: 'Emergency Medicine / Urology',
    procedure: 'Immediate Emergency Doppler Ultrasound & Surgical Detorsion',
    primarySpecializationTerms: ['emergency medicine', 'urology', 'casualty', 'general surgery'],
    procedureTerms: ['emergency opd', 'urology emergency', 'casualty', 'operation theater'],
    message: 'CRITICAL EMERGENCY: Sudden-onset severe testicular pain is a time-critical surgical emergency requiring immediate evaluation within 6 hours.',
  },
  {
    regex: /\b(severe allergic swelling|throat swelling|throat tightness with hives|anaphylaxis|anaphylactic shock|anaphylactic reaction|swollen tongue and breathing difficulty|facial swelling with breathing difficulty)\b/i,
    condition: 'Acute Anaphylaxis Emergency',
    condition_id: 'acute_anaphylaxis',
    specialization: 'Emergency Medicine / Allergy',
    procedure: 'Immediate Emergency Intramuscular Epinephrine & Airway Support',
    primarySpecializationTerms: ['emergency medicine', 'allergy', 'critical care', 'casualty'],
    procedureTerms: ['emergency opd', 'casualty', 'icu', 'emergency room'],
    message: 'CRITICAL EMERGENCY: Rapidly developing allergic swelling with breathing difficulty or throat tightness indicates anaphylaxis requiring immediate emergency epinephrine.',
  },
];

// Cancer and Tumour Guard
const CANCER_TUMOR_TERMS = /\b(cancer|carcinoma|tumor|tumour|lymphoma|leukemia|leukaemia|sarcoma|melanoma|metastasis|malignan|neoplasm|myeloma)\b/i;

// Lab-only Condition Advisory (Diabetes, Hypertension, etc.)
const LAB_MEASUREMENT_TERMS = /\b(type 2 diabetes|diabetes mellitus|high blood pressure|hypertension|hyperthyroidism|kidney failure|liver disease|coronary artery disease)\b/i;

// Non-medical greetings and generic tokens
const NON_MEDICAL_GREETINGS = /^(hello|hi|hey|good morning|good evening|good afternoon|namaste|hola|greetings|help|testing)[\s!.]*$/i;
const GENERIC_VAGUE_SYMPTOMS = /^(pain|fever|mild tiredness|vague discomfort|unwell|sick|not feeling well|i feel unwell|body pain|discomfort|feeling sick|malaise|tiredness)[\s!.]*$/i;
const GIBBERISH_PATTERN = /^([bcdfghjklmnpqrstvwxyz]{5,}|[a-z]{1,2}|asdf.*|qwerty.*|zxcvb.*)$/i;

// Rejection regex for incomplete fragments (Task 7)
const INVALID_SYMPTOM_FRAGMENTS = [
  /^(in ear|of eye|or finger|appearing|feeling|in throat|on skin|with pain|and fever|or cold|and|or|of|in|on|at|by|with|from)$/i,
  /^(ear|eye|finger|throat|mouth|nose|skin|face|head)$/i,
  /^[a-z]{1,3}$/i,
];

function isInvalidFragment(str) {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim().toLowerCase();
  if (s.length < 4) return true;
  return INVALID_SYMPTOM_FRAGMENTS.some(regex => regex.test(s));
}

const NON_MEDICAL_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we', 'were', 'weren',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won', 'would', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'hello', 'hi', 'hey', 'help', 'feel', 'feeling', 'experienced',
  'experiencing', 'started', 'starting', 'since', 'also', 'like', 'really', 'getting', 'got', 'having'
]);

function extractMatchedMedicalTerms(text, vectorizer) {
  if (!text || !vectorizer || !vectorizer.vocabulary) return [];
  const normalized = normalizeSymptomText(text);
  const tokens = normalized.match(/[a-z0-9]+/g) || [];
  const matched = new Set();

  for (const t of tokens) {
    if (!NON_MEDICAL_STOPWORDS.has(t) && vectorizer.vocabulary[t] !== undefined) {
      matched.add(t);
    }
  }
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const bg = `${tokens[i]} ${tokens[i + 1]}`;
    if (vectorizer.vocabulary[bg] !== undefined) {
      matched.add(bg);
    }
  }
  return Array.from(matched);
}

const GENERIC_SYMPTOM_MODIFIERS = new Set([
  'pain', 'ache', 'discomfort', 'feeling', 'mild', 'severe', 'sharp', 'dull',
  'chronic', 'acute', 'persistent', 'slight', 'swelling', 'discharge', 'frequent',
  'and', 'the', 'in', 'on', 'with', 'or', 'to', 'of', 'a', 'an', 'at', 'by', 'for',
  'from', 'into', 'is', 'it', 'its', 'my', 'no', 'not', 'that', 'this', 'too', 'very'
]);

function checkSymptomMatch(symptomPhrase, condition, model) {
  if (!condition || !symptomPhrase) return false;
  const candText = (condition.topSymptoms || []).join(' ').toLowerCase() + ' ' + String(condition.condition || '').toLowerCase();
  const normSymptom = normalizeSymptomText(symptomPhrase);
  const normCand = normalizeSymptomText(candText);
  const tokens = normSymptom.split(/\s+/).filter(t => t.length > 2 && !GENERIC_SYMPTOM_MODIFIERS.has(t));

  if (tokens.length === 0) {
    return normCand.includes(normSymptom);
  }
  if (tokens.some(t => normCand.includes(t))) return true;

  if (model && model.classifier && model.vectorizer) {
    const classIdx = model.labels.findIndex(l => l.condition_id === condition.condition_id || l.condition === condition.condition);
    if (classIdx !== -1) {
      for (const t of tokens) {
        const featIdx = model.vectorizer.vocabulary[t];
        if (featIdx !== undefined && model.classifier.coef[classIdx][featIdx] > 0.5) {
          return true;
        }
      }
    }
  }
  return false;
}

function formatSymptomOption(sym) {
  if (!sym) return '';
  let clean = String(sym).replace(/\.\d+$/, '').trim().toLowerCase();
  if (isInvalidFragment(clean)) return '';

  const replacements = {
    lacrimation: 'Watery eyes / Excessive tearing',
    'eye pain': 'Eye pain or aching',
    'eye redness': 'Redness in eyes',
    'itchiness of eye': 'Itchy eyes',
    'swollen eyelids': 'Swollen eyelids / eyes',
    'blurred vision': 'Blurry vision',
    vomiting: 'Nausea or vomiting',
    diarrhea: 'Loose stools / Diarrhea',
    'abdominal pain': 'Stomach / Abdominal pain',
    cramps: 'Abdominal cramps',
    fever: 'Fever or chills',
    cough: 'Coughing',
    sneezing: 'Frequent sneezing',
    'nasal congestion': 'Blocked or congested nose',
    'coryza runny nose': 'Runny nose',
    headache: 'Headache or head pressure',
    acne: 'Pimples or facial breakouts',
    rash: 'Skin rash or red patches',
    'back pain': 'Back pain or stiffness',
    'joint pain': 'Joint pain or stiffness',
    'knee pain': 'Knee pain or swelling',
    'ear pain': 'Earache or fullness',
    'sore throat': 'Sore or scratchy throat',
    'painful urination': 'Burning sensation while urinating',
    'frequent urination': 'Frequent or urgent urination',
    'pelvic pain': 'Lower pelvic discomfort',
    'vaginal discharge': 'Abnormal vaginal discharge',
    'vaginal itching': 'Vaginal itching or irritation',
    'tooth pain': 'Tooth or jaw pain',
    'dental abscess': 'Tooth swelling with pus',
    'bleeding gums': 'Tender or bleeding gums',
    fatigue: 'Persistent fatigue or tiredness',
    dizziness: 'Dizziness or lightheadedness',
    vertigo: 'Room spinning when turning (vertigo)',
    wheezing: 'Wheezing or chest whistling',
    'chest tightness': 'Chest tightness or pressure',
    regurgitation: 'Sour taste or acid coming into mouth',
    heartburn: 'Heartburn or acid reflux',
    paresthesia: 'Pins and needles or numbness in fingers',
    anhedonia: 'Loss of interest in activities',
    'depressed mood': 'Persistent low mood or sadness',
    palpitations: 'Heart racing or pounding',
  };
  if (replacements[clean]) return replacements[clean];
  const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
  return isInvalidFragment(formatted) ? '' : formatted;
}

function normalizeQuestionKey(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Advanced Doctor AI Engine Evaluation for MedP_AI_V2.0
 * Strictly adheres to clinical safety processing order:
 * 1. Input validation & sufficiency check
 * 2. Emergency red-flag detector (rules override model)
 * 3. Cancer/complex-condition guard (out-of-scope specialist routing without invented probability)
 * 4. Lab-only condition advisory (screening indication)
 * 5. Multi-label model inference (independent sigmoid probabilities)
 * 6. Follow-up-question generation (discriminative symptoms between top candidates)
 * 7. Possible-cause and specialization routing
 * 8. Hospital recommendation
 */
function evaluateDoctorClarity(params = {}, options = {}) {
  let symptoms, chatHistory, turnCount, noMoreSymptoms, askedQuestions, inputState;
  if (typeof params === 'string') {
    symptoms = params;
    chatHistory = options.chatHistory || [];
    turnCount = options.turnCount !== undefined ? options.turnCount : 0;
    noMoreSymptoms = options.noMoreSymptoms || false;
    askedQuestions = options.askedQuestions || [];
    inputState = options.assessmentState || null;
  } else {
    symptoms = params.symptoms;
    chatHistory = params.chatHistory || [];
    turnCount = params.turnCount !== undefined ? params.turnCount : 0;
    noMoreSymptoms = params.noMoreSymptoms || false;
    askedQuestions = params.askedQuestions || [];
    inputState = params.assessmentState || null;
  }

  const isConversationalControl = (text) => /\b(none|nothing|nahi|no|neither|not really|no other symptoms?|no more symptoms?|no further symptoms?|done|finish|finished|no more)\b/i.test(String(text || '').trim());

  // Extract ONLY patient messages and patient-selected options (never feed assistant assessments back)
  const rawMessages = [
    symptoms,
    ...chatHistory.filter(m => m.role === 'patient' || m.sender === 'user' || m.sender === 'patient').map(m => m.text || '')
  ].map(s => String(s || '').trim()).filter(Boolean);

  const lastUserText = rawMessages[rawMessages.length - 1] || '';
  const userRejectedOptions = Boolean(noMoreSymptoms) || isConversationalControl(lastUserText);

  // Maintain explicit assessment state components
  // Maintain explicit assessment state components
  const initialSymptomsText = (inputState && inputState.initialSymptoms) ? inputState.initialSymptoms : (rawMessages[0] || symptoms || '');
  const additionalSymptomsList = new Set(inputState && Array.isArray(inputState.additionalSymptoms) ? inputState.additionalSymptoms : []);
  const confirmedSymptoms = new Set(inputState && Array.isArray(inputState.confirmedSymptoms) ? inputState.confirmedSymptoms.map(s => String(s).toLowerCase().trim()) : []);
  const rejectedSymptoms = new Set(inputState && Array.isArray(inputState.rejectedSymptoms) ? inputState.rejectedSymptoms.map(s => String(s).toLowerCase().trim()) : []);

  const priorStatus = (inputState && inputState.assessmentStatus) ? inputState.assessmentStatus : null;
  const hadPriorAssessment = Boolean(
    (inputState && (inputState.hadPriorAssessment || priorStatus === 'possible_cause_ready')) ||
    chatHistory.some(m => String(m.text || '').includes('Possible cause identified:') || (m.role === 'doctor' && (m.isAssessmentCard || m.condition)))
  );
  // Detect if user is providing new symptoms immediately following an established assessment
  const isPostAssessmentNewSymptom = Boolean(
    (inputState && inputState.assessmentStatus === 'possible_cause_ready' && !userRejectedOptions) ||
    (hadPriorAssessment && inputState?.assessmentStatus === 'possible_cause_ready' && !userRejectedOptions)
  );

  // Update additional and confirmed symptoms from recent messages
  if (turnCount >= 1 && rawMessages.length > 1) {
    for (let i = 1; i < rawMessages.length; i++) {
      const msg = rawMessages[i];
      if (!isConversationalControl(msg)) {
        additionalSymptomsList.add(msg);
        const lowerMsg = msg.toLowerCase().trim();
        confirmedSymptoms.add(lowerMsg);

        // If a symptom was previously marked rejected (e.g. from a past "no more symptoms" turn)
        // and the user now explicitly provides or selects it, un-reject it for fresh inference
        rejectedSymptoms.delete(lowerMsg);
      }
    }
  }

  // If user selected "no more symptoms", any previously presented options that were not confirmed are treated as rejected
  if (userRejectedOptions && inputState && Array.isArray(inputState.previouslyPresentedOptions)) {
    inputState.previouslyPresentedOptions.forEach(opt => {
      const lowerOpt = String(opt).toLowerCase().trim();
      if (lowerOpt !== 'no more symptoms' && !confirmedSymptoms.has(lowerOpt)) {
        rejectedSymptoms.add(lowerOpt);
      }
    });
  }

  // Accumulate patient symptoms across old turns and current turn cleanly without duplicates
  const accumulatedSymptomsSet = new Set();
  const accumulatedSymptomsList = [];

  const addSymptomPhrase = (phrase) => {
    if (!phrase || typeof phrase !== 'string') return;
    const parts = phrase.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      const lower = part.toLowerCase();
      if (isConversationalControl(lower)) continue;
      // Prevent duplicate repetition of substrings or superstrings
      const alreadySub = accumulatedSymptomsList.some(existing => existing.toLowerCase().includes(lower));
      if (alreadySub) continue;
      const subIdx = accumulatedSymptomsList.findIndex(existing => lower.includes(existing.toLowerCase()));
      if (subIdx !== -1) {
        accumulatedSymptomsList[subIdx] = part;
        accumulatedSymptomsSet.add(lower);
      } else if (!accumulatedSymptomsSet.has(lower)) {
        accumulatedSymptomsSet.add(lower);
        accumulatedSymptomsList.push(part);
      }
    }
  };

  if (inputState?.initialSymptoms) addSymptomPhrase(inputState.initialSymptoms);
  if (Array.isArray(inputState?.confirmedSymptoms)) inputState.confirmedSymptoms.forEach(addSymptomPhrase);
  if (Array.isArray(inputState?.additionalSymptoms)) inputState.additionalSymptoms.forEach(addSymptomPhrase);
  if (symptoms) addSymptomPhrase(symptoms);
  if (Array.isArray(chatHistory)) {
    chatHistory.forEach(m => {
      if (m.role === 'patient' || m.sender === 'user' || m.sender === 'patient') {
        if (m.text) addSymptomPhrase(m.text);
      }
      if (m.answer) addSymptomPhrase(m.answer);
    });
  }

  // For clinical text fed to classifier, exclude non-symptom conversational control phrases
  const clinicalMessages = rawMessages.filter(t => !isConversationalControl(t));
  const patientMessages = (clinicalMessages.length > 0 ? clinicalMessages : rawMessages).filter((t, idx, arr) => idx === 0 || t.toLowerCase() !== arr[idx - 1].toLowerCase());
  const fullPatientText = accumulatedSymptomsList.length > 0 
    ? accumulatedSymptomsList.join(', ')
    : (patientMessages.join(' ').trim() || String(symptoms || '').trim());
  const lowerFull = fullPatientText.toLowerCase();

  // Task 9: Token Reporting
  // Raw tokens entered by patient
  const inputTokens = (fullPatientText.toLowerCase().match(/[a-z0-9]+/g) || []);
  const activeModel = loadModel('_MedP_AI_V2.0');
  // Only terms actually recognized by normalizer/model vocabulary (excluding non-medical stopwords/greetings)
  const matchedMedicalTerms = extractMatchedMedicalTerms(fullPatientText, activeModel?.vectorizer);

  // Helper to construct AssessmentState object
  const buildAssessmentState = (status, selectedTopCondition, activeCandidates = [], currentQuestion = null, currentOptions = [], deferReason = null, confidenceVal = null, confChange = null) => {
    const nextQuestions = new Set(inputState && Array.isArray(inputState.askedQuestions) ? inputState.askedQuestions : []);
    chatHistory.forEach(m => {
      if (m.role === 'assistant' || m.sender === 'doctor' || m.sender === 'assistant' || m.question) {
        if (m.canonicalText) nextQuestions.add(String(m.canonicalText).trim());
        if (m.text) nextQuestions.add(String(m.text).trim());
        if (m.question) nextQuestions.add(String(m.question).trim());
      }
    });
    if (Array.isArray(askedQuestions)) {
      askedQuestions.forEach(q => { if (q) nextQuestions.add(String(q).trim()); });
    }
    if (currentQuestion) nextQuestions.add(String(currentQuestion).trim());

    const nextOptions = new Set(inputState && Array.isArray(inputState.previouslyPresentedOptions) ? inputState.previouslyPresentedOptions : []);
    chatHistory.forEach(m => {
      if (Array.isArray(m.canonicalOptions)) {
        m.canonicalOptions.forEach(opt => nextOptions.add(String(opt).trim()));
      }
      if (Array.isArray(m.options)) {
        m.options.forEach(opt => nextOptions.add(String(opt).trim()));
      }
    });
    if (Array.isArray(currentOptions)) {
      currentOptions.forEach(opt => nextOptions.add(String(opt).trim()));
    }

    const mandatoryCompleted = turnCount > 0 || (inputState?.mandatoryFirstFollowupCompleted === true);
    const finalModelConfidence = typeof confidenceVal === 'number'
      ? confidenceVal
      : (typeof selectedTopCondition?.confidence === 'number' ? selectedTopCondition.confidence : null);

    return {
      initialSymptoms: initialSymptomsText,
      additionalSymptoms: Array.from(additionalSymptomsList),
      confirmedSymptoms: Array.from(confirmedSymptoms),
      rejectedSymptoms: Array.from(rejectedSymptoms),
      askedQuestions: Array.from(nextQuestions),
      previouslyPresentedOptions: Array.from(nextOptions),
      currentCandidates: (activeCandidates && activeCandidates.length > 0) ? activeCandidates.slice(0, 5) : (selectedTopCondition ? [selectedTopCondition] : []),
      currentModelConfidence: finalModelConfidence,
      confidenceChange: confChange !== undefined ? confChange : null,
      mandatoryFirstFollowupCompleted: mandatoryCompleted,
      userSelectedNoMoreSymptoms: userRejectedOptions,
      assessmentStatus: status,
      safeDeferReason: deferReason,
      hadPriorAssessment: hadPriorAssessment || status === 'possible_cause_ready',
    };
  };

  // Helper: System Fallback Output Object (Task 8: modelProbability null, decisionSource fallback)
  const makeSystemFallback = (reasonMessage, question, quickOptions, ruleIdentifier = 'fallback_insufficient_information') => {
    const fallbackCondition = {
      condition_id: 'unsupported_uncertain_condition',
      condition: 'System fallback: Unsupported / Uncertain Condition',
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
      topSymptoms: ['unclear symptoms', 'general discomfort'],
    };

    const cleanOptions = question === null ? [] : (quickOptions || [
      "Fever or chills",
      "Cough or sore throat",
      "Eye pain or redness",
      "Stomach pain or nausea",
      "Skin rash or itching",
      "Joint or back pain",
    ]).filter(q => !isInvalidFragment(q));

    if (question !== null && !cleanOptions.includes('No more symptoms')) {
      cleanOptions.push('No more symptoms');
    }

    const currentStatus = question !== null ? (turnCount === 0 ? 'needs_mandatory_followup' : 'needs_more_information') : 'safe_defer';
    const deferReason = question === null ? reasonMessage : null;

    return {
      isConfident: false,
      confidence: null,
      confidenceChange: null,
      previousConfidence: null,
      remainingCandidateCount: 0,
      modelProbability: null,
      threshold: null,
      passesThreshold: false,
      decisionSource: 'fallback',
      ruleTriggered: ruleIdentifier,
      safetyRuleTriggered: null,
      clinicalAssessment: reasonMessage,
      counterQuestion: question,
      quickOptions: cleanOptions,
      recommendedNextStep: "Please provide more specific symptom details or consult a General Physician for clinical evaluation.",
      predictions: [fallbackCondition],
      condition: null,
      topCondition: fallbackCondition,
      topCandidates: [],
      inputTokens,
      matchedMedicalTerms,
      assessmentStatus: currentStatus,
      safeDeferReason: deferReason,
      assessmentState: buildAssessmentState(currentStatus, fallbackCondition, [fallbackCondition], question, cleanOptions, deferReason, null, null),
    };
  };

  // 1. Input Validation and Sufficiency Check
  const words = lowerFull.replace(/[\s,.-]+/g, ' ').trim().split(' ').filter(Boolean);
  const isVagueGeneralWord = words.length <= 2 && 
    words.every(w => ['pain', 'unwell', 'sick', 'hurt', 'hurts', 'discomfort', 'mild', 'severe', 'bad', 'body', 'general', 'feeling'].includes(w)) &&
    !words.some(w => ['chest', 'abdominal', 'stomach', 'tooth', 'ear', 'eye', 'knee', 'throat', 'urination', 'rash', 'flaky', 'scalp', 'tingling', 'numbness', 'arm', 'leg', 'back', 'neck', 'cough', 'fever', 'vomiting', 'diarrhea', 'headache'].includes(w));

  if (!fullPatientText || NON_MEDICAL_GREETINGS.test(fullPatientText)) {
    return makeSystemFallback(
      "Hello! I am MediPath AI, a healthcare-navigation and triage support system. Please describe the specific symptoms you are experiencing.",
      "What symptoms are you experiencing today?",
      ["Fever or chills", "Cough or sore throat", "Eye redness or pain", "Stomach ache or nausea", "Skin rash or spots", "Joint or body pain"],
      'non_medical_greeting'
    );
  }

  if (GIBBERISH_PATTERN.test(fullPatientText.replace(/[\s,.-]+/g, ''))) {
    return makeSystemFallback(
      "The input provided does not match recognised medical symptom concepts. Please describe your symptoms in clear words.",
      "Could you please describe what discomfort or symptoms you are experiencing?",
      ["Fever or chills", "Cough or sore throat", "Eye pain or redness", "Stomach pain or nausea", "Skin rash or itching", "Joint or back pain"],
      'gibberish_input'
    );
  }

  if (isVagueGeneralWord || GENERIC_VAGUE_SYMPTOMS.test(fullPatientText)) {
    if (userRejectedOptions) {
      return makeSystemFallback(
        `The reported symptoms remain too general to suggest a specific cause category. A clinical consultation with a General Physician is recommended.`,
        null,
        [],
        'generic_vague_symptom_defer'
      );
    }
    return makeSystemFallback(
      `The symptom "${fullPatientText}" is too general on its own to suggest an initial cause category without more information.`,
      `Where is the discomfort located, and what other symptoms accompany it?`,
      ["Headache / Face", "Chest or throat", "Stomach / Abdomen", "Back or spine", "Arms or legs", "Urinary / Bladder"],
      'generic_vague_symptom'
    );
  }

  // 2. Emergency Red-Flag Detector (Rules override model predictions)
  // Emergency warning signs must be returned immediately without requiring follow-up turns
  for (const ep of EMERGENCY_WARNING_PATTERNS) {
    if (ep.regex.test(lowerFull)) {
      const terms = getSpecializationTerms(ep.condition, ep.specialization);
      const emergencyCondition = {
        condition_id: ep.condition_id || 'acute_medical_emergency',
        condition: ep.condition,
        specialization: ep.specialization,
        specializationTerms: ['emergency medicine', 'critical care', 'casualty', 'trauma center', 'icu'],
        primarySpecializationTerms: ep.primarySpecializationTerms || terms.primarySpecializationTerms,
        fallbackSpecializationTerms: terms.fallbackSpecializationTerms || ['general medicine', 'internal medicine'],
        icd10: ep.icd10 || 'R68.89',
        urgency: 'emergency',
        procedure: ep.procedure || 'Immediate Emergency Resuscitation & Clinical Triage',
        procedureTerms: ep.procedureTerms || ['emergency opd', 'trauma center', 'casualty', 'icu'],
        confidence: null,
        modelProbability: null,
        threshold: null,
        passesThreshold: true,
        topSymptoms: ['acute severe discomfort', 'critical warning signs'],
      };

      const emergencyStatus = 'emergency_override';

      return {
        isConfident: true,
        confidence: null,
        modelProbability: null,
        threshold: null,
        passesThreshold: true,
        decisionSource: 'safety_rule',
        ruleTriggered: ep.condition,
        safetyRuleTriggered: ep.condition,
        clinicalAssessment: ep.message,
        counterQuestion: null,
        quickOptions: [],
        recommendedNextStep: ep.message,
        predictions: [emergencyCondition],
        condition: emergencyCondition,
        topCondition: emergencyCondition,
        topCandidates: [emergencyCondition],
        inputTokens,
        matchedMedicalTerms,
        assessmentStatus: emergencyStatus,
        safeDeferReason: null,
        assessmentState: buildAssessmentState(emergencyStatus, emergencyCondition, [emergencyCondition], null, [], null),
      };
    }
  }

  // 3. Cancer and Tumour Guard (Specialized evaluation routing without fake probability)
  if (CANCER_TUMOR_TERMS.test(lowerFull)) {
    const cancerConcern = {
      condition_id: 'outside_supported_scope',
      condition: 'Specialized Clinical Evaluation Required',
      specialization: 'General Medicine / Oncology',
      specializationTerms: ['general medicine', 'internal medicine', 'oncology', 'general physician'],
      primarySpecializationTerms: ['oncology', 'surgical oncology', 'medical oncology'],
      fallbackSpecializationTerms: ['general medicine', 'internal medicine', 'general physician'],
      icd10: 'R69',
      urgency: 'routine',
      procedure: 'Comprehensive In-Person Clinical Assessment & Diagnostics',
      procedureTerms: ['general opd', 'physician consultation', 'diagnostic workup'],
      confidence: null,
      modelProbability: null,
      threshold: null,
      passesThreshold: true,
      topSymptoms: ['unexplained weight loss', 'persistent fatigue', 'unexplained lump'],
    };

    const cancerStatus = 'safe_defer';

    return {
      isConfident: true,
      confidence: null,
      modelProbability: null,
      threshold: null,
      passesThreshold: true,
      decisionSource: 'safety_rule',
      ruleTriggered: 'cancer_tumor_guard',
      safetyRuleTriggered: 'Cancer/Tumour Guard',
      clinicalAssessment: "This concern requires specialized clinical evaluation and diagnostic testing outside the primary-care triage scope. Please consult a qualified doctor for comprehensive in-person evaluation.",
      counterQuestion: null,
      quickOptions: [],
      recommendedNextStep: "Please consult a General Physician or Oncology specialist for comprehensive clinical examination.",
      predictions: [cancerConcern],
      condition: cancerConcern,
      topCondition: cancerConcern,
      topCandidates: [cancerConcern],
      inputTokens,
      matchedMedicalTerms,
      assessmentStatus: cancerStatus,
      safeDeferReason: "Specialized clinical oncological evaluation required outside primary-care symptom scope.",
      assessmentState: buildAssessmentState(cancerStatus, cancerConcern, [cancerConcern], null, [], "Specialized clinical oncological evaluation required outside primary-care symptom scope."),
    };
  }

  // 4. Laboratory / Measurement Screening Advisory
  if (LAB_MEASUREMENT_TERMS.test(lowerFull) && !/\b(pain|rash|cough|fever|swelling|headache|discharge|bleed)\b/i.test(lowerFull)) {
    const screeningCondition = {
      condition_id: 'laboratory_screening_indication',
      condition: 'Clinical Screening & Laboratory Evaluation',
      specialization: 'General Medicine / Endocrinology',
      specializationTerms: ['general medicine', 'internal medicine', 'endocrinology', 'general physician'],
      primarySpecializationTerms: ['endocrinology', 'general medicine', 'internal medicine'],
      fallbackSpecializationTerms: ['general medicine', 'general physician'],
      icd10: 'Z13.89',
      urgency: 'routine',
      procedure: 'Metabolic / Glycemic Profiling & Clinical Workup',
      procedureTerms: ['blood test', 'general opd', 'physician consultation'],
      confidence: null,
      modelProbability: null,
      threshold: null,
      passesThreshold: true,
      topSymptoms: ['routine checkup', 'blood test recommendation'],
    };

    const labStatus = 'safe_defer';

    return {
      isConfident: true,
      confidence: null,
      modelProbability: null,
      threshold: null,
      passesThreshold: true,
      decisionSource: 'safety_rule',
      ruleTriggered: 'lab_screening_advisory',
      safetyRuleTriggered: 'Lab-Only Screening Advisory',
      clinicalAssessment: "Definitive evaluation of metabolic or cardiovascular conditions requires physical measurement (e.g. blood pressure) or laboratory blood tests. We recommend scheduling a clinical screening with a General Physician.",
      counterQuestion: null,
      quickOptions: [],
      recommendedNextStep: "Please consult a General Physician for physical examination and laboratory testing.",
      predictions: [screeningCondition],
      condition: screeningCondition,
      topCondition: screeningCondition,
      topCandidates: [screeningCondition],
      inputTokens,
      matchedMedicalTerms,
      assessmentStatus: labStatus,
      safeDeferReason: "Physical examination and laboratory testing required for definitive evaluation.",
      assessmentState: buildAssessmentState(labStatus, screeningCondition, [screeningCondition], null, [], "Physical examination and laboratory testing required for definitive evaluation."),
    };
  }

  // 5. Multi-Label Model Inference across 56 Canonical Primary-Care Classes
  const predictions = predictConditions(fullPatientText, '_MedP_AI_V2.0', 10);
  const top = predictions[0] || null;
  const second = predictions[1] || null;

  // Recognised tokens check
  if (!top || inputTokens.length === 0 || top.modelProbability < 0.05) {
    if (userRejectedOptions) {
      return makeSystemFallback(
        "The reported symptoms did not match recognisable medical patterns within the 56 supported common conditions. Clinical examination is advised.",
        null,
        [],
        'unrecognized_symptoms_below_threshold'
      );
    }
    return makeSystemFallback(
      "The reported symptoms did not match recognisable medical patterns within the 56 supported common conditions. Clinical examination is advised.",
      "Could you provide additional details about how and when these symptoms began?",
      ["Started today", "Started 2-3 days ago", "Accompanied by fever", "Mild discomfort", "Severe discomfort"],
      'unrecognized_symptoms_below_threshold'
    );
  }

  const p1 = top.modelProbability || 0;
  const p2 = second ? second.modelProbability : 0;
  const leadRatio = p2 > 0 ? (p1 / p2) : 10.0;
  const margin = p1 - p2;
  const passesThreshold = top.passesThreshold;
  // Ambiguity check: applies when top candidate is moderate/borderline (< 0.85) and closely tied with a competitor
  const isAmbiguous = (p1 < 0.85 && p2 >= 0.35 && leadRatio < 1.10 && margin < 0.05);

  // Active candidate diseases: conditions that pass threshold OR are plausible competitors
  const activeCandidates = predictions.filter(p => {
    if (p.passesThreshold) return true;
    if (p.modelProbability >= 0.35 && p.modelProbability >= p1 * 0.50) return true;
    return false;
  });
  const effectiveCandidates = activeCandidates.length > 0 ? activeCandidates : (top ? [top] : []);

  // Filter generic parent condition when specific child variant is leading (e.g. Allergic Conjunctivitis vs Conjunctivitis)
  const distinctCandidates = effectiveCandidates.filter((cand, idx, arr) => {
    return !arr.slice(0, idx).some(higher => higher.condition.toLowerCase().includes(cand.condition.toLowerCase()));
  });

  // Differing symptom detection against top candidate
  let matchingSymptomCount = 0;
  let differingSymptomCount = 0;
  if (accumulatedSymptomsList.length > 0) {
    accumulatedSymptomsList.forEach(phrase => {
      if (checkSymptomMatch(phrase, top, activeModel)) {
        matchingSymptomCount++;
      } else {
        differingSymptomCount++;
      }
    });
  }
  const coherenceRatio = accumulatedSymptomsList.length > 0
    ? (matchingSymptomCount / accumulatedSymptomsList.length)
    : 1.0;

  // Distinct candidate margin and single candidate detection
  const topDistinct = distinctCandidates[0] || top;
  const secondDistinct = distinctCandidates[1] || null;
  const p1Distinct = topDistinct ? topDistinct.modelProbability : p1;
  const p2Distinct = secondDistinct ? secondDistinct.modelProbability : 0;
  const distinctMargin = p1Distinct - p2Distinct;
  const passingDistinct = distinctCandidates.filter(c => c.passesThreshold);

  // One candidate disease left condition:
  // Either only 1 distinct candidate total, OR only 1 passing candidate with a decisive margin over non-passing competitors
  const isOneCandidateLeft = (distinctCandidates.length <= 1) ||
    (passingDistinct.length <= 1 && p1Distinct >= top.threshold && distinctMargin >= 0.12) ||
    (p1 >= 0.85 && distinctMargin >= 0.12 && !secondDistinct?.passesThreshold);

  // Differing symptoms penalty: if symptoms diverge from candidate profile, confidence drops
  let coherenceFactor = 1.0;
  if (differingSymptomCount > 0 && accumulatedSymptomsList.length > 1) {
    coherenceFactor = Math.max(0.35, 0.40 + 0.60 * coherenceRatio);
  }

  // Calculate genuine model confidence score from top candidate probability
  const rawModelConfidence = Math.round(Math.min(99, Math.max(1, p1 * 100)));
  let realConfidence = rawModelConfidence;

  // If there are differing/unmatched symptoms and top does not pass threshold, reflect uncertainty
  if (differingSymptomCount > 0 && accumulatedSymptomsList.length > 1 && !passesThreshold) {
    realConfidence = Math.round(Math.min(99, Math.max(15, rawModelConfidence * coherenceFactor)));
  }

  // Confidence change relative to prior turn
  let previousConfidence = null;
  const prevConfRaw = inputState?.currentModelConfidence;
  if (typeof prevConfRaw === 'number' && !isNaN(prevConfRaw)) {
    previousConfidence = Math.round(prevConfRaw);
  } else if (turnCount >= 1) {
    // If inputState was not provided, compute previous confidence from prior patient messages
    const priorPatientTexts = chatHistory
      .filter(m => m.role === 'patient' || m.sender === 'user' || m.sender === 'patient')
      .map(m => m.canonicalText || m.text || '')
      .filter(t => !isConversationalControl(t));
    
    const priorSymptomsText = priorPatientTexts.length > 1
      ? priorPatientTexts.slice(0, -1).join(', ')
      : (inputState?.initialSymptoms || priorPatientTexts[0] || '');

    if (priorSymptomsText && priorSymptomsText.trim()) {
      const priorPreds = predictConditions(priorSymptomsText.trim(), '_MedP_AI_V2.0', 1);
      if (priorPreds && priorPreds[0] && typeof priorPreds[0].modelProbability === 'number') {
        previousConfidence = Math.round(priorPreds[0].modelProbability * 100);
      }
    }
  }

  const confidenceChange = (turnCount >= 1 && previousConfidence !== null && realConfidence !== null)
    ? (realConfidence - previousConfidence)
    : null;

  // History tracking from chatHistory & assessmentState to avoid repeating questions and options
  const previouslyAskedQuestions = new Set();
  const addQuestionToHistory = (q) => {
    if (!q) return;
    const str = String(q).trim();
    if (str) {
      previouslyAskedQuestions.add(str.toLowerCase());
      const norm = normalizeQuestionKey(str);
      if (norm) previouslyAskedQuestions.add(norm);
    }
  };

  if (inputState && Array.isArray(inputState.askedQuestions)) {
    inputState.askedQuestions.forEach(addQuestionToHistory);
  }
  chatHistory.forEach(m => {
    if (m.role === 'assistant' || m.sender === 'doctor' || m.sender === 'assistant' || m.question) {
      addQuestionToHistory(m.canonicalText);
      addQuestionToHistory(m.text);
      addQuestionToHistory(m.question);
    }
  });
  if (Array.isArray(askedQuestions)) {
    askedQuestions.forEach(addQuestionToHistory);
  }

  const previouslyPresentedOptions = new Set(
    inputState && Array.isArray(inputState.previouslyPresentedOptions) ? inputState.previouslyPresentedOptions.map(o => String(o).trim().toLowerCase()) : []
  );
  chatHistory.forEach(m => {
    if (Array.isArray(m.canonicalOptions)) {
      m.canonicalOptions.forEach(opt => previouslyPresentedOptions.add(String(opt).toLowerCase().trim()));
    }
    if (Array.isArray(m.options)) {
      m.options.forEach(opt => previouslyPresentedOptions.add(String(opt).toLowerCase().trim()));
    }
  });

  // Helper to generate discriminative follow-up question
  const generateFollowUpTurn = () => {
    // Defensive upper bound on follow-up turns:
    // If turnCount has reached upper bound (e.g. 4 turns) and evidence is still uncertain,
    // conclude gracefully to safe deferral with clinical navigation guidance.
    const MAX_FOLLOWUP_TURNS = 4;
    if (turnCount >= MAX_FOLLOWUP_TURNS && turnCount >= 1) {
      return makeSystemFallback(
        "The accumulated symptoms have been evaluated across multiple follow-up turns and remain insufficient to narrow down a specific category without in-person clinical diagnostic workup. Safe deferral to a General Physician is recommended for comprehensive assessment.",
        null,
        [],
        'safe_defer_turn_limit_reached'
      );
    }

    const candidatePool = distinctCandidates.length > 0 ? distinctCandidates : activeCandidates;
    const mentionedTokens = new Set(tokenize(fullPatientText));
    const candidateSymptomOptions = [];
    const addedLower = new Set();

    for (const candidate of candidatePool) {
      for (const rawSym of (candidate.topSymptoms || [])) {
        const symTokens = tokenize(rawSym);
        const alreadyMentioned = symTokens.length > 0 && symTokens.every(t => mentionedTokens.has(t));
        const formatted = formatSymptomOption(rawSym);
        const formattedLower = formatted.toLowerCase();
        const rawSymLower = rawSym.toLowerCase().trim();

        const isAlreadyConfirmed = confirmedSymptoms.has(formattedLower) || confirmedSymptoms.has(rawSymLower);
        const isRejected = rejectedSymptoms.has(formattedLower) || rejectedSymptoms.has(rawSymLower);
        const isPreviouslyPresented = previouslyPresentedOptions.has(formattedLower) || previouslyPresentedOptions.has(rawSymLower);

        if (!alreadyMentioned && !isAlreadyConfirmed && !isRejected && !isPreviouslyPresented && formatted && !isInvalidFragment(formatted)) {
          if (!addedLower.has(formattedLower)) {
            addedLower.add(formattedLower);
            candidateSymptomOptions.push(formatted);
          }
        }
      }
    }

    const recommendedSymptoms = candidateSymptomOptions.slice(0, 6);
    if (recommendedSymptoms.length === 0) {
      const fallbackPool = [
        "Fever or chills",
        "Persistent fatigue or weakness",
        "Localized pain or tenderness",
        "Mild discomfort only",
        "Discomfort worsening over time",
      ];
      for (const opt of fallbackPool) {
        const optLower = opt.toLowerCase();
        if (!previouslyPresentedOptions.has(optLower) && !confirmedSymptoms.has(optLower) && !rejectedSymptoms.has(optLower) && !addedLower.has(optLower)) {
          recommendedSymptoms.push(opt);
        }
      }
    }

    // If still no useful new options remain and turnCount >= 1:
    if (recommendedSymptoms.length === 0 && turnCount >= 1) {
      return makeSystemFallback(
        "The available symptoms remain insufficient to reliably distinguish between the possible cause categories without in-person clinical diagnostic workup. Safe deferral to a General Physician or specialist is recommended.",
        null,
        [],
        'safe_defer_exhausted_questions'
      );
    }

    const candidateNames = candidatePool.map(c => c.condition).slice(0, 2).join(' and ');
    let clinicalAssessment = hadPriorAssessment
      ? `Re-evaluating symptom profile with the new details. Leading considerations include ${candidateNames || top.condition}. Let's narrow down whether any accompanying signs are present:`
      : (candidateNames
          ? `Possible symptom patterns include ${candidateNames}. Additional symptom details will help narrow down the most likely initial category.`
          : `Analyzing reported symptoms. Additional details will help narrow down the most likely initial category.`);

    if (turnCount >= 1 && differingSymptomCount > 0) {
      clinicalAssessment = `With the differing symptom details noted, model confidence adjusted to ${realConfidence}%${confidenceChange !== null ? ` (${confidenceChange >= 0 ? '+' : ''}${confidenceChange}%)` : ''}. Considering ${candidateNames || top.condition}. Let's narrow down whether any accompanying signs are present:`;
    }

    const questionPool = [
      "To help narrow down the possible cause, please select any accompanying symptoms you are experiencing, or select 'No more symptoms':",
      "Are you experiencing any other accompanying symptoms from the list below, or select 'No more symptoms':",
      "Please check if any of these related symptoms are present, or select 'No more symptoms' to evaluate available evidence:",
      "To further clarify the condition, do you notice any of these additional signs, or select 'No more symptoms':",
      "Could you specify if any of these additional symptoms accompany your discomfort, or select 'No more symptoms':",
    ];
    let counterQuestion = null;
    for (const q of questionPool) {
      const qNorm = normalizeQuestionKey(q);
      const qLower = q.toLowerCase();
      if (!previouslyAskedQuestions.has(qLower) && !previouslyAskedQuestions.has(qNorm)) {
        counterQuestion = q;
        break;
      }
    }

    if (!counterQuestion && turnCount >= 1) {
      return makeSystemFallback(
        "No further distinguishing questions remain. Clinical consultation with a General Physician or specialist is advised.",
        null,
        [],
        'safe_defer_no_questions_remain'
      );
    }
    if (!counterQuestion) {
      counterQuestion = questionPool[0];
    }

    const quickOptions = [...recommendedSymptoms, 'No more symptoms'];
    const followUpStatus = turnCount === 0 ? 'needs_mandatory_followup' : 'needs_more_information';

    return {
      isConfident: false,
      confidence: realConfidence,
      confidenceChange,
      previousConfidence,
      remainingCandidateCount: distinctCandidates.length,
      modelProbability: top.modelProbability,
      threshold: top.threshold,
      passesThreshold: top.passesThreshold,
      decisionSource: 'ml_model',
      ruleTriggered: null,
      safetyRuleTriggered: null,
      clinicalAssessment,
      counterQuestion,
      quickOptions,
      recommendedNextStep: `Please select any symptoms that apply or click 'No more symptoms' to view final results.`,
      predictions,
      condition: null,
      topCondition: { ...top, confidence: realConfidence },
      topCandidates: distinctCandidates.map(c => ({ ...c, confidence: Math.round(c.modelProbability * 100) })),
      inputTokens,
      matchedMedicalTerms,
      assessmentStatus: followUpStatus,
      safeDeferReason: null,
      assessmentState: buildAssessmentState(followUpStatus, { ...top, confidence: realConfidence }, distinctCandidates, counterQuestion, quickOptions, null, realConfidence, confidenceChange),
    };
  };

  // A. User selects "No more symptoms"
  // When user indicates no more symptoms (via button or text), the interview MUST finalize.
  // Never ask another follow-up question when userRejectedOptions is true.
  if (userRejectedOptions) {
    // A final possible cause may be shown only when:
    // 1. The top candidate passes its class-specific threshold (passesThreshold === true).
    // 2. The input contains sufficient recognized medical evidence.
    // 3. The candidate has sufficient model probability.
    if (passesThreshold && p1 >= top.threshold && matchedMedicalTerms.length >= 1 && p1 >= 0.35) {
      const readyStatus = 'possible_cause_ready';
      return {
        isConfident: true,
        confidence: realConfidence,
        confidenceChange,
        previousConfidence,
        remainingCandidateCount: 1,
        modelProbability: top.modelProbability,
        threshold: top.threshold,
        passesThreshold: true,
        decisionSource: 'ml_model',
        ruleTriggered: null,
        safetyRuleTriggered: null,
        clinicalAssessment: hadPriorAssessment
          ? `Updated possible cause identified: ${top.condition}. Based on the reported symptom pattern, this is the most likely category. Requires clinical confirmation by a qualified healthcare professional.`
          : `Possible cause identified: ${top.condition}. Based on the reported symptom pattern, this is the most likely initial category. Requires clinical confirmation by a qualified healthcare professional.`,
        counterQuestion: null,
        quickOptions: [],
        recommendedNextStep: top.urgency === 'emergency'
          ? `EMERGENCY: Seek immediate medical evaluation at the nearest emergency hospital.`
          : `We recommend scheduling a consultation with a ${top.specialization} specialist for clinical confirmation and guidance.`,
        predictions,
        condition: { ...top, confidence: realConfidence },
        topCondition: { ...top, confidence: realConfidence },
        topCandidates: distinctCandidates.slice(0, 3).map(c => ({ ...c, confidence: Math.round(c.modelProbability * 100) })),
        inputTokens,
        matchedMedicalTerms,
        assessmentStatus: readyStatus,
        safeDeferReason: null,
        assessmentState: buildAssessmentState(readyStatus, { ...top, confidence: realConfidence }, distinctCandidates.slice(0, 3), null, [], null, realConfidence, confidenceChange),
      };
    }

    // Otherwise: return fallback uncertainty. Never force a disease label when threshold fails or symptoms are vague.
    return makeSystemFallback(
      "The available symptoms are insufficient to narrow down a reliable possible-cause category among the 56 supported classes. In-person clinical consultation with a General Physician is recommended for comprehensive evaluation.",
      null,
      [],
      'insufficient_evidence_after_nomore'
    );
  }

  // B. Initial symptom input (turnCount === 0)
  // MANDATORY REQUIREMENT: Always ask at least one follow-up question when user first presents symptoms.
  // Never finalize immediately at Turn 0 unless user explicitly chose "No more symptoms".
  if (turnCount === 0) {
    return generateFollowUpTurn();
  }

  // If the user just added a new symptom immediately following an established assessment:
  // Must ask clarifying follow-up questions for the newly added evidence rather than locking in immediately
  if (isPostAssessmentNewSymptom) {
    return generateFollowUpTurn();
  }

  // C. User provides another symptom (turnCount >= 1, noMoreSymptoms === false)
  // Narrowing candidates rule: Only finalize if ONE candidate disease is left without conflicting differing symptoms!
  const isSufficientEvidence = passesThreshold && p1 >= top.threshold && isOneCandidateLeft && differingSymptomCount === 0 && realConfidence >= 70 && matchedMedicalTerms.length >= 1;
  if (isSufficientEvidence) {
    const readyStatus = 'possible_cause_ready';
    return {
      isConfident: true,
      confidence: realConfidence,
      confidenceChange,
      previousConfidence,
      remainingCandidateCount: 1,
      modelProbability: top.modelProbability,
      threshold: top.threshold,
      passesThreshold: true,
      decisionSource: 'ml_model',
      ruleTriggered: null,
      safetyRuleTriggered: null,
      clinicalAssessment: hadPriorAssessment
        ? `Updated possible cause identified: ${top.condition}. Based on the re-evaluated symptom evidence, this is the most likely category. Requires clinical confirmation by a qualified healthcare professional.`
        : `Possible cause identified: ${top.condition}. Based on the accumulated symptom pattern, this is the most likely initial category. Requires clinical confirmation by a qualified healthcare professional.`,
      counterQuestion: null,
      quickOptions: [],
      recommendedNextStep: top.urgency === 'emergency'
        ? `EMERGENCY: Seek immediate medical evaluation at the nearest emergency hospital.`
        : `We recommend scheduling a consultation with a ${top.specialization} specialist for clinical confirmation and guidance.`,
      predictions,
      condition: { ...top, confidence: realConfidence },
      topCondition: { ...top, confidence: realConfidence },
      topCandidates: distinctCandidates.slice(0, 3).map(c => ({ ...c, confidence: Math.round(c.modelProbability * 100) })),
      inputTokens,
      matchedMedicalTerms,
      assessmentStatus: readyStatus,
      safeDeferReason: null,
      assessmentState: buildAssessmentState(readyStatus, { ...top, confidence: realConfidence }, distinctCandidates.slice(0, 3), null, [], null, realConfidence, confidenceChange),
    };
  }

  // D. Continued uncertainty -> Ask another new follow-up question (no arbitrary 3-turn cut-off)
  return generateFollowUpTurn();
}

function getFollowUpQuestions(text) {
  const normalized = normalizeSymptomText(text);
  const questions = [];
  if (!/\b(day|days|week|weeks|month|months|since|kal|din|hafte|mahine)\b/.test(normalized)) {
    questions.push('When did these symptoms start?');
  }
  if (!/\b(mild|moderate|severe|intenso|bad|strong|zyada|bahut|sharp)\b/.test(normalized)) {
    questions.push('How severe are the symptoms: mild, moderate, or severe?');
  }
  if (!/\b(age|years old|year old|saal|umar)\b/.test(normalized)) {
    questions.push("What is the patient's age?");
  }
  return questions.slice(0, 3);
}

function getAvailableModels() {
  return Object.entries(MODEL_FILES).map(([id, file]) => ({
    id,
    file,
    available: fs.existsSync(path.join(__dirname, file)),
  }));
}

module.exports = {
  loadModel,
  getModel: () => loadModel('_MedP_AI_V2.0'),
  normalizeSymptomText,
  tokenize,
  vectorize,
  sigmoid,
  softmax,
  predictCondition,
  predictConditions,
  evaluateDoctorClarity,
  getFollowUpQuestions,
  getAvailableModels,
  normalizeModelVersion,
  resolveModelVersion: normalizeModelVersion,
  getSpecializationTerms,
  EMERGENCY_WARNING_PATTERNS,
  CANCER_TUMOR_TERMS,
  LAB_MEASUREMENT_TERMS,
};
