import { useState, useRef, useEffect, useCallback } from "react";

export type SpeechRecognitionStatus =
  | "idle"
  | "requesting_permission"
  | "listening"
  | "processing"
  | "error"
  | "unsupported";

export type SpeechRecognitionErrorType =
  | "network"
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | "not-supported"
  | "aborted"
  | "unknown";

export interface SpeechRecognitionOptions {
  lang?: string;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, errorType: SpeechRecognitionErrorType) => void;
}

// BCP-47 Speech recognition language locale mappings
export const LANGUAGE_SPEECH_LOCALES: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  pa: "pa-IN",
  ml: "ml-IN",
  ur: "ur-IN",
};

/**
 * Returns user-friendly, actionable diagnostic guidance for speech errors
 */
export function getSpeechErrorMessage(
  errorType: string,
  langCode: string = "en"
): { message: string; type: SpeechRecognitionErrorType } {
  const langName =
    langCode === "hi"
      ? "Hindi"
      : langCode === "gu"
      ? "Gujarati"
      : langCode === "en"
      ? "English"
      : langCode;

  switch (errorType) {
    case "network":
      return {
        message:
          "Speech recognition service could not be reached. The browser's speech service requires an active internet connection to recognition servers. You can seamlessly type your symptoms instead.",
        type: "network",
      };
    case "not-allowed":
    case "permission-denied":
      return {
        message:
          "Microphone permission was denied. Please click the camera/microphone icon in your browser's address bar to allow access.",
        type: "not-allowed",
      };
    case "no-speech":
      return {
        message: "No speech was detected. Please click the microphone again and speak clearly.",
        type: "no-speech",
      };
    case "audio-capture":
      return {
        message:
          "No microphone device was detected. Please ensure your microphone is connected and enabled.",
        type: "audio-capture",
      };
    case "not-supported":
      return {
        message:
          "Speech recognition is not supported in this browser. Please type your symptoms or use Google Chrome / Microsoft Edge.",
        type: "not-supported",
      };
    case "aborted":
      return {
        message: "Voice input was cancelled.",
        type: "aborted",
      };
    default:
      return {
        message: `Voice recognition encountered an issue (${errorType}). You can continue by typing.`,
        type: "unknown",
      };
  }
}

export function useSpeechRecognition(defaultOptions: SpeechRecognitionOptions = {}) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<SpeechRecognitionErrorType | null>(null);
  const [interimText, setInterimText] = useState<string>("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const activeRef = useRef<boolean>(true);
  const isStartingRef = useRef<boolean>(false);
  const optionsRef = useRef(defaultOptions);

  useEffect(() => {
    optionsRef.current = defaultOptions;
  }, [defaultOptions]);

  const isSupported = typeof window !== "undefined" && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore if already stopped
      }
    }
    setInterimText("");
    setStatus("idle");
  }, []);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }
    setInterimText("");
    setStatus("idle");
    setErrorMessage(null);
    setErrorType(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setErrorType(null);
  }, []);

  const startListening = useCallback(
    async (options?: { lang?: string }) => {
      clearError();

      if (!isSupported) {
        const err = getSpeechErrorMessage("not-supported");
        setStatus("unsupported");
        setErrorMessage(err.message);
        setErrorType(err.type);
        optionsRef.current.onError?.(err.message, err.type);
        return;
      }

      if (isStartingRef.current || status === "listening") {
        return;
      }

      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) return;

      // Abort any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const targetLang = options?.lang || optionsRef.current.lang || "en";
      const locale = LANGUAGE_SPEECH_LOCALES[targetLang] || `${targetLang}-IN` || "en-IN";

      // Explicit permission check if mediaDevices is supported
      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          setStatus("requesting_permission");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Release initial test track immediately so recognition engine can own the hardware
          stream.getTracks().forEach((track) => track.stop());
        } catch (_permErr: unknown) {
          const err = getSpeechErrorMessage("not-allowed", targetLang);
          setStatus("error");
          setErrorMessage(err.message);
          setErrorType(err.type);
          optionsRef.current.onError?.(err.message, err.type);
          return;
        }
      }

      try {
        isStartingRef.current = true;
        const recognition = new SpeechRecognitionClass();
        recognition.lang = locale;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          if (!activeRef.current) return;
          isStartingRef.current = false;
          setStatus("listening");
          setErrorMessage(null);
          setErrorType(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (!activeRef.current) return;
          let finalTranscript = "";
          let currentInterim = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          if (finalTranscript.trim()) {
            optionsRef.current.onTranscript?.(finalTranscript.trim(), true);
          }
          setInterimText(currentInterim);
          if (currentInterim) {
            optionsRef.current.onTranscript?.(currentInterim, false);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (!activeRef.current) return;
          isStartingRef.current = false;

          // Silent recovery on user abort or minor no-speech
          if (event.error === "aborted") {
            setStatus("idle");
            return;
          }

          const err = getSpeechErrorMessage(event.error, targetLang);
          setStatus("error");
          setErrorMessage(err.message);
          setErrorType(err.type);
          setInterimText("");
          optionsRef.current.onError?.(err.message, err.type);
        };

        recognition.onend = () => {
          if (!activeRef.current) return;
          isStartingRef.current = false;
          setInterimText("");
          setStatus((prev) => (prev === "listening" ? "idle" : prev));
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: unknown) {
        isStartingRef.current = false;
        const errName = err instanceof Error ? err.name : "unknown";
        const diag = getSpeechErrorMessage(errName, targetLang);
        setStatus("error");
        setErrorMessage(diag.message);
        setErrorType(diag.type);
        optionsRef.current.onError?.(diag.message, diag.type);
      }
    },
    [isSupported, status, clearError]
  );

  // Component cleanup
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    status,
    isListening: status === "listening",
    isSupported,
    errorMessage,
    errorType,
    interimText,
    startListening,
    stopListening,
    cancelListening,
    clearError,
  };
}
