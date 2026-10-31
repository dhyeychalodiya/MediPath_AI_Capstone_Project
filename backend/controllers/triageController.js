const { evaluateTriage } = require('../services/geminiProvider');
const { predictConditions, evaluateDoctorClarity } = require('../models/symptomModel');
const { 
  translateSymptomsToEnglish, 
  translateConsultationOutput, 
  translateText, 
  isPrimarilyEnglish,
  detectScriptLanguage,
  detectRomanizedLanguage,
  DICTIONARY_FALLBACKS 
} = require('../services/translationService');

exports.chatTriage = async (req, res) => {
  try {
    const { 
      symptoms, 
      chatHistory = [], 
      condition = null, 
      language = 'en', 
      modelVersion = '_MedP_AI_V2.0', 
      assessmentState = null,
      canonicalSymptoms = null,
    } = req.body;

    const trimmedSymptoms = String(symptoms || '').trim();
    const hasValidMessages = Array.isArray(chatHistory) && chatHistory.some(m => String(m.text || '').trim().length > 0);

    if (!trimmedSymptoms && !hasValidMessages) {
      return res.status(400).json({ success: false, message: 'Symptoms or conversation history required.' });
    }

    // MedP_AI_V2.0 Doctor AI Clinical Engine
    if (modelVersion === '_MedP_AI_V2.0') {
      const userMessages = chatHistory.filter(m => m.role === 'patient' || m.sender === 'user');
      const turnCount = typeof req.body.turnCount === 'number' 
        ? Math.max(req.body.turnCount, userMessages.length > 1 ? userMessages.length - 1 : 0)
        : userMessages.length;
      
      // Comprehensive check if user selected "No more symptoms" in any supported language, native script, or Romanized form
      let noMoreSymptoms = Boolean(req.body.noMoreSymptoms);
      const lowerSymptoms = trimmedSymptoms.toLowerCase();
      const directNegatives = new Set([
        'no more symptoms', 'no more', 'none of these', 'none of the above', 'nothing else',
        'aur kuch nahi', 'kuch nahi', 'bas itna hi', 'koi nahi', 'koi aur nahi', 'kuch nahi hai',
        'kai nathi', 'kashu nathi', 'biju kai nathi', 'aetluj', 'hava kashu nathi', 'bas',
        'और कोई लक्षण नहीं', 'कुछ नहीं', 'कोई अन्य लक्षण नहीं',
        'વધુ કોઈ લક્ષણો નથી', 'કંઈ નથી', 'બીજા કોઈ લક્ષણો નથી',
        'আর কোনো উপসর্গ নেই', 'इतर कोणतीही लक्षणे नाहीत', 'வேறு எந்த அறிகுறிகளும் இல்லை',
        'ఇతర లక్షణాలు లేవు', 'ಇನ್ನಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ', 'ਹੋਰ ਕੋਈ ਲੱਛਣ नहीं'
      ]);

      const isInputNegative = directNegatives.has(lowerSymptoms) ||
        /^(no\s*more|nothing\s*else|none\s*apply|bas|nathi|nahi|aur\s*kuch\s*nahi|kai\s*nathi|kashu\s*nathi)/i.test(lowerSymptoms) ||
        noMoreSymptoms;

      if (isInputNegative) {
        noMoreSymptoms = true;
      }

      // Helper function to merge symptom strings cleanly without duplicates
      const mergeSymptomTerms = (prevStr, newStr) => {
        const parts = [];
        const lowerSet = new Set();
        const addTerms = (str) => {
          if (!str || typeof str !== 'string') return;
          str.split(',').map(s => s.trim()).filter(Boolean).forEach(part => {
            const lower = part.toLowerCase();
            if (!lowerSet.has(lower)) {
              lowerSet.add(lower);
              parts.push(part);
            }
          });
        };
        addTerms(prevStr);
        addTerms(newStr);
        return parts.join(', ');
      };

      // MULTILINGUAL & ROMANIZED INPUT HANDLING:
      // Translate non-English patient symptoms to canonical English before feeding to Model 2.0
      let englishSymptoms = '';
      let detectedLanguage = language || 'en';
      let originalSymptoms = trimmedSymptoms;
      let detectedInputLang = null;

      if (isInputNegative) {
        // Control signal: do NOT treat as clinical symptoms or translate as medical evidence
        if (canonicalSymptoms && typeof canonicalSymptoms === 'string' && canonicalSymptoms.trim()) {
          englishSymptoms = canonicalSymptoms.trim();
        } else {
          const priorPatientSymptomTexts = chatHistory
            .filter(m => m.role === 'patient' || m.sender === 'user')
            .map(m => m.canonicalText || m.text || '')
            .filter(t => {
              const clean = t.trim().toLowerCase();
              return clean && !directNegatives.has(clean) && !/^(no\s*more|nothing\s*else|none\s*apply|bas|nathi|nahi)/i.test(clean);
            });
          englishSymptoms = priorPatientSymptomTexts.length > 0 ? priorPatientSymptomTexts.join(', ') : trimmedSymptoms;
        }
      } else {
        // Clinical symptom evidence provided
        englishSymptoms = trimmedSymptoms;

        const scriptLang = detectScriptLanguage(trimmedSymptoms);
        const romanizedLang = detectRomanizedLanguage(trimmedSymptoms);
        detectedInputLang = scriptLang || romanizedLang;

        if (detectedInputLang) {
          detectedLanguage = detectedInputLang;
        }

        const isExplicitNonEnglish = language && language !== 'en';
        const hasIndicContent = Boolean(scriptLang || romanizedLang);
        const needsTranslation = isExplicitNonEnglish || hasIndicContent || !isPrimarilyEnglish(trimmedSymptoms);

        if (needsTranslation) {
          // Translate the current input text into canonical English
          const targetSourceLang = scriptLang || romanizedLang || (language !== 'en' ? language : 'auto');
          const transResult = await translateSymptomsToEnglish(trimmedSymptoms, targetSourceLang);

          if (!transResult.success) {
            // Translation failed on non-English text: do NOT silently feed foreign text to Model 2.0
            return res.status(200).json({
              success: false,
              translationError: true,
              message: 'Unable to translate symptom input at this moment. Please try again or switch to English.',
              originalSymptoms: trimmedSymptoms,
              language: detectedInputLang || language || 'en',
              conversationLanguage: detectedInputLang || language || 'en',
            });
          }

          englishSymptoms = transResult.text;
          if (transResult.detectedLanguage && transResult.detectedLanguage !== 'en') {
            detectedLanguage = transResult.detectedLanguage;
          }

          // Merge cleanly with prior canonical English symptoms
          if (canonicalSymptoms && typeof canonicalSymptoms === 'string' && canonicalSymptoms.trim()) {
            englishSymptoms = mergeSymptomTerms(canonicalSymptoms.trim(), englishSymptoms);
          }
        } else {
          // Primarily English: merge with prior canonical symptoms so nothing is lost
          if (canonicalSymptoms && typeof canonicalSymptoms === 'string' && canonicalSymptoms.trim()) {
            englishSymptoms = mergeSymptomTerms(canonicalSymptoms.trim(), englishSymptoms);
          }
        }
      }

      // Canonical chat history with English translations for Model 2.0 evidence accumulation
      const canonicalChatHistory = chatHistory.map(msg => {
        if (msg.canonicalText && typeof msg.canonicalText === 'string') {
          return { ...msg, text: msg.canonicalText };
        }
        return msg;
      });

      // MODEL 2.0 INFERENCE - Sole Authority for Classification & Decision State
      const inferenceStartTime = Date.now();
      const doctorClarity = evaluateDoctorClarity({
        symptoms: englishSymptoms,
        chatHistory: canonicalChatHistory,
        turnCount,
        noMoreSymptoms,
        assessmentState,
      });
      const inferenceDuration = Date.now() - inferenceStartTime;

      const correlationId = (req.headers && req.headers['x-request-id']) || `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const isReEval = Boolean(doctorClarity.assessmentState?.hadPriorAssessment);
      const topPredName = doctorClarity.topCondition?.condition || 'none';
      const topPredProb = typeof doctorClarity.modelProbability === 'number' ? `${(doctorClarity.modelProbability * 100).toFixed(1)}%` : 'none';
      console.log(`[Model 2.0 Evaluation ${correlationId}] Turn: ${turnCount} | Re-evaluation: ${isReEval} | Symptoms: "${englishSymptoms}" | Status: ${doctorClarity.assessmentStatus} | Top Candidate: "${topPredName}" (${topPredProb}) | Real Confidence: ${doctorClarity.confidence ?? 'none'}% | Inference: ${inferenceDuration}ms`);

      // MULTILINGUAL OUTPUT HANDLING:
      // Translate clinical assessment, questions, and options back into patient's conversation language
      const rawOutputData = {
        clinicalAssessment: doctorClarity.clinicalAssessment,
        urgencyLevel: doctorClarity.topCondition ? (doctorClarity.topCondition.urgency === 'emergency' ? 'Emergency' : doctorClarity.topCondition.urgency === 'urgent' ? 'Urgent' : 'Prompt') : 'Prompt',
        redFlags: ["Sudden severe crushing pain", "Difficulty breathing", "Loss of consciousness", "Uncontrolled bleeding"],
        recommendedSpecialist: doctorClarity.topCondition ? doctorClarity.topCondition.specialization : 'Medical Specialist',
        recommendedNextStep: doctorClarity.recommendedNextStep,
        followUpQuestion: doctorClarity.isConfident ? null : doctorClarity.counterQuestion,
        quickOptions: doctorClarity.isConfident ? [] : doctorClarity.quickOptions,
        safeDeferReason: doctorClarity.safeDeferReason || null,
      };

      // Determine conversation language:
      // 1. If user typed in native or Romanized Indic (e.g. Gujarati or Hindi), detectedInputLang governs.
      // 2. Otherwise, respect the active consultation language passed from frontend, falling back to detectedLanguage or 'en'.
      let conversationLanguage = 'en';
      if (detectedInputLang && detectedInputLang !== 'en') {
        conversationLanguage = detectedInputLang;
      } else if (language && language !== 'en') {
        conversationLanguage = language;
      } else if (detectedLanguage && detectedLanguage !== 'en') {
        conversationLanguage = detectedLanguage;
      }

      let finalOutputData = rawOutputData;
      if (conversationLanguage && conversationLanguage !== 'en') {
        finalOutputData = await translateConsultationOutput(rawOutputData, conversationLanguage);
      } else {
        finalOutputData = {
          ...rawOutputData,
          canonicalClinicalAssessment: rawOutputData.clinicalAssessment,
          canonicalRecommendedNextStep: rawOutputData.recommendedNextStep,
          canonicalFollowUpQuestion: rawOutputData.followUpQuestion,
          canonicalQuickOptions: rawOutputData.quickOptions,
          canonicalSafeDeferReason: rawOutputData.safeDeferReason,
        };
      }

      return res.json({
        success: true,
        modelVersion: '_MedP_AI_V2.0',
        isDoctorAI: true,
        inputLanguage: detectedLanguage,
        conversationLanguage,
        modelLanguage: 'en',
        language: conversationLanguage,
        originalSymptoms,
        translatedSymptoms: englishSymptoms !== originalSymptoms ? englishSymptoms : null,
        isConfident: doctorClarity.isConfident,
        confidence: doctorClarity.confidence,
        confidenceChange: doctorClarity.confidenceChange ?? null,
        previousConfidence: doctorClarity.previousConfidence ?? null,
        remainingCandidateCount: doctorClarity.remainingCandidateCount ?? (doctorClarity.topCandidates ? doctorClarity.topCandidates.length : 0),
        modelProbability: doctorClarity.modelProbability,
        threshold: doctorClarity.threshold,
        passesThreshold: doctorClarity.passesThreshold,
        decisionSource: doctorClarity.decisionSource,
        ruleTriggered: doctorClarity.ruleTriggered || null,
        safetyRuleTriggered: doctorClarity.safetyRuleTriggered || null,
        assessmentStatus: doctorClarity.assessmentStatus,
        safeDeferReason: finalOutputData.safeDeferReason || doctorClarity.safeDeferReason || null,
        counterQuestion: finalOutputData.followUpQuestion || null,
        quickOptions: finalOutputData.quickOptions || [],
        assessmentState: doctorClarity.assessmentState,
        data: finalOutputData,
        canonicalClinicalAssessment: finalOutputData.canonicalClinicalAssessment || rawOutputData.clinicalAssessment,
        canonicalFollowUpQuestion: finalOutputData.canonicalFollowUpQuestion || rawOutputData.followUpQuestion,
        canonicalQuickOptions: finalOutputData.canonicalQuickOptions || rawOutputData.quickOptions,
        condition: doctorClarity.isConfident
          ? doctorClarity.topCondition
          : (doctorClarity.assessmentStatus === 'safe_defer' || doctorClarity.topCondition?.condition_id === 'unsupported_uncertain_condition'
              ? doctorClarity.topCondition
              : null),
        topCondition: doctorClarity.topCondition,
        topCandidates: doctorClarity.topCandidates,
      });
    }

    // Existing behavior for MedP_AI_V1.0 & V1.5
    let assessedCondition = condition;
    if (!assessedCondition && symptoms) {
      const predictions = predictConditions(symptoms, modelVersion);
      assessedCondition = predictions[0] || null;
    }

    const triageResult = await evaluateTriage({
      symptoms: symptoms || (chatHistory[0] ? chatHistory[0].text : ''),
      chatHistory,
      condition: assessedCondition,
      language,
    });

    res.json({
      success: true,
      data: triageResult,
      condition: assessedCondition,
    });
  } catch (error) {
    console.error('Triage error caught in controller:', error);
    res.json({
      success: true,
      data: {
        clinicalAssessment: "Based on the reported symptoms, a medical consultation is recommended for clinical assessment.",
        urgencyLevel: "Prompt",
        redFlags: ["Sudden severe pain", "Difficulty breathing", "Loss of consciousness", "Uncontrolled bleeding"],
        recommendedSpecialist: "General Physician / Specialist",
        recommendedNextStep: "Please consult a qualified physician for in-person evaluation.",
        followUpQuestion: "When did your symptoms start, and how severe is the discomfort?",
        quickOptions: ["Started today", "2-3 days ago", "Mild", "Severe"],
      },
      condition: null,
    });
  }
};

/**
 * Dedicated Translation Endpoint
 * Supports frontend text, summary, and report translation without altering clinical logic
 */
exports.translateTextEndpoint = async (req, res) => {
  try {
    const { text, targetLang = 'en', sourceLang = 'auto' } = req.body;
    const trimmed = String(text || '').trim();
    if (!trimmed) {
      return res.json({ success: true, translatedText: '' });
    }

    if (targetLang === 'en') {
      const result = await translateSymptomsToEnglish(trimmed, sourceLang);
      return res.json({ success: result.success, translatedText: result.text, detectedLanguage: result.detectedLanguage });
    }

    const translated = await translateText(trimmed, targetLang);
    return res.json({ success: true, translatedText: translated, language: targetLang });
  } catch (err) {
    console.error('Translate endpoint error:', err);
    res.status(500).json({ success: false, message: 'Translation failed' });
  }
};

