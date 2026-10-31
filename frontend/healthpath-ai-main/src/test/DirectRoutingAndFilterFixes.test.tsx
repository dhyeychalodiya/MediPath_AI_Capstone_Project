import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResultsView } from "@/components/medipath/ResultsView";
import { defaultFilters, SearchOutput, EnrichedHospital } from "@/services/hospitalService";
import { SearchHistoryDialog } from "@/components/medipath/SearchHistoryDialog";
import { saveSearchHistory, getSearchHistory, clearSearchHistory, SearchHistoryItem } from "@/services/searchHistoryService";
import { DirectDiseaseRoutingState } from "@/components/medipath/DirectDiseaseRoutingState";
import { CANONICAL_CONDITIONS } from "@/data/canonicalConditionsData";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-direct-history", name: "Dhyey", email: "dhyey@example.com" },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockHospitals: EnrichedHospital[] = [
  {
    id: "hosp-1",
    name: "Apollo Multispeciality Hospital",
    city: "Surat",
    state: "Gujarat",
    lat: 21.1702,
    lng: 72.8311,
    rating: 4.8,
    reviews: 240,
    nabh: true,
    tier: "Premium",
    specialties: ["Cardiology", "Pulmonology", "Critical Care", "Emergency Medicine"],
    procedures: ["Angioplasty", "Cardiac Bypass", "CT Scan"],
    address: "Ring Road, Surat",
    emergencyCare: true,
    status: "open",
    source: "Verified Registry",
    distanceKm: 4.2,
    costMin: 45000,
    costMax: 120000,
    stayDays: 3,
    perDay: 5000,
    matchScore: 95,
    matchTier: 1,
    matchCategory: "primary_specialist",
    matchedSpecialties: ["Pulmonology"],
    matchedProcedures: ["Chest Radiography"],
    matchReason: "Primary specialization match: Pulmonology",
  },
  {
    id: "hosp-2",
    name: "Civil General Hospital",
    city: "Surat",
    state: "Gujarat",
    lat: 21.1802,
    lng: 72.8211,
    rating: 3.6,
    reviews: 580,
    nabh: false,
    tier: "Budget",
    specialties: ["General Medicine", "General Surgery", "Pulmonology"],
    procedures: ["Ultrasound", "X-Ray"],
    address: "Majura Gate, Surat",
    emergencyCare: true,
    status: "open",
    source: "Verified Registry",
    distanceKm: 8.5,
    costMin: 1200,
    costMax: 5000,
    stayDays: 1,
    perDay: 800,
    matchScore: 82,
    matchTier: 1,
    matchCategory: "primary_specialist",
    matchedSpecialties: ["Pulmonology"],
    matchedProcedures: [],
    matchReason: "Primary specialization match: Pulmonology",
  },
  {
    id: "hosp-3",
    name: "Sunshine Care Clinic",
    city: "Surat",
    state: "Gujarat",
    lat: 21.1902,
    lng: 72.8411,
    rating: 4.2,
    reviews: 85,
    nabh: false,
    tier: "Mid-tier",
    specialties: ["Dermatology", "General Medicine"],
    procedures: ["Skin OPD"],
    address: "Adajan, Surat",
    emergencyCare: false,
    status: "closed",
    source: "Google Places",
    distanceKm: 14.0,
    costMin: 15000,
    costMax: 35000,
    stayDays: 0,
    perDay: 0,
    matchScore: 70,
    matchTier: 3,
    matchCategory: "general_care_fallback",
    matchedSpecialties: ["General Medicine"],
    matchedProcedures: [],
    matchReason: "General care fallback",
  },
];

const mockResult: SearchOutput = {
  query: "Asthma",
  condition: {
    condition: "Asthma",
    icd10: "J45.9",
    specialty: "Pulmonology",
    procedure: "Pulmonary Function Testing & Inhaler Therapy",
    confidence: 100,
    baseConfidence: 100,
    lowConfidence: false,
    modelProbability: 1.0,
    threshold: 0.8,
    passesThreshold: true,
    decisionSource: "direct_routing",
    base: { min: 1000, max: 2500, stayDays: 0, perDay: 0, diagnostics: 2500, medicines: 2500, contingencyPct: 8 },
  },
  hospitals: mockHospitals,
  totalMatching: 3,
  predictions: [],
  followUpQuestions: [],
  dataSource: "Verified Registry",
};

describe("Direct Routing & Hospital Filter Section Fix Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Test 1: Direct Routing displays 100% Direct Selection and Direct Routing badge", () => {
    render(
      <ResultsView
        result={mockResult}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Direct routing label and badge
    expect(screen.getByText("Direct Routing Selection")).toBeInTheDocument();
    expect(screen.getByText("100% Direct Selection")).toBeInTheDocument();
    expect(screen.getByText("Direct Routing")).toBeInTheDocument();
    expect(screen.getByText("Asthma")).toBeInTheDocument();
    expect(screen.getByText("Pulmonology")).toBeInTheDocument();
  });

  it("Test 2: Hospital Name Search filters displayed hospitals in real time", () => {
    const { rerender } = render(
      <ResultsView
        result={mockResult}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Initially all 3 hospitals visible in recommendation cards
    expect(screen.getByRole("heading", { level: 3, name: "Apollo Multispeciality Hospital" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Civil General Hospital" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Sunshine Care Clinic" })).toBeInTheDocument();

    // Filter by name "Apollo"
    rerender(
      <ResultsView
        result={mockResult}
        filters={{ ...defaultFilters, hospitalName: "Apollo" }}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    expect(screen.getByRole("heading", { level: 3, name: "Apollo Multispeciality Hospital" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Civil General Hospital" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Sunshine Care Clinic" })).not.toBeInTheDocument();
  });

  it("Test 3: NABH Accredited Only filter shows only accredited hospitals", () => {
    const { rerender } = render(
      <ResultsView
        result={mockResult}
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Filter by NABH only
    rerender(
      <ResultsView
        result={mockResult}
        filters={{ ...defaultFilters, nabhOnly: true }}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Only Apollo is NABH accredited
    expect(screen.getByRole("heading", { level: 3, name: "Apollo Multispeciality Hospital" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Civil General Hospital" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Sunshine Care Clinic" })).not.toBeInTheDocument();
  });

  it("Test 4: Hospital Tier filter accurately isolates selected tier", () => {
    const { rerender } = render(
      <ResultsView
        result={mockResult}
        filters={{ ...defaultFilters, tiers: ["Budget"] }}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Only Civil Hospital is Budget tier
    expect(screen.getByRole("heading", { level: 3, name: "Civil General Hospital" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Apollo Multispeciality Hospital" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Sunshine Care Clinic" })).not.toBeInTheDocument();
  });

  it("Test 5: Min Rating filter excludes lower-rated hospitals", () => {
    const { rerender } = render(
      <ResultsView
        result={mockResult}
        filters={{ ...defaultFilters, minRating: 4.5 }}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Only Apollo (4.8★) has rating >= 4.5
    expect(screen.getByRole("heading", { level: 3, name: "Apollo Multispeciality Hospital" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Civil General Hospital" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Sunshine Care Clinic" })).not.toBeInTheDocument();
  });

  it("Test 6: Max Budget filter limits hospitals to affordable threshold", () => {
    const { rerender } = render(
      <ResultsView
        result={mockResult}
        filters={{ ...defaultFilters, maxBudget: 5000 }}
        onFiltersChange={vi.fn()}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    // Only Civil Hospital (costMin ₹1,200) is <= ₹5,000
    expect(screen.getByRole("heading", { level: 3, name: "Civil General Hospital" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Apollo Multispeciality Hospital" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Sunshine Care Clinic" })).not.toBeInTheDocument();
  });

  it("Test 7: Empty state appears when no hospitals match filters with Reset button", () => {
    const handleFiltersChange = vi.fn();

    render(
      <ResultsView
        result={mockResult}
        filters={{ ...defaultFilters, hospitalName: "NonExistentHospitalXYZ" }}
        onFiltersChange={handleFiltersChange}
        locationLabel="Surat, Gujarat"
        language="en"
      />
    );

    expect(screen.getByText(/No hospitals found matching your criteria/i)).toBeInTheDocument();
    const resetBtn = screen.getAllByRole("button", { name: /Reset All Filters/i });
    expect(resetBtn.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(resetBtn[0]);
    expect(handleFiltersChange).toHaveBeenCalledWith(defaultFilters);
  });

  it("Test 8: Saves direct disease routing history distinctly from symptom triage history", () => {
    const userId = "test-user-direct-history";
    clearSearchHistory(userId);

    // Save direct disease search
    const directItem = saveSearchHistory(userId, {
      query: "Asthma",
      condition: "Asthma",
      specialty: "Pulmonology",
      location: "Surat, Gujarat",
      hospitalCount: 12,
      modelVersion: "_MedP_AI_V2.0",
      isDirectRouting: true,
      directRouting: true,
      icd10: "J45.909",
      procedure: "Pulmonary Function Testing (PFT)",
      urgency: "urgent",
      decisionSource: "direct_routing",
      source: "direct_routing",
    });

    expect(directItem).not.toBeNull();
    expect(directItem?.isDirectRouting).toBe(true);
    expect(directItem?.directRouting).toBe(true);
    expect(directItem?.decisionSource).toBe("direct_routing");
    expect(directItem?.source).toBe("direct_routing");

    // Save standard symptom triage history
    const symptomItem = saveSearchHistory(userId, {
      query: "chest pain and shortness of breath",
      condition: "Acute Coronary Syndrome",
      specialty: "Cardiology",
      location: "Surat, Gujarat",
      hospitalCount: 8,
      modelVersion: "_MedP_AI_V2.0",
    });

    expect(symptomItem).not.toBeNull();
    expect(symptomItem?.isDirectRouting).toBe(false);
    expect(symptomItem?.directRouting).toBe(false);
    expect(symptomItem?.source).toBe("symptom_triage");

    const history = getSearchHistory(userId);
    expect(history.length).toBe(2);
    expect(history.find((h) => h.query === "Asthma")?.isDirectRouting).toBe(true);
    expect(history.find((h) => h.query.includes("chest pain"))?.isDirectRouting).toBe(false);
  });

  it("Test 9: SearchHistoryDialog displays Direct Hospital Route badge and invokes onSelectHistoryItem", () => {
    const handleSelectHistoryItem = vi.fn();
    const handleSelectQuery = vi.fn();

    render(
      <SearchHistoryDialog
        open={true}
        onOpenChange={vi.fn()}
        onSelectQuery={handleSelectQuery}
        onSelectHistoryItem={handleSelectHistoryItem}
        language="en"
      />
    );

    // Should display Direct Hospital Route badge for Asthma
    expect(screen.getByText("Direct Hospital Route")).toBeInTheDocument();

    // Clicking Asthma should invoke onSelectHistoryItem with the full SearchHistoryItem (bypassing model)
    const asthmaItemText = screen.getByText("“Asthma”");
    fireEvent.click(asthmaItemText);

    expect(handleSelectHistoryItem).toHaveBeenCalled();
    const calledWithItem = handleSelectHistoryItem.mock.calls[0][0];
    expect(calledWithItem.query).toBe("Asthma");
    expect(calledWithItem.isDirectRouting).toBe(true);
  });

  it("Test 10: Simplified DirectDiseaseRoutingState renders clean, normal loading view without radar clutter", () => {
    const condition = CANONICAL_CONDITIONS.find((c) => c.name === "Asthma") || CANONICAL_CONDITIONS[0];
    const handleCancel = vi.fn();

    const { container } = render(
      <DirectDiseaseRoutingState
        condition={condition}
        locationLabel="Surat, Gujarat"
        onCancel={handleCancel}
        language="en"
      />
    );

    // Displays clean condition heading, ICD-10, specialty, and procedure
    expect(screen.getByText(/Routing for/i)).toBeInTheDocument();
    expect(screen.getByText(condition.name)).toBeInTheDocument();
    expect(screen.getByText(condition.icd10)).toBeInTheDocument();
    expect(screen.getByText(condition.specialization)).toBeInTheDocument();
    if (condition.procedure) {
      expect(screen.getByText(new RegExp(condition.procedure, "i"))).toBeInTheDocument();
    }

    // Displays clean status indicators
    expect(screen.getByText(/Facilities Scanned/i)).toBeInTheDocument();
    expect(screen.getByText(/Candidates Matched/i)).toBeInTheDocument();

    // Verify there are no radar concentric circle ping elements
    expect(container.querySelectorAll(".animate-ping").length).toBe(0);

    // Cancel button works
    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });
});
