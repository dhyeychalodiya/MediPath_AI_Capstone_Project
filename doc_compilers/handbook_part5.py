import os
import csv
from handbook_foundation import (
    add_heading_1, add_heading_2, add_heading_3, add_para, add_bullet, 
    add_callout, add_figure, add_table, add_code_block,
    COLOR_NAVY, COLOR_SLATE, COLOR_TEAL, COLOR_MUTED
)

PER_CLASS_CSV = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\backend\models\MedP_AI_V2.0\model_per_class_metrics.csv"
MODEL_JSON = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\backend\models\MedP_AI_V2.0\symptom-model_MedP_AI_V2.0.json"

def build_chapter_21(doc):
    add_heading_1(doc, "Chapter 21: Deployment and Operations")
    
    add_heading_2(doc, "21.1 Production Deployment Topology")
    add_para(doc, "While local capstone evaluation runs via start-project.bat on ports 5000 and 8080, production deployment is streamlined by MediPath AI's zero-database and zero-Python serving architecture:", bold_prefix="Production Architecture: ")
    add_bullet(doc, "The React application compiles via npm run build into an optimized static bundle under dist/ (7.98s compile time). These static assets can be served directly from Nginx, Cloudflare Pages, or Express static middleware.", bold_prefix="Frontend Static Serving: ")
    add_bullet(doc, "The Express.js server runs as a cluster under PM2 (Process Manager 2) with automatic restart on unhandled exceptions and log rotation.", bold_prefix="Backend Process Clustering: ")
    add_bullet(doc, "Model 2.0 JSON (5 MB) and hospitals.json (501 KB) are loaded into memory once on server initialization. There are no external database connection pools to manage, eliminate deadlocks and connection leaks.", bold_prefix="In-Memory Artifact Management: ")

    add_heading_2(doc, "21.2 Operational Health Probes")
    add_para(doc, "The API exposes dedicated health endpoints for automated load balancers and orchestrators:", bold_prefix="Monitoring Endpoints: ")
    add_bullet(doc, "GET /api/health returns { status: 'Server is running' } for basic liveness.", bold_prefix="Liveness Probe: ")
    add_bullet(doc, "GET /api/model/health returns loaded status and verified model metadata for readiness.", bold_prefix="Readiness Probe: ")

def build_chapter_22(doc):
    add_heading_1(doc, "Chapter 22: Limitations and Known Issues")
    
    add_heading_2(doc, "22.1 Scope Limitations: 56 Primary-Care Conditions")
    add_para(doc, "Model 2.0 covers 56 common primary-care conditions. Highly specialized, chronic, oncological, and surgical conditions (e.g. Heart Failure, Multiple Sclerosis, Pancreatitis) were audited and intentionally excluded from automated prediction to prevent catastrophic diagnostic errors. These out-of-scope conditions trigger safe clinical deferral.", bold_prefix="Scope Boundary: ")

    add_heading_2(doc, "22.2 Dataset Class Imbalance in Weak Categories")
    add_para(doc, "As documented in Chapter 8, conditions with limited training support (Vertigo / BPPV with 62 cases, Muscle Strain with 61 cases, Contact Dermatitis with 126 cases) exhibit lower F1 scores (0.34 to 0.44) and higher false positives due to overlapping symptom tokens with broader conditions (Migraine, Osteoarthritis, Eczema).", bold_prefix="Class Imbalance: ")

    add_heading_2(doc, "22.3 Static Hospital Registry & Fixed Cost Formula")
    add_para(doc, "The 920 verified hospital records provide extensive geographic coverage across India, but bed occupancy, emergency availability, and attending doctor rosters are static. Cost estimation uses fixed regional formulas; real hospital bills vary based on patient comorbidities and specific pharmaceuticals administered.", bold_prefix="Static Data Limitations: ")

    add_heading_2(doc, "22.4 Translation API Latency and Quota Dependency")
    add_para(doc, "Dynamic translation relies on the external Google Gemini API. When cloud networks experience latency or quotas are exceeded, the system falls back to offline dictionaries. While core clinical guidance remains operational, conversational fluency is reduced in offline mode.", bold_prefix="Cloud Dependency: ")

def build_chapter_23(doc):
    add_heading_1(doc, "Chapter 23: Future Upgrade Roadmap")
    
    add_heading_2(doc, "23.1 Prioritized Feature Roadmap")
    add_para(doc, "The FUTURE_ENHANCEMENTS.md roadmap identifies six key architectural upgrades for upcoming releases:", bold_prefix="Future Roadmap: ")
    
    roadmap_headers = ["Upgrade Item", "Clinical & Technical Benefit", "Impacted Modules", "Target Priority / Status"]
    roadmap_rows = [
        ["Differentiated Firebase History & Deletion", "Patients save and restore direct routing vs triage history across devices with granular deletion", "searchHistoryService.ts, SearchHistoryDialog.tsx", "COMPLETED (Release 4.1)"],
        ["Real-Time Multi-Parameter Hospital Filter", "10-facet real-time filtering (name, procedure, specialty, tier, NABH, budget, sort)", "HospitalRecommendations.tsx, Index.tsx", "COMPLETED (Release 4.1)"],
        ["Direct Disease Model Bypass Routing", "Deterministic routing to clinical department bypassing probabilistic ML inference", "SupportedDiseasesSection.tsx, DirectDiseaseRoutingState.tsx", "COMPLETED (Release 4.1)"],
        ["Helpful / Not Helpful Feedback", "Lightweight binary rating widget on results card to benchmark navigation accuracy", "ResultsView.tsx, feedbackService.ts", "Medium (Release 4.2)"],
        ["Conversational Voice Follow-Up", "Full duplex conversational voice questioning using Web Speech synthesis and recognition", "DoctorConsultationPanel.tsx, useSpeechRecognition.ts", "Medium (Release 4.2)"],
        ["Doctor Visit Preparation Checklist", "Automated checklist summarizing symptom timeline and questions to ask specialist", "ConsultationPrintSummary.tsx, ChecklistView.tsx", "Medium (Release 4.3)"],
        ["Native Mobile Application Companion", "Cross-platform iOS and Android build with offline caching and GPS facility tracking", "Capacitor / React Native Bridge", "Low (Release 4.4)"]
    ]
    add_table(doc, roadmap_headers, roadmap_rows, [1.8, 2.3, 1.4, 1.1])

def build_chapter_24(doc):
    add_heading_1(doc, "Chapter 24: Glossary and Technical Acronyms")
    
    add_heading_2(doc, "24.1 Comprehensive Technical & Clinical Glossary")
    add_para(doc, "Definitions of specialized terminology used throughout the handbook:", bold_prefix="Glossary: ")

    glossary_headers = ["Term / Acronym", "Technical & Clinical Definition within MediPath AI"]
    glossary_rows = [
        ["API (Application Programming Interface)", "RESTful HTTP communication protocol connecting the React frontend with the Node.js backend."],
        ["Authoritative Confidence", "The unaltered mathematical probability generated solely by Model 2.0 and passed verbatim across views."],
        ["Brier Score", "Strictly proper score function measuring the mean squared error between model probabilities and binary outcomes (Model 2.0 = 0.01827)."],
        ["Canonical Symptom", "Standardized English medical phrase (e.g. 'painful urination') representing patient complaints across all languages."],
        ["Closed-Form Parity", "Exact bit-level mathematical equivalence between Python training and Node.js JavaScript serving runtime."],
        ["CORS (Cross-Origin Resource Sharing)", "Browser security mechanism restricting backend API access to approved frontend origins."],
        ["ECE (Expected Calibration Error)", "Weighted average difference between predicted confidence and empirical accuracy (Model 2.0 = 0.0282)."],
        ["ICD-10", "International Classification of Diseases, Tenth Revision; standardized diagnostic codes mapped to all 56 conditions."],
        ["LRAP (Label Ranking Average Precision)", "Evaluation metric measuring the precision of ranking true conditions higher than competitors (Model 2.0 = 0.9160)."],
        ["Multi-Label Learning", "Machine learning paradigm allowing patients to simultaneously exhibit multiple non-mutually exclusive conditions."],
        ["NABH", "National Accreditation Board for Hospitals & Healthcare Providers; Indian clinical quality standard."],
        ["NFKD Normalization", "Unicode Normalization Form KD (Compatibility Decomposition), standardizing character encodings and accents."],
        ["N-gram", "Contiguous sequence of n words extracted from text; Model 2.0 uses unigrams (1-word) and bigrams (2-word)."],
        ["One-vs-Rest (OvR)", "Decomposition strategy training 56 independent binary classifiers, each separating one condition from all others."],
        ["Rate Limiting", "Defensive network constraint capping requests to 120 calls/minute/IP, with emergency query exemption."],
        ["Safe Deferral", "Clinical safety state where ambiguous, out-of-scope, or low-probability symptoms route to general evaluation with confidence: null."],
        ["Sigmoid Function", "Mathematical activation σ(z) = 1 / (1 + e^-z) mapping linear logits into independent probabilities in [0.0, 1.0]."],
        ["TF-IDF", "Term Frequency-Inverse Document Frequency; numerical feature representation weighting distinctive medical vocabulary."],
        ["Top-k Hit Rate", "Proportion of test cases where the true clinical condition is present within the model's top k candidates (Top-3 = 99.03%)."],
        ["Triage", "Systematic clinical prioritization and routing of patient medical complaints to appropriate care levels."]
    ]
    add_table(doc, glossary_headers, glossary_rows, [1.8, 4.7])

def build_chapter_25(doc):
    add_heading_1(doc, "Chapter 25: References and Appendices")
    
    add_heading_2(doc, "Appendix A: Complete 56 Canonical Conditions Catalogue")
    add_para(doc, "The complete clinical catalogue of all 56 conditions supported by Model 2.0, with ICD-10 codes, medical specializations, urgency levels, calibrated decision thresholds, and primary matching procedures:", bold_prefix="Catalogue Inventory: ")

    import json
    with open(MODEL_JSON, 'r', encoding='utf-8') as f:
        model_data = json.load(f)
    
    cat_headers = ["Idx", "Condition Name", "ICD-10", "Specialization", "Urgency", "Threshold", "Primary Procedure"]
    cat_rows = []
    for idx, lbl in enumerate(model_data['labels']):
        cat_rows.append([
            str(idx),
            lbl['condition'],
            lbl.get('icd10', 'R69'),
            lbl.get('specialization', 'General Medicine'),
            lbl.get('urgency', 'routine').capitalize(),
            str(lbl.get('threshold', 0.85)),
            lbl.get('procedure', 'Clinical Evaluation')[:32]
        ])
    add_table(doc, cat_headers, cat_rows, [0.4, 1.8, 0.7, 1.2, 0.7, 0.6, 1.6])

    add_heading_2(doc, "Appendix B: Full Per-Class Test Performance Metrics")
    add_para(doc, "Exact numerical metrics computed on the untouched test partition (N = 15,764 records) from model_per_class_metrics.csv:", bold_prefix="Per-Class Metrics: ")

    metrics_headers = ["Idx", "Condition Name", "Threshold", "Support", "Precision", "Recall", "F1 Score", "Mean Pos Prob"]
    metrics_rows = []
    with open(PER_CLASS_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            metrics_rows.append([
                row['class_index'],
                row['condition'],
                row['threshold'],
                row['support'],
                row['precision'],
                row['recall'],
                row['f1'],
                row['mean_positive_prob']
            ])
    add_table(doc, metrics_headers, metrics_rows, [0.4, 2.0, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8])

    add_heading_2(doc, "Appendix C: Complete 35 Behavioural Suite Test Cases & Outcome Audit")
    add_para(doc, "All 35 clinical test cases evaluated under the 6-status validation taxonomy in backend/test_behavioural_suite.js achieved 100.0% pass rate:", bold_prefix="Behavioural Cases: ")

    cases_headers = ["Test ID", "Clinical Description", "Patient Input", "Expected Outcome", "Status"]
    cases_rows = [
        ["TC-01", "Watery, itchy, red eyes", "watery, itchy, red eyes", "Allergic Conjunctivitis", "PASS_CONFIDENT_CORRECT"],
        ["TC-02", "Painful eyelid lump", "painful eyelid lump with swelling", "Stye / Chalazion", "PASS_CONFIDENT_CORRECT"],
        ["TC-03", "Itchy flaky scalp", "itchy flaky scalp with dandruff scales", "Seborrheic Dermatitis", "PASS_CONFIDENT_CORRECT"],
        ["TC-04", "Rash after using a new soap", "red rash after using a new laundry detergent", "Contact Dermatitis", "PASS_CONFIDENT_CORRECT"],
        ["TC-05", "Hives after food exposure", "raised hives after food exposure", "Allergic Reaction / Urticaria", "PASS_CONFIDENT_CORRECT"],
        ["TC-06", "Painful urination & frequent urge", "painful urination and frequent urge to pee", "Urinary Tract Infection / UTI", "PASS_CONFIDENT_CORRECT"],
        ["TC-07", "Right-lower abdominal pain + fever", "right-lower abdominal pain with fever", "Appendicitis (Emergency Alert)", "PASS_SAFETY_OVERRIDE"],
        ["TC-08", "Heartburn with sour regurgitation", "heartburn after meals with sour acid taste", "GERD", "PASS_CONFIDENT_CORRECT"],
        ["TC-09", "Diarrhoea, vomiting & cramps", "diarrhoea, vomiting and abdominal cramps", "Gastroenteritis", "PASS_CONFIDENT_CORRECT"],
        ["TC-10", "Runny nose, sneezing & mild sore throat", "runny nose, sneezing and mild sore throat", "Common Cold / URI", "PASS_CONFIDENT_CORRECT"],
        ["TC-11", "Fever, body aches and dry cough", "high fever, body aches chills and dry cough", "Influenza", "PASS_CONFIDENT_CORRECT"],
        ["TC-12", "Cough, fever, breathlessness & chest pain", "cough, fever, breathlessness and sharp pain", "Pneumonia", "PASS_CONFIDENT_CORRECT"],
        ["TC-13", "Wheezing after dust exposure", "wheezing and shortness of breath after dust", "Asthma", "PASS_CONFIDENT_CORRECT"],
        ["TC-14", "Ear canal itching with outer ear rash", "ear canal itching with outer ear rash", "Otitis Externa", "PASS_CONFIDENT_CORRECT"],
        ["TC-15", "Child with fever and ear pulling", "child with fever and ear pulling", "Otitis Media", "PASS_CONFIDENT_CORRECT"],
        ["TC-16", "One-sided throbbing headache", "one-sided throbbing headache with light fear", "Migraine", "PASS_CONFIDENT_CORRECT"],
        ["TC-17", "Room spinning when turning in bed", "room spinning when turning in bed with nausea", "Vertigo / BPPV", "PASS_CONFIDENT_CORRECT"],
        ["TC-18", "Thumb/index-finger tingling at night", "thumb/index-finger tingling worse at night", "Carpal Tunnel Syndrome", "PASS_CONFIDENT_CORRECT"],
        ["TC-19", "Knee pain and stiffness while walking", "knee pain and stiffness walking stairs", "Osteoarthritis", "PASS_CONFIDENT_CORRECT"],
        ["TC-20", "Persistent low mood & loss of interest", "persistent low mood and loss of interest", "Depressive Symptoms", "PASS_CONFIDENT_CORRECT"],
        ["TC-21", "Sudden panic with palpitations", "sudden panic with palpitations and sweating", "Panic Attack / Panic Disorder", "PASS_CONFIDENT_CORRECT"],
        ["TC-22", "Weight gain, cold intolerance & fatigue", "unexplained weight gain, cold intolerance", "Hypothyroidism", "PASS_CONFIDENT_CORRECT"],
        ["TC-23", "Pallor, fatigue and heavy periods", "pallor, fatigue and heavy menstrual periods", "Iron-Deficiency Anaemia", "PASS_CONFIDENT_CORRECT"],
        ["TC-24", "Tooth pain, swelling and pus", "tooth pain, swelling and pus near gum", "Dental Abscess", "PASS_CONFIDENT_CORRECT"],
        ["TC-25", "Bleeding gums and bad breath", "bleeding gums and bad breath with tenderness", "Gingivitis / Periodontal Disease", "PASS_CONFIDENT_CORRECT"],
        ["TC-26", "Generic pain", "pain", "System fallback (safe deferral)", "PASS_SAFE_DEFER"],
        ["TC-27", "Generic fever", "fever", "System fallback (safe deferral)", "PASS_SAFE_DEFER"],
        ["TC-28", "Nonmedical greeting", "hello", "System greeting fallback", "PASS_SAFE_DEFER"],
        ["TC-29", "Random unknown words", "asdfghjkl qwerty zxcvbn", "Gibberish input fallback", "PASS_SAFE_DEFER"],
        ["TC-30", "Cancer / tumour statement", "growing breast lump fear cancer tumor", "Oncology Clinical Guard", "PASS_SAFETY_OVERRIDE"],
        ["TC-31", "Crushing cardiac chest pain", "crushing chest pain radiating to left arm", "Heart Attack (Emergency Alert)", "PASS_SAFETY_OVERRIDE"],
        ["TC-NEG-01", "Left elbow clicking after tennis", "left elbow clicking after playing tennis", "Uncertain fallback (14% < threshold)", "PASS_SAFE_DEFER"],
        ["TC-NEG-02", "Mild tiredness and vague discomfort", "mild tiredness and vague discomfort", "Uncertain fallback (27% < threshold)", "PASS_SAFE_DEFER"],
        ["TC-NEG-03", "Occasional neck ache after sitting", "occasional neck ache after sitting", "Uncertain fallback (21% < threshold)", "PASS_SAFE_DEFER"],
        ["TC-NEG-04", "Strange pressure around body", "strange pressure around body", "Uncertain fallback (16% < threshold)", "PASS_SAFE_DEFER"]
    ]
    add_table(doc, cases_headers, cases_rows, [0.8, 1.8, 1.8, 1.4, 1.2])

    add_heading_2(doc, "Appendix D: Machine-Readable Artifacts & Evidence Register")
    add_para(doc, "All primary model files, benchmark reports, and datasets with their verified SHA-256 cryptographic hashes from medipath_ai_final_handover_manifest.json:", bold_prefix="Artifacts Register: ")

    art_headers = ["Artifact File Name", "Exact Relative Path", "SHA-256 Cryptographic Hash / Identifier"]
    art_rows = [
        ["symptom-model_MedP_AI_V2.0.json", "backend/models/MedP_AI_V2.0/", "0F1752A8027D166FDBB67E244C3F0CEE6334F406FBFE789F19E3DF55716E9854"],
        ["symptom-model_MedP_AI_V2.0.joblib", "backend/models/MedP_AI_V2.0/", "FA693898991FFBDBCFE5E0A9DDE6E7802D013110F8FD2DFECFBF38B9FEA5B362"],
        ["model_benchmark_results.json", "backend/models/MedP_AI_V2.0/", "53D4B256501309355B53D32F42D5FBEAE640821FD7B98846AC94F2522718E4FE"],
        ["model_per_class_metrics.csv", "backend/models/MedP_AI_V2.0/", "92D4635D03FF781EE7889A1498BD7503B8D56A4143D1A562B28DC7A1BBE91560"],
        ["model_training_report.json", "backend/models/MedP_AI_V2.0/", "4A8366E8ACBF9D3A85B892336D09EDCDA5CC8A517E5E4EAC5630AC1AC1E856BC"],
        ["model_validation_cases.json", "backend/models/MedP_AI_V2.0/", "559E1211F79BE20D23F1AC8D68B4019EDC569D71337C427B079D55890875DE8A"],
        ["split_class_support.csv", "backend/models/MedP_AI_V2.0/", "BE9EB8912A346BAFC52F6E3B856DCF7F5DA0879684C26E28C8A201DF56BA9363"],
        ["unmapped_conditions.csv", "backend/models/MedP_AI_V2.0/", "6224E0518CE0409F367D42D050965C12FEA4A572F3A2290B5BA1CF0B253EB13F"],
        ["symptom-based-disease-prediction-v2.xlsx", "Datasets/", "850B3637421EBE8F097044BA35AC9E8C297851BD2B7F4A4B04D6CEAFB97544A6"],
        ["hospitals.json", "backend/data/", "Local verified registry of 920 facilities across India"]
    ]
    add_table(doc, art_headers, art_rows, [2.0, 1.8, 2.7])

    add_heading_2(doc, "Appendix E: Document Revision History")
    add_para(doc, "Formal revision history of the MediPath AI Technical Handbook:", bold_prefix="Revision History: ")

    rev_headers = ["Revision", "Release Date", "Primary Focus & Milestone Description", "Author / Committee"]
    rev_rows = [
        ["1.0", "August 2026", "Initial Capstone Project Proposal & Model 1.0 Baseline Architecture", "MediPath Capstone Team"],
        ["2.0", "September 2026", "Model 1.5 Architecture, Softmax Benchmarking & Early Hospital Prototype", "Technical Documentation Team"],
        ["3.0", "9 October 2026", "Model 2.0 In-Memory Engine & Multi-Label Sigmoid Serving Transition", "Software Architecture Team"],
        ["4.0", "14 October 2026", "Complete Master Handbook Reconstruction: Multilingual Translation Pipeline, Safe-Deferral Recovery, Authoritative Confidence Contract, 19 Embedded Architecture Diagrams & Full 25-Chapter Technical Reference", "Senior Technical Documentation & ML Engineering Team"],
        ["4.1", "15 October 2026", "Capstone Final Build Blueprint: Model Diagnostics & Nerd Hub Subsystem, 56-Disease Direct Routing with Dedicated AI Loading Animation, 6-Step Multi-Turn Lifecycle with Differing Symptom Penalization, 100% Vernacular Coverage (280/280 Cards), Dedicated Three-Model Specification Deliverable, and 23 High-Resolution Embedded Diagrams", "Lead Software Architect & AI Engineering Team"]
    ]
    add_table(doc, rev_headers, rev_rows, [0.8, 1.2, 3.2, 1.3])

print("Handbook Part 5 module compiled successfully.")
