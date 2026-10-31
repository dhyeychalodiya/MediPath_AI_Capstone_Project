import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EnrichedHospital, formatINR } from "@/services/hospitalService";
import { t } from "@/lib/i18n";

type Props = {
  hospitals: EnrichedHospital[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: string;
};

const value = (items: string[] | undefined, lang: string) => items?.length ? items.join(", ") : t("not_listed", lang);

export const HospitalComparisonDialog = ({ hospitals, open, onOpenChange, language = "en" }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
      <DialogHeader className="mb-2">
        <DialogTitle className="text-xl font-bold">{t("compare_hospitals", language)}</DialogTitle>
      </DialogHeader>
      <div className="overflow-x-auto rounded-xl border border-border my-2">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="w-36 p-3.5 sm:p-4 text-left font-semibold text-muted-foreground">{t("measure", language)}</th>
              {hospitals.map((hospital) => (
                <th key={hospital.id} className="p-3.5 sm:p-4 text-left font-bold text-foreground">
                  {hospital.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              [t("distance_slider", language), (h: EnrichedHospital) => `${h.distanceKm} km`],
              [t("sort_rating", language), (h: EnrichedHospital) => `${h.rating}/5 (${h.reviews.toLocaleString()} ${t("reviews_label", language)})`],
              [t("nabh_badge", language), (h: EnrichedHospital) => (h.nabh ? t("nabh_badge", language) : t("not_accredited", language))],
              [t("specialization", language), (h: EnrichedHospital) => value(h.specialties, language)],
              [t("procedure", language), (h: EnrichedHospital) => value(h.procedures, language)],
              ["Hospital Tier", (h: EnrichedHospital) => `${h.tier} (${(h.tierMult || (h.tier === 'Premium' ? 1.75 : h.tier === 'Budget' ? 0.6 : 1.0)).toFixed(2)}×)`],
              ["Formula Breakdown", (h: EnrichedHospital) => `Base ${formatINR(h.baseCostMin || h.costMin)} × ${(h.tierMult || 1).toFixed(2)}× ${h.nabh ? "× 1.05" : ""}`],
              [t("estimated_cost", language), (h: EnrichedHospital) => `${formatINR(h.costMin)} – ${formatINR(h.costMax)}`],
            ].map(([label, render]) => (
              <tr key={label as string}>
                <th className="p-3.5 sm:p-4 text-left align-top font-medium text-muted-foreground">{label as string}</th>
                {hospitals.map((hospital) => (
                  <td key={hospital.id} className="p-3.5 sm:p-4 align-top text-foreground leading-relaxed">
                    {(render as (h: EnrichedHospital) => string)(hospital)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground pt-1">
        {t("comparison_disclaimer", language)}
      </p>
    </DialogContent>
  </Dialog>
);