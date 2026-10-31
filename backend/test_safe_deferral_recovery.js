/**
 * Test Suite: Safe Deferral Dynamic Recovery, Question De-duplication,
 * Defensive Upper Bound, and Emergency Safety Rules
 * 
 * Verifies Part C requirements:
 * 1. Safe deferral returns score unavailable (confidence === null, assessmentStatus === 'safe_defer').
 * 2. Submission of new relevant evidence dynamically recovers the consultation
 *    to an authoritative Model 2.0 prediction with valid confidence score.
 * 3. Continued uncertainty respects the defensive upper bound (MAX_FOLLOWUP_TURNS = 4)
 *    and never loops indefinitely or fabricates confidence.
 * 4. Previously asked questions and presented options are tracked and not repeated.
 * 5. Emergency overrides remain strictly authoritative and cannot be weakened.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const assert = require('assert');
const triageController = require('./controllers/triageController');
const symptomModel = require('./models/symptomModel');

function mockReqRes(body) {
  let statusCode = 200;
  let responseData = null;
  const req = { body };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };
  return { req, res, getResult: () => ({ statusCode, responseData }) };
}

async function runTests() {
  console.log('================================================================');
  console.log('  MediPath AI - Safe Deferral Recovery & Safety Regression Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`\x1b[32m[PASS]\x1b[0m Test ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`\x1b[31m[FAIL]\x1b[0m Test ${total}: ${name}`);
      console.error('      ', err.message);
    }
  }

  // ── SCENARIO 1: Safe Deferral followed by useful evidence ──
  await test('Insufficient / inconclusive symptoms after clarification produce safe_defer with confidence: null', async () => {
    // Patient has vague sensations and indicates no further symptoms apply
    const { req, res, getResult } = mockReqRes({
      symptoms: 'mild general fatigue, slight vague discomfort in toe',
      language: 'en',
      modelVersion: '_MedP_AI_V2.0',
      turnCount: 1,
      noMoreSymptoms: true
    });

    await triageController.chatTriage(req, res);
    const { statusCode, responseData } = getResult();

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.assessmentStatus, 'safe_defer', 'Outcome must be safe_defer');
    assert.strictEqual(responseData.confidence, null, 'Safe deferral must have confidence: null');
    assert.strictEqual(responseData.modelProbability, null, 'Safe deferral must not fabricate probability');
    assert.ok(responseData.safeDeferReason, 'Must provide clinical safe deferral reason');
    assert.strictEqual(responseData.isConfident, false, 'Safe deferral must not be marked confident');
    assert.strictEqual(responseData.counterQuestion, null, 'Safe deferral must not ask further questions');
  });

  await test('Submitting new clinical symptoms after safe_defer triggers dynamic recovery with Model 2.0', async () => {
    // Step 1: Prior state was safe_defer
    const initialSymptoms = 'mild general fatigue, slight vague discomfort in toe';
    const initialChatHistory = [
      { role: 'patient', text: initialSymptoms },
      { role: 'doctor', text: 'Safe deferral: Symptoms remain insufficient to confirm a specific category.' }
    ];

    // Step 2: Patient supplies genuinely new, coherent clinical symptoms
    const newSymptoms = 'high fever, productive cough with rust colored sputum, sharp pleuritic chest pain';
    const { req, res, getResult } = mockReqRes({
      symptoms: newSymptoms,
      chatHistory: [
        ...initialChatHistory,
        { role: 'patient', text: newSymptoms }
      ],
      language: 'en',
      modelVersion: '_MedP_AI_V2.0',
      turnCount: 1,
      // Previous state had safe_defer
      assessmentState: {
        initialSymptoms,
        additionalSymptoms: [],
        confirmedSymptoms: [],
        rejectedSymptoms: [],
        askedQuestions: ['Safe deferral explanation'],
        previouslyPresentedOptions: [],
        assessmentStatus: 'safe_defer',
        safeDeferReason: 'Uncertain divergent initial symptoms'
      }
    });

    await triageController.chatTriage(req, res);
    const { statusCode, responseData } = getResult();

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    // The consultation state MUST recover dynamically from safe_defer!
    assert.notStrictEqual(responseData.assessmentStatus, 'safe_defer', 'Assessment status must leave safe_defer');
    assert.strictEqual(typeof responseData.confidence, 'number', 'Confidence must be a valid number on recovery');
    assert.ok(responseData.confidence >= 70, `Expected strong confidence on clear pneumonia symptoms, got ${responseData.confidence}`);
    assert.strictEqual(responseData.safeDeferReason, null, 'Safe deferral reason must be cleared upon valid recovery');
    // Verify condition identity
    const condName = responseData.condition?.condition || responseData.topCondition?.condition;
    assert.ok(/pneumonia/i.test(condName), `Expected Pneumonia recovery, got: ${condName}`);
  });

  // ── SCENARIO 2: Continued Uncertainty and Defensive Upper Bound ──
  await test('Persistent insufficient evidence respects defensive MAX_FOLLOWUP_TURNS = 4 bound', async () => {
    // Call evaluateDoctorClarity at turnCount = 4 with ambiguous symptoms
    const clarityResult = symptomModel.evaluateDoctorClarity({
      symptoms: 'feeling slightly off, occasional vague sensation',
      turnCount: 4, // Defensive upper bound reached!
      noMoreSymptoms: false,
      chatHistory: [
        { role: 'patient', text: 'feeling slightly off' },
        { role: 'doctor', text: 'First follow up question' },
        { role: 'patient', text: 'vague sensation' },
        { role: 'doctor', text: 'Second follow up question' },
        { role: 'patient', text: 'still vague' },
        { role: 'doctor', text: 'Third follow up question' },
        { role: 'patient', text: 'nothing specific' }
      ]
    });

    // When turnCount >= MAX_FOLLOWUP_TURNS (4), questioning must stop!
    assert.strictEqual(clarityResult.counterQuestion, null, 'Counter question must be null when upper bound reached');
    assert.deepStrictEqual(clarityResult.quickOptions, [], 'Quick options must be empty when upper bound reached');
    assert.strictEqual(clarityResult.assessmentStatus, 'safe_defer', 'Must transition to safe_defer rather than infinite loop');
    assert.ok(clarityResult.safeDeferReason, 'Must provide an explanatory safe deferral reason');
    assert.ok(
      clarityResult.safeDeferReason.includes('multiple follow-up turns') || clarityResult.safeDeferReason.includes('General Physician'),
      `Reason must reference limit or general care: ${clarityResult.safeDeferReason}`
    );
  });

  // ── SCENARIO 3: Question and Option De-duplication ──
  await test('Previously asked questions and options are tracked and never repeated', async () => {
    // Turn 0
    const turn0 = symptomModel.evaluateDoctorClarity({
      symptoms: 'headache',
      turnCount: 0,
      noMoreSymptoms: false
    });

    assert.ok(turn0.counterQuestion, 'Turn 0 must generate a counter question');
    assert.ok(turn0.quickOptions.length > 0, 'Turn 0 must provide options');

    // Turn 1 with askedQuestions and previouslyPresentedOptions populated
    const turn1 = symptomModel.evaluateDoctorClarity({
      symptoms: 'headache, throbbing sensation',
      turnCount: 1,
      noMoreSymptoms: false,
      assessmentState: {
        initialSymptoms: 'headache',
        additionalSymptoms: ['throbbing sensation'],
        confirmedSymptoms: ['throbbing sensation'],
        rejectedSymptoms: [],
        askedQuestions: [turn0.counterQuestion],
        previouslyPresentedOptions: turn0.quickOptions,
        mandatoryFirstFollowupCompleted: true
      }
    });

    // Options in Turn 1 must NOT duplicate options presented in Turn 0 (except the standard 'No more symptoms')
    const turn0NonFinalOptions = turn0.quickOptions.filter(o => !o.toLowerCase().includes('no more'));
    for (const opt of (turn1.quickOptions || [])) {
      if (!opt.toLowerCase().includes('no more')) {
        assert.ok(
          !turn0NonFinalOptions.includes(opt),
          `Option '${opt}' in Turn 1 was already presented in Turn 0!`
        );
      }
    }
  });

  await test('"No more symptoms" is not parsed as a positive symptom', async () => {
    const { req, res, getResult } = mockReqRes({
      symptoms: 'No more symptoms (View Results)',
      canonicalSymptoms: 'migraine headache, nausea',
      chatHistory: [
        { role: 'patient', text: 'migraine headache, nausea' }
      ],
      language: 'en',
      modelVersion: '_MedP_AI_V2.0',
      turnCount: 2,
      noMoreSymptoms: true
    });

    await triageController.chatTriage(req, res);
    const { statusCode, responseData } = getResult();

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    // The accumulated symptoms should NOT contain 'No more symptoms'
    assert.ok(
      !responseData.assessmentState.initialSymptoms.toLowerCase().includes('no more symptoms'),
      'Initial symptoms must not contain "no more symptoms"'
    );
    for (const s of responseData.assessmentState.additionalSymptoms) {
      assert.ok(
        !s.toLowerCase().includes('no more symptoms'),
        'Additional symptoms must not contain "no more symptoms"'
      );
    }
  });

  // ── SCENARIO 4: Emergency Red-Flag Overrides ──
  await test('Emergency red-flag symptom immediately overrides follow-up with 100% priority', async () => {
    const { req, res, getResult } = mockReqRes({
      symptoms: 'crushing chest pain radiating to left arm and jaw, diaphoresis',
      language: 'en',
      modelVersion: '_MedP_AI_V2.0',
      turnCount: 0
    });

    await triageController.chatTriage(req, res);
    const { statusCode, responseData } = getResult();

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.assessmentStatus, 'emergency_override');
    assert.strictEqual(responseData.isDoctorAI, true);
    assert.strictEqual(responseData.counterQuestion, null, 'Emergency must never ask follow-up questions');
    assert.deepStrictEqual(responseData.quickOptions, [], 'Emergency must have no quick options');
    assert.strictEqual(responseData.condition.urgency, 'emergency');
    assert.ok(
      responseData.condition.specialization.includes('Emergency Medicine'),
      `Specialization must include Emergency Medicine, got: ${responseData.condition.specialization}`
    );
  });

  await test('Emergency override cannot be weakened by repeated follow-up attempts', async () => {
    // Attempting to follow up on an emergency with a mild symptom
    const { req, res, getResult } = mockReqRes({
      symptoms: 'mild sneezing',
      chatHistory: [
        { role: 'patient', text: 'crushing chest pain radiating to left arm' },
        { role: 'doctor', text: 'CRITICAL ALERT: Seek emergency care.' },
        { role: 'patient', text: 'mild sneezing' }
      ],
      language: 'en',
      modelVersion: '_MedP_AI_V2.0',
      turnCount: 1,
      assessmentState: {
        initialSymptoms: 'crushing chest pain radiating to left arm',
        additionalSymptoms: [],
        assessmentStatus: 'emergency_override'
      }
    });

    await triageController.chatTriage(req, res);
    const { statusCode, responseData } = getResult();

    assert.strictEqual(statusCode, 200);
    // Emergency status must remain locked in emergency_override
    assert.strictEqual(responseData.assessmentStatus, 'emergency_override', 'Emergency status must remain locked');
    assert.strictEqual(responseData.condition.urgency, 'emergency');
  });

  console.log('\n================================================================');
  console.log(`  Regression Suite Summary: ${passed}/${total} Tests Passed (${total - passed} Failures)`);
  console.log('================================================================');

  if (passed === total) {
    console.log('\x1b[32mAll Safe-Deferral Recovery & Safety tests PASSED successfully!\x1b[0m\n');
    process.exit(0);
  } else {
    console.error('\x1b[31mSome regression tests failed.\x1b[0m\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
