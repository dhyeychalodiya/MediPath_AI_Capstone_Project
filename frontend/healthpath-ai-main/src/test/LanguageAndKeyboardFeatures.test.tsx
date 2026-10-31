import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { SearchBar } from "@/components/medipath/SearchBar";
import { DoctorConsultationPanel } from "@/components/medipath/DoctorConsultationPanel";
import { ResultsView } from "@/components/medipath/ResultsView";
import * as hospitalService from "@/services/hospitalService";
import type { DoctorTriageV2Result, SearchOutput } from "@/services/hospitalService";
import { t } from "@/lib/i18n";

vi.mock("@/services/hospitalService", async () => {
  const actual = await vi.importActual<typeof hospitalService>("@/services/hospitalService");
  return {
    ...actual,
    evaluateDoctorTriageV2: vi.fn(),
  };
});

describe("Language Detection, Translation Sync & Keyboard Shortcuts (Enter vs Shift+Enter)", () => {
  const evaluateDoctorTriageV2Mock = hospitalService.evaluateDoctorTriageV2 as unknown as ReturnType<typeof vi.fn>;

  const hindiMockResult: DoctorTriageV2Result = {
    success: true,
    modelVersion: "_MedP_AI_V2.0",
    isDoctorAI: true,
    isConfident: false,
    confidence: 65,
    modelProbability: 0.65,
    threshold: 0.85,
    passesThreshold: false,
    decisionSource: "ml_model",
    language: "hi",
    originalSymptoms: "सीने में दर्द",
    translatedSymptoms: "chest pain",
    clinicalAssessment: "हम आपके प्राथमिक लक्षणों की जांच कर रहे हैं।",
    counterQuestion: "क्या आपको सांस लेने में कठिनाई या पसीना आ रहा है?",
    canonicalFollowUpQuestion: "Are you also experiencing shortness of breath or sweating?",
    quickOptions: ["सांस लेने में कठिनाई", "पसीना आना", "इनमें से कोई नहीं"],
    canonicalQuickOptions: ["Shortness of breath", "Sweating", "None of these apply"],
    condition: null,
    topCondition: null,
    topCandidates: [],
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

  // ── TEST 1: HOME PAGE SEARCHBAR ENTER VS SHIFT+ENTER & KEYBOARD HINT ──
  it("SearchBar sends on Enter, creates newline on Shift+Enter, and displays keyboard hint", () => {
    const handleSearch = vi.fn();
    const handleLanguageChange = vi.fn();

    render(
      <SearchBar
        onSearch={handleSearch}
        modelVersion="_MedP_AI_V2.0"
        onModelVersionChange={vi.fn()}
        selectedLanguage="en"
        onLanguageChange={handleLanguageChange}
      />
    );

    // Verify keyboard hint is visible near the text box
    const hint = screen.getByText(t("keyboard_hint", "en"));
    expect(hint).toBeInTheDocument();
    expect(hint.textContent).toContain("Enter to send");
    expect(hint.textContent).toContain("Shift + Enter");

    const textarea = screen.getByRole("textbox");

    // Type text
    fireEvent.change(textarea, { target: { value: "headache" } });

    // Press Shift + Enter -> Should NOT trigger onSearch
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(handleSearch).not.toHaveBeenCalled();

    // Press Enter (without Shift) -> Should trigger onSearch
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith("headache", "en");
  });

  // ── TEST 2: HOME PAGE LANGUAGE DETECTION (HINDI & GUJARATI) ──
  it("SearchBar detects Hindi and Gujarati input and invokes onLanguageChange", () => {
    const handleLanguageChange = vi.fn();

    render(
      <SearchBar
        onSearch={vi.fn()}
        modelVersion="_MedP_AI_V2.0"
        onModelVersionChange={vi.fn()}
        selectedLanguage="en"
        onLanguageChange={handleLanguageChange}
      />
    );

    const textarea = screen.getByRole("textbox");

    // Enter Hindi query
    fireEvent.change(textarea, { target: { value: "सीने में दर्द" } });
    expect(handleLanguageChange).toHaveBeenCalledWith("hi");

    // Enter Gujarati query
    fireEvent.change(textarea, { target: { value: "મને માથું દુખે છે" } });
    expect(handleLanguageChange).toHaveBeenCalledWith("gu");
  });

  // ── TEST 3: DOCTOR CONSULTATION PANEL ENTER VS SHIFT+ENTER & KEYBOARD HINT ──
  it("DoctorConsultationPanel sends on Enter, does not send on Shift+Enter, and displays hint", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(hindiMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="सीने में दर्द"
        initialLanguage="hi"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(1500);

    // Verify keyboard hint is displayed in Hindi near the composer
    const hint = screen.getByText(t("keyboard_hint", "hi"));
    expect(hint).toBeInTheDocument();
    expect(hint.textContent).toContain("Enter दबाएं");
    expect(hint.textContent).toContain("Shift + Enter");

    // Initial triage was called once
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(1);

    const composer = screen.getByPlaceholderText(t("type_placeholder", "hi"));

    // Type text
    fireEvent.change(composer, { target: { value: "घबराहट" } });

    // Press Shift + Enter -> Should NOT submit
    fireEvent.keyDown(composer, { key: "Enter", shiftKey: true });
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(1);

    // Press Enter -> Should submit
    await act(async () => {
      fireEvent.keyDown(composer, { key: "Enter", shiftKey: false });
    });
    expect(evaluateDoctorTriageV2Mock).toHaveBeenCalledTimes(2);
  });

  // ── TEST 4: FOLLOW-UP PAGE FULL TRANSLATION IN HINDI ──
  it("DoctorConsultationPanel displays all elements translated into Hindi", async () => {
    evaluateDoctorTriageV2Mock.mockResolvedValue(hindiMockResult);

    render(
      <DoctorConsultationPanel
        initialQuery="सीने में दर्द"
        initialLanguage="hi"
        onDiagnosisConfirmed={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await advanceAsync(1500);

    // Welcome context banner in Hindi
    expect(screen.getByText(t("consultation_welcome_desc", "hi"))).toBeInTheDocument();

    // Accompanying symptoms header in Hindi
    expect(screen.getByText(t("recommended_accompanying_symptoms", "hi"))).toBeInTheDocument();
    expect(screen.getByText(t("select_single_or_multiple", "hi"))).toBeInTheDocument();

    // "Only" shortcut button in Hindi
    const onlyBtns = screen.getAllByText(t("btn_only", "hi"));
    expect(onlyBtns.length).toBeGreaterThan(0);

    // "No more symptoms" button in Hindi
    expect(screen.getByText(t("no_more_symptoms", "hi"))).toBeInTheDocument();

    // Quick action CTA in Hindi
    expect(screen.getByText(t("finished_symptoms_cta", "hi"))).toBeInTheDocument();
  });

  // ── TEST 5: RESULTSVIEW TRANSLATION IN GUJARATI ──
  it("ResultsView renders all headers and notices in Gujarati", () => {
    const mockOutput: SearchOutput = {
      query: "માથાનો દુખાવો",
      condition: {
        condition: "Migraine",
        specialty: "Neurology",
        confidence: 88,
        procedure: "Neurological Consultation & MRI",
        icd10: "G43",
        urgency: "urgent",
        decisionSource: "ml_model",
      } as any,
      hospitals: [],
      totalMatching: 0,
      predictions: [],
      followUpQuestions: [],
      dataSource: "Verified Registry",
    };

    render(
      <ResultsView
        result={mockOutput}
        filters={hospitalService.defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="gu"
      />
    );

    // Possible cause header in Gujarati
    expect(screen.getByText(t("possible_cause", "gu"))).toBeInTheDocument();

    // Target specialization in Gujarati
    expect(screen.getByText(t("target_specialization", "gu"))).toBeInTheDocument();

    // Reconsult button in Gujarati
    expect(screen.getByText(t("reconsult_doctor", "gu"))).toBeInTheDocument();

    // Medical disclaimer title in Gujarati
    expect(screen.getByText(t("preliminary_assessment_title", "gu"))).toBeInTheDocument();
  });
});
