import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Activity, 
  Frown, 
  AlertTriangle, 
  GitCompareArrows, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Navigation,
  Database,
  Globe,
  Layers,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { HospitalCard } from "./HospitalCard";
import { CostBreakdown } from "./CostBreakdown";
import { Disclaimer } from "./Disclaimer";
import { FilterPanel } from "./FilterPanel";
import { HospitalDetailsDialog } from "./HospitalDetailsDialog";
import { HospitalComparisonDialog } from "./HospitalComparisonDialog";
import { DoctorTriageModal } from "./DoctorTriageModal";
import { EnrichedHospital, SearchOutput, SearchFilters, defaultFilters } from "@/services/hospitalService";
import { t, localizeConditionName, localizeSpecialty, localizeDecisionSource, localizeAiRecommendation } from "@/lib/i18n";

type Props = {
  result: SearchOutput;
  filters: SearchFilters;
  onFiltersChange: (f: SearchFilters) => void;
  locationLabel: string;
  language?: string;
  onReconsultDoctor?: () => void;
};

export const ResultsView = ({ result, filters, onFiltersChange, locationLabel, language = "en", onReconsultDoctor }: Props) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const [selected, setSelected] = useState<EnrichedHospital | null>(null);
  const [open, setOpen] = useState(false);
  const [comparison, setComparison] = useState<EnrichedHospital[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'Verified Registry' | 'Google Places' | 'OpenStreetMap'>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Comprehensive, instantaneous client-side filter and sort pipeline
  const filteredHospitals = useMemo(() => {
    let list = result.hospitals || [];

    // 1. Hospital Name Search Filter
    if (filters.hospitalName && filters.hospitalName.trim()) {
      const q = filters.hospitalName.trim().toLowerCase();
      list = list.filter((h) => 
        String(h.name || '').toLowerCase().includes(q) ||
        String(h.address || '').toLowerCase().includes(q) ||
        String(h.city || '').toLowerCase().includes(q)
      );
    }

    // 2. Procedure Filter
    if (filters.procedure && filters.procedure !== "all") {
      const proc = filters.procedure.toLowerCase();
      list = list.filter((h) =>
        (h.procedures || []).some((p) => String(p).toLowerCase().includes(proc))
      );
    }

    // 3. Specialization Filter
    if (filters.specialization && filters.specialization !== "all") {
      const spec = filters.specialization.toLowerCase();
      list = list.filter((h) =>
        (h.specialties || []).some((s) => String(s).toLowerCase().includes(spec))
      );
    }

    // 4. Radius Filter (distance in km)
    if (typeof filters.radiusKm === "number" && filters.radiusKm > 0) {
      list = list.filter((h) => typeof h.distanceKm !== "number" || h.distanceKm <= filters.radiusKm);
    }

    // 5. Hospital Tier Filter (Premium, Mid-tier, Budget)
    if (filters.tiers && filters.tiers.length > 0) {
      const normTiers = filters.tiers.map((t) => {
        const s = t.toLowerCase();
        return s === "mid-tier" || s === "mid tier" ? "mid" : s;
      });
      list = list.filter((h) => {
        const hTier = String(h.tier || '').toLowerCase();
        const normHTier = hTier === "mid-tier" || hTier === "mid tier" ? "mid" : hTier;
        return normTiers.includes(normHTier);
      });
    }

    // 6. NABH Accredited Only Filter
    if (filters.nabhOnly) {
      list = list.filter((h) => h.nabh === true);
    }

    // 7. Emergency Care Filter
    if (filters.emergencyCare === "available") {
      list = list.filter((h) => h.emergencyCare === true || (h.specialties || []).some(s => s.toLowerCase().includes('emergency') || s.toLowerCase().includes('critical')));
    } else if (filters.emergencyCare === "unavailable") {
      list = list.filter((h) => !h.emergencyCare);
    }

    // 8. Open Status Filter
    if (filters.status === "open") {
      list = list.filter((h) => !h.status || h.status === "open");
    } else if (filters.status === "closed") {
      list = list.filter((h) => h.status === "closed");
    }

    // 9. Minimum Rating Filter
    if (typeof filters.minRating === "number" && filters.minRating > 0) {
      list = list.filter((h) => (h.rating || 0) >= filters.minRating);
    }

    // 10. Cost Range & Max Budget Filter
    if (typeof filters.minCost === "number" && filters.minCost > 0) {
      list = list.filter((h) => (h.costMin || 0) >= filters.minCost);
    }
    if (typeof filters.maxBudget === "number" && filters.maxBudget !== null) {
      list = list.filter((h) => (h.costMin || 0) <= filters.maxBudget!);
    }

    // 11. Sorting
    const sorted = [...list];
    if (filters.sortBy === "cost") {
      sorted.sort((a, b) => (a.costMin || 0) - (b.costMin || 0));
    } else if (filters.sortBy === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: distance
      sorted.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return sorted;
  }, [result.hospitals, filters]);

  const verifiedHospitals = useMemo(() => 
    filteredHospitals.filter(h => {
      const src = (h.source || 'Verified Registry').toLowerCase();
      return src.includes('verified') || src.includes('registry');
    }), [filteredHospitals]
  );

  const googleHospitals = useMemo(() => 
    filteredHospitals.filter(h => (h.source || '').toLowerCase().includes('google')),
    [filteredHospitals]
  );

  const osmHospitals = useMemo(() => 
    filteredHospitals.filter(h => {
      const src = (h.source || '').toLowerCase();
      return src.includes('openstreet') || src.includes('osm');
    }), [filteredHospitals]
  );

  const displayedHospitals = useMemo(() => {
    if (sourceFilter === 'Verified Registry') return verifiedHospitals;
    if (sourceFilter === 'Google Places') return googleHospitals;
    if (sourceFilter === 'OpenStreetMap') return osmHospitals;
    return filteredHospitals;
  }, [filteredHospitals, sourceFilter, verifiedHospitals, googleHospitals, osmHospitals]);

  const openDetails = (h: EnrichedHospital) => {
    setSelected(h);
    setOpen(true);
  };
  const toggleComparison = (hospital: EnrichedHospital) => {
    setComparison((current) => current.some((h) => h.id === hospital.id)
      ? current.filter((h) => h.id !== hospital.id)
      : current.length < 3 ? [...current, hospital] : current);
  };
  const toggleNarration = () => {
    if (!('speechSynthesis' in window)) return;
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    const condition = result.condition.condition || 'your reported symptoms';
    const confText = typeof result.condition.confidence === 'number'
      ? `Confidence is ${result.condition.confidence} percent.`
      : 'Confidence score is unavailable due to clinical safe deferral.';
    const message = `MediPath AI found ${condition}. Suggested specialization: ${result.condition.specialty}. ${confText} ${result.hospitals.length} hospitals were found near ${locationLabel}. This is guidance, not a diagnosis.`;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);
    window.speechSynthesis.speak(utterance);
    setIsNarrating(true);
  };
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
  <div className="space-y-8">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-soft"
    >
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-secondary border-primary/20 text-primary gap-1.5">
              <Stethoscope className="w-3 h-3" />
              {t("possible_cause", language)}
            </Badge>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 font-mono">
              ICD-10 · {result.condition.icd10}
            </Badge>
            {result.condition.decisionSource && (
              <Badge variant="outline" className="border-teal/30 bg-teal/10 text-teal text-xs font-mono">
                {localizeDecisionSource(result.condition.decisionSource, language)}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {localizeConditionName(result.condition.condition, language) || t("clinical_assessment", language)}
            </h2>
          {/* Active Data Source Badge */}
            {result.dataSource && (
              (() => {
                const src = result.dataSource.toLowerCase();
                // Combined: any live source + registry
                if ((src.includes('google places') || src.includes('openstreetmap')) && (src.includes('verified') || src.includes('registry'))) {
                  return (
                    <Badge 
                      variant="outline" 
                      className="border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 gap-1.5 py-1 px-3 text-xs font-semibold shadow-xs"
                      title="Combined live map results with verified hospital registry (hospitals.json)"
                    >
                      <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                      {result.dataSource}
                    </Badge>
                  );
                }
                if (src.includes('google places')) {
                  return (
                    <Badge 
                      variant="outline" 
                      className="border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 gap-1.5 py-1 px-3 text-xs font-semibold shadow-xs"
                      title="Results fetched live from Google Places Maps API"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                      Google Places
                    </Badge>
                  );
                }
                if (src.includes('openstreetmap')) {
                  return (
                    <Badge 
                      variant="outline" 
                      className="border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300 gap-1.5 py-1 px-3 text-xs font-semibold shadow-xs"
                      title="Results fetched live from OpenStreetMap (free open-source map)"
                    >
                      <Globe className="w-3.5 h-3.5 text-orange-500" />
                      OpenStreetMap
                    </Badge>
                  );
                }
                return (
                  <Badge 
                    variant="outline" 
                    className="border-teal/40 bg-teal/10 text-teal gap-1.5 py-1 px-3 text-xs font-semibold shadow-xs"
                    title="Results loaded from curated hospitals.json dataset (924 verified Indian hospitals)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                    Verified Registry (Offline Ready)
                  </Badge>
                );
              })()
            )}
          </div>

          {/* Pre-Cached Verified Registry / Offline notice */}
          {(!navigator.onLine || result.dataSource === 'Verified Registry') && (
            <div className="flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs text-teal-800 dark:text-teal-300">
              <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
              <span>
                <strong>Verified Registry Active:</strong> Displaying verified emergency & NABH hospitals from local storage. (Live Google Places & OpenStreetMap require internet connection).
              </span>
            </div>
          )}

          {/* Google Places usage counter */}
          {result.googlePlacesUsage && (
            result.googlePlacesUsage.quotaHit ? (
              <div className="flex items-center gap-2 rounded-lg border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-700 dark:text-orange-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>{t("limit_hit", language)}</strong> — {t("google_places_limit_hit_banner", language, { calls: result.googlePlacesUsage.calls, max: result.googlePlacesUsage.maxDailyLimit || 100 })}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500/5 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {t("google_places_tracker_active", language, {
                    calls: result.googlePlacesUsage.calls,
                    max: result.googlePlacesUsage.maxDailyLimit || 100,
                    remaining: result.googlePlacesUsage.remaining ?? (100 - result.googlePlacesUsage.calls),
                  })}
                </span>
              </div>
            )
          )}

          {/* Medical Non-Diagnostic Disclaimer Banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                {t("preliminary_assessment_title", language)}
              </p>
              <p className="mt-0.5 leading-relaxed">
                {t("preliminary_assessment_desc", language)}
              </p>
              {result.condition.safeDeferReason && (
                <p className="mt-1 font-medium text-amber-950 dark:text-amber-50">
                  {t("referral_note", language)} {result.condition.safeDeferReason}
                </p>
              )}
            </div>
          </div>

          {result.condition.lowConfidence && !result.condition.condition && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-warning" />
              <span>{t("model_uncertain_warning", language)}</span>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-teal/30 bg-teal/5 p-3 flex items-start gap-2.5">
              <Stethoscope className="w-4 h-4 mt-0.5 shrink-0 text-teal" />
              <div>
                <span className="text-[11px] font-semibold text-teal block uppercase tracking-wider">{t("target_specialization", language)}</span>
                <span className="text-sm font-bold text-foreground">{localizeSpecialty(result.condition.specialty, language) || t("specialist_care", language)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-2.5">
              <Activity className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <div>
                <span className="text-[11px] font-semibold text-primary block uppercase tracking-wider">{t("matched_procedure", language)}</span>
                <span className="text-sm font-bold text-foreground">{result.condition.procedure || t("comprehensive_clinical_assessment", language)}</span>
              </div>
            </div>
          </div>

          {/* AI Clinical Recommendation & Pathway Card at the Top */}
          <div className="rounded-xl border border-border/80 bg-secondary/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{t("clinical_pathway", language)}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                {t("model_2_guidance", language)}
              </Badge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {localizeAiRecommendation(result.aiRecommendation?.summary, result.condition.condition, result.condition.specialty, result.condition.procedure, result.condition.confidence, language)}
            </p>
            {result.aiRecommendation?.reasons && result.aiRecommendation.reasons.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 pt-1">
                {result.aiRecommendation.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-4 md:w-72 w-full">
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {result.condition.decisionSource === "direct_routing"
                  ? (language === "hi" ? "चयनित स्थिति" : language === "gu" ? "પસંદ કરેલ સ્થિતિ" : "Direct Routing Selection")
                  : t("model_confidence", language)}
              </span>
              <Badge variant="outline" className={`text-xs font-bold ${
                result.condition.confidence !== null && result.condition.confidence !== undefined
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}>
                {result.condition.decisionSource === "direct_routing"
                  ? (language === "hi" ? "100% प्रत्यक्ष चयन" : language === "gu" ? "100% સીધું રૂટિંગ" : "100% Direct Selection")
                  : result.condition.confidence !== null && result.condition.confidence !== undefined
                  ? `${result.condition.confidence}%`
                  : t("score_unavailable", language)}
              </Badge>
            </div>
            <ConfidenceMeter 
              value={result.condition.confidence} 
              isSafeDefer={Boolean(result.condition.safeDeferReason || result.condition.confidence === null)}
              language={language}
            />
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onReconsultDoctor) {
                  onReconsultDoctor();
                } else {
                  setTriageOpen(true);
                }
              }}
              className="gap-2 bg-primary/5 hover:bg-primary/10 border-primary/30 text-primary font-medium shadow-xs h-10 w-full cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              {t("reconsult_doctor", language)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNarration}
              disabled={!('speechSynthesis' in window)}
              className="gap-2 h-10 w-full cursor-pointer"
              aria-label={isNarrating ? t("stop_narration", language) : t("listen_assessment", language)}
            >
              {isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isNarrating ? t("stop_narration", language) : t("listen_assessment", language)}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>

    {/* ── Prominent Live Data Sources & Google Places Quota Status Bar ── */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-bold text-foreground">{t("recommendation_sequence", language)}</span>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
            1. Verified Registry → 2. Google Places → 3. OpenStreetMap
          </span>
        </div>

        {/* Live Google Places API Quota Counter & Badge */}
        {result.googlePlacesUsage ? (
          result.googlePlacesUsage.quotaHit ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-800 dark:text-orange-200 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
              <span>
                <strong>{t("limit_hit", language)}</strong> ({result.googlePlacesUsage.calls}/{result.googlePlacesUsage.maxDailyLimit || 100}) — {t("google_places_limit_hit_banner", language, { calls: result.googlePlacesUsage.calls, max: result.googlePlacesUsage.maxDailyLimit || 100 })}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200 text-xs font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <BarChart2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                {t("google_places_tracker_active", language, {
                  calls: result.googlePlacesUsage.calls,
                  max: result.googlePlacesUsage.maxDailyLimit || 100,
                  remaining: result.googlePlacesUsage.remaining ?? (100 - result.googlePlacesUsage.calls),
                })}
              </span>
            </div>
          )
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-muted-foreground text-xs font-medium">
            <BarChart2 className="w-3.5 h-3.5 shrink-0" />
            <span>Google Places ({t("model_active", language)})</span>
          </div>
        )}
      </div>

      {/* Source Breakdown Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-xs">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span><strong>#1 Verified Registry:</strong> {verifiedHospitals.length} hospitals</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-500/25 font-medium">
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span><strong>#2 Google Places:</strong> {result.googlePlacesUsage?.quotaHit ? 'Limit Hit (Omitted)' : `${googleHospitals.length} live hospitals`}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 font-medium">
          <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span><strong>#3 OpenStreetMap:</strong> {osmHospitals.length} community hospitals</span>
        </span>
      </div>
    </motion.div>

    {/* Regional Tertiary Referral Banner */}
    {result.referralNotice && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border border-teal/30 bg-teal/5 flex items-start gap-3 text-sm text-foreground shadow-xs"
      >
        <Navigation className="w-5 h-5 mt-0.5 shrink-0 text-teal" />
        <div>
          <p className="font-semibold text-teal flex items-center gap-1.5">
            {t("regional_referral_title", language)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {result.referralNotice}
          </p>
        </div>
      </motion.div>
    )}

    {/* General Care Fallback Banner when no specialist facilities match */}
    {!result.hospitals.some((h) => h.matchCategory === "verified_specialist") && result.hospitals.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3 text-sm text-foreground shadow-xs"
      >
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
            {t("general_care_facility_title", language)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {language === "hi"
              ? `इस खोज दायरे में मान्यता प्राप्त ${localizeSpecialty(result.condition.specialty, language) || "विशेषज्ञ"} विभाग वाला कोई नजदीकी अस्पताल नहीं मिला। प्राथमिक मूल्यांकन और रेफरल के लिए सामान्य देखभाल अस्पताल नीचे दिखाए गए हैं।`
              : language === "gu"
              ? `આ શોધ ત્રિજ્યામાં માન્યતા પ્રાપ્ત ${localizeSpecialty(result.condition.specialty, language) || "નિષ્ણાત"} વિભાગવાળી કોઈ નજીકની હોસ્પિટલ મળી નથી. પ્રાથમિક મૂલ્યાંકન અને રેફરલ માટે સામાન્ય સંભાળ હોસ્પિટલો નીચે દર્શાવેલ છે.`
              : `No nearby facilities with an accredited ${result.condition.specialty || "specialist"} department were identified within this search radius. General-care referral hospitals are presented below for preliminary evaluation, stabilization, and formal specialist referral.`}
          </p>
        </div>
      </motion.div>
    )}

    {/* ── Unified Joined Container: Filters & Scrollable Hospital Recommendations ── */}
    <div className="bg-card border border-border rounded-2xl md:rounded-3xl shadow-soft overflow-hidden backdrop-blur-xs">
      {/* Mobile Filters Header Bar */}
      <div className="lg:hidden p-3.5 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>{t("filter_hospitals", language)} ({result.hospitals.length})</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          className="text-xs h-8 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          {mobileFiltersOpen ? (
            <>
              <span>{language === "hi" ? "फ़िल्टर छिपाएं" : language === "gu" ? "ફિલ્ટર્સ છુપાવો" : "Hide Filters"}</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>{language === "hi" ? "फ़िल्टर दिखाएं" : language === "gu" ? "ફિલ્ટર્સ બતાવો" : "Show Filters"}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[290px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Joined Filter Container (Sidebar on desktop, collapsible on mobile) */}
        <aside
          className={`p-4 sm:p-5 lg:h-[780px] lg:overflow-y-auto custom-scrollbar bg-muted/15 ${
            mobileFiltersOpen ? "block" : "hidden lg:block"
          }`}
        >
          <FilterPanel
            filters={filters}
            onChange={onFiltersChange}
            resultCount={filteredHospitals.length}
            hospitals={result.hospitals}
            language={language}
            className="bg-transparent border-0 p-0 shadow-none static space-y-4"
          />
        </aside>

        {/* Joined Recommendations Explorer & Scrollable Hospital List */}
        <div className="flex flex-col lg:h-[780px] overflow-hidden">
          {/* Sticky/Pinned Top Bar for count, sorting, compare, and source filters */}
          <div className="p-4 sm:p-5 border-b border-border/60 bg-card/70 shrink-0 space-y-3.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-baseline justify-between flex-wrap gap-2"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t("hospitals_near_location", language, { count: displayedHospitals.length, location: locationLabel })}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {t("within_radius_sorted", language, { radius: filters.radiusKm, sort: filters.sortBy })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={comparison.length < 2}
                onClick={() => setComparisonOpen(true)}
                className="gap-2 cursor-pointer shadow-xs hover:border-primary/40"
              >
                <GitCompareArrows className="w-4 h-4 text-primary" /> {t("compare", language)} {comparison.length}/3
              </Button>
            </motion.div>

            {/* ── Source Filter Tabs (All / Verified Registry / Google Places / OpenStreetMap) ── */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSourceFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  sourceFilter === 'all'
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                {t("all_sources", language)} ({filteredHospitals.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('Verified Registry')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                  sourceFilter === 'Verified Registry'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-card text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                #1 {t("verified_registry", language)} ({verifiedHospitals.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('Google Places')}
                disabled={result.googlePlacesUsage?.quotaHit || googleHospitals.length === 0}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                  result.googlePlacesUsage?.quotaHit || googleHospitals.length === 0
                    ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border'
                    : sourceFilter === 'Google Places'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-card text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                #2 {t("google_places", language)} ({result.googlePlacesUsage?.quotaHit ? t("limit_hit", language) : googleHospitals.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('OpenStreetMap')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                  sourceFilter === 'OpenStreetMap'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-card text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                #3 {t("openstreetmap", language)} ({osmHospitals.length})
              </button>
            </div>
          </div>

          {/* ── SEPARATE SCROLLABLE CONTAINER FOR THE HOSPITAL LIST ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar bg-background/20 max-h-[620px] lg:max-h-none">
            {displayedHospitals.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center my-6">
                <Frown className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">{t("no_hospitals_found", language)}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("try_adjusting_filters", language)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange(defaultFilters)}
                  className="mt-4 gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("reset_all_filters", language)}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5 pb-2">
                {displayedHospitals.map((h, i) => (
                  <HospitalCard
                    key={h.id}
                    hospital={h}
                    index={i}
                    onViewDetails={openDetails}
                    onToggleCompare={toggleComparison}
                    isCompared={comparison.some((item) => item.id === h.id)}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sleek bottom status bar inside the container */}
          <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20 shrink-0 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {language === "hi"
                ? `कुल ${displayedHospitals.length} अस्पताल दिखाए जा रहे हैं`
                : language === "gu"
                ? `કુલ ${displayedHospitals.length} હોસ્પિટલો દર્શાવેલ છે`
                : `Showing ${displayedHospitals.length} recommended facilities`}
            </span>
            <span className="hidden sm:inline">
              {language === "hi"
                ? "स्क्रोल करें सभी अस्पताल देखने के लिए"
                : language === "gu"
                ? "બધી હોસ્પિટલો જોવા માટે સ્ક્રોલ કરો"
                : "Scroll inside container to explore all facilities"}
            </span>
          </div>
        </div>
      </div>
    </div>

    <CostBreakdown
      result={result}
      language={language}
      selectedHospitalId={selected?.id}
      onSelectHospital={(id) => {
        const found = result.hospitals.find((h) => h.id === id);
        if (found) setSelected(found);
      }}
    />
    <Disclaimer language={language} />
    <HospitalDetailsDialog hospital={selected} open={open} onOpenChange={setOpen} language={language} />
    <HospitalComparisonDialog hospitals={comparison} open={comparisonOpen} onOpenChange={setComparisonOpen} language={language} />
    <DoctorTriageModal
      open={triageOpen}
      onOpenChange={setTriageOpen}
      initialSymptoms={result.query}
      conditionName={result.condition.condition}
      specialty={result.condition.specialty}
      language={language}
    />
  </div>
  );
};