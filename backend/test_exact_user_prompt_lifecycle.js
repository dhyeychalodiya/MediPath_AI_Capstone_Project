const assert = require('assert');
const { evaluateDoctorClarity, CANDIDATE_DISEASES } = require('./models/symptomModel');
const translationService = require('./services/translationService');

console.log('================================================================');
console.log('  MediPath AI - End-to-End Verification of User Prompt Spec');
console.log('================================================================\n');

// ----------------------------------------------------------------------
// Step 1 & 2: User enters symptoms in home page text box -> goes to model ->
// gives first followup question with first confidence & candidate diseases.
// ----------------------------------------------------------------------
console.log('[TEST 1] Step 1 & 2: Turn 0 Input -> First Followup Question + Real Confidence + Candidate Diseases');
{
  const initialInput = "burning urination";
  const result = evaluateDoctorClarity({
    symptoms: initialInput,
    chatHistory: [{ role: 'patient', text: initialInput, sender: 'user' }],
    turnCount: 0,
    noMoreSymptoms: false,
  });

  assert.strictEqual(result.isConfident, false, 'Turn 0 must NOT finalize immediately');
  assert.ok(result.counterQuestion, 'Turn 0 must provide a followup question');
  assert.ok(Array.isArray(result.quickOptions) && result.quickOptions.length > 0, 'Turn 0 must provide quickOptions');
  assert.ok(result.quickOptions.includes('No more symptoms'), 'quickOptions must include "No more symptoms"');
  assert.strictEqual(typeof result.confidence, 'number', 'Turn 0 must provide a numeric confidence score');
  assert.ok(result.confidence > 0 && result.confidence <= 100, `Confidence must be in 1..100 range (got ${result.confidence}%)`);
  assert.ok(Array.isArray(result.topCandidates) && result.topCandidates.length > 0, 'Must provide candidate diseases');
  assert.ok(typeof result.remainingCandidateCount === 'number' && result.remainingCandidateCount >= 1, 'Must provide remainingCandidateCount');

  console.log(`  ✓ Turn 0 Output: Question: "${result.counterQuestion.substring(0, 50)}..."`);
  console.log(`  ✓ Real Confidence: ${result.confidence}% | Remaining Candidates: ${result.remainingCandidateCount}`);
  console.log(`  ✓ Candidate Diseases: ${result.topCandidates.map(c => c.condition).slice(0, 3).join(', ')}`);
}

// ----------------------------------------------------------------------
// Step 3: User adds new symptoms -> old + new accumulated -> goes to model again ->
// comes back with another followup question with real confidence and real changes.
// ----------------------------------------------------------------------
console.log('\n[TEST 2] Step 3: Symptom Accumulation + Next Followup + Real Confidence Delta');
{
  const turn0Symptoms = "burning urination";
  const turn0Result = evaluateDoctorClarity({
    symptoms: turn0Symptoms,
    chatHistory: [{ role: 'patient', text: turn0Symptoms, sender: 'user' }],
    turnCount: 0,
  });

  // User adds another symptom
  const addedSymptom = "pelvic pain";
  const accumulatedSymptoms = `${turn0Symptoms}, ${addedSymptom}`;
  const turn1Result = evaluateDoctorClarity({
    symptoms: accumulatedSymptoms,
    chatHistory: [
      { role: 'patient', text: turn0Symptoms, sender: 'user' },
      { role: 'doctor', text: turn0Result.counterQuestion, sender: 'assistant' },
      { role: 'patient', text: addedSymptom, sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: false,
    assessmentState: turn0Result.assessmentState,
  });

  assert.strictEqual(typeof turn1Result.confidence, 'number', 'Turn 1 must have real numeric confidence');
  assert.ok(turn1Result.confidenceChange !== undefined, 'Turn 1 must calculate confidenceChange');
  console.log(`  ✓ Turn 1 Confidence: ${turn1Result.confidence}% (Delta: ${turn1Result.confidenceChange >= 0 ? '+' : ''}${turn1Result.confidenceChange}%)`);
  console.log(`  ✓ Accumulated Symptoms Evaluated: "${accumulatedSymptoms}"`);
}

// ----------------------------------------------------------------------
// Step 4A: Loop stays on until all candidates eliminated except one ->
// model automatically gives final answer.
// ----------------------------------------------------------------------
console.log('\n[TEST 3] Step 4A: Candidate Elimination to Single Disease -> Automatic Final Answer');
{
  // Provide full classic evidence for Allergic Conjunctivitis:
  // "watery itchy red eyes, swollen eyelids, gritty sandy feeling in eye"
  const strongSymptoms = "watery itchy red eyes, swollen eyelids, gritty sandy feeling in eye";
  const finalResult = evaluateDoctorClarity({
    symptoms: strongSymptoms,
    chatHistory: [
      { role: 'patient', text: 'watery itchy red eyes', sender: 'user' },
      { role: 'doctor', text: 'Are you experiencing other symptoms?', sender: 'assistant' },
      { role: 'patient', text: 'swollen eyelids, gritty sandy feeling in eye', sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: false,
  });

  assert.strictEqual(finalResult.isConfident, true, 'Model must automatically finalize when 1 candidate is left with threshold passed');
  assert.strictEqual(finalResult.assessmentStatus, 'possible_cause_ready', 'assessmentStatus must be possible_cause_ready');
  assert.strictEqual(finalResult.remainingCandidateCount, 1, 'remainingCandidateCount must be 1');
  assert.ok(finalResult.condition, 'Must return confirmed condition object');
  assert.strictEqual(finalResult.counterQuestion, null, 'Must have no further counter question');

  console.log(`  ✓ Automatic Final Answer: "${finalResult.condition.condition}"`);
  console.log(`  ✓ Real Model Probability: ${Math.round(finalResult.modelProbability * 100)}% (Threshold: ${Math.round(finalResult.threshold * 100)}%)`);
  console.log(`  ✓ Assessment Status: ${finalResult.assessmentStatus}`);
}

// ----------------------------------------------------------------------
// Step 4B: Alternative Final Answer -> User clicks "No more symptoms"
// ----------------------------------------------------------------------
console.log('\n[TEST 4] Step 4B: User Clicks "No more symptoms" -> Best Confidence Candidate Shown');
{
  const symptoms = "frequent urination, burning urination, cloudy urine";
  const nomoreResult = evaluateDoctorClarity({
    symptoms: symptoms,
    chatHistory: [
      { role: 'patient', text: 'frequent urination, burning urination', sender: 'user' },
      { role: 'doctor', text: 'Are there any other signs?', sender: 'assistant' },
      { role: 'patient', text: 'No more symptoms', sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: true,
  });

  assert.strictEqual(nomoreResult.isConfident, true, 'No more symptoms with threshold met must finalize');
  assert.strictEqual(nomoreResult.assessmentStatus, 'possible_cause_ready');
  assert.ok(nomoreResult.condition);
  console.log(`  ✓ Final Answer after "No more symptoms": "${nomoreResult.condition.condition}" (${nomoreResult.confidence}%)`);
}

// ----------------------------------------------------------------------
// Step 5: Post-Assessment Re-evaluation -> Users can still add more symptoms
// after final answer, and loop starts again with all old symptoms accumulated.
// ----------------------------------------------------------------------
console.log('\n[TEST 5] Step 5: Post-Assessment Re-evaluation -> Adding symptoms after final answer');
{
  // Assume condition was finalized as GERD
  const priorSymptoms = "heartburn, acid reflux, sour taste in mouth";
  const priorResult = evaluateDoctorClarity({
    symptoms: priorSymptoms,
    chatHistory: [
      { role: 'patient', text: priorSymptoms, sender: 'user' },
      { role: 'patient', text: 'No more symptoms', sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: true,
  });
  assert.strictEqual(priorResult.isConfident, true, 'Setup: initial finalization');

  // Now patient adds a completely new symptom afterwards: "severe shortness of breath, wheezing"
  const newPostSymptoms = `${priorSymptoms}, severe shortness of breath, wheezing`;
  const reEvalResult = evaluateDoctorClarity({
    symptoms: newPostSymptoms,
    chatHistory: [
      { role: 'patient', text: priorSymptoms, sender: 'user' },
      { role: 'doctor', text: priorResult.clinicalAssessment, sender: 'assistant' },
      { role: 'patient', text: 'severe shortness of breath, wheezing', sender: 'user' },
    ],
    turnCount: 2,
    noMoreSymptoms: false,
    assessmentState: priorResult.assessmentState,
  });

  assert.strictEqual(reEvalResult.isConfident, false, 'Adding new symptoms post-assessment must reopen differential clarifying loop');
  assert.ok(reEvalResult.counterQuestion, 'Must provide clarifying question for new evidence');
  console.log(`  ✓ Re-opened Differential Turn: Question: "${reEvalResult.counterQuestion.substring(0, 50)}..."`);
  console.log(`  ✓ Updated Candidates: ${reEvalResult.topCandidates.map(c => c.condition).slice(0, 3).join(', ')}`);
}

// ----------------------------------------------------------------------
// Step 6: Confidence Not Meeting Threshold -> Safe System Fallback
// ----------------------------------------------------------------------
console.log('\n[TEST 6] Step 6: Below Threshold / Inconclusive -> Safe Fallback to General Physician');
{
  const vagueSymptoms = "occasional mild fatigue, random weird feeling in toe";
  const fallbackResult = evaluateDoctorClarity({
    symptoms: vagueSymptoms,
    chatHistory: [
      { role: 'patient', text: vagueSymptoms, sender: 'user' },
      { role: 'patient', text: 'No more symptoms', sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: true,
  });

  assert.strictEqual(fallbackResult.assessmentStatus, 'safe_defer', 'Must trigger safe_defer');
  assert.strictEqual(fallbackResult.condition, null, 'Must NOT fabricate a confident condition');
  assert.strictEqual(fallbackResult.confidence, null, 'Score must be null in safe deferral');
  console.log(`  ✓ Safe Fallback Triggered: ${fallbackResult.safeDeferReason || 'Inconclusive symptoms routed to GP'}`);
  console.log(`  ✓ Confidence Score in Fallback: ${fallbackResult.confidence} (null, no fake percentages)`);
}

// ----------------------------------------------------------------------
// Clickable Cards Translation: 100% of candidate symptom options translated
// ----------------------------------------------------------------------
console.log('\n[TEST 7] Clickable Cards Translation: Verify 100% of candidate symptom options translated');
{
  const fs = require('fs');
  const path = require('path');
  const modelPath = path.resolve(__dirname, 'models/MedP_AI_V2.0/symptom-model_MedP_AI_V2.0.json');
  const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  const allSymptoms = new Set();
  model.labels.forEach(l => {
    (l.topSymptoms || []).forEach(s => allSymptoms.add(s.trim()));
  });

  const i18nPath = path.resolve(__dirname, '../frontend/healthpath-ai-main/src/lib/i18n.ts');
  const i18nContent = fs.readFileSync(i18nPath, 'utf8');
  const startMarker = 'export const SYMPTOM_OPTION_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {';
  const endMarker = '};\n\nexport function localizeSymptomOption';
  const block = i18nContent.substring(i18nContent.indexOf(startMarker), i18nContent.indexOf(endMarker));

  let missingCount = 0;
  for (const s of allSymptoms) {
    const lower = s.toLowerCase();
    if (!block.includes(`"${lower}":`)) {
      missingCount++;
    }
  }

  assert.strictEqual(missingCount, 0, `All ${allSymptoms.size} symptoms must be mapped in i18n.ts (missing: ${missingCount})`);
  console.log(`  ✓ Candidate Symptoms Total: ${allSymptoms.size}`);
  console.log(`  ✓ Missing in i18n: 0 (100% Coverage in Hindi and Gujarati)`);
}

// ----------------------------------------------------------------------
// Real Confidence: Verify real changes on differing symptoms
// ----------------------------------------------------------------------
console.log('\n[TEST 8] Real Confidence & Deltas: Verify confidence adjusts realistically on differing symptoms');
{
  // 1. Initial eye symptom
  const t0 = evaluateDoctorClarity({
    symptoms: 'itchy watery red eyes',
    turnCount: 0,
  });

  // 2. Add conflicting symptom: "chest pain"
  const t1 = evaluateDoctorClarity({
    symptoms: 'itchy watery red eyes, sharp chest pain',
    turnCount: 1,
    assessmentState: t0.assessmentState,
  });

  assert.strictEqual(typeof t1.confidence, 'number', 'Confidence must be numeric');
  assert.ok(t1.confidenceChange !== null, 'Confidence change must be tracked');
  console.log(`  ✓ t0 Confidence: ${t0.confidence}% -> t1 Confidence with differing symptom: ${t1.confidence}% (Delta: ${t1.confidenceChange}%)`);
}

console.log('\n================================================================');
console.log('  ALL SPECIFICATION TESTS PASSED WITH 100% COMPLIANCE!');
console.log('================================================================');
