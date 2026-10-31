import React from "react";
import { motion } from "framer-motion";
import { Gauge, Sparkles, AlertCircle, Info, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";

export interface ModelConfidenceBarProps {
  score?: number | null;
  confidence?: number | null;
  confidenceChange?: number | null;
  previousConfidence?: number | null;
  candidateCount?: number | null;
  modelProbability?: number | null;
  threshold?: number | null;
  isLoading?: boolean;
  isUpdating?: boolean;
  isSafeDefer?: boolean;
  turnCount?: number;
  language?: string;
  className?: string;
}

export const ModelConfidenceBar: React.FC<ModelConfidenceBarProps> = ({
  score,
  confidence,
  confidenceChange,
  previousConfidence,
  candidateCount,
  modelProbability,
  threshold = 0.85,
  isLoading = false,
  isUpdating = false,
  isSafeDefer = false,
  turnCount = 0,
  language = "en",
  className = "",
}) => {
  const rawScore = typeof score === "number" ? score : typeof confidence === "number" ? confidence : null;
  const displayScore = rawScore !== null ? Math.max(0, Math.min(100, Math.round(rawScore))) : null;
  const loading = Boolean(isLoading || isUpdating);

  // Determine alignment tier badge
  const getAlignmentTier = (val: number) => {
    if (val >= 85) return { label: t("alignment_high", language), color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
    if (val >= 60) return { label: t("alignment_narrowing", language), color: "border-primary/30 bg-primary/10 text-primary" };
    return { label: t("alignment_exploring", language), color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" };
  };

  const tier = displayScore !== null ? getAlignmentTier(displayScore) : null;

  return (
    <div
      className={`w-full bg-card/60 dark:bg-card/40 border border-border/70 rounded-xl p-2.5 sm:p-3 transition-all ${className}`}
      role="region"
      aria-label={t("model_confidence", language)}
    >
      {/* Header Row: Label, Score, and Status Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{t("model_confidence", language)}</span>
          </span>

          {loading ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary animate-pulse">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>{t("updating_assessment", language)}</span>
              {displayScore !== null && (
                <span className="font-mono font-extrabold text-xs text-primary/80 ml-1">
                  ({displayScore}%)
                </span>
              )}
            </span>
          ) : isSafeDefer || displayScore === null ? (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              {t("score_unavailable", language)}
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-extrabold text-xs text-primary">
                {displayScore}%
              </span>
              {typeof confidenceChange === "number" && confidenceChange !== 0 && !loading && (
                <span
                  className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                    confidenceChange > 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}
                  title={`Confidence delta: ${confidenceChange > 0 ? "+" : ""}${confidenceChange}%`}
                >
                  {confidenceChange > 0 ? (
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                  )}
                  {confidenceChange > 0 ? `+${confidenceChange}%` : `${confidenceChange}%`}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {typeof candidateCount === "number" && candidateCount > 0 && !isSafeDefer && (
            <Badge variant="outline" className="text-[10px] py-0 px-2 font-medium border-border/80 bg-secondary/40 text-foreground">
              {candidateCount === 1 ? t("candidate_single", language) : t("candidates_count", language, { count: candidateCount })}
            </Badge>
          )}

          {tier && !isSafeDefer && (
            <Badge variant="outline" className={`text-[10px] py-0 px-2 font-medium ${tier.color}`}>
              {tier.label}
            </Badge>
          )}

          <Badge variant="outline" className="border-border text-[9px] font-mono py-0 px-1.5 text-muted-foreground hidden md:inline-flex">
            {t("differential_threshold", language)}
          </Badge>
        </div>
      </div>

      {/* Accessible Horizontal Progress Bar */}
      <div
        className="relative w-full h-2 bg-secondary/80 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={displayScore !== null ? displayScore : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t("model_confidence", language)}: ${displayScore !== null ? displayScore + "%" : "updating"}`}
      >
        {/* Differential Threshold Marker at 85% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
          style={{ left: "85%" }}
          title={t("differential_threshold", language)}
        />

        {displayScore !== null && !isSafeDefer ? (
          <motion.div
            className={`h-full rounded-full ${
              displayScore >= 85
                ? "bg-gradient-to-r from-teal-500 to-emerald-500"
                : displayScore >= 60
                ? "bg-gradient-to-r from-primary/80 to-primary"
                : "bg-gradient-to-r from-amber-500 to-primary/80"
            }`}
            initial={false}
            animate={{
              width: `${displayScore}%`,
              opacity: loading ? 0.6 : 1,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ) : (
          <div className="w-full h-full bg-muted/40" />
        )}
      </div>

      {/* Honest Medical Caption & Dynamic Update Indicator */}
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-muted-foreground leading-tight flex-wrap">
        <div className="flex items-start gap-1">
          <Info className="w-3 h-3 text-muted-foreground/80 shrink-0 mt-0.5" />
          <span>{t("model_confidence_caption", language)}</span>
        </div>
        {typeof confidenceChange === "number" && confidenceChange !== 0 && !loading && (
          <span className="font-medium text-[10px] text-muted-foreground/90 ml-auto">
            {confidenceChange > 0 ? "Confidence refined with concordant symptoms" : "Confidence adjusted due to differing symptoms"}
          </span>
        )}
      </div>
    </div>
  );
};
