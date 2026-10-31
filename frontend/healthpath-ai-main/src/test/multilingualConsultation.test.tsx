import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { DoctorConsultationPanel, SUPPORTED_LANGUAGES, NO_MORE_SYMPTOMS_LABELS } from "@/components/medipath/DoctorConsultationPanel";
import * as hospitalService from "@/services/hospitalService";
import type { DoctorTriageV2Result } from "@/services/hospitalService";

vi.mock("@/services/hospitalService", async () => {
  const actual = await vi.importActual<typeof hospitalService>("@/services/hospitalService");
  return {
    ...actual,
    evaluateDoctorTriageV2: vi.fn(),
  };
});

describe("DoctorConsultationPanel Multilingual Features", () => {
  const evaluateDoctorTriageV2Mock = hospitalService.evaluateDoctorTriageV2 as unknown as ReturnType<typeof vi.fn>;

  const hindiMockResult: DoctorTriageV2Result = {
    success: true,
    modelVersion: "_MedP_AI_V2.0",
    isDoctorAI: true,
    isConfident: false,
    confidence: 60,
    modelProbability: 0.60,
    threshold: 0.85,
    passesThreshold: false,
    decisionSource: "ml_model",
    language: "hi",
    originalSymptoms: "पेशाब में जलन",
    translatedSymptoms: "burning sensation during urination",
    clinicalAssessment: "हम आपके प्राथमिक लक्षणों की जांच कर रहे हैं।",
    counterQuestion: "क्या आपको बुखार या पेट के निचले हिस्से में दर्द भी है?",
    canonicalFollowUpQuestion: "Do you also have fever or lower abdominal pain?",
    quickOptions: ["बुखार", "पेट में दर्द", "इनमें से कोई नहीं"],
    canonicalQuickOptions: ["Fever", "Abdominal pain", "None of these apply"],
    condition: null,
    topCondition: null,
    topCandidates: [
      {
        condition_id: "urinary_tract_infection",
        condition: "Urinary Tract Infection",
        specialization: "Urology",
        confidence: 60,
        modelProbability: 0.60,
        threshold: 0.85,
      },
    ],
    assessmentStatus: "needs_mandatory_followup",
  };

  const advanceAsync = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initializes with Hindi language and passes language param to evaluateDoctorTriageV2", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(hindiMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="पेशाब में जलन"
        initialLanguage="hi"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        symptoms: "पेशाब में जलन",
        language: "hi",
      })
    );
  });

  it("displays translated Hindi question, quick options, and localized 'No more symptoms' button", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(hindiMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="पेशाब में जलन"
        initialLanguage="hi"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Fast-forward initial reveal
    await advanceAsync(1500);

    // Check localized no more symptoms label
    const noMoreBtn = screen.getByText(NO_MORE_SYMPTOMS_LABELS.hi);
    expect(noMoreBtn).toBeInTheDocument();

    // Check quick option chip
    expect(screen.getByText("बुखार")).toBeInTheDocument();
  });

  it("clicking localized 'No more symptoms' sends canonical 'No more symptoms' to API", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(hindiMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="पेशाब में जलन"
        initialLanguage="hi"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(1500);

    const noMoreBtn = screen.getByText(NO_MORE_SYMPTOMS_LABELS.hi);
    await act(async () => {
      fireEvent.click(noMoreBtn);
    });

    // The second API call should pass noMoreSymptoms: true and language: "hi"
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(2);
    expect(evaluateDoctorTriageV2Mock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        noMoreSymptoms: true,
        language: "hi",
      })
    );
  });

  it("supported languages array includes English, Hindi, and Gujarati with speech locales", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("hi");
    expect(codes).toContain("gu");

    const hindi = SUPPORTED_LANGUAGES.find((l) => l.code === "hi");
    expect(hindi?.speechLocale).toBe("hi-IN");

    const gujarati = SUPPORTED_LANGUAGES.find((l) => l.code === "gu");
    expect(gujarati?.speechLocale).toBe("gu-IN");
  });
});
