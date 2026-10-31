import { useState, useEffect, useRef, useCallback } from "react";

export type UseProgressiveTextOptions = {
  speedMs?: number;
  maxDurationMs?: number;
  skipAnimation?: boolean;
  onComplete?: () => void;
};

/**
 * Checks whether the user's system prefers reduced motion.
 */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    return Boolean(mql?.matches);
  } catch {
    return false;
  }
}

/**
 * Hook to progressively reveal text word-by-word with natural cadence.
 * - Caps reveal duration at ~1.2-1.6s
 * - Target 20-35ms per word/small chunk
 * - Bypasses animation immediately for reduced motion or emergency bypass
 * - Safely cleans up on unmount or cancellation
 */
export function useProgressiveText(
  fullText: string,
  isActive: boolean,
  options: UseProgressiveTextOptions = {}
) {
  const {
    speedMs = 26,
    maxDurationMs = 1400,
    skipAnimation = false,
    onComplete,
  } = options;

  const [displayedText, setDisplayedText] = useState<string>(() => {
    if (!isActive) return "";
    if (skipAnimation || getPrefersReducedMotion()) return fullText;
    return "";
  });

  const [isComplete, setIsComplete] = useState<boolean>(() => {
    if (!isActive) return false;
    if (skipAnimation || getPrefersReducedMotion() || !fullText) return true;
    return false;
  });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cancelRef = useRef<(() => void) | null>(null);

  const completeImmediately = useCallback(() => {
    setDisplayedText(fullText);
    setIsComplete(true);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [fullText]);

  useEffect(() => {
    // If not active or empty text
    if (!isActive || !fullText) {
      setDisplayedText("");
      setIsComplete(false);
      return;
    }

    // Skip animation for reduced motion or explicit skip (e.g. emergency)
    if (skipAnimation || getPrefersReducedMotion()) {
      completeImmediately();
      return;
    }

    // Split text into word chunks while preserving trailing spaces and punctuation
    const tokens = fullText.match(/\S+\s*/g) || [fullText];
    if (tokens.length === 0) {
      completeImmediately();
      return;
    }

    // Calculate dynamic step interval capped at maxDurationMs
    const totalTokens = tokens.length;
    const computedInterval = Math.min(
      speedMs,
      Math.max(10, Math.floor(maxDurationMs / totalTokens))
    );

    let currentIndex = 0;
    let accumulated = "";
    let isCancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    setDisplayedText("");
    setIsComplete(false);

    const tick = () => {
      if (isCancelled) return;

      if (currentIndex < totalTokens) {
        accumulated += tokens[currentIndex];
        currentIndex += 1;
        setDisplayedText(accumulated);
        timerId = setTimeout(tick, computedInterval);
      } else {
        setDisplayedText(fullText);
        setIsComplete(true);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    // Start typing
    timerId = setTimeout(tick, computedInterval);

    cancelRef.current = () => {
      isCancelled = true;
      if (timerId !== null) clearTimeout(timerId);
    };

    return () => {
      isCancelled = true;
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [fullText, isActive, skipAnimation, speedMs, maxDurationMs, completeImmediately]);

  return {
    displayedText,
    isComplete,
    skip: completeImmediately,
  };
}
