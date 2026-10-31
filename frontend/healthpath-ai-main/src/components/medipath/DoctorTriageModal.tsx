import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Loader2, 
  Mic, 
  MicOff, 
  Building2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t } from "@/lib/i18n";

export type TriageData = {
  clinicalAssessment: string;
  urgencyLevel: "Emergency" | "Urgent" | "Prompt" | "Routine";
  redFlags?: string[];
  recommendedSpecialist?: string;
  recommendedNextStep?: string;
  followUpQuestion?: string | null;
  quickOptions?: string[];
};

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  triageData?: TriageData;
  timestamp: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSymptoms: string;
  conditionName?: string;
  specialty?: string;
  language?: string;
  onSearchWithUpdatedSymptoms?: (symptoms: string) => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const DoctorTriageModal = ({
  open,
  onOpenChange,
  initialSymptoms,
  conditionName,
  specialty,
  language = "en",
  onSearchWithUpdatedSymptoms,
}: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startInitialTriage = useCallback(async () => {
    setLoading(true);
    setMessages([
      {
        id: "user-init",
        sender: "user",
        text: initialSymptoms,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      const res = await fetch(`${API_BASE_URL}/triage/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: initialSymptoms,
          chatHistory: [],
          condition: conditionName ? { condition: conditionName, specialization: specialty } : null,
          language,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const triageData: TriageData = payload.data;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: triageData.clinicalAssessment,
          triageData,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("Initial triage error:", err);
      const fallbackAssessment: TriageData = {
        clinicalAssessment: `Hello, I am Dr. MediPath. I have noted your reported concern: "${initialSymptoms}". Based on initial triage, clinical evaluation is recommended.`,
        urgencyLevel: "Prompt",
        redFlags: ["Sudden severe pain", "Difficulty breathing", "Loss of consciousness", "Uncontrolled bleeding"],
        recommendedSpecialist: specialty || "General Physician",
        recommendedNextStep: "Please consult a qualified doctor at a nearby hospital or clinic.",
        followUpQuestion: "When did your symptoms first begin, and how intense is the discomfort right now?",
        quickOptions: ["Started today", "2 to 3 days ago", "Mild discomfort", "Severe discomfort"],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: "bot",
          text: fallbackAssessment.clinicalAssessment,
          triageData: fallbackAssessment,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [initialSymptoms, conditionName, specialty]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // When modal opens, initialize triage conversation
  useEffect(() => {
    if (open && initialSymptoms) {
      startInitialTriage();
    }
  }, [open, initialSymptoms, startInitialTriage]);

  // Cleanup speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    if (isListening) {
      stopVoice();
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.sender === "user" ? "patient" : "assistant",
        text: m.text,
      }));

      const res = await fetch(`${API_BASE_URL}/triage/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: initialSymptoms,
          chatHistory: historyForApi,
          condition: conditionName ? { condition: conditionName, specialization: specialty } : null,
          language,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const triageData: TriageData = payload.data;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: triageData.clinicalAssessment,
          triageData,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("Triage reply error:", err);
      const fallbackReply: TriageData = {
        clinicalAssessment: `Thank you for the update. Clinical triage suggests consulting a ${specialty || "medical specialist"} for comprehensive evaluation.`,
        urgencyLevel: "Prompt",
        recommendedSpecialist: specialty || "General Physician",
        recommendedNextStep: "Schedule an OPD consultation with a verified hospital doctor.",
        followUpQuestion: null,
        quickOptions: [],
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: "bot",
          text: fallbackReply.clinicalAssessment,
          triageData: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const toggleVoice = () => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const startVoice = () => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = language === "gu" ? "gu-IN" : language === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join("");
        setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const latestTriageData = [...messages].reverse().find((m) => m.triageData)?.triageData;

  const getUrgencyBadgeColor = (urgency?: string) => {
    switch (urgency) {
      case "Emergency":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "Urgent":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "Prompt":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "Routine":
      default:
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-soft">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  Dr. MediPath AI Triage
                  <Badge variant="outline" className="text-[10px] font-medium border-primary/30 text-primary py-0">
                    <Sparkles className="w-2.5 h-2.5 mr-1" /> Gemini 3.6 Flash
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Interactive clinical assessment & urgency triage
                </DialogDescription>
              </div>
            </div>

            {latestTriageData && (
              <Badge variant="outline" className={`font-semibold uppercase tracking-wider text-xs px-2.5 py-1 ${getUrgencyBadgeColor(latestTriageData.urgencyLevel)}`}>
                {latestTriageData.urgencyLevel === "Emergency" && <ShieldAlert className="w-3.5 h-3.5 mr-1 inline" />}
                {latestTriageData.urgencyLevel} Care
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 max-h-[55vh]">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                      : "bg-secondary text-foreground rounded-tl-none border border-border/50 shadow-soft"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Red Flags / Clinical Warning */}
                  {msg.triageData?.redFlags && msg.triageData.redFlags.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/40 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Warning signs to watch:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {msg.triageData.redFlags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Step / Specialist Recommendation */}
                  {msg.triageData?.recommendedNextStep && (
                    <div className="mt-2.5 p-2 rounded-lg bg-card/60 border border-border/50 text-xs text-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                      <div>
                        <strong>Recommended Action:</strong> {msg.triageData.recommendedNextStep}
                        {msg.triageData.recommendedSpecialist && (
                          <div className="mt-0.5 text-muted-foreground">
                            Specialist: <strong>{msg.triageData.recommendedSpecialist}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Follow-up question from Doctor */}
                  {msg.triageData?.followUpQuestion && (
                    <div className="mt-3 p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-medium text-foreground">
                      ❓ {msg.triageData.followUpQuestion}
                    </div>
                  )}
                </div>

                {/* Quick Option Chips */}
                {msg.triageData?.quickOptions && msg.triageData.quickOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.triageData.quickOptions.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(opt)}
                        className="text-xs px-2.5 py-1 rounded-full bg-background hover:bg-secondary border border-border text-foreground hover:border-primary/50 transition-colors shadow-xs"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-muted-foreground px-1">{msg.timestamp}</span>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>{t("thinking_message", language)}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Action Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-background space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("type_placeholder", language)}
              className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 h-11"
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Speak answer"}
              className={`h-10 w-10 p-0 rounded-xl cursor-pointer ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : ""}`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || loading}
              className="h-10 px-4 rounded-xl bg-gradient-primary shadow-soft cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Action to Find Recommended Hospitals */}
          {latestTriageData && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground">
                Triage guidance complete. Ready to locate care?
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  onOpenChange(false);
                  if (onSearchWithUpdatedSymptoms) {
                    onSearchWithUpdatedSymptoms(initialSymptoms);
                  }
                }}
                className="h-8 gap-1.5 text-xs text-primary font-semibold hover:bg-primary/10"
              >
                <Building2 className="w-3.5 h-3.5" />
                Find Hospitals for This Condition
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
