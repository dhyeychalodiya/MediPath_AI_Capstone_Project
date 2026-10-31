import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, LogIn, History, Cpu, Database, ChevronDown, BookOpen, HelpCircle, Download, Laptop } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ModelStatus } from "@/services/hospitalService";
import { t } from "@/lib/i18n";
import { HelpInstructionsDialog } from "./HelpInstructionsDialog";
import { DownloadDesktopDialog } from "./DownloadDesktopDialog";
import { isDesktopApp, isNetworkOnline } from "@/utils/platform";

export interface HeaderProps {
  onLogoClick?: () => void;
  modelStatus?: ModelStatus;
  language?: string;
  onOpenHistory?: () => void;
  historyCount?: number;
  onOpenModelDiagnostics?: (initialModelId?: string) => void;
  onOpenDiseasesDirectory?: () => void;
  onOpenHelpInstructions?: () => void;
  activeModelId?: string;
}

export const Header = ({
  onLogoClick,
  modelStatus = "checking",
  language = "en",
  onOpenHistory,
  historyCount = 0,
  onOpenModelDiagnostics,
  onOpenDiseasesDirectory,
  onOpenHelpInstructions,
  activeModelId = "_MedP_AI_V2.0",
}: HeaderProps) => {
  const { user } = useAuth();
  const [internalHelpOpen, setInternalHelpOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setIsDesktop(isDesktopApp());
    setOnline(isNetworkOnline());
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isOnline = modelStatus === "online";
  const firebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

  const handleHelpClick = () => {
    if (onOpenHelpInstructions) {
      onOpenHelpInstructions();
    } else {
      setInternalHelpOpen(true);
    }
  };

  return (
    <header className="w-full border-b border-border/60 bg-card/85 backdrop-blur-md sticky top-0 z-30">
      <div className="container flex items-center justify-between py-2.5 gap-3">
        {/* Brand / Logo */}
        <button onClick={onLogoClick} className="flex items-center gap-2.5 group shrink-0 text-left">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow">
            <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-none text-base sm:text-lg">
              MediPath <span className="text-primary">AI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              {t("tagline", language)}
            </p>
          </div>
        </button>

        {/* Central Status Indicators: Firebase & All Models */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Firebase Online Status */}
          <div
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-secondary/80 border border-border text-[11px] text-muted-foreground font-medium"
            title="Firebase Firestore & Authentication backend connection"
          >
            <Database className="w-3 h-3 text-muted-foreground" />
            <span
              className={`w-2 h-2 rounded-full ${
                firebaseConfigured ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-destructive"
              }`}
            />
            <span className="hidden xs:inline">
              {firebaseConfigured ? t("firebase_connected", language) : t("firebase_disconnected", language)}
            </span>
            <span className="xs:hidden">Firebase</span>
          </div>

          {/* All Models Status Clickable Button (Triggers Nerd Specs Modal) */}
          <button
            onClick={() => onOpenModelDiagnostics?.(activeModelId)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-[11px] font-semibold transition-all cursor-pointer group shadow-xs"
            title="Click to inspect all 3 AI models, dataset provenance, and nerd architecture specs"
          >
            <Cpu className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-warning animate-pulse"
                }`}
              />
              <span>{t("all_models_online", language)}</span>
            </span>
            <span className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-background/80 text-muted-foreground border border-border/60">
              {activeModelId}
            </span>
            <ChevronDown className="w-3 h-3 text-primary/70 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Supported Diseases Quick Directory Trigger */}
          {onOpenDiseasesDirectory && (
            <button
              onClick={onOpenDiseasesDirectory}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground text-[11px] font-medium transition-colors cursor-pointer"
              title="Browse all 56 supported diseases, general medicine, and direct hospital routing"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>{t("diseases_56_btn", language)}</span>
            </button>
          )}

          {/* Help & Instructions Button */}
          <button
            onClick={handleHelpClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/40 text-foreground text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
            title="How to Use MediPath AI - User Guide & Instructions"
            data-testid="help-instructions-btn"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">{t("help_instructions_btn", language)}</span>
            <span className="sm:hidden">{t("help_btn_short", language)}</span>
          </button>

          {/* Desktop App Status (Desktop Mode) OR Download App Button (Website Mode) */}
          {isDesktop ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-semibold shadow-xs"
              title="Desktop Edition: Model 2.0 ML and 924 Verified Hospital Registry run 100% locally offline."
              data-testid="desktop-status-pill"
            >
              <Laptop className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">{t("desktop_edition", language)}</span>
              <span
                className={`w-2 h-2 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
              />
              <span className="text-[10px] hidden xs:inline font-mono">
                {online ? "Online" : t("offline_ready", language)}
              </span>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setDownloadModalOpen(true)}
              className="gap-1.5 text-xs h-8 px-2.5 sm:px-3 font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer shadow-xs"
              id="header-download-desktop-btn"
              title="Download MediPath AI for Windows (Offline clinical triage & 924 Verified Hospitals)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("download_desktop_app", language)}</span>
              <span className="sm:hidden">App</span>
              <span className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-primary-foreground/20 font-bold uppercase tracking-wider">
                PC
              </span>
            </Button>
          )}

          {/* User Logged In: History Button + Profile Menu */}
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenHistory}
                className="gap-1.5 text-xs h-8 cursor-pointer border-border hover:border-primary/40 shadow-xs px-2.5"
                title="Saved Search History"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{t("history_btn", language)}</span>
                {historyCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {historyCount}
                  </span>
                )}
              </Button>
              <ProfileMenu onOpenHistory={onOpenHistory} />
            </div>
          ) : (
            /* User Not Logged In (Guest): Sign In / Login Button */
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors cursor-pointer ml-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t("login", language)}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Self-contained Help Dialog if not controlled by parent */}
      {!onOpenHelpInstructions && (
        <HelpInstructionsDialog
          open={internalHelpOpen}
          onOpenChange={setInternalHelpOpen}
          language={language}
        />
      )}

      {/* Download Desktop App Dialog (Website Only) */}
      {!isDesktop && (
        <DownloadDesktopDialog
          open={downloadModalOpen}
          onOpenChange={setDownloadModalOpen}
          language={language}
        />
      )}
    </header>
  );
};