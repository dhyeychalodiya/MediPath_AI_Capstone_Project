from handbook_foundation import (
    add_heading_1, add_heading_2, add_heading_3, add_para, add_bullet, 
    add_callout, add_figure, add_table, add_code_block,
    COLOR_NAVY, COLOR_SLATE, COLOR_TEAL, COLOR_MUTED
)

def build_chapter_11(doc):
    add_heading_1(doc, "Chapter 11: Consultation Engine and Follow-Up Algorithm")
    
    add_heading_2(doc, "11.1 The Clinical Consultation State Machine")
    add_para(doc, "The Doctor AI engine (symptomModel.js: evaluateDoctorClarity) implements an evidence-driven finite state machine governing patient triage. It replaces brittle keyword matching and arbitrary turn limits with medical safety rules and calibrated probabilities.", bold_prefix="State Machine Overview: ")
    add_figure(doc, "fig10_consultation_state_machine.png", "Figure 11.1", "MediPath AI Consultation Finite State Machine")

    add_heading_2(doc, "11.2 Mandatory Turn-0 Discriminative Follow-Up Guarantee")
    add_para(doc, "A cornerstone clinical principle of MediPath AI is the Turn-0 Non-Finalization Guarantee: Regardless of whether Model 2.0 assigns a 99% probability to a condition on the initial patient prompt, Turn 0 never presents a final disease assessment or triggers hospital recommendations. The engine always generates at least one medically discriminative follow-up question with curated symptom options. This eliminates premature clinical closure and forces confirmation of accompanying signs.", bold_prefix="Clinical Guarantee: ")

    add_heading_2(doc, "11.3 Deterministic Safety Overrides")
    add_para(doc, "Before machine learning inference is invoked, three deterministic safety guards evaluate the clinical text:", bold_prefix="Safety Priority: ")
    add_bullet(doc, "11 critical red-flag patterns (crushing chest pain radiating to arm, acute facial droop/slurred speech, severe breathlessness with blue lips, right-lower abdominal pain with fever, sudden vision loss, massive bleeding). If detected, all follow-up questions are bypassed immediately. The system outputs urgent emergency guidance (EMERGENCY_OVERRIDE) with modelProbability: null and directs the patient to 112/108 services.", bold_prefix="1. Emergency Warning Signs: ")
    add_bullet(doc, "Matches cancer, tumor, carcinoma, lymphoma, melanoma, or metastasis. Routes the patient to specialized oncological evaluation with safe_defer status and modelProbability: null, avoiding irresponsible automated classification.", bold_prefix="2. Cancer & Complex Condition Guard: ")
    add_bullet(doc, "Matches diabetes, hypertension, hyperthyroidism, or kidney failure without acute physical symptoms. Informs the user that definitive evaluation requires blood pressure measurement or blood testing, recommending clinical screening.", bold_prefix="3. Laboratory Screening Advisory: ")

    add_heading_2(doc, "11.4 Discriminative Question Generation and Option Filtering")
    add_para(doc, "When follow-up is needed, generateFollowUpTurn extracts the top candidates (modelProbability >= 0.10). It inspects their top representative symptoms, formats them into patient-friendly phrases (formatSymptomOption), and filters them:", bold_prefix="Option Curation: ")
    add_bullet(doc, "Excludes symptoms already confirmed or mentioned by the patient.", bold_prefix="Already Mentioned: ")
    add_bullet(doc, "Excludes options previously presented in prior turns (previouslyPresentedOptions) to eliminate repetitive inquiry.", bold_prefix="Duplicate Elimination: ")
    add_bullet(doc, "Rejects short words (<= 3 chars) or incomplete fragments (e.g., 'in ear', 'of eye', 'with pain') using INVALID_SYMPTOM_FRAGMENTS.", bold_prefix="Fragment Rejection: ")
    add_bullet(doc, "Selects a non-repeating question from a pool of 5 clinical inquiry templates.", bold_prefix="Question Rotation: ")
    add_bullet(doc, "Appends the universal control option 'No more symptoms'.", bold_prefix="Control Signal: ")

    add_heading_2(doc, "11.5 Control Signal Handling & Defensive Upper Bound")
    add_para(doc, "When the patient selects 'No more symptoms' (or types equivalent vernacular phrases like 'kuch nahi', 'kai nathi', 'bas'), questioning terminates immediately. The accumulated evidence is evaluated against class thresholds. If the threshold is satisfied, the assessment is displayed; otherwise, the engine outputs a safe clinical deferral. To prevent infinite loops with indecisive users, the engine enforces a defensive upper bound of MAX_FOLLOWUP_TURNS = 4 before concluding with safe referral.", bold_prefix="Stopping Logic: ")

    add_heading_2(doc, "11.6 Consultation Engine Pseudocode")
    add_para(doc, "The actual decision logic executed in symptomModel.js is formalized below:", bold_prefix="Formal Algorithm: ")
    
    algo_code = """FUNCTION evaluateDoctorClarity(symptoms, chatHistory, turnCount, noMoreSymptoms):
    // Phase 1: Input Validation & Emergency Red-Flag Checks
    IF text matches EMERGENCY_WARNING_PATTERNS:
        RETURN status: EMERGENCY_OVERRIDE, condition: emergencyAlert, confidence: null
    IF text matches CANCER_TUMOR_TERMS:
        RETURN status: SAFE_DEFER, condition: oncologySpecialistGuard, confidence: null
    IF text is empty OR matches NON_MEDICAL_GREETINGS OR GIBBERISH:
        RETURN status: NEEDS_MANDATORY_FOLLOWUP, fallbackQuestions, confidence: null

    // Phase 2: In-Memory Multi-Label Inference
    vector = TFIDF_Vectorize(normalizedText, vectorizer)
    FOR EACH condition k IN [1..56]:
        z_k = b_k + dot_product(W_k, vector)
        P_k = 1 / (1 + exp(-z_k))
    Sort conditions descending by P_k -> [top, second, ...]

    // Phase 3: Conversational Protocol & Stopping Rules
    IF turnCount == 0:
        // Turn-0 Non-Finalization Guarantee
        RETURN status: NEEDS_MANDATORY_FOLLOWUP, question: SelectQuestion(), options: CurateOptions(top, second)

    IF userSelectedNoMoreSymptoms:
        IF P_1 >= top.threshold AND P_1 >= 0.35 AND NOT isAmbiguous(P_1, P_2):
            RETURN status: POSSIBLE_CAUSE_READY, condition: top, confidence: round(P_1 * 100)
        ELSE:
            RETURN status: SAFE_DEFER, condition: generalMedicineFallback, confidence: null

    // User added new clinical symptom (turnCount >= 1)
    IF P_1 >= top.threshold AND P_1 >= 0.70 AND NOT isAmbiguous(P_1, P_2):
        RETURN status: POSSIBLE_CAUSE_READY, condition: top, confidence: round(P_1 * 100)
    ELSE IF turnCount >= 4 OR questionsExhausted:
        RETURN status: SAFE_DEFER, condition: generalMedicineFallback, confidence: null
    ELSE:
        RETURN status: NEEDS_MORE_INFORMATION, question: SelectNextQuestion(), options: CurateOptions(top, second)
END FUNCTION"""
    add_code_block(doc, algo_code)

    add_heading_2(doc, "11.7 The Exact 6-Step Multi-Turn Clarification and Candidate Elimination Lifecycle")
    add_para(doc, "The interaction lifecycle between the patient and Dr. MediPath adheres to a rigorous, six-stage clinical convergence protocol designed to systematically eliminate competing disease hypotheses while keeping the consultation open for continuous refinement:", bold_prefix="Lifecycle Architecture: ")
    add_bullet(doc, "The patient describes initial medical discomfort via the search bar on the landing page in natural conversational text, native Indic scripts, or voice dictation.", bold_prefix="Step 1 (Initial Complaint Entry): ")
    add_bullet(doc, "Model 2.0 performs sub-millisecond in-memory inference. In accordance with the Turn-0 non-finalization guarantee, the engine suppresses immediate diagnosis and generates the first discriminative follow-up inquiry with genuine baseline probability and top candidate hypotheses.", bold_prefix="Step 2 (Turn-0 Clarification & Candidate Seeding): ")
    add_bullet(doc, "The patient adds new symptoms or clicks interactive option cards. All prior evidence and new symptoms accumulate into a canonical clinical string. Model 2.0 re-evaluates the expanded feature vector, computing real-time confidence scores and dynamic deltas (ΔC = Ct - Ct-1).", bold_prefix="Step 3 (Progressive Symptom Accumulation & Delta Tracking): ")
    add_bullet(doc, "The consultation loop continues until competing candidates are eliminated down to one primary candidate (automatic resolution) OR the patient selects 'No more symptoms'. When 'No more symptoms' is clicked, the engine assesses whether the top candidate satisfies calibrated thresholds (0.79–0.85); if satisfied, the candidate card renders with genuine probability.", bold_prefix="Step 4 (Candidate Elimination & Conclusive Assessment): ")
    add_bullet(doc, "Unlike conventional diagnostic bots that terminate upon presenting a result, MediPath AI permits continuous post-assessment consultation. Patients can enter additional sensations at any point; all prior historical evidence is preserved, and the model dynamically updates candidate probabilities.", bold_prefix="Step 5 (Continuous Post-Assessment Consultation): ")
    add_bullet(doc, "When a patient introduces a symptom that conflicts with or diverges from prior candidates, the system applies semantic coherence dampening: C_penalized = max(0.35, 0.40 + 0.60 * coherence). This eliminates artificial confidence spikes and truthfully reflects clinical ambiguity.", bold_prefix="Step 6 (Differing Symptom Penalization & Coherence Dampening): ")

    add_figure(doc, "fig23_followup_six_step_lifecycle.png", "Figure 11.2", "Six-Stage Multi-Turn Clarification, Candidate Elimination, and Continuous Consultation Lifecycle")


def build_chapter_12(doc):
    add_heading_1(doc, "Chapter 12: Evidence Accumulation and Conversation State")
    
    add_heading_2(doc, "12.1 The Multi-Turn Evidence Lifecycle")
    add_para(doc, "A critical engineering vulnerability in healthcare chat systems is 'evidence loss'—where subsequent conversational turns overwrite initial complaints, or assistant text is accidentally tokenized by the classifier. MediPath AI implements a strict data segregation model:", bold_prefix="Evidence Segregation: ")
    add_bullet(doc, "The human-readable sequence of patient prompts and assistant responses rendered in the user interface. Stored in messages[].", bold_prefix="User-Visible Chat History: ")
    add_bullet(doc, "The cumulative, deduplicated string of confirmed patient medical complaints passed to Model 2.0 (canonicalSymptomsText). Assistant text and control signals are strictly excluded.", bold_prefix="Canonical Clinical Evidence: ")
    add_bullet(doc, "A structured JSON object (AssessmentState) passed bidirectionally between frontend and backend to preserve conversational context across HTTP stateless requests.", bold_prefix="Assessment State Contract: ")

    add_figure(doc, "fig11_evidence_accumulation_sequence.png", "Figure 12.1", "Multi-Turn Clinical Evidence Accumulation Sequence")

    add_heading_2(doc, "12.2 Assessment State Schema & Lifecycle")
    add_para(doc, "The table below details every field in the AssessmentState object and its lifecycle across consultation turns:", bold_prefix="State Data Dictionary: ")

    state_headers = ["Field Name", "Type", "Lifecycle / Update Mechanism", "Role in Inference"]
    state_rows = [
        ["initialSymptoms", "string", "Captured on Turn 0 from initial user input", "Permanent baseline complaint string"],
        ["additionalSymptoms", "string[]", "Appended when patient provides new details", "Merged into cumulative text vector"],
        ["confirmedSymptoms", "string[]", "Updated when patient clicks symptom chips", "Tracks confirmed medical evidence"],
        ["rejectedSymptoms", "string[]", "Updated when user selects 'No more symptoms'", "Prevents re-asking rejected symptoms"],
        ["askedQuestions", "string[]", "Appended each time assistant generates inquiry", "Prevents duplicate questions in chat"],
        ["previouslyPresentedOptions", "string[]", "Appended each time option chips are shown", "Prevents repeating identical chips"],
        ["currentCandidates", "object[]", "Updated by Model 2.0 on each evaluation turn", "Holds top 3–5 candidate conditions"],
        ["currentModelConfidence", "number|null", "Updated from top candidate probability", "Authoritative score for display & handoff"],
        ["mandatoryFirstFollowupCompleted", "boolean", "Set to true after Turn 0 response", "Enforces Turn 0 non-finalization rule"],
        ["assessmentStatus", "string", "Updated on every turn based on thresholds", "Controls UI state and hospital unlocking"]
    ]
    add_table(doc, state_headers, state_rows, [1.6, 0.9, 2.3, 1.7])

    add_heading_2(doc, "12.3 Clean String Deduplication & Token Extraction")
    add_para(doc, "When merging prior evidence with new inputs, triageController.js utilizes mergeSymptomTerms. The helper splits comma-separated strings, normalizes substrings to lowercase, eliminates duplicate tokens, and rejoins clean clinical phrases. Non-symptom conversational control phrases ('nothing else', 'none', 'bas') are identified via isConversationalControl and permanently excluded from the feature vector.", bold_prefix="Deduplication Mechanics: ")

    add_heading_2(doc, "12.4 Post-Assessment Continuous Consultation Mechanics")
    add_para(doc, "Unlike legacy tools that lock the chat once a condition card is rendered, MediPath AI keeps the consultation open. If the patient enters a new symptom (e.g. 'also noticing light sensitivity'), isPostAssessmentNewSymptom detects the addition. The engine preserves all prior symptoms, runs dynamic re-inference, and updates the candidate card in place without clearing conversational history.", bold_prefix="Continuous Chat: ")

def build_chapter_13(doc):
    add_heading_1(doc, "Chapter 13: Confidence and Assessment Decisions")
    
    add_heading_2(doc, "13.1 Anatomy of Clinical Confidence")
    add_para(doc, "A frequent source of critical error in healthcare AI is conflating raw mathematical probabilities with diagnostic certainty. MediPath AI establishes strict conceptual distinctions:", bold_prefix="Confidence Definitions: ")
    add_bullet(doc, "The mathematical output of the sigmoid activation: Pk in [0.0, 1.0]. Represents the model's posterior score relative to the training distribution.", bold_prefix="1. Classifier Probability (modelProbability): ")
    add_bullet(doc, "The integer percentage presented to the user: Math.round(P1 * 100), bounded to [0, 99%]. It is explicitly labeled as 'Model probability' and accompanied by non-diagnostic disclaimers.", bold_prefix="2. Displayed Confidence Score (confidence): ")
    add_bullet(doc, "The class-calibrated F1-optimal threshold tau_k in [0.79, 0.85]. A condition is accepted as a 'possible cause' only if Pk >= tau_k.", bold_prefix="3. Decision Threshold (threshold): ")

    add_figure(doc, "fig12_confidence_decision_flow.png", "Figure 13.1", "Authoritative Confidence & Assessment Decision Flowchart")

    add_heading_2(doc, "13.2 The Single Authoritative Confidence Contract")
    add_para(doc, "MediPath AI enforces a Single Authoritative Confidence Contract across all modules:", bold_prefix="Architectural Contract: ")
    add_bullet(doc, "Medical confidence is generated solely by Model 2.0 (symptomModel.js). Neither the frontend nor the hospital controller may recalculate or alter this score.", bold_prefix="Sole Authority: ")
    add_bullet(doc, "When the patient navigates to the hospital recommendations page (ResultsView.tsx), the identical confidence score is displayed. Hospital attributes (bed counts, star ratings, NABH status) are decoupled and never artificially inflate clinical confidence.", bold_prefix="Zero Score Inflation: ")
    add_bullet(doc, "Confidence changes between consecutive turns are displayed as dynamic real-time deltas (ΔC = Ct - Ct-1). When newly introduced symptoms reinforce the leading candidate, positive deltas (+5%, +12%) provide reassuring feedback; when divergent symptoms are entered, coherence penalization appropriately lowers confidence.", bold_prefix="Real-Time Delta Feedback: ")
    add_bullet(doc, "In safe-deferral, out-of-scope, or emergency states, confidence is strictly reported as null. Both the chat card and the hospital page consistently render 'Score unavailable (Safe Deferral)' rather than fabricating synthetic minimum percentages (such as 80%).", bold_prefix="Safe Deferral Display: ")


    add_heading_2(doc, "13.3 Dynamic Safe-Deferral Recovery Architecture")
    add_para(doc, "Clinical safe deferral is completely recoverable. When a patient initially provides vague inputs and triggers safe_defer, the chat session remains active. When the patient provides distinctive clinical symptoms in subsequent turns, the expanded evidence vector is re-evaluated. If thresholds are satisfied, the engine dynamically recovers to possible_cause_ready with the genuine calibrated confidence score.", bold_prefix="Recovery Mechanics: ")
    add_figure(doc, "fig13_safe_deferral_recovery_flow.png", "Figure 13.2", "Recoverable Safe-Deferral & Dynamic Re-Inference Flow")

def build_chapter_14(doc):
    add_heading_1(doc, "Chapter 14: Hospital Recommendation Engine")
    
    add_heading_2(doc, "14.1 Multi-Source Hospital Discovery Architecture")
    add_para(doc, "Hospital discovery is managed by hospitalController.js and hospitalProvider.js via a resilient multi-source architecture:", bold_prefix="Discovery Pipeline: ")
    add_bullet(doc, "The primary local database containing 920 verified medical facilities across Tier-1, Tier-2, and Tier-3 Indian cities. Sourced from backend/data/hospitals.json.", bold_prefix="1. Verified Local Registry: ")
    add_bullet(doc, "Queried for live nearby hospitals. Includes a local daily usage tracker capped at 100 calls/day. When the daily quota is reached, the system displays an informational banner and gracefully falls back to local data.", bold_prefix="2. Google Places API: ")
    add_bullet(doc, "Queried as an open-source geospatial fallback when Google Places is unconfigured or exhausted.", bold_prefix="3. OpenStreetMap (Overpass API): ")

    add_figure(doc, "fig14_hospital_recommendation_sequence.png", "Figure 14.1", "Hospital Recommendation & Geospatial Discovery Sequence")

    add_heading_2(doc, "14.2 Geographic Filtering & Indian City Alias Resolution")
    add_para(doc, "Patients can search within a specified radius (default 20 km) or filter by city and state. To handle spelling variations and historical city names across India, the system implements matchesCityFuzzy with Fuse.js and CITY_ALIASES (e.g. Bengaluru <-> Bangalore, Gurugram <-> Gurgaon, Mumbai <-> Bombay, Kolkata <-> Calcutta, Chennai <-> Madras, Kochi <-> Cochin).", bold_prefix="City Normalization: ")

    add_heading_2(doc, "14.3 Deterministic 4-Tier Matching & Ranking Formula")
    add_para(doc, "Unlike commercial portals that rank hospitals based on advertising bids, MediPath AI ranks facilities using an objective, clinically grounded 4-tier algorithm:", bold_prefix="Ranking Logic: ")
    add_bullet(doc, "Direct primary specialization match (e.g. Urology department for Urinary Tract Infection). Tier bonus: +400 points.", bold_prefix="Tier 1 (Primary Specialist): ")
    add_bullet(doc, "Facility offers the exact clinical procedure matching the condition (e.g. Lithotripsy for Kidney Stones). Tier bonus: +300 points.", bold_prefix="Tier 2 (Procedure Match): ")
    add_bullet(doc, "No nearby specialist found; routes to nearby General Medicine / Internal Medicine facility with an explicit referral notice: 'Showing General Medicine facilities for initial clinical evaluation'. Tier bonus: +200 points.", bold_prefix="Tier 3 (General Care Fallback): ")
    add_bullet(doc, "General regional referral hospital. Tier bonus: +100 points.", bold_prefix="Tier 4 (Regional Referral): ")

    add_figure(doc, "fig15_hospital_ranking_flow.png", "Figure 14.2", "Hospital Ranking Formula and Scoring Breakdown")

    add_heading_2(doc, "14.4 Ranking Score Weight Matrix")
    add_para(doc, "The exact mathematical match score is computed as follows:", bold_prefix="Scoring Formula: ")
    
    score_code = """BaseMatchScore = tierBonus 
                 + primarySpecialtyScore (40 pts)
                 + fallbackSpecialtyScore (15 pts)
                 + procedureScore (min(matchedProcedures/2, 1) * 30 pts)
                 + ratingScore ((googleRating / 5) * 10 pts)
                 + nabhScore (5 pts if NABH accredited)"""
    add_code_block(doc, score_code)

    add_heading_2(doc, "14.5 Client-Side Multi-Dimensional Interactive Filter Pipeline & Real-Time Faceting")
    add_para(doc, "To empower patients and healthcare navigators to refine discovery without triggering redundant server round-trips, MediPath AI implements a high-performance, client-side filtering and sorting pipeline inside HospitalRecommendations.tsx. Evaluated via React's useMemo hook, the pipeline applies 10 distinct parametric facets in real time:", bold_prefix="Interactive Faceting Engine: ")
    add_bullet(doc, "A debounced text search input allowing instant case-insensitive substring matching against hospital names (e.g. 'Apollo', 'Fortis', 'Manipal', 'Civil').", bold_prefix="1. Instant Facility Name Search: ")
    add_bullet(doc, "A targeted dropdown selector filtering facilities that offer specific clinical interventions (e.g. Angioplasty, Dialysis, Lithotripsy, Endoscopy) matching the identified condition profile.", bold_prefix="2. Procedure Roster Matching: ")
    add_bullet(doc, "A dynamically generated dropdown listing all medical specialties present in the current candidate set, allowing users to isolate specific departments (e.g. Cardiology, Orthopedics, Dermatology).", bold_prefix="3. Clinical Specialty Filter: ")
    add_bullet(doc, "An interactive range slider (5 km to 50+ km) dynamically filtering facilities based on calculated Haversine geodesic distance from user coordinates.", bold_prefix="4. Dynamic Distance Radius Slider: ")
    add_bullet(doc, "Interactive chips allowing multi-selection across clinical tiers: Tier 1 (Primary Specialist), Tier 2 (Procedure Match), Tier 3 (General Fallback), and Tier 4 (Regional Referral).", bold_prefix="5. Hospital Tier Multi-Select: ")
    add_bullet(doc, "Independent toggle switches for National Accreditation Board for Hospitals (NABH) certification, 24/7 Emergency and trauma availability, and current open operational status.", bold_prefix="6. Quality & Emergency Toggles: ")
    add_bullet(doc, "Threshold buttons filtering hospitals by verified Google patient review scores (All, 3.5+, 4.0+, 4.5+ stars).", bold_prefix="7. Minimum Google Star Rating: ")
    add_bullet(doc, "Interactive budget controls allowing users to select cost categories (Low, Medium, High) or drag a maximum budget slider (INR ₹10,000 to ₹500,000+), comparing against the condition's estimated total expense.", bold_prefix="8. Procedural Cost Range & Max Budget: ")
    add_bullet(doc, "A dynamic multi-criteria sort selector supporting Best Match (tier and composite score), Closest Distance (ascending km), Highest Rating (descending stars), and Lowest Procedural Cost (ascending INR ₹).", bold_prefix="9. Dynamic Sort Engine: ")
    add_bullet(doc, "Displays an active filter badge counter, a one-click 'Clear all filters' reset CTA, and a high-fidelity empty state rendering helpful advice when overly restrictive criteria yield zero matches.", bold_prefix="10. Filter State & Zero-Match Recovery: ")

def build_chapter_15(doc):
    add_heading_1(doc, "Chapter 15: Procedural Cost Estimation")
    
    add_heading_2(doc, "15.1 Clinical Cost Modeling in Indian Healthcare")
    add_para(doc, "Healthcare expenses in India vary drastically depending on hospital tier, room category, and clinical complexity. MediPath AI implements a transparent, fixed-formula procedural cost estimator across all 56 Model 2.0 conditions (backend/controllers/hospitalController.js: CONDITION_COST_PROFILES).", bold_prefix="Cost Modeling: ")

    add_heading_2(doc, "15.2 Cost Profile Schema and Tier Multipliers")
    add_para(doc, "Each condition profile defines realistic Indian Rupee (INR ₹) baselines:", bold_prefix="Profile Schema: ")
    add_bullet(doc, "min / max: Base outpatient consultation or procedural intervention range.", bold_prefix="Base Procedure: ")
    add_bullet(doc, "stayDays: Typical inpatient hospital admission duration (e.g. 0 days for Acne, 4 days for Pneumonia, 5 days for Osteoarthritis).", bold_prefix="Inpatient Stay: ")
    add_bullet(doc, "perDay: Daily room, nursing, and bed charges.", bold_prefix="Room Charges: ")
    add_bullet(doc, "diagnostics / medicines: Typical laboratory tests, imaging, and initial pharmacological expenses.", bold_prefix="Diagnostics & Meds: ")
    add_bullet(doc, "contingencyPct: A contingency buffer (5%–15%) covering incidental consumables.", bold_prefix="Contingency Buffer: ")

    add_para(doc, "Hospital-specific estimates are adjusted using deterministic multipliers:", bold_prefix="Multiplier Adjustments: ")
    add_bullet(doc, "Premium = 1.75x | Mid-tier = 1.00x | Budget = 0.60x", bold_prefix="Hospital Tier Multiplier (tierMult): ")
    add_bullet(doc, "NABH Accredited = 1.05x | Standard = 1.00x", bold_prefix="Accreditation Multiplier (nabhMult): ")

    add_heading_2(doc, "15.3 Cost Calculation Formula & Worked Examples")
    add_para(doc, "The total estimated cost range is calculated via:", bold_prefix="Mathematical Formula: ")
    
    cost_formula = """TotalMult = tierMult * nabhMult
SubtotalMin = (base.min + (stayDays * perDay) + diagnostics + medicines) * TotalMult
TotalEstimatedMin = SubtotalMin + round((SubtotalMin * contingencyPct) / 100)"""
    add_code_block(doc, cost_formula)

    add_para(doc, "Worked Example: Pneumonia (stayDays = 4, perDay = ₹4,500, diagnostics = ₹9,000, medicines = ₹8,000) at a Mid-tier NABH Hospital (TotalMult = 1.00 * 1.05 = 1.05):", bold_prefix="Numerical Walkthrough: ")
    add_bullet(doc, "Subtotal: (₹35,000 base + ₹18,000 room + ₹9,000 diag + ₹8,000 meds) * 1.05 = ₹73,500.", bold_prefix="Step 1 (Subtotal): ")
    add_bullet(doc, "Contingency (10%): ₹7,350.", bold_prefix="Step 2 (Contingency): ")
    add_bullet(doc, "Total Estimated Range: ₹80,850 – ₹1,48,500.", bold_prefix="Step 3 (Total Range): ")

    add_callout(doc,
        "DISCLAIMER ON PROCEDURAL COSTS: Cost figures presented in MediPath AI are algorithmic estimates based on regional Indian healthcare averages. "
        "They do not constitute binding commercial quotations. Actual hospital bills depend on attending physician fees, comorbid complications, "
        "bed category selected, and individualized therapeutic interventions.",
        title="TRANSPARENT PRICING & COST ESTIMATION NOTICE",
        alert_type="note"
    )

print("Handbook Part 3 module compiled successfully.")
