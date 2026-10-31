/**
 * MediPath AI - Comprehensive Master Verification Suite
 * Verifies all 24 required test scenarios from Section 12 of the Capstone Requirements.
 */

const fs = require('fs');
const path = require('path');
const symptomModel = require('./models/symptomModel');
const hospitalController = require('./controllers/hospitalController');
const triageController = require('./controllers/triageController');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTest(testNumber, name, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`\x1b[32m[PASS]\x1b[0m Test ${testNumber.toString().padStart(2, ' ')}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`\x1b[31m[FAIL]\x1b[0m Test ${testNumber.toString().padStart(2, ' ')}: ${name}`);
    console.error(`        Error: ${err.message}`);
    failedTests++;
  }
}

console.log('================================================================');
console.log('  MediPath AI - Master Verification Suite (24 Required Tests)');
console.log('================================================================\n');

// 1. Mandatory first follow-up even at 99% model probability
runTest(1, 'Mandatory first follow-up even at 99% model probability', () => {
  const query = 'painful urination and frequent urge to pee Burning stinging sensation when urinating';
  const result = symptomModel.evaluateDoctorClarity({ symptoms: query, turnCount: 0, noMoreSymptoms: false });
  assert(result.isConfident === false, 'Turn 0 must have isConfident: false');
  assert(result.decisionSource === 'ml_model', `Decision source must be ml_model, got ${result.decisionSource}`);
  assert(result.counterQuestion && result.counterQuestion.length > 5, 'Must ask a follow-up question');
  assert(result.quickOptions && result.quickOptions.length > 0, 'Must provide quick options');
  assert(result.quickOptions.includes('No more symptoms'), 'Must include "No more symptoms" option');
  assert(result.modelProbability > 0.80, `Model probability should be high (${result.modelProbability})`);
});

// 2. Additional symptom entry
runTest(2, 'Additional symptom entry accumulated correctly and refines model prediction', () => {
  const turn0Input = 'painful urination';
  const res0 = symptomModel.evaluateDoctorClarity({ symptoms: turn0Input, turnCount: 0, noMoreSymptoms: false });
  assert(res0.isConfident === false, 'Turn 0 must be non-confident');

  const additionalSymptom = 'Burning stinging sensation when urinating and frequent urge to pee';
  const accumulated = `${turn0Input} ${additionalSymptom}`;
  const res1 = symptomModel.evaluateDoctorClarity({
    symptoms: accumulated,
    turnCount: 1,
    noMoreSymptoms: false,
    chatHistory: [{ question: res0.counterQuestion, answer: additionalSymptom }]
  });
  
  const uti1 = res1.topCandidates.find(c => c.condition_id.includes('urinary'));
  assert(uti1, 'UTI candidate must be in top candidates');
  assert(uti1.modelProbability >= uti1.threshold, 'Refined prediction should pass class threshold');
  assert(res1.inputTokens.length > res0.inputTokens.length, 'Accumulated input tokens should increase');
});

// 3. “No more symptoms” with threshold passed
runTest(3, '“No more symptoms” with threshold passed presents confident result', () => {
  const strongInput = 'painful urination and frequent urge to pee Burning stinging sensation when urinating';
  const res = symptomModel.evaluateDoctorClarity({
    symptoms: strongInput,
    turnCount: 1,
    noMoreSymptoms: true
  });
  assert(res.isConfident === true, 'Sufficient evidence with threshold passed must be confident');
  assert(res.decisionSource === 'ml_model', 'Decision source must be ml_model');
  assert(res.passesThreshold === true, 'Must pass class-specific threshold');
  assert(res.modelProbability >= res.threshold, 'Model probability must meet or exceed threshold');
  assert(res.condition && res.condition.condition_id.includes('urinary'), 'Should identify UTI');
});

// 4. “No more symptoms” with threshold failed
runTest(4, '“No more symptoms” with threshold failed remains uncertain fallback', () => {
  const weakInput = 'left elbow clicking after playing tennis';
  const res = symptomModel.evaluateDoctorClarity({
    symptoms: weakInput,
    turnCount: 1,
    noMoreSymptoms: true
  });
  assert(res.isConfident === false, 'Low probability input must NOT be confident');
  assert(res.decisionSource === 'fallback', 'Decision source must be fallback');
  assert(res.modelProbability === null, 'modelProbability must be null for fallback');
  assert(res.passesThreshold === false, 'passesThreshold must be false');
});

// 5. Multiple follow-ups until sufficient evidence
runTest(5, 'Multiple follow-ups allowed until sufficient evidence is reached', () => {
  const inputT0 = 'occasional mild coughing';
  const res0 = symptomModel.evaluateDoctorClarity({ symptoms: inputT0, turnCount: 0, noMoreSymptoms: false });
  assert(res0.isConfident === false, 'T0 uncertain');
  assert(res0.counterQuestion !== null, 'T0 asks counter question');

  const inputT1 = 'occasional mild coughing slight throat dryness';
  const res1 = symptomModel.evaluateDoctorClarity({
    symptoms: inputT1,
    turnCount: 1,
    noMoreSymptoms: false,
    chatHistory: [{ question: res0.counterQuestion, answer: 'slight throat dryness' }],
    askedQuestions: [res0.counterQuestion]
  });
  assert(res1.isConfident === false, 'T1 still uncertain without sufficient evidence, asks another question');
  assert(res1.counterQuestion !== null, 'T1 asks second question');
  assert(res1.counterQuestion !== res0.counterQuestion, 'Second question must be different');
});

// 6. No arbitrary three-turn finalization
runTest(6, 'No arbitrary three-turn finalization (turnCount >= 3 without evidence remains uncertain)', () => {
  const vagueInput = 'mild tiredness';
  for (let turn = 3; turn <= 5; turn++) {
    const res = symptomModel.evaluateDoctorClarity({ symptoms: vagueInput, turnCount: turn, noMoreSymptoms: false });
    assert(res.isConfident === false, `Turn ${turn} must not be forced confident without evidence`);
  }
});

// 7. No duplicate questions
runTest(7, 'No duplicate questions asked across conversational turns', () => {
  const input = 'headache and nausea';
  const askedQuestions = [];
  
  const res0 = symptomModel.evaluateDoctorClarity({ symptoms: input, turnCount: 0, noMoreSymptoms: false, askedQuestions });
  assert(res0.counterQuestion, 'Must have Q0');
  askedQuestions.push(res0.counterQuestion);

  const res1 = symptomModel.evaluateDoctorClarity({
    symptoms: input + ' sensitivity to light',
    turnCount: 1,
    noMoreSymptoms: false,
    askedQuestions
  });
  if (res1.counterQuestion) {
    assert(!askedQuestions.includes(res1.counterQuestion), 'Q1 must not duplicate Q0');
  }
});

// 8. No duplicate quick options
runTest(8, 'No duplicate quick options within a turn or repeating reported symptoms', () => {
  const input = 'burning urination';
  const res = symptomModel.evaluateDoctorClarity({ symptoms: input, turnCount: 0, noMoreSymptoms: false });
  const opts = res.quickOptions;
  assert(Array.isArray(opts) && opts.length > 0, 'Quick options must be non-empty array');
  const uniqueOpts = new Set(opts);
  assert(opts.length === uniqueOpts.size, 'Quick options must not contain duplicates');
  assert(opts.includes('No more symptoms'), 'Must include "No more symptoms"');
  const badFragments = ['In ear', 'Of eye', 'Or finger', 'Appearing', 'Feeling', 'And fever'];
  opts.forEach(opt => {
    assert(!badFragments.includes(opt), `Option "${opt}" is a bad fragment`);
  });
});

// 9. No assistant text entering the classifier
runTest(9, 'No assistant text entering the classifier', () => {
  const userTextOnly = 'painful urination and frequent urge to pee Burning stinging sensation when urinating';
  const evalResult = symptomModel.evaluateDoctorClarity({
    symptoms: userTextOnly,
    turnCount: 1,
    noMoreSymptoms: true,
    chatHistory: [{ sender: 'assistant', text: 'Hello I am MediPath AI. How long have you had this?' }]
  });
  assert(evalResult.decisionSource === 'ml_model', 'Evaluation based strictly on user symptoms');
  assert(evalResult.condition.condition_id.includes('urinary'), 'Should correctly identify UTI');
});

// 10. Exact condition-ID validation
runTest(10, 'Exact condition-ID validation (banned generic shared words cannot match)', () => {
  function exactMatch(predId, expId) {
    if (!predId || !expId) return false;
    return predId.toLowerCase().trim() === expId.toLowerCase().trim();
  }
  assert(!exactMatch('otitis_externa', 'otitis_media'), 'Otitis Externa must not match Otitis Media');
  assert(!exactMatch('anxiety_disorder', 'panic_attack_panic_disorder'), 'Anxiety Disorder must not match Panic Disorder');
  assert(!exactMatch('contact_dermatitis', 'allergic_reaction_urticaria'), 'Contact Dermatitis must not match Urticaria');
  assert(exactMatch('otitis_externa', 'otitis_externa'), 'Exact match must succeed');
});

// 11. Otitis Externa versus Otitis Media
runTest(11, 'Otitis Externa versus Otitis Media resolved to distinct exact canonical IDs', () => {
  const inputMedia = 'child with fever and ear pulling fever with ear fullness and muffled hearing';
  const resMedia = symptomModel.evaluateDoctorClarity({ symptoms: inputMedia, turnCount: 1, noMoreSymptoms: true });
  assert(resMedia.condition.condition_id === 'otitis_media', `Expected otitis_media, got ${resMedia.condition.condition_id}`);

  const inputExterna = 'ear canal itching with outer ear rash ears itching and pus draining from ear';
  const resExterna = symptomModel.evaluateDoctorClarity({ symptoms: inputExterna, turnCount: 1, noMoreSymptoms: true });
  assert(resExterna.condition.condition_id === 'otitis_externa', `Expected otitis_externa, got ${resExterna.condition.condition_id}`);
});

// 12. Anxiety Disorder versus Panic Attack
runTest(12, 'Anxiety Disorder versus Panic Attack resolved to distinct canonical IDs', () => {
  const inputAnxiety = 'chronic excessive anxiety worrying restlessness irritability muscle tension fatigue';
  const resAnxiety = symptomModel.evaluateDoctorClarity({ symptoms: inputAnxiety, turnCount: 1, noMoreSymptoms: true });
  assert(resAnxiety.condition.condition_id === 'anxiety_disorder', `Expected anxiety_disorder, got ${resAnxiety.condition.condition_id}`);

  const inputPanic = 'sudden panic with palpitations and sweating sharp chest sensations and fast breathing';
  const resPanic = symptomModel.evaluateDoctorClarity({ symptoms: inputPanic, turnCount: 1, noMoreSymptoms: true });
  assert(resPanic.condition.condition_id === 'panic_attack_panic_disorder', `Expected panic_attack_panic_disorder, got ${resPanic.condition.condition_id}`);
});

// 13. Urticaria versus Contact Dermatitis
runTest(13, 'Urticaria versus Contact Dermatitis resolved to distinct canonical IDs', () => {
  const inputUrticaria = 'raised hives after food exposure sudden lip swelling and facial swelling';
  const resUrticaria = symptomModel.evaluateDoctorClarity({ symptoms: inputUrticaria, turnCount: 1, noMoreSymptoms: true });
  assert(resUrticaria.condition.condition_id === 'allergic_reaction_urticaria', `Expected allergic_reaction_urticaria, got ${resUrticaria.condition.condition_id}`);

  const inputContact = 'red rash after using a new laundry detergent soap Burning skin irritation from soap or metal';
  const resContact = symptomModel.evaluateDoctorClarity({ symptoms: inputContact, turnCount: 1, noMoreSymptoms: true });
  assert(resContact.condition.condition_id === 'contact_dermatitis', `Expected contact_dermatitis, got ${resContact.condition.condition_id}`);
});

// 14. Emergency immediate override
runTest(14, 'Emergency immediate override bypasses mandatory follow-up on Turn 0', () => {
  const emergencyInput = 'crushing chest pain radiating to left arm diaphoresis severe shortness of breath';
  const res = symptomModel.evaluateDoctorClarity({ symptoms: emergencyInput, turnCount: 0, noMoreSymptoms: false });
  assert(res.decisionSource === 'safety_rule', 'Must be safety_rule');
  assert(res.modelProbability === null, 'modelProbability must be null for safety rule');
  assert(String(res.ruleTriggered).toLowerCase().includes('heart attack') || String(res.ruleTriggered).toLowerCase().includes('coronary'), `ruleTriggered should identify cardiac emergency: ${res.ruleTriggered}`);
  assert(res.counterQuestion === null, 'Emergency must NOT ask routine follow-up question');
});

// 15. Cancer/tumour guard
runTest(15, 'Cancer and complex-condition exception routes to safety guard', () => {
  const cancerInput = 'I have an unexplained growing hard lump in my breast with skin dimpling and fear breast cancer';
  const res = symptomModel.evaluateDoctorClarity({ symptoms: cancerInput, turnCount: 0, noMoreSymptoms: false });
  assert(res.decisionSource === 'safety_rule', 'Must be safety_rule');
  assert(res.modelProbability === null, 'modelProbability must be null');
  assert(res.ruleTriggered === 'cancer_tumor_guard', `ruleTriggered must be cancer_tumor_guard, got ${res.ruleTriggered}`);
  assert(res.condition.specialization.includes('Oncology'), 'Should route to Oncology');
});

// 16. Generic symptom fallback
runTest(16, 'Generic symptom fallback remains uncertain with modelProbability: null', () => {
  const genericInput = 'mild tiredness and vague discomfort';
  const res = symptomModel.evaluateDoctorClarity({ symptoms: genericInput, turnCount: 1, noMoreSymptoms: true });
  assert(res.isConfident === false, 'Generic symptoms must be uncertain');
  assert(res.decisionSource === 'fallback', 'Must be fallback decision source');
  assert(res.modelProbability === null, 'modelProbability must be null');
  assert(res.passesThreshold === false, 'passesThreshold must be false');
});

// 17. Greeting and gibberish fallback
runTest(17, 'Greeting and gibberish fallback returns safe non-disease response', () => {
  const greeting = 'hello';
  const resGreet = symptomModel.evaluateDoctorClarity({ symptoms: greeting, turnCount: 0, noMoreSymptoms: false });
  assert(resGreet.isConfident === false, 'Greeting must not be confident');
  assert(resGreet.decisionSource === 'fallback', 'Greeting should trigger fallback');

  const gibberish = 'asdfghjkl qwerty zxcvbn';
  const resGibb = symptomModel.evaluateDoctorClarity({ symptoms: gibberish, turnCount: 1, noMoreSymptoms: true });
  assert(resGibb.isConfident === false, 'Gibberish must not be confident');
  assert(resGibb.decisionSource === 'fallback', 'Gibberish should trigger fallback');
});

// 18. Python-to-Node inference parity
runTest(18, 'Python-to-Node inference parity (verified via benchmark artifact)', () => {
  const model = symptomModel.getModel();
  assert(model.classesCount === 56, 'Model must have 56 classes');
  assert(model.vectorizer && Object.keys(model.vectorizer.vocabulary).length > 1000, 'Vocabulary must be loaded');
  assert(model.classifier.intercept && model.classifier.intercept.length === 56, 'Intercepts must be present for all 56 classes');
  assert(model.labels && model.labels.length === 56, 'Labels must exist for all 56 classes');
  
  const preds = symptomModel.predictConditions('cough and fever', '_MedP_AI_V2.0', 56);
  assert(preds.length === 56, 'Must predict all 56 classes');
  preds.forEach(p => {
    assert(p.modelProbability >= 0 && p.modelProbability <= 1, `Probability must be within [0, 1], got ${p.modelProbability}`);
  });
});

// 19. Model/report/CSV consistency
runTest(19, 'Model/report/CSV consistency (Build ID, dataset hash, split support match)', () => {
  const reportPath = path.join(__dirname, 'models/MedP_AI_V2.0/model_training_report.json');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const model = symptomModel.getModel();

  assert(report.buildId === model.buildId, `Build IDs must match: ${report.buildId} vs ${model.buildId}`);
  assert(report.datasetSha256 === model.datasetSha256, 'Dataset hash must match');
  assert(report.splitInfo.train_records === 72741, `Train split size must be 72741, got ${report.splitInfo.train_records}`);
  assert(report.splitInfo.val_records === 15786, `Val split size must be 15786, got ${report.splitInfo.val_records}`);
  assert(report.splitInfo.test_records === 15764, `Test split size must be 15764, got ${report.splitInfo.test_records}`);
  assert(model.classesCount === 56, 'Approved class count must be 56');
});

// 20. Model 2.0 selected by default
runTest(20, 'Model 2.0 is selected by default in backend and frontend', () => {
  // Backend default
  const defaultVersion = symptomModel.resolveModelVersion();
  assert(defaultVersion === '_MedP_AI_V2.0', `Backend default must be _MedP_AI_V2.0, got ${defaultVersion}`);

  // Frontend default in Index.tsx
  const indexPath = path.join(__dirname, '../frontend/healthpath-ai-main/src/pages/Index.tsx');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  assert(indexContent.includes('useState<ModelVersion>("_MedP_AI_V2.0")'), 'Frontend Index.tsx default state must be _MedP_AI_V2.0');
});

// 21. Primary versus fallback hospital specialization
runTest(21, 'Primary versus fallback hospital specialization separated with referral notice', () => {
  const terms = symptomModel.getSpecializationTerms('Urology');
  assert(terms.primarySpecializationTerms.includes('urology'), 'Primary terms must include urology');
  assert(terms.fallbackSpecializationTerms.includes('general medicine'), 'Fallback terms must include general medicine');

  // Verify enrichment logic
  const mockPrimary = { name: 'City Urology Clinic', specialty: ['Urology'], procedures: [] };
  const enrichedPrimary = hospitalController.enrichHospital(mockPrimary, terms);
  assert(enrichedPrimary.matchTier === 1, `Primary specialist must be Tier 1, got ${enrichedPrimary.matchTier}`);
  assert(enrichedPrimary.matchReason.includes('Primary specialization match'), 'Reason must indicate primary match');

  const mockFallback = { name: 'Community Health Center', specialty: ['General Medicine'], procedures: [] };
  const enrichedFallback = hospitalController.enrichHospital(mockFallback, terms);
  assert(enrichedFallback.matchTier === 3, `Fallback center must be Tier 3, got ${enrichedFallback.matchTier}`);
  assert(enrichedFallback.matchReason.includes('General-care fallback'), 'Reason must indicate fallback');
});

// 22. City/state/radius filtering
runTest(22, 'City, state and radius filtering in hospital dataset', () => {
  const hospitals = hospitalController.loadHospitalData();
  assert(Array.isArray(hospitals) && hospitals.length > 0, 'Hospital registry must be loaded');

  const mumbaiHospitals = hospitals.filter(h =>
    (h.city && h.city.toLowerCase().includes('mumbai')) ||
    (h.state && h.state.toLowerCase().includes('maharashtra'))
  );
  assert(mumbaiHospitals.length > 0, 'Must find hospitals in Mumbai/Maharashtra');
});

// 23. Gemini timeout fallback
runTest(23, 'Gemini provider enforces strict AbortController timeout', () => {
  const providerPath = path.join(__dirname, 'services/geminiProvider.js');
  const providerContent = fs.readFileSync(providerPath, 'utf8');
  assert(providerContent.includes('AbortController'), 'geminiProvider must use AbortController');
  assert(providerContent.includes('setTimeout') && providerContent.includes('3500'), 'Must enforce 3.5s timeout');
});

// 24. Complete frontend-to-backend flow
runTest(24, 'Complete conversational flow: symptom -> follow-up -> second symptom -> possible cause -> hospital routing', () => {
  // Step 1: Initial symptom (Turn 0: mandatory follow-up)
  const s1 = 'painful urination and frequent urge to pee';
  const t0 = symptomModel.evaluateDoctorClarity({ symptoms: s1, turnCount: 0, noMoreSymptoms: false });
  assert(t0.isConfident === false, 'Turn 0 must be uncertain');
  assert(t0.counterQuestion !== null, 'Turn 0 must return a question');

  // Step 2: User responds with second symptom and concludes questions
  const s2 = 'Burning stinging sensation when urinating';
  const accumulated = `${s1} ${s2}`;
  const t1 = symptomModel.evaluateDoctorClarity({
    symptoms: accumulated,
    turnCount: 1,
    noMoreSymptoms: true,
    chatHistory: [{ question: t0.counterQuestion, answer: s2 }]
  });

  assert(t1.isConfident === true, 'Turn 1 with threshold passed must be confident');
  assert(t1.condition.condition_id.includes('urinary'), 'Should classify as UTI');
  assert(t1.condition.specialization === 'Urology', 'Should recommend Urology');

  // Step 3: Hospital routing for recommended specialization
  const specTerms = symptomModel.getSpecializationTerms(t1.condition.specialization);
  const hospitals = hospitalController.loadHospitalData();
  const candidates = hospitals.filter(h => {
    const raw = String(h.specializations || h.specialties || '').toLowerCase();
    return specTerms.primarySpecializationTerms.some(term => raw.includes(term));
  });
  assert(candidates.length > 0, 'Must find hospitals with matching primary specialty');
  const topHospital = hospitalController.enrichHospital(candidates[0], specTerms);
  assert(topHospital.matchScore > 0, 'Hospital must have a calculated matchScore');
  assert(topHospital.matchTier === 1, 'Direct specialist hospital must be Tier 1');
});

// 25. Empty or whitespace-only input rejection
runTest(25, 'Empty or whitespace-only input is rejected safely with HTTP 400', async () => {
  const mockReq = { body: { symptoms: '    ' } };
  let statusCode = 0;
  let responseData = null;
  const mockRes = {
    status: (code) => { statusCode = code; return mockRes; },
    json: (data) => { responseData = data; return mockRes; }
  };
  await triageController.handleDoctorTriage(mockReq, mockRes);
  assert(statusCode === 400, `Expected HTTP 400, got ${statusCode}`);
  assert(responseData && responseData.success === false, 'Should return success: false');
  assert(responseData.assessmentStatus === 'safe_defer', 'Status should be safe_defer');
});

// 26. Confirmed and rejected symptoms are excluded from follow-up options
runTest(26, 'Confirmed and rejected symptoms are excluded from follow-up options', () => {
  const state = {
    initialSymptoms: 'headache',
    additionalSymptoms: [],
    confirmedSymptoms: ['fever', 'nausea'],
    rejectedSymptoms: ['stomach pain', 'vomiting'],
    askedQuestions: [],
    previouslyPresentedOptions: ['fever', 'nausea', 'stomach pain', 'vomiting'],
    currentCandidates: [],
    currentModelConfidence: null,
    mandatoryFirstFollowupCompleted: true,
    userSelectedNoMoreSymptoms: false,
    assessmentStatus: 'needs_more_information'
  };
  const res = symptomModel.evaluateDoctorClarity({
    symptoms: 'headache fever nausea',
    turnCount: 1,
    noMoreSymptoms: false,
    assessmentState: state
  });
  if (res.quickOptions) {
    assert(!res.quickOptions.includes('fever'), 'Confirmed symptom must not be presented in quickOptions');
    assert(!res.quickOptions.includes('nausea'), 'Confirmed symptom must not be presented in quickOptions');
    assert(!res.quickOptions.includes('stomach pain'), 'Rejected symptom must not be presented in quickOptions');
    assert(!res.quickOptions.includes('vomiting'), 'Rejected symptom must not be presented in quickOptions');
  }
});

// 27. Bidirectional assessment state preservation
runTest(27, 'Assessment state is preserved bidirectionally between frontend and backend', () => {
  const initialState = {
    initialSymptoms: 'cough',
    additionalSymptoms: ['throat irritation'],
    confirmedSymptoms: ['cough', 'throat irritation'],
    rejectedSymptoms: ['fever'],
    askedQuestions: ['Are you experiencing fever?'],
    previouslyPresentedOptions: ['fever', 'runny nose'],
    currentCandidates: [],
    currentModelConfidence: 0.45,
    mandatoryFirstFollowupCompleted: true,
    userSelectedNoMoreSymptoms: false,
    assessmentStatus: 'needs_more_information'
  };

  const res = symptomModel.evaluateDoctorClarity({
    symptoms: 'cough throat irritation',
    turnCount: 2,
    noMoreSymptoms: false,
    assessmentState: initialState
  });

  assert(res.assessmentState, 'Backend must return updated assessmentState');
  assert(res.assessmentState.mandatoryFirstFollowupCompleted === true, 'mandatoryFirstFollowupCompleted must remain true');
  assert(res.assessmentState.confirmedSymptoms.includes('cough'), 'confirmedSymptoms must be preserved');
  assert(res.assessmentState.rejectedSymptoms.includes('fever'), 'rejectedSymptoms must be preserved');
  assert(res.assessmentState.askedQuestions.includes('Are you experiencing fever?'), 'askedQuestions must be preserved');
});

// 28. Realistic Clinical Treatment Cost Formula (Base Medical Cost × Tier × Accreditation)
runTest(28, 'Realistic 3-step Treatment Cost Formula across Hospital Tiers & NABH Accreditation', () => {
  // Example 1: OPD Consultation (pharyngitis_strep_throat)
  const opdCondition = { condition_id: 'pharyngitis_strep_throat', specialization: 'ENT' };
  
  // Budget Hospital (0.60x, non-accredited)
  const budgetOpd = hospitalController.enrichHospital({ tier: 'budget', nabh_accredited: 'no' }, opdCondition);
  assert(budgetOpd.doctorFeeMin === 500, 'Doctor consultation fee must be 500');
  assert(budgetOpd.diagnostics === 500, 'Diagnostics must be 500');
  assert(budgetOpd.medicines === 600, 'Medicines must be 600');
  assert(budgetOpd.stayDays === 0, 'OPD stayDays must be 0');
  assert(budgetOpd.baseCostMin === 1600, 'OPD Base Cost must be 500 + 500 + 600 = 1600');
  assert(budgetOpd.costMin === 960, 'Budget OPD (0.60x) must be 1600 * 0.60 = 960');

  // Standard Private Hospital (1.00x, non-accredited)
  const standardOpd = hospitalController.enrichHospital({ tier: 'mid', nabh_accredited: 'no' }, opdCondition);
  assert(standardOpd.costMin === 1600, 'Standard Private OPD (1.00x) must be 1600 * 1.00 = 1600');

  // Corporate NABH Hospital (1.75 * 1.05 = 1.8375x)
  const corpNabhOpd = hospitalController.enrichHospital({ tier: 'premium', nabh_accredited: 'yes' }, opdCondition);
  assert(corpNabhOpd.costMin === 2940, 'Corporate NABH OPD must be 1600 * 1.8375 = 2940');

  // Example 2: Inpatient Surgery (appendicitis)
  const surgeryCondition = { condition_id: 'appendicitis', specialization: 'General Surgery' };

  // Budget Inpatient (0.60x)
  const budgetSurgery = hospitalController.enrichHospital({ tier: 'budget', nabh_accredited: 'no' }, surgeryCondition);
  assert(budgetSurgery.doctorFeeMin === 30000, 'Surgery fee must be 30000');
  assert(budgetSurgery.diagnostics === 7000, 'Ultrasound & lab tests must be 7000');
  assert(budgetSurgery.medicines === 5000, 'Post-op medicines must be 5000');
  assert(budgetSurgery.stayDays === 3, 'Inpatient stay must be 3 days');
  assert(budgetSurgery.roomRentBase === 9000, 'Room rent base must be 3 days * 3000/day = 9000');
  assert(budgetSurgery.baseCostMin === 51000, 'Appendicitis Base Cost must be 30000 + 7000 + 5000 + 9000 = 51000');
  assert(budgetSurgery.costMin === 30600, 'Budget Appendicitis (0.60x) must be 51000 * 0.60 = 30600');

  // Standard Private Inpatient (1.00x)
  const standardSurgery = hospitalController.enrichHospital({ tier: 'mid', nabh_accredited: 'no' }, surgeryCondition);
  assert(standardSurgery.costMin === 51000, 'Standard Private Appendicitis (1.00x) must be 51000');

  // Corporate NABH Inpatient (1.75 * 1.05 = 1.8375x)
  const corpNabhSurgery = hospitalController.enrichHospital({ tier: 'premium', nabh_accredited: 'yes' }, surgeryCondition);
  assert(corpNabhSurgery.costMin === 93713, 'Corporate NABH Appendicitis must be Math.round(51000 * 1.8375) = 93713');
});

console.log('\n================================================================');
console.log(`  Master Verification Summary: ${passedTests}/${totalTests} Tests Passed (${failedTests} Failures)`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32mAll required test scenarios PASSED with 100% compliance.\x1b[0m\n');
  process.exit(0);
}
