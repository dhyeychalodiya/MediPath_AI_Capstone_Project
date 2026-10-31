import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Laptop,
  WifiOff,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  HardDrive,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getDesktopDownloadEndpoints } from "@/utils/platform";
import { t } from "@/lib/i18n";

interface DownloadDesktopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: string;
}

interface BinaryInfo {
  version: string;
  sizeFormatted: string;
  setupAvailable: boolean;
  portableAvailable: boolean;
}

export const DownloadDesktopDialog: React.FC<DownloadDesktopDialogProps> = ({
  open,
  onOpenChange,
  language = "en",
}) => {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);
  const [binaryInfo, setBinaryInfo] = useState<BinaryInfo>({
    version: "2.0.0",
    sizeFormatted: "114.5 MB",
    setupAvailable: true,
    portableAvailable: true,
  });

  const { setupUrl, directUrl, infoUrl } = getDesktopDownloadEndpoints();

  useEffect(() => {
    if (open) {
      setDownloadStarted(null);
      // Fetch dynamic size and version info
      fetch(infoUrl)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success) {
            setBinaryInfo({
              version: data.version || "2.0.0",
              sizeFormatted: data.setup?.sizeFormatted || "114.5 MB",
              setupAvailable: Boolean(data.setup?.available),
              portableAvailable: Boolean(data.portable?.available),
            });
          }
        })
        .catch(() => {
          // Graceful fallback to static estimates
        });
    }
  }, [open, infoUrl]);

  const handleDownload = (url: string, type: "setup" | "portable") => {
    setDownloadStarted(type);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", type === "setup" ? "MediPath-AI-Setup-2.0.0.exe" : "MediPath-AI-2.0.0-Portable.exe");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-b border-border/60 p-6 sm:p-7 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
              <Laptop className="w-6 h-6 text-primary-foreground" strokeWidth={2.2} />
            </div>
            <div className="flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Download MediPath AI for Windows
                </DialogTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
                  v{binaryInfo.version} Desktop Pro
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Unlock <strong>100% Offline Clinical Mode</strong>, instant in-memory Model 2.0 triage, and full privacy on your Windows PC.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          {/* Main Download CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Primary: Setup Installer */}
            <div className="relative p-4 rounded-xl border-2 border-primary/40 bg-primary/[0.03] hover:border-primary transition-all flex flex-col justify-between group shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-primary tracking-wider uppercase">Recommended</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{binaryInfo.sizeFormatted}</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  Windows Setup (.exe)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                  Official installer with Desktop icon, Start Menu launcher, and automatic setup.
                </p>
              </div>
              <Button
                onClick={() => handleDownload(setupUrl, "setup")}
                className="w-full gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm h-10 cursor-pointer"
                id="btn-download-setup-exe"
              >
                <Download className="w-4 h-4" />
                <span>Download for Windows</span>
              </Button>
            </div>

            {/* Secondary: Portable Standalone */}
            <div className="relative p-4 rounded-xl border border-border/80 bg-secondary/30 hover:border-primary/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Portable</span>
                  <span className="text-[11px] font-mono text-muted-foreground">114.2 MB</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                  Standalone Direct (.exe)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                  Zero installation required. Run directly from USB or any local folder.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDownload(directUrl, "portable")}
                className="w-full gap-2 font-semibold border-border hover:border-primary/40 h-10 cursor-pointer"
                id="btn-download-direct-exe"
              >
                <HardDrive className="w-4 h-4 text-primary" />
                <span>Download Portable</span>
              </Button>
            </div>
          </div>

          {/* Download Notification Alert */}
          {downloadStarted && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Your download for <strong>{downloadStarted === "setup" ? "Windows Setup Installer" : "Portable Executable"}</strong> has started! Run the downloaded file to begin.
              </span>
            </div>
          )}

          {/* Why Download Desktop App? Exclusive Capabilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Why Download the Desktop App? (Exclusive Features)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Feature 1: 100% Offline Clinical Mode */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-foreground">100% Offline Clinical Mode</h5>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Full 56-disease Bayesian neural triage runs locally in-memory. Predict diagnoses even during complete internet or power outages.
                </p>
              </div>

              {/* Feature 2: 924 Verified Hospital Registry */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-foreground">924 Pre-Cached Hospitals</h5>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Instant offline access to 924 NABH and emergency hospitals, specialties, emergency contacts, and tier pricing formulas from local disk.
                </p>
              </div>

              {/* Feature 3: Sub-15ms Local ML Latency */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-foreground">Sub-15ms Instant Execution</h5>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Zero network lag or cloud round-trips. Multi-step doctor consultation questions evaluate directly on your machine&apos;s CPU.
                </p>
              </div>

              {/* Feature 4: 100% Local Privacy Sandbox */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs text-foreground">100% Patient Privacy</h5>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  No symptom data or searches are ever transmitted across the cloud when running offline. Confidential medical records stay on your PC.
                </p>
              </div>
            </div>
          </div>

          {/* System Specs Footer */}
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Windows 10 / 11 (64-bit) Compatible
            </span>
            <span>Local Disk: ~250 MB Required</span>
            <span>No Python or external dependencies needed</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
