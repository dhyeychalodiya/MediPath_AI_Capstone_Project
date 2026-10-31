# MediPath AI Backend Service (MedP_AI_V2.0)

Production-ready, clinical-decision-support backend powering the **MediPath AI** preliminary healthcare-navigation platform. Implements native zero-Python in-memory machine learning inference, multi-turn clinical triage, emergency red-flag interception, Gemini 3.8 Flash fallback integration, and geolocation-based hospital discovery.

> [!CAUTION]
> **PRELIMINARY & NON-DIAGNOSTIC SCOPE NOTICE**
> The MediPath AI backend provides preliminary healthcare navigation and symptom-based routing categories. It **does not provide medical diagnoses** and is **not intended to diagnose cancer, tumors, rare diseases, or complex conditions**. All outputs represent preliminary possible causes requiring confirmation by qualified healthcare professionals.

---

## 1. Architecture Overview

- **Runtime:** Node.js (v18+) & Express.js
- **Model Engine:** Zero-Python Native Inference via [`models/symptomModel.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/models/symptomModel.js) loading [`models/MedP_AI_V2.0/symptom-model_MedP_AI_V2.0.json`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/models/MedP_AI_V2.0/symptom-model_MedP_AI_V2.0.json).
- **Execution Speed:** $< 150\,\mu\text{s}$ per query with zero IPC or subprocess overhead.
- **Numerical Parity:** Exact closed-form sigmoid parity with Scikit-learn ($\Delta \le 3.88 \times 10^{-16}$).
- **Hospital Registry:** 920 verified Indian hospital facilities ([`data/hospitals.json`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/data/hospitals.json)) with live Google Places and OpenStreetMap Overpass API fallback.
- **Generative AI Provider:** Gemini 3.8 Flash (`gemini-3.8-flash`) with verified fallback to `gemini-2.5-flash` and deterministic offline rule fallback.

---

## 2. API Endpoints

### `POST /api/doctor/clarity`
Interactive, multi-turn clinical triage engine enforcing mandatory follow-up and explicit assessment state.

**Request Body:**
```json
{
  "symptoms": "painful burning urination and frequent urge to pee",
  "chatHistory": [
    { "role": "patient", "text": "painful burning urination and frequent urge to pee", "sender": "user" }
  ],
  "turnCount": 0,
  "noMoreSymptoms": false,
  "assessmentState": {
    "initialSymptoms": "painful burning urination and frequent urge to pee",
    "additionalSymptoms": [],
    "confirmedSymptoms": [],
    "rejectedSymptoms": [],
    "askedQuestions": [],
    "previouslyPresentedOptions": [],
    "currentCandidates": [],
    "currentModelConfidence": null,
    "mandatoryFirstFollowupCompleted": false,
    "userSelectedNoMoreSymptoms": false,
    "assessmentStatus": "needs_mandatory_followup"
  }
}
```

**Response (Turn 0 — Mandatory First Follow-Up):**
```json
{
  "isConfident": false,
  "confidence": 99,
  "assessmentStatus": "needs_mandatory_followup",
  "condition": "Urinary Tract Infection / UTI",
  "counterQuestion": "To help narrow down the possible cause, please select any accompanying symptoms you are experiencing, or select 'No more symptoms':",
  "quickOptions": [
    "Strong persistent urge to urinate",
    "Burning stinging sensation when urinating",
    "Passing frequent small amounts of urine",
    "Cloudy or strong-smelling urine",
    "Pelvic pressure or lower abdominal aching",
    "No more symptoms"
  ],
  "inputTokens": ["painful", "burning", "urination", "and", "frequent", "urge", "to", "pee"],
  "matchedMedicalTerms": ["painful urination", "burning urination", "frequent urge to pee"],
  "decisionSource": "ml_model",
  "assessmentState": {
    "mandatoryFirstFollowupCompleted": true,
    "assessmentStatus": "needs_more_information"
  }
}
```

**Response (Turn 1 — User Selects "No more symptoms" with Sufficient Evidence):**
```json
{
  "isConfident": true,
  "confidence": 99,
  "assessmentStatus": "possible_cause_ready",
  "topCondition": {
    "condition": "Urinary Tract Infection / UTI",
    "specialization": "Urology",
    "specializationTerms": ["urology", "nephrology", "general medicine", "general physician"],
    "procedure": "Urinalysis, Urine Culture & Targeted Antibiotic Regimen",
    "probability": 0.993,
    "threshold": 0.81
  },
  "clinicalAssessment": "Possible cause identified: Urinary Tract Infection / UTI. Based on the reported symptom pattern, this is the most likely initial category. Requires clinical confirmation by a qualified healthcare professional.",
  "recommendedNextStep": "We recommend scheduling a consultation with a Urology specialist for clinical confirmation and guidance."
}
```

---

### `POST /api/triage/evaluate`
Direct, single-turn multi-label condition prediction. Rejects empty or whitespace-only inputs with HTTP 400.

---

### `GET /api/hospitals/search`
Search hospital facilities by medical query and geographic location.

**Query Parameters:**
- `q`: Medical condition, procedure, or specialization (e.g. `Urology`, `Urinalysis`, `GERD`).
- `city`: Target Indian city (e.g. `Bengaluru`, `Mumbai`, `Chennai`).
- `lat` / `lon`: Optional geographic coordinates.
- `locationScope`: `city`, `state`, or `country`.

Hospitals are enriched with explicit match tiers:
- `verified_specialist` (Tier 1: primary specialization or procedure match)
- `general_care_fallback` (Tier 3: general-care referral facility)

---

## 3. Safety Guardrails & Deterministic Interceptions

1. **Emergency Red-Flag Interceptor:**
   - Detects acute crushing chest pain radiating to the jaw/arm, sudden facial droop, severe respiratory distress, or acute anaphylaxis.
   - Immediately overrides model inference: returns `assessmentStatus: "emergency_override"`, `decisionSource: "safety_rule"`, and bypasses routine follow-up questions.
2. **Oncology & Tumour Guard:**
   - Intercepts mentions of neoplasms, malignant tumours, cancer, and metastases.
   - Sets `decisionSource: "safety_rule"`, `modelProbability: null`, and directs the user to specialized in-person oncology evaluation.
3. **Conversational Greeting & Low-Information Fallback:**
   - Inputs such as *"hello"*, vague aches, or gibberish return `assessmentStatus: "safe_defer"`, `decisionSource: "fallback"`, `confidence: null`, and safely prompt the patient for specific clinical symptoms without hallucinatory condition routing.
4. **Dynamic Safe-Deferral Recovery:**
   - Safe deferral is completely recoverable. When a patient provides additional distinct clinical symptoms in subsequent turns, Model 2.0 re-evaluates the expanded evidence vector and transitions to `possible_cause_ready` when thresholds are met.
5. **No Arbitrary 3-Turn Cut-Off:**
   - Triage continues dynamically until evidence is sufficient, the user selects *"No more symptoms"*, or questions are exhausted (upper bound $\le 4$ turns), at which point the system safely defers to a General Practitioner.
6. **Authoritative Confidence Preservation:**
   - Medical confidence returned by Model 2.0 is passed verbatim to the hospital routing controller (`hospitalController.js`). Safe-deferral states pass `confidence: null` with `lowConfidence: true`. Medical confidence is never altered by hospital search ranking or facility count.

---

## 4. Verification & Testing Commands

Execute each suite from the `backend/` directory:

| Test Suite | File | Command | Scope |
| :--- | :--- | :--- | :---: |
| **Master Verification (27 Scenarios)** | [`test_master_verification.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_master_verification.js) | `node test_master_verification.js` | Triage, safety, deduplication |
| **Multilingual Consultation (13 Scenarios)** | [`test_multilingual_consultation.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_multilingual_consultation.js) | `node test_multilingual_consultation.js` | Hindi, Gujarati, Hinglish, Romanized |
| **Safe Deferral Recovery (7 Scenarios)** | [`test_safe_deferral_recovery.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_safe_deferral_recovery.js) | `node test_safe_deferral_recovery.js` | Deferral, dynamic recovery, red-flags |
| **Python vs Node Parity (117 Queries)** | [`test_python_node_parity.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_python_node_parity.js) | `node test_python_node_parity.js` | Exact closed-form sigmoid ($\Delta \le 3.88 \times 10^{-16}$) |
| **Behavioral Suite (35 Cases)** | [`test_behavioural_suite.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_behavioural_suite.js) | `node test_behavioural_suite.js` | Primary-care & negative clinical cases |
| **Multi-Turn & No More Symptoms** | [`test_followup_no_more_symptoms.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_followup_no_more_symptoms.js) | `node test_followup_no_more_symptoms.js` | Control signal isolation |
| **Artifact Consistency (542 Assertions)** | [`test_artifact_consistency.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_artifact_consistency.js) | `node test_artifact_consistency.js` | Model build hashes, split classes, F1 |
| **Documentation Consistency (44 Facts)** | [`test_documentation_consistency.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_documentation_consistency.js) | `node test_documentation_consistency.js` | Programmatic alignment with docs |
| **End-to-End Triage Flow** | [`test_e2e_integration_flow.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_e2e_integration_flow.js) | `node test_e2e_integration_flow.js` | Symptom -> Triage -> Specialist -> Facility |
| **Live Post-Assessment Workflow** | [`test_post_assessment_live_flow.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_post_assessment_live_flow.js) | `node test_post_assessment_live_flow.js` | Live HTTP post-assessment & deferral |
| **Live HTTP E2E Server Suite** | [`test_e2e_live_server.js`](file:///d:/MediPath_AI_Capstone/MediPath_AI_Capstone/backend/test_e2e_live_server.js) | `node test_e2e_live_server.js` | Live HTTP Multilingual & hospital routing |

---

## 5. Development Setup

```bash
cd backend
cp .env.example .env
# Configure your GOOGLE_PLACES_API_KEY and GEMINI_API_KEY in .env
npm install
npm run dev
# Server runs on http://localhost:5000
```