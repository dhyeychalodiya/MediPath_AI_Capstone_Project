import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Languages, IndianRupee, ShieldCheck, History, WifiOff } from "lucide-react";
import { isNetworkOnline } from "@/utils/platform";
import { Header } from "@/components/medipath/Header";
import { SearchBar } from "@/components/medipath/SearchBar";
import { ThinkingState } from "@/components/medipath/ThinkingState";
import { DirectDiseaseRoutingState } from "@/components/medipath/DirectDiseaseRoutingState";
import { SupportedDiseasesDirectory } from "@/components/medipath/SupportedDiseasesDirectory";
import { ModelDiagnosticsDialog } from "@/components/medipath/ModelDiagnosticsDialog";
import { CanonicalCondition, CANONICAL_CONDITIONS } from "@/data/canonicalConditionsData";
import { ResultsView } from "@/components/medipath/ResultsView";
import { LocationFilter, LocationValue } from "@/components/medipath/LocationFilter";
import { DoctorConsultationPanel } from "@/components/medipath/DoctorConsultationPanel";
import { SearchHistoryDialog } from "@/components/medipath/SearchHistoryDialog";
import { HelpInstructionsDialog } from "@/components/medipath/HelpInstructionsDialog";
import { AppSplashScreen } from "@/components/medipath/AppSplashScreen";
import {
  saveSearchHistory,
  getSearchHistory,
  onSearchHistoryUpdate,
  SearchHistoryItem,
} from "@/services/searchHistoryService";
import {
  findHospitals,
  defaultFilters,
  SearchFilters,
  SearchOutput,
  CITY_COORDS,
  loadCitiesFromHospitals,
  getModelStatus,
  getAvailableModelVersions,
  ModelStatus,
  ModelVersion,
  DoctorTriageV2Candidate,
} from "@/services/hospitalService";
import { useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import bgAbstract from "@/assets/bg-abstract.jpg";
import { t } from "@/lib/i18n";

type Stage = "home" | "loading" | "direct_routing_loading" | "doctor_consultation" | "results";

const features = [
  { icon: Languages, label: "Hindi & English" },
  { icon: IndianRupee, label: "Transparent costs" },
  { icon: ShieldCheck, label: "NABH-verified" },
];

const exampleQueries = [
  "chest pain while walking",
  "knee replacement",
  "best cancer hospital",
  "सीने में दर्द चलते समय",
  "મને માથું દુખે છે",
];

const initialLocation = (): LocationValue => {
  const c = CITY_COORDS["Surat"] || { lat: 21.1702, lng: 72.8311, state: "Gujarat" };
  return { state: c.state || "Gujarat", city: "Surat", lat: c.lat, lng: c.lng, source: "city", scope: "city" };
};

const Index = () => {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>("home");
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem("medipath_splash_shown");
    } catch {
      return true;
    }
  });

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem("medipath_splash_shown", "1");
    } catch (err) {
      console.debug("Session storage unavailable:", err);
    }
    setShowSplash(false);
  };
  const [result, setResult] = useState<SearchOutput | null>(null);
  const [query, setQuery] = useState("");
  const [confirmedCondition, setConfirmedCondition] = useState<DoctorTriageV2Candidate | null>(null);
  const [location, setLocation] = useState<LocationValue>(initialLocation);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const [modelStatus, setModelStatus] = useState<ModelStatus>("checking");
  const [modelVersion, setModelVersion] = useState<ModelVersion>("_MedP_AI_V2.0");
  const [consultationId, setConsultationId] = useState(0);
  const [conversationLanguage, setConversationLanguage] = useState<string>("en");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [directRoutingCondition, setDirectRoutingCondition] = useState<CanonicalCondition | null>(null);
  const [diseasesModalOpen, setDiseasesModalOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [networkOnline, setNetworkOnline] = useState<boolean>(() => isNetworkOnline());

  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync saved search history for authenticated users
  useEffect(() => {
    if (!user) {
      setHistoryCount(0);
      setRecentSearches([]);
      return;
    }
    const refresh = () => {
      const items = getSearchHistory(user.id);
      setHistoryCount(items.length);
      setRecentSearches(items.slice(0, 5));
    };
    refresh();
    return onSearchHistoryUpdate(refresh, user.id);
  }, [user]);

  // Load cities and models on mount
  useEffect(() => {
    loadCitiesFromHospitals();
    getModelStatus().then(setModelStatus);
    getAvailableModelVersions().then((versions) => {
      if (versions.length > 0 && !versions.includes("_MedP_AI_V2.0")) {
        setModelVersion(versions[0]);
      }
    });
  }, []);

  const locationLabel = useMemo(() => {
    if (location.source === "geo") return "your location";
    if (location.scope === "country") return "India";
    if (location.scope === "state") return location.state;
    return `${location.city}, ${location.state}`;
  }, [location]);

  const handleModelChange = (newVersion: ModelVersion) => {
    setModelVersion(newVersion);
    if (newVersion === "_MedP_AI_V2.0") {
      // With MedP_AI_V2.0, the patient must face Dr. MediPath before any hospital recommendations!
      if (query) {
        setConfirmedCondition(null);
        setResult(null);
        setConsultationId((prev) => prev + 1);
        setStage("doctor_consultation");
      }
    } else {
      // Switching to V1.0 or V1.5 - direct prediction mode
      if (stage === "doctor_consultation" && query) {
        setConfirmedCondition(null);
        setStage("loading");
        findHospitals({
          query,
          origin: { lat: location?.lat ?? 21.1702, lng: location?.lng ?? 72.8311 },
          filters,
          city: location?.city || "Surat",
          state: location?.state || "Gujarat",
          locationScope: location?.scope || "city",
          modelVersion: newVersion,
        }).then((out) => {
          if (out) {
            setResult(out);
            setStage("results");
            if (user) {
              saveSearchHistory(user.id, {
                query,
                condition: out.condition?.condition,
                specialty: out.condition?.specialty,
                location: locationLabel,
                hospitalCount: out.hospitals?.length,
                modelVersion: newVersion,
              });
            }
          } else {
            setStage("home");
          }
        }).catch(() => setStage("home"));
      }
    }
  };

  const runSearch = async (q: string, lang?: string) => {
    if (!q || !q.trim()) return;
    const cleanQ = q.trim();
    if (lang) {
      setConversationLanguage(lang);
    }
    setQuery(cleanQ);

    // MedP_AI_V2.0: User MUST face the Doctor AI engine before any hospital recommendation!
    if (modelVersion === "_MedP_AI_V2.0") {
      setConfirmedCondition(null);
      setResult(null);
      setConsultationId((prev) => prev + 1);
      setStage("doctor_consultation");
      return;
    }

    // MedP_AI_V1.0 and V1.5: Direct prediction & immediate hospital recommendations (unchanged)
    setConfirmedCondition(null);
    setStage("loading");
    try {
      const out = await findHospitals({
        query: q,
        origin: { lat: location?.lat ?? 21.1702, lng: location?.lng ?? 72.8311 },
        filters,
        city: location?.city || "Surat",
        state: location?.state || "Gujarat",
        locationScope: location?.scope || "city",
        modelVersion,
      });
      if (out) {
        setResult(out);
        setStage("results");
        if (user) {
          saveSearchHistory(user.id, {
            query: q,
            condition: out.condition?.condition,
            specialty: out.condition?.specialty,
            location: locationLabel,
            hospitalCount: out.hospitals?.length,
            modelVersion,
          });
        }
      } else {
        setStage("home");
      }
    } catch (err) {
      console.error("runSearch failed:", err);
      setStage("home");
    }
  };

  // Called when Doctor AI achieves diagnostic clarity in V2.0 mode
  const handleDiagnosisConfirmed = async (conditionObj: DoctorTriageV2Candidate, allSymptoms: string) => {
    setQuery(allSymptoms);
    setConfirmedCondition(conditionObj);
    setStage("loading");
    try {
      const out = await findHospitals({
        query: allSymptoms,
        origin: { lat: location?.lat ?? 21.1702, lng: location?.lng ?? 72.8311 },
        filters,
        city: location?.city || "Surat",
        state: location?.state || "Gujarat",
        locationScope: location?.scope || "city",
        modelVersion,
        confirmedCondition: conditionObj.condition,
        confirmedConfidence: conditionObj.confidence ?? undefined,
      });
      if (out) {
        setResult(out);
        setStage("results");
        if (user) {
          saveSearchHistory(user.id, {
            query: allSymptoms,
            condition: conditionObj.condition,
            specialty: conditionObj.specialization || conditionObj.specialty,
            location: locationLabel,
            hospitalCount: out.hospitals?.length,
            modelVersion,
          });
        }
      } else {
        setStage("home");
      }
    } catch (err) {
      console.error("findHospitals after confirmed diagnosis failed:", err);
      setStage("home");
    }
  };

  // Re-run search reactively whenever location changes while on results
  useEffect(() => {
    if (stage !== "results" || !query) return;

    // In V2.0, if no confirmed condition, do NOT fetch hospitals directly; user must face Doctor AI!
    if (modelVersion === "_MedP_AI_V2.0" && !confirmedCondition) {
      setStage("doctor_consultation");
      return;
    }

    let cancelled = false;
    findHospitals({
      query,
      origin: { lat: location?.lat ?? 21.1702, lng: location?.lng ?? 72.8311 },
      filters: filtersRef.current,
      city: location?.city || "Surat",
      state: location?.state || "Gujarat",
      locationScope: location?.scope || "city",
      modelVersion,
      confirmedCondition: confirmedCondition ? confirmedCondition.condition : undefined,
      confirmedConfidence: confirmedCondition ? (confirmedCondition.confidence ?? undefined) : undefined,
      directRouting: confirmedCondition?.decisionSource === "direct_routing" || directRoutingCondition !== null,
    }).then((out) => {
      if (!cancelled && out) setResult(out);
    }).catch((err) => {
      console.warn("Reactive location search error:", err);
    });
    return () => {
      cancelled = true;
    };
  }, [location?.lat, location?.lng, location?.scope, location?.city, location?.state, modelVersion, stage, query, confirmedCondition, directRoutingCondition]);

  const handleSymptomsUpdate = (newSymptoms: string) => {
    setQuery(newSymptoms);
  };

  const handleReconsultDoctor = () => {
    setStage("doctor_consultation");
  };

  // Direct disease click routing with dedicated AI loading screen
  const handleDirectConditionRouting = async (condition: CanonicalCondition) => {
    setDirectRoutingCondition(condition);
    setStage("direct_routing_loading");
    setDiseasesModalOpen(false);

    try {
      const [out] = await Promise.all([
        findHospitals({
          query: condition.name,
          origin: { lat: location?.lat ?? 21.1702, lng: location?.lng ?? 72.8311 },
          filters,
          city: location?.city || "Surat",
          state: location?.state || "Gujarat",
          locationScope: location?.scope || "city",
          modelVersion,
          confirmedCondition: condition.name,
          confirmedConfidence: 1.0,
          directRouting: true,
        }),
        // Smooth quick transition for clean loading state
        new Promise((resolve) => setTimeout(resolve, 300)),
      ]);

      if (out) {
        setQuery(condition.name);
        setConfirmedCondition({
          condition_id: condition.id,
          condition: condition.name,
          specialization: condition.specialization,
          specialty: condition.specialization,
          confidence: 1.0,
          icd10: condition.icd10,
          urgency: condition.urgency,
          procedure: condition.procedure,
          decisionSource: "direct_routing",
        });
        setResult(out);
        setStage("results");
        if (user) {
          saveSearchHistory(user.id, {
            query: condition.name,
            condition: condition.name,
            specialty: condition.specialization,
            location: locationLabel,
            hospitalCount: out.hospitals?.length,
            modelVersion,
            isDirectRouting: true,
            directRouting: true,
            icd10: condition.icd10,
            procedure: condition.procedure,
            urgency: condition.urgency,
            decisionSource: "direct_routing",
            source: "direct_routing",
          });
        }
      } else {
        setStage("home");
      }
    } catch (err) {
      console.error("Direct condition routing failed:", err);
      setStage("home");
    }
  };

  // Restores saved history: BYPASSES ML model if saved from Supported Diseases / Direct Routing
  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    const isDirect = Boolean(
      item.isDirectRouting ||
      item.directRouting ||
      item.source === "direct_routing" ||
      item.decisionSource === "direct_routing"
    );

    if (isDirect) {
      // Direct disease or General Medicine selection: bypass ML model completely
      const conditionName = item.condition || item.query;
      const match = CANONICAL_CONDITIONS.find(
        (c) =>
          c.name.toLowerCase() === conditionName.toLowerCase() ||
          c.id.toLowerCase() === conditionName.toLowerCase()
      );

      const targetCondition: CanonicalCondition = match || {
        id: conditionName.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        name: conditionName,
        icd10: item.icd10 || "Z00.00",
        specialization: item.specialty || "General Medicine",
        procedure: item.procedure || "Clinical Specialist Evaluation",
        urgency:
          item.urgency === "urgent" || item.urgency === "emergency" || item.urgency === "routine"
            ? item.urgency
            : "routine",
        bodySystem: item.specialty || "General Medicine",
        topSymptoms: [],
        description: `Consultation for ${conditionName}`,
      };

      handleDirectConditionRouting(targetCondition);
    } else {
      // Regular symptom search from follow-up page: unchanged behavior
      runSearch(item.query);
    }
  };

  const reset = () => {
    setStage("home");
    setResult(null);
    setConfirmedCondition(null);
    setDirectRoutingCondition(null);
    setQuery("");
    setFilters(defaultFilters);
    setConsultationId((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative flex flex-col justify-between">
      {showSplash && <AppSplashScreen onFinished={handleSplashFinish} />}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: `url(${bgAbstract})` }}
      />
      <Header
        onLogoClick={reset}
        modelStatus={modelStatus}
        language={conversationLanguage}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={historyCount}
        onOpenModelDiagnostics={() => setDiagnosticsOpen(true)}
        onOpenDiseasesDirectory={() => {
          if (stage === "home") {
            const el = document.getElementById("supported-diseases-section");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
              return;
            }
          }
          setDiseasesModalOpen(true);
        }}
        onOpenHelpInstructions={() => setHelpOpen(true)}
        activeModelId={modelVersion}
      />

      {/* Offline Clinical Mode Notification Banner */}
      {!networkOnline && (
        <div
          className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2 z-20 shadow-xs"
          role="status"
        >
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Offline Clinical Mode Active:</strong> Model 2.0 AI triage and 924 Verified Emergency Hospitals are operating 100% locally with zero internet required.
          </span>
        </div>
      )}

      <main className="container flex-1 py-8 md:py-12 flex flex-col">
        <AnimatePresence mode="wait">
          {stage === "home" && (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center pt-8 md:pt-16"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-primary/15 text-xs font-medium text-primary mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {user 
                  ? t("welcome_user", conversationLanguage, { name: user.name.split(" ")[0], id: user.id })
                  : t("hero_badge", conversationLanguage)}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-4xl md:text-6xl font-bold text-foreground tracking-tight max-w-3xl"
              >
                {t("hero_title_1", conversationLanguage)}
                <span className="block bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
                  {t("hero_title_2", conversationLanguage)}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-base md:text-lg mt-5 max-w-2xl"
              >
                {t("hero_subtitle", conversationLanguage)}
              </motion.p>

              <div className="w-full mt-10 flex flex-col items-center gap-4">
                <SearchBar
                  onSearch={runSearch}
                  modelVersion={modelVersion}
                  onModelVersionChange={handleModelChange}
                  selectedLanguage={conversationLanguage}
                  onLanguageChange={setConversationLanguage}
                />
                <LocationFilter value={location} onChange={setLocation} language={conversationLanguage} />
              </div>

              {/* Saved Search History Chips for Authenticated Users */}
              {user && recentSearches.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1 font-medium">
                    <History className="w-3.5 h-3.5 text-primary" />
                    {conversationLanguage === "hi"
                      ? "हाल की खोजें:"
                      : conversationLanguage === "gu"
                      ? "તાજેતરની શોધો:"
                      : "Recent Searches:"}
                  </span>
                  {recentSearches.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="px-3 py-1 text-xs rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border/80 hover:border-primary/40 transition-all cursor-pointer truncate max-w-[200px] inline-flex items-center gap-1.5"
                      title={item.query}
                    >
                      {Boolean(item.isDirectRouting || item.directRouting || item.source === "direct_routing") && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Direct Route" />
                      )}
                      <span className="truncate">{item.query}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className="text-xs text-primary hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    View all ({historyCount})
                  </button>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <span className="text-xs text-muted-foreground mr-1">{t("try_label", conversationLanguage)}</span>
                {exampleQueries.map((ex) => {
                  const isHindi = /[\u0900-\u097F]/.test(ex);
                  const isGujarati = /[\u0A80-\u0AFF]/.test(ex);
                  const targetLang = isHindi ? "hi" : isGujarati ? "gu" : "en";
                  return (
                    <button
                      key={ex}
                      onClick={() => runSearch(ex, targetLang)}
                      className="px-3.5 py-1.5 text-xs rounded-full bg-card border border-border text-foreground/80 hover:border-primary/40 hover:text-primary hover:shadow-soft transition-all"
                    >
                      {ex}
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Languages className="w-4 h-4 text-teal" />
                  {t("feature_multilingual", conversationLanguage)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="w-4 h-4 text-teal" />
                  {t("feature_costs", conversationLanguage)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  {t("feature_nabh", conversationLanguage)}
                </div>
              </div>

              {/* Supported Diseases Directory with Direct Hospital Routing */}
              <div id="supported-diseases-section" className="w-full mt-16 pt-8 border-t border-border/60 text-left">
                <SupportedDiseasesDirectory
                  onSelectCondition={handleDirectConditionRouting}
                  language={conversationLanguage}
                />
              </div>
            </motion.section>
          )}

          {stage === "loading" && (
            <motion.section
              key="loading"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl mx-auto my-auto py-8 md:py-16 flex-1 flex flex-col justify-center"
            >
              <ThinkingState
                query={query}
                confirmedCondition={confirmedCondition}
                modelVersion={modelVersion}
                language={conversationLanguage}
                locationLabel={locationLabel}
              />
            </motion.section>
          )}

          {stage === "direct_routing_loading" && directRoutingCondition && (
            <motion.section
              key="direct_routing_loading"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl mx-auto my-auto py-8 md:py-16 flex-1 flex flex-col justify-center"
            >
              <DirectDiseaseRoutingState
                condition={directRoutingCondition}
                locationLabel={locationLabel}
                onCancel={reset}
                language={conversationLanguage}
              />
            </motion.section>
          )}

          {stage === "doctor_consultation" && (
            <motion.div
              key="doctor_consultation"
              initial={{ opacity: 0, scale: 0.985, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: 12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col shadow-2xl"
            >
              <DoctorConsultationPanel
                key={`consultation-${consultationId}-${query}`}
                initialQuery={query}
                initialLanguage={conversationLanguage}
                onDiagnosisConfirmed={handleDiagnosisConfirmed}
                onCancel={reset}
                onSymptomsUpdate={handleSymptomsUpdate}
                onLanguageChange={setConversationLanguage}
              />
            </motion.div>
          )}

          {stage === "results" && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto space-y-6"
            >
              <SearchBar 
                onSearch={runSearch} 
                initial={query} 
                compact 
                modelVersion={modelVersion} 
                onModelVersionChange={handleModelChange}
                selectedLanguage={conversationLanguage}
                onLanguageChange={setConversationLanguage}
              />
              <LocationFilter value={location} onChange={setLocation} language={conversationLanguage} />
              {result ? (
                <ErrorBoundary>
                  <ResultsView
                    result={result}
                    filters={filters}
                    onFiltersChange={setFilters}
                    locationLabel={locationLabel}
                    language={conversationLanguage}
                    onReconsultDoctor={handleReconsultDoctor}
                  />
                </ErrorBoundary>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">Fetching medical guidance...</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="container py-6 text-center text-xs text-muted-foreground mt-auto shrink-0 border-t border-border/30">
        {t("footer_text", conversationLanguage)}
      </footer>

      <SearchHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onSelectQuery={(q) => runSearch(q)}
        onSelectHistoryItem={handleSelectHistoryItem}
        language={conversationLanguage}
      />

      <ModelDiagnosticsDialog
        open={diagnosticsOpen}
        onOpenChange={setDiagnosticsOpen}
        activeModelVersion={modelVersion}
        onSelectModelVersion={(v) => handleModelChange(v)}
        firebaseOnline={Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID)}
        language={conversationLanguage}
      />

      {diseasesModalOpen && (
        <SupportedDiseasesDirectory
          asModal
          onClose={() => setDiseasesModalOpen(false)}
          onSelectCondition={handleDirectConditionRouting}
          language={conversationLanguage}
        />
      )}

      <HelpInstructionsDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        language={conversationLanguage}
        onStartSampleSearch={(sampleQuery) => runSearch(sampleQuery)}
      />
    </div>
  );
};

export default Index;
