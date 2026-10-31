import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bgAbstract from "@/assets/bg-abstract.jpg";

interface AppSplashScreenProps {
  onFinished: () => void;
  durationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinished,
  durationMs = 1800,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setVisible(false);
    }, durationMs);

    const t2 = setTimeout(() => {
      onFinished();
    }, durationMs + 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [durationMs, onFinished]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="app-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-hero select-none overflow-hidden"
        >
          {/* Exact matching subtle abstract background pattern from Index.tsx */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-multiply"
            style={{ backgroundImage: `url(${bgAbstract})` }}
          />

          {/* Centered App Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-soft border border-primary/20 bg-white p-1">
              <img
                src="/logo.png"
                alt="MediPath AI Logo"
                className="w-full h-full object-contain rounded-[22px]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
