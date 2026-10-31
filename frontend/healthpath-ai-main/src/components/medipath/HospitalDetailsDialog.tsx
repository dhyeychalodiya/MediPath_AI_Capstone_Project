import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ShieldCheck, Navigation, Stethoscope, IndianRupee, BedDouble, Calendar, X, Phone, ExternalLink, Receipt, FlaskConical, Pill, Calculator, Building2 } from "lucide-react";
import { EnrichedHospital, Tier, formatINR } from "@/services/hospitalService";
import { t } from "@/lib/i18n";

const tierStyles: Record<Tier, string> = {
  Premium: "bg-primary/10 text-primary border-primary/20",
  "Mid-tier": "bg-teal/10 text-teal border-teal/20",
  Budget: "bg-success/10 text-[hsl(var(--success))] border-success/20",
};

type Props = {
  hospital: EnrichedHospital | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  language?: string;
};

export const HospitalDetailsDialog = ({ hospital, open, onOpenChange, language = "en" }: Props) => {
  if (!hospital) return null;
  const stayCost = hospital.stayDays * hospital.perDay;
  const destination = `${hospital.lat},${hospital.lng}`;
  const query = encodeURIComponent(`${hospital.name}, ${hospital.city}, ${hospital.state}`);
  // Universal Google Maps directions URL — works on web, Android & iOS
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  const tierKey = hospital.tier === "Budget" ? "tier_budget" : hospital.tier === "Mid-tier" ? "tier_mid" : "tier_premium";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <DialogHeader className="space-y-3 pb-2 border-b border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-xl md:text-2xl text-left leading-tight font-bold">
                {hospital.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 mt-1.5 text-left text-sm">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {hospital.city}, {hospital.state} · {hospital.distanceKm} km away
              </DialogDescription>
            </div>
            <Badge variant="outline" className={`${tierStyles[hospital.tier]} px-2.5 py-1 text-xs shrink-0`}>
              {t(tierKey, language)}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              <span className="text-sm font-semibold text-foreground">{hospital.rating}</span>
              <span className="text-xs text-muted-foreground">/ 5 · {hospital.reviews.toLocaleString()} {t("reviews_label", language)}</span>
            </div>
            {hospital.nabh && (
              <Badge variant="outline" className="bg-teal/10 text-teal border-teal/20 gap-1 px-2.5 py-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> {t("nabh_badge", language)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <section className="grid gap-2.5 rounded-xl border border-border p-4 sm:p-5 text-sm">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {t("contact_and_location", language)}
            </h4>
            <p className="flex items-start gap-2 text-foreground">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" /> {hospital.address || `${hospital.city}, ${hospital.state}`}
            </p>
            {hospital.phone ? (
              <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="w-4 h-4" /> {hospital.phone}
              </a>
            ) : <p className="text-muted-foreground">{t("phone_not_listed", language)}</p>}
            {hospital.website ? (
              <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                <ExternalLink className="w-4 h-4" /> {t("visit_website", language)}
              </a>
            ) : <p className="text-muted-foreground">{t("website_not_listed", language)}</p>}
          </section>

          {/* Specialties */}
          <section>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2.5 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-primary" /> {t("specialties", language)}
            </h4>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((s) => (
                <Badge key={s} variant="secondary" className="capitalize text-xs px-2.5 py-1">{s}</Badge>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2.5">
              {t("available_procedures", language)}
            </h4>
            <div className="flex flex-wrap gap-2">
              {hospital.procedures?.length ? hospital.procedures.map((procedure) => (
                <Badge key={procedure} variant="secondary" className="text-xs px-2.5 py-1">{procedure}</Badge>
              )) : <p className="text-sm text-muted-foreground">{t("not_listed", language)}</p>}
            </div>
          </section>

          {/* Cost details: 3-step Real Hospital Bill */}
          <section className="rounded-xl border border-border bg-gradient-soft p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-primary" /> {t("estimated_cost_at_hospital", language)}
              </h4>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Real Tariff Model
              </Badge>
            </div>

            {/* Total Estimated Cost Banner */}
            <div className="p-3.5 rounded-xl bg-card border border-primary/20 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium">{t("final_treatment_bill", language)}</p>
                <p className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                  {formatINR(hospital.costMin)} – {formatINR(hospital.costMax)}
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold text-foreground">{hospital.tier} Hospital</p>
                <p className="text-muted-foreground text-[11px]">
                  {hospital.tierMult ?? (hospital.tier === "Premium" ? 1.75 : hospital.tier === "Budget" ? 0.6 : 1.0)}× Tier {hospital.nabh ? "• 1.05× NABH" : ""}
                </p>
              </div>
            </div>

            {/* Step 1: Base Medical Cost */}
            <div className="p-3 rounded-lg bg-card/70 border border-border/70 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-primary pb-1 border-b border-border/50">
                <span className="flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" /> {t("step1_base_cost", language)}
                </span>
                <span className="font-mono">{formatINR(hospital.baseCostMin || hospital.costMin)}</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3 text-primary/70" /> {t("doctor_procedure_fee", language)}:</span>
                  <span className="text-foreground font-medium">{formatINR(hospital.doctorFeeMin || 500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3 text-teal/70" /> {t("lab_and_tests", language)}:</span>
                  <span className="text-foreground font-medium">{formatINR(hospital.diagnostics || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Pill className="w-3 h-3 text-warning/70" /> {t("medicines_injections", language)}:</span>
                  <span className="text-foreground font-medium">{formatINR(hospital.medicines || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><BedDouble className="w-3 h-3 text-destructive/70" /> {t("hospital_stay_rent", language)}:</span>
                  <span className="text-foreground font-medium">
                    {hospital.stayDays > 0 ? `${hospital.stayDays}d × ${formatINR(hospital.roomRentBase ? hospital.roomRentBase / hospital.stayDays : hospital.perDay)}` : t("opd_no_stay", language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 & 3: Multipliers */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-card/70 border border-border/70">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">{t("step2_tier_factor", language)}</p>
                <p className="font-bold text-foreground mt-0.5">{hospital.tier}</p>
                <p className="text-[11px] font-mono text-teal">
                  {(hospital.tierMult ?? (hospital.tier === "Premium" ? 1.75 : hospital.tier === "Budget" ? 0.6 : 1.0)).toFixed(2)}× multiplier
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-card/70 border border-border/70">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">{t("step3_nabh_factor", language)}</p>
                <p className="font-bold text-foreground mt-0.5">{hospital.nabh ? "NABH Accredited" : "Non-Accredited"}</p>
                <p className="text-[11px] font-mono text-[hsl(var(--success))]">
                  {(hospital.nabhMult ?? (hospital.nabh ? 1.05 : 1.0)).toFixed(2)}× factor
                </p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-mono">
              Total = Base {formatINR(hospital.baseCostMin || hospital.costMin)} × {(hospital.tierMult ?? 1).toFixed(2)}× × {(hospital.nabhMult ?? 1).toFixed(2)}× = {formatINR(hospital.costMin)}
            </p>
          </section>

          {/* Coordinates */}
          <section className="text-xs text-muted-foreground">
            <p>Coordinates: <span className="font-mono">{hospital.lat.toFixed(4)}, {hospital.lng.toFixed(4)}</span></p>
            <p>Hospital ID: <span className="font-mono">{hospital.id}</span></p>
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button asChild className="flex-1 h-10 gap-2 cursor-pointer">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="w-4 h-4" /> {t("get_directions", language)}
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-10 gap-2 cursor-pointer">
              <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="w-4 h-4" /> {t("view_on_map", language)}
              </a>
            </Button>
            <Button variant="ghost" className="sm:w-auto h-10 gap-2 cursor-pointer" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" /> {t("close", language)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};