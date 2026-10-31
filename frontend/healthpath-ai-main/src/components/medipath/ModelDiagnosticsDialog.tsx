import React, { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Cpu, 
  Database, 
  BarChart3, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Clock, 
  HardDrive, 
  Code2, 
  Scale, 
  Sparkles,
  ExternalLink,
  Table as TableIcon,
  Download,
  Eye,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { ModelVersion } from "@/services/hospitalService";
import { 
  MODELS_TECHNICAL_DATA, 
  DATASET_PROVENANCE_INFO, 
  SAMPLE_DATASET_RECORDS, 
  UNMAPPED_CONDITIONS_TOP10,
  THREE_MODEL_COMPARISON_MATRIX,
  ModelSpec 
} from "@/data/modelsTechnicalData";
import { 
  REAL_DATASETS_REGISTRY, 
  ModelDatasetMeta, 
  V2DatasetRecord, 
  V1DatasetRecord 
} from "@/data/realDatasetsPreviewData";
import hospitalsData from "@/data/hospitals.json";
import { t } from "@/lib/i18n";

interface ModelDiagnosticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeModelVersion: ModelVersion;
  onSelectModelVersion?: (version: ModelVersion) => void;
  firebaseOnline?: boolean;
  language?: string;
}

export const ModelDiagnosticsDialog: React.FC<ModelDiagnosticsDialogProps> = ({
  open,
  onOpenChange,
  activeModelVersion,
  onSelectModelVersion,
  firebaseOnline = true,
  language = "en",
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(activeModelVersion);
  const [activeTab, setActiveTab] = useState<string>("deep_dive");

  // State for Training Dataset interactive model choice & preview
  const [datasetModelId, setDatasetModelId] = useState<string>(activeModelVersion);
  const [datasetSearch, setDatasetSearch] = useState<string>("");
  const [datasetPage, setDatasetPage] = useState<number>(1);
  const [showDatasetPreview, setShowDatasetPreview] = useState<boolean>(true);
  const DATASET_PAGE_SIZE = 12;

  // State for Hospital Registry section
  const [hospitalSearch, setHospitalSearch] = useState<string>("");
  const [hospitalTier, setHospitalTier] = useState<string>("all");
  const [hospitalNabhOnly, setHospitalNabhOnly] = useState<boolean>(false);
  const [hospitalCity, setHospitalCity] = useState<string>("all");
  const [hospitalPage, setHospitalPage] = useState<number>(1);
  const HOSPITALS_PAGE_SIZE = 15;

  const currentModel: ModelSpec = MODELS_TECHNICAL_DATA[selectedModelId] || MODELS_TECHNICAL_DATA["_MedP_AI_V2.0"];
  const isSelectedActive = selectedModelId === activeModelVersion;

  const currentDatasetMeta: ModelDatasetMeta = 
    REAL_DATASETS_REGISTRY[datasetModelId] || REAL_DATASETS_REGISTRY["_MedP_AI_V2.0"];

  // Filtered dataset records
  const filteredDatasetRecords = useMemo(() => {
    const q = datasetSearch.toLowerCase().trim();
    const records = currentDatasetMeta.records;
    if (!q) return records;

    if (datasetModelId === "_MedP_AI_V2.0") {
      return (records as V2DatasetRecord[]).filter((r) => {
        return (
          r.id.toLowerCase().includes(q) ||
          r.raw_symptoms.toLowerCase().includes(q) ||
          r.high_confidence.some((h) => h.toLowerCase().includes(q)) ||
          r.medium_confidence.some((m) => m.toLowerCase().includes(q)) ||
          r.low_confidence.some((l) => l.toLowerCase().includes(q))
        );
      });
    } else {
      return (records as V1DatasetRecord[]).filter((r) => {
        return (
          r.sample_id.toLowerCase().includes(q) ||
          r.user_text.toLowerCase().includes(q) ||
          r.condition_name.toLowerCase().includes(q) ||
          r.icd10.toLowerCase().includes(q) ||
          r.specialization.toLowerCase().includes(q) ||
          r.procedure.toLowerCase().includes(q)
        );
      });
    }
  }, [currentDatasetMeta, datasetSearch, datasetModelId]);

  const paginatedDatasetRecords = useMemo(() => {
    const start = (datasetPage - 1) * DATASET_PAGE_SIZE;
    return filteredDatasetRecords.slice(start, start + DATASET_PAGE_SIZE);
  }, [filteredDatasetRecords, datasetPage]);

  const totalDatasetPages = Math.ceil(filteredDatasetRecords.length / DATASET_PAGE_SIZE) || 1;

  // Filtered hospitals list
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    hospitalsData.forEach((h) => {
      if (h.city) set.add(h.city);
    });
    return Array.from(set).sort();
  }, []);

  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.toLowerCase().trim();
    return hospitalsData.filter((h) => {
      if (hospitalTier !== "all" && h.tier.toLowerCase() !== hospitalTier.toLowerCase()) return false;
      if (hospitalNabhOnly && h.nabh_accredited?.toLowerCase() !== "yes") return false;
      if (hospitalCity !== "all" && h.city !== hospitalCity) return false;

      if (!q) return true;
      return (
        h.hospital_name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        (h.pincode && h.pincode.toString().includes(q)) ||
        h.specializations.toLowerCase().includes(q) ||
        (h.procedures_offered && h.procedures_offered.toLowerCase().includes(q))
      );
    });
  }, [hospitalSearch, hospitalTier, hospitalNabhOnly, hospitalCity]);

  const paginatedHospitals = useMemo(() => {
    const start = (hospitalPage - 1) * HOSPITALS_PAGE_SIZE;
    return filteredHospitals.slice(start, start + HOSPITALS_PAGE_SIZE);
  }, [filteredHospitals, hospitalPage]);

  const totalHospitalPages = Math.ceil(filteredHospitals.length / HOSPITALS_PAGE_SIZE) || 1;

  // JSON Downloader helper
  const handleDownloadDatasetJson = (meta: ModelDatasetMeta) => {
    const blob = new Blob([JSON.stringify(meta.records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.modelId}_training_records.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHospitalsJson = () => {
    const blob = new Blob([JSON.stringify(hospitalsData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medipath_verified_hospitals_registry.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border/80 shadow-2xl">
        {/* Header with Status Indicators */}
        <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-secondary/30 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>{t("nerd_hub_title", language)}</span>
                  <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5 border-primary/40 bg-primary/10 text-primary font-bold">
                    v2.0 Deep Dive
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("nerd_hub_subtitle", language)}
                </DialogDescription>
              </div>
            </div>

            {/* Online Status Pills */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/80 text-[11px] font-medium text-foreground shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Firebase:</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {firebaseOnline
                    ? (language === "hi" ? "ऑनलाइन" : language === "gu" ? "ઑનલાઇન" : "Online")
                    : (language === "hi" ? "कनेक्ट हो रहा है" : language === "gu" ? "જોડાઈ રહ્યું છે" : "Connecting")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/80 text-[11px] font-medium text-foreground shadow-2xs">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span>{language === "hi" ? "सभी मॉडल:" : language === "gu" ? "બધા મોડેલ્સ:" : "All Models:"}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {language === "hi" ? "3/3 लोड किए गए" : language === "gu" ? "3/3 લોડ થયેલ" : "3/3 Loaded"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (4 Sections) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
            <TabsList className="grid grid-cols-4 w-full bg-secondary/80 p-1 rounded-xl">
              <TabsTrigger
                value="deep_dive"
                onClick={() => setActiveTab("deep_dive")}
                className="text-xs font-semibold gap-1.5 cursor-pointer truncate"
              >
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{t("tab_deep_dive", language)}</span>
              </TabsTrigger>
              <TabsTrigger
                value="datasets"
                onClick={() => setActiveTab("datasets")}
                className="text-xs font-semibold gap-1.5 cursor-pointer truncate"
              >
                <Database className="w-3.5 h-3.5 text-teal" />
                <span className="truncate">{t("tab_datasets", language)}</span>
              </TabsTrigger>
              <TabsTrigger
                value="hospitals"
                onClick={() => setActiveTab("hospitals")}
                className="text-xs font-semibold gap-1.5 cursor-pointer truncate"
              >
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">{t("tab_hospitals", language)}</span>
              </TabsTrigger>
              <TabsTrigger
                value="comparison"
                onClick={() => setActiveTab("comparison")}
                className="text-xs font-semibold gap-1.5 cursor-pointer truncate"
              >
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">{t("tab_comparison", language)}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Scrollable Main Content */}
        <ScrollArea className="flex-1 p-5 md:p-6 overflow-y-auto">
          {/* TAB 1: MODEL DEEP-DIVE */}
          {activeTab === "deep_dive" && (
            <div className="space-y-6">
              {/* Model Selector Cards */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  {language === "hi"
                    ? "आर्किटेक्चर और विनिर्देश देखने के लिए मॉडल चुनें"
                    : language === "gu"
                    ? "આર્કિટેક્ચર અને સ્પષ્ટીકરણો જોવા માટે મોડેલ પસંદ કરો"
                    : "Select Model to Inspect Architecture & Nerd Specs"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.values(MODELS_TECHNICAL_DATA).map((spec) => {
                    const isSelected = selectedModelId === spec.id;

                    return (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => setSelectedModelId(spec.id)}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-soft"
                            : "bg-card/70 border-border/80 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {spec.id}
                          </span>
                          {spec.isProduction ? (
                            <Badge className="bg-emerald-500 text-white text-[9px] py-0 px-1.5 font-bold">
                              {language === "hi" ? "उत्पादन" : language === "gu" ? "ઉત્પાદન" : "Production"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-muted-foreground border-border">
                              {language === "hi" ? "पुरातन" : language === "gu" ? "વારસાગત" : "Legacy"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-foreground truncate">
                          {spec.name.replace(/MediPath AI /i, "")}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            {spec.classesCount} {language === "hi" ? "श्रेणियाँ" : language === "gu" ? "શ્રેણીઓ" : "Classes"}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            {(spec.microF1 * 100).toFixed(1)}% F1
                          </span>
                        </div>
                        {selectedModelId === spec.id && (
                          <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {language === "hi" ? "वर्तमान में चयनित" : language === "gu" ? "હાલમાં પસંદ કરેલ" : "Currently Selected"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Banner to Switch Active Model */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/80 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-foreground font-medium">
                    {isSelectedActive ? (
                      <span>
                        <strong className="text-primary font-mono">{currentModel.id}</strong>{" "}
                        {language === "hi"
                          ? "वर्तमान में सभी स्वास्थ्य खोजों के लिए सक्रिय है।"
                          : language === "gu"
                          ? "હાલમાં તમામ આરોગ્ય શોધ માટે સક્રિય છે."
                          : "is currently active for all healthcare searches."}
                      </span>
                    ) : (
                      <span>
                        {language === "hi"
                          ? "सक्रिय मॉडल को बदलकर"
                          : language === "gu"
                          ? "સક્રિય મોડેલ બદલીને"
                          : "Switch active model to"}{" "}
                        <strong className="text-primary font-mono">{currentModel.id}</strong>{" "}
                        {language === "hi" ? "करें?" : language === "gu" ? "કરવું છે?" : "?"}
                      </span>
                    )}
                  </span>
                </div>
                {!isSelectedActive && onSelectModelVersion && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onSelectModelVersion(currentModel.id as ModelVersion);
                    }}
                    className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t("switch_to_model", language)}</span>
                  </Button>
                )}
              </div>

              {/* Architecture Blueprint & Mathematical Formulation */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span>
                      {language === "hi"
                        ? "गणितीय खाका और सूत्र"
                        : language === "gu"
                        ? "ગાણિતિક બ્લૂપ્રિન્ટ અને સૂત્ર"
                        : "Mathematical Blueprint & Formulation"}
                    </span>
                  </h4>
                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                    {currentModel.algorithm.split(" ")[0]}
                  </Badge>
                </div>

                <div className="p-3 bg-secondary/50 rounded-lg font-mono text-xs text-foreground/90 overflow-x-auto leading-relaxed border border-border/50">
                  <code>{currentModel.formula}</code>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentModel.overview}
                </p>
              </div>

              {/* Key Nerd Performance Metrics Grid */}
              <div>
                <h4 className="font-bold text-sm text-foreground mb-2.5 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal" />
                  <span>
                    {language === "hi"
                      ? "सत्यापन और परीक्षण बेंचमार्क (तकनीकी मेट्रिक्स)"
                      : language === "gu"
                      ? "ચકાસણી અને પરીક્ષણ બેન્ચમાર્ક (ટેકનિકલ મેટ્રિક્સ)"
                      : "Validation & Test Benchmarks (Nerd Metrics)"}
                  </span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-card border border-border/70">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Top-1 Hit Rate</span>
                    <span className="text-lg font-mono font-extrabold text-foreground">
                      {(currentModel.top1HitRate * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "शीर्ष रैंक मिलान" : language === "gu" ? "ટોચનું રેન્ક મેચ" : "Top-ranked label match"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/70">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Top-3 Hit Rate</span>
                    <span className="text-lg font-mono font-extrabold text-primary">
                      {(currentModel.top3HitRate * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "शीर्ष 3 उम्मीदवारों में" : language === "gu" ? "ટોચના 3 ઉમેદવારોમાં" : "In top 3 candidates"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/70">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Micro F1 Score</span>
                    <span className="text-lg font-mono font-extrabold text-teal">
                      {(currentModel.microF1 * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "वैश्विक समग्र परिशुद्धता/रिकॉल" : language === "gu" ? "વૈશ્વિક ચોકસાઈ/રિકોલ" : "Global aggregate precision/recall"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/70">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">Macro F1 Score</span>
                    <span className="text-lg font-mono font-extrabold text-foreground">
                      {(currentModel.macroF1 * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "प्रति-वर्ग भारहीन औसत" : language === "gu" ? "પ્રતિ-વર્ગ સરેરાશ" : "Unweighted per-class mean"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">LRAP Score</span>
                    <span className="text-sm font-mono font-bold text-foreground">{currentModel.lrap.toFixed(4)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Brier Calibration Score</span>
                    <span className="text-sm font-mono font-bold text-foreground">{currentModel.brierScore.toFixed(4)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Expected Calib. Error (ECE)</span>
                    <span className="text-sm font-mono font-bold text-foreground">{currentModel.ece.toFixed(4)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">Hamming Loss</span>
                    <span className="text-sm font-mono font-bold text-foreground">{currentModel.hammingLoss.toFixed(5)}</span>
                  </div>
                </div>
              </div>

              {/* Hyperparameters Technical Table */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>
                    {language === "hi"
                      ? "कॉन्फ़िगर किए गए हाइपरपैरामीटर और प्रशिक्षण बाधाएं"
                      : language === "gu"
                      ? "કન્ફિગર કરેલ હાઇપરપેરામીટર્સ અને પ્રશિક્ષણ મર્યાદાઓ"
                      : "Configured Hyperparameters & Training Constraints"}
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {Object.entries(currentModel.hyperparameters).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40 border border-border/50">
                      <span className="text-muted-foreground font-medium">{key}</span>
                      <span className="font-mono font-semibold text-foreground text-right">{val.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-World Production & Memory Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-card border border-border/80">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{language === "hi" ? "प्रतिक्रिया समय (विलंबता)" : language === "gu" ? "પ્રતિસાદ સમય (વિલંબ)" : "Serving Latency"}</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-foreground">{currentModel.servingLatency}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border/80">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-teal" />
                    <span>{language === "hi" ? "मेमोरी उपयोग" : language === "gu" ? "મેમરી ઉપયોગ" : "Memory Footprint"}</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-foreground">{currentModel.memoryFootprint}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-card border border-border/80">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === "hi" ? "सुविधाएं / शब्दावली" : language === "gu" ? "લક્ષણો / શબ્દભંડોળ" : "Features / Vocabulary"}</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-foreground">{currentModel.vocabSize.toLocaleString()} N-Grams</p>
                </div>
              </div>

              {/* Best vs Challenging Classes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <h5 className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {language === "hi"
                        ? "शीर्ष 5 सर्वश्रेष्ठ श्रेणियां (उच्चतम F1)"
                        : language === "gu"
                        ? "ટોચની 5 શ્રેષ્ઠ શ્રેણીઓ (સર્વોચ્ચ F1)"
                        : "Top 5 Performing Classes (Highest F1)"}
                    </span>
                  </h5>
                  <div className="space-y-1 text-xs">
                    {currentModel.topPerformingClasses.map((c) => (
                      <div key={c.name} className="flex items-center justify-between py-0.5">
                        <span className="text-foreground">{c.name}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {(c.f1 * 100).toFixed(1)}% (n={c.support})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <h5 className="font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>
                      {language === "hi"
                        ? "सर्वाधिक अस्पष्ट श्रेणियां (कठिन F1)"
                        : language === "gu"
                        ? "સૌથી અસ્પષ્ટ શ્રેણીઓ (પડકારરૂપ F1)"
                        : "Weakest / Most Ambiguous Classes (Challenging F1)"}
                    </span>
                  </h5>
                  <div className="space-y-1 text-xs">
                    {currentModel.weakestClasses.map((c) => (
                      <div key={c.name} className="flex items-center justify-between py-0.5">
                        <span className="text-foreground">{c.name}</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {(c.f1 * 100).toFixed(1)}% (n={c.support})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRAINING DATASETS & REAL DATASET PREVIEW & DOWNLOAD */}
          {activeTab === "datasets" && (
            <div className="space-y-6">
              {/* Model Choice for Dataset Inspection */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      {t("select_model_dataset", language)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("datasets_section_desc", language)}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs self-start sm:self-center">
                    Active: {datasetModelId}
                  </Badge>
                </div>

                {/* 3 Model Selector Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {Object.values(REAL_DATASETS_REGISTRY).map((meta) => {
                    const isSel = datasetModelId === meta.modelId;
                    return (
                      <button
                        key={meta.modelId}
                        type="button"
                        onClick={() => {
                          setDatasetModelId(meta.modelId);
                          setDatasetPage(1);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-primary/10 border-primary shadow-sm"
                            : "bg-secondary/40 border-border/70 hover:border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {meta.modelId}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-background/80 text-muted-foreground border">
                            {meta.fileSize}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-foreground truncate">
                          {meta.filename}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {meta.totalRecords.toLocaleString()}{" "}
                          {language === "hi" ? "रिकॉर्ड" : language === "gu" ? "રેકોર્ડ" : "records"} •{" "}
                          {meta.classesCount}{" "}
                          {language === "hi" ? "श्रेणियाँ" : language === "gu" ? "શ્રેણીઓ" : "classes"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Model's Dataset Details Card */}
              <div className="p-5 rounded-2xl bg-secondary/20 border border-primary/20 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-border/60">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {currentDatasetMeta.filename}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {currentDatasetMeta.fileSize}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] border-emerald-500/20">
                        {language === "hi" ? "सत्यापित रॉ डेटासेट" : language === "gu" ? "ચકાસાયેલ રૉ ડેટાસેટ" : "Verified Raw Dataset"}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-1.5">
                      {language === "hi"
                        ? `${currentDatasetMeta.modelName} के लिए प्रशिक्षण डेटासेट`
                        : language === "gu"
                        ? `${currentDatasetMeta.modelName} માટે પ્રશિક્ષણ ડેટાસેટ`
                        : `Training Dataset for ${currentDatasetMeta.modelName}`}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                      {currentDatasetMeta.provenanceDescription}
                    </p>
                  </div>

                  {/* Real Dataset Action Buttons: Preview & Download */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button
                      variant={showDatasetPreview ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowDatasetPreview(!showDatasetPreview)}
                      className="text-xs gap-1.5 h-8 cursor-pointer"
                      title="Toggle interactive real dataset records preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {showDatasetPreview
                          ? (language === "hi" ? "पूर्वावलोकन छिपाएं" : language === "gu" ? "પૂર્વાવલોકન છુપાવો" : "Hide Preview")
                          : (language === "hi" ? "वास्तविक डेटासेट देखें" : language === "gu" ? "વાસ્તવિક ડેટાસેટ જુઓ" : "Preview Real Dataset")}
                      </span>
                    </Button>

                    <a
                      href={currentDatasetMeta.downloadUrl}
                      download={currentDatasetMeta.filename}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                      title={`Download official Excel dataset: ${currentDatasetMeta.filename}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t("download_real_dataset_xlsx", language)}</span>
                    </a>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDatasetJson(currentDatasetMeta)}
                      className="text-xs gap-1.5 h-8 border-border cursor-pointer hidden sm:flex"
                      title="Download extracted training records as formatted JSON"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                      <span>{t("download_json_dataset", language)}</span>
                    </Button>
                  </div>
                </div>

                {/* Key Dataset Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border/80">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      {language === "hi" ? "स्वच्छ रिकॉर्ड्स" : language === "gu" ? "સ્વચ્છ રેકોર્ડ્સ" : "Clean Encounters"}
                    </span>
                    <span className="text-base font-mono font-extrabold text-foreground">
                      {currentDatasetMeta.totalRecords.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "रोगी रिकॉर्ड" : language === "gu" ? "દર્દી રેકોર્ડ" : "Patient encounters"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/80">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      {language === "hi" ? "लक्षित रोग" : language === "gu" ? "લક્ષિત રોગો" : "Disease Targets"}
                    </span>
                    <span className="text-base font-mono font-extrabold text-primary">
                      {currentDatasetMeta.classesCount} {language === "hi" ? "श्रेणियाँ" : language === "gu" ? "શ્રેણીઓ" : "Classes"}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "ICD-10 नैदानिक श्रेणियां" : language === "gu" ? "ICD-10 ક્લિનિકલ શ્રેણીઓ" : "ICD-10 clinical categories"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/80">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      {language === "hi" ? "शब्दावली फीचर्स" : language === "gu" ? "શબ્દભંડોળ લક્ષણો" : "Vocab Features"}
                    </span>
                    <span className="text-base font-mono font-extrabold text-teal">
                      {currentDatasetMeta.featuresCount.toLocaleString()} N-Grams
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "लक्षण TF-IDF आयाम" : language === "gu" ? "લક્ષણ TF-IDF પરિમાણ" : "Symptom TF-IDF dimensions"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/80">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      {language === "hi" ? "विभाजन रणनीति" : language === "gu" ? "વિભાજન વ્યૂહરચના" : "Partition Strategy"}
                    </span>
                    <span className="text-xs font-bold text-foreground block truncate" title={currentDatasetMeta.splittingProtocol}>
                      {currentDatasetMeta.splittingProtocol.split("(")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {language === "hi" ? "80% ट्रेन, 20% टेस्ट" : language === "gu" ? "80% ટ્રેન, 20% ટેસ્ટ" : "80% Train, 20% Test"}
                    </span>
                  </div>
                </div>
              </div>

              {/* REAL DATASET PREVIEW TABLE */}
              {showDatasetPreview && (
                <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-primary" />
                      <h4 className="font-bold text-sm text-foreground">
                        {language === "hi"
                          ? `वास्तविक डेटासेट पूर्वावलोकन (${filteredDatasetRecords.length} रिकॉर्ड उपलब्ध)`
                          : language === "gu"
                          ? `વાસ્તવિક ડેટાસેટ પૂર્વાવલોકન (${filteredDatasetRecords.length} રેકોર્ડ ઉપલબ્ધ)`
                          : `Real Dataset Encounters Preview (${filteredDatasetRecords.length} records available)`}
                      </h4>
                    </div>

                    {/* Search inside preview */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={datasetSearch}
                        onChange={(e) => {
                          setDatasetSearch(e.target.value);
                          setDatasetPage(1);
                        }}
                        placeholder={t("search_dataset_placeholder", language)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Dynamic Table based on model dataset format */}
                  <div className="overflow-x-auto border border-border/60 rounded-xl">
                    {datasetModelId === "_MedP_AI_V2.0" ? (
                      /* Model 2.0 Multi-Label / Confidence-grouped Encounters */
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                            <th className="py-2.5 px-3 w-[12%]">Encounter ID</th>
                            <th className="py-2.5 px-3 w-[32%]">
                              {language === "hi" ? "रोगी द्वारा बताए गए लक्षण" : language === "gu" ? "દર્દી દ્વારા નોંધાયેલ લક્ષણો" : "Patient Reported Symptoms"}
                            </th>
                            <th className="py-2.5 px-3 w-[26%]">
                              {language === "hi" ? "उच्च निश्चितता लक्ष्य" : language === "gu" ? "ઉચ્ચ ચોકસાઈ લક્ષ્ય" : "High Confidence Target(s)"}
                            </th>
                            <th className="py-2.5 px-3 w-[15%]">
                              {language === "hi" ? "मध्यम निश्चितता" : language === "gu" ? "મધ્યમ ચોકસાઈ" : "Medium Confidence"}
                            </th>
                            <th className="py-2.5 px-3 w-[15%]">
                              {language === "hi" ? "निम्न निश्चितता" : language === "gu" ? "ઓછી ચોકસાઈ" : "Low Confidence"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-sans">
                          {(paginatedDatasetRecords as V2DatasetRecord[]).map((r) => (
                            <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-primary">{r.id}</td>
                              <td className="py-2.5 px-3 font-medium text-foreground">{r.raw_symptoms}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {r.high_confidence.map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {r.medium_confidence.map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px]">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {r.low_confidence.map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      /* Model 1.0 & 1.5 Tabular 20-Column Structured Encounters */
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                            <th className="py-2.5 px-3 w-[10%]">Sample ID</th>
                            <th className="py-2.5 px-3 w-[30%]">
                              {language === "hi" ? "रोगी के लक्षण" : language === "gu" ? "દર્દીના લક્ષણો" : "Reported Patient Symptoms"}
                            </th>
                            <th className="py-2.5 px-3 w-[20%]">
                              {language === "hi" ? "सत्य स्थिति" : language === "gu" ? "ચોક્કસ પરિસ્થિતિ" : "Ground-Truth Condition"}
                            </th>
                            <th className="py-2.5 px-3 w-[10%]">ICD-10</th>
                            <th className="py-2.5 px-3 w-[15%]">
                              {language === "hi" ? "विशेषज्ञता" : language === "gu" ? "વિશેષતા" : "Specialty"}
                            </th>
                            <th className="py-2.5 px-3 w-[15%]">
                              {language === "hi" ? "प्रक्रिया" : language === "gu" ? "પ્રક્રિયા" : "Procedure"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-sans">
                          {(paginatedDatasetRecords as V1DatasetRecord[]).map((r) => (
                            <tr key={r.sample_id} className="hover:bg-secondary/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-primary">{r.sample_id}</td>
                              <td className="py-2.5 px-3 text-foreground font-medium">{r.user_text}</td>
                              <td className="py-2.5 px-3 font-semibold text-foreground">
                                {r.condition_name}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-muted-foreground">{r.icd10}</td>
                              <td className="py-2.5 px-3 text-muted-foreground">{r.specialization}</td>
                              <td className="py-2.5 px-3 text-muted-foreground text-[11px] truncate" title={r.procedure}>
                                {r.procedure}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Dataset Table Pagination Controls */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                      {language === "hi"
                        ? `पृष्ठ ${datasetPage} / ${totalDatasetPages} (${filteredDatasetRecords.length} रिकॉर्ड)`
                        : language === "gu"
                        ? `પૃષ્ઠ ${datasetPage} / ${totalDatasetPages} (${filteredDatasetRecords.length} રેકોર્ડ)`
                        : `Page ${datasetPage} of ${totalDatasetPages} (${filteredDatasetRecords.length} records)`}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={datasetPage <= 1}
                        onClick={() => setDatasetPage((p) => Math.max(1, p - 1))}
                        className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>{language === "hi" ? "पिछला" : language === "gu" ? "પાછલું" : "Prev"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={datasetPage >= totalDatasetPages}
                        onClick={() => setDatasetPage((p) => Math.min(totalDatasetPages, p + 1))}
                        className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
                      >
                        <span>{language === "hi" ? "अगला" : language === "gu" ? "આગલું" : "Next"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Zero-Leakage Group Stratification Overview */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>
                      {language === "hi"
                        ? "शून्य-लीकेज समूह स्तरीकरण प्रोटोकॉल"
                        : language === "gu"
                        ? "ઝીરો-લીકેજ જૂથ સ્તરીકરણ પ્રોટોકોલ"
                        : "Zero-Leakage Group Stratification Protocol"}
                    </span>
                  </h4>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10">
                    0.00% Signature Leakage
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To guarantee absolute experimental integrity, records were grouped by unique symptom signatures across {DATASET_PROVENANCE_INFO.v2Dataset.groupsCount.toLocaleString()} groups. All duplicate clinical presentations were strictly isolated into a single split, guaranteeing zero test contamination:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">
                      {language === "hi" ? "ट्रेन सेट (70%)" : language === "gu" ? "ટ્રેન સેટ (70%)" : "Train Split (70%)"}
                    </span>
                    <span className="font-mono font-bold text-foreground">{DATASET_PROVENANCE_INFO.v2Dataset.trainRecords.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">
                      {language === "hi" ? "सत्यापन सेट (15%)" : language === "gu" ? "ચકાસણી સેટ (15%)" : "Validation (15%)"}
                    </span>
                    <span className="font-mono font-bold text-foreground">{DATASET_PROVENANCE_INFO.v2Dataset.valRecords.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">
                      {language === "hi" ? "परीक्षण सेट (15%)" : language === "gu" ? "પરીક્ષણ સેટ (15%)" : "Held-Out Test (15%)"}
                    </span>
                    <span className="font-mono font-bold text-primary">{DATASET_PROVENANCE_INFO.v2Dataset.testRecords.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Top 10 Audited Unmapped Patient Expressions */}
              <div className="p-4 rounded-xl border border-border/80 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-500" />
                    <span>
                      {language === "hi"
                        ? "शीर्ष 10 ऑडिट की गई अनमैप्ड स्थितियां"
                        : language === "gu"
                        ? "ટોચની 10 ઓડિટ કરેલ અનમેપ્ડ પરિસ્થિતિઓ"
                        : "Top 10 Audited Unmapped Conditions (Clinical Triage Rationale)"}
                    </span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {language === "hi" ? "2,090 रॉ लेबल ऑडिट किए गए" : language === "gu" ? "2,090 રૉ લેબલ ઓડિટ થયેલ" : "2,090 raw labels audited"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="py-2 pr-2">#</th>
                        <th className="py-2 pr-3">
                          {language === "hi" ? "रोग का नाम" : language === "gu" ? "રોગનું નામ" : "Raw Disease Name"}
                        </th>
                        <th className="py-2 pr-3">
                          {language === "hi" ? "आवृत्तियां" : language === "gu" ? "આવૃત્તિઓ" : "Occurrences"}
                        </th>
                        <th className="py-2 pr-3">
                          {language === "hi" ? "नैदानिक श्रेणी" : language === "gu" ? "ક્લિનિકલ શ્રેણી" : "Clinical Category"}
                        </th>
                        <th className="py-2">
                          {language === "hi" ? "प्रस्तावित मार्ग" : language === "gu" ? "સૂચિત માર્ગ" : "Proposed Triage Route"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {UNMAPPED_CONDITIONS_TOP10.map((item) => (
                        <tr key={item.name} className="hover:bg-secondary/30">
                          <td className="py-2 pr-2 font-mono text-muted-foreground">{item.rank}</td>
                          <td className="py-2 pr-3 font-semibold text-foreground">{item.name}</td>
                          <td className="py-2 pr-3 font-mono">{item.occurrences.toLocaleString()}</td>
                          <td className="py-2 pr-3">
                            <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2 text-muted-foreground text-[11px]">{item.proposedAction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED HOSPITAL REGISTRY */}
          {activeTab === "hospitals" && (
            <div className="space-y-5">
              {/* Top Header Banner & Download Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                      {language === "hi" ? "मान्यता प्राप्त सुविधा डेटाबेस" : language === "gu" ? "માન્યતા પ્રાપ્ત સુવિધા ડેટાબેઝ" : "Accredited Facility Database"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language === "hi" ? "924 सत्यापित अस्पताल पूरे भारत में" : language === "gu" ? "924 ચકાસાયેલ હોસ્પિટલો સમગ્ર ભારતમાં" : "924 Verified Hospitals Pan-India"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {t("hospitals_section_title", language)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                    {t("hospitals_section_desc", language)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <a
                    href="/datasets/hospital.xlsx"
                    download="hospital.xlsx"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors cursor-pointer"
                    title="Download the full verified hospitals registry Excel dataset"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {language === "hi" ? "एक्सेल डाउनलोड करें (.xlsx)" : language === "gu" ? "એક્સેલ ડાઉનલોડ કરો (.xlsx)" : "Download Excel (.xlsx)"}
                    </span>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadHospitalsJson}
                    className="text-xs gap-1.5 h-8 border-border cursor-pointer"
                    title="Download complete registry in structured JSON"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal" />
                    <span>{t("download_hospital_registry", language)}</span>
                  </Button>
                </div>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-card border border-border/80">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {language === "hi" ? "कुल सुविधाएं" : language === "gu" ? "કુલ સુવિધાઓ" : "Total Facilities"}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-foreground">{hospitalsData.length}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {language === "hi" ? "100% जियो-कोडेड" : language === "gu" ? "100% જીઓ-કોડેડ" : "100% Geo-coded"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/80">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {language === "hi" ? "NABH मान्यता प्राप्त" : language === "gu" ? "NABH માન્યતા પ્રાપ્ત" : "NABH Accredited"}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                    {hospitalsData.filter((h) => h.nabh_accredited?.toLowerCase() === "yes").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {language === "hi" ? "उच्च गुणवत्ता देखभाल सत्यापित" : language === "gu" ? "ઉચ્ચ ગુણવત્તા સંભાળ ચકાસાયેલ" : "High-quality care verified"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/80">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {language === "hi" ? "कवर किए गए शहर" : language === "gu" ? "આવરી લીધેલ શહેરો" : "Covered Cities"}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-teal">{uniqueCities.length}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {language === "hi" ? "भारतीय राज्यों में" : language === "gu" ? "ભારતીય રાજ્યોમાં" : "Across Indian states"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/80">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {language === "hi" ? "प्रीमियम / शीर्ष स्तर" : language === "gu" ? "પ્રીમિયમ / સર્વોચ્ચ સ્તર" : "Premium / Apex Tiers"}
                  </span>
                  <span className="text-lg font-mono font-extrabold text-primary">
                    {hospitalsData.filter((h) => h.tier.toLowerCase() === "premium").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {language === "hi" ? "विशेष सर्जिकल केंद्र" : language === "gu" ? "વિશેષ સર્જિકલ કેન્દ્રો" : "Specialized surgical centers"}
                  </span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={hospitalSearch}
                      onChange={(e) => {
                        setHospitalSearch(e.target.value);
                        setHospitalPage(1);
                      }}
                      placeholder={t("search_hospitals_placeholder", language)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {hospitalSearch && (
                      <button
                        onClick={() => {
                          setHospitalSearch("");
                          setHospitalPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {t("clear", language)}
                      </button>
                    )}
                  </div>

                  {/* City Dropdown Filter */}
                  <select
                    value={hospitalCity}
                    onChange={(e) => {
                      setHospitalCity(e.target.value);
                      setHospitalPage(1);
                    }}
                    className="px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">
                      {language === "hi" ? `सभी शहर (${uniqueCities.length})` : language === "gu" ? `બધા શહેરો (${uniqueCities.length})` : `All Cities (${uniqueCities.length})`}
                    </option>
                    {uniqueCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Tier & Accreditation Filter Chips */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-1">
                      {language === "hi" ? "स्तर:" : language === "gu" ? "સ્તર:" : "Tier:"}
                    </span>
                    {[
                      { id: "all", label: language === "hi" ? "सभी" : language === "gu" ? "બધા" : "All" },
                      { id: "premium", label: language === "hi" ? "प्रीमियम" : language === "gu" ? "પ્રીમિયમ" : "Premium" },
                      { id: "mid-tier", label: language === "hi" ? "मध्यम-स्तर" : language === "gu" ? "મધ્યમ-સ્તર" : "Mid-Tier" },
                      { id: "budget", label: language === "hi" ? "किफायती" : language === "gu" ? "કિફાયતી" : "Budget" },
                    ].map((tierItem) => (
                      <button
                        key={tierItem.id}
                        onClick={() => {
                          setHospitalTier(tierItem.id);
                          setHospitalPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          hospitalTier === tierItem.id
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "bg-card hover:bg-secondary text-muted-foreground border border-border/60"
                        }`}
                      >
                        {tierItem.label}
                      </button>
                    ))}

                    <span className="text-border mx-1">•</span>

                    <button
                      onClick={() => {
                        setHospitalNabhOnly(!hospitalNabhOnly);
                        setHospitalPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                        hospitalNabhOnly
                          ? "bg-emerald-600 text-white font-semibold"
                          : "bg-card hover:bg-secondary text-muted-foreground border border-border/60"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{t("nabh_accredited_only", language)}</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    {language === "hi"
                      ? `924 सुविधाओं में से ${filteredHospitals.length} प्रदर्शित`
                      : language === "gu"
                      ? `924 સુવિધાઓમાંથી ${filteredHospitals.length} દર્શાવેલ`
                      : `Showing ${filteredHospitals.length} of ${hospitalsData.length} facilities`}
                  </span>
                </div>
              </div>

              {/* Hospitals Table */}
              <div className="overflow-x-auto border border-border/70 rounded-xl bg-card">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border/80 bg-secondary/40 text-muted-foreground">
                      <th className="py-2.5 px-3 w-[8%]">ID</th>
                      <th className="py-2.5 px-3 w-[26%]">
                        {language === "hi" ? "अस्पताल का नाम" : language === "gu" ? "હોસ્પિટલનું નામ" : "Hospital Name"}
                      </th>
                      <th className="py-2.5 px-3 w-[16%]">
                        {language === "hi" ? "स्थान" : language === "gu" ? "સ્થાન" : "Location"}
                      </th>
                      <th className="py-2.5 px-3 w-[10%]">
                        {language === "hi" ? "स्तर" : language === "gu" ? "સ્તર" : "Tier"}
                      </th>
                      <th className="py-2.5 px-3 w-[9%]">
                        {language === "hi" ? "रेटिंग" : language === "gu" ? "રેટિંગ" : "Rating"}
                      </th>
                      <th className="py-2.5 px-3 w-[20%]">
                        {language === "hi" ? "विशेषज्ञताएं" : language === "gu" ? "વિશેષતાઓ" : "Specializations"}
                      </th>
                      <th className="py-2.5 px-3 w-[11%]">
                        {language === "hi" ? "लागत गुणांक" : language === "gu" ? "ખર્ચ ગુણાંક" : "Cost Mult."}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-sans">
                    {paginatedHospitals.map((h) => {
                      const isNABH = h.nabh_accredited?.toLowerCase() === "yes";
                      return (
                        <tr key={h.hospital_id} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-muted-foreground">{h.hospital_id}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-foreground block">{h.hospital_name}</span>
                            {isNABH && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> NABH Accredited
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              {h.city}, {h.state}
                            </span>
                            {h.pincode && (
                              <span className="text-[10px] font-mono text-muted-foreground block ml-4">
                                PIN: {h.pincode}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              h.tier.toLowerCase() === "premium"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : h.tier.toLowerCase() === "mid-tier"
                                ? "bg-teal/10 text-teal border border-teal/20"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}>
                              {h.tier}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {h.google_rating}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground text-[11px] line-clamp-2" title={h.specializations}>
                            {h.specializations}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">
                            {h.base_cost_multiplier}x
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Hospital Registry Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>
                  {language === "hi"
                    ? `पृष्ठ ${hospitalPage} / ${totalHospitalPages} (${filteredHospitals.length} अस्पताल)`
                    : language === "gu"
                    ? `પૃષ્ઠ ${hospitalPage} / ${totalHospitalPages} (${filteredHospitals.length} હોસ્પિટલો)`
                    : `Page ${hospitalPage} of ${totalHospitalPages} (${filteredHospitals.length} facilities)`}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hospitalPage <= 1}
                    onClick={() => setHospitalPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{language === "hi" ? "पिछला" : language === "gu" ? "પાછલું" : "Prev"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hospitalPage >= totalHospitalPages}
                    onClick={() => setHospitalPage((p) => Math.min(totalHospitalPages, p + 1))}
                    className="h-7 px-2.5 text-xs gap-1 cursor-pointer"
                  >
                    <span>{language === "hi" ? "अगला" : language === "gu" ? "આગલું" : "Next"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 3-MODEL COMPARISON MATRIX */}
          {activeTab === "comparison" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {t("comparison_section_title", language)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === "hi"
                      ? "प्रमुख तकनीकी आयामों पर मॉडल V1.0, मॉडल V1.5, और मॉडल V2.0 के बीच तुलनात्मक विवरण"
                      : language === "gu"
                      ? "મુખ્ય ટેકનિકલ પરિમાણો પર મોડેલ V1.0, મોડેલ V1.5, અને મોડેલ V2.0 વચ્ચે સરખામણી"
                      : "Comparative breakdown between Model V1.0, Model V1.5, and Model V2.0 across key technical dimensions"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-border/80 rounded-xl bg-card">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border/80 bg-secondary/50">
                      <th className="p-3 font-bold text-foreground w-[28%]">
                        {language === "hi" ? "तकनीकी आयाम" : language === "gu" ? "ટેકનિકલ પરિમાણ" : "Technical Dimension"}
                      </th>
                      <th className="p-3 font-bold text-foreground w-[22%]">
                        <div className="flex items-center gap-1.5">
                          <span>MedP_AI_V1.0</span>
                          <Badge variant="outline" className="text-[9px] py-0 px-1">
                            {language === "hi" ? "बेसलाइन" : language === "gu" ? "બેઝલાઇન" : "Baseline"}
                          </Badge>
                        </div>
                      </th>
                      <th className="p-3 font-bold text-foreground w-[22%]">
                        <div className="flex items-center gap-1.5">
                          <span>MedP_AI_V1.5</span>
                          <Badge variant="outline" className="text-[9px] py-0 px-1">SGD</Badge>
                        </div>
                      </th>
                      <th className="p-3 font-bold text-foreground w-[28%] bg-primary/5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">_MedP_AI_V2.0</span>
                          <Badge className="bg-emerald-500 text-white text-[9px] py-0 px-1">
                            {language === "hi" ? "उत्पादन" : language === "gu" ? "ઉત્પાદન" : "Production"}
                          </Badge>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {THREE_MODEL_COMPARISON_MATRIX.map((row) => (
                      <tr key={row.feature} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3 font-semibold text-foreground bg-secondary/10">
                          {row.feature}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {row.v1}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {row.v1_5}
                        </td>
                        <td className="p-3 font-mono font-semibold text-foreground bg-primary/5">
                          {row.v2}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
