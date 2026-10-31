# MediPath AI (MedP_AI_V2.0) — Preliminary Symptom Navigation & Clinical Decision Support

[![Model](https://img.shields.io/badge/Model-MedP--AI--V2.0-blue.svg)](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/MEDP_AI_V2.0_MODEL_DOCUMENTATION.md)
[![Parity](https://img.shields.io/badge/Python%2FNode%20Parity-100.0%25%20(%CE%94%20%E2%89%A4%203.88e--16)-success.svg)](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_python_node_parity.js)
[![Behavioural Validation](https://img.shields.io/badge/Behavioural%20Validation-35%2F35%20(100%25)-brightgreen.svg)](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_behavioural_suite.js)
[![Master Verification](https://img.shields.io/badge/Master%20Verification-27%2F27%20Passed-blueviolet.svg)](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_master_verification.js)

**MediPath AI** is a preliminary symptom-navigation and hospital-recommendation system designed as an engineering capstone project. It assists users in identifying common, preliminary possible causes for their reported symptoms, asking focused discriminative follow-up questions, and navigating to appropriate medical specializations and verified healthcare facilities.

> [!CAUTION]
> **CRITICAL CLINICAL & NON-DIAGNOSTIC SCOPE DISCLAIMER**
> - MediPath AI is **NOT a medical diagnostic system** and **CANNOT diagnose diseases**.
> - Predictions are strictly **preliminary possible causes** based on user-entered text descriptions.
> - **A qualified healthcare professional must confirm the cause.**
> - MediPath AI is **not intended to diagnose cancer, tumors, rare diseases, or complex medical conditions**.
> - **Seek urgent medical care immediately if symptoms are severe, sudden, or worsening.**

---

## 1. System Navigation & Follow-Up Architecture

```
[1. User Symptom Input]
       │ (Natural language description)
       ▼
[2. Mandatory First Follow-Up (Turn 0)]
       │ (System ALWAYS asks at least 1 follow-up question before any finalization)
       │ (User may select chips, enter manual symptoms, or choose "No more symptoms")
       ▼
[3. Multi-Turn Evidence Evaluation]
       ├── Uncertain evidence ──► Continues asking non-repeated, discriminative follow-ups
       ├── User stops / "No more symptoms" ──► Finalizes possible cause or safely defers
       ├── Exhausted questions without clarity ──► Safe deferral to General Practitioner
       └── Emergency red flags detected ──► Immediate emergency care override
       ▼
[4. Carefully Qualified Possible Cause]
       │ ("Possible cause", "Not a medical diagnosis", class-calibrated probability)
       ▼
[5. Medical Specialization Guidance]
       │ (Target department, clinical procedures, and referral recommendations)
       ▼
[6. Strict Hospital Match vs. General-Care Fallback]
         (Verified specialist hospitals vs. General-care referral facilities)
```

### Mandatory First Follow-Up Rule
Even if Model 2.0 exhibits 99%+ statistical confidence on initial turn 0 input, the system **never displays a final possible cause immediately**. It always presents at least one relevant, patient-friendly follow-up question. This ensures that users who may have forgotten critical accompanying symptoms have the opportunity to provide complete context.

### Dynamic Follow-Up (No Arbitrary 3-Turn Cut-Off)
There is **no arbitrary 3-question or 3-turn cut-off**. Follow-up continues dynamically while the model is uncertain until:
1. Accumulated evidence meets class-specific confidence thresholds.
2. The user selects *"No more symptoms"*.
3. All relevant non-repeated questions are exhausted.
4. Safe deferral or emergency override triggers.

### Follow-Up Quality Safeguards
- **Question Deduplication:** Previously asked questions are tracked in bidirectional `assessmentState` and never repeated.
- **Option Deduplication:** Symptom chips already confirmed, rejected, or presented in previous turns are omitted.
- **Manual Input:** Users can type additional symptoms or sensations manually at any stage.
- **Negative Response Detection:** Robust multilingual regex and phrase matching detect negative answers (*"none"*, *"no more symptoms"*, *"kuch nahi"*).

---

## 2. Explicit Assessment State Management

The frontend and backend exchange an explicit, bidirectional `assessmentState` object with every request and response:

| State Field | Type | Description |
| :--- | :--- | :--- |
| `initialSymptoms` | `string` | Raw symptoms submitted in the first turn. |
| `additionalSymptoms` | `string[]` | Symptoms added during subsequent follow-up turns. |
| `confirmedSymptoms` | `string[]` | Symptoms confirmed as present by the user. |
| `rejectedSymptoms` | `string[]` | Symptoms rejected or excluded by the user. |
| `askedQuestions` | `string[]` | Complete history of questions already asked. |
| `previouslyPresentedOptions` | `string[]` | Complete history of symptom options shown. |
| `currentCandidates` | `Candidate[]` | Ranked differential diagnoses and probabilities. |
| `currentModelConfidence` | `number \| null` | Current model statistical probability. |
| `mandatoryFirstFollowupCompleted` | `boolean` | Flag ensuring Turn 0 follow-up was completed. |
| `userSelectedNoMoreSymptoms` | `boolean` | Flag indicating user requested assessment finalization. |
| `assessmentStatus` | `AssessmentStatus` | Current clinical workflow status (see below). |
| `safeDeferReason` | `string \| null` | Clinical rationale if safe deferral was triggered. |

### Assessment Status Taxonomy
- `needs_mandatory_followup`: Initial state requiring mandatory turn 0 follow-up.
- `needs_more_information`: Intermediate state where differential is still ambiguous.
- `possible_cause_ready`: Sufficient evidence gathered; qualified possible cause ready.
- `safe_defer`: Ambiguous, vague, or non-specific symptoms deferred to General Medicine.
- `emergency_override`: Acute life-threatening red flags intercepted by deterministic safety rules.

---

## 3. Model 2.0 (MedP_AI_V2.0) Safety & Benchmark

### Clinical Certainty vs. Model Probability
Model confidence represents **calibrated statistical alignment** against 56 primary-care symptom patterns in the training distribution. It is **not clinical certainty**. A 95% model probability means the reported words match the canonical pattern with high statistical likelihood, but **only an in-person medical evaluation with physical exam and diagnostics can confirm the diagnosis**.

### Benchmark Metrics (Untouched Test Partition)

| Metric | Score | Metric | Score |
| :--- | :---: | :--- | :---: |
| **Top-1 Hit Rate** | **88.19%** | **Micro Precision** | **0.8659** |
| **Top-3 Hit Rate** | **99.03%** | **Micro Recall** | **0.7158** |
| **Top-5 Hit Rate** | **99.80%** | **Micro F1** | **0.7837** |
| **LRAP** | **0.9160** | **Macro F1** | **0.7199** |
| **Hamming Loss** | **0.00762** | **Weighted F1** | **0.7766** |
| **Mean Brier Score** | **0.00624** | **ECE** | **0.0531** |

*Note: These benchmark values reflect validation performance on held-out synthetic/curated data and must not be presented as real-world clinical diagnostic accuracy.*

### Ambiguous Differential Disambiguation
Model 2.0 explicitly manages historically ambiguous medical pairs via targeted questions:
- **Otitis Externa vs. Otitis Media:** Disambiguated by ear canal discharge/itching vs. deep throbbing pain, fever, and tympanic fullness.
- **Panic Attack vs. Anxiety Disorder:** Disambiguated by sudden paroxysmal onset with palpitations vs. chronic persistent worry and muscle tension.
- **Contact Dermatitis vs. Allergic Urticaria:** Disambiguated by localized substance exposure vs. widespread hives, facial swelling, or food triggers.

---

## 4. Hospital Recommendations & Strict Category Distinctions

The platform maintains a strict distinction between:
1. **Verified Specialist Facilities (`verified_specialist`):** Hospitals verified in the registry to possess accredited departments for the target specialization (e.g., Urology, Cardiology, Dermatology).
2. **General-Care Referral Facilities (`general_care_fallback`):** Community hospitals and general facilities suitable for initial clinical evaluation, stabilization, and formal specialist referral.

If no verified specialist facility is available within the search radius, the system **explicitly displays a referral notice** and routes the patient to general-care facilities for initial medical evaluation.

---

## 5. Gemini Integration & Deterministic Safety Fallbacks

- **Primary Model:** Gemini 3.8 Flash (`gemini-3.8-flash`) is prioritized for generative explanation and multilingual symptom normalization.
- **Fallback Chain:** Verified fallback to `gemini-2.5-flash`, followed by an offline deterministic clinical triage engine.
- **Deterministic Override:** Gemini **never** independently controls emergency detection, confidence thresholds, input sanitization, or final safety decisions.
- **Resilience:** All generative AI calls enforce strict 3.5s timeouts with `AbortController` and validate outputs against rigid JSON schemas.

---

## 6. Privacy, Security & Repository Cleanliness

- **Secrets Management:** Real `.env` and `.env.local` files are strictly excluded via `.gitignore`. Version control contains only placeholder `.env.example` templates.
- **API Key Protection:** API keys are never exposed in frontend bundles, error messages, logs, or documentation.
- **Input Sanitization:** User inputs are validated, trimmed, and sanitized on both frontend and backend. Empty/whitespace-only input is rejected with HTTP 400.
- **Rate Limiting:** Backend Express routes enforce request rate-limiting and payload size caps.
- **Public Quota Route:** Unauthenticated public quota-reset routes (`/api/hospitals/reset-quota`) have been completely removed.

---

## 7. Clean Installation & Setup Instructions

### Prerequisites
- Node.js (v18.0 or higher)
- npm (v9.0 or higher)
- Python 3.10+ (for notebook training / parity verification scripts)

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/MediPath_AI_Capstone.git
cd MediPath_AI_Capstone

# 2. Setup Backend Environment
cd backend
cp .env.example .env
# Edit .env with your Google Places and Gemini API keys (keep private)
npm install

# 3. Setup Frontend Environment
cd ../frontend/healthpath-ai-main
cp .env.example .env
npm install
```

### Running Locally

```bash
# Terminal 1: Start Backend Server (Port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend Dev Server (Port 8080)
cd frontend/healthpath-ai-main
npm run dev
```

---

## 8. Verification & Test Suite Execution Commands

Run each verification suite from its respective directory:

### Backend Test Suites

```bash
cd backend

# 1. Master Verification Suite (27 Comprehensive Scenarios)
node test_master_verification.js

# 2. Python vs. Node.js Exact Bit-Level Parity Test (117 queries, Δ ≤ 3.88e-16)
node test_python_node_parity.js

# 3. Clinical & Negative Behavioral Test Suite (35 Test Cases)
node test_behavioural_suite.js

# 4. Multi-Turn Follow-Up & "No More Symptoms" Test Suite (5 Cases)
node test_followup_no_more_symptoms.js

# 5. Machine-Readable Artifact Consistency Suite (542 Assertions)
node test_artifact_consistency.js

# 6. Documentation Consistency Suite (44 Numerical Facts)
node test_documentation_consistency.js

# 7. End-to-End Hospital Navigation Integration Flow
node test_e2e_integration_flow.js

# 8. Model 2.0 In-Memory Engine Validation
node test_model_v2_validation.js
```

### Frontend Test Suites

```bash
cd frontend/healthpath-ai-main

# 1. TypeScript Strict-Mode Type Checking (Zero Errors)
npx tsc -p tsconfig.app.json --noEmit

# 2. Complete Project TypeScript Checking (Zero Errors)
npx tsc --noEmit

# 3. Vitest Unit & Consultation Test Suite (13 Files, 69 Tests Passed)
npm test

# 4. Production Bundle Build
npm run build
```

---

## 9. Repaired Consultation State Machine & Workflow Architecture

The consultation engine operates as a continuous, evidence-driven clinical navigation conversation that remains open and adaptive:

```
[Initial Symptom Input]
       │
       ▼
[Language Detection & Translation] (en, hi, gu, Romanized)
       │
       ▼
[Turn 0: needs_mandatory_followup] (Model 2.0 In-Memory Inference)
       ├── Emergency Override ──► Immediate Emergency Care Guidance
       └── Mandatory Follow-up ──► Counter question with curated symptom chips
             │
             ▼
[Subsequent Turns: Evidence Accumulation]
       ├── User Selects Chip or Types Accompanying Symptoms ──► Accumulated evidence re-evaluated
       ├── Inconclusive Evidence + "No more symptoms" ──► safe_defer (Score unavailable)
       │     └── User adds new distinctive symptoms ──► Dynamic Recovery with Model 2.0
       ├── Exhausted Question Pool (<= 4 turns) ──► General Practitioner safe deferral
       └── Sufficient Evidence / Threshold Passed ──► possible_cause_ready
             │
             ▼
[Rendered Candidate Condition Assessment Card]
       │
       ├── User Clicks "Find Hospitals" ──► Direct handoff with identical confidence score
       └── User types forgotten symptoms ──► CONTINUOUS CONVERSATION (Fresh Model 2.0 Re-evaluation)
```

### Key Engineering Invariants
1. **Continuous Consultation:** Presenting an assessment does not lock the interface. The user can type additional symptoms; the conversation history is preserved intact, and Model 2.0 dynamically re-evaluates the expanded evidence.
2. **Safe-Deferral Recovery:** Inconclusive symptoms return `assessmentStatus: "safe_defer"` with `confidence: null` (displayed as `Score unavailable (Safe Deferral)`). The user can enter additional symptoms at any time, allowing Model 2.0 to dynamically recover to a confident assessment without getting stuck.
3. **Single Authoritative Confidence Contract:** Model 2.0 is the sole authority for medical confidence. The confidence score is never fabricated, never increases simply from typing/translation, and is preserved identically on the hospital recommendations page (`ResultsView.tsx`) without distortion from hospital facility bonuses.
4. **Unified Input Submission:** `Enter` key and `Send` button call a single shared submission function (`handleUnifiedSubmit`). Submission input is cleared only upon successful acceptance; failed requests preserve the user's text for immediate retry.
5. **Multi-Page Printing:** `ConsultationPrintSummary.tsx` prints the complete chronological conversation, evidence accumulation, and authoritative assessment without viewport cutoff across multi-page layouts.

---

## 10. Capstone Upgrades: Frontend Redesign, Multilingual Support, Microphone Fix & AI Chat

In this upgrade milestone, four core enhancements were delivered across MediPath AI:

### Upgrade A: Frontend Redesign & Usability Improvements
- Modern, trustworthy clinical navigation UI built with Tailwind CSS, Lucide icons, and Radix primitives.
- Compact header branding, clear typography, refined color palette (calm teal/primary accents, clean dark-mode support), and WCAG-accessible contrast.
- Responsive desktop, tablet, and mobile layouts with safe-area spacing and keyboard protection.

### Upgrade B: Multilingual Consultation (Gemini Translation Layer + Model 2.0)
- **Clinical Model 2.0 Authority:** Model 2.0 remains the sole classifier and decision engine for 56 primary-care conditions.
- **Strict Translation Boundary:** Google Gemini (`gemini-3.5-flash-lite`, `gemini-3.5-flash`) operates **exclusively as a backend translation layer**. Gemini does not diagnose, score confidence, or decide triage status.
- **Languages Supported:** Prioritized for English (`en`), Hindi (`hi`), and Gujarati (`gu`), with dynamic fallback and extension to Bengali (`bn`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), Kannada (`kn`), and Punjabi (`pa`).
- **Medical Preservation:** Translation layer preserves negation (e.g., *"no fever"*), severity, body location, and duration, and maps vernacular symptom phrases to standard primary-care terms before vectorization.
- **Canonical Normalization:** Localized "No more symptoms" phrases (e.g., *"और कोई लक्षण नहीं"*, *"વધુ કોઈ લક્ષણો નથી"*) are parsed directly to canonical `'No more symptoms'` so they do not contaminate the symptom vector.

### Upgrade C: Microphone Speech-to-Text Root-Cause Resolution
- **Root Cause Diagnosed:** Chromium's `webkitSpeechRecognition` streams audio chunks to Google's cloud speech recognition endpoints. In environments where cloud speech servers are unreachable, blocked, or offline, Chromium fires a native `'network'` error.
- **Resolution:** Replaced raw error displays with `useSpeechRecognition` hook featuring granular state machine (`idle`, `requesting_permission`, `listening`, `processing`, `error`, `unsupported`), BCP-47 speech locales matching the selected conversation language (`hi-IN`, `gu-IN`, `en-IN`, etc.), permission checks, and an actionable explanation advising the user to continue by typing without crashing or losing the consultation.
- **Zero Auto-Submission:** Speech transcripts populate the input composer for manual review and editing before the patient chooses to send.

### Upgrade D: Full-Screen Conversational AI Experience & Progressive Reveal
- **Viewport Layout:** Full viewport height (`h-[100dvh]`) dedicated conversational interface (`fixed inset-0 z-50 bg-background flex flex-col`) with compact navigation header, clinical evidence drawer toggle, and printable summary.
- **Pinned Composer:** Bottom-anchored composer bar with integrated microphone control, active language indicator, and quick "Finished describing symptoms?" action.
- **Progressive Text Reveal:** Smooth chunked assistant text reveal with skip option, typing indicator, auto-scroll with floating jump-to-bottom button, and instant bypass for emergency red flags and `prefers-reduced-motion`.

---

## 11. Complete Test Verification Results

| Test Layer | Test Suite | Scope | Result |
| :--- | :--- | :--- | :---: |
| **Backend** | `test_master_verification.js` | 27 Core Triage, Safety & Deduplication Scenarios | **27 / 27 PASSED** (100%) |
| **Backend** | `test_multilingual_consultation.js` | Hindi, Gujarati, Hinglish & Translation Preservation | **13 / 13 PASSED** (100%) |
| **Backend** | `test_safe_deferral_recovery.js` | Safe Deferral & Dynamic Recovery with Model 2.0 | **7 / 7 PASSED** (100%) |
| **Backend** | `test_behavioural_suite.js` | 35 Real-World Primary Care & Negative Cases | **35 / 35 PASSED** (100%) |
| **Backend** | `test_python_node_parity.js` | Zero-Python Node.js Inference vs Scikit-Learn | **100% PARITY** ($\Delta \le 3.88 \times 10^{-16}$) |
| **Backend** | `test_e2e_integration_flow.js` | Full Symptom -> Triage -> Specialization -> Hospital Routing | **3 / 3 PASSED** (100%) |
| **Backend** | `test_artifact_consistency.js` | Hash, Split, Threshold & Class Index Alignments | **542 / 542 PASSED** (100%) |
| **Backend** | `test_documentation_consistency.js`| Programmatic Fact Consistency in Model Docs | **44 / 44 PASSED** (100%) |
| **Backend** | `test_post_assessment_live_flow.js`| Live HTTP Post-Assessment Re-evaluation & Deferral | **PASSED** (Live Server) |
| **Backend** | `test_e2e_live_server.js` | Live HTTP Multilingual & Hospital Routing Flow | **PASSED** (Live Server) |
| **Frontend** | `tsc --noEmit` | Strict TypeScript Type Checking | **0 ERRORS** |
| **Frontend** | `npm test` (Vitest) | 13 Test Files (Hospital Handoff, Chat, Enter/Send, Print) | **69 / 69 PASSED** (100%) |
| **Frontend** | `npm run build` | Production Vite Bundle Generation | **BUILT CLEANLY** (0 Errors) |

---

## 12. Documentation Index

- [Comprehensive Model 2.0 Documentation](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/MEDP_AI_V2.0_MODEL_DOCUMENTATION.md)
- [Backend API Service Guide](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/README.md)
- [Baseline Checkpoint Archive](file:///d:/MediPath_AI_Capstone/checkpoints/checkpoint_20261013_baseline.tar.gz)
- [Final Handover Package Archive](file:///d:/MediPath_AI_Capstone/checkpoints/medipath_ai_final_handover.tar.gz)


