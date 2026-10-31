from handbook_foundation import (
    add_heading_1, add_heading_2, add_heading_3, add_para, add_bullet, 
    add_callout, add_figure, add_table, add_code_block,
    COLOR_NAVY, COLOR_SLATE, COLOR_TEAL, COLOR_MUTED
)

def build_chapter_6(doc):
    add_heading_1(doc, "Chapter 6: Frontend Architecture and User Interface")
    
    add_heading_2(doc, "6.1 Page Lifecycle and State Coordination")
    add_para(doc, "The frontend application is structured as a single-page state machine orchestrated by Index.tsx. The application progresses across four distinct stages:", bold_prefix="State Progression: ")
    add_bullet(doc, "The initial landing view presenting the hero search bar, language switcher (English, Hindi, Gujarati), geographic location filter (GPS / City selection), and sample query chips.", bold_prefix="1. 'home': ")
    add_bullet(doc, "Activated immediately upon symptom submission in Model 2.0 mode. Dr. MediPath engages the patient in multi-turn consultation, enforcing Turn-0 inquiry, streaming messages, and accumulating evidence.", bold_prefix="2. 'doctor_consultation': ")
    add_bullet(doc, "A brief, natural transition phase (500–700 ms) displaying ThinkingState while final hospital matching and procedural cost calculations are executed.", bold_prefix="3. 'loading': ")
    add_bullet(doc, "The comprehensive healthcare navigation dashboard rendering the authoritative condition card, confidence meter, ranked hospital cards, interactive filters, procedural cost breakdown, and care summary print trigger.", bold_prefix="4. 'results': ")

    add_heading_2(doc, "6.2 Doctor Consultation Panel: Deep Dive into the Interactive Engine")
    add_para(doc, "DoctorConsultationPanel.tsx (78 KB) is the conversational centerpiece of MediPath AI. It coordinates message streaming, keyboard events, voice input, option chip interactions, and evidence synchronization.", bold_prefix="Component Architecture: ")
    add_bullet(doc, "Maintains two parallel message streams: (1) messages[] containing completed conversational turns rendered in the chat window, and (2) allCanonicalMessages computed via useMemo to guarantee that the printable care summary contains complete text even if printed mid-animation.", bold_prefix="Dual Message State: ")
    add_bullet(doc, "Separates requestLoading (backend HTTP round-trip) from responseRevealing (progressive text typewriter animation). While responseRevealing is true, user inputs are temporarily locked, and a 'Skip' button allows impatient users to instantly finish the animation.", bold_prefix="Independent Reveal Locks: ")
    add_bullet(doc, "The input field and the Send button share an identical handler (handleComposerSubmit). It reads the latest DOM input value, cancels any active progressive streaming, appends the user turn, and dispatches the API request without duplicate submissions.", bold_prefix="Unified Input Submission: ")
    add_bullet(doc, "If a network timeout or HTTP 500 error occurs, the user's typed text is restored into the composer (pendingInputText) and a friendly warning banner is displayed, ensuring zero loss of entered clinical details.", bold_prefix="Submission Recovery on Failure: ")

    add_heading_2(doc, "6.3 Progressive Text Revealing and Accessibility")
    add_para(doc, "The progressive typewriter animation (useProgressiveText.ts) delivers an empathetic clinical feel without annoying users:", bold_prefix="Fluid Streaming: ")
    add_bullet(doc, "Text streams at 24–28 ms per character with a defensive maximum duration ceiling (1,200 ms for assessments, 800 ms for questions), preventing long medical paragraphs from lagging.", bold_prefix="Bounded Duration: ")
    add_bullet(doc, "In the presence of acute emergency warning signs (chest pain, stroke), the typewriter engine is completely bypassed; urgent hospitalization alerts render instantaneously.", bold_prefix="Emergency Bypass: ")
    add_bullet(doc, "The engine evaluates window.matchMedia('(prefers-reduced-motion: reduce)'). When motion reduction is requested, text displays instantly.", bold_prefix="Prefers-Reduced-Motion: ")

    add_heading_2(doc, "6.4 Multilingual Voice Recognition and Audio Narration")
    add_para(doc, "MediPath AI integrates the native browser Web Speech API via useSpeechRecognition.ts. The recognition engine dynamically binds the active language locale: en-IN for English, hi-IN for Hindi, and gu-IN for Gujarati. Patients can dictate complex symptom descriptions effortlessly.", bold_prefix="Voice Dictation: ")
    add_para(doc, "On the hospital results page, a Speech Synthesis audio controller (toggleNarration) provides hands-free accessibility. It announces the identified condition, suggested medical specialization, authoritative confidence percentage, and nearby hospital count in an Indian English accent (en-IN).", bold_prefix="Audio Narration: ")

    add_heading_2(doc, "6.5 56 Supported Diseases & General Medicine Direct Routing with Model Bypass & 3-Node Visual Clinical Transition")
    add_para(doc, "To provide instant clinical navigation for patients with suspected, chronic, or pre-identified conditions, MediPath AI integrates a 56-disease direct routing directory alongside a General Medicine quick-action card directly on the landing page (SupportedDiseasesSection.tsx). Key architectural capabilities include:", bold_prefix="Direct Routing Engine: ")
    add_bullet(doc, "The 56 disease chips are organized inside an alphabetized, optimized scrollable container (max-h-64 overflow-y-auto with custom scrollbars). This prevents excessive vertical page scrolling while providing effortless browsing across all primary-care categories.", bold_prefix="1. Scrollable Catalog & General Medicine: ")
    add_bullet(doc, "Crucially, when a patient selects any disease chip or clicks General Medicine, the machine learning condition prediction model (predictConditions) is completely bypassed. Rather than synthesizing synthetic symptoms that could suffer threshold rejections, the engine looks up canonical metadata (department_routing.json / canonical_diseases.json) and synthesizes an authoritative 100% confidence record with decisionSource: 'direct_routing' and isDirectRouting: true. It routes directly to the hospital recommendation engine with directRouting: true.", bold_prefix="2. Deterministic ML Model Bypass: ")
    add_bullet(doc, "Direct disease navigation transitions through a purpose-built, dedicated 3-node clinical pathway screen (DirectDiseaseRoutingState.tsx). Replacing complex circular radar pulse animations, this transparent 3-step visual tracker articulates: (Node 1) Direct Selection -> (Node 2) Clinical Department Mapping (with specialty badge) -> (Node 3) Hospital Facility Recommendation & Bed Matching.", bold_prefix="3. 3-Node Visual Clinical Loading State: ")
    add_bullet(doc, "For standard conversational consultations transitioning from the doctor follow-up dialogue, ThinkingState is centered vertically with responsive spacing (my-auto py-8 md:py-16) inside a flex column container (min-h-screen flex flex-col justify-between), cleanly anchoring the platform footer to the bottom of the viewport and eliminating layout displacement.", bold_prefix="4. Centered Thinking State & Pinned Footer: ")

    add_figure(doc, "fig21_direct_routing_and_loading_engine.png", "Figure 6.1", "56 Supported Diseases Direct Routing Pipeline & 3-Node Visual Clinical Loading Engine")

    add_heading_2(doc, "6.6 Model Diagnostics & 'Nerd Hub' Engineering Subsystem")
    add_para(doc, "MediPath AI incorporates a transparent, developer-grade diagnostics dialog titled 'Nerd Hub' (NerdHubDialog.tsx), accessible via telemetry pills in the application header. It serves as an open architectural window into the system's operational and training foundations:", bold_prefix="Nerd Hub Capabilities: ")
    add_bullet(doc, "Presents side-by-side architectural and statistical profiles for Model 1.0, Model 1.5, and Model 2.0. Users can inspect training record volumes (4,920 vs 104,291), feature dimensionalities (132 vs 3,910), mathematical activations, and validation benchmarks.", bold_prefix="1. Training Dataset Explorer: ")
    add_bullet(doc, "Provides real-time interactive previews of the genuine training datasets powering each model. Evaluators can view authentic clinical training rows and download clean, verified CSV exports directly to their local workstation with a single click.", bold_prefix="2. Real Dataset Preview & Download: ")
    add_bullet(doc, "Renders an interactive, searchable registry viewer displaying the complete 920-facility verified hospital database. Users can inspect hospital name, city, state, clinical tier, NABH accreditation status, and primary clinical specialties without external dependencies.", bold_prefix="3. Verified Hospital Registry Explorer: ")

    add_figure(doc, "fig22_nerd_hub_architecture.png", "Figure 6.2", "Model Diagnostics & Nerd Hub Architecture, Dataset Preview Engine, and Registry Explorer")

    add_heading_2(doc, "6.7 Header Telemetry and Live Operational Status")
    add_para(doc, "The application header (Header.tsx) features persistent, live telemetry pills that reassure users and technical evaluators of system readiness:", bold_prefix="Operational Indicators: ")
    add_bullet(doc, "Displays real-time cloud authentication and profile sync status (Ready / Connected), powered by Firebase Auth SDK with graceful fallback to anonymous guest mode.", bold_prefix="Firebase Service Pill: ")
    add_bullet(doc, "A dynamic operational badge displaying '3/3 Models Online'. Clicking this badge directly opens the Model Diagnostics & Nerd Hub dialog, establishing end-to-end transparency across all active AI architectures.", bold_prefix="3/3 Models Online Telemetry: ")


def build_chapter_7(doc):
    add_heading_1(doc, "Chapter 7: Backend Architecture and API Reference")
    
    add_heading_2(doc, "7.1 Server Architecture and Security Middleware")
    add_para(doc, "backend/server.js bootstraps the Express.js application on port 5000 with a hardened middleware pipeline:", bold_prefix="Startup Lifecycle: ")
    add_bullet(doc, "Restricts API access strictly to authorized frontend origins (http://localhost:8080 and http://localhost:3000) configured via FRONTEND_URL environment variables.", bold_prefix="CORS Configuration: ")
    add_bullet(doc, "Rejects symptom strings and search queries exceeding 2,000 characters with HTTP 400, preventing buffer exhaustion and payload injection.", bold_prefix="2,000-Character Input Guard: ")
    add_bullet(doc, "Limits client IPs to 120 requests per minute. Crucially, requests matching acute emergency regex patterns (chest pain, stroke, breathing difficulty) are permanently exempt from rate limiting to guarantee life-safety availability.", bold_prefix="In-Memory Rate Limiter with Emergency Exemption: ")
    add_bullet(doc, "Generates a unique correlation ID (e.g. req-1791956196827-gmpt) for every evaluation turn, logging symptoms, turn index, model probability, and inference duration in milliseconds.", bold_prefix="Request Correlation Logging: ")

    add_heading_2(doc, "7.2 Comprehensive API Endpoint Reference")
    add_para(doc, "The table below specifies all active REST endpoints across the backend:", bold_prefix="API Inventory: ")

    api_headers = ["Method & Path", "Purpose & Caller", "Request Payload Schema", "Response Schema & Status"]
    api_rows = [
        ["POST /api/triage/chat", "Multi-turn Doctor AI triage consultation\n(Called by DoctorConsultationPanel)", "{ symptoms: string, chatHistory: Message[], turnCount: number, language?: string, assessmentState?: object, canonicalSymptoms?: string }", "HTTP 200: { success: true, assessmentStatus: string, condition: object, confidence: number|null, modelProbability: number|null, counterQuestion: string, quickOptions: string[] }"],
        ["POST /api/triage/translate", "Text translation for summary & UI\n(Called by ConsultationPrintSummary)", "{ text: string, targetLang: string, sourceLang?: string }", "HTTP 200: { success: true, translatedText: string, language: string }"],
        ["POST /api/hospitals/search", "Hospital discovery & 4-tier ranking\n(Called by ResultsView & Index)", "{ query?: string, condition?: object, filters: SearchFilters, origin: {lat, lng}, city: string, state: string }", "HTTP 200: { success: true, condition: object, hospitals: EnrichedHospital[], totalFound: number, dataSource: string }"],
        ["GET /api/model/health", "Probe ML model availability\n(Called by Index on mount)", "None (Empty GET)", "HTTP 200: { loaded: true, models: [{ id: '_MedP_AI_V2.0', name: 'Model 2.0', available: true }] }"],
        ["GET /api/health", "Basic server health probe\n(Called by start-project.bat)", "None (Empty GET)", "HTTP 200: { status: 'Server is running' }"]
    ]
    add_table(doc, api_headers, api_rows, [1.6, 1.4, 1.8, 1.7])

    add_heading_2(doc, "7.3 Representative Real-World Payloads")
    add_para(doc, "Below is an authentic, verified request/response payload exchange for a multi-turn consultation:", bold_prefix="Verified Payload Sample: ")
    
    sample_json = """// Request: POST /api/triage/chat (Turn 1 Evidence Update)
{
  "symptoms": "watery, itchy eyes, puffy eyelids",
  "canonicalSymptoms": "watery, itchy, red eyes, puffy or swollen eyelids",
  "turnCount": 1,
  "noMoreSymptoms": false,
  "language": "en",
  "chatHistory": [
    { "role": "patient", "text": "watery, itchy, red eyes", "sender": "user" },
    { "role": "doctor", "text": "Are your eyelids swollen?", "sender": "assistant" }
  ]
}

// Response: HTTP 200 OK (Model 2.0 Evaluation: 6ms)
{
  "success": true,
  "modelVersion": "_MedP_AI_V2.0",
  "isConfident": true,
  "confidence": 98,
  "modelProbability": 0.9824,
  "threshold": 0.83,
  "passesThreshold": true,
  "decisionSource": "ml_model",
  "assessmentStatus": "possible_cause_ready",
  "condition": {
    "condition_id": "allergic_conjunctivitis",
    "condition": "Allergic Conjunctivitis",
    "specialization": "Ophthalmology",
    "icd10": "H10.1",
    "urgency": "routine",
    "procedure": "Comprehensive Ophthalmic Examination & Slit-Lamp Biomicroscopy",
    "confidence": 98
  },
  "counterQuestion": null,
  "quickOptions": []
}"""
    add_code_block(doc, sample_json)

def build_chapter_8(doc):
    add_heading_1(doc, "Chapter 8: Model 2.0 (MedP_AI_V2.0) — Complete Technical Explanation")
    
    add_heading_2(doc, "8.1 Model Identity and Architectural Foundation")
    add_para(doc, "Model 2.0 (Build ID: MedP_AI_V2.0_20261011_221051) is a specialized multi-label clinical symptom classifier. Unlike legacy single-label softmax models that artificially force probabilities to sum to 1.0 (causing non-competing diseases to cannibalize each other's confidence), Model 2.0 implements One-vs-Rest (OvR) Logistic Regression with independent sigmoid activations across 56 canonical primary-care conditions.", bold_prefix="Model Architecture: ")
    
    add_heading_2(doc, "8.2 Mathematical Formulation of Feature Extraction & Inference")
    add_para(doc, "Inference progresses through four exact mathematical stages:", bold_prefix="Mathematical Mechanics: ")
    add_bullet(doc, "Input text is normalized using Unicode NFKD decomposition and stripped of diacritics. 45 clinical and Indian colloquial phrases are mapped to canonical tokens (e.g., 'room spinning' -> 'vertigo dizziness loss of balance spinning', 'peshab mein jalan' -> 'painful urination burning').", bold_prefix="Stage 1 (Text Normalization): ")
    add_bullet(doc, "The normalized text is tokenized into word unigrams and bigrams. Tokens are projected into a 3,910-dimensional sparse feature vector x using pre-computed Inverse Document Frequency (IDF) weights, scaled by L2 Euclidean normalization: ||x||_2 = 1.0.", bold_prefix="Stage 2 (TF-IDF Projection): ")
    add_bullet(doc, "For each condition k in {1, ..., 56}, the linear logit zk is evaluated as the dot product between the condition's learned weight vector Wk and the feature vector x, plus the intercept bias bk:", bold_prefix="Stage 3 (Linear Dot Product): ")
    
    formula_1 = "z_k = b_k + \\sum_{j=1}^{3910} W_{k, j} \\cdot x_j"
    add_code_block(doc, f"Linear Logit Equation:\n{formula_1}")
    
    add_bullet(doc, "The logit zk is transformed into an independent posterior probability Pk via the logistic sigmoid function. Pk represents the independent likelihood of condition k, completely decoupled from competing conditions:", bold_prefix="Stage 4 (Sigmoid Activation): ")
    
    formula_2 = "P_k = \\sigma(z_k) = \\frac{1}{1 + e^{-z_k}}"
    add_code_block(doc, f"Logistic Sigmoid Equation:\n{formula_2}")

    add_figure(doc, "fig08_model_preprocessing_inference.png", "Figure 8.1", "Model 2.0 Preprocessing, Vectorization and Sigmoid Inference Pipeline")

    add_heading_2(doc, "8.3 Algorithmic Benchmarking and Selection Rationale")
    add_para(doc, "During model development, four multi-label learning algorithms were benchmarked under identical conditions on the training partition (N = 72,741) and evaluated on the held-out validation partition (N = 15,786). The empirical results from model_benchmark_results.json are summarized below:", bold_prefix="Benchmarking Audit: ")

    bench_headers = ["Algorithm", "Macro F1", "Micro F1", "Weighted F1", "Top-1 Hit", "Top-3 Hit", "Top-5 Hit", "LRAP", "Fit Time"]
    bench_rows = [
        ["LogisticRegression_OvR (Selected)", "0.6226", "0.6808", "0.7092", "88.45%", "98.95%", "99.78%", "0.9179", "4.83s"],
        ["LinearSVC_Calibrated_OvR", "0.6763", "0.7933", "0.7761", "88.86%", "98.49%", "99.49%", "0.9151", "5.77s"],
        ["SGD_LogLoss_OvR", "0.5297", "0.7277", "0.6966", "85.15%", "97.46%", "99.21%", "0.8911", "0.85s"],
        ["MultinomialNB_OvR", "0.5287", "0.5836", "0.6230", "79.46%", "96.46%", "98.96%", "0.8546", "0.55s"]
    ]
    add_table(doc, bench_headers, bench_rows, [1.8, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.5])

    add_callout(doc,
        "ENGINEERING / DEPLOYMENT TRADE-OFF RATIONALE: While LinearSVC_Calibrated achieved slightly higher raw validation F1 (0.676 vs 0.623), "
        "LogisticRegression_OvR was selected as the deployed production model because it produces pure, closed-form sigmoid probabilities "
        "with direct linear weight matrix export (W, b). This guarantees exact bit-level numerical parity between Python training and the Node.js serving runtime "
        "(max diff <= 3.88e-16), whereas multi-fold CalibratedClassifierCV requires non-parametric piecewise calibrators that introduce runtime serving divergence.",
        title="DEPLOYMENT TRADE-OFF & MODEL SELECTION RATIONALE",
        alert_type="note"
    )

    add_heading_2(doc, "8.4 Final Test Set Performance (Untouched Partition N = 15,764)")
    add_para(doc, "The deployed model with validation-calibrated thresholds was evaluated on the completely untouched, held-out test partition. The exact numerical metrics from model_training_report.json are:", bold_prefix="Test Performance: ")
    add_bullet(doc, "Micro Precision: 0.6922 | Micro Recall: 0.9032 | Micro F1: 0.7837", bold_prefix="Micro Metrics: ")
    add_bullet(doc, "Macro Precision: 0.6241 | Macro Recall: 0.8796 | Macro F1: 0.7199", bold_prefix="Macro Metrics: ")
    add_bullet(doc, "Weighted F1: 0.7959 | Label Ranking Average Precision (LRAP): 0.9160", bold_prefix="Ranking Metrics: ")
    add_bullet(doc, "Top-1 Hit Rate: 88.19% | Top-3 Hit Rate: 99.03% | Top-5 Hit Rate: 99.80%", bold_prefix="Multi-Class Hit Rates: ")
    add_bullet(doc, "Hamming Loss: 0.01329 | Mean Brier Score: 0.01827 | Expected Calibration Error (ECE): 0.0282", bold_prefix="Loss & Calibration: ")

    add_heading_2(doc, "8.5 Top Performing vs Weakest Classes")
    add_para(doc, "Performance varies across clinical conditions due to symptomatic distinctiveness and dataset support:", bold_prefix="Condition Variance: ")
    
    top5_headers = ["Condition Category", "Test Support", "Precision", "Recall", "Test F1 Score"]
    top5_rows = [
        ["Depressive Symptoms", "1,192", "0.9231", "0.9564", "0.9394"],
        ["Osteoarthritis", "1,077", "0.9252", "0.9526", "0.9387"],
        ["Endometriosis", "643", "0.8618", "0.9502", "0.9038"],
        ["Otitis Media", "781", "0.8578", "0.9501", "0.9016"],
        ["Pneumonia", "947", "0.8749", "0.9229", "0.8983"]
    ]
    add_table(doc, top5_headers, top5_rows, [2.0, 1.0, 1.0, 1.0, 1.0])

    weak5_headers = ["Weakest Conditions", "Test Support", "Precision", "Recall", "Test F1 Score", "Clinical Rationale"]
    weak5_rows = [
        ["Blepharitis", "214", "0.3984", "0.9533", "0.5620", "High symptomatic overlap with Conjunctivitis & Stye"],
        ["Tension Headache", "145", "0.3782", "0.8138", "0.5164", "Vague symptom profile overlapping with Migraine"],
        ["Muscle Strain / Sprain", "61", "0.2994", "0.8197", "0.4386", "Limited support (61 cases); broad musculoskeletal pain"],
        ["Contact Dermatitis", "126", "0.2476", "0.8175", "0.3801", "Morphological overlap with Eczema & Urticaria"],
        ["Vertigo / BPPV", "62", "0.3194", "0.3710", "0.3433", "Lowest support (62 cases); shares generic dizziness"]
    ]
    add_table(doc, weak5_headers, weak5_rows, [1.8, 0.8, 0.8, 0.8, 0.8, 1.5])

    add_heading_2(doc, "8.6 Serving Parity: Zero Divergence Guarantee")
    add_para(doc, "The automated test backend/test_python_node_parity.js verifies numerical consistency across 117 clinical queries and 6,552 individual class comparisons. The maximum absolute probability difference recorded is 3.88e-16 (governed purely by 64-bit IEEE floating-point arithmetic), and top predicted class agreement is 100.0%.", bold_prefix="Parity Audit: ")

    add_heading_2(doc, "8.7 Comparative Evolution: Model 1.0 vs Model 1.5 vs Model 2.0")
    add_para(doc, "MediPath AI's intelligence engine evolved across three major engineering generations, each addressing fundamental clinical safety and machine learning limitations discovered in prior iterations:", bold_prefix="Generational Evolution: ")

    model_comp_headers = ["Architectural Dimension", "Model 1.0 (Baseline)", "Model 1.5 (Intermediate)", "Model 2.0 (Production Deployed)"]
    model_comp_rows = [
        ["Model Architecture", "Decision Tree / Random Forest", "Multi-Class Neural Network (MLP)", "One-vs-Rest Sigmoidal Logistic Regression"],
        ["Target Condition Classes", "41 Classes (Single-Label)", "41 Classes (Single-Label)", "56 Canonical Primary-Care Conditions"],
        ["Feature Representation", "132 Binary Symptom Indicators", "132 Binary Symptom Indicators", "3,910 Sparse Word Unigram/Bigram TF-IDF"],
        ["Training Record Support", "4,920 Tabular Rows", "4,920 Tabular Rows", "104,291 Curated Conversational Exchanges"],
        ["Mathematical Activation", "Heuristic Leaf Impurity", "Multinomial Softmax (Sum Pi = 1.0)", "Independent Logistic Sigmoid: σ(zk) = 1/(1+e^-zk)"],
        ["Multi-Condition Co-occurrence", "Unsupported (Single Label Only)", "Unsupported (Mutual Exclusivity Bug)", "Fully Supported (True Multi-Label Independence)"],
        ["Runtime Serving Engine", "Python Microservice / Subprocess", "ONNX Web / TensorFlow.js", "Pure Node.js In-Memory Microsecond Engine"],
        ["Inference Latency", "15 – 25 ms (Subprocess Overhead)", "10 – 18 ms (WASM Runtime)", "< 150 µs (Sub-Millisecond Zero-Overhead)"],
        ["Top-1 Accuracy / Hit Rate", "79.20%", "84.60%", "88.19% (Top-1) | 99.03% (Top-3) | 99.80% (Top-5)"],
        ["LRAP / Ranking Quality", "0.7420", "0.7915", "0.9160 (Label Ranking Average Precision)"],
        ["Python-to-Serving Parity", "Not Guaranteed (Pickle Drift)", "Approximate (Float Precision Drift)", "Exact Closed-Form Parity (Max Diff <= 3.88e-16)"],
        ["Out-of-Scope Safety", "Uncalibrated / Force Predicts", "Pathological Overconfidence on Unseen", "Calibrated Thresholds (0.79-0.85) + Safe Deferral"]
    ]
    add_table(doc, model_comp_headers, model_comp_rows, [1.6, 1.6, 1.6, 1.7])

    add_figure(doc, "fig20_three_models_comparison.png", "Figure 8.2", "Comprehensive Generational Comparison across Model 1.0, Model 1.5, and Model 2.0")

    add_callout(doc,
        "COMPREHENSIVE THREE MODELS SPECIFICATION REFERENCE: For an exhaustive, 10-chapter mathematical and algorithmic treatise covering "
        "every hyperparameter, training loss curve, per-class sensitivity matrix, and confusion pattern across all three model architectures, "
        "refer to the companion deliverable: MediPath_AI_Three_Models_Comprehensive_Specification.docx.",
        title="DEDICATED THREE-MODEL SPECIFICATION DELIVERABLE",
        alert_type="note"
    )


def build_chapter_9(doc):
    add_heading_1(doc, "Chapter 9: Dataset Curation and Preprocessing")
    
    add_heading_2(doc, "9.1 Training Dataset Provenance")
    add_para(doc, "Model 2.0 was trained on Datasets/symptom-based-disease-prediction-v2.xlsx. The dataset contains conversational JSON exchanges between patients and healthcare assistants. The file's SHA-256 cryptographic checksum is 850b3637421ebe8f097044ba35ac9e8c297851bd2b7f4a4b04d6ceafb97544a6.", bold_prefix="Dataset Source: ")

    add_heading_2(doc, "9.2 Data Cleaning & Scope Curation Audit")
    add_para(doc, "The raw spreadsheet contained 157,036 patient consultation records representing 2,647 unique disease strings. To create a rigorous primary-care routing model, conditions were mapped against a strict 56-class taxonomy:", bold_prefix="Curation Pipeline: ")
    add_bullet(doc, "Raw Record Count: 157,036", bold_prefix="Raw Count: ")
    add_bullet(doc, "Retained Records (>= 1 canonical condition): 104,291 (66.41%)", bold_prefix="Retained: ")
    add_bullet(doc, "Dropped Records (out-of-scope exclusions): 52,745 (33.59%)", bold_prefix="Dropped: ")
    add_bullet(doc, "Mapped Class Instances: 154,451 multi-label targets across 56 classes", bold_prefix="Mapped Targets: ")
    add_bullet(doc, "Audited Unmapped Occurrences: 113,003 occurrences across 2,090 unique disease strings systematically documented in backend/models/MedP_AI_V2.0/unmapped_conditions.csv", bold_prefix="Unmapped Audit: ")

    add_heading_2(doc, "9.3 Top Audited Unmapped Conditions")
    add_para(doc, "Rather than silently dropping unmapped records, unmapped diseases were audited and assigned explicit clinical triage rationales:", bold_prefix="Unmapped Audit Table: ")
    
    unmap_headers = ["Rank", "Disease String", "Occurrences", "Clinical Category", "Assigned Triage Action"]
    unmap_rows = [
        ["1", "Heart Failure", "4,486", "Excluded: Chronic / Tertiary Specialist Care", "Tertiary Specialist Referral (Cardiology)"],
        ["2", "Fibromyalgia", "3,934", "Excluded: Chronic / Tertiary Specialist Care", "Tertiary Specialist Referral (Rheumatology)"],
        ["3", "Parkinson's disease", "3,614", "Excluded: Chronic / Tertiary Specialist Care", "Tertiary Specialist Referral (Neurology)"],
        ["4", "Uveitis", "3,167", "Out of Scope / Requires Clinical Review", "General Physician for Comprehensive Workup"],
        ["5", "Rheumatoid Arthritis", "3,000", "Excluded: Chronic / Tertiary Specialist Care", "Tertiary Specialist Referral (Rheumatology)"],
        ["6", "Inflammatory Bowel Disease", "2,902", "Excluded: Chronic / Tertiary Specialist Care", "Tertiary Specialist Referral (Gastroenterology)"],
        ["7", "Multiple Sclerosis", "2,866", "Excluded: Chronic / Tertiary Specialist Care", "Tertiary Specialist Referral (Neurology)"],
        ["8", "Pericarditis", "2,820", "Out of Scope / Requires Clinical Review", "General Physician for Comprehensive Workup"],
        ["9", "Pancreatitis", "2,812", "Excluded: Surgical / Subspecialty Outpatient", "Subspecialist Outpatient Referral (Surgery)"],
        ["10", "Spinal Stenosis", "2,780", "Out of Scope / Requires Clinical Review", "General Physician for Comprehensive Workup"]
    ]
    add_table(doc, unmap_headers, unmap_rows, [0.6, 1.8, 1.0, 1.5, 1.6])

    add_heading_2(doc, "9.4 Zero-Leakage Group Partitioning")
    add_para(doc, "Standard random train/test splits cause massive data leakage in multi-turn clinical datasets because duplicate or near-duplicate symptom combinations appear across multiple dialogue turns. To prevent leakage, records were grouped into 101,137 unique symptom signatures. A balanced group stratification algorithm partitioned the data:", bold_prefix="Partitioning Methodology: ")
    add_bullet(doc, "Training Partition: 72,741 records (70,088 unique signature groups)", bold_prefix="Train Split: ")
    add_bullet(doc, "Validation Partition: 15,786 records (15,530 unique signature groups)", bold_prefix="Val Split: ")
    add_bullet(doc, "Final Held-Out Test Partition: 15,764 records (15,519 unique signature groups)", bold_prefix="Test Split: ")
    add_bullet(doc, "Signature Overlap across any two splits: Exactly 0 records (0.00% leakage)", bold_prefix="Zero Leakage: ")
    add_bullet(doc, "Minimum class support in validation set: 60 (target >= 50: MET)", bold_prefix="Val Support: ")
    add_bullet(doc, "Minimum class support in test set: 61 (target >= 50: MET)", bold_prefix="Test Support: ")

    add_figure(doc, "fig09_model_training_pipeline.png", "Figure 9.1", "Zero-Leakage Group Stratification & Offline Training Pipeline")

def build_chapter_10(doc):
    add_heading_1(doc, "Chapter 10: Multilingual Processing and Translation")
    
    add_heading_2(doc, "10.1 Language Pipeline Architecture")
    add_para(doc, "MediPath AI implements a dedicated translation service (translationService.js) supporting English, Hindi, and Gujarati. The pipeline enforces a strict separation of concerns: translation makes vernacular inputs understandable to Model 2.0, but Model 2.0 remains the sole authority for classification and triage decisions.", bold_prefix="Language Boundary: ")
    add_figure(doc, "fig07_multilingual_translation_sequence.png", "Figure 10.1", "Multilingual Translation Sequence and Canonical Tag Preservation")

    add_heading_2(doc, "10.2 Script and Romanized Text Detection")
    add_para(doc, "The system automatically detects patient language using a two-tier detector:", bold_prefix="Detection Mechanics: ")
    add_bullet(doc, "Inspects Unicode code points: Devanagari (\\u0900–\\u097F) maps to Hindi ('hi'), and Gujarati (\\u0A80–\\u0AFF) maps to Gujarati ('gu').", bold_prefix="Script Range Detection: ")
    add_bullet(doc, "Evaluates phrase regexes and vocabulary sets. Hindi phrases such as 'dard ho raha hai', 'seene me dard', 'bukhar hai' trigger Hindi detection. Gujarati phrases such as 'mathu dukhe chhe', 'shwas levama taklif', 'kai nathi' trigger Gujarati detection.", bold_prefix="Romanized Transliteration Detection: ")

    add_heading_2(doc, "10.3 Translation Execution & Google Gemini Fallback")
    add_para(doc, "When non-English input is detected, translateSymptomsToEnglish converts the text to canonical English medical symptoms via Google Gemini API (gemini-3.5-flash). To prevent cloud latency from stalling triage, all Gemini calls enforce a strict 3.5-second AbortController timeout. If the API times out, returns HTTP 429 quota exhaustion, or is offline, the service falls back to local dictionary mappings (DICTIONARY_FALLBACKS).", bold_prefix="Translation Gateway: ")

    add_heading_2(doc, "10.4 Canonical Tags and Localized Display Option Cards")
    add_para(doc, "When Model 2.0 generates follow-up options, they are translated back into the patient's active conversation language (e.g. 'Puffy eyelids' -> 'सूजी हुई पलकें'). Crucially, the option cards retain their canonical English values as hidden data attributes (canonicalOptions). When the patient clicks 'सूजी हुई पलકें', the frontend transmits the canonical English term back to the backend, ensuring that Model 2.0 always evaluates clean, standardized clinical vocabulary.", bold_prefix="Option Tagging: ")

    add_heading_2(doc, "10.5 100% Comprehensive Vernacular Coverage for All 280 Candidate Symptom Cards")
    add_para(doc, "To achieve true clinical accessibility across diverse linguistic demographics, MediPath AI expanded its offline translation registry to achieve 100% comprehensive bilingual coverage for all 280 candidate follow-up symptom cards across all 56 condition classes:", bold_prefix="100% Translation Guarantee: ")
    add_bullet(doc, "Every clinical symptom term present in Model 2.0's vocabulary is pre-mapped into authentic Hindi (Devanagari) and Gujarati scripts within DICTIONARY_FALLBACKS in translationService.js.", bold_prefix="Complete Dictionary Coverage: ")
    add_bullet(doc, "Automated validation suites (test_exact_user_prompt_lifecycle.js and verify_translations_coverage.js) enforce that 0 untranslated English strings leak into user-facing option cards during Hindi or Gujarati consultation sessions.", bold_prefix="Zero-Leakage Automated Verification: ")
    add_bullet(doc, "When users interact with translated symptom cards, the system transmits the immutable canonical English phrase back to the classifier while presenting colloquial vernacular confirmations to the user, combining linguistic comfort with pristine machine learning rigor.", bold_prefix="Dual-Tag Transmission Protocol: ")


print("Handbook Part 2 module compiled successfully.")
