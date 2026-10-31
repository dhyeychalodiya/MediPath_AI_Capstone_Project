import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { t } from "@/lib/i18n";

export const Disclaimer = ({ language = "en" }: { language?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8 }}
    className="flex gap-4 p-5 rounded-2xl border border-warning/30 bg-warning/5"
  >
    <div className="shrink-0 w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center">
      <AlertTriangle className="w-5 h-5 text-warning" />
    </div>
    <div className="text-sm text-foreground/80 leading-relaxed">
      <p className="font-semibold text-foreground mb-1">{t("medical_disclaimer_title", language)}</p>
      {t("medical_disclaimer_text", language)}
    </div>
  </motion.div>
);