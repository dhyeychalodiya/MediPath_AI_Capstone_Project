import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DoctorConsultationPanel } from "@/components/medipath/DoctorConsultationPanel";
import * as hospitalService from "@/services/hospitalService";

vi.mock("@/services/hospitalService", async () => {
  const actual = await vi.importActual<typeof hospitalService>("@/services/hospitalService");
  return {
    ...actual,
    evaluateDoctorTriageV2: vi.fn(),
  };
});

describe("Doctor AI: No More Symptoms Termination & Anti-Looping Suite", () => {
  const evaluateDoctorTriageV2Mock = hospitalService.evaluateDoctorTriageV2 as unknown as ReturnType<typeof vi.fn>;

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

  it("Test 1: Appendicitis emergency query with initial question terminates on No more symptoms without looping", async () => {
    const appendicitisCondition = {
      index: 6,
      condition_id: "appendicitis",
      condition: "Appendicitis",
      specialization: "General Surgery",
      specializationTerms: ["general surgery", "emergency medicine"],
      icd10: "K35.80",
      urgency: "emergency" as const,
      procedure: "Urgent Abdominal Ultrasound / CT & Surgical Evaluation",
      procedureTerms: ["emergency opd", "abdominal ultrasound"],
      threshold: 0.85,
      confidence: 90,
      modelProbability: 0.904,
      passesThreshold: true,
    };

    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 90,
      modelProbability: 0.904,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "EMERGENCY: Symptoms strongly align with acute appendicitis. Further details are needed.",
      counterQuestion: "To help narrow down the possible cause, please select any accompanying symptoms you are experiencing, or select No more symptoms:",
      quickOptions: ["Sharp pain in lower right abdomen", "Nausea and low-grade fever", "No more symptoms"],
      canonicalQuickOptions: ["Sharp pain in lower right abdomen", "Nausea and low-grade fever", "No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      topCondition: appendicitisCondition,
      topCandidates: [appendicitisCondition],
    });

    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 90,
      modelProbability: 0.904,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Possible cause identified: Appendicitis. Emergency clinical evaluation is advised.",
      counterQuestion: null,
      quickOptions: [],
      condition: appendicitisCondition,
      topCondition: appendicitisCondition,
      topCandidates: [appendicitisCondition],
      assessmentStatus: "possible_cause_ready",
    });

    const query = "Dull pain near navel moving to lower right belly\nSharp right lower quadrant abdominal pain\nLow grade fever with chills";
    render(
      <DoctorConsultationPanel
        initialQuery={query}
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(3500);

    expect(screen.getByText(/To help narrow down the possible cause/i)).toBeInTheDocument();
    const noMoreBtns = screen.getAllByRole("button", { name: /No more symptoms/i });
    expect(noMoreBtns.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(noMoreBtns[0]);
    });

    await advanceAsync(2500);

    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(2);
    expect(evaluateDoctorTriageV2Mock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        noMoreSymptoms: true,
        turnCount: 1,
      })
    );

    expect(screen.getByText(/Possible cause identified: Appendicitis/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /No more symptoms/i })).not.toBeInTheDocument();
  }, 15000);
});
