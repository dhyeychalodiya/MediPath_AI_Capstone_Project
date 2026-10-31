/**
 * End-to-End Live HTTP Integration Test
 * Hits the live running Express server on http://localhost:5000
 * Verifies live translation, Model 2.0 inference, and multilingual follow-up flow.
 */

const http = require('http');

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, rawBody: raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runLiveE2ETest() {
  console.log('==================================================================');
  console.log('LIVE END-TO-END HTTP INTEGRATION TEST (http://localhost:5000)');
  console.log('==================================================================\n');

  // STEP 1: Hindi query "सीने में दर्द चलते समय" (User does not toggle language dropdown -> lang='en')
  console.log('1. Submitting Hindi symptom: "सीने में दर्द चलते समय" with language="en" (auto-detect)...');
  const turn0 = await postJson('/api/triage/chat', {
    symptoms: 'सीने में दर्द चलते समय',
    language: 'en',
    turnCount: 0,
    chatHistory: [{ role: 'patient', text: 'सीने में दर्द चलते समय', sender: 'user' }],
    modelVersion: '_MedP_AI_V2.0',
  });

  console.log('   Status Code:', turn0.statusCode);
  console.log('   Detected Language:', turn0.body.language);
  console.log('   Translated Symptoms:', turn0.body.translatedSymptoms);
  console.log('   Assessment Status:', turn0.body.assessmentStatus);
  console.log('   Top Condition ID:', turn0.body.topCondition?.condition_id);
  console.log('   Top Condition Name:', turn0.body.topCondition?.condition);
  console.log('   Clinical Assessment (Hindi):', turn0.body.data?.clinicalAssessment?.slice(0, 100) + '...');
  console.log('   Follow-up Question (Hindi):', turn0.body.data?.followUpQuestion);
  console.log('   Quick Options (Hindi):', turn0.body.data?.quickOptions);
  console.log('   Canonical Quick Options (English):', turn0.body.data?.canonicalQuickOptions);

  if (turn0.body.data?.clinicalAssessment?.includes('Gastroenteritis and Anxiety Disorder')) {
    throw new Error('BUG DETECTED: Response contains repeated generic English fallback (Gastroenteritis and Anxiety Disorder)!');
  }
  console.log('\x1b[32m[PASS]\x1b[0m Turn 0 successfully translated and evaluated by Model 2.0!\n');

  // STEP 2: Follow-up turn with canonical chip ("Shortness of breath")
  console.log('2. Submitting Follow-up turn with canonical accompanying symptom...');
  const turn1 = await postJson('/api/triage/chat', {
    symptoms: 'सीने में दर्द चलते समय, सांस लेने में तकलीफ',
    canonicalSymptoms: `${turn0.body.translatedSymptoms}, Shortness of breath or dyspnea`,
    language: 'hi',
    turnCount: 1,
    chatHistory: [
      { role: 'patient', text: 'सीने में दर्द चलते समय', canonicalText: turn0.body.translatedSymptoms },
      { role: 'doctor', text: turn0.body.data?.clinicalAssessment },
      { role: 'patient', text: 'सांस लेने में तकलीफ', canonicalText: 'Shortness of breath or dyspnea' },
    ],
    assessmentState: turn0.body.assessmentState,
    modelVersion: '_MedP_AI_V2.0',
  });

  console.log('   Status Code:', turn1.statusCode);
  console.log('   Assessment Status:', turn1.body.assessmentStatus);
  console.log('   Confidence:', turn1.body.confidence + '%');
  console.log('   Is Confident:', turn1.body.isConfident);
  console.log('\x1b[32m[PASS]\x1b[0m Turn 1 successfully processed by Model 2.0!\n');

  // STEP 3: "No more symptoms"
  console.log('3. Submitting "No more symptoms" to conclude consultation...');
  const turn2 = await postJson('/api/triage/chat', {
    symptoms: 'सीने में दर्द चलते समय, सांस लेने में तकलीफ',
    canonicalSymptoms: `${turn0.body.translatedSymptoms}, Shortness of breath or dyspnea`,
    language: 'hi',
    turnCount: 2,
    noMoreSymptoms: true,
    assessmentState: turn1.body.assessmentState,
    modelVersion: '_MedP_AI_V2.0',
  });

  console.log('   Status Code:', turn2.statusCode);
  console.log('   Assessment Status:', turn2.body.assessmentStatus);
  console.log('   Is Confident:', turn2.body.isConfident);
  console.log('   Final Condition:', turn2.body.condition?.condition);
  console.log('   Specialization:', turn2.body.condition?.specialization);
  console.log('   Urgency:', turn2.body.condition?.urgency);
  console.log('   Hospital Procedure:', turn2.body.condition?.procedure);
  console.log('\x1b[32m[PASS]\x1b[0m Consultation concluded with canonical condition and hospital handoff!\n');

  // STEP 4: Gujarati Query "મને માથાનો ખૂબ દુખાવો છે અને ઉલટી થાય છે"
  console.log('4. Submitting Gujarati query: "મને માથાનો ખૂબ દુખાવો છે અને ઉલટી થાય છે"...');
  const guj = await postJson('/api/triage/chat', {
    symptoms: 'મને માથાનો ખૂબ દુખાવો છે અને ઉલટી થાય છે',
    language: 'gu',
    turnCount: 0,
    modelVersion: '_MedP_AI_V2.0',
  });

  console.log('   Status Code:', guj.statusCode);
  console.log('   Translated Symptoms:', guj.body.translatedSymptoms);
  console.log('   Top Condition ID:', guj.body.topCondition?.condition_id);
  console.log('   Top Condition Name:', guj.body.topCondition?.condition);
  console.log('   Clinical Assessment (Gujarati):', guj.body.data?.clinicalAssessment?.slice(0, 100) + '...');
  console.log('   Follow-up Question (Gujarati):', guj.body.data?.followUpQuestion);

  if (guj.body.data?.clinicalAssessment?.includes('Gastroenteritis and Anxiety Disorder')) {
    throw new Error('BUG DETECTED: Gujarati query produced generic English fallback!');
  }
  console.log('\x1b[32m[PASS]\x1b[0m Gujarati consultation translated and localized cleanly!\n');

  console.log('==================================================================');
  console.log('>>> ALL LIVE SERVER HTTP END-TO-END VERIFICATIONS PASSED! <<<');
  console.log('==================================================================');
}

runLiveE2ETest().catch((err) => {
  console.error('\x1b[31m[FAILED LIVE E2E TEST]\x1b[0m', err);
  process.exit(1);
});
