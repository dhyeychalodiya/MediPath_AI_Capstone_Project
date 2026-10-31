import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Stethoscope,
  Building2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  Info,
  HelpCircle,
  X,
  Activity,
  HeartPulse,
} from "lucide-react";
import {
  CANONICAL_CONDITIONS,
  GENERAL_MEDICINE_OPTION,
  CanonicalCondition,
} from "@/data/canonicalConditionsData";
import {
  t,
  localizeConditionName,
  localizeSpecialty,
  localizeBodySystem,
  localizeSymptomOption,
} from "@/lib/i18n";

export interface SupportedDiseasesDirectoryProps {
  onSelectCondition: (condition: CanonicalCondition) => void;
  onClose?: () => void;
  asModal?: boolean;
  language?: string;
}

const BODY_SYSTEMS = [
  "All",
  "Cardiovascular",
  "Respiratory & Pulmonology",
  "Gastroenterology",
  "Ophthalmology & Vision",
  "ENT & Hearing",
  "Dermatology & Skin",
  "Endocrine & Metabolic",
  "Urology & Nephrology",
  "Infectious & General",
  "Orthopedics & Musculoskeletal",
];

export const SupportedDiseasesDirectory = ({
  onSelectCondition,
  onClose,
  asModal = false,
  language = "en",
}: SupportedDiseasesDirectoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");

  const filteredConditions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return CANONICAL_CONDITIONS.filter((c) => {
      // System filter
      if (selectedSystem !== "All" && c.bodySystem !== selectedSystem) {
        return false;
      }

      // Urgency filter
      if (selectedUrgency !== "all" && c.urgency !== selectedUrgency) {
        return false;
      }

      // Search text filter
      if (!q) return true;

      const matchesName = c.name.toLowerCase().includes(q);
      const matchesIcd = c.icd10.toLowerCase().includes(q);
      const matchesSpec = c.specialization.toLowerCase().includes(q);
      const matchesProc = c.procedure.toLowerCase().includes(q);
      const matchesSymptoms = c.topSymptoms.some((s) => s.toLowerCase().includes(q));

      return matchesName || matchesIcd || matchesSpec || matchesProc || matchesSymptoms;
    });
  }, [searchQuery, selectedSystem, selectedUrgency]);

  const content = (
    <div className="w-full space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t("clinical_directory_badge", language)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("verified_conditions_count", language)}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t("supported_diseases_title", language)}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            {t("supported_diseases_subtitle", language)}
          </p>
        </div>

        {onClose && asModal && (
          <button
            onClick={onClose}
            className="self-end md:self-start p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Prominent "Not Sure? General Medicine" Hero Card */}
      <motion.div
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.2 }}
        onClick={() => onSelectCondition(GENERAL_MEDICINE_OPTION)}
        className="cursor-pointer group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 border-2 border-primary/30 hover:border-primary transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/30 shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono">
                  ICD-10: {GENERAL_MEDICINE_OPTION.icd10}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {t("recommended_for_ambiguity", language)}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors mt-1">
                {t("general_medicine_card_title", language)}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                {t("general_medicine_card_subtitle", language)}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {GENERAL_MEDICINE_OPTION.topSymptoms.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-background/80 text-muted-foreground border border-border/80"
                  >
                    • {localizeSymptomOption(s, language)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 sm:self-center">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-md group-hover:bg-primary/90 flex items-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>{t("route_to_general_hospitals", language)}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_diseases_placeholder", language)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {t("clear", language)}
              </button>
            )}
          </div>

          {/* Urgency Selector */}
          <div className="flex items-center gap-1.5 shrink-0 bg-secondary/40 p-1 rounded-xl border border-border">
            {[
              { id: "all", label: t("all_tiers", language) },
              { id: "routine", label: t("tier_routine", language) },
              { id: "urgent", label: t("tier_urgent", language) },
              { id: "emergency", label: t("tier_emergency", language) },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUrgency(u.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  selectedUrgency === u.id
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body Systems Horizontal Scrollable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> {t("filter_system_label", language)}
          </span>
          {BODY_SYSTEMS.map((system) => {
            const isSelected = selectedSystem === system;
            return (
              <button
                key={system}
                onClick={() => setSelectedSystem(system)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all text-xs ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {system === "All"
                  ? (language === "hi" ? "सभी प्रणालियाँ" : language === "gu" ? "બધી સિસ્ટમો" : "All")
                  : localizeBodySystem(system, language)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Current Filters Badge */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {t("showing_supported_count", language, { count: filteredConditions.length })}
        </span>
        {(searchQuery || selectedSystem !== "All" || selectedUrgency !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSystem("All");
              setSelectedUrgency("all");
            }}
            className="text-primary hover:underline font-semibold"
          >
            {t("reset_all_filters", language)}
          </button>
        )}
      </div>

      {/* Grid of Disease Cards */}
      {filteredConditions.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-dashed border-border">
          <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <h4 className="text-base font-bold text-foreground">{t("no_matching_diseases", language)}</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {t("no_matching_diseases_desc", language)}
          </p>
          <button
            onClick={() => onSelectCondition(GENERAL_MEDICINE_OPTION)}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            {t("route_to_general_medicine_btn", language)}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-secondary/15 p-3 sm:p-4 shadow-xs">
          {/* Subtle scroll header badge */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t("scroll_explore_hint", language, { count: filteredConditions.length })}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/80 hidden sm:inline">
              {t("direct_routing_enabled", language)}
            </span>
          </div>

          <div className="max-h-[580px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/25 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <AnimatePresence>
                {filteredConditions.map((condition) => {
                  const isUrgent = condition.urgency === "urgent";
                  const isEmergency = condition.urgency === "emergency";
                  const urgencyLabel = isEmergency
                    ? t("tier_emergency", language)
                    : isUrgent
                    ? t("tier_urgent", language)
                    : t("tier_routine", language);

                  return (
                    <motion.div
                      key={condition.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => onSelectCondition(condition)}
                      className="cursor-pointer group flex flex-col justify-between p-4 rounded-xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-foreground border border-border">
                            {condition.icd10}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isEmergency
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                                : isUrgent
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isEmergency && <ShieldAlert className="w-2.5 h-2.5" />}
                            {isUrgent && <AlertTriangle className="w-2.5 h-2.5" />}
                            {!isUrgent && !isEmergency && <ShieldCheck className="w-2.5 h-2.5" />}
                            {urgencyLabel}
                          </span>
                        </div>

                        {/* Condition Name */}
                        <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {localizeConditionName(condition.name, language)}
                        </h4>

                        {/* Specialty & Body System */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="font-semibold text-primary/90 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-primary" />
                            {localizeSpecialty(condition.specialization, language)}
                          </span>
                          <span>•</span>
                          <span className="truncate">{localizeBodySystem(condition.bodySystem, language)}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {condition.description}
                        </p>

                        {/* Typical Procedure */}
                        <div className="mt-3 p-2 rounded-lg bg-secondary/40 border border-border/60 text-[11px]">
                          <span className="text-muted-foreground font-semibold block text-[10px] uppercase tracking-wider">
                            {t("primary_procedure_label", language)}
                          </span>
                          <span className="font-medium text-foreground line-clamp-1 mt-0.5">
                            {condition.procedure}
                          </span>
                        </div>

                        {/* Symptoms Chips */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {condition.topSymptoms.slice(0, 3).map((sym) => (
                            <span
                              key={sym}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60"
                            >
                              {localizeSymptomOption(sym, language)}
                            </span>
                          ))}
                          {condition.topSymptoms.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full text-muted-foreground">
                              +{condition.topSymptoms.length - 3} {language === "hi" ? "अधिक" : language === "gu" ? "વધુ" : "more"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct Action Link */}
                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary/90">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {language === "hi" ? "उपयुक्त अस्पताल देखें" : language === "gu" ? "મેળ ખાતી હોસ્પિટલો જુઓ" : "View Matching Hospitals"}
                        </span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border p-6 sm:p-8 shadow-2xl relative"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {content}
    </div>
  );
};
