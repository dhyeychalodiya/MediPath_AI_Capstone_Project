import { motion } from "framer-motion";
import {
  Building2,
  ShieldCheck,
  Stethoscope,
  XCircle,
  Radio,
  Compass,
  CheckCircle2,
  Activity,
  MapPin,
} from "lucide-react";
import { CanonicalCondition } from "@/data/canonicalConditionsData";
import {
  t,
  localizeConditionName,
  localizeSpecialty,
} from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DirectDiseaseRoutingStateProps {
  condition: CanonicalCondition;
  locationLabel?: string;
  onCancel?: () => void;
  language?: string;
}

export const DirectDiseaseRoutingState = ({
  condition,
  locationLabel = "Current Location",
  onCancel,
  language = "en",
}: DirectDiseaseRoutingStateProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-medium relative overflow-hidden space-y-6"
      >
        {/* Top Header Badge & Engine Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              {t("direct_clinical_route_badge", language)}
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              {t("live_geospatial_engine", language)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>ICD-10 Anchor:</span>
            <span className="font-bold font-mono text-foreground px-2 py-0.5 rounded bg-secondary border border-border">
              {condition.icd10}
            </span>
          </div>
        </div>

        {/* Title: Direct Hospital Routing for [Condition] */}
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 flex-wrap">
            <span>{t("routing_for_condition", language, { name: "" })}</span>
            <span className="text-primary underline decoration-primary/30 underline-offset-4">
              {localizeConditionName(condition.name, language)}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {language === "hi"
              ? `लक्षण मॉडल को बायपास करके सीधे ${localizeSpecialty(condition.specialization, language)} विभाग और अस्पतालों को खोजा जा रहा है...`
              : language === "gu"
              ? `લક્ષણ મોડેલને બાયપાસ કરીને સીધા ${localizeSpecialty(condition.specialization, language)} વિભાગ અને હોસ્પિટલો શોધી રહ્યાં છીએ...`
              : `Bypassing symptom triage • Direct hospital discovery for accredited ${condition.specialization} departments near ${locationLabel}`}
          </p>
        </div>

        {/* 3-Step Visual Clinical Routing Flow: Disease -> Department -> Hospitals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Node 1: Selected Disease Entity */}
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 1: Selection</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground truncate" title={condition.name}>
                {language === "hi" ? "पुष्ट रोग:" : language === "gu" ? "પુષ્ટ રોગ:" : "Confirmed:"} {condition.name}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                ICD-10: {condition.icd10}
              </div>
            </div>
            <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Verified Condition
            </div>
          </div>

          {/* Node 2: Target Specialty Department */}
          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Step 2: Department</span>
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm text-primary truncate" title={condition.specialization}>
                {condition.specialization}
              </div>
              {condition.procedure && (
                <div className="text-[11px] text-muted-foreground truncate mt-0.5" title={condition.procedure}>
                  {condition.procedure}
                </div>
              )}
            </div>
            <div className="text-[10px] font-medium text-primary">
              Target Specialty Matched
            </div>
          </div>

          {/* Node 3: Hospital Discovery & Radius Matching */}
          <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 3: Hospitals</span>
              <Building2 className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground truncate" title={locationLabel}>
                {locationLabel}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                NABH & Verified Registry
              </div>
            </div>
            <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Routing Hospitals...
            </div>
          </div>
        </div>

        {/* Live Network Telemetry Indicators */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-around text-xs text-muted-foreground flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-foreground">{t("scanned_nodes_label", language)}</span>
          </span>
          <span className="text-border" aria-hidden>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium text-foreground">{t("matched_facilities_label", language)}</span>
          </span>
          <span className="text-border" aria-hidden>•</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium text-foreground">{locationLabel}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
            initial={{ width: "25%" }}
            animate={{ width: "95%" }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          />
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted-foreground">
              Direct Clinical Routing in progress...
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-destructive cursor-pointer h-8"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5 text-destructive" />
              {language === "hi" ? "रद्द करें" : language === "gu" ? "રદ કરો" : "Cancel"}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
