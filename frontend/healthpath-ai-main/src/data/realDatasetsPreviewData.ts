// Real training dataset preview records for MediPath AI models
export interface V2DatasetRecord {
  id: string;
  raw_symptoms: string;
  high_confidence: string[];
  medium_confidence: string[];
  low_confidence: string[];
  raw_dialogue_json: string;
}

export interface V1DatasetRecord {
  sample_id: string;
  user_text: string;
  symptoms_present: string;
  condition_id: string;
  condition_name: string;
  icd10: string;
  specialization: string;
  procedure: string;
  urgency: string;
  split: string;
}

export interface ModelDatasetMeta {
  modelId: string;
  modelName: string;
  filename: string;
  downloadUrl: string;
  fileSize: string;
  totalRecords: number;
  classesCount: number;
  featuresCount: number;
  format: string;
  splittingProtocol: string;
  provenanceDescription: string;
  records: V2DatasetRecord[] | V1DatasetRecord[];
}

export const REAL_DATASETS_REGISTRY: Record<string, ModelDatasetMeta> = {
  "_MedP_AI_V2.0": {
    modelId: "_MedP_AI_V2.0",
    modelName: "MediPath AI Model 2.0 (Doctor AI Engine)",
    filename: "symptom-based-disease-prediction-v2.xlsx",
    downloadUrl: "/datasets/symptom-based-disease-prediction-v2.xlsx",
    fileSize: "5.85 MB",
    totalRecords: 104291,
    classesCount: 56,
    featuresCount: 3910,
    format: "Conversational JSON Encounters with Confidence-Grouped Clinical Diagnoses",
    splittingProtocol: "Strict Zero-Leakage Patient Group Stratification (80% Train, 20% Test)",
    provenanceDescription: "Multi-turn conversational patient transcripts with clinical entities mapped to 56 canonical primary-care conditions, confidence tiers (high, medium, low), and emergency overrides.",
    records: [
  {
    "id": "V2_ENC_0001",
    "raw_symptoms": "skin rash, nodal skin eruptions, dischromic patches",
    "high_confidence": [
      "Eczema",
      "Psoriasis"
    ],
    "medium_confidence": [
      "Lichen Planus",
      "Vitiligo"
    ],
    "low_confidence": [
      "Tinea Versicolor",
      "Drug Eruption"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0002",
    "raw_symptoms": "itching, nodal skin eruptions, dischromic patches",
    "high_confidence": [
      "Eczema",
      "Psoriasis"
    ],
    "medium_confidence": [
      "Lichen Planus",
      "Vitiligo"
    ],
    "low_confidence": [
      "Allergic Contact Dermatitis",
      "Tinea Versicolor"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0003",
    "raw_symptoms": "itching, skin rash, dischromic patches",
    "high_confidence": [
      "Eczema",
      "Psoriasis"
    ],
    "medium_confidence": [
      "Allergic Reaction",
      "Vitiligo"
    ],
    "low_confidence": [
      "Lichen Planus",
      "Tinea Versicolor"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0004",
    "raw_symptoms": "itching, skin rash, nodal skin eruptions",
    "high_confidence": [
      "Eczema",
      "Psoriasis"
    ],
    "medium_confidence": [
      "Contact Dermatitis",
      "Allergic Reaction"
    ],
    "low_confidence": [
      "Lichen Planus",
      "Scabies"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0005",
    "raw_symptoms": "continuous sneezing, shivering, chills, watering from eyes",
    "high_confidence": [
      "Allergic Rhinitis",
      "Common Cold"
    ],
    "medium_confidence": [
      "Flu (Influenza)",
      "Hay Fever"
    ],
    "low_confidence": [
      "Viral Conjunctivitis",
      "Sinusitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0006",
    "raw_symptoms": "shivering, chills, watering from eyes",
    "high_confidence": [
      "Influenza",
      "Common Cold"
    ],
    "medium_confidence": [
      "COVID-19",
      "Allergic Rhinitis"
    ],
    "low_confidence": [
      "Conjunctivitis",
      "Hypothermia"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0007",
    "raw_symptoms": "continuous sneezing, chills, watering from eyes",
    "high_confidence": [
      "Allergic rhinitis",
      "Common cold"
    ],
    "medium_confidence": [
      "Influenza",
      "Sinusitis"
    ],
    "low_confidence": [
      "Viral upper respiratory infection",
      "Hay fever"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0008",
    "raw_symptoms": "continuous sneezing, shivering, watering from eyes",
    "high_confidence": [
      "Allergic Rhinitis",
      "Common Cold"
    ],
    "medium_confidence": [
      "Hay Fever",
      "Viral Upper Respiratory Infection"
    ],
    "low_confidence": [
      "Conjunctivitis",
      "Sinusitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0009",
    "raw_symptoms": "continuous sneezing, shivering, chills",
    "high_confidence": [
      "Allergic rhinitis",
      "Common cold"
    ],
    "medium_confidence": [
      "Influenza",
      "Bronchitis"
    ],
    "low_confidence": [
      "Pneumonia",
      "Hypothermia"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0010",
    "raw_symptoms": "stomach pain, acidity, ulcers on tongue, vomiting, cough, chest pain",
    "high_confidence": [
      "Gastritis",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Esophagitis"
    ],
    "low_confidence": [
      "Pneumonia",
      "Myocardial Infarction"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0011",
    "raw_symptoms": "stomach pain, ulcers on tongue, vomiting, cough, chest pain",
    "high_confidence": [
      "Gastroenteritis",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Pneumonia",
      "Myocardial Infarction"
    ],
    "low_confidence": [
      "Esophagitis",
      "Tuberculosis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0012",
    "raw_symptoms": "stomach pain, acidity, vomiting, cough, chest pain",
    "high_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Pneumonia",
      "Myocardial Infarction (Heart Attack)"
    ],
    "low_confidence": [
      "Esophageal Spasm",
      "Acute Bronchitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0013",
    "raw_symptoms": "stomach pain, acidity, ulcers on tongue, cough, chest pain",
    "high_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Asthma",
      "Angina"
    ],
    "low_confidence": [
      "Pneumonia",
      "Esophageal Spasm"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0014",
    "raw_symptoms": "stomach pain, acidity, ulcers on tongue, vomiting, chest pain",
    "high_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Gastritis",
      "Esophagitis"
    ],
    "low_confidence": [
      "Irritable Bowel Syndrome (IBS)",
      "Functional Dyspepsia"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0015",
    "raw_symptoms": "stomach pain, acidity, ulcers on tongue, vomiting, cough",
    "high_confidence": [
      "Gastritis",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Viral Gastroenteritis"
    ],
    "low_confidence": [
      "Esophagitis",
      "Irritable Bowel Syndrome (IBS)"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0016",
    "raw_symptoms": "acidity, ulcers on tongue, vomiting, cough, chest pain",
    "high_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Peptic Ulcer Disease"
    ],
    "medium_confidence": [
      "Esophageal Spasm",
      "Achalasia"
    ],
    "low_confidence": [
      "Pneumonia",
      "Angina Pectoris"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0017",
    "raw_symptoms": "itching, vomiting, yellowish skin, loss of appetite, abdominal pain, nausea",
    "high_confidence": [
      "jaundice",
      "cholangitis"
    ],
    "medium_confidence": [
      "pancreatitis",
      "hepatitis"
    ],
    "low_confidence": [
      "gallstones",
      "liver cancer"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0018",
    "raw_symptoms": "vomiting, yellowish skin, loss of appetite, abdominal pain, nausea",
    "high_confidence": [
      "cholangitis",
      "jaundice"
    ],
    "medium_confidence": [
      "gallstones",
      "hepatitis"
    ],
    "low_confidence": [
      "pancreatitis",
      "liver cancer"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0019",
    "raw_symptoms": "itching, yellowish skin, loss of appetite, abdominal pain, nausea",
    "high_confidence": [
      "jaundice",
      "cholangitis"
    ],
    "medium_confidence": [
      "pancreatitis",
      "liver cancer"
    ],
    "low_confidence": [
      "gallstones",
      "hepatitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0020",
    "raw_symptoms": "itching, vomiting, loss of appetite, abdominal pain, nausea",
    "high_confidence": [
      "Gastroenteritis",
      "Irritable Bowel Syndrome (IBS)"
    ],
    "medium_confidence": [
      "Food Poisoning",
      "Inflammatory Bowel Disease (IBD)"
    ],
    "low_confidence": [
      "Allergic Reaction",
      "Viral Gastroenteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0021",
    "raw_symptoms": "itching, vomiting, yellowish skin, loss of appetite, abdominal pain",
    "high_confidence": [
      "jaundice",
      "cholangitis"
    ],
    "medium_confidence": [
      "pancreatitis",
      "hepatitis"
    ],
    "low_confidence": [
      "gallstones",
      "liver cancer"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0022",
    "raw_symptoms": "itching, vomiting, yellowish skin, abdominal pain, nausea",
    "high_confidence": [
      "Cholestasis",
      "Hepatitis"
    ],
    "medium_confidence": [
      "Liver Cancer",
      "Gallstones"
    ],
    "low_confidence": [
      "Cirrhosis",
      "Drug-Induced Liver Injury"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0023",
    "raw_symptoms": "itching, vomiting, yellowish skin, loss of appetite, nausea",
    "high_confidence": [
      "jaundice",
      "cholangitis"
    ],
    "medium_confidence": [
      "hepatic encephalopathy",
      "liver cancer"
    ],
    "low_confidence": [
      "gallstones",
      "viral hepatitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0024",
    "raw_symptoms": "itching, skin rash, stomach pain, burning micturition, spotting urination",
    "high_confidence": [
      "Urinary Tract Infection (UTI)",
      "Interstitial Cystitis"
    ],
    "medium_confidence": [
      "Eczema",
      "Allergic Reaction"
    ],
    "low_confidence": [
      "Irritable Bowel Syndrome (IBS)",
      "Sexually Transmitted Infection (STI)"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0025",
    "raw_symptoms": "itching, stomach pain, burning micturition, spotting urination",
    "high_confidence": [
      "Urinary Tract Infection (UTI)",
      "Interstitial Cystitis"
    ],
    "medium_confidence": [
      "Vaginitis",
      "Vulvodynia"
    ],
    "low_confidence": [
      "Genital Herpes",
      "Sexually Transmitted Infection (STI)"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0026",
    "raw_symptoms": "itching, skin rash, burning micturition, spotting urination",
    "high_confidence": [
      "Urinary tract infection",
      "Interstitial cystitis"
    ],
    "medium_confidence": [
      "Vaginitis",
      "Eczema"
    ],
    "low_confidence": [
      "Contact dermatitis",
      "Allergic reaction"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0027",
    "raw_symptoms": "itching, skin rash, stomach pain, spotting urination",
    "high_confidence": [
      "Urinary Tract Infection",
      "Allergic Reaction"
    ],
    "medium_confidence": [
      "Inflammatory Bowel Disease",
      "Skin Infection"
    ],
    "low_confidence": [
      "Kidney Stones",
      "Viral Gastroenteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0028",
    "raw_symptoms": "itching, skin rash, stomach pain, burning micturition",
    "high_confidence": [
      "Allergic Reaction",
      "Urinary Tract Infection"
    ],
    "medium_confidence": [
      "Irritable Bowel Syndrome",
      "Eczema"
    ],
    "low_confidence": [
      "Interstitial Cystitis",
      "Gastroenteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0029",
    "raw_symptoms": "skin rash, stomach pain, burning micturition, spotting urination",
    "high_confidence": [
      "Urinary Tract Infection",
      "Interstitial Cystitis"
    ],
    "medium_confidence": [
      "Vaginitis",
      "Sexually Transmitted Infection (STI)"
    ],
    "low_confidence": [
      "Allergic Reaction",
      "Kidney Stones"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0030",
    "raw_symptoms": "itching, vomiting, loss of appetite, abdominal pain",
    "high_confidence": [
      "Gastroenteritis",
      "Irritable Bowel Syndrome (IBS)"
    ],
    "medium_confidence": [
      "Food Poisoning",
      "Inflammatory Bowel Disease (IBD)"
    ],
    "low_confidence": [
      "Allergic Reaction",
      "Viral Gastroenteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0031",
    "raw_symptoms": "itching, vomiting, abdominal pain",
    "high_confidence": [
      "Gastroenteritis",
      "Irritable Bowel Syndrome (IBS)"
    ],
    "medium_confidence": [
      "Allergic Reaction",
      "Food Poisoning"
    ],
    "low_confidence": [
      "Inflammatory Bowel Disease (IBD)",
      "Viral Gastroenteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0032",
    "raw_symptoms": "itching, loss of appetite, abdominal pain",
    "high_confidence": [
      "Gastroenteritis",
      "Irritable Bowel Syndrome (IBS)"
    ],
    "medium_confidence": [
      "Celiac Disease",
      "Inflammatory Bowel Disease (IBD)"
    ],
    "low_confidence": [
      "Liver Disease",
      "Pancreatitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0033",
    "raw_symptoms": "itching, vomiting, loss of appetite",
    "high_confidence": [
      "Gastroenteritis",
      "Allergic Reaction"
    ],
    "medium_confidence": [
      "Liver Disease",
      "Pancreatitis"
    ],
    "low_confidence": [
      "Food Poisoning",
      "Viral Infection"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0034",
    "raw_symptoms": "vomiting, loss of appetite, abdominal pain",
    "high_confidence": [
      "Gastroenteritis",
      "Irritable Bowel Syndrome (IBS)"
    ],
    "medium_confidence": [
      "Gastritis",
      "Peptic Ulcer Disease"
    ],
    "low_confidence": [
      "Inflammatory Bowel Disease (IBD)",
      "Food Poisoning"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0035",
    "raw_symptoms": "high fever",
    "high_confidence": [
      "Influenza",
      "COVID-19"
    ],
    "medium_confidence": [
      "Bacterial Infection",
      "Viral Infection"
    ],
    "low_confidence": [
      "Meningitis",
      "Sepsis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0036",
    "raw_symptoms": "fatigue, weight loss, blurred and distorted vision, lethargy, restlessness",
    "high_confidence": [
      "Graves' Disease",
      "Cushing's Syndrome"
    ],
    "medium_confidence": [
      "Thyroid Eye Disease",
      "Multiple Sclerosis"
    ],
    "low_confidence": [
      "Autoimmune Encephalitis",
      "Giant Cell Arteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0037",
    "raw_symptoms": "weight loss, blurred and distorted vision, lethargy, restlessness",
    "high_confidence": [
      "Thyroid Disease",
      "Depression"
    ],
    "medium_confidence": [
      "Anxiety",
      "Vitamin Deficiencies"
    ],
    "low_confidence": [
      "Diabetes",
      "Autoimmune Disease"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0038",
    "raw_symptoms": "fatigue, blurred and distorted vision, lethargy, restlessness",
    "high_confidence": [
      "Migraine",
      "Tension Headache"
    ],
    "medium_confidence": [
      "Cluster Headache",
      "Hypertension"
    ],
    "low_confidence": [
      "Anxiety",
      "Depression"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0039",
    "raw_symptoms": "fatigue, weight loss, blurred and distorted vision, lethargy",
    "high_confidence": [
      "Graves' disease",
      "Cushing's syndrome"
    ],
    "medium_confidence": [
      "Hyperthyroidism",
      "Multiple sclerosis"
    ],
    "low_confidence": [
      "Autoimmune thyroiditis",
      "Myasthenia gravis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0040",
    "raw_symptoms": "fatigue, weight loss, blurred and distorted vision, restlessness",
    "high_confidence": [
      "Graves' disease",
      "Cushing's syndrome"
    ],
    "medium_confidence": [
      "Hyperthyroidism",
      "Multiple sclerosis"
    ],
    "low_confidence": [
      "Parkinson's disease",
      "Migraine"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0041",
    "raw_symptoms": "fatigue, weight loss, lethargy, restlessness",
    "high_confidence": [
      "Anemia",
      "Hyperthyroidism"
    ],
    "medium_confidence": [
      "Depression",
      "Diabetes Mellitus"
    ],
    "low_confidence": [
      "Cancer",
      "Chronic Fatigue Syndrome"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0042",
    "raw_symptoms": "vomiting, diarrhoea",
    "high_confidence": [
      "Viral Gastroenteritis",
      "Bacterial Gastroenteritis"
    ],
    "medium_confidence": [
      "Food Poisoning",
      "Inflammatory Bowel Disease (IBD)"
    ],
    "low_confidence": [
      "Irritable Bowel Syndrome (IBS)",
      "Medication Side Effects"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0043",
    "raw_symptoms": "diarrhoea",
    "high_confidence": [
      "Diarrhea",
      "Infection"
    ],
    "medium_confidence": [
      "Inflammatory Bowel Disease",
      "Food Poisoning"
    ],
    "low_confidence": [
      "Parasitic Infection",
      "Medication Side Effect"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0044",
    "raw_symptoms": "vomiting",
    "high_confidence": [
      "Gastroenteritis",
      "Food poisoning"
    ],
    "medium_confidence": [
      "Viral infection",
      "Medication side effect"
    ],
    "low_confidence": [
      "Migraine",
      "Motion sickness"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0045",
    "raw_symptoms": "cough, fatigue, high fever, breathlessness",
    "high_confidence": [
      "Pneumonia",
      "Influenza"
    ],
    "medium_confidence": [
      "COVID-19",
      "Bronchitis"
    ],
    "low_confidence": [
      "Tuberculosis",
      "Acute Respiratory Distress Syndrome (ARDS)"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0046",
    "raw_symptoms": "cough, high fever, breathlessness",
    "high_confidence": [
      "pneumonia",
      "influenza"
    ],
    "medium_confidence": [
      "COVID-19",
      "bronchitis"
    ],
    "low_confidence": [
      "acute respiratory distress syndrome (ARDS)",
      "myocardial infarction"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0047",
    "raw_symptoms": "fatigue, high fever, breathlessness",
    "high_confidence": [
      "Pneumonia",
      "Influenza"
    ],
    "medium_confidence": [
      "COVID-19",
      "Myocarditis"
    ],
    "low_confidence": [
      "Pulmonary Embolism",
      "Acute Respiratory Distress Syndrome (ARDS)"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0048",
    "raw_symptoms": "cough, fatigue, breathlessness",
    "high_confidence": [
      "Pneumonia",
      "Bronchitis"
    ],
    "medium_confidence": [
      "Asthma",
      "Chronic Obstructive Pulmonary Disease (COPD)"
    ],
    "low_confidence": [
      "Tuberculosis",
      "Heart Failure"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0049",
    "raw_symptoms": "cough, fatigue, high fever",
    "high_confidence": [
      "Influenza",
      "COVID-19"
    ],
    "medium_confidence": [
      "Pneumonia",
      "Bronchitis"
    ],
    "low_confidence": [
      "Tuberculosis",
      "Mononucleosis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0050",
    "raw_symptoms": "chest pain, headache, loss of balance, dizziness",
    "high_confidence": [
      "Stroke",
      "Migraine"
    ],
    "medium_confidence": [
      "Vertigo",
      "Arrhythmia"
    ],
    "low_confidence": [
      "Hypertension",
      "Anxiety Disorder"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0051",
    "raw_symptoms": "chest pain, loss of balance, dizziness",
    "high_confidence": [
      "Atrial fibrillation",
      "Stroke"
    ],
    "medium_confidence": [
      "Arrhythmia",
      "Heart failure"
    ],
    "low_confidence": [
      "Orthostatic hypotension",
      "M\u00c3\u00a9ni\u00c3\u00a8re's disease"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0052",
    "raw_symptoms": "headache, loss of balance, dizziness",
    "high_confidence": [
      "Vertigo",
      "Meniere's Disease"
    ],
    "medium_confidence": [
      "Migraine",
      "Stroke"
    ],
    "low_confidence": [
      "Multiple Sclerosis",
      "Anxiety Disorder"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0053",
    "raw_symptoms": "chest pain, headache, loss of balance",
    "high_confidence": [
      "Stroke",
      "Heart Attack"
    ],
    "medium_confidence": [
      "Migraine",
      "Vertigo"
    ],
    "low_confidence": [
      "Meningitis",
      "Tension Headache"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0054",
    "raw_symptoms": "chest pain, headache, dizziness",
    "high_confidence": [
      "Angina",
      "Migraine"
    ],
    "medium_confidence": [
      "Stroke",
      "Hypertension"
    ],
    "low_confidence": [
      "Anxiety",
      "Tension Headache"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0055",
    "raw_symptoms": "acidity, headache, blurred and distorted vision",
    "high_confidence": [
      "Migraine",
      "Cluster Headache"
    ],
    "medium_confidence": [
      "Glaucoma",
      "Retinitis Pigmentosa"
    ],
    "low_confidence": [
      "Optic Neuritis",
      "Giant Cell Arteritis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0056",
    "raw_symptoms": "headache, blurred and distorted vision",
    "high_confidence": [
      "Migraine",
      "Glaucoma"
    ],
    "medium_confidence": [
      "Retinitis Pigmentosa",
      "Optic Neuritis"
    ],
    "low_confidence": [
      "Giant Cell Arteritis",
      "Stroke"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0057",
    "raw_symptoms": "acidity, blurred and distorted vision",
    "high_confidence": [
      "Glaucoma",
      "Cataracts"
    ],
    "medium_confidence": [
      "Migraine",
      "Hypertension"
    ],
    "low_confidence": [
      "Diabetes",
      "Anxiety"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0058",
    "raw_symptoms": "acidity, headache",
    "high_confidence": [
      "Gastroesophageal Reflux Disease (GERD)",
      "Migraine"
    ],
    "medium_confidence": [
      "Tension Headache",
      "Stress-Related Headache"
    ],
    "low_confidence": [
      "Medication-Overuse Headache",
      "Sinusitis"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0059",
    "raw_symptoms": "loss of balance, dizziness, neck pain, back pain, weakness in limbs",
    "high_confidence": [
      "Multiple Sclerosis",
      "Cervical Spondylosis"
    ],
    "medium_confidence": [
      "Stroke",
      "Meniere's Disease"
    ],
    "low_confidence": [
      "Vestibular Neuritis",
      "Parkinson's Disease"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  },
  {
    "id": "V2_ENC_0060",
    "raw_symptoms": "loss of balance, dizziness, neck pain, weakness in limbs",
    "high_confidence": [
      "Vestibular Neuritis",
      "Multiple Sclerosis"
    ],
    "medium_confidence": [
      "Cervical Spondylosis",
      "Stroke"
    ],
    "low_confidence": [
      "Meniere's Disease",
      "Parkinson's Disease"
    ],
    "raw_dialogue_json": "{\"messages\": [{\"role\": \"system\", \"content\": \"Analyze symptoms and suggest possible medical conditions grouped by confidence levels using concise and informative..."
  }
]
  },
  "MedP_AI_V1.5": {
    modelId: "MedP_AI_V1.5",
    modelName: "MediPath AI Model 1.5 (Calibrated Linear SGD)",
    filename: "Updated01_HealthPath_Symptom_Training_Dataset.xlsx",
    downloadUrl: "/datasets/Updated01_HealthPath_Symptom_Training_Dataset.xlsx",
    fileSize: "1.59 MB",
    totalRecords: 85420,
    classesCount: 53,
    featuresCount: 12362,
    format: "Tabular Structured Patient Encounters (20 Columns)",
    splittingProtocol: "Standard Stratified Shuffle Split (80% Train, 20% Test)",
    provenanceDescription: "Extended n-gram feature vocabulary with severity ratings, duration tags, and calibrated probability outputs across 53 clinical conditions.",
    records: [
  {
    "sample_id": "S000001",
    "user_text": "acne scars and blackheads",
    "symptoms_present": "acne scars; blackheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000002",
    "user_text": "acne scars and painful facial bumps",
    "symptoms_present": "acne scars; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000003",
    "user_text": "acne scars and recurrent pimples",
    "symptoms_present": "acne scars; recurrent pimples",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000004",
    "user_text": "acne scars, also oily skin",
    "symptoms_present": "acne scars; oily skin",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000005",
    "user_text": "Acne Vulgaris care in Agra",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000006",
    "user_text": "Acne Vulgaris care in Aizawl",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000007",
    "user_text": "Acne Vulgaris care in Allahabad",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000008",
    "user_text": "Acne Vulgaris care in Azamgarh",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000009",
    "user_text": "Acne Vulgaris care in Berhamapur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000010",
    "user_text": "Acne Vulgaris care in Chittorgarh please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000011",
    "user_text": "Acne Vulgaris care in Coimbatore",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000012",
    "user_text": "Acne Vulgaris care in Cuttack",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000013",
    "user_text": "Acne Vulgaris care in Davangere",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000014",
    "user_text": "Acne Vulgaris care in Dhule",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000015",
    "user_text": "Acne Vulgaris care in Gurdaspur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000016",
    "user_text": "Acne Vulgaris care in Hissar",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000017",
    "user_text": "Acne Vulgaris care in Hosur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000018",
    "user_text": "Acne Vulgaris care in Hosur please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000019",
    "user_text": "Acne Vulgaris care in Hubballi",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000020",
    "user_text": "Acne Vulgaris care in Jagatsinghapur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000021",
    "user_text": "Acne Vulgaris care in Khammam",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000022",
    "user_text": "Acne Vulgaris care in Kohima",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000023",
    "user_text": "Acne Vulgaris care in Kolhapur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000024",
    "user_text": "Acne Vulgaris care in Kozhikode",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000025",
    "user_text": "Acne Vulgaris care in Kumarakom",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000026",
    "user_text": "Acne Vulgaris care in Kutch",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000027",
    "user_text": "Acne Vulgaris care in Meerut",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000028",
    "user_text": "Acne Vulgaris care in Muktsar",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000029",
    "user_text": "Acne Vulgaris care in Nashik",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000030",
    "user_text": "Acne Vulgaris care in Noida",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000031",
    "user_text": "Acne Vulgaris care in Panchkula",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000032",
    "user_text": "Acne Vulgaris care in Pasighat",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000033",
    "user_text": "Acne Vulgaris care in Porbandar",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000034",
    "user_text": "Acne Vulgaris care in Ratlam",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000035",
    "user_text": "Acne Vulgaris care in Rohtak",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000036",
    "user_text": "Acne Vulgaris care in Thrissur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000037",
    "user_text": "Acne Vulgaris care in Varanasi please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000038",
    "user_text": "Acne Vulgaris care in Wayanad",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000039",
    "user_text": "Acne Vulgaris specialist near me",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000040",
    "user_text": "Acne Vulgaris specialist near me please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000041",
    "user_text": "baar baar pimples; saath mein blackheads hain aur face par painful bumps.",
    "symptoms_present": "baar baar pimples; blackheads hain; face par painful bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000042",
    "user_text": "blackheads and whiteheads",
    "symptoms_present": "blackheads; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000043",
    "user_text": "blackheads hain; saath mein baar baar pimples aur whiteheads hain.",
    "symptoms_present": "blackheads hain; baar baar pimples; whiteheads hain",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000044",
    "user_text": "blackheads with recurrent pimples; painful facial bumps started since yesterday.",
    "symptoms_present": "blackheads; recurrent pimples; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000045",
    "user_text": "blackheads with recurrent pimples; whiteheads started on and off for a month.",
    "symptoms_present": "blackheads; recurrent pimples; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000046",
    "user_text": "blackheads, also painful facial bumps",
    "symptoms_present": "blackheads; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000047",
    "user_text": "blackheads; acne scars; which hospital?",
    "symptoms_present": "blackheads; acne scars",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000048",
    "user_text": "blackheads; oily skin; which hospital?",
    "symptoms_present": "blackheads; oily skin",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000049",
    "user_text": "blackheads; painful facial bumps; which hospital?",
    "symptoms_present": "blackheads; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000050",
    "user_text": "blackheads; whiteheads; which hospital?",
    "symptoms_present": "blackheads; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000051",
    "user_text": "blakcheads with recurrent pimples; acne scars started for three days",
    "symptoms_present": "blackheads; recurrent pimples; acne scars",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000052",
    "user_text": "Can you sugegst the right hospital? painful facial bumps, oily skin, and recurrent pimples for three days",
    "symptoms_present": "painful facial bumps; oily skin; recurrent pimples",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000053",
    "user_text": "Can you suggest the right hospiatl? painful facial bumps, oily skin, and whiteheads for two weeks",
    "symptoms_present": "painful facial bumps; oily skin; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000054",
    "user_text": "Can you suggest the right hospital? acne scars, painful facial bumps, and oily skin since yesterday.",
    "symptoms_present": "acne scars; painful facial bumps; oily skin",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000055",
    "user_text": "Can you suggest the right hospital? blackheads, oily skin, and whiteheads since last night.",
    "symptoms_present": "blackheads; oily skin; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000056",
    "user_text": "Can you suggest the right hospital? blackheads, whiteheads, and painful facial bumps on and off for a month.",
    "symptoms_present": "blackheads; whiteheads; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000057",
    "user_text": "Can you suggest the right hospital? oily skin, blackheads, and recurrent pimples for about a week.",
    "symptoms_present": "oily skin; blackheads; recurrent pimples",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000058",
    "user_text": "Can you suggest the right hospital? oily skin, recurrent pimples, and acne scars since yesterday.",
    "symptoms_present": "oily skin; recurrent pimples; acne scars",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000059",
    "user_text": "Can you suggest the right hospital? oily skin, recurrent pimples, and blackheads since last night.",
    "symptoms_present": "oily skin; recurrent pimples; blackheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000060",
    "user_text": "Can you suggest the right hospital? oily skin, whiteheads, and blackheads for about a week.",
    "symptoms_present": "oily skin; whiteheads; blackheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  }
]
  },
  "MedP_AI_V1.0": {
    modelId: "MedP_AI_V1.0",
    modelName: "MediPath AI Model 1.0 (Multinomial Softmax Baseline)",
    filename: "HealthPath_Symptom_Training_Dataset.xlsx",
    downloadUrl: "/datasets/HealthPath_Symptom_Training_Dataset.xlsx",
    fileSize: "1.59 MB",
    totalRecords: 85420,
    classesCount: 53,
    featuresCount: 7046,
    format: "Tabular Structured Patient Encounters (20 Columns)",
    splittingProtocol: "Random Stratified K-Fold Split (80% Train, 20% Test)",
    provenanceDescription: "Baseline single-label symptom text corpus mapped to 53 ICD-10 medical conditions trained using multinomial logistic regression.",
    records: [
  {
    "sample_id": "S000001",
    "user_text": "acne scars and blackheads",
    "symptoms_present": "acne scars; blackheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000002",
    "user_text": "acne scars and painful facial bumps",
    "symptoms_present": "acne scars; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000003",
    "user_text": "acne scars and recurrent pimples",
    "symptoms_present": "acne scars; recurrent pimples",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000004",
    "user_text": "acne scars, also oily skin",
    "symptoms_present": "acne scars; oily skin",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000005",
    "user_text": "Acne Vulgaris care in Agra",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000006",
    "user_text": "Acne Vulgaris care in Aizawl",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000007",
    "user_text": "Acne Vulgaris care in Allahabad",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000008",
    "user_text": "Acne Vulgaris care in Azamgarh",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000009",
    "user_text": "Acne Vulgaris care in Berhamapur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000010",
    "user_text": "Acne Vulgaris care in Chittorgarh please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000011",
    "user_text": "Acne Vulgaris care in Coimbatore",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000012",
    "user_text": "Acne Vulgaris care in Cuttack",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000013",
    "user_text": "Acne Vulgaris care in Davangere",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000014",
    "user_text": "Acne Vulgaris care in Dhule",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000015",
    "user_text": "Acne Vulgaris care in Gurdaspur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000016",
    "user_text": "Acne Vulgaris care in Hissar",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000017",
    "user_text": "Acne Vulgaris care in Hosur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000018",
    "user_text": "Acne Vulgaris care in Hosur please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000019",
    "user_text": "Acne Vulgaris care in Hubballi",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000020",
    "user_text": "Acne Vulgaris care in Jagatsinghapur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000021",
    "user_text": "Acne Vulgaris care in Khammam",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000022",
    "user_text": "Acne Vulgaris care in Kohima",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000023",
    "user_text": "Acne Vulgaris care in Kolhapur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000024",
    "user_text": "Acne Vulgaris care in Kozhikode",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000025",
    "user_text": "Acne Vulgaris care in Kumarakom",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000026",
    "user_text": "Acne Vulgaris care in Kutch",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000027",
    "user_text": "Acne Vulgaris care in Meerut",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000028",
    "user_text": "Acne Vulgaris care in Muktsar",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000029",
    "user_text": "Acne Vulgaris care in Nashik",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000030",
    "user_text": "Acne Vulgaris care in Noida",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000031",
    "user_text": "Acne Vulgaris care in Panchkula",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000032",
    "user_text": "Acne Vulgaris care in Pasighat",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000033",
    "user_text": "Acne Vulgaris care in Porbandar",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000034",
    "user_text": "Acne Vulgaris care in Ratlam",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "validation"
  },
  {
    "sample_id": "S000035",
    "user_text": "Acne Vulgaris care in Rohtak",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000036",
    "user_text": "Acne Vulgaris care in Thrissur",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000037",
    "user_text": "Acne Vulgaris care in Varanasi please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000038",
    "user_text": "Acne Vulgaris care in Wayanad",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000039",
    "user_text": "Acne Vulgaris specialist near me",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000040",
    "user_text": "Acne Vulgaris specialist near me please",
    "symptoms_present": "nan",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000041",
    "user_text": "baar baar pimples; saath mein blackheads hain aur face par painful bumps.",
    "symptoms_present": "baar baar pimples; blackheads hain; face par painful bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000042",
    "user_text": "blackheads and whiteheads",
    "symptoms_present": "blackheads; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000043",
    "user_text": "blackheads hain; saath mein baar baar pimples aur whiteheads hain.",
    "symptoms_present": "blackheads hain; baar baar pimples; whiteheads hain",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000044",
    "user_text": "blackheads with recurrent pimples; painful facial bumps started since yesterday.",
    "symptoms_present": "blackheads; recurrent pimples; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000045",
    "user_text": "blackheads with recurrent pimples; whiteheads started on and off for a month.",
    "symptoms_present": "blackheads; recurrent pimples; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000046",
    "user_text": "blackheads, also painful facial bumps",
    "symptoms_present": "blackheads; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000047",
    "user_text": "blackheads; acne scars; which hospital?",
    "symptoms_present": "blackheads; acne scars",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000048",
    "user_text": "blackheads; oily skin; which hospital?",
    "symptoms_present": "blackheads; oily skin",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000049",
    "user_text": "blackheads; painful facial bumps; which hospital?",
    "symptoms_present": "blackheads; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "test"
  },
  {
    "sample_id": "S000050",
    "user_text": "blackheads; whiteheads; which hospital?",
    "symptoms_present": "blackheads; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000051",
    "user_text": "blakcheads with recurrent pimples; acne scars started for three days",
    "symptoms_present": "blackheads; recurrent pimples; acne scars",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000052",
    "user_text": "Can you sugegst the right hospital? painful facial bumps, oily skin, and recurrent pimples for three days",
    "symptoms_present": "painful facial bumps; oily skin; recurrent pimples",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000053",
    "user_text": "Can you suggest the right hospiatl? painful facial bumps, oily skin, and whiteheads for two weeks",
    "symptoms_present": "painful facial bumps; oily skin; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000054",
    "user_text": "Can you suggest the right hospital? acne scars, painful facial bumps, and oily skin since yesterday.",
    "symptoms_present": "acne scars; painful facial bumps; oily skin",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000055",
    "user_text": "Can you suggest the right hospital? blackheads, oily skin, and whiteheads since last night.",
    "symptoms_present": "blackheads; oily skin; whiteheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000056",
    "user_text": "Can you suggest the right hospital? blackheads, whiteheads, and painful facial bumps on and off for a month.",
    "symptoms_present": "blackheads; whiteheads; painful facial bumps",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000057",
    "user_text": "Can you suggest the right hospital? oily skin, blackheads, and recurrent pimples for about a week.",
    "symptoms_present": "oily skin; blackheads; recurrent pimples",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000058",
    "user_text": "Can you suggest the right hospital? oily skin, recurrent pimples, and acne scars since yesterday.",
    "symptoms_present": "oily skin; recurrent pimples; acne scars",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000059",
    "user_text": "Can you suggest the right hospital? oily skin, recurrent pimples, and blackheads since last night.",
    "symptoms_present": "oily skin; recurrent pimples; blackheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  },
  {
    "sample_id": "S000060",
    "user_text": "Can you suggest the right hospital? oily skin, whiteheads, and blackheads for about a week.",
    "symptoms_present": "oily skin; whiteheads; blackheads",
    "condition_id": "acne",
    "condition_name": "Acne Vulgaris",
    "icd10": "L70.9",
    "specialization": "Dermatology",
    "procedure": "skin treatments",
    "urgency": "routine",
    "split": "train"
  }
]
  }
};
