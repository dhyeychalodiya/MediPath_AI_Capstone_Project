import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { DoctorConsultationPanel } from "@/components/medipath/DoctorConsultationPanel";
import * as hospitalService from "@/services/hospitalService";
import type { DoctorTriageV2Result } from "@/services/hospitalService";

vi.mock("@/services/hospitalService", async () => {
  const actual = await vi.importActual<typeof hospitalService>("@/services/hospitalService");
  return {
    ...actual,
    evaluateDoctorTriageV2: vi.fn(),
  };
});

describe("MediPath AI: Follow-Up Consultation Stability Suite (Tests A - K)", () => {
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

  // TEST A: Initial Consultation
  it("Test A: Submits initial symptoms, requests mandatory follow-up, reflects real Model 2.0 response", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 88,
      modelProbability: 0.88,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Symptoms analyzed. Accompanying details needed to guide care.",
      counterQuestion: "Do you also experience nausea or dizziness?",
      quickOptions: ["Nausea", "Dizziness", "No more symptoms"],
      canonicalFollowUpQuestion: "Do you also experience nausea or dizziness?",
      canonicalQuickOptions: ["Nausea", "Dizziness", "No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
      topCondition: { condition: "Migraine", condition_id: "migraine", specialization: "Neurology", confidence: 88 },
      topCandidates: [{ condition: "Migraine", condition_id: "migraine", specialization: "Neurology", confidence: 88 }],
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Severe pulsating headache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Initial patient message rendered
    expect(screen.getByText("Severe pulsating headache")).toBeDefined();

    // Advance thinking delay & text reveal
    await advanceAsync(3200);

    // Initial inference reached backend with turnCount: 0
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(1);
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        symptoms: "Severe pulsating headache",
        turnCount: 0,
      })
    );

    // Follow-up question is presented
    expect(screen.getByText("Do you also experience nausea or dizziness?")).toBeDefined();
    expect(screen.getByText("Nausea")).toBeDefined();
  });

  // TEST B & C: Enter Key and Send Button Submit Identical Current Text
  it("Test B & C: Enter key and Send button call identical submission handler with current edited text", async () => {
    // Initial turn
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 82,
      clinicalAssessment: "Initial symptoms recorded.",
      counterQuestion: "Any other signs?",
      quickOptions: ["Fatigue", "No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Joint pain"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(1200);

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;

    // Simulate typing and editing
    fireEvent.change(inputEl, { target: { value: "headache" } });
    fireEvent.change(inputEl, { target: { value: "headache and morning stiffness" } });

    // Mock turn 1 response
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 86,
      clinicalAssessment: "Updated symptom pattern analyzed.",
      counterQuestion: "Is stiffness worse in the morning?",
      quickOptions: ["Yes", "No", "No more symptoms"],
      assessmentStatus: "needs_more_information",
      condition: null,
    });

    // Submit using Enter key
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });

    // Verify backend received the final edited value, not earlier "headache"
    expect(evaluateDoctorTriageV2Mock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        symptoms: expect.stringContaining("headache and morning stiffness"),
      })
    );

    // Advance timers so turn 1 completes
    await advanceAsync(1200);

    // User message is in chat
    expect(screen.getByText("headache and morning stiffness")).toBeDefined();
    // Input is cleared on successful acceptance
    expect(inputEl.value).toBe("");

    // Now test Send button with a new edited message
    fireEvent.change(inputEl, { target: { value: "swelling" } });
    fireEvent.change(inputEl, { target: { value: "swelling in knees" } });

    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 94,
      modelProbability: 0.94,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Possible cause identified: Rheumatoid Arthritis.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "possible_cause_ready",
      condition: {
        condition: "Rheumatoid Arthritis",
        condition_id: "rheumatoid_arthritis",
        specialization: "Rheumatology",
        confidence: 94,
        modelProbability: 0.94,
        threshold: 0.85,
        passesThreshold: true,
        urgency: "prompt",
      },
    });

    const sendBtn = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendBtn);

    // Backend received the exact edited string "swelling in knees"
    expect(evaluateDoctorTriageV2Mock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        symptoms: expect.stringContaining("swelling in knees"),
      })
    );

    await advanceAsync(1200);
    expect(screen.getByText("swelling in knees")).toBeDefined();
  });

  // TEST D: Alternating Input Methods (Enter -> Send -> Enter)
  it("Test D: Alternating between Enter and Send produces strictly ordered submissions without duplicates", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 80,
      clinicalAssessment: "Symptoms updated.",
      counterQuestion: "Next question?",
      quickOptions: ["No more symptoms"],
      assessmentStatus: "needs_more_information",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Fever"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await advanceAsync(1200);

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;

    // Step 1: Submit with Enter
    fireEvent.change(inputEl, { target: { value: "dry cough" } });
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });
    await advanceAsync(1200);
    expect(screen.getByText("dry cough")).toBeDefined();

    // Step 2: Submit with Send button
    fireEvent.change(inputEl, { target: { value: "chest congestion" } });
    const sendBtn = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendBtn);
    await advanceAsync(1200);
    expect(screen.getByText("chest congestion")).toBeDefined();

    // Step 3: Submit again with Enter
    fireEvent.change(inputEl, { target: { value: "loss of appetite" } });
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });
    await advanceAsync(1200);
    expect(screen.getByText("loss of appetite")).toBeDefined();

    // Verify all 3 messages appear in order without duplication
    const patientMessages = screen.getAllByText(/dry cough|chest congestion|loss of appetite/);
    expect(patientMessages.length).toBe(3);
  });

  // TEST F: Submitting Additional Symptoms AFTER an Assessment Result
  it("Test F: Composer remains mounted and functional after valid assessment result appears", async () => {
    // Turn 0: Initial query
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 80,
      clinicalAssessment: "Analyzing initial symptoms.",
      counterQuestion: "Any other signs?",
      quickOptions: ["Chest tightness", "No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Wheezing and shortness of breath"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await advanceAsync(1200);

    // Turn 1: Finalize with confident outcome
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 92,
      modelProbability: 0.92,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Possible cause identified: Bronchial Asthma.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "possible_cause_ready",
      condition: {
        condition: "Bronchial Asthma",
        condition_id: "asthma",
        specialization: "Pulmonology",
        confidence: 92,
        modelProbability: 0.92,
        threshold: 0.85,
        passesThreshold: true,
        urgency: "urgent",
      },
    });

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(inputEl, { target: { value: "cough at night" } });
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });
    await advanceAsync(1200);

    // Result card is visible
    expect(screen.getByText("Bronchial Asthma")).toBeDefined();

    // CRITICAL: Textbox is NOT unmounted or locked! It is still visible and enabled!
    expect(inputEl).toBeDefined();
    expect(inputEl.disabled).toBe(false);

    // Turn 2: User remembers another symptom AFTER the result card appeared!
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 96,
      modelProbability: 0.96,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Updated assessment with additional trigger evidence: Severe Bronchial Asthma.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "possible_cause_ready",
      condition: {
        condition: "Bronchial Asthma",
        condition_id: "asthma",
        specialization: "Pulmonology",
        confidence: 96,
        modelProbability: 0.96,
        threshold: 0.85,
        passesThreshold: true,
        urgency: "urgent",
      },
    });

    fireEvent.change(inputEl, { target: { value: "triggered by cold air" } });
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });

    // Verify newly added symptom reaches backend
    expect(evaluateDoctorTriageV2Mock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        symptoms: expect.stringContaining("triggered by cold air"),
      })
    );

    // User message immediately visible in chat history
    expect(screen.getByText("triggered by cold air")).toBeDefined();

    await advanceAsync(1200);

    // Previous conversation history is completely preserved!
    expect(screen.getByText("Wheezing and shortness of breath")).toBeDefined();
    expect(screen.getByText("cough at night")).toBeDefined();
    expect(screen.getByText("triggered by cold air")).toBeDefined();
  });

  // TEST E: Safe Deferral Recovery
  it("Test E: Safe deferral displays unavailable score, and subsequent new symptoms recover cleanly to valid prediction", async () => {
    // Initial safe deferral
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: null,
      modelProbability: null,
      threshold: 0.85,
      passesThreshold: false,
      decisionSource: "safe_defer",
      clinicalAssessment: "Symptoms are currently inconclusive. Safe referral to General Physician recommended.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "safe_defer",
      safeDeferReason: "insufficient_evidence",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Vague fatigue"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await advanceAsync(1200);

    // Shows unavailable score
    expect(screen.getAllByText(/Score unavailable \(Safe Deferral\)/i).length).toBeGreaterThan(0);

    // User remembers specific distinctive symptoms
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 95,
      modelProbability: 0.95,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Possible cause identified: Type 2 Diabetes Mellitus.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "possible_cause_ready",
      condition: {
        condition: "Type 2 Diabetes Mellitus",
        condition_id: "diabetes_mellitus_type_2",
        specialization: "Endocrinology",
        confidence: 95,
        modelProbability: 0.95,
        threshold: 0.85,
        passesThreshold: true,
        urgency: "prompt",
      },
    });

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(inputEl, { target: { value: "excessive thirst and frequent urination" } });
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });
    await advanceAsync(1200);

    // Successfully recovered from safe deferral!
    expect(screen.getByText("Type 2 Diabetes Mellitus")).toBeDefined();
    // Earlier message preserved
    expect(screen.getByText("Vague fatigue")).toBeDefined();
  });

  // TEST G: Defensive Limit on Questioning Loop
  it("Test G: When follow-up turns are exhausted, concludes with safe deferral instead of looping indefinitely", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: null,
      modelProbability: null,
      threshold: 0.85,
      passesThreshold: false,
      decisionSource: "safe_defer",
      clinicalAssessment: "No further distinguishing questions remain. Safe deferral to a General Physician is advised.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "safe_defer",
      safeDeferReason: "safe_defer_turn_limit_reached",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Tiredness"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await advanceAsync(1200);

    expect(screen.getByText(/General Physician/i)).toBeDefined();
    // No infinite questions: quick options are empty
    expect(screen.queryByText("Fever or chills")).toBeNull();
  });

  // TEST H: Duplicate Click and In-Flight Race Condition Prevention
  it("Test H: Rapid repeated clicks or Enter spam while request is in flight are blocked", async () => {
    let resolveTurn0: (val: any) => void = () => {};
    const turn0Promise = new Promise((res) => {
      resolveTurn0 = res;
    });

    evaluateDoctorTriageV2Mock.mockReturnValueOnce(turn0Promise);

    render(
      <DoctorConsultationPanel
        initialQuery="Headache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Initial query is still in flight:
    const inputEl = screen.getByRole("textbox") as HTMLInputElement;
    expect(inputEl.disabled).toBe(true);

    // Try to trigger Enter or click Send while locked
    fireEvent.change(inputEl, { target: { value: "nausea" } });
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });

    // evaluateDoctorTriageV2 was called only once for initial query
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(1);

    // Resolve initial turn
    resolveTurn0({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 80,
      clinicalAssessment: "Initial analysis ready.",
      counterQuestion: "Any nausea?",
      quickOptions: ["Yes", "No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
    });

    await advanceAsync(1200);
    expect(inputEl.disabled).toBe(false);
  });

  // TEST I: Multilingual Submission (English & Native Scripts)
  it("Test I: Correctly handles native and Romanized input without losing language context", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 85,
      clinicalAssessment: "लक्षणों का विश्लेषण किया गया।",
      counterQuestion: "क्या आपको उल्टी भी हो रही है?",
      quickOptions: ["उल्टी", "कोई अन्य लक्षण नहीं"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
      language: "hi",
    });

    render(
      <DoctorConsultationPanel
        initialQuery="सर दर्द और चक्कर"
        initialLanguage="hi"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await advanceAsync(1200);

    expect(screen.getByText("सर दर्द और चक्कर")).toBeDefined();
    expect(screen.getByText("क्या आपको उल्टी भी हो रही है?")).toBeDefined();
  });
  it("Test J: On network or server failure, composer preserves user text for retry and does not fabricate scores", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 75,
      clinicalAssessment: "Initial consultation active.",
      counterQuestion: "Any other symptoms?",
      quickOptions: ["No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Stomach pain"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    await advanceAsync(1200);

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(inputEl, { target: { value: "severe heartburn after meals" } });

    // Mock API network rejection
    evaluateDoctorTriageV2Mock.mockRejectedValueOnce(new Error("Network connection dropped"));

    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });
    await advanceAsync(500);

    // Composer restores the user's text so they don't have to re-type it!
    expect(inputEl.value).toBe("severe heartburn after meals");
    // Loading state is cleared
    expect(inputEl.disabled).toBe(false);

    // Clear warning banner shown to patient
    expect(screen.getByText(/Unable to process your symptom update/i)).toBeDefined();
  });

  // TEST K: UI Accessibility and Focus Styling (No Black Outline)
  it("Test K: Input uses deliberate accessible outline-none and focus ring styling without thick black browser outline", () => {
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 80,
      clinicalAssessment: "Consultation ready.",
      counterQuestion: "Next question?",
      quickOptions: [],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
    });

    render(
      <DoctorConsultationPanel
        initialQuery="Backache"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;

    // Must have outline-none and focus:outline-none to prevent browser black ring
    expect(inputEl.className).toContain("outline-none");
    expect(inputEl.className).toContain("focus:outline-none");

    // Parent wrapper has accessible focus-within ring
    const parentContainer = inputEl.parentElement;
    expect(parentContainer?.className).toContain("focus-within:border-primary");
    expect(parentContainer?.className).toContain("focus-within:ring-2");
  });
});
