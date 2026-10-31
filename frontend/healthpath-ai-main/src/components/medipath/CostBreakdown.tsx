import { useState } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  CheckCircle2,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  Building2,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SearchOutput, EnrichedHospital, Tier, formatINR } from "@/services/hospitalService";
import { t } from "@/lib/i18n";

type Props = {
  result: SearchOutput;
  language?: string;
  selectedHospitalId?: string;
  onSelectHospital?: (id: string) => void;
};

export const CostBreakdown = ({ result, language = "en", selectedHospitalId, onSelectHospital }: Props) => {
  const hospitals = result?.hospitals || [];
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    selectedHospitalId || hospitals[0]?.id || ""
  );

  const activeId = selectedHospitalId || internalSelectedId || hospitals[0]?.id;
  const activeHospital: EnrichedHospital | undefined = hospitals.find((h) => h.id === activeId) || hospitals[0];

  const handleSelectHospital = (id: string) => {
    setInternalSelectedId(id);
    onSelectHospital?.(id);
  };

  // Base clinical profile from condition
  const conditionBase = result?.condition?.base || {
    min: 500,
    max: 800,
    stayDays: 0,
    perDay: 0,
    diagnostics: 500,
    medicines: 600,
    contingencyPct: 5,
  };

  // 4 items on medical bill (Step 1):
  // 1. Doctor / Procedure Fee
  // 2. Lab & Tests
  // 3. Medicines & Consumables
  // 4. Room Rent = stayDays * perDayBase
  const doctorFeeMin = Number(activeHospital?.doctorFeeMin ?? conditionBase.min ?? 500);
  const doctorFeeMax = Number(activeHospital?.doctorFeeMax ?? conditionBase.max ?? doctorFeeMin);
  const diagnostics = Number(activeHospital?.diagnostics ?? conditionBase.diagnostics ?? 0);
  const medicines = Number(activeHospital?.medicines ?? conditionBase.medicines ?? 0);
  const stayDays = Number(activeHospital?.stayDays ?? conditionBase.stayDays ?? 0);
  const perDayBase = Number(conditionBase.perDay || 0);
  const roomRentBase = stayDays * perDayBase;

  // Step 1: Base Medical Cost
  const baseCostMin = Number(activeHospital?.baseCostMin ?? (doctorFeeMin + diagnostics + medicines + roomRentBase));
  const baseCostMax = Number(activeHospital?.baseCostMax ?? (doctorFeeMax + diagnostics + medicines + roomRentBase));

  // Step 2: Hospital Tier Multiplier
  const tier: Tier = activeHospital?.tier || "Mid-tier";
  const tierMult = Number(
    activeHospital?.tierMult ?? (tier === "Premium" ? 1.75 : tier === "Budget" ? 0.6 : 1.0)
  );

  // Step 3: Accreditation Factor (NABH)
  const isNabh = Boolean(activeHospital?.nabh);
  const nabhMult = Number(activeHospital?.nabhMult ?? (isNabh ? 1.05 : 1.0));

  // Combined Multiplier & Final Total Cost
  const totalMult = Number(activeHospital?.totalMult ?? Number((tierMult * nabhMult).toFixed(4)));
  const finalCostMin = activeHospital ? activeHospital.costMin : Math.round(baseCostMin * totalMult);
  const finalCostMax = activeHospital ? activeHospital.costMax : Math.round(baseCostMax * totalMult);

  // 3-Tier comparison values for the same condition
  const budgetMin = Math.round(baseCostMin * 0.6);
  const budgetMax = Math.round(baseCostMax * 0.6);
  const midMin = Math.round(baseCostMin * 1.0);
  const midMax = Math.round(baseCostMax * 1.0);
  const corporateNabhMin = Math.round(baseCostMin * 1.8375);
  const corporateNabhMax = Math.round(baseCostMax * 1.8375);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      <Accordion
        type="single"
        collapsible
        defaultValue="cost"
        className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden"
      >
        <AccordionItem value="cost" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Receipt className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{t("cost_breakdown_title", language)}</h3>
                  <Badge variant="outline" className="text-[10px] py-0 px-2 border-primary/30 text-primary">
                    Real Tariff Model
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("formula_explainer", language)}
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6">
            {/* Hospital quick-switcher tabs if multiple hospitals are available */}
            {hospitals.length > 0 && (
              <div className="mb-5 p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    {t("select_hospital_view_bill", language)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {hospitals.length} facilities available
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {hospitals.slice(0, 6).map((h) => {
                    const isSelected = h.id === activeHospital?.id;
                    const tierLabel = h.tier === "Budget" ? "0.60×" : h.tier === "Premium" ? "1.75×" : "1.00×";
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleSelectHospital(h.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-foreground hover:bg-secondary/80 border-border"
                        }`}
                      >
                        <span className="truncate max-w-[140px]">{h.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {h.tier} {tierLabel}
                        </span>
                        {h.nabh && (
                          <span
                            className={`text-[9px] px-1 rounded ${
                              isSelected ? "bg-primary-foreground/25" : "bg-teal/15 text-teal"
                            }`}
                          >
                            NABH
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Hospital Bill Card */}
            {activeHospital && (
              <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-base">{activeHospital.name}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        activeHospital.tier === "Premium"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : activeHospital.tier === "Budget"
                          ? "border-success/40 bg-success/10 text-[hsl(var(--success))]"
                          : "border-teal/40 bg-teal/10 text-teal"
                      }`}
                    >
                      {activeHospital.tier} ({tierMult}×)
                    </Badge>
                    {activeHospital.nabh && (
                      <Badge variant="outline" className="text-xs border-teal/40 bg-teal/10 text-teal flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> NABH (+5%)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeHospital.city}, {activeHospital.state} • {activeHospital.distanceKm} km away
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                    {t("final_treatment_bill", language)}
                  </p>
                  <p className="text-xl font-extrabold text-foreground">
                    {formatINR(finalCostMin)} – {formatINR(finalCostMax)}
                  </p>
                </div>
              </div>
            )}

            {/* Formula Step-by-Step Breakdown */}
            <div className="grid md:grid-cols-3 gap-3 mb-5">
              {/* Step 1: Base Medical Cost */}
              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" /> {t("step1_base_cost", language)}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {formatINR(baseCostMin)}
                  </span>
                </div>
                <div className="text-xs space-y-1.5 text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-primary/70" /> {t("doctor_procedure_fee", language)}:
                    </span>
                    <span className="font-medium text-foreground">{formatINR(doctorFeeMin)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-teal/70" /> {t("lab_and_tests", language)}:
                    </span>
                    <span className="font-medium text-foreground">{formatINR(diagnostics)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Pill className="w-3 h-3 text-warning/70" /> {t("medicines_injections", language)}:
                    </span>
                    <span className="font-medium text-foreground">{formatINR(medicines)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3 h-3 text-destructive/70" /> {t("hospital_stay_rent", language)}:
                    </span>
                    <span className="font-medium text-foreground">
                      {stayDays > 0 ? `${stayDays}d × ${formatINR(perDayBase)}` : t("opd_no_stay", language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Hospital Tier */}
              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <span className="text-xs font-bold text-teal flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {t("step2_tier_factor", language)}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {tierMult.toFixed(2)}×
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hospital pricing tier: <strong className="text-foreground">{tier}</strong>.
                </p>
                <div className="text-[11px] space-y-1 text-muted-foreground pt-1">
                  <div className={`flex justify-between ${tier === "Budget" ? "font-semibold text-foreground" : ""}`}>
                    <span>• {t("tier_budget_factor", language)}</span>
                    <span>0.60×</span>
                  </div>
                  <div className={`flex justify-between ${tier === "Mid-tier" ? "font-semibold text-foreground" : ""}`}>
                    <span>• {t("tier_mid_factor", language)}</span>
                    <span>1.00×</span>
                  </div>
                  <div className={`flex justify-between ${tier === "Premium" ? "font-semibold text-foreground" : ""}`}>
                    <span>• {t("tier_premium_factor", language)}</span>
                    <span>1.75×</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Accreditation Factor */}
              <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <span className="text-xs font-bold text-[hsl(var(--success))] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t("step3_nabh_factor", language)}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {nabhMult.toFixed(2)}×
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Certification: <strong className="text-foreground">{isNabh ? "NABH Accredited (+5%)" : "Standard Non-Accredited"}</strong>.
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-secondary/50 border border-border/50 text-[11px]">
                  <span className="text-muted-foreground">Combined tariff factor: </span>
                  <span className="font-mono font-bold text-foreground">
                    {tierMult} × {nabhMult} = {totalMult.toFixed(2)}×
                  </span>
                </div>
              </div>
            </div>

            {/* Total Estimated Banner */}
            <div className="mt-2 p-4 rounded-xl bg-gradient-soft border border-primary/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    {t("final_treatment_bill", language)} ({activeHospital?.name || "Selected Facility"})
                  </p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {formatINR(finalCostMin)} – {formatINR(finalCostMax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    Base {formatINR(baseCostMin)} × {tierMult}× (Tier) × {nabhMult}× (NABH) = {formatINR(finalCostMin)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--success))] font-medium px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {result.condition.confidence}% {t("confident", language)}
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Tier Hospital Tariff Comparison Card */}
            <div className="mt-5 pt-4 border-t border-dashed border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                {t("tier_comparison_headline", language)}
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                {/* Budget */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    tier === "Budget"
                      ? "border-success/50 bg-success/10 ring-1 ring-success/30"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">Budget / Trust</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-success/15 text-[hsl(var(--success))] font-semibold">
                      0.60×
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-foreground mt-1">
                    {formatINR(budgetMin)} – {formatINR(budgetMax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t("tier_budget_desc", language)}</p>
                </div>

                {/* Standard Private */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    tier === "Mid-tier"
                      ? "border-teal/50 bg-teal/10 ring-1 ring-teal/30"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">Standard Private</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-teal/15 text-teal font-semibold">
                      1.00×
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-foreground mt-1">
                    {formatINR(midMin)} – {formatINR(midMax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t("tier_mid_desc", language)}</p>
                </div>

                {/* Corporate NABH */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${
                    tier === "Premium"
                      ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">Corporate NABH</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-primary/15 text-primary font-semibold">
                      1.84×
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-foreground mt-1">
                    {formatINR(corporateNabhMin)} – {formatINR(corporateNabhMax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t("tier_premium_desc", language)}</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};