import React from "react";
import { motion } from "framer-motion";
import { Bot, Tag, Plus, Check, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isNegativeOrNoSymptomResponse } from "@/lib/symptomHelpers";
import { getPrefersReducedMotion } from "@/hooks/useProgressiveText";
import { t, localizeSymptomOption } from "@/lib/i18n";

type Props = {
  text: string;
  language?: string;
  isRevealing?: boolean;
  isQuestion?: boolean;
  isEmergency?: boolean;
  options?: string[];
  showOptions?: boolean;
  interactionLocked?: boolean;
  selectedChips?: string[];
  onToggleChip?: (chip: string) => void;
  onSingleChipClick?: (chip: string, e: React.MouseEvent) => void;
  onSubmitSelectedChips?: () => void;
  onSendNoMoreSymptoms?: () => void;
};

export const ProgressiveAssistantMessage = ({
  text,
  language = "en",
  isRevealing = false,
  isQuestion = false,
  isEmergency = false,
  options = [],
  showOptions = false,
  interactionLocked = false,
  selectedChips = [],
  onToggleChip,
  onSingleChipClick,
  onSubmitSelectedChips,
  onSendNoMoreSymptoms,
}: Props) => {
  const prefersReducedMotion = getPrefersReducedMotion();

  return (
    <div
      className="flex items-start gap-3 flex-row"
      role="region"
      aria-label={isEmergency ? "Emergency Notice" : isQuestion ? "Follow-up Inquiry" : "Clinical Assessment"}
    >
      {/* Bot Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
          isEmergency
            ? "bg-destructive text-destructive-foreground animate-pulse"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isEmergency
            ? "bg-destructive/10 border-2 border-destructive/50 text-destructive font-medium rounded-tl-xs shadow-md"
            : isQuestion
            ? "bg-primary/5 border border-primary/20 text-foreground font-medium rounded-tl-xs shadow-xs"
            : "bg-secondary/70 border border-border/70 text-foreground rounded-tl-xs"
        }`}
      >
        {/* Visually streaming partial text or completed text */}
        <p className="whitespace-pre-wrap inline">
          {/* Visible text for users */}
          <span aria-hidden={isRevealing}>{text}</span>
          {/* Blinking cursor only while actively revealing */}
          {isRevealing && (
            <span
              className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle animate-pulse"
              aria-hidden="true"
            />
          )}
        </p>

        {/* Screen-reader announcement: when finished revealing, announce polite / assertive */}
        {!isRevealing && (
          <span className="sr-only" role="status" aria-live={isEmergency ? "assertive" : "polite"}>
            {text}
          </span>
        )}

        {/* Candidate Symptom Options attached to follow-up questions */}
        {isQuestion && options && options.length > 0 && showOptions && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                {t("recommended_symptoms_patterns", language)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("click_single_or_toggle", language)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {options.map((opt, i) => {
                const isNone = isNegativeOrNoSymptomResponse(opt);
                const isSelected = selectedChips.includes(opt);

                const chipContent = (
                  <div
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
                      disabled={interactionLocked}
                      onClick={() => onToggleChip?.(opt)}
                      aria-pressed={isSelected}
                      className="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : !isNone ? (
                        <Plus className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                      ) : null}
                      <span>{localizeSymptomOption(opt, language)}</span>
                    </button>

                    {/* Direct single click shortcut */}
                    {!isNone && !isSelected && onSingleChipClick && (
                      <button
                        type="button"
                        title={t("send_only_this_tooltip", language)}
                        disabled={interactionLocked}
                        onClick={(e) => onSingleChipClick(opt, e)}
                        className="px-2 py-1.5 border-l border-border/60 hover:bg-primary/20 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {t("btn_only", language)}
                      </button>
                    )}
                  </div>
                );

                if (prefersReducedMotion) {
                  return <div key={i}>{chipContent}</div>;
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.2,
                      delay: i * 0.05, // 50ms stagger per chip
                      ease: "easeOut",
                    }}
                  >
                    {chipContent}
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
                disabled={interactionLocked}
                onClick={onSendNoMoreSymptoms}
                className="h-8 px-3 rounded-lg border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t("no_more_symptoms", language)}</span>
              </Button>

              {selectedChips.length > 0 && onSubmitSelectedChips && (
                <Button
                  type="button"
                  size="sm"
                  disabled={interactionLocked}
                  onClick={onSubmitSelectedChips}
                  className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs gap-1.5 shadow-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{t("submit_selected_chips", language, { count: selectedChips.length })}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
