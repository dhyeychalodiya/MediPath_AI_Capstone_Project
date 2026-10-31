const express = require('express');
const router = express.Router();
const { predictConditions, getFollowUpQuestions, evaluateDoctorClarity } = require('../models/symptomModel');
const { isConfigured: isGeminiConfigured, normalizeSymptoms } = require('../services/geminiProvider');

router.post('/', async (req, res) => {
  const query = String(req.body?.symptoms || req.body?.query || '').trim();
  const modelVersion = req.body?.modelVersion || '_MedP_AI_V2.0';
  const chatHistory = Array.isArray(req.body?.chatHistory) ? req.body.chatHistory : [];
  const turnCount = typeof req.body?.turnCount === 'number' ? req.body.turnCount : 0;
  const noMoreSymptoms = Boolean(req.body?.noMoreSymptoms);

  if (!query && chatHistory.length === 0) {
    return res.status(400).json({ success: false, message: 'Symptoms are required' });
  }

  let normalizedQuery = query;
  if (isGeminiConfigured() && query) {
    try {
      normalizedQuery = await normalizeSymptoms(query);
    } catch (normalizationError) {
      console.warn(`Multilingual normalization failed; using original query: ${normalizationError.message}`);
    }
  }

  // Model V2.0 Doctor AI engine workflow
  if (modelVersion === '_MedP_AI_V2.0') {
    const doctorEval = evaluateDoctorClarity({
      symptoms: normalizedQuery,
      chatHistory,
      turnCount,
      noMoreSymptoms,
    });

    return res.json({
      success: true,
      modelVersion: '_MedP_AI_V2.0',
      isDoctorAI: true,
      isConfident: doctorEval.isConfident,
      confidence: doctorEval.confidence,
      confidenceChange: doctorEval.confidenceChange ?? null,
      previousConfidence: doctorEval.previousConfidence ?? null,
      remainingCandidateCount: doctorEval.remainingCandidateCount ?? (doctorEval.topCandidates ? doctorEval.topCandidates.length : 0),
      modelProbability: doctorEval.modelProbability,
      threshold: doctorEval.threshold,
      passesThreshold: doctorEval.passesThreshold,
      decisionSource: doctorEval.decisionSource,
      ruleTriggered: doctorEval.ruleTriggered || null,
      safetyRuleTriggered: doctorEval.safetyRuleTriggered || null,
      clinicalAssessment: doctorEval.clinicalAssessment,
      counterQuestion: doctorEval.counterQuestion,
      quickOptions: doctorEval.quickOptions,
      recommendedNextStep: doctorEval.recommendedNextStep,
      data: doctorEval.isConfident ? doctorEval.topCondition : null,
      condition: doctorEval.isConfident ? doctorEval.topCondition : (doctorEval.topCondition?.condition_id === 'unsupported_uncertain_condition' ? doctorEval.topCondition : null),
      topCondition: doctorEval.topCondition,
      predictions: doctorEval.predictions,
      topCandidates: doctorEval.topCandidates,
      normalizedQuery,
    });
  }

  // Models V1.0 and V1.5 - Direct prediction behavior preserved exactly as before
  const predictions = predictConditions(normalizedQuery, modelVersion);
  const topPrediction = predictions[0] || null;
  res.json({
    success: true,
    modelVersion,
    isDoctorAI: false,
    isConfident: true,
    data: topPrediction,
    predictions,
    lowConfidence: !topPrediction || topPrediction.confidence < 55,
    followUpQuestions: getFollowUpQuestions(normalizedQuery),
    normalizedQuery,
  });
});

module.exports = router;