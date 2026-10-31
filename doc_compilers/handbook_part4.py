from handbook_foundation import (
    add_heading_1, add_heading_2, add_heading_3, add_para, add_bullet, 
    add_callout, add_figure, add_table, add_code_block,
    COLOR_NAVY, COLOR_SLATE, COLOR_TEAL, COLOR_MUTED
)

def build_chapter_16(doc):
    add_heading_1(doc, "Chapter 16: Printing, Summaries and User Experience")
    
    add_heading_2(doc, "16.1 Consultation Summary Component Architecture")
    add_para(doc, "ConsultationPrintSummary.tsx compiles consultation dialogues, candidate assessments, and care recommendations into a clean, physical document suitable for patients to carry to clinical appointments.", bold_prefix="Component Responsibility: ")
    add_figure(doc, "fig18_print_summary_flow.png", "Figure 16.1", "Consultation Summary & Multi-Page Printing Generation Flow")

    add_heading_2(doc, "16.2 Print Media Stylesheet Directives")
    add_para(doc, "The print summary is hidden during standard web browsing (print:block hidden) and formats automatically when window.print() is invoked:", bold_prefix="Print Layout Engine: ")
    add_bullet(doc, "Headers, non-diagnostic disclaimers, and assessment blocks enforce print-page-break-avoid (page-break-inside: avoid) to prevent awkward vertical slicing across paper pages.", bold_prefix="Page Break Protection: ")
    add_bullet(doc, "Interactive UI elements (typing indicators, option chips, action buttons) are filtered out, printing only completed clinical dialogue turns.", bold_prefix="Dialogue Filtering: ")
    add_bullet(doc, "The print view uses allCanonicalMessages directly, ensuring that the exported summary is complete even if the user clicks print while a progressive text animation is active.", bold_prefix="Animation Decoupling: ")

    add_heading_2(doc, "16.3 Structure of the Generated Medical Summary")
    add_para(doc, "The printed report contains six structured clinical sections:", bold_prefix="Report Sections: ")
    add_bullet(doc, "MediPath AI title, MedP_AI_V2.0 build tag, date, time, and active consultation language.", bold_prefix="1. Clinical Header: ")
    add_bullet(doc, "Prominent amber-bordered notice stating that the summary is preliminary navigation guidance and not a confirmed medical diagnosis.", bold_prefix="2. Non-Diagnostic Notice: ")
    add_bullet(doc, "Identified condition name, ICD-10 code, target medical specialization, and recommended next clinical steps.", bold_prefix="3. Authoritative Assessment: ")
    add_bullet(doc, "Genuine model probability percentage, or 'Score unavailable (Safe Deferral)' in deferred states.", bold_prefix="4. Confidence Meter: ")
    add_bullet(doc, "Baseline complaint and subsequent confirmed clinical details.", bold_prefix="5. Reported Symptoms: ")
    add_bullet(doc, "Complete chronological dialogue transcript between the patient and Doctor AI.", bold_prefix="6. Dialogue Transcript: ")

def build_chapter_17(doc):
    add_heading_1(doc, "Chapter 17: API Contracts and Data Schemas")
    
    add_heading_2(doc, "17.1 Internal Data Contract Specifications")
    add_para(doc, "The table below defines the formal data schemas exchanged between client and backend:", bold_prefix="Contract Specifications: ")

    contract_headers = ["Contract / Payload", "Producer -> Consumer", "Key Fields & Types", "Required / Optionality"]
    contract_rows = [
        ["Initial Triage Request", "Client -> TriageController", "symptoms (str), chatHistory (arr),\nturnCount (int), language (str)", "symptoms: Required\nturnCount: Required (0 on start)"],
        ["Follow-Up Submission", "Client -> TriageController", "symptoms (str), canonicalSymptoms (str),\nnoMoreSymptoms (bool), assessmentState (obj)", "symptoms: Required\nnoMoreSymptoms: Required"],
        ["Triage Response", "TriageController -> Client", "assessmentStatus (str), isConfident (bool),\ncondition (obj), confidence (int|null),\ncounterQuestion (str|null), quickOptions (arr)", "assessmentStatus: Required\nconfidence: Nullable on deferral"],
        ["Hospital Search Request", "Client -> HospitalController", "condition (obj), filters (obj),\norigin {lat, lng}, city (str), state (str)", "filters: Required\norigin: Required"],
        ["Hospital Search Response", "HospitalController -> Client", "condition (obj), hospitals (arr of EnrichedHospital),\ntotalFound (int), dataSource (str)", "hospitals: Required\ntotalFound: Required"]
    ]
    add_table(doc, contract_headers, contract_rows, [1.5, 1.5, 2.0, 1.5])

    add_heading_2(doc, "17.2 Field-by-Field Data Dictionary")
    add_para(doc, "Detailed dictionary for DoctorTriageV2Result and EnrichedHospital:", bold_prefix="Data Dictionary: ")
    add_bullet(doc, "Enumeration: 'needs_mandatory_followup' | 'needs_more_information' | 'possible_cause_ready' | 'safe_defer' | 'emergency_override'.", bold_prefix="assessmentStatus: ")
    add_bullet(doc, "Integer in [0, 99] or null. Authoritative probability score from Model 2.0.", bold_prefix="confidence: ")
    add_bullet(doc, "Float rounded to 4 decimals (e.g. 0.9824). Exact model sigmoid posterior probability.", bold_prefix="modelProbability: ")
    add_bullet(doc, "Float threshold for the top condition (e.g. 0.83). Condition accepted only if modelProbability >= threshold.", bold_prefix="threshold: ")
    add_bullet(doc, "String identifying the decision mechanism: 'ml_model' | 'safety_rule' | 'fallback' | 'direct_routing'.", bold_prefix="decisionSource: ")
    add_bullet(doc, "Boolean flag indicating whether the query originated from the 56 Supported Diseases directory or General Medicine card, signaling the application to bypass ML inference completely.", bold_prefix="isDirectRouting / directRouting: ")
    add_bullet(doc, "Integer (1..4) indicating hospital clinical alignment. 1 = Primary Specialist, 2 = Procedure, 3 = General Fallback, 4 = Referral.", bold_prefix="matchTier: ")

def build_chapter_18(doc):
    add_heading_1(doc, "Chapter 18: Security, Privacy and Clinical Safety")
    
    add_heading_2(doc, "18.1 Patient Privacy and Ephemeral State Architecture")
    add_para(doc, "In strict compliance with healthcare ethics, MediPath AI processes patient symptoms ephemerally in client memory. No medical complaints, symptoms, or consultation transcripts are stored in persistent databases. When the browser session closes, all clinical data is wiped from memory.", bold_prefix="Privacy Architecture: ")

    add_heading_2(doc, "18.2 API Hardening and Denial-of-Service Defenses")
    add_para(doc, "The backend Express API implements multi-layer defense mechanisms:", bold_prefix="Security Defenses: ")
    add_bullet(doc, "All /api routes enforce a 2,000-character payload length guard, preventing buffer overflow and memory bloat attacks.", bold_prefix="1. Payload Length Ceiling: ")
    add_bullet(doc, "An in-memory IP rate limiter restricts client requests to 120 calls per minute.", bold_prefix="2. IP Rate Limiting: ")
    add_bullet(doc, "Requests matching emergency regex warning patterns are permanently exempt from rate limiting to guarantee life-safety availability.", bold_prefix="3. Emergency Exemption: ")
    add_bullet(doc, "CORS origin validation restricts API calls strictly to approved local development and production URLs.", bold_prefix="4. CORS Strict Allowlist: ")
    add_bullet(doc, "API keys for Gemini and Google Places are stored strictly in backend server environment variables (.env) and never leaked to frontend browser clients.", bold_prefix="5. Encapsulation of Secrets: ")

    add_heading_2(doc, "18.3 Clinical Safety Standards and Language Directives")
    add_para(doc, "MediPath AI enforces strict language standards to prevent user misunderstanding:", bold_prefix="Clinical Safety Directives: ")
    add_bullet(doc, "Permitted Phrases: 'Possible cause', 'Possible symptom pattern', 'Most likely initial category', 'Requires clinical confirmation', 'Model probability'.", bold_prefix="Approved Terminology: ")
    add_bullet(doc, "Prohibited Phrases: 'Confirmed diagnosis', 'Diagnostic certainty', 'Virtually guaranteed', 'You are suffering from...'.", bold_prefix="Prohibited Terminology: ")

    add_heading_2(doc, "18.4 Firebase Authentication, Differentiated Search History & Model-Bypass Restoration")
    add_para(doc, "MediPath AI integrates cloud identity and session persistence via Firebase Auth and Cloud Firestore (searchHistoryService.ts, SearchHistoryDialog.tsx):", bold_prefix="User Session Architecture: ")
    add_bullet(doc, "Supports Google OAuth, Email/Password login, and anonymous guest sessions. Live connection state is reported via the header telemetry pill.", bold_prefix="1. Multi-Provider Authentication: ")
    add_bullet(doc, "History records explicitly record search provenance. Conversational symptom triage saves reported symptom strings with decisionSource: 'ml_model' | 'rule', while direct routing saves condition metadata with isDirectRouting: true, directRouting: true, and decisionSource: 'direct_routing'.", bold_prefix="2. Dual-Mode Search History Schema: ")
    add_bullet(doc, "When a user reloads a direct routing history item, the engine detects isDirectRouting and completely bypasses the ML model (predictConditions), immediately restoring the canonical condition assessment and hospital matching. Conversely, symptom history items restore conversational triage for continuous clinical inquiry.", bold_prefix="3. Deterministic Model-Bypass Restoration: ")
    add_bullet(doc, "History is persisted to both the Firestore user document (searchHistory array) and an indexed subcollection (users/{uid}/search_history/{id}), with automatic graceful fallback to browser localStorage (medipath_search_history) for unauthenticated guests.", bold_prefix="4. Dual Firestore Storage & Local Fallback: ")
    add_bullet(doc, "Users can review previous searches with visual category badges, delete individual history items atomically, or purge their entire consultation log with optimistic UI updates.", bold_prefix="5. Granular User History Control: ")

def build_chapter_19(doc):
    add_heading_1(doc, "Chapter 19: Installation and Local Development")
    
    add_heading_2(doc, "19.1 Prerequisites and Environment Setup")
    add_para(doc, "Running MediPath AI locally requires the following verified tools:", bold_prefix="Prerequisites: ")
    add_bullet(doc, "Node.js v18.0.0 or higher (v18, v20, and v22 verified).", bold_prefix="Node.js: ")
    add_bullet(doc, "npm v9.0.0 or higher.", bold_prefix="Package Manager: ")
    add_bullet(doc, "Python 3.12 or 3.13 (required only for offline model retraining; not needed for runtime serving).", bold_prefix="Python Runtime: ")

    add_heading_2(doc, "19.2 Automated Startup: One-Click Launcher")
    add_para(doc, "The primary method to launch MediPath AI on Windows is the root launcher script:", bold_prefix="One-Click Execution: ")
    add_code_block(doc, ":: From repository root directory:\nstart-project.bat\n\n:: Or to force-restart active ports (5000 and 8080):\nstart-project.bat --restart")

    add_heading_2(doc, "19.3 Manual Development Startup Commands")
    add_para(doc, "Developers can also start the frontend and backend in separate terminals:", bold_prefix="Manual Setup: ")
    add_code_block(doc, "# Terminal 1: Backend API (:5000)\ncd backend\ncopy .env.example .env\nnpm install\nnode server.js\n\n# Terminal 2: Frontend SPA (:8080)\ncd frontend/healthpath-ai-main\ncopy .env.example .env\nnpm install\nnpm run dev")

    add_heading_2(doc, "19.4 Environment Variable Templates (.env.example)")
    add_para(doc, "Safe placeholder configuration templates:", bold_prefix="Configuration: ")
    add_code_block(doc, "# backend/.env\nPORT=5000\nFRONTEND_URL=http://localhost:8080,http://localhost:3000\nGEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE\nGOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_KEY_HERE\n\n# frontend/healthpath-ai-main/.env\nVITE_API_BASE_URL=http://localhost:5000/api")

def build_chapter_20(doc):
    add_heading_1(doc, "Chapter 20: Testing and Verification")
    
    add_heading_2(doc, "20.1 Comprehensive Testing Architecture")
    add_para(doc, "The MediPath AI test architecture encompasses unit, integration, behavioural, and parity test suites across both backend and frontend environments.", bold_prefix="Testing Methodology: ")

    add_heading_2(doc, "20.2 Backend Test Results (100% Pass Rate)")
    add_para(doc, "All 11 backend test suites were executed against the active codebase:", bold_prefix="Backend Test Audit: ")

    test_b_headers = ["Test Suite Script", "Purpose / Focus Area", "Cases", "Pass Rate"]
    test_b_rows = [
        ["test_master_verification.js", "27 core functional requirements & clinical safety rules", "27 / 27", "100.0% PASS"],
        ["test_multilingual_consultation.js", "Hindi, Gujarati, Romanized input & negation checks", "13 / 13", "100.0% PASS"],
        ["test_safe_deferral_recovery.js", "Safe deferral recovery & MAX_FOLLOWUP bound", "7 / 7", "100.0% PASS"],
        ["test_behavioural_suite.js", "Clinical triage scenarios across 6-status taxonomy", "35 / 35", "100.0% PASS"],
        ["test_python_node_parity.js", "Closed-form probability parity against scikit-learn", "117 queries", "100.0% PASS (max diff 3.88e-16)"],
        ["test_artifact_consistency.js", "Machine-readable model consistency assertions", "542 assertions", "100.0% PASS"],
        ["test_documentation_consistency.js", "Numerical verification against documentation", "44 assertions", "100.0% PASS"],
        ["test_e2e_integration_flow.js", "Multi-turn consultation to hospital discovery flow", "3 scenarios", "100.0% PASS"],
        ["test_post_assessment_live_flow.js", "Continuous consultation after assessment display", "Live HTTP flow", "100.0% PASS"],
        ["test_live_romanized_triage.js", "Live Romanized input translation & classification", "Live HTTP flow", "100.0% PASS"],
        ["test_followup_no_more_symptoms.js", "Control signal termination & threshold check", "Live HTTP flow", "100.0% PASS"]
    ]
    add_table(doc, test_b_headers, test_b_rows, [1.8, 2.3, 1.2, 1.2])

    add_heading_2(doc, "20.3 Frontend Test Results (Vitest & TypeScript)")
    add_para(doc, "Frontend tests executed using Vitest 3.2.4 and TypeScript strict checks across the complete user workflow:", bold_prefix="Frontend Test Audit: ")
    add_bullet(doc, "16 test files executed; 97 tests passed out of 97 tests (100.0% pass rate in 37.56s). Includes dedicated test suites verifying the direct disease model bypass, 3-node visual clinical loading state, 10-parameter hospital recommendation filters, and differentiated Firebase search history persistence.", bold_prefix="Vitest Test Suites: ")
    add_bullet(doc, "DirectRoutingAndFilterFixes.test.tsx (10 tests) verifies: (1) 100% Direct Selection badge, (2) Real-time hospital name search, (3) Specialty dropdown filtering, (4) Clinical tier multi-select, (5) NABH accreditation toggle, (6) Max budget slider filtering, (7) One-click 'Clear all filters' CTA, (8) Direct routing ML model bypass, (9) Differentiated search history schema persistence, and (10) Model bypass on history restoration.", bold_prefix="Direct Routing & Filter Fixes Suite: ")
    add_bullet(doc, "NerdHubAndSupportedDiseases.test.tsx (13 tests) verifies the 56 Supported Diseases direct routing grid, Model Diagnostics & Nerd Hub dataset preview modal, verified hospital registry explorer, and multilingual translations (English, Hindi, Gujarati).", bold_prefix="Nerd Hub & Supported Diseases Suite: ")
    add_bullet(doc, "Clean npx tsc --noEmit with 0 type errors under strict TypeScript compiler options.", bold_prefix="TypeScript Strict Check: ")
    add_bullet(doc, "Clean production bundle generated in 7.98 seconds with 0 warnings or errors.", bold_prefix="Vite Production Build: ")

print("Handbook Part 4 module compiled successfully.")
