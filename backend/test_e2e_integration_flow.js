/**
 * End-to-End Clinical Navigation & Triage Integration Flow Test
 * Verifies the complete lifecycle required by the prompt:
 * symptom input → follow-up questions → possible causes → specialization → hospital recommendation
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { evaluateDoctorClarity, loadModel } = require('./models/symptomModel');

console.log('===================================================================');
console.log('MEDIPATH AI MODEL 2.0 — END-TO-END INTEGRATION TEST SUITE');
console.log('===================================================================\n');

// Load hospital database for verification
const hospitalsPath = path.join(__dirname, 'data', 'hospitals.json');
let hospitals = [];
if (fs.existsSync(hospitalsPath)) {
  hospitals = JSON.parse(fs.readFileSync(hospitalsPath, 'utf8'));
}
console.log(`Loaded ${hospitals.length} verified hospitals from registry.\n`);

function findHospitalsForSpecialization(specialization, specializationTerms = []) {
  const queryTerms = [specialization.toLowerCase(), ...specializationTerms.map(t => t.toLowerCase())];
  return hospitals.filter(h => {
    const specsStr = typeof h.specializations === 'string' ? h.specializations : (Array.isArray(h.specializations) ? h.specializations.join(' ') : (h.specialties ? String(h.specialties) : ''));
    const procsStr = typeof h.procedures_offered === 'string' ? h.procedures_offered : '';
    const nameStr = h.hospital_name || h.name || '';
    const allText = `${nameStr} ${specsStr} ${procsStr} ${h.tier || ''}`.toLowerCase();
    return queryTerms.some(term => allText.includes(term));
  });
}

const scenarios = [
  {
    name: 'Scenario 1: Urological Symptoms (UTI)',
    initialInput: 'painful burning urination and frequent urge to pee',
    expectedCondition: 'Urinary Tract Infection / UTI',
    expectedSpecialist: 'Urology',
  },
  {
    name: 'Scenario 2: Gastrointestinal Symptoms (GERD)',
    initialInput: 'heartburn after meals with sour acid regurgitation in mouth',
    expectedCondition: 'Gastroesophageal Reflux Disease / GERD',
    expectedSpecialist: 'Gastroenterology',
  },
  {
    name: 'Scenario 3: Musculoskeletal Joint Symptoms (Osteoarthritis)',
    initialInput: 'severe knee pain and morning stiffness while climbing stairs with creaking joint',
    expectedCondition: 'Osteoarthritis',
    expectedSpecialist: 'Orthopedics',
  },
];

let scenariosPassed = 0;

scenarios.forEach((sc, index) => {
  console.log(`-------------------------------------------------------------------`);
  console.log(`RUNNING ${sc.name.toUpperCase()}`);
  console.log(`-------------------------------------------------------------------`);

  // STEP 1: Symptom Input
  console.log(`[Step 1: Symptom Input] Patient inputs: "${sc.initialInput}"`);
  const turn0 = evaluateDoctorClarity({
    symptoms: sc.initialInput,
    chatHistory: [{ role: 'patient', text: sc.initialInput, sender: 'user' }],
    turnCount: 0,
    noMoreSymptoms: false,
  });

  // STEP 2: Follow-Up Questions (Mandatory follow-up before finalization)
  console.log(`[Step 2: Follow-Up Questions]`);
  assert.strictEqual(turn0.isConfident, false, 'Turn 0 must not finalize immediately; must ask follow-up questions');
  assert.ok(turn0.counterQuestion, 'Turn 0 must return a clarifying counter question');
  assert.ok(Array.isArray(turn0.quickOptions) && turn0.quickOptions.length >= 3, 'Turn 0 must return curated quick options');
  assert.ok(turn0.quickOptions.includes('No more symptoms'), 'quickOptions must include "No more symptoms"');
  console.log(`   Follow-up Question: "${turn0.counterQuestion}"`);
  console.log(`   Quick Options: [${turn0.quickOptions.slice(0, 4).join(', ')}...]`);

  // STEP 3: Possible Causes Identification (User clicks "No more symptoms")
  console.log(`[Step 3: Possible Causes] Patient clicks "No more symptoms"`);
  const turn1 = evaluateDoctorClarity({
    symptoms: sc.initialInput,
    chatHistory: [
      { role: 'patient', text: sc.initialInput, sender: 'user' },
      { role: 'assistant', text: turn0.counterQuestion, sender: 'assistant' },
      { role: 'patient', text: 'No more symptoms', sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: true,
  });

  assert.strictEqual(turn1.isConfident, true, 'Turn 1 after "No more symptoms" must reach a confident conclusion');
  assert.ok(turn1.topCondition, 'Turn 1 must produce a confirmed topCondition object');
  assert.strictEqual(turn1.topCondition.condition, sc.expectedCondition, `Expected ${sc.expectedCondition}, got ${turn1.topCondition.condition}`);
  assert.ok(turn1.modelProbability > 0.40, `Model probability should be confident (>0.40), got ${turn1.modelProbability}`);
  console.log(`   Identified Possible Cause: "${turn1.topCondition.condition}"`);
  console.log(`   Model Probability: ${(turn1.modelProbability * 100).toFixed(1)}% | Threshold: ${turn1.topCondition.threshold}`);
  console.log(`   Clinical Assessment: "${turn1.clinicalAssessment}"`);

  // STEP 4: Specialization Recommendation
  console.log(`[Step 4: Specialization Recommendation]`);
  const spec = turn1.topCondition.specialization;
  const specTerms = turn1.topCondition.specializationTerms || [spec];
  assert.strictEqual(spec, sc.expectedSpecialist, `Expected specialist ${sc.expectedSpecialist}, got ${spec}`);
  console.log(`   Recommended Clinical Specialization: ${spec}`);
  console.log(`   Specialization Terms for Routing: [${specTerms.join(', ')}]`);
  console.log(`   Recommended Procedure: ${turn1.topCondition.procedure}`);
  console.log(`   Recommended Next Step: "${turn1.recommendedNextStep}"`);

  // STEP 5: Hospital Recommendation
  console.log(`[Step 5: Hospital Recommendation] Searching facilities with ${spec} departments...`);
  const matchingHospitals = findHospitalsForSpecialization(spec, specTerms);
  assert.ok(matchingHospitals.length > 0, `Must find matching hospitals for ${spec}`);
  console.log(`   Found ${matchingHospitals.length} matching hospitals in registry.`);
  console.log(`   Top 3 Recommended Hospitals:`);
  matchingHospitals.slice(0, 3).forEach((h, hIdx) => {
    const hName = h.hospital_name || h.name;
    const hTier = h.tier || h.type || 'General/Multi-specialty';
    console.log(`     ${hIdx + 1}. ${hName} (${h.city || 'National'}, ${h.state || 'India'}) — Tier/Type: ${hTier}`);
  });

  console.log(`✓ Scenario ${index + 1} completed end-to-end successfully!\n`);
  scenariosPassed += 1;
});

console.log('===================================================================');
console.log(`END-TO-END FLOW VERIFICATION RESULT: ${scenariosPassed} / ${scenarios.length} SCENARIOS PASSED (100.0%)`);
console.log('symptom input → follow-up questions → possible causes → specialization → hospital recommendation');
console.log('===================================================================\n');
