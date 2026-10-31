import { useState, useRef, useEffect, FormEvent } from "react";
import { Search, Sparkles, ChevronDown, Mic, MicOff, Globe, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModelVersion } from "@/services/hospitalService";
import { useSpeechRecognition, LANGUAGE_SPEECH_LOCALES } from "@/hooks/useSpeechRecognition";
import { t, detectInputLanguage } from "@/lib/i18n";

type Props = {
  onSearch: (q: string, lang?: string) => void;
  initial?: string;
  compact?: boolean;
  modelVersion: ModelVersion;
  onModelVersionChange: (version: ModelVersion) => void;
  selectedLanguage?: string;
  onLanguageChange?: (lang: string) => void;
};

export const INDIAN_LANGUAGES = [
  { code: "en", locale: "en-IN", label: "English", fullName: "English (India)" },
  { code: "hi", locale: "hi-IN", label: "हिन्दी", fullName: "Hindi (हिन्दी)" },
  { code: "gu", locale: "gu-IN", label: "ગુજરાતી", fullName: "Gujarati (ગુજરાતી)" },
];

export const SearchBar = ({
  onSearch,
  initial = "",
  compact = false,
  modelVersion,
  onModelVersionChange,
  selectedLanguage = "en",
  onLanguageChange,
}: Props) => {
  const [q, setQ] = useState(initial);
  const [showModels, setShowModels] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [activeLang, setActiveLang] = useState(selectedLanguage);
  const [error, setError] = useState("");

  // Sync internal state when initial prop changes
  useEffect(() => {
    setQ(initial);
  }, [initial]);

  useEffect(() => {
    if (selectedLanguage) {
      setActiveLang(selectedLanguage);
    }
  }, [selectedLanguage]);

  // Integrated Speech Recognition Hook
  const {
    isListening,
    status: speechStatus,
    errorMessage: speechErrorMessage,
    startListening,
    stopListening,
    clearError: clearSpeechError,
  } = useSpeechRecognition({
    lang: activeLang,
    onTranscript: (transcript: string) => {
      setQ((prev) => {
        const trimmedPrev = prev.trim();
        return trimmedPrev ? `${trimmedPrev} ${transcript}` : transcript;
      });
      setError("");
    },
    onError: (msg) => {
      setError(msg);
    },
  });

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      setError("");
      clearSpeechError();
      startListening({ lang: activeLang });
    }
  };

  const selectLanguage = (code: string) => {
    setActiveLang(code);
    onLanguageChange?.(code);
    setShowLanguages(false);
    if (isListening) {
      stopListening();
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    }
    const trimmed = q.trim();
    if (!trimmed) {
      setError(t("search_empty_error", activeLang));
      return;
    }
    setError("");

    // Auto-detect Indic script or Romanized Indic (e.g. "mane mathu dukhe chhe" -> "gu")
    const detected = detectInputLanguage(trimmed);
    const langToUse = detected || activeLang || "en";
    if (langToUse !== activeLang) {
      setActiveLang(langToUse);
      onLanguageChange?.(langToUse);
    }
    onSearch(trimmed, langToUse);
  };

  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === activeLang) || INDIAN_LANGUAGES[0];

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full ${compact ? "max-w-3xl" : "max-w-3xl"}`}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-focus-within:opacity-20 blur-xl rounded-2xl transition-opacity duration-500" />

        {/* Active Listening Indicator Banner */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="mb-2 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center justify-between text-xs text-destructive font-medium"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
                <span>
                  Listening in <strong>{currentLangObj.fullName}</strong>... Speak your symptoms
                </span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-xs underline hover:no-underline font-semibold text-destructive cursor-pointer"
              >
                {t("stop_listening", activeLang)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`relative flex flex-wrap items-end gap-2.5 bg-card border ${
            error
              ? "border-destructive"
              : isListening
              ? "border-destructive ring-2 ring-destructive/20"
              : "border-border"
          } rounded-2xl shadow-soft hover:shadow-medium focus-within:shadow-medium focus-within:border-primary/50 transition-all duration-300 pl-4 pr-3 py-2.5`}
        >
          <Search className="w-5 h-5 mb-3 text-muted-foreground shrink-0" />

          <textarea
            value={q}
            onChange={(e) => {
              const val = e.target.value;
              setQ(val);
              if (error) setError("");
              const detected = detectInputLanguage(val);
              if (detected && detected !== activeLang) {
                setActiveLang(detected);
                onLanguageChange?.(detected);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
            placeholder={t("search_placeholder", activeLang)}
            rows={compact ? 2 : 3}
            className={`min-w-[180px] flex-1 resize-y bg-transparent outline-none border-none ${
              compact ? "py-2.5 px-1 text-base" : "py-3 px-1 text-lg"
            } text-foreground placeholder:text-muted-foreground`}
          />

          {/* Voice Language Selector & Mic Button */}
          <div className="flex items-center gap-2 mb-1 shrink-0">
            {/* Language Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowLanguages((prev) => !prev);
                  setShowModels(false);
                }}
                title="Select Language"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:border-primary/50 transition-colors cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{currentLangObj.label}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {showLanguages && (
                <div className="absolute bottom-11 right-0 z-50 w-52 max-h-60 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Consultation Languages
                  </div>
                  {INDIAN_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => selectLanguage(lang.code)}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-secondary cursor-pointer ${
                        activeLang === lang.code
                          ? "bg-secondary text-primary font-semibold"
                          : "text-foreground"
                      }`}
                    >
                      <span>{lang.fullName}</span>
                      {activeLang === lang.code && (
                        <span className="text-[10px] text-primary">●</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              aria-label={isListening ? "Stop listening" : "Voice input"}
              title={
                isListening
                  ? "Stop recording"
                  : `Speak symptoms in ${currentLangObj.fullName}`
              }
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer ${
                isListening
                  ? "bg-destructive text-destructive-foreground border-destructive shadow-md shadow-destructive/30 animate-pulse"
                  : "bg-background border-border text-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Model Version Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowModels((shown) => !shown);
                  setShowLanguages(false);
                }}
                aria-expanded={showModels}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs text-foreground hover:border-primary/50 cursor-pointer"
              >
                <span
                  className={
                    modelVersion === "_MedP_AI_V2.0" ? "font-semibold text-primary" : ""
                  }
                >
                  {modelVersion === "_MedP_AI_V2.0"
                    ? "V2.0 Doctor AI"
                    : modelVersion === "_MedP_AI_V1.5"
                    ? "V1.5"
                    : "V1.0"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
              {showModels && (
                <div className="absolute bottom-11 right-0 z-50 min-w-[170px] rounded-lg border border-border bg-popover p-1 shadow-medium">
                  {(["_MedP_AI_V1.0", "_MedP_AI_V1.5", "_MedP_AI_V2.0"] as ModelVersion[]).map(
                    (version) => (
                      <button
                        key={version}
                        type="button"
                        onClick={() => {
                          onModelVersionChange(version);
                          setShowModels(false);
                        }}
                        className={`block w-full rounded-md px-3 py-2 text-left text-xs hover:bg-secondary cursor-pointer ${
                          modelVersion === version
                            ? "bg-secondary text-primary font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {version === "_MedP_AI_V2.0"
                          ? "MedP AI V2.0 · Doctor AI"
                          : version === "_MedP_AI_V1.5"
                          ? "MedP AI V1.5 · Direct"
                          : "MedP AI V1.0 · Direct"}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Search Submit Button */}
            <Button
              type="submit"
              size={compact ? "default" : "lg"}
              className="bg-gradient-primary hover:opacity-90 shadow-soft rounded-xl gap-2 h-9 px-4 sm:px-5 font-semibold cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">
                {modelVersion === "_MedP_AI_V2.0" ? t("consult_doctor", activeLang) : t("search_button", activeLang)}
              </span>
            </Button>
          </div>
        </div>

        {/* Keyboard shortcut hint near text box */}
        <div className="mt-1 px-3 flex items-center justify-between text-[11px] text-muted-foreground select-none">
          <span>{t("keyboard_hint", activeLang)}</span>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-1 px-2 text-left text-xs text-destructive flex items-center gap-1 leading-snug"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </motion.form>
  );
};