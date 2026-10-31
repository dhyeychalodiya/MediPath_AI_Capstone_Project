import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Header } from "@/components/medipath/Header";
import { DownloadDesktopDialog } from "@/components/medipath/DownloadDesktopDialog";
import { AuthProvider } from "@/context/AuthContext";

describe("Header Download Desktop Button & Dialog Integration", () => {
  beforeEach(() => {
    // Reset electronAPI
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Download App button on the website when not in Electron", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );

    const downloadBtn = screen.getByRole("button", { name: /Download App/i });
    expect(downloadBtn).toBeInTheDocument();

    // Verify Desktop Edition pill is NOT present on website
    expect(screen.queryByTestId("desktop-status-pill")).not.toBeInTheDocument();
  });

  it("opens the DownloadDesktopDialog when the Download App button is clicked", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );

    const downloadBtn = screen.getByRole("button", { name: /Download App/i });
    fireEvent.click(downloadBtn);

    // Verify dialog title is displayed
    expect(screen.getByText(/Download MediPath AI for Windows/i)).toBeInTheDocument();

    // Verify download actions exist
    expect(screen.getByRole("button", { name: /Download for Windows/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download Portable/i })).toBeInTheDocument();

    // Verify offline capability highlights
    expect(screen.getAllByText(/100% Offline Clinical Mode/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/924 Pre-Cached Hospitals/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Patient Privacy/i)).toBeInTheDocument();
  });

  it("hides the download button and displays Desktop Edition badge when running in Electron desktop app", () => {
    // Simulate desktop Electron environment
    (window as unknown as { electronAPI: { isDesktop: boolean; platform: string; appVersion: string } }).electronAPI = {
      isDesktop: true,
      platform: "win32",
      appVersion: "2.0.0",
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );

    // Download button MUST NOT be rendered in desktop app
    expect(screen.queryByRole("button", { name: /Download App/i })).not.toBeInTheDocument();

    // Desktop status pill MUST be displayed
    const desktopPill = screen.getByTestId("desktop-status-pill");
    expect(desktopPill).toBeInTheDocument();
    expect(desktopPill).toHaveTextContent(/Desktop Edition/i);
  });
});
