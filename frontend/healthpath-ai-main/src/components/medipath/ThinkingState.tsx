import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Stethoscope,
  Building2,
  Calculator,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

export type ThinkingStateProps = {
  query?: string;
  confirmedCondition?: { condition?: string; specialty?: string; specialization?: string; icd10?: string } | null;
  modelVersion?: string;
  language?: string;
  locationLabel?: string;
};

const STEPS = [
  {
    id: "symptoms",
    icon: Stethoscope,
    label: {
      en: "Synthesizing consultation symptoms & clinical assessment",
      hi: "परामर्श लक्षणों एवं ICD-10 नैदानिक ​​आकलन का संश्लेषण",
      gu: "પરામર્શ લક્ષણો અને ICD-10 ક્લિનિકલ આકારણીનું સંશ્લેષણ",
    },
  },
  {
    id: "hospitals",
    icon: Building2,
    label: {
      en: "Matching accredited specialty departments & nearby facilities",
      hi: "मान्यता प्राप्त विशेषज्ञ विभागों व नजदीकी अस्पतालों का मिलान",
      gu: "માન્યતા પ્રાપ્ત વિશેષતા વિભાગો અને નજીકની હોસ્પિટલો સાથે મેળ",
    },
  },
  {
    id: "costs",
    icon: Calculator,
    label: {
      en: "Calculating transparent package tariffs & bed availability",
      hi: "पारदर्शी पैकेज शुल्क एवं बिस्तर उपलब्धता की गणना",
      gu: "પારદર્શક પેકેજ ટેરિફ અને બેડ ઉપલબ્ધતાની ગણતરી",
    },
  },
  {
    id: "ranking",
    icon: Sparkles,
    label: {
      en: "Ranking top-matched hospitals by quality & proximity",
      hi: "गुणवत्ता व निकटता के आधार पर शीर्ष अस्पतालों की रैंकिंग",
      gu: "ગુણવત્તા અને નિકટતાના આધારે ટોચની હોસ્પિટલોનું રેન્કિંગ",
    },
  },
];

export const ThinkingState = ({
  query,
  confirmedCondition,
  modelVersion = "_MedP_AI_V2.0",
  language = "en",
  locationLabel,
}: ThinkingStateProps) => {
  const [activeStep, setActiveStep] = useState(0);

  // Progressive step animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return 30;
      case 1:
        return 60;
      case 2:
        return 85;
      case 3:
        return 98;
      default:
        return 98;
    }
  }, [activeStep]);

  const langKey = language === "hi" ? "hi" : language === "gu" ? "gu" : "en";

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-medium space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                {language === "hi"
                  ? "डॉ. मेडीपाथ · विशेषज्ञ अस्पतालों का मिलान"
                  : language === "gu"
                  ? "ડૉ. મેડીપાથ · નિષ્ણાત હોસ્પિટલો સાથે મેળ"
                  : "Dr. MediPath · Matching Specialist Hospitals"}
              </h3>
              <span className="text-xs font-bold font-mono text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                {progressPercent}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {confirmedCondition?.condition
                ? `${confirmedCondition.condition} (${confirmedCondition.specialization || confirmedCondition.specialty || "Specialist Care"}) • ${locationLabel || "Current Location"}`
                : query
                ? `“${query}” • ${locationLabel || "Current Location"}`
                : `${locationLabel || "Current Location"}`}
            </p>
          </div>
        </div>

        {/* Minimal Smooth Progress Bar */}
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-teal rounded-full"
            initial={{ width: "20%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* 4 Clean, Well-Spaced Steps */}
        <div className="space-y-2.5 pt-1">
          {STEPS.map((s, i) => {
            const isCompleted = i < activeStep;
            const isCurrent = i === activeStep;
            const StepIcon = s.icon;

            return (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm transition-colors border ${
                  isCompleted
                    ? "bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
                    : isCurrent
                    ? "bg-primary/5 text-foreground font-medium border-primary/30 shadow-xs"
                    : "text-muted-foreground opacity-50 border-transparent bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <StepIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{s.label[langKey] || s.label.en}</span>
                </div>

                {isCompleted && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0">
                    {language === "hi" ? "पूर्ण" : language === "gu" ? "પૂર્ણ" : "Done"}
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider shrink-0 animate-pulse">
                    ...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};