import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

describe("Parent-Child State Synchronization & Chat Message Registration", () => {
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

  // Test Component mimicking Index.tsx
  const ParentTestWrapper = () => {
    const [query, setQuery] = useState("severe throbbing headache");
    const [confirmedCondition, setConfirmedCondition] = useState<any>(null);

    return (
      <div>
        <div data-testid="parent-query" data-query={query} />
        <DoctorConsultationPanel
          initialQuery={query}
          onDiagnosisConfirmed={(cond) => setConfirmedCondition(cond)}
          onCancel={vi.fn()}
          onSymptomsUpdate={(newSyms) => setQuery(newSyms)}
        />
      </div>
    );
  };

  it("Each user input registers in the chat even when parent updates initialQuery prop", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 70,
      modelProbability: 0.70,
      threshold: 0.85,
      passesThreshold: false,
      decisionSource: "ml_model",
      clinicalAssessment: "Noted initial headache symptom. Clarifying associated factors.",
      counterQuestion: "Do you experience accompanying nausea or sensitivity to sound?",
      quickOptions: ["Nausea", "Sound sensitivity", "No more symptoms"],
      assessmentStatus: "needs_mandatory_followup",
      condition: null,
    });

    render(<ParentTestWrapper />);

    // Initial query displayed
    expect(screen.getAllByText("severe throbbing headache").length).toBeGreaterThanOrEqual(1);
    await advanceAsync(3200);

    const inputEl = screen.getByRole("textbox") as HTMLInputElement;
    const sendBtn = screen.getByRole("button", { name: /send/i });

    // --- TURN 1: User types and presses Enter ---
    fireEvent.change(inputEl, { target: { value: "nausea and vomiting" } });

    evaluateDoctorTriageV2Mock.mockResolvedValueOnce({
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: 82,
      modelProbability: 0.82,
      threshold: 0.85,
      passesThreshold: false,
      decisionSource: "ml_model",
      clinicalAssessment: "Noted nausea and vomiting. Does bright light intensify the pain?",
      counterQuestion: "Is there light sensitivity or visual disturbance?",
      quickOptions: ["Light sensitivity", "No more symptoms"],
      assessmentStatus: "needs_more_information",
      condition: null,
    });

    // Press Enter
    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });

    // 1. Verify user input registers IMMEDIATELY in the chat
    expect(screen.getByText("nausea and vomiting")).toBeDefined();

    // 2. Parent state updated via onSymptomsUpdate
    expect(screen.getByTestId("parent-query").getAttribute("data-query")).toContain("nausea and vomiting");

    await advanceAsync(3200);

    // 3. Initial query AND Turn 1 input MUST STILL BE IN THE CHAT (not wiped!)
    expect(screen.getByText("severe throbbing headache")).toBeDefined();
    expect(screen.getByText("nausea and vomiting")).toBeDefined();

    // --- TURN 2: User types and clicks Send button ---
    fireEvent.change(inputEl, { target: { value: "extreme light sensitivity and visual flashing" } });

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
      clinicalAssessment: "Possible cause identified: Migraine with photophobia.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "possible_cause_ready",
      condition: {
        condition: "Migraine",
        condition_id: "migraine",
        specialization: "Neurology",
        confidence: 94,
        modelProbability: 0.94,
        threshold: 0.85,
        passesThreshold: true,
      },
    });

    // Click Send
    fireEvent.click(sendBtn);

    // 1. Verify Turn 2 input registers IMMEDIATELY in the chat
    expect(screen.getByText("extreme light sensitivity and visual flashing")).toBeDefined();

    await advanceAsync(3200);

    // 2. All 3 user inputs MUST BE PRESERVED IN THE CHAT THREAD
    expect(screen.getByText("severe throbbing headache")).toBeDefined();
    expect(screen.getByText("nausea and vomiting")).toBeDefined();
    expect(screen.getByText("extreme light sensitivity and visual flashing")).toBeDefined();

    // 3. Final diagnosis card rendered
    expect(screen.getByText("Migraine")).toBeDefined();

    // --- TURN 3 (POST-ASSESSMENT): User adds more symptoms after diagnosis ---
    fireEvent.change(inputEl, { target: { value: "numbness on one side of face" } });

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
      clinicalAssessment: "Updated assessment with unilateral sensory symptoms: Hemiplegic Migraine.",
      counterQuestion: null,
      quickOptions: [],
      assessmentStatus: "possible_cause_ready",
      condition: {
        condition: "Hemiplegic Migraine",
        condition_id: "hemiplegic_migraine",
        specialization: "Neurology",
        confidence: 96,
        modelProbability: 0.96,
        threshold: 0.85,
        passesThreshold: true,
      },
    });

    fireEvent.keyDown(inputEl, { key: "Enter", shiftKey: false });

    // Turn 3 input registered
    expect(screen.getByText("numbness on one side of face")).toBeDefined();

    await advanceAsync(3200);

    // Complete conversation thread remains fully intact
    expect(screen.getByText("severe throbbing headache")).toBeDefined();
    expect(screen.getByText("nausea and vomiting")).toBeDefined();
    expect(screen.getByText("extreme light sensitivity and visual flashing")).toBeDefined();
    expect(screen.getByText("numbness on one side of face")).toBeDefined();
    expect(screen.getByText("Hemiplegic Migraine")).toBeDefined();
  }, 15000);
});
