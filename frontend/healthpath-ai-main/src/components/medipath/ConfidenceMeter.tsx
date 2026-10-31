import { motion } from "framer-motion";
import { t } from "@/lib/i18n";

export interface ConfidenceMeterProps {
  value?: number | null;
  isSafeDefer?: boolean;
  language?: string;
}

export const ConfidenceMeter = ({
  value,
  isSafeDefer = false,
  language = "en",
}: ConfidenceMeterProps) => {
  const isUnavailable = isSafeDefer || value === null || value === undefined;

  if (isUnavailable) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("model_confidence", language)}</span>
          <span className="font-medium text-xs text-amber-600 dark:text-amber-400">
            {t("score_unavailable", language)}
          </span>
        </div>
        <div className="relative h-2.5 bg-muted/60 rounded-full overflow-hidden">
          <div className="w-full h-full bg-muted/40" />
        </div>
        <p className="text-xs text-muted-foreground">
          {t("model_confidence_caption", language)}
        </p>
      </div>
    );
  }

  const numericValue = Math.max(0, Math.min(100, Math.round(value)));
  const color =
    numericValue >= 85
      ? "hsl(var(--success))"
      : numericValue >= 65
      ? "hsl(var(--primary))"
      : "hsl(var(--warning))";
  const label =
    numericValue >= 85
      ? "High confidence"
      : numericValue >= 65
      ? "Moderate confidence"
      : "Low confidence";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">AI confidence</span>
        <span className="font-semibold text-foreground">{numericValue}%</span>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${numericValue}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};