import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/medipath/Header";
import { ModelDiagnosticsDialog } from "@/components/medipath/ModelDiagnosticsDialog";
import { SupportedDiseasesDirectory } from "@/components/medipath/SupportedDiseasesDirectory";
import { DirectDiseaseRoutingState } from "@/components/medipath/DirectDiseaseRoutingState";
import { CANONICAL_CONDITIONS, GENERAL_MEDICINE_OPTION } from "@/data/canonicalConditionsData";
import { MODELS_TECHNICAL_DATA, THREE_MODEL_COMPARISON_MATRIX } from "@/data/modelsTechnicalData";
import { BrowserRouter } from "react-router-dom";
import { localizeSymptomOption } from "@/lib/i18n";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("Header Upgrade: Firebase & All Models Status", () => {
  it("renders Firebase Connected status and All Models (3/3 Online) badge", () => {
    const handleOpenDiagnostics = vi.fn();

    render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          onOpenModelDiagnostics={handleOpenDiagnostics}
          activeModelId="_MedP_AI_V2.0"
        />
      </BrowserRouter>
    );

    // Firebase indicator is present
    expect(screen.getByText(/Firebase Connected/i)).toBeInTheDocument();

    // All Models: 3/3 Online button is present and clickable
    const allModelsBtn = screen.getByTitle(/Click to inspect all 3 AI models/i);
    expect(allModelsBtn).toBeInTheDocument();
    expect(screen.getByText(/All Models: 3\/3 Online/i)).toBeInTheDocument();

    fireEvent.click(allModelsBtn);
    expect(handleOpenDiagnostics).toHaveBeenCalledWith("_MedP_AI_V2.0");
  });
});

describe("Model Diagnostics & Nerd Hub Dialog", () => {
  it("displays all 3 models, mathematical formulations, hyperparameters and metrics", () => {
    const handleSelectVersion = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <ModelDiagnosticsDialog
        open={true}
        onOpenChange={handleOpenChange}
        activeModelVersion="_MedP_AI_V2.0"
        onSelectModelVersion={handleSelectVersion}
      />
    );

    // Nerd specs title
    expect(screen.getByText(/MediPath AI Diagnostics & Technical Hub/i)).toBeInTheDocument();

    // Model selection buttons are visible
    expect(screen.getAllByText(/_MedP_AI_V2.0/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MedP_AI_V1.5/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MedP_AI_V1.0/i).length).toBeGreaterThan(0);

    // Mathematical formula block
    expect(screen.getByText(/Mathematical Blueprint & Formulation/i)).toBeInTheDocument();

    // Performance metrics
    expect(screen.getByText(/Validation & Test Benchmarks/i)).toBeInTheDocument();
    expect(screen.getByText(/Micro F1 Score/i)).toBeInTheDocument();

    // Switching models in the dialog
    fireEvent.click(screen.getAllByText(/MedP_AI_V1.5/i)[0]);
    expect(screen.getByText(/Model 1.5 \(Calibrated Linear SGD\)/i)).toBeInTheDocument();
  });

  it("renders Datasets tab with model choice, real dataset preview, and download buttons", () => {
    render(
      <ModelDiagnosticsDialog
        open={true}
        onOpenChange={vi.fn()}
        activeModelVersion="_MedP_AI_V2.0"
      />
    );

    // Switch to Datasets tab
    const datasetsTab = screen.getByRole("tab", { name: /Training Datasets/i });
    fireEvent.click(datasetsTab);

    // Default V2 dataset info
    expect(screen.getAllByText(/symptom-based-disease-prediction-v2.xlsx/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Download Dataset \(\.xlsx\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-Leakage Group Stratification/i)).toBeInTheDocument();

    // Interactive model choice in dataset section: Switch to Model 1.5
    const v15DatasetBtn = screen.getAllByText(/Updated01_HealthPath_Symptom_Training_Dataset.xlsx/i)[0].closest("button");
    if (v15DatasetBtn) {
      fireEvent.click(v15DatasetBtn);
    }
    expect(screen.getAllByText(/Updated01_HealthPath_Symptom_Training_Dataset.xlsx/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/85,420/i).length).toBeGreaterThan(0);
  });

  it("renders Verified Hospital Registry tab with search and 924 facilities", () => {
    render(
      <ModelDiagnosticsDialog
        open={true}
        onOpenChange={vi.fn()}
        activeModelVersion="_MedP_AI_V2.0"
      />
    );

    // Switch to Hospital Registry tab
    const hospitalTab = screen.getByRole("tab", { name: /Hospital Registry/i });
    fireEvent.click(hospitalTab);

    expect(screen.getByText(/Verified Hospital Registry & Procedural Network/i)).toBeInTheDocument();
    expect(screen.getAllByText(/924/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Download Excel \(\.xlsx\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search hospitals by name, city/i)).toBeInTheDocument();
  });

  it("renders 3-Model Comparison tab with head-to-head matrix", () => {
    render(
      <ModelDiagnosticsDialog
        open={true}
        onOpenChange={vi.fn()}
        activeModelVersion="_MedP_AI_V2.0"
      />
    );

    // Switch to Comparison Matrix tab
    const compTab = screen.getByRole("tab", { name: /3-Model Comparison/i });
    fireEvent.click(compTab);

    expect(screen.getByText(/Head-to-Head 3-Model Architectural Comparison Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Red-Flag Interceptors/i)).toBeInTheDocument();
  });
});

describe("Supported Diseases Directory & Direct Hospital Routing", () => {
  it("renders all 56 canonical conditions in a dedicated scrollable container with General Medicine option", () => {
    const handleSelectCondition = vi.fn();

    render(
      <SupportedDiseasesDirectory
        onSelectCondition={handleSelectCondition}
      />
    );

    // Hero card for General Medicine
    expect(screen.getByText(/Not sure what disease you have\? Choose General Medicine/i)).toBeInTheDocument();
    expect(screen.getByText(/ICD-10: Z00.00/i)).toBeInTheDocument();

    // Scrollable container indicator
    expect(screen.getByText(/Scroll inside this panel to explore all/i)).toBeInTheDocument();

    // Total condition count counter
    expect(screen.getAllByText(/56/i).length).toBeGreaterThan(0);

    // Click General Medicine option
    const genMedBtn = screen.getByText(/Route to General Hospitals/i);
    fireEvent.click(genMedBtn);
    expect(handleSelectCondition).toHaveBeenCalledWith(GENERAL_MEDICINE_OPTION);
  });

  it("filters conditions dynamically by search query and urgency", async () => {
    const handleSelectCondition = vi.fn();

    render(
      <SupportedDiseasesDirectory
        onSelectCondition={handleSelectCondition}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search diseases, ICD-10 code/i);
    fireEvent.change(searchInput, { target: { value: "Allergic Conjunctivitis" } });

    // Allergic Conjunctivitis card should be visible
    expect(screen.getByText(/Allergic Conjunctivitis/i)).toBeInTheDocument();
    expect(screen.getByText(/H10.1/i)).toBeInTheDocument();

    // Click on condition card
    const conditionCard = screen.getByText(/Allergic Conjunctivitis/i).closest("div");
    if (conditionCard) fireEvent.click(conditionCard);
    expect(handleSelectCondition).toHaveBeenCalledWith(
      expect.objectContaining({ id: "allergic_conjunctivitis", icd10: "H10.1" })
    );
  });
});

describe("DirectDiseaseRoutingState (Dedicated AI Loading Screen)", () => {
  it("renders radar scanner, telemetry, ICD-10 anchor, and specialty", () => {
    const mockCondition = CANONICAL_CONDITIONS.find((c) => c.id === "cataract") || CANONICAL_CONDITIONS[0];
    const handleCancel = vi.fn();

    render(
      <DirectDiseaseRoutingState
        condition={mockCondition}
        locationLabel="Surat, Gujarat"
        onCancel={handleCancel}
      />
    );

    // Condition header
    expect(screen.getByText(/Routing for/i)).toBeInTheDocument();
    expect(screen.getByText(mockCondition.name)).toBeInTheDocument();
    expect(screen.getByText(mockCondition.icd10)).toBeInTheDocument();

    // Specialty & typical intervention
    expect(screen.getByText(mockCondition.specialization)).toBeInTheDocument();
    expect(screen.getByText(mockCondition.procedure)).toBeInTheDocument();

    // Radar telemetry
    expect(screen.getByText(/Facilities Scanned/i)).toBeInTheDocument();
    expect(screen.getByText(/Candidates Matched/i)).toBeInTheDocument();

    // Cancel button
    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });
});

describe("Multilingual Translations: Chat Clickable Cards, Direct Routing, and Nerd Hub", () => {
  it("translates clickable symptom cards into Hindi and Gujarati, with safe fallbacks", () => {
    // English
    expect(localizeSymptomOption("Chest pain", "en")).toBe("Chest pain");
    expect(localizeSymptomOption("Shortness of breath", "en")).toBe("Shortness of breath");

    // Hindi
    expect(localizeSymptomOption("Chest pain", "hi")).toBe("सीने में दर्द");
    expect(localizeSymptomOption("Shortness of breath", "hi")).toBe("सांस लेने में कठिनाई / सांस फूलना");
    expect(localizeSymptomOption("Fever", "hi")).toBe("बुखार");
    expect(localizeSymptomOption("Cough", "hi")).toBe("खांसी");

    // Gujarati
    expect(localizeSymptomOption("Chest pain", "gu")).toBe("છાતીમાં દુખાવો");
    expect(localizeSymptomOption("Shortness of breath", "gu")).toBe("શ્વાસ લેવામાં તકલીફ");
    expect(localizeSymptomOption("Fever", "gu")).toBe("તાવ");
    expect(localizeSymptomOption("Cough", "gu")).toBe("ઉધરસ");

    // Fallback for unmapped option
    expect(localizeSymptomOption("Unknown Rare Symptom X", "hi")).toBe("Unknown Rare Symptom X");
  });

  it("renders Header in Hindi and Gujarati with translated status badges", () => {
    // Hindi Header
    const { unmount: unmountHi } = render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          onOpenModelDiagnostics={vi.fn()}
          onOpenDiseasesDirectory={vi.fn()}
          activeModelId="_MedP_AI_V2.0"
          language="hi"
        />
      </BrowserRouter>
    );
    expect(screen.getByText(/फ़ायरबेस कनेक्टेड/i)).toBeInTheDocument();
    expect(screen.getByText(/सभी मॉडल: 3\/3 ऑनलाइन/i)).toBeInTheDocument();
    expect(screen.getByText(/56 रोग/i)).toBeInTheDocument();
    unmountHi();

    // Gujarati Header
    render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          onOpenModelDiagnostics={vi.fn()}
          onOpenDiseasesDirectory={vi.fn()}
          activeModelId="_MedP_AI_V2.0"
          language="gu"
        />
      </BrowserRouter>
    );
    expect(screen.getByText(/ફાયરબેઝ કનેક્ટેડ/i)).toBeInTheDocument();
    expect(screen.getByText(/બધા મોડેલ્સ: 3\/3 ઑનલાઇન/i)).toBeInTheDocument();
    expect(screen.getByText(/56 રોગો/i)).toBeInTheDocument();
  });

  it("renders Supported Diseases Directory in Hindi and Gujarati with localized UI and condition names", () => {
    // Hindi Directory
    const { unmount: unmountHi } = render(
      <SupportedDiseasesDirectory
        language="hi"
        onSelectCondition={vi.fn()}
      />
    );
    expect(screen.getByText(/समर्थित रोग और सीधा अस्पताल रूटिंग/i)).toBeInTheDocument();
    expect(screen.getAllByText(/सामान्य चिकित्सा/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/सामान्य अस्पतालों.*रूट करें/i)).toBeInTheDocument();
    unmountHi();

    // Gujarati Directory
    render(
      <SupportedDiseasesDirectory
        language="gu"
        onSelectCondition={vi.fn()}
      />
    );
    expect(screen.getByText(/સમર્થિત રોગો અને સીધું હોસ્પિટલ રૂટિંગ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/જનરલ મેડિસિન/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/સામાન્ય હોસ્પિટલો.*રૂટ કરો/i)).toBeInTheDocument();
  });

  it("renders Direct Routing Loading Screen in Hindi and Gujarati with localized steps and telemetry", () => {
    const mockCondition = CANONICAL_CONDITIONS[0];

    // Hindi Direct Routing State
    const { unmount: unmountHi } = render(
      <DirectDiseaseRoutingState
        condition={mockCondition}
        language="hi"
        locationLabel="Delhi"
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/सीधा क्लिनिकल मार्ग/i)).toBeInTheDocument();
    expect(screen.getByText(/लाइव भू-स्थानिक इंजन/i)).toBeInTheDocument();
    expect(screen.getByText(/स्कैन किए गए नेटवर्क नोड्स/i)).toBeInTheDocument();
    unmountHi();

    // Gujarati Direct Routing State
    render(
      <DirectDiseaseRoutingState
        condition={mockCondition}
        language="gu"
        locationLabel="Surat"
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/સીધો ક્લિનિકલ માર્ગ/i)).toBeInTheDocument();
    expect(screen.getByText(/લાઇવ જીઓસ્પેશિયલ એન્જિન/i)).toBeInTheDocument();
    expect(screen.getByText(/સ્કેન કરેલ નેટવર્ક નોડ્સ/i)).toBeInTheDocument();
  });

  it("renders Model Diagnostics Nerd Hub in Hindi and Gujarati while preserving technical model IDs", () => {
    // Hindi Nerd Hub
    const { unmount: unmountHi } = render(
      <ModelDiagnosticsDialog
        open={true}
        onOpenChange={vi.fn()}
        activeModelVersion="_MedP_AI_V2.0"
        language="hi"
      />
    );
    // Preserved model technical identifiers
    expect(screen.getAllByText(/_MedP_AI_V2.0/i).length).toBeGreaterThan(0);
    // Translated tabs
    expect(screen.getByRole("tab", { name: /प्रशिक्षण डेटासेट/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /अस्पताल रजिस्ट्री/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /3-मॉडल तुलना/i })).toBeInTheDocument();
    unmountHi();

    // Gujarati Nerd Hub
    render(
      <ModelDiagnosticsDialog
        open={true}
        onOpenChange={vi.fn()}
        activeModelVersion="_MedP_AI_V2.0"
        language="gu"
      />
    );
    // Preserved model technical identifiers
    expect(screen.getAllByText(/_MedP_AI_V2.0/i).length).toBeGreaterThan(0);
    // Translated tabs
    expect(screen.getByRole("tab", { name: /ટ્રેનિંગ ડેટાસેટ્સ/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /હોસ્પિટલ રજિસ્ટ્રી/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /3-મોડેલ સરખામણી/i })).toBeInTheDocument();
  });
});

