import json
import re
import pandas as pd

# 1. Process symptom-based-disease-prediction-v2.xlsx for V2.0
df_v2 = pd.read_excel('Datasets/symptom-based-disease-prediction-v2.xlsx', nrows=60)
v2_records = []
col_v2 = df_v2.columns[0]
for idx, row in df_v2.iterrows():
    raw_str = str(row[col_v2])
    try:
        obj = json.loads(raw_str)
        messages = obj.get('messages', [])
        user_msg = next((m['content'] for m in messages if m.get('role') == 'user'), '')
        asst_msg = next((m['content'] for m in messages if m.get('role') == 'assistant'), '')
        
        sym_match = re.search(r'Symptoms:\s*(.*)', user_msg, re.IGNORECASE)
        symptoms = sym_match.group(1).strip() if sym_match else user_msg
        
        high_m = re.search(r'high_confidence:\s*([^;]+)', asst_msg)
        med_m = re.search(r'medium_confidence:\s*([^;]+)', asst_msg)
        low_m = re.search(r'low_confidence:\s*([^;]+)', asst_msg)
        
        v2_records.append({
            'id': f'V2_ENC_{idx+1:04d}',
            'raw_symptoms': symptoms,
            'high_confidence': [s.strip() for s in high_m.group(1).split(',')] if high_m else [],
            'medium_confidence': [s.strip() for s in med_m.group(1).split(',')] if med_m else [],
            'low_confidence': [s.strip() for s in low_m.group(1).split(',')] if low_m else [],
            'raw_dialogue_json': raw_str[:160] + '...'
        })
    except Exception:
        continue

# 2. Process Updated01_HealthPath_Symptom_Training_Dataset.xlsx for V1.5
df_v15 = pd.read_excel('Datasets/Updated01_HealthPath_Symptom_Training_Dataset.xlsx', nrows=60)
v15_records = []
for idx, row in df_v15.iterrows():
    v15_records.append({
        'sample_id': str(row.get('sample_id', f'V15_{idx+1}')),
        'user_text': str(row.get('user_text', '')),
        'symptoms_present': str(row.get('symptoms_present', '')),
        'condition_id': str(row.get('condition_id', '')),
        'condition_name': str(row.get('condition_name', '')),
        'icd10': str(row.get('icd10', '')),
        'specialization': str(row.get('primary_specialization', '')),
        'procedure': str(row.get('recommended_procedure', '')),
        'urgency': str(row.get('urgency', '')),
        'split': str(row.get('recommended_split', 'train'))
    })

# 3. Process HealthPath_Symptom_Training_Dataset.xlsx for V1.0
df_v10 = pd.read_excel('Datasets/HealthPath_Symptom_Training_Dataset.xlsx', nrows=60)
v10_records = []
for idx, row in df_v10.iterrows():
    v10_records.append({
        'sample_id': str(row.get('sample_id', f'V10_{idx+1}')),
        'user_text': str(row.get('user_text', '')),
        'symptoms_present': str(row.get('symptoms_present', '')),
        'condition_id': str(row.get('condition_id', '')),
        'condition_name': str(row.get('condition_name', '')),
        'icd10': str(row.get('icd10', '')),
        'specialization': str(row.get('primary_specialization', '')),
        'procedure': str(row.get('recommended_procedure', '')),
        'urgency': str(row.get('urgency', '')),
        'split': str(row.get('recommended_split', 'train'))
    })

print(f"Extracted: V2={len(v2_records)}, V1.5={len(v15_records)}, V1.0={len(v10_records)}")

v2_json = json.dumps(v2_records, indent=2)
v15_json = json.dumps(v15_records, indent=2)
v10_json = json.dumps(v10_records, indent=2)

out_ts = f"""// Real training dataset preview records for MediPath AI models
export interface V2DatasetRecord {{
  id: string;
  raw_symptoms: string;
  high_confidence: string[];
  medium_confidence: string[];
  low_confidence: string[];
  raw_dialogue_json: string;
}}

export interface V1DatasetRecord {{
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
}}

export interface ModelDatasetMeta {{
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
}}

export const REAL_DATASETS_REGISTRY: Record<string, ModelDatasetMeta> = {{
  "_MedP_AI_V2.0": {{
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
    records: {v2_json}
  }},
  "MedP_AI_V1.5": {{
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
    records: {v15_json}
  }},
  "MedP_AI_V1.0": {{
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
    records: {v10_json}
  }}
}};
"""

with open('frontend/healthpath-ai-main/src/data/realDatasetsPreviewData.ts', 'w', encoding='utf-8') as f:
    f.write(out_ts)

print("SUCCESS: realDatasetsPreviewData.ts written!")
