import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/medipath/Header";
import { HelpInstructionsDialog } from "@/components/medipath/HelpInstructionsDialog";
import { BrowserRouter } from "react-router-dom";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("Header Help & Instructions Integration", () => {
  it("renders the Help / Instructions button in the Header", () => {
    const handleOpenHelp = vi.fn();

    render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          language="en"
          onOpenHelpInstructions={handleOpenHelp}
        />
      </BrowserRouter>
    );

    const helpBtn = screen.getByTestId("help-instructions-btn");
    expect(helpBtn).toBeInTheDocument();
    expect(helpBtn).toHaveAttribute("title", "How to Use MediPath AI - User Guide & Instructions");
    expect(screen.getByText(/How to Use/i)).toBeInTheDocument();

    fireEvent.click(helpBtn);
    expect(handleOpenHelp).toHaveBeenCalledTimes(1);
  });

  it("renders the Help button in Hindi and Gujarati", () => {
    const { unmount } = render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          language="hi"
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/उपयोग विधि/i)).toBeInTheDocument();
    unmount();

    render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          language="gu"
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/કેવી રીતે વાપરવું/i)).toBeInTheDocument();
  });

  it("opens self-contained HelpInstructionsDialog when clicked if no external handler provided", () => {
    render(
      <BrowserRouter>
        <Header
          modelStatus="online"
          language="en"
        />
      </BrowserRouter>
    );

    const helpBtn = screen.getByTestId("help-instructions-btn");
    fireEvent.click(helpBtn);

    // Dialog title should appear
    expect(screen.getByText("How to Use MediPath AI")).toBeInTheDocument();
    expect(screen.getByText(/MediPath AI works in 5 simple, transparent steps/i)).toBeInTheDocument();
  });
});

describe("HelpInstructionsDialog Content & Tabs", () => {
  it("renders all 5 tabs and allows smooth tab switching", () => {
    const handleOpenChange = vi.fn();
    const handleSampleSearch = vi.fn();

    render(
      <HelpInstructionsDialog
        open={true}
        onOpenChange={handleOpenChange}
        language="en"
        onStartSampleSearch={handleSampleSearch}
      />
    );

    expect(screen.getByText("How to Use MediPath AI")).toBeInTheDocument();

    // Tab 1: Quick Start (default)
    expect(screen.getByText(/Describe or Speak Symptoms/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Clinical Triage/i)).toBeInTheDocument();
    expect(screen.getByText(/4-Tier Hospital Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost Breakdown & Filters/i)).toBeInTheDocument();

    // Switch to Tab 2: Doctor AI
    const doctorAiTab = screen.getByRole("tab", { name: /Doctor AI/i });
    fireEvent.click(doctorAiTab);
    expect(screen.getByText(/How Dr. MediPath Clinical Triage Operates/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Red Flag Detection/i)).toBeInTheDocument();

    // Switch to Tab 3: 4-Tier Care
    const hospitalsTab = screen.getByRole("tab", { name: /4-Tier Care/i });
    fireEvent.click(hospitalsTab);
    expect(screen.getByText(/3 Verified Data Sources & 4-Tier Clinical Matching/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Places Live/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenStreetMap/i)).toBeInTheDocument();

    // Switch to Tab 4: Costs & Filters
    const costsTab = screen.getByRole("tab", { name: /Costs & Filters/i });
    fireEvent.click(costsTab);
    expect(screen.getByText(/Cost Transparency & Smart Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor OPD Consultation/i)).toBeInTheDocument();

    // Switch to Tab 5: 56 Diseases & FAQ
    const directTab = screen.getByRole("tab", { name: /56 Diseases & FAQ/i });
    fireEvent.click(directTab);
    expect(screen.getByText(/56 Canonical Diseases Directory & Emergency Helpline/i)).toBeInTheDocument();
    expect(screen.getByText(/National Emergency Helpline Numbers/i)).toBeInTheDocument();
    expect(screen.getByText("112")).toBeInTheDocument();
    expect(screen.getByText("108")).toBeInTheDocument();
  });

  it("handles clicking a sample search inquiry", () => {
    const handleOpenChange = vi.fn();
    const handleSampleSearch = vi.fn();

    render(
      <HelpInstructionsDialog
        open={true}
        onOpenChange={handleOpenChange}
        language="en"
        onStartSampleSearch={handleSampleSearch}
      />
    );

    const sampleBtn = screen.getByText(/Chest pain, shortness of breath, left arm radiation/i);
    fireEvent.click(sampleBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(handleSampleSearch).toHaveBeenCalledWith("Chest pain, shortness of breath, left arm radiation");
  });

  it("closes modal when 'Got It, Let's Start' button is clicked", () => {
    const handleOpenChange = vi.fn();

    render(
      <HelpInstructionsDialog
        open={true}
        onOpenChange={handleOpenChange}
        language="en"
      />
    );

    const gotItBtn = screen.getByRole("button", { name: /Got It, Let's Start/i });
    fireEvent.click(gotItBtn);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
