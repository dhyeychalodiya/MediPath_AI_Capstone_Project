import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DoctorConsultationPanel } from "@/components/medipath/DoctorConsultationPanel";
import { ConsultationPrintSummary } from "@/components/medipath/ConsultationPrintSummary";
import * as hospitalService from "@/services/hospitalService";
import type { DoctorTriageV2Result } from "@/services/hospitalService";

vi.mock("@/services/hospitalService", async () => {
  const actual = await vi.importActual<typeof hospitalService>("@/services/hospitalService");
  return {
    ...actual,
    evaluateDoctorTriageV2: vi.fn(),
  };
});

describe("Safe-Deferral Dynamic Recovery and Complete Multi-Page Printing", () => {
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

  // 1. Initial safe-deferral displays unavailable score and explanatory reason
  it("Scenario 1: Initial safe-deferral displays 'Score unavailable (Safe Deferral)' and no fabricated score", async () => {
    const safeDeferResult: DoctorTriageV2Result = {
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: null,
      modelProbability: null,
      threshold: null,
      passesThreshold: false,
      decisionSource: "safe_defer",
      clinicalAssessment: "Symptoms do not match a single supported condition. In-person clinical workup is advised.",
      counterQuestion: null,
      quickOptions: [],
      condition: null,
      topCondition: {
        condition_id: "safe_defer_general",
        condition: "General Clinical Care Referral",
        specialization: "General Medicine",
        procedure: "Comprehensive Outpatient Evaluation",
        urgency: "prompt",
        confidence: null,
        modelProbability: null,
        decisionSource: "safe_defer",
      },
      assessmentStatus: "safe_defer",
      safeDeferReason: "Inconclusive divergent initial symptoms require general clinical physical examination.",
    };

    evaluateDoctorTriageV2Mock.mockResolvedValueOnce(safeDeferResult);

    render(
      <DoctorConsultationPanel
        initialQuery="mild toe tingling, occasional ear itch"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(3000);

    // Confidence bar must show 'Score unavailable (Safe Deferral)'
    expect(screen.getByText("Score unavailable (Safe Deferral)")).toBeInTheDocument();
    // Must NOT show any fabricated numeric confidence score
    expect(screen.queryByText("85%")).not.toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();

    // Clinical assessment & safe deferral guidance must be displayed
    expect(screen.getByText(/Symptoms do not match a single supported condition/i)).toBeInTheDocument();
  });

  // 2. Dynamic recovery from safe-deferral when user enters new clinical evidence
  it("Scenario 2: Entering new coherent symptoms dynamically recovers from safe_defer to a valid model prediction", async () => {
    const safeDeferResult: DoctorTriageV2Result = {
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: false,
      confidence: null,
      modelProbability: null,
      decisionSource: "safe_defer",
      clinicalAssessment: "Initial symptoms remain uncertain. Safe deferral is recommended.",
      counterQuestion: null,
      quickOptions: [],
      condition: null,
      assessmentStatus: "safe_defer",
      safeDeferReason: "Symptoms are insufficient to identify a specific category.",
    };

    const recoveredPneumoniaResult: DoctorTriageV2Result = {
      success: true,
      modelVersion: "_MedP_AI_V2.0",
      isDoctorAI: true,
      isConfident: true,
      confidence: 88,
      modelProbability: 0.88,
      threshold: 0.85,
      passesThreshold: true,
      decisionSource: "ml_model",
      clinicalAssessment: "Identified Possible Cause: Pneumonia based on coherent respiratory evidence.",
      counterQuestion: null,
      quickOptions: [],
      condition: {
        condition_id: "pneumonia",
        condition: "Pneumonia",
        specialization: "Pulmonology",
        procedure: "Chest Radiography & Sputum Workup",
        confidence: 88,
        modelProbability: 0.88,
        threshold: 0.85,
        passesThreshold: true,
        urgency: "urgent",
        icd10: "J18.9",
        decisionSource: "ml_model",
      },
      assessmentStatus: "possible_cause_ready",
      safeDeferReason: null, // Cleared on recovery!
    };

    evaluateDoctorTriageV2Mock
      .mockResolvedValueOnce(safeDeferResult)
      .mockResolvedValueOnce(recoveredPneumoniaResult);

    render(
      <DoctorConsultationPanel
        initialQuery="vague discomfort"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Turn 0 resolves to safe_defer
    await advanceAsync(3000);
    expect(screen.getByText("Score unavailable (Safe Deferral)")).toBeInTheDocument();

    // Patient enters genuine new symptoms in the input box
    const input = screen.getByRole("textbox");
    act(() => {
      fireEvent.change(input, { target: { value: "high fever, productive cough, sharp chest pain" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    // Advance through the recovery request and reveal
    await advanceAsync(3000);

    // The safe deferral status is cleanly replaced!
    // Confidence bar & outcome card show genuine 88%
    expect(screen.getAllByText("88%")[0]).toBeInTheDocument();
    // Confirmed condition card is now visible
    expect(screen.getAllByText("Pneumonia")[0]).toBeInTheDocument();
    expect(screen.getByText("Possible Cause Identified")).toBeInTheDocument();
    expect(screen.getAllByText(/Pulmonology/)[0]).toBeInTheDocument();
  });

  // 3. Multi-page ConsultationPrintSummary renders complete conversation and final assessment
  it("Scenario 3: Print summary renders full ordered conversation history, headers, notice, and final outcome", () => {
    const condition = {
      condition_id: "pneumonia",
      condition: "Pneumonia",
      specialization: "Pulmonology",
      procedure: "Chest Radiography & Targeted Antibiotic Regimen",
      confidence: 88,
      modelProbability: 0.88,
      threshold: 0.85,
      passesThreshold: true,
      urgency: "urgent",
      icd10: "J18.9",
      decisionSource: "ml_model",
    };

    const messages = [
      {
        id: "m-1",
        sender: "patient" as const,
        text: "I have high fever and severe cough",
        timestamp: "10:00 AM",
      },
      {
        id: "m-2",
        sender: "doctor" as const,
        text: "Evaluating respiratory symptoms against Model 2.0 clinical classes.",
        timestamp: "10:00 AM",
      },
      {
        id: "m-3",
        sender: "doctor" as const,
        text: "Do you have any pleuritic chest pain or shortness of breath?",
        options: ["Pleuritic chest pain", "Shortness of breath", "None of these"],
        isQuestion: true,
        timestamp: "10:01 AM",
      },
      {
        id: "m-4",
        sender: "patient" as const,
        text: "Yes, sharp chest pain when breathing deeply",
        timestamp: "10:01 AM",
      },
      {
        id: "m-5",
        sender: "doctor" as const,
        text: "Based on accumulated respiratory signs, possible cause identified: Pneumonia.",
        timestamp: "10:02 AM",
      },
    ];

    render(
      <ConsultationPrintSummary
        initialSymptoms="high fever and severe cough"
        allSymptomsText="high fever, severe cough, sharp chest pain when breathing deeply"
        messages={messages}
        confirmedCondition={condition}
        confidenceScore={88}
        assessmentStatus="possible_cause_ready"
        safeDeferReason={null}
        topCandidates={[condition]}
      />
    );

    // 1. Report Header
    expect(screen.getByText("MediPath AI")).toBeInTheDocument();
    expect(screen.getByText("MedP_AI_V2.0")).toBeInTheDocument();

    // 2. Non-Diagnostic Notice
    expect(
      screen.getByText(/This summary contains preliminary healthcare-navigation information and is not a medical diagnosis/i)
    ).toBeInTheDocument();

    // 3. Authoritative Assessment Summary
    expect(screen.getByText("Pneumonia")).toBeInTheDocument();
    expect(screen.getByText(/J18.9/)).toBeInTheDocument();
    expect(screen.getAllByText(/Pulmonology/)[0]).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();

    // 4. Complete Ordered Conversation History (all 5 messages)
    expect(screen.getByText("I have high fever and severe cough")).toBeInTheDocument();
    expect(screen.getByText("Evaluating respiratory symptoms against Model 2.0 clinical classes.")).toBeInTheDocument();
    expect(screen.getByText("Do you have any pleuritic chest pain or shortness of breath?")).toBeInTheDocument();
    expect(screen.getByText("Yes, sharp chest pain when breathing deeply")).toBeInTheDocument();
    expect(screen.getByText("Based on accumulated respiratory signs, possible cause identified: Pneumonia.")).toBeInTheDocument();

    // 5. Candidate Differential Options Presented
    expect(screen.getByText(/Candidate Differential Options Presented:/i)).toBeInTheDocument();
    expect(screen.getByText(/Pleuritic chest pain • Shortness of breath • None of these/i)).toBeInTheDocument();

    // 6. Reported Symptoms Evidence
    expect(screen.getByText(/high fever, severe cough, sharp chest pain when breathing deeply/i)).toBeInTheDocument();
  });

  // 4. Safe Deferral printout preserves uncertainty honestly
  it("Scenario 4: Safe-deferral printout honestly prints safe deferral reason and Score unavailable without fabricating results", () => {
    const safeDeferCondition = {
      condition_id: "safe_defer_general",
      condition: "General Clinical Care Referral",
      specialization: "General Medicine",
      procedure: "Comprehensive Outpatient Diagnostic Workup",
      confidence: null,
      modelProbability: null,
      decisionSource: "safe_defer",
    };

    render(
      <ConsultationPrintSummary
        initialSymptoms="atypical malaise"
        allSymptomsText="atypical malaise"
        messages={[
          {
            id: "m-1",
            sender: "patient" as const,
            text: "atypical malaise",
          },
          {
            id: "m-2",
            sender: "doctor" as const,
            text: "Symptoms are insufficient to identify a specific primary care category. Safe deferral to a General Physician is recommended.",
          },
        ]}
        confirmedCondition={safeDeferCondition}
        assessmentStatus="safe_defer"
        confidenceScore={null}
        safeDeferReason="Clinical symptoms do not cluster to a supported Model 2.0 category."
      />
    );

    // Displays Score unavailable (Safe Deferral)
    expect(screen.getByText("Score unavailable (Safe Deferral)")).toBeInTheDocument();
    // Displays Safe Deferral Reason
    expect(screen.getByText(/Safe Deferral Reason:/i)).toBeInTheDocument();
    expect(screen.getByText("Clinical symptoms do not cluster to a supported Model 2.0 category.")).toBeInTheDocument();
    // Does NOT display any fake percent
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.queryByText(/85%/)).not.toBeInTheDocument();
  });
});
