import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition, LANGUAGE_SPEECH_LOCALES } from "@/hooks/useSpeechRecognition";

interface MockRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  onstart: (() => void) | null;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

describe("useSpeechRecognition hook", () => {
  let mockRecognitionInstance: MockRecognition;

  beforeEach(() => {
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: "en-US",
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };
  });

  afterEach(() => {
    const win = window as unknown as Record<string, unknown>;
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it("reports unsupported if SpeechRecognition is missing from window", () => {
    const { result } = renderHook(() => useSpeechRecognition({ lang: "en" }));
    expect(result.current.isSupported).toBe(false);

    // When startListening is invoked without browser support, it marks status as unsupported
    act(() => {
      result.current.startListening();
    });
    expect(result.current.status).toBe("unsupported");
    expect(result.current.errorMessage).toContain("not supported in this browser");
  });

  it("initializes with correct locale when supported", () => {
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    const { result } = renderHook(() => useSpeechRecognition({ lang: "hi" }));
    expect(result.current.isSupported).toBe(true);
    expect(result.current.status).toBe("idle");
    expect(LANGUAGE_SPEECH_LOCALES["hi"]).toBe("hi-IN");
    expect(LANGUAGE_SPEECH_LOCALES["gu"]).toBe("gu-IN");
  });

  it("handles startListening and invokes native start() with configured locale", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    const { result } = renderHook(() => useSpeechRecognition({ lang: "gu" }));
    await act(async () => {
      await result.current.startListening();
    });

    expect(mockRecognitionInstance.lang).toBe("gu-IN");
    expect(mockRecognitionInstance.start).toHaveBeenCalled();
  });

  it("translates 'network' browser error into an actionable message instead of raw error", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    const onError = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ lang: "en", onError }));

    await act(async () => {
      await result.current.startListening();
    });

    // Simulate browser network error event
    act(() => {
      if (mockRecognitionInstance.onerror) {
        mockRecognitionInstance.onerror({ error: "network" });
      }
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorType).toBe("network");
    expect(result.current.errorMessage).toContain("Speech recognition service could not be reached");
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining("Speech recognition service could not be reached"),
      "network"
    );
  });

  it("handles permission denial ('not-allowed') with clear guidance", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    const { result } = renderHook(() => useSpeechRecognition({ lang: "en" }));

    await act(async () => {
      await result.current.startListening();
    });

    act(() => {
      if (mockRecognitionInstance.onerror) {
        mockRecognitionInstance.onerror({ error: "not-allowed" });
      }
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorType).toBe("not-allowed");
    expect(result.current.errorMessage).toContain("Microphone permission was denied");
  });

  it("calls onTranscript when speech results arrive without auto-submitting", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    const onTranscript = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition({ lang: "en", onTranscript }));

    await act(async () => {
      await result.current.startListening();
    });

    const mockItem = [{ transcript: "severe chest pain radiating to left arm", confidence: 0.95 }] as unknown as { transcript: string; confidence: number }[] & { isFinal: boolean };
    mockItem.isFinal = true;

    const mockEvent = {
      resultIndex: 0,
      results: [mockItem],
    };

    act(() => {
      if (mockRecognitionInstance.onresult) {
        mockRecognitionInstance.onresult(mockEvent);
      }
    });

    expect(onTranscript).toHaveBeenCalledWith("severe chest pain radiating to left arm", true);
  });

  it("aborts active recognition on unmount to prevent leaks or callbacks", async () => {
    const win = window as unknown as Record<string, unknown>;
    win.webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    const { result, unmount } = renderHook(() => useSpeechRecognition({ lang: "en" }));
    await act(async () => {
      await result.current.startListening();
    });

    unmount();

    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
  });
});
