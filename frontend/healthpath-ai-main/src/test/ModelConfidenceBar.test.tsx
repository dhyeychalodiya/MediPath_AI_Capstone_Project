import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ModelConfidenceBar } from "../components/medipath/ModelConfidenceBar";

describe("ModelConfidenceBar Component", () => {
  it("renders with a valid model confidence score", () => {
    render(<ModelConfidenceBar confidence={78} isUpdating={false} language="en" />);

    // Score percentage displayed
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("Model Confidence")).toBeInTheDocument();

    // Accessible progressbar attributes
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "78");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("displays updating state while a new consultation response is pending", () => {
    render(<ModelConfidenceBar confidence={78} isUpdating={true} language="en" />);

    expect(screen.getByText("Updating assessment...")).toBeInTheDocument();
    // Previous valid score is preserved
    expect(screen.getByText(/\(78%\)/)).toBeInTheDocument();
  });

  it("displays safe deferral / unavailable state when score is null", () => {
    render(<ModelConfidenceBar confidence={null} isUpdating={false} language="en" />);

    expect(screen.getByText(/Score unavailable/i)).toBeInTheDocument();
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
  });

  it("updates score accurately when a new model result arrives", () => {
    const { rerender } = render(<ModelConfidenceBar confidence={64} isUpdating={false} language="en" />);
    expect(screen.getByText("64%")).toBeInTheDocument();
    expect(screen.getByText("Narrowing Down")).toBeInTheDocument();

    // Additional symptoms submitted -> Model updates score to 91%
    rerender(<ModelConfidenceBar confidence={91} isUpdating={false} language="en" />);
    expect(screen.getByText("91%")).toBeInTheDocument();
    expect(screen.getByText("High Alignment")).toBeInTheDocument();
  });

  it("displays localized labels when language is Hindi", () => {
    render(<ModelConfidenceBar confidence={85} isUpdating={false} language="hi" />);

    expect(screen.getByText("मॉडल विश्वसनीयता")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("displays localized labels when language is Gujarati", () => {
    render(<ModelConfidenceBar confidence={85} isUpdating={false} language="gu" />);

    expect(screen.getByText("મોડેલ આત્મવિશ્વાસ")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("includes honest medical explanatory caption", () => {
    render(<ModelConfidenceBar confidence={72} isUpdating={false} language="en" />);

    expect(
      screen.getByText(/Model 2.0 statistical alignment across 56 primary-care classes/i)
    ).toBeInTheDocument();
  });
});
