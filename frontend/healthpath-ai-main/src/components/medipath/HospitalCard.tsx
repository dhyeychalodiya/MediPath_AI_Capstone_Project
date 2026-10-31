import { motion } from "framer-motion";
import { MapPin, Star, ShieldCheck, ArrowRight, Sparkles, GitCompareArrows, Globe, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnrichedHospital, Tier, formatINR } from "@/services/hospitalService";
import { t, localizeMatchReason } from "@/lib/i18n";

const tierStyles: Record<Tier, string> = {
  Premium: "bg-primary/10 text-primary border-primary/20",
  "Mid-tier": "bg-teal/10 text-teal border-teal/20",
  Budget: "bg-success/10 text-[hsl(var(--success))] border-success/20",
};

/** Returns a styled source badge for each hospital card showing explicit source sequence priority */
function SourceBadge({ source, language = "en" }: { source?: string; language?: string }) {
  const src = (source || "Verified Registry").toLowerCase();
  if (src.includes("google places")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[11px] font-medium px-2 py-0.5 shadow-xs"
        title="Fetched live from Google Places API (#2 Priority)"
      >
        <Globe className="w-3 h-3 text-blue-500" />
        <span className="font-bold opacity-75">#2</span> {t("google_places", language)}
      </Badge>
    );
  }
  if (src.includes("openstreetmap")) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 shadow-xs"
        title="Fetched live from OpenStreetMap community database (#3 Priority)"
      >
        <Globe className="w-3 h-3 text-amber-500" />
        <span className="font-bold opacity-75">#3</span> {t("openstreetmap", language)}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium px-2 py-0.5 shadow-xs"
      title="Accredited record from Verified Indian Hospitals Registry (#1 Priority)"
    >
      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      <span className="font-bold opacity-75">#1</span> {t("verified_registry", language)}
    </Badge>
  );
}

type Props = {
  hospital: EnrichedHospital;
  index: number;
  onViewDetails?: (h: EnrichedHospital) => void;
  onToggleCompare?: (h: EnrichedHospital) => void;
  isCompared?: boolean;
  language?: string;
};

export const HospitalCard = ({ hospital, index, onViewDetails, onToggleCompare, isCompared, language = "en" }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: Math.min(0.05 * index, 0.5) }}
    whileHover={{ y: -4 }}
    className="group relative bg-card border border-border rounded-2xl p-5 md:p-6 shadow-soft hover:shadow-medium transition-all duration-300 flex min-h-[400px] flex-col"
  >
    <div className="mb-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg text-foreground leading-tight break-words">{hospital.name}</h3>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground mt-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{hospital.city}</span>
            <span aria-hidden>•</span>
            <span>{hospital.distanceKm} km</span>
          </div>
        </div>
        <Badge variant="outline" className={`${tierStyles[hospital.tier] || tierStyles["Mid-tier"]} shrink-0`}>
          {t(hospital.tier === "Budget" ? "tier_budget" : hospital.tier === "Mid-tier" ? "tier_mid" : "tier_premium", language)}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleCompare?.(hospital)}
          aria-pressed={isCompared}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors cursor-pointer ${isCompared ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"}`}
        >
          <GitCompareArrows className="w-3.5 h-3.5" /> {isCompared ? t("compared", language) : t("compare", language)}
        </button>
        <Badge variant="outline" className={hospital.nabh ? "gap-1 border-teal/30 bg-teal/10 text-teal" : "gap-1 border-border bg-muted text-muted-foreground"}>
          <ShieldCheck className="w-3.5 h-3.5" />
          NABH: {hospital.nabh ? t("nabh_badge", language) : t("not_accredited", language)}
        </Badge>
        {/* Per-hospital data source badge */}
        <SourceBadge source={hospital.source} language={language} />
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
      {hospital.matchCategory === "verified_specialist" ? (
        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold gap-1 py-0.5 px-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {t("verified_specialist_match", language)}
        </Badge>
      ) : (
        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium gap-1 py-0.5 px-2.5">
          {t("general_care_fallback", language)}
        </Badge>
      )}

      {(hospital.isBestMatch || index === 0) && (
        <Badge className="bg-primary text-primary-foreground text-[11px] gap-1 py-0.5 px-2.5">
          <Sparkles className="w-3.5 h-3.5" /> {t("best_match", language)}
        </Badge>
      )}

      {hospital.emergencyCare && (
        <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] font-semibold py-0.5 px-2">
          {t("emergency_24x7", language)}
        </Badge>
      )}
    </div>

    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary">
        <Star className="w-3.5 h-3.5 fill-warning text-warning" />
        <span className="text-sm font-medium text-foreground">{Number(hospital.rating) || 3.8}</span>
        <span className="text-xs text-muted-foreground">/5</span>
      </div>
      <span className="text-xs text-muted-foreground">{(Number(hospital.reviews) || 50).toLocaleString()} {t("reviews_label", language)}</span>
    </div>

    <div className="mb-4 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
      <p className="text-xs font-semibold text-primary">{t("recommendation_basis", language)}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        {localizeMatchReason(hospital.matchReason, hospital.matchCategory, language)}
      </p>
    </div>

    <div className="mt-auto space-y-3 pt-2">
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-soft border border-border/60">
        <div className="flex items-center justify-between mb-0.5">
          <p className="text-xs text-muted-foreground">{t("estimated_cost", language)}</p>
          <span className="text-[11px] font-medium text-primary">
            {hospital.tier} {hospital.nabh ? "• NABH" : ""}
          </span>
        </div>
        <p className="font-bold text-lg text-foreground">
          {formatINR(hospital.costMin)} – {formatINR(hospital.costMax)}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
          {hospital.baseCostMin
            ? `Base ${formatINR(hospital.baseCostMin)} × ${(hospital.tierMult || (hospital.tier === 'Premium' ? 1.75 : hospital.tier === 'Budget' ? 0.6 : 1.0)).toFixed(2)}× ${hospital.nabh ? "× 1.05" : ""}`
            : `${hospital.tier} tier tariff`}
        </p>
      </div>
      <Button
        variant="outline"
        onClick={() => onViewDetails?.(hospital)}
        className="w-full h-10 px-4 justify-between group-hover:border-primary group-hover:text-primary cursor-pointer font-medium"
      >
        {t("view_details", language)}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  </motion.div>
);