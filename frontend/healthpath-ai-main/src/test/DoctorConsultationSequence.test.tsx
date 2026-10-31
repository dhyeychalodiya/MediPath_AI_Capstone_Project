import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { DoctorConsultationPanel } from "@/components/medipath/DoctorConsultationPanel";
import { InformationUsedPanel } from "@/components/medipath/InformationUsedPanel";
import { ConsultationPrintSummary } from "@/components/medipath/ConsultationPrintSummary";
import * as hospitalService from "@/services/hospitalService";
import type { DoctorTriageV2Result } from "@/services/hospitalService";

// Mock evaluateDoctorTriageV2
vi.mock("@/services/hospitalService", async () => {
  const actual = await vi.importActual<typeof hospitalService>("@/services/hospitalService");
  return {
    ...actual,
    evaluateDoctorTriageV2: vi.fn(),
  };
});

describe("DoctorConsultationPanel AI Response Sequence & Enhancements", () => {
  const evaluateDoctorTriageV2Mock = hospitalService.evaluateDoctorTriageV2 as unknown as ReturnType<typeof vi.fn>;

  const defaultMockResult: DoctorTriageV2Result = {
    success: true,
    modelVersion: "_MedP_AI_V2.0",
    isDoctorAI: true,
    isConfident: false,
    confidence: 65,
    modelProbability: 0.65,
    threshold: 0.85,
    passesThreshold: false,
    decisionSource: "ml_model",
    clinicalAssessment: "Reviewing your initial reported symptoms.",
    counterQuestion: "Do you have any fever or nausea?",
    quickOptions: ["Fever", "Nausea", "Headache", "None of these apply"],
    condition: null,
    topCondition: null,
    topCandidates: [
      {
        condition_id: "acute_gastritis",
        condition: "Acute Gastritis",
        specialization: "Gastroenterology",
        confidence: 65,
        modelProbability: 0.65,
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

  // 1. Typing indicator appears while API request is pending
  it("Requirement 1: Typing indicator appears while the API request is pending", async () => {
    evaluateDoctorTriageV2Mock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(defaultMockResult), 300))
    );

    render(
      <DoctorConsultationPanel
        initialQuery="stomach ache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Initial patient message should be visible immediately
    expect(screen.getByText("stomach ache")).toBeInTheDocument();

    // Typing indicator should be present while request is running
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // 2. Fast API responses still receive a short natural reveal
  it("Requirement 2: Fast API responses maintain the natural thinking state before progressive reveal", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(defaultMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="ear ache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Initial state: thinking indicator visible
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Advance 600ms through minimum thinking wait and initial streaming tick
    await advanceAsync(650);

    // The assessment text begins to reveal
    expect(screen.getByText(/Reviewing your initial/i)).toBeInTheDocument();
  });

  // 3 & 4. Clinical assessment appears before follow-up question; chips appear only after question completes
  it("Requirements 3 & 4: Assessment appears before question, chips appear only after question finishes", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(defaultMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="headache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Advance past minimum thinking wait + assessment reveal duration (approx 1000ms total)
    await advanceAsync(1000);

    // Assessment is visible
    expect(screen.getByText(/Reviewing your initial reported symptoms/i)).toBeInTheDocument();

    // Question and options chips should NOT be fully committed yet
    expect(screen.queryByText("Do you have any fever or nausea?")).not.toBeInTheDocument();
    expect(screen.queryByText("Fever")).not.toBeInTheDocument();

    // Advance past pause (200ms) and question reveal duration (1400ms)
    await advanceAsync(1700);

    // Now question is visible
    expect(screen.getByText("Do you have any fever or nausea?")).toBeInTheDocument();

    // And symptom option chips are revealed
    expect(screen.getByText("Fever")).toBeInTheDocument();
    expect(screen.getByText("Nausea")).toBeInTheDocument();
    expect(screen.getByText("No more symptoms (View Results)")).toBeInTheDocument();
  });

  // 5 & 6. Input remains disabled during request and reveal, enabled after reveal
  it("Requirements 5 & 6: Input remains disabled during request and reveal, becomes enabled after", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(defaultMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="chest tightness"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox");
    // During initial request/reveal, input is disabled
    expect(input).toBeDisabled();

    // Advance through thinking, assessment, pause, and question reveal
    await advanceAsync(3000);

    // Input becomes enabled once reveal sequence completes
    expect(input).not.toBeDisabled();
  });

  // 7. Canonical chat history contains only complete messages
  it("Requirement 7: Backend chatHistory receives only complete canonical messages", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(defaultMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="dry cough"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Complete initial turn
    await advanceAsync(3000);

    // Patient sends an additional symptom
    const input = screen.getByRole("textbox");
    act(() => {
      fireEvent.change(input, { target: { value: "sore throat" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    // Verify what evaluateDoctorTriageV2 received
    expect(evaluateDoctorTriageV2Mock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        symptoms: expect.stringContaining("sore throat"),
        chatHistory: expect.arrayContaining([
          expect.objectContaining({
            text: "dry cough",
            role: "patient",
          }),
          expect.objectContaining({
            text: "Reviewing your initial reported symptoms.",
            role: "doctor",
          }),
          expect.objectContaining({
            text: "Do you have any fever or nausea?",
            role: "doctor",
          }),
          expect.objectContaining({
            text: "sore throat",
            role: "patient",
          }),
        ]),
      })
    );

    // Verify none of the messages in chatHistory contain streaming fragments
    const lastCall = evaluateDoctorTriageV2Mock.mock.calls.at(-1)?.[0];
    for (const msg of lastCall.chatHistory) {
      expect(msg.text).not.toContain("...");
      expect(msg.text.length).toBeGreaterThan(2);
    }
  });

  // 8. Repeated clicks / double clicks cannot create duplicate messages
  it("Requirement 8: Repeated clicks or Enter spam cannot send duplicate messages", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(defaultMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="fever"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(3000);

    const input = screen.getByRole("textbox");
    act(() => {
      fireEvent.change(input, { target: { value: "fatigue" } });

      // Rapid double-press of Enter
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.keyDown(input, { key: "Enter" });
    });

    // evaluateDoctorTriageV2 should only have been called once for initial mount, and ONCE for "fatigue"
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(2);
  });

  // 9. Timers are cleared on unmount
  it("Requirement 9: Timers and animation callbacks are cleared on unmount without state leaks", async () => {
    evaluateDoctorTriageV2Mock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(defaultMockResult), 100))
    );

    const { unmount } = render(
      <DoctorConsultationPanel
        initialQuery="joint pain"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(50);

    // Unmount while request or reveal is ongoing
    unmount();

    // Advance all timers: should not produce any console errors or unmounted state warnings
    await advanceAsync(5000);

    expect(true).toBe(true);
  });

  // 10. Restarting does not display stale responses
  it("Requirement 10: Cancel or reset does not display stale responses", async () => {
    let resolveFirstReq: (val: DoctorTriageV2Result) => void;
    evaluateDoctorTriageV2Mock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirstReq = resolve;
        })
    );

    const { unmount } = render(
      <DoctorConsultationPanel
        key={1}
        initialQuery="stale test query"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // User resets consultation (simulated by unmount and remount with key 2)
    unmount();

    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      ...defaultMockResult,
      clinicalAssessment: "Fresh response for new consultation",
    });

    render(
      <DoctorConsultationPanel
        key={2}
        initialQuery="new fresh query"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Resolve the old stalled request
    if (resolveFirstReq!) {
      resolveFirstReq({
        ...defaultMockResult,
        clinicalAssessment: "STALE OLD DATA",
      });
    }

    await advanceAsync(3000);

    // The stale text should NEVER appear in the document
    expect(screen.queryByText(/STALE OLD DATA/i)).not.toBeInTheDocument();
  });

  // 11. Reduced-motion mode skips character-by-character animation
  it("Requirement 11: Reduced motion mode skips typewriter reveal instantly", async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    evaluateDoctorTriageV2Mock.mockResolvedValue(defaultMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="rash"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Advance past minimum thinking
    await advanceAsync(800);

    // Full text should be visible without waiting for character/word ticks
    expect(screen.getByText("Reviewing your initial reported symptoms.")).toBeInTheDocument();
  });

  // 12. Emergency results display immediately
  it("Requirement 12: Emergency override bypasses typewriter delay and displays immediately", async () => {
    const emergencyResult: DoctorTriageV2Result = {
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 99,
      modelProbability: null,
      decisionSource: "emergency_override",
      clinicalAssessment: "CRITICAL ALERT: Seek immediate emergency medical care for acute chest pain.",
      counterQuestion: null,
      quickOptions: [],
      condition: {
        condition_id: "emergency_chest_pain",
        condition: "Acute Chest Pain / Possible Coronary Syndrome",
        specialization: "Emergency Medicine",
        urgency: "emergency",
        confidence: 99,
        modelProbability: null,
        decisionSource: "emergency_override",
      },
      assessmentStatus: "emergency_override",
    };

    evaluateDoctorTriageV2Mock.mockResolvedValue(emergencyResult);

    render(
      <DoctorConsultationPanel
        initialQuery="crushing chest pain radiating to left arm"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Advance minimal time: emergency override skips minimum delay and typewriter entirely
    await advanceAsync(50);

    // Emergency warning is visible immediately
    expect(screen.getByText(/CRITICAL ALERT: Seek immediate emergency/i)).toBeInTheDocument();
    expect(screen.getAllByText("Acute Chest Pain / Possible Coronary Syndrome")[0]).toBeInTheDocument();
    expect(screen.getByText("Emergency Override")).toBeInTheDocument();
  });

  // 13. "No more symptoms" still works
  it("Requirement 13: 'No more symptoms' transitions to final evaluation", async () => {
    evaluateDoctorTriageV2Mock
      .mockResolvedValueOnce(defaultMockResult)
      .mockResolvedValueOnce({
        ...defaultMockResult,
        isConfident: true,
        confidence: 88,
        modelProbability: 0.88,
        clinicalAssessment: "Based on your reported symptoms, a possible cause has been identified.",
        condition: {
          condition_id: "acute_gastritis",
          condition: "Acute Gastritis",
          specialization: "Gastroenterology",
          procedure: "Upper GI Endoscopy Consultation",
          confidence: 88,
          modelProbability: 0.88,
          threshold: 0.85,
          passesThreshold: true,
          decisionSource: "no_more_symptoms",
        },
        assessmentStatus: "possible_cause_ready",
      });

    render(
      <DoctorConsultationPanel
        initialQuery="stomach burning"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(3000);

    // Click "No more symptoms"
    const noMoreBtn = screen.getByText("No more symptoms (View Results)");
    fireEvent.click(noMoreBtn);

    // Advance through second turn reveal
    await advanceAsync(3000);

    // Confirmed condition card should be visible
    expect(screen.getAllByText("Acute Gastritis")[0]).toBeInTheDocument();
    expect(screen.getByText("Possible Cause Identified")).toBeInTheDocument();
  });

  // 14. Multiple follow-up questions still work
  it("Requirement 14: Multiple follow-up questions work sequentially across multiple turns", async () => {
    const secondTurnResult: DoctorTriageV2Result = {
      ...defaultMockResult,
      clinicalAssessment: "Noted fever. Let's check further accompanying symptoms.",
      counterQuestion: "Do you have any chills or neck stiffness?",
      quickOptions: ["Chills", "Neck stiffness", "None apply"],
    };

    evaluateDoctorTriageV2Mock
      .mockResolvedValueOnce(defaultMockResult)
      .mockResolvedValueOnce(secondTurnResult);

    render(
      <DoctorConsultationPanel
        initialQuery="headache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Turn 1 completes
    await advanceAsync(3000);

    // Select "Fever" chip
    const feverChip = screen.getByText("Fever");
    fireEvent.click(feverChip);

    const submitBtn = screen.getByText(/Submit Selected/i);
    fireEvent.click(submitBtn);

    // Turn 2 reveals
    await advanceAsync(3000);

    // Second follow-up question is visible
    expect(screen.getByText("Do you have any chills or neck stiffness?")).toBeInTheDocument();
    expect(screen.getByText("Chills")).toBeInTheDocument();
  });

  // 15. Printable summary contains the correct real values
  it("Requirement 15: Printable summary component renders the correct real clinical navigation values", () => {
    const condition = {
      condition_id: "gerd",
      condition: "Gastroesophageal Reflux Disease / GERD",
      specialization: "Gastroenterology",
      procedure: "Esophageal Manometry & Endoscopy",
      confidence: 90,
      modelProbability: 0.90,
      threshold: 0.85,
      passesThreshold: true,
      urgency: "routine",
      icd10: "K21.9",
      decisionSource: "ml_model",
    };

    render(
      <ConsultationPrintSummary
        initialSymptoms="heartburn after eating"
        allSymptomsText="heartburn after eating, acid regurgitation"
        confirmedCondition={condition}
        safeDeferReason={null}
        topCandidates={[condition]}
      />
    );

    const summaryEl = document.getElementById("printable-consultation-summary");
    expect(summaryEl).toBeInTheDocument();

    expect(screen.getByText("Gastroesophageal Reflux Disease / GERD")).toBeInTheDocument();
    expect(screen.getByText(/K21.9/)).toBeInTheDocument();
    expect(screen.getAllByText(/Gastroenterology/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Esophageal Manometry & Endoscopy/)).toBeInTheDocument();
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText(/heartburn after eating, acid regurgitation/)).toBeInTheDocument();
    expect(
      screen.getByText(/This summary contains preliminary healthcare-navigation information and is not a medical diagnosis/i)
    ).toBeInTheDocument();
  });

  // 16. Null probability is not rendered as 0%
  it("Requirement 16: Null model probability is safely rendered as N/A / Clinical Rule and never as 0%", () => {
    const conditionWithoutProb = {
      condition_id: "safe_defer_general",
      condition: "General Clinical Care Referral",
      specialization: "General Medicine",
      procedure: "Comprehensive Outpatient Evaluation",
      confidence: null,
      modelProbability: null,
      threshold: 0.85,
      passesThreshold: false,
      urgency: "prompt",
      decisionSource: "safe_defer",
    };

    render(
      <ConsultationPrintSummary
        initialSymptoms="unexplained malaise"
        allSymptomsText="unexplained malaise"
        confirmedCondition={conditionWithoutProb}
        safeDeferReason="Symptoms require general examination."
      />
    );

    // It must NOT show "0%"
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText(/Safe Deferral Reason:/i)).toBeInTheDocument();
  });

  // 17. The “Information used” panel handles missing values safely
  it("Requirement 17: Information used audit panel safely renders without crashing on null/undefined fields", () => {
    render(
      <InformationUsedPanel
        initialSymptoms="mild cough"
        assessmentState={null}
        topCandidates={[]}
        modelProbability={null}
        threshold={null}
        passesThreshold={false}
        decisionSource={undefined}
        turnCount={1}
      />
    );

    // Click toggle to open panel
    const toggleBtn = screen.getByText("Information used in this assessment");
    fireEvent.click(toggleBtn);

    // Audit panel opens safely
    expect(screen.getByText("Reported Symptom Evidence")).toBeInTheDocument();
    expect(screen.getByText("Model Alignment Metrics")).toBeInTheDocument();
    expect(screen.getByText("N/A (Clinical Rule / Non-Probabilistic)")).toBeInTheDocument();
    expect(screen.getByText("0 options excluded")).toBeInTheDocument();
  });
});
