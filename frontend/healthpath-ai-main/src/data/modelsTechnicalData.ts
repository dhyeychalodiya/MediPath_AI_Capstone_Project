export interface ModelSpec {
  id: string;
  name: string;
  versionTag: string;
  isProduction: boolean;
  algorithm: string;
  activation: string;
  classesCount: number;
  vocabSize: number;
  ngramRange: string;
  datasetSource: string;
  datasetRecords: string;
  datasetHash?: string;
  buildId: string;
  trainingDuration: string;
  servingLatency: string;
  servingRuntime: string;
  memoryFootprint: string;
  microF1: number;
  macroF1: number;
  weightedF1: number;
  top1HitRate: number;
  top3HitRate: number;
  top5HitRate: number;
  lrap: number;
  hammingLoss: number;
  brierScore: number;
  ece: number;
  exactMatchRatio: number;
  decisionThreshold: string;
  formula: string;
  overview: string;
  strengths: string[];
  limitations: string[];
  topPerformingClasses: { name: string; f1: number; support: number }[];
  weakestClasses: { name: string; f1: number; support: number }[];
  hyperparameters: Record<string, string | number>;
}

export const MODELS_TECHNICAL_DATA: Record<string, ModelSpec> = {
  "_MedP_AI_V2.0": {
    id: "_MedP_AI_V2.0",
    name: "MediPath AI Model 2.0 (Doctor AI Engine)",
    versionTag: "MedP_AI_V2.0 (Production)",
    isProduction: true,
    algorithm: "OneVsRest Logistic Regression with Independent Sigmoid Probabilities & Doctor AI Clinical Triage State Machine",
    activation: "Independent Binary Sigmoids: P(y_k = 1 | x) = 1 / (1 + exp(-z_k))",
    classesCount: 56,
    vocabSize: 3910,
    ngramRange: "Unigram & Bigram (1, 2) with Sublinear TF Scaling",
    datasetSource: "Datasets/symptom-based-disease-prediction-v2.xlsx",
    datasetRecords: "104,291 clean encounters (from 157,036 raw rows; 154,451 multi-label targets)",
    datasetHash: "850b3637421ebe8f097044ba35ac9e8c297851bd2b7f4a4b04d6ceafb97544a6",
    buildId: "MedP-AI-V2.0-20260917-120906",
    trainingDuration: "92.62 seconds (Complete Benchmark & Group Stratification Pipeline)",
    servingLatency: "< 12 ms per inference (In-Memory Node.js / Browser Sparse Dot Product)",
    servingRuntime: "Zero-Python In-Memory Linear Matrix Serving (Bit-level parity with Python training)",
    memoryFootprint: "5.08 MB (Exported Sparse Weight & Intercept JSON Matrix)",
    microF1: 0.7837,
    macroF1: 0.7199,
    weightedF1: 0.7959,
    top1HitRate: 0.8819,
    top3HitRate: 0.9903,
    top5HitRate: 0.9980,
    lrap: 0.9160,
    hammingLoss: 0.01329,
    brierScore: 0.01827,
    ece: 0.0282,
    exactMatchRatio: 0.4732,
    decisionThreshold: "Class-Specific Calibrated Thresholds: tau in [0.79, 0.85] (Mean: 0.85)",
    formula: "z_k = b_k + \\sum_{j \\in \\text{vocab}} w_{kj} \\cdot \\text{TFIDF}(x_j); \\quad P_k = \\sigma(z_k) = \\frac{1}{1 + e^{-z_k}}",
    overview: "State-of-the-art multi-label diagnostic navigation model. Rather than forcing a single softmax winner, it computes true independent marginal probabilities for each condition. Features interactive multi-turn triage, differing symptom penalty, real confidence change tracking, emergency override rules, and multilingual Indic translation.",
    strengths: [
      "Authentic multi-label learning across 56 primary-care conditions",
      "Interactive multi-turn clinical triage with discriminative symptom questioning",
      "Dynamic confidence tracking with penalization for contradictory/differing symptoms",
      "Safety rules for immediate emergency overrides (cardiac, stroke, anaphylaxis) and cancer screening guards",
      "Zero-Python pure microsecond Node.js serving with exact bit-level parity to Scikit-Learn (delta < 1e-15)",
      "Zero-leakage balanced group stratification across 101,137 symptom signatures"
    ],
    limitations: [
      "Limited to primary-care outpatient triage scope (excludes tertiary ICU-level diagnosis)",
      "Requires in-person clinical confirmation and physical examination"
    ],
    topPerformingClasses: [
      { name: "Depressive Symptoms", f1: 0.9394, support: 1192 },
      { name: "Osteoarthritis", f1: 0.9387, support: 1077 },
      { name: "Endometriosis", f1: 0.9038, support: 643 },
      { name: "Otitis Media", f1: 0.9016, support: 781 },
      { name: "Pneumonia", f1: 0.8983, support: 947 }
    ],
    weakestClasses: [
      { name: "Blepharitis", f1: 0.5620, support: 214 },
      { name: "Tension Headache", f1: 0.5164, support: 145 },
      { name: "Muscle Strain / Sprain", f1: 0.4386, support: 61 },
      { name: "Contact Dermatitis", f1: 0.3801, support: 126 },
      { name: "Vertigo / BPPV", f1: 0.3433, support: 62 }
    ],
    hyperparameters: {
      "Classifier": "LogisticRegression(solver='lbfgs', max_iter=1000)",
      "Multi-label Scheme": "OneVsRestClassifier",
      "Regularization C": 1.0,
      "Loss": "Binary Cross-Entropy / Log Loss per Class",
      "Vectorizer": "TfidfVectorizer(ngram_range=(1,2), sublinear_tf=True)",
      "Norm": "L2 Euclidean Normalization",
      "Vocabulary Features": 3910,
      "Threshold Optimizer": "F1-Score Maximization Grid on Validation Partition"
    }
  },
  "MedP_AI_V1.5": {
    id: "MedP_AI_V1.5",
    name: "MediPath AI Model 1.5 (Calibrated Linear SGD)",
    versionTag: "MedP_AI_V1.5 (Legacy)",
    isProduction: false,
    algorithm: "Calibrated Linear Classifier via Modified Huber / Stochastic Gradient Descent (SGD)",
    activation: "Calibrated Softmax Probability Distribution (Sum = 1.0)",
    classesCount: 53,
    vocabSize: 12362,
    ngramRange: "Unigram & Bigram (1, 2) Extended Vocabulary",
    datasetSource: "Datasets/Updated01_HealthPath_Symptom_Training_Dataset.xlsx",
    datasetRecords: "85,420 single-label records across 53 diseases",
    buildId: "MedP-AI-V1.5-20251104-093412",
    trainingDuration: "44.15 seconds",
    servingLatency: "< 8 ms per inference",
    servingRuntime: "Node.js In-Memory Weight Matrix Matrix Serving",
    memoryFootprint: "15.65 MB (JSON Weight Matrix)",
    microF1: 0.7721,
    macroF1: 0.7410,
    weightedF1: 0.7680,
    top1HitRate: 0.8515,
    top3HitRate: 0.9746,
    top5HitRate: 0.9921,
    lrap: 0.8911,
    hammingLoss: 0.01236,
    brierScore: 0.00908,
    ece: 0.0086,
    exactMatchRatio: 0.4925,
    decisionThreshold: "Static Confidence Threshold: 55%",
    formula: "z_k = \\mathbf{w}_k^T \\mathbf{x} + b_k; \\quad P_k = \\frac{\\exp(z_k / T)}{\\sum_j \\exp(z_j / T)} \\quad (\\text{Platt Temperature Scaled})",
    overview: "Fast calibrated linear classifier trained using stochastic gradient descent. Implements probability calibration via modified Huber loss. While offering rapid single-shot predictions, it lacks conversational triage questioning and multi-label concurrence.",
    strengths: [
      "Ultra-fast stochastic gradient descent training",
      "Calibrated probability outputs via temperature scaling",
      "Extensive vocabulary covering 12,362 n-grams",
      "High top-3 hit rate (97.5%) for direct query routing"
    ],
    limitations: [
      "Forced mutually-exclusive single prediction (sum of probabilities = 100%)",
      "No multi-turn conversational follow-up questions",
      "Does not detect differing symptoms or adjust confidence over conversational turns",
      "No emergency safety red-flag interceptors"
    ],
    topPerformingClasses: [
      { name: "Urinary Tract Infection", f1: 0.912, support: 820 },
      { name: "GERD", f1: 0.894, support: 790 },
      { name: "Migraine", f1: 0.887, support: 740 }
    ],
    weakestClasses: [
      { name: "Tension Headache", f1: 0.582, support: 130 },
      { name: "Allergic Rhinitis", f1: 0.564, support: 210 }
    ],
    hyperparameters: {
      "Classifier": "SGDClassifier(loss='log_loss', penalty='l2', alpha=1e-4)",
      "Calibration": "Platt Scaling / CalibratedClassifierCV",
      "Vectorizer": "TfidfVectorizer(ngram_range=(1,2), max_features=15000)",
      "Norm": "L2 Euclidean Normalization",
      "Vocabulary Features": 12362
    }
  },
  "MedP_AI_V1.0": {
    id: "MedP_AI_V1.0",
    name: "MediPath AI Model 1.0 (Baseline Logistic Softmax)",
    versionTag: "MedP_AI_V1.0 (Baseline)",
    isProduction: false,
    algorithm: "Standard Multinomial Logistic Regression with Softmax Normalization",
    activation: "Standard Softmax: P(y_k | x) = exp(z_k) / sum_j exp(z_j)",
    classesCount: 53,
    vocabSize: 7046,
    ngramRange: "Unigram & Bigram (1, 2) Standard",
    datasetSource: "Datasets/HealthPath_Symptom_Training_Dataset.xlsx",
    datasetRecords: "64,200 single-label records across 53 diseases",
    buildId: "MedP-AI-V1.0-20250612-140221",
    trainingDuration: "28.30 seconds",
    servingLatency: "< 14 ms per inference",
    servingRuntime: "Node.js In-Memory Weight Matrix Matrix Serving",
    memoryFootprint: "8.88 MB (JSON Weight Matrix)",
    microF1: 0.7092,
    macroF1: 0.6808,
    weightedF1: 0.7050,
    top1HitRate: 0.8240,
    top3HitRate: 0.9510,
    top5HitRate: 0.9820,
    lrap: 0.8750,
    hammingLoss: 0.0210,
    brierScore: 0.0215,
    ece: 0.0340,
    exactMatchRatio: 0.4120,
    decisionThreshold: "Static Confidence Threshold: 50%",
    formula: "z_k = \\mathbf{w}_k^T \\mathbf{x} + b_k; \\quad P(y = k \\mid \\mathbf{x}) = \\frac{\\exp(z_k)}{\\sum_{j=1}^K \\exp(z_j)}",
    overview: "The initial baseline classifier developed for MediPath AI. Uses multinomial logistic regression with softmax normalization. Serves as the historical benchmark against which V1.5 and V2.0 were engineered.",
    strengths: [
      "Simple, well-understood mathematical baseline",
      "Reliable single-shot symptom classifier for textbook symptom presentations",
      "Compact memory footprint (8.88 MB JSON matrix)"
    ],
    limitations: [
      "Prone to probability distortion when co-occurring symptoms exist",
      "Forces a single winner even when symptoms suggest overlapping etiologies",
      "No interactive clarification questions or multi-turn conversational support",
      "No differing symptom penalties or dynamic confidence scoring"
    ],
    topPerformingClasses: [
      { name: "Asthma", f1: 0.884, support: 610 },
      { name: "Pneumonia", f1: 0.871, support: 590 }
    ],
    weakestClasses: [
      { name: "Contact Dermatitis", f1: 0.490, support: 110 },
      { name: "Vertigo", f1: 0.445, support: 80 }
    ],
    hyperparameters: {
      "Classifier": "LogisticRegression(multi_class='multinomial', solver='lbfgs')",
      "Regularization C": 1.0,
      "Vectorizer": "TfidfVectorizer(ngram_range=(1,2), max_features=10000)",
      "Norm": "L2 Euclidean Normalization",
      "Vocabulary Features": 7046
    }
  }
};

export const DATASET_PROVENANCE_INFO = {
  v2Dataset: {
    filename: "symptom-based-disease-prediction-v2.xlsx",
    path: "Datasets/symptom-based-disease-prediction-v2.xlsx",
    sha256: "850b3637421ebe8f097044ba35ac9e8c297851bd2b7f4a4b04d6ceafb97544a6",
    rawRows: 157036,
    cleanRows: 104291,
    retainedPercentage: "66.41%",
    droppedRows: 52745,
    droppedPercentage: "33.59%",
    uniqueRawDiseaseStrings: 2647,
    canonicalClassesCovered: "56 / 56 (100.0%)",
    totalClassLabelInstances: 154451,
    unmappedDiseaseOccurrences: 113003,
    unmappedUniqueLabels: 2090,
    groupsCount: 101137,
    trainRecords: 72741,
    valRecords: 15786,
    testRecords: 15764,
    leakageMetric: "0 records (0.00% signature overlap across all splits)",
    minClassSupportVal: 60,
    minClassSupportTest: 61,
  },
  baselineDataset: {
    filename: "HealthPath_Symptom_Training_Dataset.xlsx",
    path: "Datasets/HealthPath_Symptom_Training_Dataset.xlsx",
    totalRecords: 64200,
    classesCovered: 53,
    type: "Single-label text classification format",
  },
  hospitalRegistry: {
    filename: "hospital.xlsx",
    path: "Datasets/hospital.xlsx",
    verifiedCount: 920,
    coverage: "Pan-India across major metropolitan and Tier-2 healthcare hubs",
    accreditations: "NABH, NABL, JCI, State Health Authority",
    tiersSupported: "Budget, Mid-Range, Premium Private & Super-Specialty",
  }
};

export const SAMPLE_DATASET_RECORDS = [
  {
    id: "ENC-10492",
    rawText: "Patient presents with intense burning sensation while urinating, sharp pelvic discomfort, and severe urge to pee frequently with cloudy urine.",
    normalizedTokens: ["burning urination", "painful urination", "pelvic discomfort", "frequent urination", "cloudy urine"],
    groundTruthTargets: ["Urinary Tract Infection / UTI"],
    split: "Train (Group Stratified)"
  },
  {
    id: "ENC-28419",
    rawText: "Sudden onset of crushing substernal chest discomfort with diaphoresis and radiating aching into left arm and jaw.",
    normalizedTokens: ["crushing chest pain", "sweating", "radiating to left arm", "jaw pain"],
    groundTruthTargets: ["Acute Coronary Syndrome / Suspected Heart Attack (Emergency Red-Flag Intercept)"],
    split: "Safety Test Benchmark"
  },
  {
    id: "ENC-39104",
    rawText: "Recurrent retrosternal heartburn occurring 30 minutes after heavy meals with acidic sour fluid coming up into mouth, aggravated by supine posture.",
    normalizedTokens: ["heartburn", "acid regurgitation", "sour taste in mouth", "worse lying flat"],
    groundTruthTargets: ["Gastroesophageal Reflux Disease / GERD"],
    split: "Validation Partition"
  },
  {
    id: "ENC-52840",
    rawText: "Bilateral itchy red eyes with swollen puffy eyelids, excessive lacrimation, and stringy clear discharge after pollen exposure.",
    normalizedTokens: ["itchy eyes", "redness in both eyes", "swollen eyelids", "lacrimation", "watery eyes"],
    groundTruthTargets: ["Allergic Conjunctivitis"],
    split: "Held-Out Test Partition"
  },
  {
    id: "ENC-78193",
    rawText: "Bilateral morning knee stiffness lasting 45 minutes, dull deep joint aching during stair climbing, with audible creaking noise.",
    normalizedTokens: ["knee pain", "morning stiffness", "joint aching", "crepitus", "stiffness stairs"],
    groundTruthTargets: ["Osteoarthritis"],
    split: "Held-Out Test Partition"
  }
];

export const UNMAPPED_CONDITIONS_TOP10 = [
  { rank: 1, name: "Heart Failure", occurrences: 4486, category: "Chronic / Tertiary Specialist Care", proposedAction: "Cardiology Specialist Outpatient / Tertiary Hospital Referral" },
  { rank: 2, name: "Fibromyalgia", occurrences: 3934, category: "Chronic / Tertiary Specialist Care", proposedAction: "Rheumatology Outpatient Clinical Workup" },
  { rank: 3, name: "Parkinson's disease", occurrences: 3614, category: "Chronic / Tertiary Specialist Care", proposedAction: "Neurology Specialist Clinical Evaluation" },
  { rank: 4, name: "Uveitis", occurrences: 3167, category: "Out of Scope / Specialized Ophthalmic", proposedAction: "Urgent Ophthalmology Slit-Lamp Examination" },
  { rank: 5, name: "Rheumatoid Arthritis", occurrences: 3000, category: "Chronic / Tertiary Specialist Care", proposedAction: "Rheumatology Autoimmune Screening & Referral" },
  { rank: 6, name: "Inflammatory Bowel Disease", occurrences: 2902, category: "Chronic / Tertiary Specialist Care", proposedAction: "Gastroenterology Endoscopy & Colonoscopy Workup" },
  { rank: 7, name: "Multiple Sclerosis", occurrences: 2866, category: "Chronic / Tertiary Specialist Care", proposedAction: "Neurology MRI Neuroaxis Specialist Evaluation" },
  { rank: 8, name: "Pericarditis", occurrences: 2820, category: "Out of Scope / Clinical Review", proposedAction: "General Physician / Cardiology Clinical Workup" },
  { rank: 9, name: "Pancreatitis", occurrences: 2812, category: "Surgical / Subspecialty Outpatient", proposedAction: "Gastroenterology / General Surgery Emergency Workup" },
  { rank: 10, name: "Spinal Stenosis", occurrences: 2780, category: "Out of Scope / Clinical Review", proposedAction: "Spine Specialist / Orthopedics MRI Workup" }
];

export const THREE_MODEL_COMPARISON_MATRIX = [
  {
    feature: "Architecture & Learning Paradigm",
    v1: "Multinomial Logistic Regression (Softmax)",
    v1_5: "Calibrated Linear SGD (Platt Scaled)",
    v2: "Independent Binary Sigmoids OvR + Doctor AI Clinical State Machine"
  },
  {
    feature: "Supported Canonical Classes",
    v1: "53 single-label classes",
    v1_5: "53 single-label classes",
    v2: "56 canonical primary-care classes (100% split coverage)"
  },
  {
    feature: "Output Probability Activation",
    v1: "Softmax distribution (sum = 1.0)",
    v1_5: "Temperature-scaled Softmax (sum = 1.0)",
    v2: "Independent marginal sigmoids: P(y_k=1|x) = 1/(1+e^-z_k)"
  },
  {
    feature: "Multi-Label Concurrence Support",
    v1: "No (forces single winner)",
    v1_5: "No (forces single winner)",
    v2: "Yes (genuine multi-label diagnosis & candidate pool)"
  },
  {
    feature: "Interactive Multi-Turn Triage Engine",
    v1: "No (one-shot static prediction only)",
    v1_5: "No (one-shot static prediction only)",
    v2: "Yes (multi-turn symptom accumulation until 1 candidate left)"
  },
  {
    feature: "Differing Symptom Penalty & Delta (+/-)",
    v1: "No (scores static or pegged)",
    v1_5: "No (scores static or pegged)",
    v2: "Yes (coherence penalty drops score when symptoms diverge; +/- delta tracked)"
  },
  {
    feature: "Multilingual Indic Keyboard & Translation",
    v1: "English only",
    v1_5: "English only",
    v2: "Real-time translation (Hindi, Gujarati, Hinglish, Gujlish & English)"
  },
  {
    feature: "Micro F1 Score (Validation / Test)",
    v1: "0.7092",
    v1_5: "0.7721",
    v2: "0.7837 (Test Set Benchmark)"
  },
  {
    feature: "Macro F1 Score (Validation / Test)",
    v1: "0.6808",
    v1_5: "0.7410",
    v2: "0.7199 (Test Set Benchmark)"
  },
  {
    feature: "Top-1 Hit Rate",
    v1: "82.40%",
    v1_5: "85.15%",
    v2: "88.19% (88.45% in validation)"
  },
  {
    feature: "Top-3 Hit Rate",
    v1: "95.10%",
    v1_5: "97.46%",
    v2: "99.03% (98.95% in validation)"
  },
  {
    feature: "Top-5 Hit Rate",
    v1: "98.20%",
    v1_5: "99.21%",
    v2: "99.80% (99.78% in validation)"
  },
  {
    feature: "Label Ranking Average Precision (LRAP)",
    v1: "0.8750",
    v1_5: "0.8911",
    v2: "0.9160"
  },
  {
    feature: "Brier Score / Calibration Error",
    v1: "Brier: 0.0215 / ECE: 0.034",
    v1_5: "Brier: 0.0091 / ECE: 0.0086",
    v2: "Brier: 0.0183 / ECE: 0.0282"
  },
  {
    feature: "Decision Threshold Optimization",
    v1: "Static 50% arbitrary threshold",
    v1_5: "Static 55% threshold",
    v2: "Class-specific thresholds tau_k in [0.79, 0.85] (Mean: 0.85)"
  },
  {
    feature: "Emergency Red-Flag Interceptors",
    v1: "None (classifier only)",
    v1_5: "None (classifier only)",
    v2: "Yes (11 critical emergencies: Cardiac, Stroke, Appendicitis, etc.)"
  },
  {
    feature: "Specialized Scope & Cancer Guard",
    v1: "None",
    v1_5: "None",
    v2: "Yes (Automatic Oncology & Complex Condition Safe Deferral)"
  },
  {
    feature: "Inference Latency & Runtime",
    v1: "< 14 ms (Node.js in-memory)",
    v1_5: "< 8 ms (Node.js in-memory)",
    v2: "< 12 ms (Zero-Python bit-exact in-memory matrix serving)"
  }
];
