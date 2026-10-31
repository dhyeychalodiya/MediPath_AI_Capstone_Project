import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProgressiveText } from "@/hooks/useProgressiveText";

describe("useProgressiveText hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should progressively reveal text tokens over time", () => {
    const fullText = "Analyzing your reported symptoms against clinical patterns.";
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useProgressiveText(fullText, true, {
        speedMs: 25,
        maxDurationMs: 1000,
        onComplete,
      })
    );

    // Initial state: empty or initial token
    expect(result.current.isComplete).toBe(false);

    // Advance timers partially
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.displayedText.length).toBeGreaterThan(0);
    expect(result.current.displayedText.length).toBeLessThanOrEqual(fullText.length);

    // Fast-forward to completion
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.displayedText).toBe(fullText);
    expect(result.current.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should instantly complete without typing when skipAnimation is true", () => {
    const fullText = "Emergency condition requires immediate attention.";
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useProgressiveText(fullText, true, {
        skipAnimation: true,
        onComplete,
      })
    );

    expect(result.current.displayedText).toBe(fullText);
    expect(result.current.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalled();
  });

  it("should cap the maximum duration to maxDurationMs even for long text", () => {
    const longText =
      "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two twenty-three twenty-four twenty-five.";
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useProgressiveText(longText, true, {
        speedMs: 30,
        maxDurationMs: 800,
        onComplete,
      })
    );

    // After maxDurationMs (800ms) + small buffer, it must be finished
    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(result.current.isComplete).toBe(true);
    expect(result.current.displayedText).toBe(longText);
    expect(onComplete).toHaveBeenCalled();
  });

  it("should cleanly cancel timer on unmount without throwing errors", () => {
    const fullText = "Some text streaming here";
    const onComplete = vi.fn();

    const { unmount } = renderHook(() =>
      useProgressiveText(fullText, true, {
        speedMs: 50,
        onComplete,
      })
    );

    act(() => {
      vi.advanceTimersByTime(20);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });
});
