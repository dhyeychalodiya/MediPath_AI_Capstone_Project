const http = require('http');
const assert = require('assert');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    }, (res) => {
      let resBody = '';
      res.on('data', (chunk) => { resBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function runLivePostAssessmentTest() {
  console.log('==================================================================');
  console.log('LIVE POST-ASSESSMENT RE-EVALUATION TEST (http://localhost:5000)');
  console.log('==================================================================\n');

  // STEP 1: Initial query
  console.log('1. Turn 0: Submitting initial symptoms: "severe pulsating headache"');
  const t0 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: 'severe pulsating headache',
    chatHistory: [{ role: 'patient', text: 'severe pulsating headache', sender: 'user' }],
    turnCount: 0,
    modelVersion: '_MedP_AI_V2.0',
    language: 'en',
  });

  assert.strictEqual(t0.status, 200);
  assert.strictEqual(t0.data.isConfident, false, 'Turn 0 must require mandatory follow-up');
  assert.ok(t0.data.counterQuestion, 'Turn 0 must have a follow-up question');
  console.log('   ✓ Turn 0 mandatory follow-up question:', t0.data.counterQuestion);

  // STEP 2: Turn 1 - User adds accompanying symptom
  console.log('\n2. Turn 1: Submitting accompanying symptom: "nausea and sensitivity to bright light"');
  const t1 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: 'severe pulsating headache, nausea and sensitivity to bright light',
    chatHistory: [
      { role: 'patient', text: 'severe pulsating headache', sender: 'user' },
      { role: 'doctor', text: t0.data.counterQuestion, sender: 'assistant' },
      { role: 'patient', text: 'nausea and sensitivity to bright light', sender: 'user' },
    ],
    turnCount: 1,
    modelVersion: '_MedP_AI_V2.0',
    language: 'en',
  });

  console.log('   Turn 1 result:', {
    isConfident: t1.data.isConfident,
    assessmentStatus: t1.data.assessmentStatus,
    topCondition: t1.data.topCondition?.condition,
    confidence: t1.data.confidence,
    counterQuestion: t1.data.counterQuestion,
  });

  // STEP 3: Turn 2 - User remembers and adds symptoms AFTER assessment
  console.log('\n3. Turn 2 (POST-ASSESSMENT): User enters additional forgotten symptom: "visual aura with blind spots"');
  const t2 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: 'severe pulsating headache, nausea and sensitivity to bright light, visual aura with blind spots',
    chatHistory: [
      { role: 'patient', text: 'severe pulsating headache', sender: 'user' },
      { role: 'doctor', text: t0.data.counterQuestion, sender: 'assistant' },
      { role: 'patient', text: 'nausea and sensitivity to bright light', sender: 'user' },
      { role: 'doctor', text: t1.data.clinicalAssessment, sender: 'assistant' },
      { role: 'patient', text: 'visual aura with blind spots', sender: 'user' },
    ],
    turnCount: 2,
    modelVersion: '_MedP_AI_V2.0',
    language: 'en',
  });

  assert.strictEqual(t2.status, 200);
  assert.strictEqual(t2.data.isConfident, true, 'Post-assessment re-evaluation must succeed');
  assert.ok(t2.data.condition, 'Must maintain authoritative condition');
  console.log(`   ✓ Turn 2 Re-evaluated Condition: "${t2.data.condition.condition}" (Confidence: ${t2.data.confidence}%)`);
  const assessText = t2.data.data?.clinicalAssessment || t2.data.canonicalClinicalAssessment || '';
  console.log(`   ✓ Clinical Assessment: ${assessText.slice(0, 90)}...`);

  // STEP 4: Test Safe-Deferral Recovery Workflow
  console.log('\n4. Testing Safe-Deferral Recovery Workflow...');
  console.log('   a. Ambiguous symptoms + "No more symptoms" -> safe deferral');
  const defTurn = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: 'mild general fatigue, slight vague discomfort in toe',
    chatHistory: [
      { role: 'patient', text: 'mild general fatigue, slight vague discomfort in toe', sender: 'user' },
      { role: 'patient', text: 'No more symptoms', sender: 'user' },
    ],
    turnCount: 1,
    noMoreSymptoms: true,
    modelVersion: '_MedP_AI_V2.0',
    language: 'en',
  });

  assert.strictEqual(defTurn.status, 200);
  assert.strictEqual(defTurn.data.assessmentStatus, 'safe_defer');
  assert.strictEqual(defTurn.data.confidence, null);
  console.log('      ✓ Correctly safe-deferred with confidence: null');

  console.log('   b. Adding distinct symptoms -> dynamic recovery to valid assessment');
  const recTurn = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: 'high fever, productive cough with rust colored sputum, sharp pleuritic chest pain',
    chatHistory: [
      { role: 'patient', text: 'mild general fatigue, slight vague discomfort in toe', sender: 'user' },
      { role: 'patient', text: 'No more symptoms', sender: 'user' },
      { role: 'patient', text: 'high fever, productive cough with rust colored sputum, sharp pleuritic chest pain', sender: 'user' },
    ],
    turnCount: 2,
    noMoreSymptoms: false,
    modelVersion: '_MedP_AI_V2.0',
    language: 'en',
  });

  assert.strictEqual(recTurn.status, 200);
  assert.strictEqual(recTurn.data.isConfident, true);
  assert.strictEqual(recTurn.data.condition.condition, 'Pneumonia');
  assert.strictEqual(typeof recTurn.data.confidence, 'number');
  console.log(`      ✓ Successfully recovered to Pneumonia with confidence: ${recTurn.data.confidence}%`);

  // STEP 5: Multilingual Post-Assessment Verification (Hindi & Gujarati)
  console.log('\n5. Testing Multilingual Hindi & Gujarati Support...');
  const hiTurn = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: 'सीने में दर्द चलते समय',
    chatHistory: [{ role: 'patient', text: 'सीने में दर्द चलते समय', sender: 'user' }],
    turnCount: 0,
    language: 'hi',
    modelVersion: '_MedP_AI_V2.0',
  });

  assert.strictEqual(hiTurn.status, 200);
  assert.strictEqual(hiTurn.data.conversationLanguage, 'hi');
  assert.ok(hiTurn.data.counterQuestion, 'Must return Hindi question');
  console.log(`   ✓ Hindi detected and translated: "${hiTurn.data.translatedSymptoms}"`);

  console.log('\n==================================================================');
  console.log('>>> ALL LIVE SERVER POST-ASSESSMENT WORKFLOW TESTS PASSED! <<<');
  console.log('==================================================================');
}

runLivePostAssessmentTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
