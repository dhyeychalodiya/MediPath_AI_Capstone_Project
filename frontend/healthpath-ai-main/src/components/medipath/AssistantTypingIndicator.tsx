import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

const HONEST_STATUS_MESSAGES = [
  "Reviewing your symptoms…",
  "Comparing supported symptom patterns…",
  "Preparing a follow-up question…",
  "Updating the assessment…",
];

type Props = {
  customStatus?: string;
  className?: string;
};

export const AssistantTypingIndicator = ({ customStatus, className = "" }: Props) => {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (customStatus) return;

    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % HONEST_STATUS_MESSAGES.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [customStatus]);

  const currentStatus = customStatus || HONEST_STATUS_MESSAGES[statusIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex items-start gap-3 ${className}`}
    >
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-secondary/70 border border-border/70 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-muted-foreground flex items-center gap-3 shadow-xs">
        {/* Three animated bouncing dots */}
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
        </div>

        {/* Changing honest status text */}
        <span className="text-foreground/80 font-medium text-xs md:text-sm transition-opacity duration-300">
          {currentStatus}
        </span>
      </div>
    </div>
  );
};
