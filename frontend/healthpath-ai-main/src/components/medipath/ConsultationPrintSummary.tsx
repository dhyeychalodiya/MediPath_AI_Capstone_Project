import React from "react";
import { Printer, ShieldCheck, Stethoscope, AlertTriangle, FileText, Bot, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorTriageV2Candidate, AssessmentStatus } from "@/services/hospitalService";
import { t, localizeConditionName, localizeSpecialty, localizeUrgency, localizeDecisionSource } from "@/lib/i18n";

export type PrintMessage = {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  canonicalText?: string;
  options?: string[];
  canonicalOptions?: string[];
  isQuestion?: boolean;
  isAssessmentCard?: boolean;
  timestamp?: string;
};

type Props = {
  initialSymptoms: string;
  allSymptomsText: string;
  messages?: PrintMessage[];
  confirmedCondition?: DoctorTriageV2Candidate | null;
  assessmentStatus?: AssessmentStatus;
  confidenceScore?: number | null;
  safeDeferReason?: string | null;
  topCandidates?: DoctorTriageV2Candidate[];
  className?: string;
  language?: string;
};

export const ConsultationPrintSummary: React.FC<Props> = ({
  initialSymptoms,
  allSymptomsText,
  messages = [],
  confirmedCondition = null,
  assessmentStatus = "needs_more_information",
  confidenceScore = null,
  safeDeferReason = null,
  topCandidates = [],
  className = "",
  language = "en",
}) => {
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isEmergency =
    assessmentStatus === "emergency_override" ||
    confirmedCondition?.decisionSource === "emergency_override" ||
    confirmedCondition?.urgency === "emergency";

  const isSafeDefer =
    assessmentStatus === "safe_defer" ||
    confirmedCondition?.decisionSource === "safe_defer" ||
    Boolean(safeDeferReason);

  // Authoritative confidence score handling:
  // If safe deferral or score unavailable, display Score unavailable (Safe Deferral)
  // If valid number from props or confirmedCondition, display the real percentage
  const effectiveConfidence =
    typeof confidenceScore === "number" && !isNaN(confidenceScore)
      ? confidenceScore
      : typeof confirmedCondition?.confidence === "number" && !isNaN(confirmedCondition.confidence)
      ? confirmedCondition.confidence
      : null;

  const hasValidScore = typeof effectiveConfidence === "number";
  const displayScoreText = isSafeDefer || !hasValidScore
    ? "Score unavailable (Safe Deferral)"
    : `${Math.round(effectiveConfidence)}%`;

  const languageLabel =
    language === "hi"
      ? "हिन्दी (Hindi)"
      : language === "gu"
      ? "ગુજરાતી (Gujarati)"
      : "English";

  // Filter messages to ensure only valid dialogue turns are printed (assessment cards stay in chat, not printed in log)
  const printableMessages = messages.filter((m) => m && String(m.text || "").trim().length > 0 && !m.isAssessmentCard);

  return (
    <div
      className={`print-summary print:block hidden font-sans text-slate-900 bg-white p-6 md:p-8 max-w-4xl mx-auto ${className}`}
      id="printable-consultation-summary"
    >
      {/* ── 1. REPORT HEADER ── */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start print-page-break-avoid">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
              MediPath AI
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-mono font-semibold">
              MedP_AI_V2.0
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Clinical Symptom Consultation & Care Navigation Summary
          </p>
        </div>
        <div className="text-right text-xs text-slate-600 space-y-0.5">
          <div><span className="font-semibold text-slate-700">Date:</span> {currentDate}</div>
          <div><span className="font-semibold text-slate-700">Time:</span> {currentTime}</div>
          <div><span className="font-semibold text-slate-700">Consultation Language:</span> {languageLabel}</div>
        </div>
      </div>

      {/* ── 2. PROMINENT NON-DIAGNOSTIC SAFETY NOTICE ── */}
      <div className="border-l-4 border-amber-600 bg-amber-50/90 p-4 mb-6 rounded-r print-page-break-avoid">
        <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Non-Diagnostic Clinical Navigation Notice</span>
        </h2>
        <p className="text-xs text-amber-950 leading-relaxed">
          This summary contains preliminary healthcare-navigation information and is not a medical diagnosis. A qualified healthcare professional must confirm the actual cause. Final diagnosis and medical treatment must be confirmed through in-person clinical evaluation. In the event of acute chest pain, severe shortness of breath, sudden neurological weakness, loss of consciousness, or profuse bleeding, proceed immediately to the nearest Emergency Department.
        </p>
      </div>

      {/* ── 3. AUTHORITATIVE CLINICAL ASSESSMENT SUMMARY ── */}
      <div className="border border-slate-300 rounded-lg p-5 mb-6 bg-slate-50/60 print-page-break-avoid">
        <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isEmergency
                ? "Priority Clinical Alert"
                : isSafeDefer
                ? "Navigation Status (Safe Deferral)"
                : "Identified Possible Cause Category"}
            </span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {confirmedCondition
                ? localizeConditionName(confirmedCondition.condition, language)
                : isSafeDefer
                ? "General Care Clinical Referral"
                : "In-Progress Consultation"}
            </span>
            {confirmedCondition?.icd10 && (
              <span className="text-xs text-slate-600 font-mono mt-0.5 block">
                ICD-10 Code: {confirmedCondition.icd10}
              </span>
            )}
          </div>

          <div className="text-right space-y-1.5 shrink-0">
            <div>
              <span className="text-xs text-slate-500 font-semibold mr-2">Urgency:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${
                  isEmergency
                    ? "bg-red-100 text-red-900 border-red-300"
                    : confirmedCondition?.urgency === "urgent"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                {confirmedCondition?.urgency ? localizeUrgency(confirmedCondition.urgency, language) : "Routine"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold mr-2">Decision Protocol:</span>
              <span className="text-xs text-slate-800 font-medium">
                {isEmergency
                  ? "Emergency Rule Override"
                  : isSafeDefer
                  ? "Safe Deferral Protocol"
                  : "Multi-Label ML Inference (Model 2.0)"}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold mr-2">Model Confidence:</span>
              <span className={`text-xs font-bold ${isSafeDefer || !hasValidScore ? "text-amber-800" : "text-emerald-800"}`}>
                {displayScoreText}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Care Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 text-xs">
          <div className="border border-slate-200 bg-white p-3 rounded">
            <span className="font-semibold text-slate-700 block mb-0.5">Recommended First Point of Care:</span>
            <span className="text-slate-900 font-bold text-sm">
              {confirmedCondition?.specialization
                ? localizeSpecialty(confirmedCondition.specialization, language)
                : "General Medicine / Physician"}
            </span>
          </div>

          <div className="border border-slate-200 bg-white p-3 rounded">
            <span className="font-semibold text-slate-700 block mb-0.5">Matched Care Procedure:</span>
            <span className="text-slate-900 font-medium">
              {confirmedCondition?.procedure || "In-Person Clinical Assessment & Diagnostic Workup"}
            </span>
          </div>
        </div>

        {/* Reported Clinical Symptoms Evidence */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 text-xs">
          <span className="font-semibold text-slate-700 block mb-0.5">Reported Clinical Symptoms:</span>
          <p className="text-slate-900 font-medium">
            {allSymptomsText || initialSymptoms || "None recorded"}
          </p>
        </div>

        {/* Safe Deferral Reason Explanation */}
        {isSafeDefer && safeDeferReason && (
          <div className="mt-3.5 p-3 rounded border border-amber-300 bg-amber-50/70 text-xs">
            <span className="font-bold text-amber-950 block mb-0.5">Safe Deferral Reason:</span>
            <p className="text-amber-900 leading-relaxed">{safeDeferReason}</p>
          </div>
        )}

        {/* Differential Candidates Considered */}
        {topCandidates && topCandidates.length > 1 && (
          <div className="mt-3.5 pt-3 border-t border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-1">Differential Hypotheses Evaluated:</span>
            <div className="flex flex-wrap gap-2">
              {topCandidates.slice(0, 4).map((cand, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px]"
                >
                  <span className="font-medium">{cand.condition}</span>
                  {typeof cand.modelProbability === "number" && (
                    <span className="font-mono text-slate-500">
                      ({Math.round(cand.modelProbability * 100)}%)
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. COMPLETE ORDERED CONVERSATION HISTORY ── */}
      <div className="mb-6">
        <div className="border-b-2 border-slate-800 pb-1.5 mb-3.5 flex justify-between items-baseline print-page-break-avoid">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-700" />
            <span>Complete Consultation Dialogue & Clinical Evidence Log</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {printableMessages.length} Recorded Exchanges
          </span>
        </div>

        <div className="space-y-3">
          {printableMessages.map((msg, idx) => {
            const isPatient = msg.sender === "patient";

            return (
              <div
                key={msg.id || idx}
                className={`p-3.5 rounded-lg border text-xs leading-relaxed print-page-break-avoid ${
                  isPatient
                    ? "bg-blue-50/70 border-blue-200 ml-4"
                    : "bg-slate-50/90 border-slate-200 mr-4"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-200/60">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    {isPatient ? (
                      <>
                        <User className="w-3 h-3 text-blue-700" />
                        <span className="text-blue-900">Patient Response</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-slate-700" />
                        <span className="text-slate-900">Dr. MediPath AI</span>
                      </>
                    )}
                  </span>

                  {msg.timestamp && (
                    <span className="text-[10px] text-slate-500 font-mono select-none">
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                {/* Message Body */}
                <p className="text-slate-900 font-normal whitespace-pre-wrap">{msg.text}</p>

                {/* Canonical English note if translated */}
                {msg.canonicalText && msg.canonicalText !== msg.text && (
                  <p className="text-[11px] text-slate-600 italic mt-1 pt-1 border-t border-slate-200/50">
                    Clinical Translation: "{msg.canonicalText}"
                  </p>
                )}

                {/* Presented Option Chips (if question turn) */}
                {msg.isQuestion && Array.isArray(msg.options) && msg.options.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1.5">
                      Candidate Differential Options Presented:
                    </span>
                    <span className="text-slate-700 font-medium">
                      {msg.options.join(" • ")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. RECOMMENDED NEXT STEPS & CLINICAL ADVISORY ── */}
      <div className="p-4 bg-slate-100/80 rounded-lg border border-slate-300 text-xs mb-6 print-page-break-avoid">
        <span className="font-bold text-slate-900 block mb-1">Recommended Next Step:</span>
        <p className="text-slate-800 leading-relaxed">
          {isSafeDefer
            ? "Schedule an in-person appointment with a General Physician for comprehensive physical examination, laboratory testing, and specialist care routing."
            : isEmergency
            ? "Proceed immediately to the nearest Emergency Department or call national emergency medical services (108/112)."
            : `Schedule a consultation with a specialist in ${confirmedCondition?.specialization || "General Medicine"} for formal clinical diagnostic evaluation and management.`}
        </p>
      </div>

      {/* ── 6. DOCUMENT FOOTER ── */}
      <div className="border-t border-slate-300 pt-3 text-[10px] text-slate-500 text-center space-y-0.5 print-page-break-avoid">
        <p>MediPath AI Healthcare Navigation System · Generated locally for patient personal record keeping.</p>
        <p>Confidential medical summary · Does not contain authentication credentials or personal identity data.</p>
      </div>
    </div>
  );
};

export const PrintSummaryButton = ({ onClick }: { onClick?: () => void }) => {
  const handlePrint = () => {
    if (onClick) {
      onClick();
    } else {
      window.print();
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handlePrint}
      className="border-slate-300 dark:border-border hover:bg-secondary text-foreground text-xs font-semibold gap-2 rounded-xl h-12 px-4 shadow-xs transition-all cursor-pointer no-print"
      title="Print or save PDF copy of complete consultation report"
    >
      <Printer className="w-4 h-4 text-primary" />
      <span>Print / Save Summary</span>
    </Button>
  );
};
