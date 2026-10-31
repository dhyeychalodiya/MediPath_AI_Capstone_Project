import { useState } from "react";
import { ChevronDown, ChevronUp, Database, Info, Activity, CheckCircle2, XCircle } from "lucide-react";
import { AssessmentState, DoctorTriageV2Candidate } from "@/services/hospitalService";
import { Badge } from "@/components/ui/badge";
import { t, localizeConditionName, localizeDecisionSource } from "@/lib/i18n";

type Props = {
  initialSymptoms: string;
  assessmentState?: AssessmentState | null;
  topCandidates?: DoctorTriageV2Candidate[];
  modelProbability?: number | null;
  threshold?: number | null;
  passesThreshold?: boolean;
  decisionSource?: string;
  turnCount: number;
  className?: string;
  language?: string;
};

export const InformationUsedPanel = ({
  initialSymptoms,
  assessmentState,
  topCandidates = [],
  modelProbability,
  threshold,
  passesThreshold,
  decisionSource,
  turnCount,
  className = "",
  language = "en",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  // Do not expose candidate diseases before the mandatory first follow-up is completed
  // unless assessmentState explicitly says mandatoryFirstFollowupCompleted or turnCount >= 1
  const firstFollowupDone =
    turnCount >= 1 || Boolean(assessmentState?.mandatoryFirstFollowupCompleted);

  if (!firstFollowupDone) {
    return null;
  }

  // Format model probability safely: NEVER render null/undefined as 0%
  const formattedProbability =
    typeof modelProbability === "number" && !isNaN(modelProbability)
      ? `${Math.round(modelProbability * 100)}%`
      : typeof assessmentState?.currentModelConfidence === "number"
      ? `${Math.round(assessmentState.currentModelConfidence * 100)}%`
      : "N/A (Clinical Rule / Non-Probabilistic)";

  const formattedThreshold =
    typeof threshold === "number" && !isNaN(threshold)
      ? `${Math.round(threshold * 100)}%`
      : "N/A";

  const confirmedList = assessmentState?.confirmedSymptoms || [];
  const additionalList = assessmentState?.additionalSymptoms || [];
  const rejectedCount = assessmentState?.rejectedSymptoms?.length ?? 0;
  const source = decisionSource || (assessmentState ? "pattern_alignment" : "triage_evaluation");

  return (
    <div
      className={`rounded-xl border border-border/80 bg-card/60 overflow-hidden shadow-xs text-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left font-semibold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary shrink-0" />
          <span>{t("info_used_title", language)}</span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border">
            {t("model_audit_badge", language)}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-[11px] font-normal">{isOpen ? t("hide", language) : t("review", language)}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-border/50 bg-background/50">
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {t("info_used_desc", language)}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Reported Symptoms */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                {t("reported_symptom_evidence", language)}
              </span>
              <div className="space-y-1 text-muted-foreground">
                <div>
                  <span className="text-foreground/80 font-medium">{t("initial_query_label", language)}: </span>
                  <span>{initialSymptoms || "None"}</span>
                </div>
                {additionalList.length > 0 && (
                  <div>
                    <span className="text-foreground/80 font-medium">{t("additional_reported_label", language)} </span>
                    <span>{additionalList.join(", ")}</span>
                  </div>
                )}
                <div>
                  <span className="text-foreground/80 font-medium">{t("confirmed_selections_label", language)} </span>
                  <span>{confirmedList.length > 0 ? confirmedList.join(", ") : t("none_confirmed", language)}</span>
                </div>
                <div>
                  <span className="text-foreground/80 font-medium">{t("rejected_options_label", language)} </span>
                  <span>{t("options_excluded", language, { count: rejectedCount })}</span>
                </div>
              </div>
            </div>

            {/* Model Outputs and Decision Metrics */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                {t("model_alignment_metrics", language)}
              </span>
              <div className="space-y-1 text-muted-foreground">
                <div>
                  <span className="text-foreground/80 font-medium">{t("model_probability_label", language)} </span>
                  <span className="font-semibold text-foreground">{formattedProbability}</span>
                </div>
                <div>
                  <span className="text-foreground/80 font-medium">{t("required_threshold_label", language)} </span>
                  <span>{formattedThreshold}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground/80 font-medium">{t("threshold_status_label", language)} </span>
                  {passesThreshold ? (
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1 py-0">
                      <CheckCircle2 className="w-3 h-3" /> {t("threshold_met", language)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] gap-1 py-0">
                      <XCircle className="w-3 h-3" /> {t("threshold_pending", language)}
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="text-foreground/80 font-medium">{t("decision_source_label", language)} </span>
                  <span className="font-mono text-[11px]">{localizeDecisionSource(source, language) || source}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Leading Candidates (Only after first follow-up) */}
          {topCandidates.length > 0 && (
            <div className="pt-1">
              <span className="font-semibold text-foreground block mb-1.5">
                {t("leading_candidates_label", language)}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topCandidates.slice(0, 4).map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-secondary/80 border border-border/70 text-foreground"
                  >
                    <span className="font-medium">{localizeConditionName(c.condition, language)}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {typeof c.modelProbability === "number"
                        ? `(${Math.round(c.modelProbability * 100)}%)`
                        : c.confidence
                        ? `(${c.confidence}%)`
                        : ""}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
