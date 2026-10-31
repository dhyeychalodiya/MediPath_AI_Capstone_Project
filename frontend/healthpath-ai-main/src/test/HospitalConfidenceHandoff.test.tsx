import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResultsView } from "@/components/medipath/ResultsView";
import { ConfidenceMeter } from "@/components/medipath/ConfidenceMeter";
import { findHospitals, defaultFilters, SearchOutput } from "@/services/hospitalService";

describe("Hospital Recommendation Page & Authoritative Confidence Handoff Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Test 1: Displays identical Model 2.0 authoritative confidence score (e.g. 88%) on the hospital page", () => {
    const mockOutput: SearchOutput = {
      query: "high fever, productive cough, sharp chest pain",
      condition: {
        condition: "Pneumonia",
        icd10: "J18.9",
        specialty: "Pulmonology",
        procedure: "Chest Radiography & Sputum Workup",
        confidence: 88,
        baseConfidence: 88,
        lowConfidence: false,
        modelProbability: 0.88,
        threshold: 0.85,
        passesThreshold: true,
        decisionSource: "ml_model",
        base: { min: 35000, max: 95000, stayDays: 4, perDay: 4500, diagnostics: 9000, medicines: 8000, contingencyPct: 10 },
      },
      hospitals: [],
      totalMatching: 0,
      predictions: [],
      followUpQuestions: [],
      dataSource: "Verified Registry",
    };

    render(
      <ResultsView
        result={mockOutput}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Header badge displays exactly 88%
    expect(screen.getAllByText("88%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Model Confidence")).toBeInTheDocument();
    expect(screen.queryByText(/Score unavailable/i)).not.toBeInTheDocument();
  });

  it("Test 2: Safe deferral outcome renders 'Score unavailable (Safe Deferral)' and never fabricates numeric percentage", () => {
    const safeDeferOutput: SearchOutput = {
      query: "vague discomfort",
      condition: {
        condition: "General Clinical Care Referral",
        icd10: "R69",
        specialty: "General Medicine",
        procedure: "Comprehensive In-Person Clinical Assessment",
        confidence: null as unknown as number,
        baseConfidence: 0,
        lowConfidence: true,
        safeDeferReason: "Inconclusive divergent symptoms safely deferred for clinical examination",
        decisionSource: "safe_defer",
        base: { min: 500, max: 1500, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 500, contingencyPct: 5 },
      },
      hospitals: [],
      totalMatching: 0,
      predictions: [],
      followUpQuestions: [],
      dataSource: "Verified Registry",
    };

    render(
      <ResultsView
        result={safeDeferOutput}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Displays 'Score unavailable (Safe Deferral)'
    expect(screen.getAllByText("Score unavailable (Safe Deferral)").length).toBeGreaterThanOrEqual(1);
    // Must NOT fabricate any score percentage
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
    expect(screen.queryByText("85%")).not.toBeInTheDocument();
    expect(screen.queryByText("NaN%")).not.toBeInTheDocument();
    expect(screen.queryByText("null%")).not.toBeInTheDocument();
  });

  it("Test 3: ConfidenceMeter renders safe deferral state cleanly without broken percentages", () => {
    render(<ConfidenceMeter value={null} isSafeDefer={true} language="en" />);

    expect(screen.getByText("Score unavailable (Safe Deferral)")).toBeInTheDocument();
    expect(screen.getByText("Model Confidence")).toBeInTheDocument();
    expect(screen.queryByText("%")).not.toBeInTheDocument();
  });

  it("Test 4: Clicking 'Re-consult Doctor AI' invokes onReconsultDoctor callback", () => {
    const onReconsultMock = vi.fn();
    const mockOutput: SearchOutput = {
      query: "migraine",
      condition: {
        condition: "Migraine",
        icd10: "G43.9",
        specialty: "Neurology",
        procedure: "Neurological Examination",
        confidence: 85,
        baseConfidence: 85,
        lowConfidence: false,
        base: { min: 800, max: 3000, stayDays: 0, perDay: 0, diagnostics: 1500, medicines: 1400, contingencyPct: 5 },
      },
      hospitals: [],
      totalMatching: 0,
      predictions: [],
      followUpQuestions: [],
      dataSource: "Verified Registry",
    };

    render(
      <ResultsView
        result={mockOutput}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
        onReconsultDoctor={onReconsultMock}
      />
    );

    const reconsultBtn = screen.getByRole("button", { name: /Re-Consult/i });
    fireEvent.click(reconsultBtn);

    expect(onReconsultMock).toHaveBeenCalledTimes(1);
  });

  it("Test 5: Speech narration accurately reports 'Confidence is 92 percent' or safe deferral without 'null percent'", () => {
    const speakMock = vi.fn();
    window.speechSynthesis = {
      speak: speakMock,
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    } as unknown as SpeechSynthesis;

    const mockOutput: SearchOutput = {
      query: "allergic conjunctivitis",
      condition: {
        condition: "Allergic Conjunctivitis",
        icd10: "H10.1",
        specialty: "Ophthalmology",
        procedure: "Slit-Lamp Examination",
        confidence: 92,
        baseConfidence: 92,
        lowConfidence: false,
        base: { min: 600, max: 1600, stayDays: 0, perDay: 0, diagnostics: 500, medicines: 800, contingencyPct: 5 },
      },
      hospitals: [],
      totalMatching: 0,
      predictions: [],
      followUpQuestions: [],
      dataSource: "Verified Registry",
    };

    render(
      <ResultsView
        result={mockOutput}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    const listenBtn = screen.getByRole("button", { name: /Listen to assessment/i });
    fireEvent.click(listenBtn);

    expect(speakMock).toHaveBeenCalledTimes(1);
    const spokenUtterance = speakMock.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(spokenUtterance.text).toContain("Confidence is 92 percent");
    expect(spokenUtterance.text).not.toContain("null percent");
  });
});
