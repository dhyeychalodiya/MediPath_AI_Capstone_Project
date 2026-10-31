from handbook_foundation import (
    add_heading_1, add_heading_2, add_heading_3, add_para, add_bullet, 
    add_callout, add_figure, add_table, add_code_block,
    COLOR_NAVY, COLOR_SLATE, COLOR_TEAL, COLOR_MUTED
)
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def build_front_matter(doc):
    # Title & Subtitle
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("MediPath AI: Intelligent Healthcare Navigation & Clinical Guidance System")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_NAVY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(18)
    r_sub = p_sub.add_run("Final-Year B.Tech Capstone Technical Handbook & Operations Reference\nModel 2.0 In-Memory Engine · Multilingual Triage · 920 Hospital Registry")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = COLOR_TEAL

    # Metadata Table
    meta_headers = ["Project Attribute", "Official Specification & Repository Evidence"]
    meta_rows = [
        ["Project Title", "MediPath AI: Intelligent Healthcare Navigation & Symptom Guidance"],
        ["Academic Context", "Final-Year B.Tech Capstone Project (Engineering & Computer Science)"],
        ["Software Release", "Capstone Version 4.1 (Complete Production Final Build & Architectural Blueprint)"],
        ["Primary ML Engine", "MedP_AI_V2.0 (In-Memory Node.js Closed-Form Sigmoid Engine, 56 Classes)"],
        ["Model Build ID", "MedP_AI_V2.0_20261011_221051 (SHA-256 Hash Verified)"],
        ["Serving Architecture", "Zero-Python In-Memory Microsecond Node.js Serving (< 150 µs latency)"],
        ["Multilingual Scope", "English, Hindi (Devanagari & Romanized), Gujarati (Script & Romanized)"],
        ["Hospital Registry", "920 Verified Facilities across Tier-1, Tier-2, and Tier-3 Indian Cities"],
        ["Frontend Framework", "React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.1 + Tailwind CSS 3.4.11"],
        ["Backend Framework", "Node.js (v18/v20/v22) + Express.js 4.18.2 REST API Server"],
        ["Verification Status", "100% Automated Test Pass (27/27 Master, 35/35 Behavioural, 97/97 Vitest across 16 Suites)"],
        ["Documentation Date", "October 2026 (Updated Master Blueprint & Operations Handbook, 23 Blueprints)"]
    ]
    add_table(doc, meta_headers, meta_rows, [2.5, 4.0])

    add_callout(doc,
        "MediPath AI is a preliminary healthcare navigation, clinical triage support, and care discovery system. "
        "It provides symptom-based category suggestions and hospital navigation assistance. It is strictly non-diagnostic "
        "and does not replace physical clinical examination, laboratory diagnostics, or professional medical judgment by a qualified doctor. "
        "In life-threatening emergencies, patients must immediately contact emergency medical services (112 / 108).",
        title="MANDATORY CLINICAL SAFETY NOTICE & INSTITUTIONAL DISCLAIMER",
        alert_type="warning"
    )

    doc.add_page_break()

def build_chapter_1(doc):
    add_heading_1(doc, "Chapter 1: Project Overview and Purpose")
    
    add_heading_2(doc, "1.1 Project Title and Identity")
    add_para(doc, "The official title of the capstone project is MediPath AI: Intelligent Healthcare Navigation and Symptom-Based Clinical Guidance System. The project addresses the critical challenge of navigating complex, fragmented healthcare delivery ecosystems by providing an intelligent, patient-centric digital navigator. Rather than functioning as a remote diagnostic device, MediPath AI bridges the gap between an individual's subjective, colloquial symptom experience and the formal healthcare ecosystem—directing patients to the appropriate medical specialization, clinical procedure, and verified healthcare facilities.", bold_prefix="System Identity: ")
    
    add_heading_2(doc, "1.2 Problem Statement: The Healthcare Navigation Crisis")
    add_para(doc, "Healthcare navigation across developing and densely populated nations, particularly India, faces acute structural barriers:", bold_prefix="Clinical Context: ")
    add_bullet(doc, "Patients presenting with common medical complaints frequently consult inappropriate super-specialists or overburdened tertiary emergency centers, causing severe hospital congestion and delayed clinical care.", bold_prefix="Specialist Mismatch: ")
    add_bullet(doc, "Unstructured internet search engines ('Dr. Google') expose anxious users to algorithmic catastrophizing—confusing benign tension headaches with malignant intracranial tumors—or dangerously minimizing red-flag cardiac emergencies.", bold_prefix="Unregulated Self-Diagnosis: ")
    add_bullet(doc, "Over 80% of Indian patients describe medical discomfort using native vernaculars (Hindi, Gujarati) or Romanized text (e.g., 'mujhe sir dard hai', 'mane mathu dukhe chhe') on standard English mobile keyboards, rendering conventional diagnostic tools inaccessible.", bold_prefix="Linguistic & Digital Exclusion: ")
    add_bullet(doc, "Patients lack upfront visibility into procedural expenses, room charges, and diagnostic costs across different hospital tiers (Budget, Mid-tier, Premium), leading to medical debt and financial distress.", bold_prefix="Opaque Healthcare Pricing: ")

    add_heading_2(doc, "1.3 Proposed Solution: The MediPath AI Platform")
    add_para(doc, "MediPath AI provides a structured, four-pillar clinical navigation platform:", bold_prefix="The Technical Solution: ")
    add_bullet(doc, "Engages patients in a structured, multi-turn clinical dialogue. Unlike standard ML classifiers that force a prediction on initial query, MediPath enforces a mandatory Turn-0 discriminative inquiry to eliminate premature clinical closure.", bold_prefix="1. Interactive Clinical Consultation Engine: ")
    add_bullet(doc, "Trained on 104,291 curated clinical records across 56 primary-care conditions, Model 2.0 uses independent binary sigmoid units with class-calibrated decision thresholds. It exports a static linear weight matrix executed directly in Node.js memory (< 150 µs latency) with exact bit-level Python parity.", bold_prefix="2. Zero-Python In-Memory ML Engine (Model 2.0): ")
    add_bullet(doc, "A dedicated dual-stage pipeline seamlessly detects native scripts (Devanagari, Gujarati) and Romanized transliterations, converts patient complaints to canonical English representations for Model 2.0, and renders localized response cards with canonical submission tags.", bold_prefix="3. Multilingual Translation Gateway: ")
    add_bullet(doc, "A verified registry of 920 facilities across India ranked via a deterministic 4-tier clinical matching algorithm (Primary Specialist Match -> Procedure Match -> General Care Fallback -> Regional Referral) coupled with condition-specific procedural cost models.", bold_prefix="4. 4-Tier Hospital & Cost Engine: ")

    add_heading_2(doc, "1.4 Scope and Explicit System Boundaries")
    add_para(doc, "To maintain absolute clinical and legal integrity, MediPath AI establishes strict architectural boundaries:", bold_prefix="Operational Scope: ")
    
    table_headers = ["Domain / Capability", "Explicitly Supported in MediPath AI", "Strictly Out-of-Scope (Safe Deferral / Override)"]
    table_rows = [
        ["Diagnostic Scope", "56 Common Primary-Care & Outpatient Categories", "Definitive medical diagnosis, histopathology, oncology"],
        ["Emergency Handling", "Deterministic red-flag regex override to ER guidance", "Telemedicine emergency dispatch, active rescue triage"],
        ["Prescriptions & Meds", "General procedural cost models & care navigation", "Issuing drug prescriptions, dosages, scheduled substances"],
        ["Laboratory Profiling", "Advisory recommendation to undergo metabolic lab workup", "Direct diagnostic interpretation of lab/blood test numbers"],
        ["Data Privacy", "Ephemeral client-side processing; zero storage of PII", "Cloud EHR hosting, commercial medical data mining"],
        ["Hospital Registry", "920 verified facilities in local JSON + Google fallback", "Real-time ICU bed occupancy, live doctor appointment booking"]
    ]
    add_table(doc, table_headers, table_rows, [1.8, 2.3, 2.4])

    add_heading_2(doc, "1.5 Key Contributions and Engineering Novelty")
    add_para(doc, "MediPath AI introduces several major technical contributions to student capstone and applied healthcare software literature:", bold_prefix="Architectural Novelty: ")
    add_bullet(doc, "Eliminating Python microservice dependencies at runtime by exporting linear weight vectors (W, b) and IDF tables into a lightweight JSON file. Node.js evaluates TF-IDF vectorization and sigmoid activations in sub-millisecond time, achieving zero subprocess overhead and a 3.88e-16 maximum probability divergence against scikit-learn.", bold_prefix="Zero-Python In-Memory Serving Parity: ")
    add_bullet(doc, "Eliminating data leakage by partitioning 104,291 clinical records by unique symptom signature groups (101,137 groups). Guarantees exact 0.00% train/val/test overlap while meeting minimum class support (>= 60 cases per class).", bold_prefix="Group-Stratified Multi-Label Learning: ")
    add_bullet(doc, "Replacing arbitrary turn limits with an evidence-driven state machine. Enforces Turn-0 mandatory questioning, prevents duplicate inquiry, provides safe deferral for vague inputs, and allows continuous post-assessment evidence refinement.", bold_prefix="Deterministic Clinical Decision Engine: ")
    add_bullet(doc, "Guarantees that the genuine calibrated probability generated by Model 2.0 is passed verbatim across the application. Prohibits artificial confidence inflation based on hospital ratings or bed counts.", bold_prefix="Single Authoritative Confidence Contract: ")

    add_heading_2(doc, "1.6 Complete User Journey Overview")
    add_para(doc, "The user journey is engineered for intuitive, empathetic, and rapid navigation through seven distinct phases:", bold_prefix="End-to-End Walkthrough: ")
    add_bullet(doc, "The patient selects their preferred language (English, Hindi, Gujarati) and sets their city or GPS location.", bold_prefix="Phase 1 (Landing): ")
    add_bullet(doc, "The patient enters symptoms in natural conversational prose, native script, or Romanized transliteration (or via voice input).", bold_prefix="Phase 2 (Symptom Entry): ")
    add_bullet(doc, "The system engages Dr. MediPath, asking a mandatory discriminative follow-up question with interactive clickable option cards.", bold_prefix="Phase 3 (Turn 0 Consultation): ")
    add_bullet(doc, "The patient selects relevant chips or enters additional sensations; clinical evidence accumulates without repeating asked questions.", bold_prefix="Phase 4 (Evidence Accumulation): ")
    add_bullet(doc, "Upon threshold satisfaction or selection of 'No more symptoms', Model 2.0 renders an authoritative candidate condition card with genuine confidence.", bold_prefix="Phase 5 (Assessment Display): ")
    add_bullet(doc, "The patient transitions to hospital recommendations, viewing ranked facilities, accreditations, and procedural cost estimates.", bold_prefix="Phase 6 (Facility Discovery): ")
    add_bullet(doc, "The patient prints a comprehensive clinical preparation summary or returns to re-consult the doctor AI with additional symptoms.", bold_prefix="Phase 7 (Summary & Re-Consult): ")

    add_figure(doc, "fig06_user_journey.png", "Figure 1.1", "Complete End-to-End User Journey across MediPath AI Platform")

def build_chapter_2(doc):
    add_heading_1(doc, "Chapter 2: Requirements and Traceability Matrix")
    
    add_heading_2(doc, "2.1 Functional Requirements (FR)")
    add_para(doc, "The MediPath AI repository implements and verifies the following core functional requirements:", bold_prefix="System Specifications: ")
    add_bullet(doc, "The system shall accept symptom descriptions via keyboard input and Web Speech API voice dictation in English, Hindi, and Gujarati.", bold_prefix="FR-01 (Multilingual Input): ")
    add_bullet(doc, "The system shall automatically detect Indic scripts (Devanagari, Gujarati) and Romanized transliterations ('seene me dard', 'mathu dukhe chhe') without requiring manual language toggling.", bold_prefix="FR-02 (Language Detection): ")
    add_bullet(doc, "The consultation engine shall enforce a mandatory discriminative follow-up inquiry on Turn 0 for all non-emergency queries, regardless of initial model probability.", bold_prefix="FR-03 (Turn 0 Mandatory Inquiry): ")
    add_bullet(doc, "The system shall immediately intercept emergency red-flag conditions (e.g., crushing chest pain, stroke signs) via deterministic rules and output urgent hospitalization instructions.", bold_prefix="FR-04 (Emergency Red-Flag Interceptor): ")
    add_bullet(doc, "The engine shall generate discriminative follow-up questions with curated option chips derived from the top candidate conditions, filtering out already reported symptoms and invalid fragments.", bold_prefix="FR-05 (Discriminative Follow-up Generation): ")
    add_bullet(doc, "The system shall support a 'No more symptoms' control signal across all languages, triggering evidence evaluation against class-specific thresholds.", bold_prefix="FR-06 (Control Signal Handling): ")
    add_bullet(doc, "The system shall execute multi-label inference across 56 primary-care classes using independent sigmoid units in Node.js memory.", bold_prefix="FR-07 (In-Memory Sigmoid Inference): ")
    add_bullet(doc, "The system shall enforce class-calibrated decision thresholds tau_k in [0.79, 0.85]. Symptoms failing threshold shall output safe deferral with confidence: null.", bold_prefix="FR-08 (Calibrated Decision Thresholds): ")
    add_bullet(doc, "The authoritative confidence score generated by Model 2.0 shall be transferred verbatim to the hospital recommendations view without inflation.", bold_prefix="FR-09 (Authoritative Confidence Handoff): ")
    add_bullet(doc, "The system shall allow patients to continue the consultation after an assessment card is displayed, re-evaluating cumulative evidence upon receipt of new symptoms.", bold_prefix="FR-10 (Continuous Post-Assessment Consultation): ")
    add_bullet(doc, "The system shall filter 920 hospital facilities by city, state, and geographic radius using Haversine distance calculations.", bold_prefix="FR-11 (Geographic Facility Filtering): ")
    add_bullet(doc, "The system shall rank candidate hospitals using a deterministic 4-tier clinical matching algorithm (Primary Specialist -> Procedure -> General Fallback -> Regional Referral).", bold_prefix="FR-12 (4-Tier Hospital Ranking): ")
    add_bullet(doc, "The system shall calculate procedural cost estimates across 56 conditions adjusting for hospital tier (Budget, Mid-tier, Premium) and NABH accreditation.", bold_prefix="FR-13 (Procedural Cost Estimation): ")
    add_bullet(doc, "The system shall format and render a printable clinical preparation summary containing header metadata, safety notices, and dialogue logs.", bold_prefix="FR-14 (Printable Consultation Summary): ")
    add_bullet(doc, "The system shall provide a 56-disease visual directory and General Medicine quick-action card on the landing page that completely bypasses ML condition prediction inference (predictConditions), directly mapping the pre-identified condition to its canonical clinical department and routing immediately into hospital recommendations.", bold_prefix="FR-15 (Direct Supported Diseases & General Medicine Routing): ")
    add_bullet(doc, "The system shall provide real-time client-side multi-parameter filtering across hospital recommendations, supporting instant text query search, procedure roster matching, clinical specialty dropdown, dynamic distance radius slider (5–50+ km), clinical match tier multi-select, quality toggles (NABH, 24/7 emergency, open now), minimum star rating, procedural cost brackets with max budget slider, and multi-criteria sorting.", bold_prefix="FR-16 (Multi-Dimensional Real-Time Hospital Filtering): ")
    add_bullet(doc, "The system shall persist user search history to Firebase Firestore and local storage with explicit discrimination between symptom triage and direct routing. Restoring a direct routing history item shall completely bypass ML model inference, while restoring symptom history shall preserve conversational triage re-evaluation.", bold_prefix="FR-17 (Differentiated Search History & Model-Bypass Restoration): ")

    add_heading_2(doc, "2.2 Non-Functional Requirements (NFR)")
    add_bullet(doc, "In-memory Model 2.0 inference shall execute in under 1 millisecond (< 150 µs typical). End-to-end API response shall not exceed 1,500 ms (excluding external LLM calls).", bold_prefix="NFR-01 (Inference Latency): ")
    add_bullet(doc, "Inference probabilities computed in Node.js shall match Python scikit-learn training output with an absolute divergence delta <= 1.0e-12.", bold_prefix="NFR-02 (Serving Numerical Parity): ")
    add_bullet(doc, "Patient medical conversations shall be processed ephemerally in client memory; no plaintext medical text shall be stored on persistent cloud databases.", bold_prefix="NFR-03 (Data Privacy & Ephemeral State): ")
    add_bullet(doc, "The backend API shall reject payloads exceeding 2,000 characters and enforce a rate limit of 120 requests/minute/IP (exempting emergency queries).", bold_prefix="NFR-04 (API Resilience & Rate Limiting): ")
    add_bullet(doc, "The frontend shall provide fully responsive layouts across mobile (>= 320px), tablet, and desktop viewports with accessible outline focus rings.", bold_prefix="NFR-05 (Accessibility & Responsiveness): ")
    add_bullet(doc, "All progressive typewriter animations shall respect OS-level prefers-reduced-motion accessibility settings.", bold_prefix="NFR-06 (Animation Accessibility): ")

    add_heading_2(doc, "2.3 Requirements Traceability Matrix (RTM)")
    add_para(doc, "The following matrix links every requirement to its implementing codebase module, verification test script, and confirmed status:", bold_prefix="Verification Audit: ")
    
    rtm_headers = ["Req ID", "Requirement Description", "Implementing Module", "Verification Method", "Status"]
    rtm_rows = [
        ["FR-01", "Multilingual Keyboard & Voice Input", "DoctorConsultationPanel.tsx, useSpeechRecognition.ts", "multilingualConsultation.test.tsx", "VERIFIED (100%)"],
        ["FR-02", "Automatic Script & Romanized Detection", "translationService.js, i18n.ts", "test_romanized_heuristics.js", "VERIFIED (100%)"],
        ["FR-03", "Mandatory Turn 0 Discriminative Inquiry", "symptomModel.js (evaluateDoctorClarity)", "test_master_verification.js (Test 1)", "VERIFIED (100%)"],
        ["FR-04", "Emergency Red-Flag Immediate Override", "symptomModel.js (EMERGENCY_WARNING_PATTERNS)", "test_master_verification.js (Test 14)", "VERIFIED (100%)"],
        ["FR-05", "Discriminative Follow-up Generation", "symptomModel.js (generateFollowUpTurn)", "test_master_verification.js (Test 7,8)", "VERIFIED (100%)"],
        ["FR-06", "Multilingual 'No more symptoms' Handling", "triageController.js, symptomHelpers.ts", "test_followup_no_more_symptoms.js", "VERIFIED (100%)"],
        ["FR-07", "In-Memory 56-Class Sigmoid Inference", "symptomModel.js (predictConditions)", "test_python_node_parity.js", "VERIFIED (100%)"],
        ["FR-08", "Class-Calibrated Threshold Enforcement", "symptomModel.js, MedP_AI_V2.0.json", "test_master_verification.js (Test 3,4)", "VERIFIED (100%)"],
        ["FR-09", "Authoritative Confidence Handoff", "ResultsView.tsx, ConfidenceMeter.tsx", "HospitalConfidenceHandoff.test.tsx", "VERIFIED (100%)"],
        ["FR-10", "Continuous Post-Assessment Consultation", "DoctorConsultationPanel.tsx, symptomModel.js", "test_post_assessment_live_flow.js", "VERIFIED (100%)"],
        ["FR-11", "Geographic Radius & Haversine Filter", "hospitalController.js (distanceKm)", "test_master_verification.js (Test 22)", "VERIFIED (100%)"],
        ["FR-12", "4-Tier Clinical Hospital Ranking", "hospitalController.js (enrichHospital)", "test_master_verification.js (Test 21)", "VERIFIED (100%)"],
        ["FR-13", "Procedural Cost Estimation Modeling", "hospitalController.js (CONDITION_COST_PROFILES)", "CostBreakdown.tsx, test_e2e_flow.js", "VERIFIED (100%)"],
        ["FR-14", "Printable Care Consultation Summary", "ConsultationPrintSummary.tsx", "SafeDeferralRecoveryAndPrint.test.tsx", "VERIFIED (100%)"],
        ["FR-15", "Direct Disease & Gen Med Routing Model Bypass", "SupportedDiseasesSection.tsx, DirectDiseaseRoutingState.tsx", "DirectRoutingAndFilterFixes.test.tsx", "VERIFIED (100%)"],
        ["FR-16", "Multi-Dimensional Real-Time Hospital Filtering", "HospitalRecommendations.tsx (useMemo filter pipeline)", "DirectRoutingAndFilterFixes.test.tsx", "VERIFIED (100%)"],
        ["FR-17", "Differentiated History & Model-Bypass Restore", "searchHistoryService.ts, SearchHistoryDialog.tsx", "DirectRoutingAndFilterFixes.test.tsx", "VERIFIED (100%)"],
        ["NFR-01", "Sub-millisecond Model Inference Latency", "symptomModel.js (< 150 µs benchmark)", "Benchmark Log Assertions", "VERIFIED (100%)"],
        ["NFR-02", "Python-Node Closed-Form Parity", "symptomModel.js vs train_v2_multilabel.py", "test_python_node_parity.js (diff<1e-15)", "VERIFIED (100%)"],
        ["NFR-03", "Client-Side Ephemeral Data Privacy", "DoctorConsultationPanel.tsx, AuthContext.tsx", "Security Audit & Code Review", "VERIFIED (100%)"],
        ["NFR-04", "Input Length Guard & IP Rate Limiting", "server.js (120 req/min, 2000 chars)", "test_master_verification.js (Test 25)", "VERIFIED (100%)"],
        ["NFR-05", "Accessible Focus Rings & Mobile UI", "DoctorConsultationPanel.tsx, index.css", "FollowUpPageStability.test.tsx", "VERIFIED (100%)"],
        ["NFR-06", "Prefers-Reduced-Motion Compliance", "useProgressiveText.ts (getPrefersReducedMotion)", "useProgressiveText.test.ts", "VERIFIED (100%)"]
    ]
    add_table(doc, rtm_headers, rtm_rows, [0.7, 2.0, 1.8, 1.3, 0.7])

def build_chapter_3(doc):
    add_heading_1(doc, "Chapter 3: Complete Technology Stack")
    
    add_heading_2(doc, "3.1 Technology Stack Inventory & Package Audit")
    add_para(doc, "Every technology in MediPath AI was verified directly against root package manifests and active imports. Unused legacy libraries were purged during Capstone V4 refactoring.", bold_prefix="Stack Verification: ")

    tech_headers = ["Layer / Component", "Technology", "Verified Version", "Exact Responsibility in MediPath AI"]
    tech_rows = [
        ["Frontend Core", "React", "18.3.1", "Component rendering, lifecycle management, hooks, concurrent DOM reconciliation"],
        ["Language (Frontend)", "TypeScript", "5.5.3", "Strict static type safety, data contract interfaces, build-time error prevention"],
        ["Build Tooling", "Vite", "5.4.1", "Hot module replacement (HMR), production bundling, tree-shaking (7.98s build)"],
        ["Styling System", "Tailwind CSS", "3.4.11", "Utility-first responsive styling, custom design tokens, dark-mode color palettes"],
        ["Component Library", "Radix UI Primitives", "Various (2024)", "Accessible headless dialogs, accordions, badges, dropdown menus"],
        ["Animation Engine", "Framer Motion", "11.5.4", "Fluid layout transitions, message entry animations, progressive disclosure"],
        ["Iconography", "Lucide React", "0.446.0", "Clean medical, clinical, navigation, and user-interface vector icons"],
        ["Speech Processing", "Web Speech API", "Browser Native", "Native speech recognition dictation in Indian English, Hindi, and Gujarati"],
        ["Backend Runtime", "Node.js", "v18.x / v20.x / v22.x", "Asynchronous event-driven JavaScript server environment and in-memory engine"],
        ["Backend Server", "Express.js", "4.18.2", "REST API routing, middleware execution, JSON body parsing, error handling"],
        ["Cross-Origin Handling", "CORS", "2.8.5", "Restricting cross-origin requests strictly to localhost:8080 and localhost:3000"],
        ["Fuzzy String Search", "Fuse.js", "7.0.0", "Fast bitap fuzzy city name matching against Indian city aliases (e.g. Surat, Gurgaon)"],
        ["Spreadsheet Parser", "xlsx (SheetJS)", "0.18.5", "Parsing hospital and dataset spreadsheets during data ingest and validation"],
        ["ML Training Core", "Scikit-Learn", "1.8.0 (Python)", "TF-IDF vectorizer training, Logistic Regression OvR fitting, threshold tuning"],
        ["Scientific Matrix", "NumPy & Pandas", "2.5.3 / 3.0.2", "Dataset curation, group stratification chi-square loss calculations"],
        ["External LLM Provider", "Google Gemini API", "v1beta REST", "Symptom normalization and translation with strict 3.5-second AbortController"],
        ["External Maps Search", "Google Places API", "REST Endpoints", "Live facility search with local 100 calls/day tracker and OSM fallback"],
        ["Frontend Test Runner", "Vitest", "3.2.4", "Fast unit and component integration testing with React Testing Library (74 tests)"],
        ["Backend Test Suite", "Node Test Runner", "Native Node.js", "Automated regression, parity, and behavioural test assertions (100% pass)"]
    ]
    add_table(doc, tech_headers, tech_rows, [1.4, 1.4, 1.1, 2.6])

    add_heading_2(doc, "3.2 Architectural Rationale for Core Technologies")
    add_para(doc, "Why React 18 & Vite? Vite provides instantaneous hot-module replacement and generates an optimized production bundle in under 8 seconds. React 18's functional components with hooks allow clean separation between chat streaming, speech recognition, and hospital filtering.", bold_prefix="Frontend Selection: ")
    add_para(doc, "Why Node.js In-Memory Inference instead of a Python Flask/FastAPI Microservice? In typical capstone projects, teams spawn Python microservices to serve scikit-learn models. This introduces inter-process HTTP latency (50–200 ms), high RAM overhead (Python runtime + PyTorch/scikit-learn libraries consuming 500MB+), and complex multi-service orchestration. MediPath AI exports the model as a closed-form weight matrix and executes TF-IDF dot products natively in Node.js. Inference runs in < 150 µs, uses zero child processes, and guarantees mathematical parity.", bold_prefix="Backend & Serving Selection: ")
    add_para(doc, "Why No Cloud Database Dependency? In healthcare navigation, user privacy is paramount. By keeping session state entirely within client memory (and passing state bidirectionally in API requests), MediPath AI prevents the persistence of sensitive medical complaints on unsecured cloud databases.", bold_prefix="Data Storage Selection: ")

def build_chapter_4(doc):
    add_heading_1(doc, "Chapter 4: Overall System Architecture")
    
    add_heading_2(doc, "4.1 Multi-Tier Architecture Overview")
    add_para(doc, "MediPath AI is architected as an event-driven, multi-tier distributed web application designed for high throughput, sub-millisecond machine learning inference, zero cloud database exposure, and uncompromising clinical safety. Operating under the stringent demands of healthcare navigation, the platform separates concerns cleanly across four distinct architectural tiers: Client Presentation, API Gateway & Security, Intelligent Clinical Services, and Persistence & Verified Data Registries.", bold_prefix="System Topology: ")
    
    add_figure(doc, "fig01_overall_architecture.png", "Figure 4.1", "MediPath AI Complete Overall System Architecture (Production Baseline)")

    add_para(doc, "The presentation tier executes completely within the client's modern web browser as a responsive Single Page Application (SPA) built with React 18.3, TypeScript, and Vite 5.4. It coordinates user interaction, real-time speech transcription via the Web Speech API (supporting English, Hindi, and Gujarati), dual-stream progressive typewriter rendering, and dynamic state management without requiring persistent client logins. Key modules include the DoctorConsultationPanel (managing turn-based medical triage, dynamic option chips, and unified text submission), the 56 Supported Diseases direct routing grid with pulse animations, the Model Diagnostics & 'Nerd Hub' modal (providing 3-model dataset previews and live CSV exports), and the ResultsView component (delivering 4-tier hospital recommendations, procedural cost breakdowns, and print-ready clinical summaries).", bold_prefix="Tier 1 — Client Presentation Tier (:8080): ")

    add_para(doc, "Operating on port 5000 as a hardened Node.js Express REST server, Tier 2 serves as the sole gateway between untrusted client inputs and backend evaluation services. It enforces a strict defensive middleware pipeline including CORS origin allowlisting (restricting access to authorized frontend origins), an in-memory sliding-window IP rate limiter (capped at 120 requests/minute per client), an input length guard rejecting payloads exceeding 2,000 characters, and request correlation ID tracing. Tier 2 routes traffic through specialized controllers: TriageController (/api/triage/chat) coordinates multi-turn evidence deduplication, emergency red-flag interceptors (evaluating 11 life-threatening criteria to trigger immediate emergency protocols), oncology safety guards, and lab screening advisories, while HospitalController (/api/hospitals/search) processes multi-criteria healthcare discovery.", bold_prefix="Tier 2 — API Gateway & Security Controller Tier (:5000): ")

    add_para(doc, "The intelligent services tier houses the system's core algorithmic and medical logic, engineered entirely for in-memory execution to eliminate inter-process latency. The centerpiece is the Model 2.0 In-Memory Engine, which evaluates 3,910 word unigram and bigram TF-IDF features across 56 independent One-vs-Rest (OvR) logistic sigmoid units in under 150 microseconds natively within Node.js, completely eliminating Python runtime overhead. The Consultation State Machine enforces clinical rigor—guaranteeing Turn-0 non-finalization, calculating real-time confidence deltas (+/- %), and applying differing symptom penalties. Tier 3 also hosts the Multilingual Translation Gateway (combining native script detectors, Google Gemini 3.5-Flash with a strict 3.5s AbortController timeout, and a 100% offline 280-symptom dictionary fallback) and the 4-Tier Hospital Recommendation & Procedural Costing Engine.", bold_prefix="Tier 3 — Intelligent Clinical Services & Inference Tier: ")

    add_para(doc, "To ensure zero data breach risk and instantaneous startup, Tier 4 avoids external database dependencies (e.g., PostgreSQL or MongoDB) in favor of immutable, verified in-memory static datasets. The Model 2.0 linear weight matrix JSON (5 MB) stores 56 x 3,910 weights, 56 biases, and the IDF vocabulary loaded directly into the V8 heap at server boot. The verified hospital registry (501 KB) encapsulates 920 healthcare institutions mapped across Indian Tier-1, Tier-2, and Tier-3 cities with geo-coordinates, tier accreditations, and specialties. In addition, Tier 4 integrates external cloud providers defensively: Google Places API is monitored via a 100 calls/day local quota tracker with automatic fallback to OpenStreetMap (Overpass API), and Google Gemini neural translation is isolated behind offline heuristic fallbacks.", bold_prefix="Tier 4 — Persistence, Verified Registries & External Providers: ")

    add_heading_3(doc, "Architectural Specification & Latency Envelope")
    add_para(doc, "The following matrix details the technical specifications, communication protocols, latency guarantees, and defensive fallback strategies across all four architectural tiers:", bold_prefix="Tier Interoperability: ")

    tier_headers = ["Architectural Tier", "Component / Module", "Protocol & Payload", "Latency Envelope", "Defensive Fallback Mechanism"]
    tier_rows = [
        ["Tier 1: Presentation", "React 18 SPA (:8080)", "Browser DOM / Web Speech", "< 16 ms (60 FPS UI)", "Typewriter smoothing, offline cached UI shell"],
        ["Tier 2: Gateway", "Express API (:5000)", "HTTP REST / JSON", "< 5 ms processing", "Payload rejection (HTTP 400), rate limiting (HTTP 429)"],
        ["Tier 3: Clinical ML", "Model 2.0 Engine", "Node.js Native In-Memory", "< 0.15 ms (< 150 µs)", "Rule-based emergency red flags & oncology safety guard"],
        ["Tier 3: Translation", "Multilingual Gateway", "Gemini REST / Heuristics", "200–800 ms (LLM)", "Strict 3.5s AbortController -> 280-symptom offline dictionary"],
        ["Tier 4: Persistence", "Model 2.0 JSON (5 MB)", "V8 Heap Reference", "< 0.01 ms (Direct RAM)", "Pre-boot validation with fallback to baseline model"],
        ["Tier 4: Hospital Data", "920 Hospitals JSON", "In-Memory Filter & Haversine", "< 10 ms (920 records)", "Synthetic city-center centroid & tier defaults"],
        ["Tier 4: Cloud Places", "Google Places API", "HTTPS REST with Quota Guard", "300–1,200 ms", "100 calls/day cap -> Overpass API -> Static 920 registry"]
    ]
    add_table(doc, tier_headers, tier_rows, [1.3, 1.4, 1.4, 1.2, 1.8])

    add_heading_2(doc, "4.2 System Context & External Boundaries")
    add_para(doc, "The system context diagram delineates the operational boundary between MediPath AI's internal components and external third-party services. The platform is designed with complete offline fallback capabilities: if external LLMs or Maps APIs fail or exhaust quotas, the core consultation and hospital discovery continue functioning uninterrupted via local heuristics and static datasets.", bold_prefix="Boundary Isolation: ")
    add_figure(doc, "fig02_system_context.png", "Figure 4.2", "System Context & External Boundary Diagram")

    add_heading_2(doc, "4.3 Component Architecture")
    add_para(doc, "The frontend component hierarchy is organized into modular UI organisms and molecules under src/components/medipath/. The Index.tsx page acts as the central state coordinator, managing transitions across home, consultation, loading, and results views.", bold_prefix="Frontend Organization: ")
    add_figure(doc, "fig03_frontend_component_architecture.png", "Figure 4.3", "Frontend Component Hierarchy and State Flow")

    add_para(doc, "The backend component architecture is structured around Express routes, specialized controllers, and in-memory evaluation services under backend/.", bold_prefix="Backend Organization: ")
    add_figure(doc, "fig04_backend_component_architecture.png", "Figure 4.4", "Backend Controller, Middleware & Service Architecture")

    add_heading_2(doc, "4.4 Runtime Deployment Topology")
    add_para(doc, "In the current production/capstone baseline, the system operates as a coordinated dual-process architecture launched via start-project.bat. Process 1 hosts the Express API on port 5000; Process 2 hosts the Vite dev server on port 8080. Production deployment compiles the frontend into static assets served via Nginx or Express static middleware.", bold_prefix="Deployment Topology: ")
    add_figure(doc, "fig05_deployment_architecture.png", "Figure 4.5", "Runtime Deployment & Process Architecture")

    add_heading_2(doc, "4.5 Data Flow & API Interactions")
    add_para(doc, "Data flows unidirectionally from patient input through language detection, canonical translation, in-memory ML inference, hospital matching, and UI rendering.", bold_prefix="Data Flow: ")
    add_figure(doc, "fig16_data_flow_diagram.png", "Figure 4.6", "System Level-1 Data Flow Diagram (DFD)")
    add_figure(doc, "fig17_api_interaction_diagram.png", "Figure 4.7", "Frontend-to-Backend REST API Interaction Diagram")

def build_chapter_5(doc):
    add_heading_1(doc, "Chapter 5: Repository and Codebase Reference")
    
    add_heading_2(doc, "5.1 Project Repository Hierarchy")
    add_para(doc, "The MediPath AI repository maintains a clean, decoupled directory structure separating backend services, frontend application, datasets, training notebooks, and test suites.", bold_prefix="Repository Structure: ")
    add_figure(doc, "fig19_folder_structure.png", "Figure 5.1", "Visual Directory Hierarchy and File Ownership Map")

    add_heading_2(doc, "5.2 Comprehensive Source File Catalog")
    add_para(doc, "The following catalog documents every critical source file, its architectural responsibility, inputs, outputs, and dependencies across the active codebase:", bold_prefix="File Inventory: ")

    file_headers = ["Relative File Path", "Architectural Responsibility", "Main Exports / Functions", "Inputs & Outputs"]
    file_rows = [
        ["start-project.bat", "One-click launcher script", "Port checking, process initialization", "Checks Node/npm, launches :5000 and :8080"],
        ["backend/server.js", "Backend Express bootstrap", "app, server instance", "Configures CORS, rate limiter, input guards, routes"],
        ["backend/controllers/triageController.js", "Triage & translation orchestrator", "chatTriage, translateTextEndpoint", "In: symptoms, chatHistory; Out: assessment, questions"],
        ["backend/controllers/hospitalController.js", "Hospital search & ranking engine", "searchHospitals, getHospitalById", "In: condition, filters, origin; Out: EnrichedHospital[]"],
        ["backend/models/symptomModel.js", "In-memory Model 2.0 serving engine", "evaluateDoctorClarity, predictConditions", "In: symptoms string; Out: probabilities, decisionState"],
        ["backend/services/translationService.js", "Multilingual translation gateway", "translateSymptomsToEnglish, translateText", "In: native text; Out: canonical English & localized strings"],
        ["backend/services/geminiProvider.js", "External LLM client with timeout", "callGemini, normalizeSymptoms", "In: prompts; Out: normalized text or offline fallback"],
        ["backend/services/hospitalProvider.js", "Geo-search & Google Places client", "searchGooglePlaces, searchOpenStreetMap", "In: coordinates, radius; Out: live place listings"],
        ["backend/routes/triage.js", "Triage API route declarations", "Express router (/chat, /translate)", "Maps HTTP endpoints to triageController"],
        ["backend/routes/hospitals.js", "Hospital API route declarations", "Express router (/search, /)", "Maps HTTP endpoints to hospitalController"],
        ["backend/data/hospitals.json", "Verified Indian hospital database", "920 hospital JSON records", "Static registry with specialties, tiers, ratings"],
        ["backend/models/MedP_AI_V2.0/symptom-model_MedP_AI_V2.0.json", "Trained Model 2.0 weight matrix", "W (56x3910), b (56), IDF, vocabulary", "In-memory inference weights for 56 conditions"],
        ["frontend/.../src/pages/Index.tsx", "Main application orchestrator", "Index page component", "Coordinates stage transitions (home, consult, results)"],
        ["frontend/.../DoctorConsultationPanel.tsx", "Interactive doctor triage engine", "DoctorConsultationPanel component", "Turn-based chat stream, option chips, unified submit"],
        ["frontend/.../ResultsView.tsx", "Hospital recommendations view", "ResultsView component", "Authoritative confidence display, filters, hospital cards"],
        ["frontend/.../ConfidenceMeter.tsx", "Visual confidence indicator", "ConfidenceMeter component", "Renders percentage bar or Safe Deferral notice"],
        ["frontend/.../CostBreakdown.tsx", "Procedural cost accordion", "CostBreakdown component", "Renders base, room, diagnostic, medicine breakdown"],
        ["frontend/.../ConsultationPrintSummary.tsx", "Printable clinical summary", "ConsultationPrintSummary component", "Compiles report header, safety notice, consultation log"],
        ["frontend/.../services/hospitalService.ts", "Frontend API client & types", "evaluateDoctorTriageV2, findHospitals", "HTTP client calling backend API with typed contracts"],
        ["frontend/.../lib/i18n.ts", "Multilingual localization dictionary", "t, localizeConditionName, localizeSpecialty", "Translations for English, Hindi, and Gujarati"],
        ["frontend/.../hooks/useProgressiveText.ts", "Typewriter text streaming hook", "useProgressiveText, streamText", "Fluid character streaming respecting motion preferences"],
        ["frontend/.../hooks/useSpeechRecognition.ts", "Voice dictation hook", "useSpeechRecognition", "Web Speech API wrapper for EN-IN, HI-IN, GU-IN"],
        ["frontend/.../DirectDiseaseRoutingState.tsx", "3-Node visual clinical routing UI", "DirectDiseaseRoutingState component", "Renders Direct Selection -> Clinical Department -> Hospital Recommendation"],
        ["frontend/.../HospitalRecommendations.tsx", "Multi-parameter filter & search engine", "HospitalRecommendations component", "10-facet real-time client-side filter pipeline and sorting"],
        ["frontend/.../services/searchHistoryService.ts", "Differentiated search history manager", "saveSearchHistory, getSearchHistory", "Saves and restores direct routing vs triage with model bypass"],
        ["doc_compilers/compile_handbook.py", "Technical handbook compilation engine", "build_handbook", "Generates comprehensive 25-chapter operations handbook in docx"],
        ["diagram_generators/generate_diagrams.py", "Architectural blueprint generator", "main diagram generator", "Generates 23 high-resolution system blueprints using matplotlib"],
        ["Documentations/", "Official capstone deliverable directory", "Handbook & specification documents", "Stores compiled .docx handbooks and models specification"],
        ["notebooks/train_v2_multilabel.py", "Complete reproducible ML training", "Main training & evaluation pipeline", "Curates dataset, group splits, benchmarks, exports JSON"],
        ["Datasets/symptom-based-disease-prediction-v2.xlsx", "Raw training dataset", "157,036 conversational records", "Curated source for Model 2.0 multi-label training"]
    ]
    add_table(doc, file_headers, file_rows, [1.8, 1.8, 1.4, 1.5])

print("Handbook Part 1 module compiled successfully.")
