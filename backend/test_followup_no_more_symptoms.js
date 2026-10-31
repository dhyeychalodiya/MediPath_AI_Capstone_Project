const assert = require('assert');
const { evaluateDoctorClarity } = require('./models/symptomModel');

console.log('=== Running Multi-Turn Follow-Up & "No More Symptoms" Verification ===\n');

// Test Case 1: High confidence initial query must NOT immediately finalize
const case1_turn0 = evaluateDoctorClarity({
  symptoms: 'watery, itchy, red eyes',
  chatHistory: [{ role: 'patient', text: 'watery, itchy, red eyes' }],
  turnCount: 0,
});

assert.strictEqual(case1_turn0.isConfident, false, 'Turn 0 must not finalize even with high confidence');
assert.ok(case1_turn0.counterQuestion, 'Turn 0 must have a follow-up question');
assert.ok(case1_turn0.quickOptions.includes('No more symptoms'), 'quickOptions must include "No more symptoms"');
console.log('✓ Case 1 (Turn 0 - High Confidence): Successfully asked follow-up symptoms without finalizing');

// Test Case 2a: Turn 1 adding an uncertain symptom must STILL ask follow-up questions when evidence is insufficient
const case1_turn1_uncertain = evaluateDoctorClarity({
  symptoms: 'watery, itchy, red eyes, mild tiredness',
  chatHistory: [
    { role: 'patient', text: 'watery, itchy, red eyes' },
    { role: 'doctor', text: case1_turn0.counterQuestion },
    { role: 'patient', text: 'mild tiredness' },
  ],
  turnCount: 1,
  noMoreSymptoms: false,
});

assert.strictEqual(case1_turn1_uncertain.isConfident, false, 'Turn 1 with ambiguous/vague addition must continue asking follow-ups');
assert.ok(case1_turn1_uncertain.counterQuestion, 'Turn 1 must provide a follow-up question');
console.log('✓ Case 2a (Turn 1 - Uncertain Addition): Successfully asked follow-up question again');

// Test Case 2b: Turn 1 adding sufficient specific evidence passing threshold may present qualified possible cause
const case1_turn1_sufficient = evaluateDoctorClarity({
  symptoms: 'watery, itchy, red eyes, sneezing and swollen eyelids',
  chatHistory: [
    { role: 'patient', text: 'watery, itchy, red eyes' },
    { role: 'doctor', text: case1_turn0.counterQuestion },
    { role: 'patient', text: 'sneezing and swollen eyelids' },
  ],
  turnCount: 1,
  noMoreSymptoms: false,
});

assert.strictEqual(case1_turn1_sufficient.isConfident, true, 'Turn 1 with sufficient evidence passing threshold may present possible cause');
assert.ok(case1_turn1_sufficient.topCondition, 'Must have confirmed topCondition');
console.log(`✓ Case 2b (Turn 1 - Sufficient Evidence): Successfully finalized possible cause: "${case1_turn1_sufficient.topCondition.condition}"`);

// Test Case 3: Turn 1 clicking "No more symptoms" -> NOW makes final prediction
const case1_turn1_nomore = evaluateDoctorClarity({
  symptoms: 'watery, itchy, red eyes',
  chatHistory: [
    { role: 'patient', text: 'watery, itchy, red eyes' },
    { role: 'doctor', text: case1_turn0.counterQuestion },
    { role: 'patient', text: 'No more symptoms' },
  ],
  turnCount: 1,
  noMoreSymptoms: true,
});

assert.strictEqual(case1_turn1_nomore.isConfident, true, 'Clicking "No more symptoms" must trigger final prediction');
assert.ok(case1_turn1_nomore.topCondition, 'Must have confirmed topCondition');
assert.ok(case1_turn1_nomore.topCondition.condition.includes('Conjunctivitis'), 'Confirmed condition must be Conjunctivitis variant');
assert.strictEqual(case1_turn1_nomore.counterQuestion, null, 'No counter question after final prediction');
console.log(`✓ Case 3 (Turn 1 - No More Symptoms): Successfully produced final prediction: "${case1_turn1_nomore.topCondition.condition}" (${case1_turn1_nomore.confidence}%)`);

// Test Case 4: Another condition - GERD
const gerd_turn0 = evaluateDoctorClarity({
  symptoms: 'heartburn after meals and sour acid regurgitation',
  chatHistory: [{ role: 'patient', text: 'heartburn after meals and sour acid regurgitation' }],
  turnCount: 0,
});
assert.strictEqual(gerd_turn0.isConfident, false);
assert.ok(gerd_turn0.counterQuestion);

const gerd_final = evaluateDoctorClarity({
  symptoms: 'heartburn after meals and sour acid regurgitation',
  chatHistory: [
    { role: 'patient', text: 'heartburn after meals and sour acid regurgitation' },
    { role: 'doctor', text: gerd_turn0.counterQuestion },
    { role: 'patient', text: 'No more symptoms' },
  ],
  turnCount: 1,
  noMoreSymptoms: true,
});
assert.strictEqual(gerd_final.isConfident, true);
assert.strictEqual(gerd_final.topCondition.condition, 'Gastroesophageal Reflux Disease / GERD');
console.log(`✓ Case 4 (GERD Follow-up flow): Turn 0 asked question, No More Symptoms finalized "${gerd_final.topCondition.condition}" (${gerd_final.confidence}%)`);

// Test Case 5: UTI flow
const uti_turn0 = evaluateDoctorClarity({
  symptoms: 'painful burning urination and frequent urge to pee',
  chatHistory: [{ role: 'patient', text: 'painful burning urination and frequent urge to pee' }],
  turnCount: 0,
});
assert.strictEqual(uti_turn0.isConfident, false);

const uti_final = evaluateDoctorClarity({
  symptoms: 'painful burning urination and frequent urge to pee',
  chatHistory: [
    { role: 'patient', text: 'painful burning urination and frequent urge to pee' },
    { role: 'doctor', text: uti_turn0.counterQuestion },
    { role: 'patient', text: 'no more symptoms' },
  ],
  turnCount: 1,
  noMoreSymptoms: true,
});
assert.strictEqual(uti_final.isConfident, true);
assert.strictEqual(uti_final.topCondition.condition, 'Urinary Tract Infection / UTI');
console.log(`✓ Case 5 (UTI Follow-up flow): Turn 0 asked question, No More Symptoms finalized "${uti_final.topCondition.condition}" (${uti_final.confidence}%)`);

console.log('\n===================================================================');
console.log('ALL MULTI-TURN FOLLOW-UP & "NO MORE SYMPTOMS" TESTS PASSED (5/5)!');
console.log('===================================================================');
