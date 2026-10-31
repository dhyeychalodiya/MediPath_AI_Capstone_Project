const http = require('http');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 15000,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(responseData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runLiveTests() {
  console.log("=== TESTING LIVE ROMANIZED CHAT TRIAGE ===");

  // Test 1: Hindi Romanized "mujhe sir dard hai"
  console.log("\n[Test 1] Hindi Romanized: 'mujhe sir dard hai'");
  const res1 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: "mujhe sir dard hai",
    chatHistory: [{ role: "patient", text: "mujhe sir dard hai", sender: "user" }],
    turnCount: 0,
    language: "en", // English keyboard, user hasn't switched dropdown
    modelVersion: "_MedP_AI_V2.0"
  });

  console.log("Status:", res1.status);
  console.log("Language returned:", res1.data.language);
  console.log("InputLanguage:", res1.data.inputLanguage);
  console.log("Translated Symptoms (for Model 2.0):", res1.data.translatedSymptoms);
  console.log("Model Confidence:", res1.data.confidence);
  console.log("Top condition from Model 2.0:", res1.data.topCondition?.condition || res1.data.condition?.condition);
  console.log("Clinical assessment (Hindi):", res1.data.data?.clinicalAssessment?.substring(0, 100));
  console.log("Follow up question (Hindi):", res1.data.data?.followUpQuestion);
  console.log("Canonical question (English):", res1.data.data?.canonicalFollowUpQuestion);
  console.log("Quick options (Hindi):", res1.data.data?.quickOptions);
  console.log("Canonical options (English):", res1.data.data?.canonicalQuickOptions);

  // Test 2: Multi-turn Hindi Romanized follow-up: "ulti bhi ho rahi hai"
  console.log("\n[Test 2] Follow-up turn 1 Hindi Romanized: 'ulti bhi ho rahi hai'");
  const res2 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: "ulti bhi ho rahi hai",
    canonicalSymptoms: res1.data.translatedSymptoms || "headache",
    chatHistory: [
      { role: "patient", text: "mujhe sir dard hai", canonicalText: res1.data.translatedSymptoms || "headache", sender: "user" },
      { role: "doctor", text: res1.data.data?.clinicalAssessment, sender: "assistant" },
      { role: "patient", text: "ulti bhi ho rahi hai", sender: "user" }
    ],
    turnCount: 1,
    language: res1.data.language || "hi",
    modelVersion: "_MedP_AI_V2.0",
    assessmentState: res1.data.assessmentState
  });

  console.log("Status:", res2.status);
  console.log("Language:", res2.data.language);
  console.log("Translated Symptoms:", res2.data.translatedSymptoms);
  console.log("Model Confidence:", res2.data.confidence);
  console.log("Top condition from Model 2.0:", res2.data.topCondition?.condition || res2.data.condition?.condition);
  console.log("Clinical assessment (Hindi):", res2.data.data?.clinicalAssessment?.substring(0, 100));

  // Test 3: Gujarati Romanized "mane mathu dukhe chhe"
  console.log("\n[Test 3] Gujarati Romanized: 'mane mathu dukhe chhe'");
  const res3 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: "mane mathu dukhe chhe",
    chatHistory: [{ role: "patient", text: "mane mathu dukhe chhe", sender: "user" }],
    turnCount: 0,
    language: "en",
    modelVersion: "_MedP_AI_V2.0"
  });

  console.log("Status:", res3.status);
  console.log("Language returned:", res3.data.language);
  console.log("Translated Symptoms:", res3.data.translatedSymptoms);
  console.log("Model Confidence:", res3.data.confidence);
  console.log("Clinical assessment (Gujarati):", res3.data.data?.clinicalAssessment?.substring(0, 100));
  console.log("Follow up question (Gujarati):", res3.data.data?.followUpQuestion);

  // Test 4: Mixed Hinglish "mujhe fever hai aur body pain bhi hai"
  console.log("\n[Test 4] Mixed Hinglish: 'mujhe fever hai aur body pain bhi hai'");
  const res4 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: "mujhe fever hai aur body pain bhi hai",
    chatHistory: [{ role: "patient", text: "mujhe fever hai aur body pain bhi hai", sender: "user" }],
    turnCount: 0,
    language: "en",
    modelVersion: "_MedP_AI_V2.0"
  });

  console.log("Status:", res4.status);
  console.log("Language returned:", res4.data.language);
  console.log("Translated Symptoms:", res4.data.translatedSymptoms);
  console.log("Model Confidence:", res4.data.confidence);
  console.log("Top condition:", res4.data.topCondition?.condition);

  // Test 5: No more symptoms in Romanized Gujarati "kai nathi"
  console.log("\n[Test 5] Romanized No more symptoms: 'kai nathi'");
  const res5 = await postJson('http://localhost:5000/api/triage/chat', {
    symptoms: "kai nathi",
    canonicalSymptoms: "headache, fever",
    chatHistory: [
      { role: "patient", text: "mane mathu dukhe chhe", canonicalText: "headache", sender: "user" },
      { role: "patient", text: "kai nathi", sender: "user" }
    ],
    turnCount: 1,
    noMoreSymptoms: false, // Should be detected from text!
    language: "gu",
    modelVersion: "_MedP_AI_V2.0"
  });

  console.log("Status:", res5.status);
  console.log("Decision Source:", res5.data.decisionSource);
  console.log("Assessment Status:", res5.data.assessmentStatus);
  console.log("Model Confidence:", res5.data.confidence);

  console.log("\n=== ALL LIVE TESTS COMPLETE ===");
}

runLiveTests().catch(console.error);
