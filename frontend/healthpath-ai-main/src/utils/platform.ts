/**
 * Platform Detection & Desktop Environment Utilities
 *
 * Distinguishes between:
 * 1. Web Browser (Website mode): Shows download button for PC setup
 * 2. Electron Desktop App (Setup / Direct mode): Hides download button, exposes native offline mode
 */

export interface ElectronAPI {
  platform: string;
  isDesktop: boolean;
  appVersion: string;
  closeApp?: () => void;
  minimizeApp?: () => void;
  maximizeApp?: () => void;
  isMaximized?: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

/**
 * Returns true if running inside the Electron Desktop Application (either installed or portable direct)
 */
export function isDesktopApp(): boolean {
  if (typeof window === "undefined") return false;
  
  if (window.electronAPI?.isDesktop === true) {
    return true;
  }

  if (typeof navigator !== "undefined" && navigator.userAgent) {
    if (/electron/i.test(navigator.userAgent)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns current network online status
 */
export function isNetworkOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

/**
 * Resolves standard download endpoints for the Windows Desktop App
 */
export function getDesktopDownloadEndpoints(): { setupUrl: string; directUrl: string; infoUrl: string } {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  return {
    setupUrl: `${base}/download/desktop-setup`,
    directUrl: `${base}/download/desktop-direct`,
    infoUrl: `${base}/download/info`,
  };
}
