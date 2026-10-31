import { useMemo } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnrichedHospital, SearchFilters, Tier, defaultFilters, formatINR } from "@/services/hospitalService";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ALL_TIERS: Tier[] = ["Premium", "Mid-tier", "Budget"];

const BASE_PROCEDURES = [
  "Angioplasty",
  "Appendectomy",
  "Cardiac Bypass",
  "Cataract Surgery",
  "Chemotherapy",
  "CT Scan",
  "Dialysis",
  "Endoscopy",
  "Hernia Repair",
  "Hip Replacement",
  "Knee Replacement",
  "MRI Scan",
  "Normal Delivery / C-Section",
  "Spine Surgery",
  "Ultrasound",
];

const BASE_SPECIALIZATIONS = [
  "Cardiology",
  "Critical Care",
  "Dermatology",
  "ENT",
  "Gastroenterology",
  "General Medicine",
  "General Surgery",
  "Neurology",
  "Nephrology",
  "OB/GYN",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Pulmonology",
  "Urology",
];

type Props = {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  resultCount: number;
  hospitals: EnrichedHospital[];
  language?: string;
  className?: string;
};

export const FilterPanel = ({ filters, onChange, resultCount, hospitals, language = "en", className }: Props) => {
  const update = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) =>
    onChange({ ...filters, [k]: v });

  const toggleTier = (t: Tier) => {
    const has = filters.tiers.includes(t);
    update("tiers", has ? filters.tiers.filter((x) => x !== t) : [...filters.tiers, t]);
  };

  const procedures = useMemo(() => {
    const list = [...BASE_PROCEDURES, ...hospitals.flatMap((h) => h.procedures || [])];
    return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [hospitals]);

  const specializations = useMemo(() => {
    const list = [...BASE_SPECIALIZATIONS, ...hospitals.flatMap((h) => h.specialties || [])];
    return [...new Set(list.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [hospitals]);


  return (
    <aside className={cn("bg-card border border-border rounded-2xl p-5 shadow-soft space-y-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">{t("filter_hospitals", language)}</h3>
        </div>
        <button
          onClick={() => onChange(defaultFilters)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> {t("reset", language)}
        </button>
      </div>

      <div className="text-xs text-muted-foreground">
        <span className="font-semibold text-primary">{resultCount}</span> {t("hospitals_match", language, { n: "" }).trim() || t("hospitals_found_count", language, { n: resultCount })}
      </div>

      <Input
        value={filters.hospitalName}
        onChange={(e) => update("hospitalName", e.target.value)}
        placeholder={t("search_hospital_placeholder", language)}
        aria-label={t("search_hospital_placeholder", language)}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("procedure", language)}</p>
        <Select value={filters.procedure} onValueChange={(v) => update("procedure", v)}>
          <SelectTrigger className="h-9"><SelectValue placeholder={t("all_procedures", language)} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_procedures", language)}</SelectItem>
            {procedures.map((procedure) => <SelectItem key={procedure} value={procedure}>{procedure}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("specialization", language)}</p>
        <Select value={filters.specialization} onValueChange={(v) => update("specialization", v)}>
          <SelectTrigger className="h-9"><SelectValue placeholder={t("all_specializations", language)} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_specializations", language)}</SelectItem>
            {specializations.map((specialization) => <SelectItem key={specialization} value={specialization}>{specialization}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Radius */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">{t("radius", language)}</span>
          <span className="text-primary font-semibold">{filters.radiusKm} km</span>
        </div>
        <Slider
          value={[filters.radiusKm]}
          min={5}
          max={100}
          step={5}
          onValueChange={(v) => update("radiusKm", v[0])}
        />
      </div>

      {/* Tier */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("hospital_tier", language)}</p>
        <div className="space-y-1.5">
          {ALL_TIERS.map((tier) => {
            const tierLabelKey = tier === "Budget" ? "tier_budget" : tier === "Mid-tier" ? "tier_mid" : "tier_premium";
            return (
              <label key={tier} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                <Checkbox
                  checked={filters.tiers.includes(tier)}
                  onCheckedChange={() => toggleTier(tier)}
                />
                {t(tierLabelKey, language)}
              </label>
            );
          })}
        </div>
      </div>

      {/* NABH */}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
        <Checkbox
          checked={filters.nabhOnly}
          onCheckedChange={(c) => update("nabhOnly", Boolean(c))}
        />
        {t("nabh_accredited_only", language)}
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("emergency_services_only", language)}</p>
        <Select value={filters.emergencyCare} onValueChange={(v) => update("emergencyCare", v as SearchFilters["emergencyCare"]) }>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("any_status", language)}</SelectItem>
            <SelectItem value="available">{t("open", language)}</SelectItem>
            <SelectItem value="unavailable">{t("closed", language)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("open_status", language)}</p>
        <Select value={filters.status} onValueChange={(v) => update("status", v as SearchFilters["status"]) }>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("any_status", language)}</SelectItem>
            <SelectItem value="open">{t("open", language)}</SelectItem>
            <SelectItem value="closed">{t("closed", language)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Min rating */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">{t("min_rating", language)}</span>
          <span className="text-primary font-semibold">{filters.minRating.toFixed(1)}★</span>
        </div>
        <Slider
          value={[filters.minRating]}
          min={0}
          max={5}
          step={0.5}
          onValueChange={(v) => update("minRating", v[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">{t("cost_range", language)}</span>
          <span className="text-primary font-semibold">{formatINR(filters.minCost)} – {filters.maxBudget == null ? t("no_limit", language) : formatINR(filters.maxBudget)}</span>
        </div>
        <Slider
          value={[filters.minCost, filters.maxBudget ?? 600000]}
          min={0}
          max={600000}
          step={5000}
          onValueChange={([min, max]) => onChange({ ...filters, minCost: min, maxBudget: max >= 600000 ? null : max })}
        />
      </div>

      {/* Max budget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">{t("max_budget", language)}</span>
          <span className="text-primary font-semibold">
            {filters.maxBudget == null ? t("no_limit", language) : formatINR(filters.maxBudget)}
          </span>
        </div>
        <Slider
          value={[filters.maxBudget ?? 600000]}
          min={5000}
          max={600000}
          step={5000}
          onValueChange={(v) => update("maxBudget", v[0] >= 600000 ? null : v[0])}
        />
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("sort_by", language)}</p>
        <Select value={filters.sortBy} onValueChange={(v) => update("sortBy", v as SearchFilters["sortBy"])}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">{t("sort_distance", language)}</SelectItem>
            <SelectItem value="cost">{t("sort_cost", language)}</SelectItem>
            <SelectItem value="rating">{t("sort_rating", language)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm" className="w-full cursor-pointer" onClick={() => onChange(defaultFilters)}>
        {t("reset_all_filters", language)}
      </Button>
    </aside>
  );
};