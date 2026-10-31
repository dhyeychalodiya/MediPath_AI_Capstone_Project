import React, { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Send, 
  User, 
  Bot, 
  Building2,
  Activity,
  ShieldCheck,
  Gauge,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Mic, 
  MicOff,
  Globe,
  FileText,
  RotateCcw,
  ChevronDown,
  Info,
  Check,
  Sparkles,
  ArrowRight,
  X,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  evaluateDoctorTriageV2, 
  DoctorTriageV2Result, 
  DoctorTriageV2Candidate,
  AssessmentState,
  AssessmentStatus
} from "@/services/hospitalService";
import { isNegativeOrNoSymptomResponse, appendRealSymptom } from "@/lib/symptomHelpers";
import { getPrefersReducedMotion } from "@/hooks/useProgressiveText";
import { useSpeechRecognition, LANGUAGE_SPEECH_LOCALES } from "@/hooks/useSpeechRecognition";
import { AssistantTypingIndicator } from "./AssistantTypingIndicator";
import { ModelConfidenceBar } from "./ModelConfidenceBar";
import { ProgressiveAssistantMessage } from "./ProgressiveAssistantMessage";
import { InformationUsedPanel } from "./InformationUsedPanel";
import { ConsultationPrintSummary, PrintSummaryButton } from "./ConsultationPrintSummary";
import { 
  t, 
  detectInputLanguage, 
  localizeConditionName, 
  localizeSpecialty, 
  localizeUrgency, 
  localizeDecisionSource,
  localizeSymptomOption
} from "@/lib/i18n";

export type Message = {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  canonicalText?: string;
  options?: string[];
  canonicalOptions?: string[];
  isQuestion?: boolean;
  isAssessmentCard?: boolean;
  assessmentCondition?: DoctorTriageV2Candidate | null;
  assessmentSafeDeferReason?: string | null;
  timestamp?: string;
};

export type Props = {
  initialQuery: string;
  initialLanguage?: string;
  onDiagnosisConfirmed: (confirmedCondition: DoctorTriageV2Candidate, allSymptoms: string) => void;
  onCancel: () => void;
  onSymptomsUpdate?: (newSymptoms: string) => void;
  onLanguageChange?: (language: string) => void;
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English", speechLocale: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", speechLocale: "hi-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", speechLocale: "gu-IN" },
];

export const NO_MORE_SYMPTOMS_LABELS: Record<string, string> = {
  en: "No more symptoms (View Results)",
  hi: "और कोई लक्षण नहीं (परिणाम देखें)",
  gu: "વધુ કોઈ લક્ષણો નથી (પરિણામો જુઓ)",
};

export const INPUT_PLACEHOLDERS: Record<string, string> = {
  en: "Type any other symptoms or sensations manually...",
  hi: "अपने अन्य लक्षण या समस्याएं यहाँ लिखें...",
  gu: "તમારા અન્ય લક્ષણો અથવા તકલીફ અહીં લખો...",
};

export const DoctorConsultationPanel = ({
  initialQuery,
  initialLanguage = "en",
  onDiagnosisConfirmed,
  onCancel,
  onSymptomsUpdate,
  onLanguageChange,
}: Props) => {
  // Canonical completed messages list
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationLanguage, setConversationLanguage] = useState<string>(initialLanguage);

  useEffect(() => {
    if (initialLanguage && initialLanguage !== conversationLanguage) {
      setConversationLanguage(initialLanguage);
    }
  }, [initialLanguage]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);
  const [translationWarning, setTranslationWarning] = useState<string | null>(null);

  // Independent state flags separating request vs reveal vs interaction lock
  const [requestLoading, setRequestLoading] = useState(false);
  const [responseRevealing, setResponseRevealing] = useState(false);
  const interactionLocked = requestLoading || responseRevealing;

  const [turnCount, setTurnCount] = useState(0);
  const [isConfident, setIsConfident] = useState(false);
  const [confirmedCondition, setConfirmedCondition] = useState<DoctorTriageV2Candidate | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [confidenceChange, setConfidenceChange] = useState<number | null>(null);
  const [topCandidates, setTopCandidates] = useState<DoctorTriageV2Candidate[]>([]);
  const [allSymptomsText, setAllSymptomsText] = useState(initialQuery);
  const [canonicalSymptomsText, setCanonicalSymptomsText] = useState(initialQuery);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>("needs_mandatory_followup");
  const [safeDeferReason, setSafeDeferReason] = useState<string | null>(null);
  const [remainingCandidateCount, setRemainingCandidateCount] = useState<number | null>(null);

  // Progressive reveal temporary message states
  const [revealingAssessment, setRevealingAssessment] = useState<{
    text: string;
    displayedText: string;
    isEmergency?: boolean;
  } | null>(null);

  const [revealingQuestion, setRevealingQuestion] = useState<{
    text: string;
    displayedText: string;
    options: string[];
    canonicalOptions?: string[];
    showOptions: boolean;
  } | null>(null);

  // Canonical full messages list for printing without relying on progressive text animation status
  const allCanonicalMessages = React.useMemo<Message[]>(() => {
    const list = [...messages];
    if (
      revealingAssessment &&
      revealingAssessment.text &&
      !list.some((m) => m.text === revealingAssessment.text)
    ) {
      list.push({
        id: "d-revealing-assessment",
        sender: "doctor",
        text: revealingAssessment.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
    if (
      revealingQuestion &&
      revealingQuestion.text &&
      !list.some((m) => m.text === revealingQuestion.text)
    ) {
      list.push({
        id: "d-revealing-question",
        sender: "doctor",
        text: revealingQuestion.text,
        options: revealingQuestion.options,
        canonicalOptions: revealingQuestion.canonicalOptions,
        isQuestion: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
    return list;
  }, [messages, revealingAssessment, revealingQuestion]);

  // Dedicated multi-page print preview state and lifecycle
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const triggerPrint = useCallback(() => {
    flushSync(() => {
      setIsPrinting(true);
    });
    window.print();
    setTimeout(() => {
      setIsPrinting(false);
    }, 500);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const startingQueryRef = useRef(initialQuery);
  const reqIdRef = useRef(0);
  const activeRef = useRef(true);
  const cancelCurrentRevealRef = useRef<(() => void) | null>(null);
  const isSubmittingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitializedRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const cancelActiveRevealIfAny = useCallback(() => {
    if (cancelCurrentRevealRef.current) {
      cancelCurrentRevealRef.current();
      cancelCurrentRevealRef.current = null;
    }
    setRevealingAssessment(null);
    setRevealingQuestion(null);
    setResponseRevealing(false);
    setRequestLoading(false);
    isSubmittingRef.current = false;
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      startingQueryRef.current = initialQuery;
      setAllSymptomsText(initialQuery);
      setCanonicalSymptomsText(initialQuery);
    }
  }, [initialQuery]);

  // Robust Speech Recognition Hook with dynamic locale
  const {
    isListening,
    status: speechStatus,
    errorMessage: speechError,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    lang: conversationLanguage,
    onTranscript: (transcript: string, isFinal: boolean) => {
      setInput((prev) => {
        const trimmedPrev = prev.trim();
        return trimmedPrev ? `${trimmedPrev} ${transcript}` : transcript;
      });
    },
  });

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [
    messages,
    requestLoading,
    responseRevealing,
    revealingAssessment?.displayedText,
    revealingQuestion?.displayedText,
    revealingQuestion?.showOptions,
    selectedChips,
    isConfident,
  ]);

  // Handle scroll detection for "Scroll to Bottom" floating button
  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 120);
  };

  // Component unmount / cleanup
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      if (cancelCurrentRevealRef.current) {
        cancelCurrentRevealRef.current();
      }
    };
  }, []);

  /**
   * Helper to stream text progressively word-by-word with duration cap and cancellation.
   */
  const streamText = useCallback(
    (
      fullText: string,
      onTick: (visible: string) => void,
      onDone: () => void,
      options: { speedMs?: number; maxDurationMs?: number; skip?: boolean } = {}
    ): (() => void) => {
      if (options.skip || getPrefersReducedMotion() || !fullText) {
        onTick(fullText);
        onDone();
        return () => {};
      }

      const tokens = fullText.match(/\S+\s*/g) || [fullText];
      const total = tokens.length;
      if (total === 0) {
        onTick(fullText);
        onDone();
        return () => {};
      }

      const maxDuration = options.maxDurationMs ?? 1400;
      const speed = options.speedMs ?? 26;
      const interval = Math.min(speed, Math.max(10, Math.floor(maxDuration / total)));

      let idx = 0;
      let accumulated = "";
      let isCancelled = false;
      let timerId: ReturnType<typeof setTimeout> | null = null;

      const step = () => {
        if (isCancelled || !activeRef.current) return;
        if (idx < total) {
          accumulated += tokens[idx];
          idx++;
          onTick(accumulated);
          timerId = setTimeout(step, interval);
        } else {
          onTick(fullText);
          onDone();
        }
      };

      timerId = setTimeout(step, interval);

      return () => {
        isCancelled = true;
        if (timerId !== null) clearTimeout(timerId);
      };
    },
    []
  );

  /**
   * Orchestrates the visual reveal sequence after an API response arrives.
   */
  const runResponseSequence = useCallback(
    (params: {
      result: DoctorTriageV2Result;
      reqId: number;
      isInitialTurn?: boolean;
    }) => {
      const { result, reqId, isInitialTurn } = params;

      // Cancel any ongoing reveal
      if (cancelCurrentRevealRef.current) {
        cancelCurrentRevealRef.current();
        cancelCurrentRevealRef.current = null;
      }

      if (!activeRef.current || reqId !== reqIdRef.current) {
        setRequestLoading(false);
        setResponseRevealing(false);
        isSubmittingRef.current = false;
        return;
      }

      const isEmergencyOverride =
        result.assessmentStatus === "emergency_override" ||
        result.decisionSource === "emergency_override" ||
        Boolean(
          result.safetyRuleTriggered &&
          result.safetyRuleTriggered.toLowerCase().includes("emergency")
        );

      const isEmergency =
        isEmergencyOverride ||
        result.condition?.urgency === "emergency" ||
        result.topCondition?.urgency === "emergency";

      const isSafeDefer =
        result.assessmentStatus === "safe_defer" ||
        result.decisionSource === "safe_defer";

      const clinicalAssessmentText = result.clinicalAssessment;
      const counterQuestionText = result.counterQuestion;
      const quickOptions = result.quickOptions || [];
      const canonicalQuickOptions = result.canonicalQuickOptions || [];
      const hasConfidentCondition = Boolean(result.isConfident && result.condition);

      // Fast display for acute cardiac/stroke safety overrides: display immediately within 50ms
      if (isEmergencyOverride) {
        setRequestLoading(false);
        setResponseRevealing(false);
        isSubmittingRef.current = false;

        const committedAssessment: Message = {
          id: `d-${Date.now()}`,
          sender: "doctor",
          text: clinicalAssessmentText,
          canonicalText: result.canonicalClinicalAssessment || clinicalAssessmentText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const finalCondition = result.condition || result.topCondition || null;
        if (finalCondition) {
          setIsConfident(true);
          const conditionWithConf = {
            ...finalCondition,
            confidence:
              typeof result.confidence === "number"
                ? result.confidence
                : finalCondition.confidence || 99,
          };
          setConfirmedCondition(conditionWithConf);

          const cardMsg: Message = {
            id: `d-card-${Date.now()}`,
            sender: "doctor",
            text: clinicalAssessmentText,
            canonicalText: result.canonicalClinicalAssessment || clinicalAssessmentText,
            isAssessmentCard: true,
            assessmentCondition: conditionWithConf,
            assessmentSafeDeferReason: result.safeDeferReason || null,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          setMessages((prev) => {
            const next = [...prev, committedAssessment, cardMsg];
            messagesRef.current = next;
            return next;
          });
        } else {
          setMessages((prev) => {
            const next = [...prev, committedAssessment];
            messagesRef.current = next;
            return next;
          });
        }

        setTurnCount((c) => (isInitialTurn ? 1 : c + 1));
        return;
      }

      // Response: start progressive reveal sequence for all conditions including emergency disease categories (e.g. Appendicitis)
      setRequestLoading(false);
      setResponseRevealing(true);

      let stepCanceller: (() => void) | null = null;
      let pauseTimerId: ReturnType<typeof setTimeout> | null = null;

      // PHASE 1: Progressive reveal of clinical assessment text
      setRevealingAssessment({
        text: clinicalAssessmentText,
        displayedText: "",
        isEmergency,
      });

      const assessmentSpeed = isSafeDefer ? 18 : 26;
      const assessmentMaxDuration = isSafeDefer ? 600 : 1400;

      stepCanceller = streamText(
        clinicalAssessmentText,
        (visible) => {
          if (!activeRef.current || reqId !== reqIdRef.current) return;
          setRevealingAssessment((prev) =>
            prev ? { ...prev, displayedText: visible } : null
          );
        },
        () => {
          if (!activeRef.current || reqId !== reqIdRef.current) return;

          // Commit clinical assessment to canonical messages
          const committedAssessment: Message = {
            id: `d-${Date.now()}`,
            sender: "doctor",
            text: clinicalAssessmentText,
            canonicalText: result.canonicalClinicalAssessment || clinicalAssessmentText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, committedAssessment]);
          setRevealingAssessment(null);

          // PHASE 2: Pause briefly (300ms) between assessment and question
          pauseTimerId = setTimeout(() => {
            if (!activeRef.current || reqId !== reqIdRef.current) return;

            // If confident condition reached, transition to final result card
            if (hasConfidentCondition && result.condition) {
              setIsConfident(true);
              const conditionWithConf = {
                ...result.condition,
                confidence:
                  typeof result.confidence === "number"
                    ? result.confidence
                    : result.condition.confidence || (isEmergency ? 95 : 85),
              };
              setConfirmedCondition(conditionWithConf);
              const cardMsg: Message = {
                id: `d-card-${Date.now()}`,
                sender: "doctor",
                text: clinicalAssessmentText,
                canonicalText: result.canonicalClinicalAssessment || clinicalAssessmentText,
                isAssessmentCard: true,
                assessmentCondition: conditionWithConf,
                assessmentSafeDeferReason: result.safeDeferReason || null,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
              setMessages((prev) => {
                const next = [...prev, cardMsg];
                messagesRef.current = next;
                return next;
              });
              setTurnCount((c) => (isInitialTurn ? 1 : c + 1));
              isSubmittingRef.current = false;
              setResponseRevealing(false);
              return;
            }

            // If safe deferral or no follow-up question returned from model:
            // Do NOT invent a fake follow-up question! Transition cleanly to safe deferral outcome card.
            if (isSafeDefer || result.counterQuestion === null) {
              setIsConfident(true);
              const deferCondition = result.condition || result.topCondition || null;
              setConfirmedCondition(deferCondition);
              if (deferCondition) {
                const cardMsg: Message = {
                  id: `d-card-${Date.now()}`,
                  sender: "doctor",
                  text: clinicalAssessmentText,
                  canonicalText: result.canonicalClinicalAssessment || clinicalAssessmentText,
                  isAssessmentCard: true,
                  assessmentCondition: deferCondition,
                  assessmentSafeDeferReason: result.safeDeferReason || safeDeferReason || null,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                setMessages((prev) => {
                  const next = [...prev, cardMsg];
                  messagesRef.current = next;
                  return next;
                });
              }
              setTurnCount((c) => (isInitialTurn ? 1 : c + 1));
              isSubmittingRef.current = false;
              setResponseRevealing(false);
              return;
            }

            // Evidence needs further clarification / follow-up:
            // Reset any previous finalized result card so new question displays cleanly
            setIsConfident(false);
            setConfirmedCondition(null);

            // PHASE 3: Progressive reveal of follow-up question
            const effectiveQuestion = counterQuestionText!;

            setRevealingQuestion({
              text: effectiveQuestion,
              displayedText: "",
              options: quickOptions,
              canonicalOptions: canonicalQuickOptions,
              showOptions: false,
            });

            stepCanceller = streamText(
              effectiveQuestion,
              (visibleQ) => {
                if (!activeRef.current || reqId !== reqIdRef.current) return;
                setRevealingQuestion((prev) =>
                  prev ? { ...prev, displayedText: visibleQ } : null
                );
              },
              () => {
                if (!activeRef.current || reqId !== reqIdRef.current) return;

                // PHASE 4: Reveal option chips with subtle stagger and commit question
                setRevealingQuestion((prev) =>
                  prev ? { ...prev, showOptions: true } : null
                );

                // Commit question message with options to canonical messages
                const committedQuestion: Message = {
                  id: `d-q-${Date.now()}`,
                  sender: "doctor",
                  text: effectiveQuestion,
                  canonicalText: result.canonicalFollowUpQuestion || effectiveQuestion,
                  options: quickOptions,
                  canonicalOptions: canonicalQuickOptions,
                  isQuestion: true,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                setMessages((prev) => [...prev, committedQuestion]);
                setRevealingQuestion(null);

                if (isInitialTurn) {
                  setTurnCount(1);
                } else {
                  setTurnCount((c) => c + 1);
                }

                // PHASE 5: Unlock controls
                isSubmittingRef.current = false;
                setResponseRevealing(false);
              },
              { speedMs: 26, maxDurationMs: 1200 }
            );
          }, 300);
        },
        { speedMs: assessmentSpeed, maxDurationMs: assessmentMaxDuration }
      );

      cancelCurrentRevealRef.current = () => {
        if (stepCanceller) stepCanceller();
        if (pauseTimerId !== null) clearTimeout(pauseTimerId);
      };
    },
    [streamText]
  );

  // Skip animation helper: immediately finishes active progressive text reveal
  const handleSkipAnimation = () => {
    if (cancelCurrentRevealRef.current) {
      cancelCurrentRevealRef.current();
      cancelCurrentRevealRef.current = null;
    }
    if (revealingAssessment) {
      setMessages((prev) => [
        ...prev,
        {
          id: `d-${Date.now()}`,
          sender: "doctor",
          text: revealingAssessment.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setRevealingAssessment(null);
    }
    if (revealingQuestion) {
      setMessages((prev) => [
        ...prev,
        {
          id: `d-q-${Date.now()}`,
          sender: "doctor",
          text: revealingQuestion.text,
          options: revealingQuestion.options,
          canonicalOptions: revealingQuestion.canonicalOptions,
          isQuestion: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setRevealingQuestion(null);
      setTurnCount((c) => (c === 0 ? 1 : c + 1));
    }
    setResponseRevealing(false);
    isSubmittingRef.current = false;
  };

  // Initialize consultation on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    let active = true;
    const thisReqId = ++reqIdRef.current;

    async function initTriage() {
      activeRef.current = true;
      const startQuery = (startingQueryRef.current || initialQuery || "").trim();
      if (!startQuery) {
        setRequestLoading(false);
        setResponseRevealing(false);
        isSubmittingRef.current = false;
        return;
      }

      setRequestLoading(true);
      const initialPatientMsg: Message = {
        id: "p-0",
        sender: "patient",
        text: startQuery,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages([initialPatientMsg]);
      messagesRef.current = [initialPatientMsg];
      const requestStartTime = Date.now();

      try {
        const result: DoctorTriageV2Result = await evaluateDoctorTriageV2({
          symptoms: startQuery,
          chatHistory: [{ role: "patient", text: startQuery, sender: "user" }],
          turnCount: 0,
          language: conversationLanguage,
        });

        if (!active || !activeRef.current || thisReqId !== reqIdRef.current) {
          setRequestLoading(false);
          setResponseRevealing(false);
          isSubmittingRef.current = false;
          return;
        }

        const returnedLang = result.language || result.conversationLanguage;
        if (returnedLang && returnedLang !== conversationLanguage) {
          setConversationLanguage(returnedLang);
          onLanguageChange?.(returnedLang);
        }

        if (result.translationError) {
          setTranslationWarning(result.message || "Translation unavailable. Proceeding with Model 2.0 directly.");
        } else {
          setTranslationWarning(null);
        }

        if (result.translatedSymptoms) {
          setCanonicalSymptomsText(result.translatedSymptoms);
        }

        // Apply metadata updates
        setConfidenceScore(typeof result.confidence === "number" ? result.confidence : null);
        setConfidenceChange(typeof result.confidenceChange === "number" ? result.confidenceChange : null);
        setTopCandidates(Array.isArray(result.topCandidates) ? result.topCandidates : []);
        setAssessmentState(result.assessmentState || null);
        setAssessmentStatus(result.assessmentStatus || "needs_more_information");
        setSafeDeferReason(result.safeDeferReason || null);
        setRemainingCandidateCount(typeof result.remainingCandidateCount === "number" ? result.remainingCandidateCount : null);

        // Natural thinking indicator duration check: ensure 450–700ms total on fast responses
        // Safety overrides (cardiac/stroke) bypass the delay to display immediately within 50ms
        const isEmergencyOverride =
          result.assessmentStatus === "emergency_override" ||
          result.decisionSource === "emergency_override" ||
          Boolean(
            result.safetyRuleTriggered &&
            result.safetyRuleTriggered.toLowerCase().includes("emergency")
          );

        if (!isEmergencyOverride) {
          const elapsed = Date.now() - requestStartTime;
          const minThinkingWait = Math.max(0, 500 - elapsed);
          if (minThinkingWait > 0) {
            await new Promise((resolve) => setTimeout(resolve, minThinkingWait));
          }
        }

        if (!active || !activeRef.current || thisReqId !== reqIdRef.current) {
          setRequestLoading(false);
          setResponseRevealing(false);
          isSubmittingRef.current = false;
          return;
        }

        runResponseSequence({ result, reqId: thisReqId, isInitialTurn: true });
      } catch (err) {
        setRequestLoading(false);
        setResponseRevealing(false);
        isSubmittingRef.current = false;

        const fallbackAssessmentMsg: Message = {
          id: "d-fallback",
          sender: "doctor",
          text: t("fallback_assessment_text", conversationLanguage, { symptoms: startQuery }),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        const fallbackQuestionMsg: Message = {
          id: "d-q-fallback",
          sender: "doctor",
          text: t("fallback_question_text", conversationLanguage),
          options: [
            "Fever or chills",
            "Cough or sore throat",
            "Eye redness or watering",
            "Stomach pain or nausea",
            "Skin rash or pimples",
            t("no_more_symptoms", conversationLanguage),
          ],
          isQuestion: true,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages([initialPatientMsg, fallbackAssessmentMsg, fallbackQuestionMsg]);
        messagesRef.current = [initialPatientMsg, fallbackAssessmentMsg, fallbackQuestionMsg];
        setTurnCount(1);
      }
    }

    initTriage();

    return () => {
      active = false;
      if (cancelCurrentRevealRef.current) {
        cancelCurrentRevealRef.current();
      }
    };
  }, []);

  // Handle language switch
  const handleLanguageChange = (langCode: string) => {
    setConversationLanguage(langCode);
    onLanguageChange?.(langCode);
    setShowLanguageDropdown(false);
  };

  // Toggle selection of a symptom chip
  const toggleChipSelection = (option: string) => {
    if (requestLoading) return;

    if (isNegativeOrNoSymptomResponse(option)) {
      cancelActiveRevealIfAny();
      handleSendAnswer("No more symptoms", "No more symptoms");
      setSelectedChips([]);
      return;
    }

    setSelectedChips((prev) => 
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  // Submit all selected symptom chips
  const handleSubmitSelectedChips = () => {
    if (requestLoading || selectedChips.length === 0) return;
    cancelActiveRevealIfAny();
    const validChips = selectedChips.filter((c) => !isNegativeOrNoSymptomResponse(c));
    if (validChips.length === 0) {
      handleSendAnswer(selectedChips[0], "No more symptoms");
    } else {
      const lastQuestionMsg = [...messagesRef.current].reverse().find((m) => m.isQuestion && m.options);
      const canonicals: string[] = [];
      validChips.forEach((chip) => {
        if (lastQuestionMsg && lastQuestionMsg.options && lastQuestionMsg.canonicalOptions) {
          const idx = lastQuestionMsg.options.indexOf(chip);
          if (idx !== -1 && lastQuestionMsg.canonicalOptions[idx]) {
            canonicals.push(lastQuestionMsg.canonicalOptions[idx]);
            return;
          }
        }
        canonicals.push(chip);
      });
      const combinedText = conversationLanguage === "en"
        ? validChips.join(", ")
        : validChips.map((c) => localizeSymptomOption(c, conversationLanguage)).join(", ");
      const combinedCanonical = canonicals.join(", ");
      handleSendAnswer(combinedText, combinedCanonical);
    }
    setSelectedChips([]);
  };

  // Directly send a single chip immediately
  const handleSingleChipClick = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (requestLoading) return;
    cancelActiveRevealIfAny();

    if (isNegativeOrNoSymptomResponse(option)) {
      handleSendAnswer(noMoreSymptomsLabel, "No more symptoms");
      setSelectedChips([]);
      return;
    }
    const lastQuestionMsg = [...messagesRef.current].reverse().find((m) => m.isQuestion && m.options);
    let canonicalText = option;
    if (lastQuestionMsg && lastQuestionMsg.options && lastQuestionMsg.canonicalOptions) {
      const idx = lastQuestionMsg.options.indexOf(option);
      if (idx !== -1 && lastQuestionMsg.canonicalOptions[idx]) {
        canonicalText = lastQuestionMsg.canonicalOptions[idx];
      }
    }
    const displayedText = conversationLanguage === "en" ? option : localizeSymptomOption(option, conversationLanguage);
    setSelectedChips([]);
    handleSendAnswer(displayedText, canonicalText);
  };

  // Canonical submit handler shared by Enter key and Send button
  const handleComposerSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (requestLoading || isSubmittingRef.current) return;

    // Single source of truth: latest DOM input value if mounted, fallback to React state
    const rawValue = inputRef.current ? inputRef.current.value : input;
    const normalized = rawValue.replace(/\s+/g, " ").trim();
    if (!normalized) return;

    cancelActiveRevealIfAny();
    handleSendAnswer(normalized);
  };

  // Patient sends an answer (either through chips, typing, or voice)
  const handleSendAnswer = async (answerText: string, canonicalAnswerText?: string) => {
    const cleanAnswer = answerText.replace(/\s+/g, " ").trim();
    if (!cleanAnswer || requestLoading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Stop listening if user hits send while mic is active
    if (isListening) {
      stopListening();
    }

    const pendingInputText = cleanAnswer;
    setSelectedChips([]);
    const thisReqId = ++reqIdRef.current;

    // Immediately display patient message
    const newPatientMsg: Message = {
      id: `p-${Date.now()}`,
      sender: "patient",
      text: cleanAnswer,
      canonicalText: canonicalAnswerText || cleanAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messagesRef.current, newPatientMsg];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setRequestLoading(true);

    // Clear composer now that submission has been accepted into message thread
    setInput("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }

    const isNegative = isNegativeOrNoSymptomResponse(cleanAnswer);
    let updatedSymptoms = allSymptomsText;

    if (!isNegative) {
      updatedSymptoms = appendRealSymptom(allSymptomsText, cleanAnswer);
      setAllSymptomsText(updatedSymptoms);
      onSymptomsUpdate?.(updatedSymptoms);
    }

    let updatedCanonical = canonicalSymptomsText;
    if (!isNegative) {
      if (canonicalAnswerText) {
        updatedCanonical = canonicalSymptomsText 
          ? appendRealSymptom(canonicalSymptomsText, canonicalAnswerText)
          : canonicalAnswerText;
        setCanonicalSymptomsText(updatedCanonical);
      }
    }

    // Backend receives ONLY complete canonical messages
    const chatHistoryForBackend = updatedMessages
      .filter((m) => !m.isAssessmentCard)
      .map((m) => ({
        role: m.sender === "patient" ? "patient" : "doctor",
        text: m.text,
        canonicalText: m.canonicalText || m.text,
        sender: m.sender === "patient" ? "user" : "assistant",
      }));

    const detectedInTurn = isNegative ? null : detectInputLanguage(cleanAnswer);
    const turnReqLang = detectedInTurn || conversationLanguage;

    const requestStartTime = Date.now();

    try {
      const result: DoctorTriageV2Result = await evaluateDoctorTriageV2({
        symptoms: updatedSymptoms,
        canonicalSymptoms: updatedCanonical || undefined,
        chatHistory: chatHistoryForBackend,
        turnCount: Math.max(turnCount, 1),
        noMoreSymptoms: isNegative,
        assessmentState: assessmentState || undefined,
        language: turnReqLang,
      });

      if (!activeRef.current || thisReqId !== reqIdRef.current) {
        isSubmittingRef.current = false;
        setRequestLoading(false);
        return;
      }

      const returnedLang = result.language || turnReqLang;
      if (returnedLang && returnedLang !== conversationLanguage) {
        setConversationLanguage(returnedLang);
        onLanguageChange?.(returnedLang);
      }

      if (result.translationError) {
        setTranslationWarning(result.message || "Translation unavailable. Proceeding with Model 2.0 directly.");
      } else {
        setTranslationWarning(null);
      }

      if (result.translatedSymptoms && !canonicalSymptomsText) {
        setCanonicalSymptomsText(result.translatedSymptoms);
      }

      // Apply metadata updates cleanly to permit dynamic recovery from safe deferral
      setConfidenceScore(typeof result.confidence === "number" ? result.confidence : null);
      setConfidenceChange(typeof result.confidenceChange === "number" ? result.confidenceChange : null);
      setTopCandidates(Array.isArray(result.topCandidates) ? result.topCandidates : []);
      setAssessmentState(result.assessmentState || null);
      setAssessmentStatus(result.assessmentStatus || "needs_more_information");
      setSafeDeferReason(result.safeDeferReason || null);
      setRemainingCandidateCount(typeof result.remainingCandidateCount === "number" ? result.remainingCandidateCount : null);

      // Natural thinking indicator duration check: safety overrides display immediately
      const isEmergencyOverride =
        result.assessmentStatus === "emergency_override" ||
        result.decisionSource === "emergency_override" ||
        Boolean(
          result.safetyRuleTriggered &&
          result.safetyRuleTriggered.toLowerCase().includes("emergency")
        );

      if (!isEmergencyOverride) {
        const elapsed = Date.now() - requestStartTime;
        const minThinkingWait = Math.max(0, 500 - elapsed);
        if (minThinkingWait > 0) {
          await new Promise((resolve) => setTimeout(resolve, minThinkingWait));
        }
      }

      if (!activeRef.current || thisReqId !== reqIdRef.current) {
        isSubmittingRef.current = false;
        setRequestLoading(false);
        return;
      }

      runResponseSequence({ result, reqId: thisReqId, isInitialTurn: false });
    } catch (err) {
      console.warn("Triage next step error:", err);
      isSubmittingRef.current = false;
      setRequestLoading(false);
      setResponseRevealing(false);

      // Restore user text into input so they can retry without losing their input
      setInput(pendingInputText);
      if (inputRef.current) {
        inputRef.current.value = pendingInputText;
      }

      setTranslationWarning("Unable to process your symptom update due to a network connection issue. Your message has been preserved below so you can retry.");
    }
  };

  const toggleSpeechRecognition = () => {
    if (requestLoading) return;
    if (isListening) {
      stopListening();
    } else {
      clearSpeechError();
      startListening({ lang: conversationLanguage });
    }
  };

  const handleProceedToHospitals = (conditionToProceed?: DoctorTriageV2Candidate | null) => {
    const target = conditionToProceed || confirmedCondition;
    if (target) {
      onDiagnosisConfirmed(target, allSymptomsText);
    }
  };

  const latestAssessmentMsgId = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isAssessmentCard) {
        return messages[i].id;
      }
    }
    return null;
  }, [messages]);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === conversationLanguage) || SUPPORTED_LANGUAGES[0];
  const noMoreSymptomsLabel = t("no_more_symptoms", conversationLanguage);
  const inputPlaceholder = interactionLocked
    ? t("updating_assessment", conversationLanguage)
    : isConfident
    ? (conversationLanguage === "hi"
        ? "क्या कोई अन्य लक्षण याद आए? पुनर्मूल्यांकन के लिए यहाँ लिखें..."
        : conversationLanguage === "gu"
        ? "કોઈ વધારાના લક્ષણો યાદ આવ્યા? પુનઃમૂલ્યાંકન માટે અહીં લખો..."
        : "Remembered more symptoms? Type here to re-evaluate...")
    : t("type_placeholder", conversationLanguage);

  return (
    <div className="doctor-consultation-container flex flex-col h-[100dvh] max-h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      {/* ── TOP CONVERSATION HEADER ── */}
      <header className="shrink-0 bg-card/95 backdrop-blur-md border-b border-border/80 px-4 md:px-6 py-3.5 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Doctor AI Brand & Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background ring-1 ring-emerald-400/30" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-sm md:text-base text-foreground truncate">
                  {t("consultation_title", conversationLanguage)}
                </h1>
                <Badge variant="outline" className="border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-mono py-0 px-2 shrink-0">
                  MedP_AI_V2.0
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                {t("consultation_subtitle", conversationLanguage)}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageDropdown((p) => !p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-colors cursor-pointer"
                title="Change consultation language"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{currentLangObj.native}</span>
                <span className="sm:hidden font-mono text-[11px] uppercase">{currentLangObj.code}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showLanguageDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 space-y-0.5"
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("select_language", conversationLanguage)}
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          conversationLanguage === lang.code
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-secondary text-foreground"
                        }`}
                      >
                        <span>{lang.native}</span>
                        <span className="text-[10px] opacity-75 font-mono">{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Evidence Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowEvidenceDrawer((p) => !p)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                showEvidenceDrawer
                  ? "bg-primary/15 border-primary text-primary"
                  : "bg-secondary/50 border-border/80 text-foreground hover:bg-secondary"
              }`}
              title="Toggle Clinical Evidence Panel"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t("evidence_btn", conversationLanguage)}</span>
            </button>

            {/* Print Summary Button */}
            <PrintSummaryButton onClick={triggerPrint} />

            {/* Exit Consultation Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive cursor-pointer no-print"
              title="Reset consultation and return to search"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">{t("reset", conversationLanguage)}</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Model 2.0 Confidence Score Progress Bar */}
        <div className="max-w-5xl mx-auto mt-2.5 pt-2 border-t border-border/50">
          <ModelConfidenceBar
            score={confidenceScore}
            confidenceChange={confidenceChange}
            candidateCount={typeof remainingCandidateCount === "number" ? remainingCandidateCount : topCandidates.length}
            modelProbability={confirmedCondition?.modelProbability ?? assessmentState?.currentModelConfidence}
            threshold={confirmedCondition?.threshold ?? 0.85}
            isLoading={requestLoading}
            isSafeDefer={assessmentStatus === "safe_defer" || Boolean(safeDeferReason)}
            turnCount={turnCount}
            language={conversationLanguage}
          />
        </div>
      </header>

      {/* ── COLLAPSIBLE EVIDENCE DRAWER ── */}
      <AnimatePresence>
        {showEvidenceDrawer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 bg-secondary/40 border-b border-border/80 px-4 py-3 overflow-hidden z-20"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Clinical Evidence & Reasoning Log
                </span>
                <button
                  type="button"
                  onClick={() => setShowEvidenceDrawer(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <InformationUsedPanel
                initialSymptoms={startingQueryRef.current}
                assessmentState={assessmentState}
                topCandidates={topCandidates}
                modelProbability={
                  confirmedCondition ? confirmedCondition.modelProbability : (assessmentState?.currentModelConfidence ?? null)
                }
                threshold={confirmedCondition ? confirmedCondition.threshold : null}
                passesThreshold={
                  confirmedCondition
                    ? confirmedCondition.passesThreshold
                    : Boolean(assessmentState?.currentModelConfidence && assessmentState.currentModelConfidence >= 0.85)
                }
                decisionSource={confirmedCondition?.decisionSource || assessmentState?.assessmentStatus}
                turnCount={turnCount}
                language={conversationLanguage}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NOTIFICATION BANNERS ── */}
      {translationWarning && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">{translationWarning}</span>
            <button
              type="button"
              onClick={() => setTranslationWarning(null)}
              className="ml-auto text-amber-700 dark:text-amber-300 hover:underline font-medium text-[11px]"
            >
              {t("dismiss", conversationLanguage)}
            </button>
          </div>
        </div>
      )}

      {speechError && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 text-xs text-destructive flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-snug">{speechError}</span>
            <button
              type="button"
              onClick={clearSpeechError}
              className="ml-auto text-destructive hover:underline font-semibold text-[11px] shrink-0"
            >
              {t("dismiss", conversationLanguage)}
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN SCROLLABLE CONVERSATION AREA ── */}
      <main
        ref={chatScrollContainerRef}
        onScroll={handleScroll}
        className="screen-only-chat flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5"
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Welcome Medical Context Banner */}
          <div className="rounded-2xl bg-secondary/30 border border-border/60 p-3.5 text-xs text-muted-foreground flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <p className="leading-relaxed">
              {t("consultation_welcome_desc", conversationLanguage)}
            </p>
          </div>

          {/* Messages Thread */}
          {messages.map((m, mIdx) => {
            if (m.isAssessmentCard) {
              const cardCondition = m.assessmentCondition;
              if (!cardCondition) return null;
              const isLatestAssessment = m.id === latestAssessmentMsgId;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.97, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-6 md:p-8 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-background border-2 border-emerald-500/40 rounded-3xl shadow-xl space-y-6"
                >
                  {/* Top Status Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs border border-emerald-500/30">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                            {cardCondition.decisionSource === "emergency_override"
                              ? t("urgent_safety_notice_title", conversationLanguage)
                              : cardCondition.decisionSource === "safe_defer"
                              ? t("general_care_referral_title", conversationLanguage)
                              : t("possible_cause_identified_title", conversationLanguage)}
                          </span>
                          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            {localizeDecisionSource(cardCondition.decisionSource, conversationLanguage)}
                          </Badge>
                          {!isLatestAssessment && (
                            <Badge variant="secondary" className="text-[10px] bg-secondary/80 text-muted-foreground border border-border">
                              {t("prior_assessment", conversationLanguage)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-extrabold text-2xl text-foreground mt-0.5">
                          {localizeConditionName(cardCondition.condition, conversationLanguage)}
                        </h3>
                      </div>
                    </div>

                    {/* Specialization and Urgency Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold py-1 px-2.5">
                        <Stethoscope className="w-3.5 h-3.5 mr-1" />
                        {localizeSpecialty(cardCondition.specialization, conversationLanguage)}
                      </Badge>
                      {cardCondition.icd10 && (
                        <Badge variant="outline" className="font-mono text-xs border-border bg-secondary/80 text-foreground py-1 px-2.5">
                          ICD-10 · {cardCondition.icd10}
                        </Badge>
                      )}
                      {cardCondition.urgency && (
                        <Badge variant="outline" className={`text-xs font-bold uppercase py-1 px-2.5 ${
                          cardCondition.urgency === 'emergency' 
                            ? 'bg-destructive/15 text-destructive border-destructive/30 animate-pulse' 
                            : cardCondition.urgency === 'urgent'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          {localizeUrgency(cardCondition.urgency, conversationLanguage)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Model Probability & Alignment Visualizer */}
                  {cardCondition.modelProbability !== null && typeof cardCondition.modelProbability === "number" ? (
                    <div className="rounded-2xl bg-card/90 border border-emerald-500/30 p-5 md:p-6 shadow-xs space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 shadow-inner">
                            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                              {Math.round(cardCondition.modelProbability * 100)}%
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-bold text-foreground">
                                {t("model_confidence", conversationLanguage)}: {Math.round(cardCondition.modelProbability * 100)}% ({t("differential_threshold", conversationLanguage)}: {Math.round((cardCondition.threshold || 0.85) * 100)}%)
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {cardCondition.modelProbability >= 0.80 
                                ? t("alignment_high", conversationLanguage)
                                : t("alignment_narrowing", conversationLanguage)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            {t("threshold_badge", conversationLanguage)}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden border border-border/60">
                        <div
                          className="bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min(100, Math.max(10, Math.round(cardCondition.modelProbability * 100)))}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-card/90 border border-teal-500/30 p-5 md:p-6 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        <div>
                          <span className="text-sm font-bold text-foreground">
                            {t("clinical_safety_protocol", conversationLanguage)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {t("clinical_safety_protocol_desc", conversationLanguage)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 text-xs">
                        {t("protocol_active", conversationLanguage)}
                      </Badge>
                    </div>
                  )}

                  {/* Medical Procedure & Care Details */}
                  {cardCondition.procedure && (
                    <div className="flex items-start gap-3 text-xs text-foreground/90 bg-secondary/40 border border-border/70 rounded-xl p-4 sm:p-5">
                      <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">{t("recommended_procedure_notice", conversationLanguage)}</span>{" "}
                        <span className="font-medium text-emerald-800 dark:text-emerald-200">{cardCondition.procedure}</span>
                        <p className="text-muted-foreground mt-0.5">
                          {t("hospitals_matched_for_procedure", conversationLanguage)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Non-diagnostic medical safety disclaimer */}
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                         {t("preliminary_navigation_notice", conversationLanguage)}
                      </p>
                      <p className="leading-relaxed">
                        {t("preliminary_navigation_desc", conversationLanguage)}
                      </p>
                      {cardCondition.decisionSource === "safe_defer" && m.assessmentSafeDeferReason && (
                        <p className="font-medium text-amber-950 dark:text-amber-50 pt-1 border-t border-amber-500/20">
                          {t("reason_for_referral", conversationLanguage)} {m.assessmentSafeDeferReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons: Hospital Routing + Print - ONLY for the latest assessment card */}
                  {isLatestAssessment && isConfident ? (
                    <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-emerald-500/20">
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                        {cardCondition.decisionSource === "safe_defer"
                          ? t("click_view_general_care", conversationLanguage)
                          : t("click_view_hospitals_for_condition", conversationLanguage, { condition: localizeConditionName(cardCondition.condition, conversationLanguage) })}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <PrintSummaryButton onClick={triggerPrint} />

                        <Button
                          type="button"
                          onClick={() => handleProceedToHospitals(cardCondition)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg gap-2 rounded-xl h-12 px-6 text-sm transition-all shrink-0 cursor-pointer no-print"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>
                            {t("proceed_to_hospitals", conversationLanguage)}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-muted-foreground" />
                        {isLatestAssessment ? t("re_evaluating_below", conversationLanguage) : t("prior_clinical_assessment", conversationLanguage)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {t("actions_on_latest", conversationLanguage)}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            }

            const isLatestQuestion = m.isQuestion && mIdx === messages.length - 1;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`flex items-start gap-3 ${
                  m.sender === "patient" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    m.sender === "patient"
                      ? "bg-secondary text-primary border border-primary/20"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {m.sender === "patient" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div
                  className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-xs ${
                    m.sender === "patient"
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : m.isQuestion
                      ? "bg-card border border-primary/25 text-foreground font-medium rounded-tl-xs shadow-soft"
                      : "bg-secondary/70 border border-border/70 text-foreground rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Message timestamp */}
                  {m.timestamp && (
                    <div
                      className={`text-[10px] mt-1.5 text-right select-none ${
                        m.sender === "patient" ? "text-primary-foreground/75" : "text-muted-foreground"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  )}

                  {/* Candidate Symptom Options attached to the latest question */}
                  {isLatestQuestion && m.options && m.options.length > 0 && !isConfident && (
                    <div className="mt-4 pt-3.5 border-t border-border/50 space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-primary" />
                          {t("recommended_accompanying_symptoms", conversationLanguage)}
                        </span>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {t("select_single_or_multiple", conversationLanguage)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {m.options.map((opt, i) => {
                          const isNone = isNegativeOrNoSymptomResponse(opt);
                          const isSelected = selectedChips.includes(opt);

                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.94 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.18, delay: i * 0.025 }}
                              className={`group flex items-center rounded-xl border text-xs transition-all duration-150 ${
                                isNone
                                  ? "bg-muted/60 hover:bg-destructive/10 hover:border-destructive/40 border-dashed border-border text-muted-foreground hover:text-foreground"
                                  : isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background hover:bg-primary/10 border-border text-foreground hover:border-primary/40"
                              }`}
                            >
                              <button
                                type="button"
                                disabled={requestLoading}
                                onClick={() => toggleChipSelection(opt)}
                                aria-pressed={isSelected}
                                className="px-3.5 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                <span>{localizeSymptomOption(opt, conversationLanguage)}</span>
                              </button>

                              {/* Direct single click send shortcut */}
                              {!isNone && !isSelected && (
                                <button
                                  type="button"
                                  title={t("send_only_this_tooltip", conversationLanguage)}
                                  disabled={requestLoading}
                                  onClick={(e) => handleSingleChipClick(opt, e)}
                                  className="px-2.5 py-2 border-l border-border/60 hover:bg-primary/20 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  {t("btn_only", conversationLanguage)}
                                </button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Action controls below candidate symptoms */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/40">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={requestLoading}
                          onClick={() => {
                            cancelActiveRevealIfAny();
                            handleSendAnswer("No more symptoms");
                          }}
                          className="h-8 px-3 rounded-lg border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{noMoreSymptomsLabel}</span>
                        </Button>

                        {selectedChips.length > 0 && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={requestLoading}
                            onClick={handleSubmitSelectedChips}
                            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs gap-1.5 shadow-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <span>{t("submit_selected_chips", conversationLanguage, { count: selectedChips.length })}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Temporary Progressive Assessment Reveal */}
          {revealingAssessment && (
            <div className="relative">
              <ProgressiveAssistantMessage
                text={revealingAssessment.displayedText}
                language={conversationLanguage}
                isRevealing={true}
                isQuestion={false}
                isEmergency={revealingAssessment.isEmergency}
              />
              <button
                type="button"
                onClick={handleSkipAnimation}
                className="absolute right-2 -bottom-2 text-[10px] bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md border border-border shadow-xs cursor-pointer"
              >
                {t("btn_skip_reveal", conversationLanguage)}
              </button>
            </div>
          )}

          {/* Temporary Progressive Question Reveal */}
          {revealingQuestion && (
            <div className="relative">
              <ProgressiveAssistantMessage
                text={revealingQuestion.displayedText}
                language={conversationLanguage}
                isRevealing={!revealingQuestion.showOptions}
                isQuestion={true}
                options={revealingQuestion.options}
                showOptions={revealingQuestion.showOptions}
                interactionLocked={requestLoading}
                selectedChips={selectedChips}
                onToggleChip={toggleChipSelection}
                onSingleChipClick={handleSingleChipClick}
                onSubmitSelectedChips={handleSubmitSelectedChips}
                onSendNoMoreSymptoms={() => {
                  cancelActiveRevealIfAny();
                  handleSendAnswer("No more symptoms");
                }}
              />
              <button
                type="button"
                onClick={handleSkipAnimation}
                className="absolute right-2 -bottom-2 text-[10px] bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md border border-border shadow-xs cursor-pointer"
              >
                {t("btn_skip_reveal", conversationLanguage)}
              </button>
            </div>
          )}

          {/* Assistant Typing Indicator while waiting for API */}
          {requestLoading && <AssistantTypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom("smooth")}
            className="fixed bottom-24 right-6 z-40 bg-card border border-border/80 text-foreground hover:bg-secondary p-2.5 rounded-full shadow-lg cursor-pointer"
            title={t("scroll_to_latest", conversationLanguage)}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── PINNED BOTTOM COMPOSER BAR ── */}
      {/* Always accessible throughout entire consultation, including before & after assessments */}
      <footer className="shrink-0 bg-card/95 backdrop-blur-md border-t border-border/80 px-4 py-3.5 md:px-6 md:py-4 z-30 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Quick action bar */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[11px] text-foreground flex items-center gap-1">
                <Globe className="w-3 h-3 text-primary" />
                {t("language_label", conversationLanguage)}: {currentLangObj.native}
              </span>
              {isListening && (
                <span className="inline-flex items-center gap-1 text-destructive font-semibold text-[11px] animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  {t("listening_in_lang", conversationLanguage, { lang: currentLangObj.native })}
                </span>
              )}
            </div>

            {!isConfident ? (
              <button
                type="button"
                disabled={requestLoading}
                onClick={() => {
                  cancelActiveRevealIfAny();
                  handleSendAnswer("No more symptoms");
                }}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{t("finished_symptoms_cta", conversationLanguage)}</span>
              </button>
            ) : (
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{t("re_evaluate_hint", conversationLanguage)}</span>
              </span>
            )}
          </div>

          {/* Form wrapper guarantees Enter and Send invoke identical canonical submission */}
          <form onSubmit={handleComposerSubmit} className="w-full">
            <div className={`relative flex items-center gap-2.5 bg-background border ${
              isListening ? "border-destructive ring-2 ring-destructive/20" : "border-border"
            } rounded-2xl shadow-xs transition-all pl-4 pr-2.5 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25`}>
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComposerSubmit();
                  }
                }}
                placeholder={inputPlaceholder}
                aria-label={t("type_placeholder", conversationLanguage)}
                className="w-full min-h-[44px] max-h-[120px] py-2.5 bg-transparent border-0 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:outline-none focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                disabled={requestLoading}
              />

              {/* Microphone Speech Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                disabled={requestLoading}
                aria-label={isListening ? "Stop listening" : "Voice input"}
                title={isListening ? "Stop recording speech" : `Speak in ${currentLangObj.native}`}
                className={`p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-md"
                    : "text-muted-foreground hover:text-primary hover:bg-secondary/80"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <Button
                type="submit"
                disabled={!input.trim() || requestLoading}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground gap-1.5 shrink-0 shadow-xs text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{t("send_button", conversationLanguage)}</span>
              </Button>
            </div>

            {/* Keyboard shortcut hint near text box */}
            <div className="mt-1 px-3 flex items-center justify-between text-[11px] text-muted-foreground select-none">
              <span>{t("keyboard_hint", conversationLanguage)}</span>
            </div>
          </form>
        </div>
      </footer>

      {/* Complete multi-page printable consultation report */}
      {isPrinting && (
        <ConsultationPrintSummary
          initialSymptoms={startingQueryRef.current}
          allSymptomsText={allSymptomsText}
          messages={allCanonicalMessages}
          confirmedCondition={confirmedCondition}
          assessmentStatus={assessmentStatus}
          confidenceScore={confidenceScore}
          safeDeferReason={safeDeferReason}
          topCandidates={topCandidates}
          language={conversationLanguage}
        />
      )}
    </div>
  );
};
