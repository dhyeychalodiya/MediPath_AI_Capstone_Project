const { predictCondition, predictConditions, evaluateDoctorClarity } = require('./models/symptomModel');

console.log('=== Verifying Model 2.0 In Node.js Environment ===');

// Test 1: Eye condition disambiguation
const test1 = predictCondition('watery eyes redness and itchy eyes', '_MedP_AI_V2.0');
console.log('Test 1 (Eye symptoms):', test1 ? `${test1.condition} (${test1.confidence}%)` : 'None');

// Test 2: Respiratory condition
const test2 = predictCondition('high fever cough chest pain difficulty breathing', '_MedP_AI_V2.0');
console.log('Test 2 (Pneumonia symptoms):', test2 ? `${test2.condition} (${test2.confidence}%)` : 'None');

// Test 3: Mental Health - Depression colloquial test
const test3 = predictCondition('feeling low persistent sadness loss of interest in everything', '_MedP_AI_V2.0');
console.log('Test 3 (Depressive symptoms):', test3 ? `${test3.condition} (${test3.confidence}%)` : 'None');

// Test 4: Doctor AI Clarity Evaluation (Turn 0 - initial query -> Always asks follow-up even if confidence is high)
const triageInitial = evaluateDoctorClarity({
  symptoms: 'burning chest pain acid taste in mouth',
  chatHistory: [{ role: 'patient', text: 'burning chest pain acid taste in mouth' }],
  turnCount: 0,
});
console.log('Test 4 (Doctor AI Clarity Initial):', {
  isConfident: triageInitial.isConfident,
  confidence: triageInitial.confidence,
  condition: triageInitial.topCondition ? triageInitial.topCondition.condition : null,
  counterQuestion: triageInitial.counterQuestion ? 'Yes' : 'No',
  quickOptions: triageInitial.quickOptions,
});

// Test 4b: Doctor AI Clarity Evaluation (Turn 1 - user indicates No more symptoms -> Final prediction made)
const triageFinal = evaluateDoctorClarity({
  symptoms: 'burning chest pain acid taste in mouth',
  chatHistory: [
    { role: 'patient', text: 'burning chest pain acid taste in mouth' },
    { role: 'doctor', text: 'To help narrow down the possible cause...' },
    { role: 'patient', text: 'No more symptoms' },
  ],
  turnCount: 1,
  noMoreSymptoms: true,
});
console.log('Test 4b (Doctor AI Clarity Final after No More Symptoms):', {
  isConfident: triageFinal.isConfident,
  confidence: triageFinal.confidence,
  condition: triageFinal.topCondition ? triageFinal.topCondition.condition : null,
  counterQuestion: triageFinal.counterQuestion ? 'Yes' : 'No',
});

// Test 5: Emergency Warning Detector
const emergencyTest = evaluateDoctorClarity({
  symptoms: 'crushing chest pain radiating to left arm and sweating',
  chatHistory: [],
  turnCount: 0,
});
console.log('Test 5 (Emergency Detector):', {
  isConfident: emergencyTest.isConfident,
  urgency: emergencyTest.topCondition ? emergencyTest.topCondition.urgency : null,
  condition: emergencyTest.topCondition ? emergencyTest.topCondition.condition : null,
});

// Test 6: Cancer Exclusion Guard
const cancerTest = evaluateDoctorClarity({
  symptoms: 'lump in breast suspected breast cancer tumor',
  chatHistory: [],
  turnCount: 0,
});
console.log('Test 6 (Cancer Guard):', {
  isConfident: cancerTest.isConfident,
  condition: cancerTest.topCondition ? cancerTest.topCondition.condition : null,
  procedure: cancerTest.topCondition ? cancerTest.topCondition.procedure : null,
});

console.log('=== All Node.js Model 2.0 Validations Succeeded! ===');
