import { useState } from "react";
import {
  HelpCircle,
  Stethoscope,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  ShieldCheck,
  IndianRupee,
  Search,
  MessageSquare,
  SlidersHorizontal,
  Printer,
  History,
  PhoneCall,
  Languages,
  ArrowRight,
  AlertTriangle,
  FileText,
  Compass,
  Zap,
  BookOpen,
  Mic,
  Star,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";

export interface HelpInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: string;
  onStartSampleSearch?: (sampleQuery: string) => void;
}

export const HelpInstructionsDialog = ({
  open,
  onOpenChange,
  language = "en",
  onStartSampleSearch,
}: HelpInstructionsDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>("quickstart");

  const isHindi = language === "hi";
  const isGujarati = language === "gu";

  const handleSampleClick = (query: string) => {
    onOpenChange(false);
    if (onStartSampleSearch) {
      onStartSampleSearch(query);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border/80 shadow-2xl rounded-2xl">
        {/* Header with Title & Badges */}
        <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-secondary/30 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                  <span>{t("help_instructions_title", language)}</span>
                  <Badge variant="outline" className="text-[10px] py-0.5 px-2 border-primary/40 bg-primary/10 text-primary font-semibold">
                    {isHindi ? "मार्गदर्शिका" : isGujarati ? "માર્ગદર્શિકા" : "Interactive Guide"}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("help_instructions_subtitle", language)}
                </DialogDescription>
              </div>
            </div>

            {/* Language Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/80 text-[11px] font-medium text-foreground shadow-2xs">
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">{isHindi ? "भाषा:" : isGujarati ? "ભાષા:" : "Active:"}</span>
              <span className="font-semibold text-primary">
                {isHindi ? "हिन्दी" : isGujarati ? "ગુજરાતી" : "English"}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (5 Sections) */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-3">
            <TabsList className="grid grid-cols-5 w-full bg-secondary/80 p-1 rounded-xl text-xs">
              <TabsTrigger
                value="quickstart"
                onClick={() => setActiveTab("quickstart")}
                className="gap-1.5 py-1.5 text-[11px] font-medium cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 hidden sm:inline" />
                <span>{isHindi ? "त्वरित शुरुआत" : isGujarati ? "ઝડપી શરૂઆત" : "Quick Start"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="triage"
                onClick={() => setActiveTab("triage")}
                className="gap-1.5 py-1.5 text-[11px] font-medium cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-primary hidden sm:inline" />
                <span>{isHindi ? "डॉक्टर एआई" : isGujarati ? "ડૉક્ટર એઆઈ" : "Doctor AI"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="hospitals"
                onClick={() => setActiveTab("hospitals")}
                className="gap-1.5 py-1.5 text-[11px] font-medium cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-500 hidden sm:inline" />
                <span>{isHindi ? "अस्पताल चयन" : isGujarati ? "હોસ્પિટલ શોધ" : "4-Tier Care"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                onClick={() => setActiveTab("costs")}
                className="gap-1.5 py-1.5 text-[11px] font-medium cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5 text-indigo-500 hidden sm:inline" />
                <span>{isHindi ? "खर्च व फिल्टर" : isGujarati ? "ખર્ચ અને ફિલ્ટર" : "Costs & Filters"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="direct"
                onClick={() => setActiveTab("direct")}
                className="gap-1.5 py-1.5 text-[11px] font-medium cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-violet-500 hidden sm:inline" />
                <span>{isHindi ? "56 रोग व आपात" : isGujarati ? "56 રોગો / મદદ" : "56 Diseases & FAQ"}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: QUICK START (5-Step Overview) */}
          {activeTab === "quickstart" && (
            <div className="space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {isHindi
                      ? "मेडीपाथ एआई 5 आसान चरणों में काम करता है"
                      : isGujarati
                      ? "મેડીપાથ એઆઈ 5 સરળ પગલાંમાં કાર્ય કરે છે"
                      : "MediPath AI works in 5 simple, transparent steps"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isHindi
                      ? "प्राकृतिक भाषा में अपने लक्षण बताएं, एआई डॉक्टर से परामर्श लें, और 3 स्रोतों से सत्यापित 4-स्तरीय अस्पताल एवं लागत अनुमान देखें।"
                      : isGujarati
                      ? "તમારી ભાષામાં લક્ષણો જણાવો, એઆઈ ડૉક્ટર સાથે સલાહ લો, અને 3 સ્ત્રોતોમાંથી 4-સ્તરીય હોસ્પિટલ તથા ખર્ચ અંદાજ મેળવો."
                      : "Describe your symptoms naturally in English, Hindi, or Gujarati, consult with Dr. MediPath AI, and discover 4-tier matched hospitals with authentic cost transparency."}
                  </p>
                </div>
              </div>

              {/* 5 Visual Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Step 1 */}
                <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-primary" />
                      {isHindi ? "लक्षण लिखें या बोलें" : isGujarati ? "લક્ષણો લખો અથવા બોલો" : "Describe or Speak Symptoms"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "सर्च बार में अपने लक्षण हिंदी, अंग्रेजी, गुजराती या हिंग्लिश में टाइप करें, या माइक्रोफ़ोन दबाकर बोलें।"
                      : isGujarati
                      ? "સર્ચ બારમાં તમારા લક્ષણો ગુજરાતી, અંગ્રેજી કે હિન્દીમાં ટાઇપ કરો અથવા માઇક્રોફોન દબાવીને બોલો."
                      : "Type symptoms in natural language (English, Hindi, Gujarati, Hinglish) or tap the microphone icon for instant voice dictation."}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      "chest pain & sweating"
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      "छाती में दर्द"
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      "છાતીમાં દુખાવો"
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-primary" />
                      {isHindi ? "एआई डॉक्टर से संवाद" : isGujarati ? "એઆઈ ડૉક્ટર સાથે વાતચીત" : "Interactive Clinical Triage"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "डॉ. मेडीपाथ आपसे आवश्यक अनुवर्ती प्रश्न पूछेंगे। आप त्वरित विकल्प बटन दबा सकते हैं या 'कोई अन्य लक्षण नहीं' पर क्लिक कर सकते हैं।"
                      : isGujarati
                      ? "ડૉ. મેડીપાથ તમને લક્ષણો સ્પષ્ટ કરવા પ્રશ્નો પૂછશે. તમે ઝડપી વિકલ્પો પસંદ કરી શકો છો અથવા 'વધુ લક્ષણો નથી' પર ક્લિક કરી શકો છો."
                      : "Dr. MediPath asks 2–3 targeted follow-up questions. Click the quick-reply buttons or click 'No more symptoms / View Hospitals' anytime."}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      {isHindi ? "4-स्तरीय अस्पताल सिफारिशें" : isGujarati ? "4-સ્તરીય હોસ્પિટલ ભલામણો" : "4-Tier Hospital Recommendations"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "3 एकीकृत स्रोतों (NABH रजिस्ट्री, गूगल प्लेसेस और ओपनस्ट्रीटमैप) से आपकी बीमारी के लिए सही स्तर के अस्पताल देखें।"
                      : isGujarati
                      ? "3 સંકલિત સ્ત્રોતો (NABH રજિસ્ટ્રી, ગૂગલ પ્લેસિસ અને ઓપનસ્ટ્રીટમેપ) થી તમારી બીમારી માટે શ્રેષ્ઠ હોસ્પિટલો મેળવો."
                      : "Explore matched healthcare facilities across 3 verified sources: Accredited Registry (NABH), Live Google Places, and OpenStreetMap."}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                      {isHindi ? "पारदर्शी खर्च व दूरी फिल्टर" : isGujarati ? "પારદર્શક ખર્ચ અને ફિલ્ટર્સ" : "Cost Breakdown & Filters"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "दूरी दायरा (5-50 किमी), केवल NABH मान्यता, और बजट के आधार पर छांटें। डॉक्टर फीस, जांच और सर्जरी का अनुमानित खर्च देखें।"
                      : isGujarati
                      ? "અંતર (5-50 કિમી), NABH માન્યતા અને બજેટ અનુસાર ફિલ્ટર કરો. ઓપીડી, ટેસ્ટ અને સર્જરીનો વાસ્તવિક ખર્ચ અંદાજ જુઓ."
                      : "Filter by radius (5–50km), NABH certification, and hospital tiers. View realistic out-of-pocket costs for OPD, tests, and procedures."}
                  </p>
                </div>

                {/* Step 5 */}
                <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs hover:border-primary/40 transition-colors md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      5
                    </span>
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-primary" />
                      {isHindi ? "तुलना करें, रिपोर्ट प्रिंट करें व सुरक्षित रखें" : isGujarati ? "સરખામણી કરો અને રિપોર્ટ પ્રિન્ટ કરો" : "Compare Facilities & Print Medical Summary"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "3 अस्पतालों की साथ-साथ तुलना करें। अपने डॉक्टर को दिखाने के लिए 'प्रिंट समरी' दबाकर रिपोर्ट सहेजें। लॉग इन करके इतिहास सुरक्षित रखें।"
                      : isGujarati
                      ? "3 હોસ્પિટલોની સામસામે સરખામણી કરો. તમારા ડૉક્ટર માટે 'પ્રિન્ટ સમરી' રિપોર્ટ બનાવો. હિસ્ટ્રી સાચવવા લૉગ ઇન કરો."
                      : "Select up to 3 hospitals for side-by-side comparison. Click 'Print Summary' to generate an authoritative clinical report for your doctor."}
                  </p>
                </div>
              </div>

              {/* Sample Queries Clickable */}
              <div className="pt-2">
                <h5 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {isHindi ? "एक क्लिक में नमूना खोज आज़माएं:" : isGujarati ? "નમૂના શોધ ક્લિક કરીને શરૂ કરો:" : "Try a sample inquiry in one click:"}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Chest pain, shortness of breath, left arm radiation", tag: "Cardiology" },
                    { label: "High fever, chills, severe joint pain for 3 days", tag: "General Medicine" },
                    { label: "Severe blurred vision and cloudiness in right eye", tag: "Ophthalmology" },
                    { label: "Burning sensation during urination with lower abdominal pain", tag: "Urology" },
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSampleClick(sample.label)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-primary/10 border border-border hover:border-primary/30 text-xs text-foreground transition-all cursor-pointer group text-left"
                    >
                      <span className="font-medium group-hover:text-primary transition-colors">{sample.label}</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary/20 text-primary">
                        {sample.tag}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCTOR AI TRIAGE DETAILS */}
          {activeTab === "triage" && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {isHindi ? "डॉ. मेडीपाथ क्लिनिकल ट्रायज कैसे काम करता है" : isGujarati ? "ડૉ. મેડીપાથ ક્લિનિકલ ટ્રાયેજ કેવી રીતે કાર્ય કરે છે" : "How Dr. MediPath Clinical Triage Operates"}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHindi
                    ? "मेडीपाथ एआई मॉडल 2.0 का उपयोग करके आपके बताए गए लक्षणों का मूल्यांकन करता है, संभावित बीमारियों की संभावना और आईसीडी-10 कोड निर्धारित करता है।"
                    : isGujarati
                    ? "મેડીપાથ એઆઈ મોડેલ 2.0 નો ઉપયોગ કરીને તમારા લક્ષણોનું પૃથ્થકરણ કરે છે અને સંભવિત રોગ તથા ICD-10 કોડ નક્કી કરે છે."
                    : "MediPath AI utilizes Clinical Triage Model 2.0 to evaluate symptomatic evidence, estimate disease probability, map ICD-10 codes, and pinpoint the right clinical specialty."}
                </p>
              </div>

              {/* Triage Features */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-border/80 bg-card flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isHindi ? "त्वरित विकल्प बटन (Quick Reply Chips)" : isGujarati ? "ઝડપી પ્રત્યુત્તર બટનો" : "One-Tap Quick Reply Chips"}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isHindi
                        ? "डॉक्टर द्वारा पूछे गए सवालों के जवाब देने के लिए सुझाव चिप्स पर टैप करें (जैसे '3 दिन से', 'हल्का दर्द', 'पसीना आना')। आपको लंबा टाइप करने की आवश्यकता नहीं है।"
                        : isGujarati
                        ? "ડૉક્ટરના પ્રશ્નોના જવાબ માટે સૂચવેલા બટનો દબાવો (જેમ કે '3 દિવસથી', 'તીવ્ર દુખાવો', 'ચક્કર આવવા'). ટાઇપિંગ કરવાની જરૂર નથી."
                        : "Tap any suggested chip (e.g. 'Since 2 days', 'Moderate severity', 'Accompanied by sweating') to respond instantly without typing."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-card flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isHindi ? "'कोई अन्य लक्षण नहीं' बटन" : isGujarati ? "'વધુ લક્ષણો નથી' બટન" : "'No more symptoms / View Hospitals' Button"}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isHindi
                        ? "यदि आप और सवालों के जवाब नहीं देना चाहते हैं, तो किसी भी समय 'No more symptoms' दबाकर तुरंत अस्पताल देख सकते हैं।"
                        : isGujarati
                        ? "જો તમે વધુ પ્રશ્નોના જવાબ ન આપવા માંગતા હો, તો ગમે ત્યારે 'વધુ લક્ષણો નથી' બટન દબાવીને સીધા હોસ્પિટલો જોઈ શકો છો."
                        : "You don't need to answer endless questions. Tap 'No more symptoms / View Hospitals' at any turn to immediately route to hospitals."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-destructive">
                      {isHindi ? "आपातकालीन चेतावनी (Red Flag Warnings)" : isGujarati ? "તાત્કાલિક ચેતવણી (Emergency Red Flags)" : "Emergency Red Flag Detection"}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isHindi
                        ? "यदि गंभीर लक्षण (जैसे सीने में असहनीय दबाव, खून की उल्टी या बेहोशी) पहचाने जाते हैं, तो प्रणाली तुरंत आपातकालीन चेतावनी दिखाएगी और नजदीकी आपातकालीन केंद्र जाने की सलाह देगी।"
                        : isGujarati
                        ? "જો ગંભીર લક્ષણો (જેમ કે છાતીમાં તીવ્ર દબાણ કે શ્વાસ રુંધાવો) જોવા મળે, તો સિસ્ટમ તાત્કાલિક એમ્બ્યુલન્સ અથવા ઇમરજન્સી સેવા 108/112 નો સંપર્ક કરવાની સલાહ આપશે."
                        : "Critical symptoms trigger immediate emergency alerts with helpline numbers (108 / 112) advising immediate emergency room visit."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 4-TIER HOSPITALS & 3 DATA SOURCES */}
          {activeTab === "hospitals" && (
            <div className="space-y-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {isHindi ? "3 डेटा स्रोत और 4-स्तरीय नैदानिक मिलान" : isGujarati ? "3 ડેટા સ્ત્રોતો અને 4-સ્તરીય મેચિંગ" : "3 Verified Data Sources & 4-Tier Clinical Matching"}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHindi
                    ? "मेडीपाथ किसी एक स्रोत पर निर्भर नहीं है; यह 3 प्रामाणिक स्रोतों से डेटा एकत्रित करके आपकी बीमारी की गंभीरता के आधार पर सही अस्पताल चुनता है।"
                    : isGujarati
                    ? "મેડીપાથ 3 વિશ્વસનીય સ્ત્રોતોમાંથી હોસ્પિટલો શોધીને તમારા રોગ અનુસાર યોગ્ય સ્તર નક્કી કરે છે."
                    : "MediPath AI combines 3 authoritative sources and classifies facilities into 4 distinct medical care tiers tailored to your diagnosis."}
                </p>
              </div>

              {/* The 3 Sources */}
              <div>
                <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  {isHindi ? "3 एकीकृत डेटा स्रोत:" : isGujarati ? "3 સંકલિત ડેટા સ્ત્રોતો:" : "The 3 Integrated Data Sources:"}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{isHindi ? "मान्यता प्राप्त रजिस्ट्री" : isGujarati ? "ચકાસાયેલ રજિસ્ટ્રી" : "Verified Registry"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isHindi
                        ? "NABH/JCI प्रमाणित अस्पताल, सत्यापित डॉक्टर संख्या, बेड और आईसीयू क्षमता।"
                        : isGujarati
                        ? "NABH/JCI પ્રમાણિત હોસ્પિટલો, ડૉક્ટર સંખ્યા, આઈસીયુ ક્ષમતા."
                        : "NABH / JCI accredited partner hospitals with verified doctor count, beds, and ICU tariffs."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{isHindi ? "गूगल प्लेसेस लाइव" : isGujarati ? "ગૂગલ પ્લેસિસ લાઇવ" : "Google Places Live"}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isHindi
                        ? "निकटतम चिकित्सा केंद्र, लाइव रेटिंग, समीक्षाएं और गूगल मैप्स दिशा-निर्देश।"
                        : isGujarati
                        ? "નજીકના તબીબી કેન્દ્રો, લાઈવ રેટિંગ, સમીક્ષાઓ અને નકશા દિશાઓ."
                        : "Real-time nearby medical centers, live star ratings, patient reviews, and 1-tap Google Maps."}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Compass className="w-4 h-4 text-blue-500" />
                      <span>OpenStreetMap (OSM)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isHindi
                        ? "खुला भौगोलिक स्वास्थ्य नेटवर्क जो पूरे भारत के छोटे-बड़े क्लीनिक कवर करता है।"
                        : isGujarati
                        ? "ઓપન ભૌગોલિક નેટવર્ક જે સમગ્ર ભારતના ક્લિનિક્સ અને હોસ્પિટલો આવરે છે."
                        : "Open community geographic healthcare network providing expansive local coverage."}
                    </p>
                  </div>
                </div>
              </div>

              {/* The 4 Tiers */}
              <div className="pt-1">
                <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  {isHindi ? "4 अस्पताल स्तर (Hospital Care Tiers):" : isGujarati ? "4 હોસ્પિટલ સ્તર:" : "4 Hospital Care Tiers:"}
                </h5>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground text-[10px]">Tier 1</Badge>
                      <span className="text-xs font-semibold text-foreground">
                        {isHindi ? "विशिष्ट तृतीयक केंद्र (Specialized Tertiary Centers)" : isGujarati ? "વિશિષ્ટ ટર્શરી હોસ્પિટલો" : "Specialized Tertiary Centers"}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {isHindi ? "आपकी बीमारी का समर्पित विभाग" : isGujarati ? "સમર્પિત વિશેષ વિભાગ" : "Dedicated Super-Specialty Wing"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">Tier 2</Badge>
                      <span className="text-xs font-semibold text-foreground">
                        {isHindi ? "मल्टी-स्पेशियलिटी अस्पताल" : isGujarati ? "મલ્ટી-સ્પેશિયાલિટી હોસ્પિટલો" : "Multi-Specialty Care"}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {isHindi ? "आईसीयू, सर्जरी और इनपेशेंट वार्ड" : isGujarati ? "આઈસીયુ અને ઈનપેશન્ટ વોર્ડ" : "Inpatient wards, ICU & diagnostics"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">Tier 3</Badge>
                      <span className="text-xs font-semibold text-foreground">
                        {isHindi ? "सामान्य व सिविल अस्पताल" : isGujarati ? "સામાન્ય અને સિવિલ હોસ્પિટલો" : "General & Secondary Hospitals"}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {isHindi ? "सुलभ और किफायती स्वास्थ्य सेवाएं" : isGujarati ? "કિફાયતી આરોગ્ય સેવાઓ" : "Affordable secondary care"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">Tier 4</Badge>
                      <span className="text-xs font-semibold text-foreground">
                        {isHindi ? "प्राथमिक स्वास्थ्य केंद्र व क्लीनिक" : isGujarati ? "પ્રાથમિક આરોગ્ય કેન્દ્રો અને ક્લિનિક" : "Community Clinics & Dispensaries"}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {isHindi ? "स्थानीय ओपीडी और प्राथमिक जांच" : isGujarati ? "સ્થાનિક ઓપીડી અને સામાન્ય સારવાર" : "Local day-care and primary checkups"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COSTS & FILTERS */}
          {activeTab === "costs" && (
            <div className="space-y-4">
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <IndianRupee className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {isHindi ? "लागत पारदर्शिता और स्मार्ट फिल्टर" : isGujarati ? "ખર્ચ પારદર્શિતા અને સ્માર્ટ ફિલ્ટર્સ" : "Cost Transparency & Smart Filters"}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHindi
                    ? "अस्पताल जाने से पहले डॉक्टर फीस, रक्त जांच, सर्जरी और आईसीयू बेड का यथार्थवादी खर्च अनुमान जानें।"
                    : isGujarati
                    ? "હોસ્પિટલ જતાં પહેલાં ડૉક્ટર ફી, લેબ ટેસ્ટ, ઓપરેશન અને આઈસીયુ બેડના વાસ્તવિક ખર્ચનો અંદાજ મેળવો."
                    : "Know your out-of-pocket healthcare expenses in advance across 4 distinct cost categories before visiting a hospital."}
                </p>
              </div>

              {/* Cost Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <h5 className="text-xs font-bold text-foreground">
                      {isHindi ? "ओपीडी परामर्श शुल्क (Doctor OPD)" : isGujarati ? "ઓપીડી પરામર્શ ફી" : "Doctor OPD Consultation"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "विशेषज्ञ डॉक्टर की पहली परामर्श फीस का सटीक अनुमान (उदा. ₹500 - ₹1,500)।"
                      : isGujarati
                      ? "નિષ્ણાત ડૉક્ટરની પ્રથમ વિઝીટ ફીનો અંદાજ (દા.ત. ₹500 - ₹1,500)."
                      : "Standard out-of-pocket specialist consultation fees (typically ₹400 – ₹1,500 depending on city tier)."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <h5 className="text-xs font-bold text-foreground">
                      {isHindi ? "नैदानिक जांच (Diagnostic Tests)" : isGujarati ? "નિદાન પરીક્ષણો" : "Diagnostic & Pathology Tests"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "एक्स-रे, सीटी स्कैन, एमआरआई, ईसीजी और रक्त जांच की अनुमानित दरें।"
                      : isGujarati
                      ? "એક્સ-રે, સીટી સ્કેન, એમઆરઆઈ, ઈસીજી અને લેબ ટેસ્ટના અંદાજિત દર."
                      : "Estimated pathology and radiology tests (ECG, Blood Profile, CT/MRI) tailored to the diagnosed condition."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h5 className="text-xs font-bold text-foreground">
                      {isHindi ? "प्रक्रिया व सर्जरी शुल्क (Procedures)" : isGujarati ? "સર્જરી અને પ્રોસિજર શુલ્ક" : "Medical Procedure & Surgery"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "संबंधित बीमारी की मानक सर्जरी, एनेस्थीसिया और ओटी का पारदर्शी खर्च।"
                      : isGujarati
                      ? "સંબંધિત રોગની સર્જરી, એનેસ્થેસિયા અને ઓપરેશન થિયેટરનો અંદાજ."
                      : "Transparent procedure packages including surgeon, OT, and clinical consumables."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <h5 className="text-xs font-bold text-foreground">
                      {isHindi ? "कमरा व आईसीयू शुल्क (Room / ICU Per Day)" : isGujarati ? "રૂમ અને આઈસીયુ શુલ્ક" : "Room Tariff & ICU Per Day"}
                    </h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isHindi
                      ? "जनरल वार्ड, सेमी-प्राइवेट, प्राइवेट और वेंटिलेटर आईसीयू का दैनिक शुल्क।"
                      : isGujarati
                      ? "જનરલ વોર્ડ, પ્રાઇવેટ રૂમ અને આઈસીયુ બેડના દૈનિક દરો."
                      : "Daily bed tariff rates for General wards, Twin-sharing, Private rooms, and ICU beds."}
                  </p>
                </div>
              </div>

              {/* Using the Filters */}
              <div className="p-3.5 rounded-xl border border-border bg-secondary/30">
                <h5 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  {isHindi ? "फिल्टर पैनल का उपयोग कैसे करें:" : isGujarati ? "ફિલ્ટર પેનલનો ઉપયોગ:" : "How to use the Filters Panel:"}
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <strong className="text-foreground">{isHindi ? "दूरी दायरा (Radius):" : isGujarati ? "અંતર:" : "Radius Slider:"}</strong>{" "}
                    {isHindi ? "5 किमी से 50 किमी तक अपनी सुविधा अनुसार दायरा चुनें।" : isGujarati ? "5 કિમી થી 50 કિમી સુધી અનુકૂળ વિસ્તાર પસંદ કરો." : "Adjust between 5km to 50km to expand or tighten local results."}
                  </li>
                  <li>
                    <strong className="text-foreground">{isHindi ? "NABH मान्यता:" : isGujarati ? "NABH માન્યતા:" : "NABH Accredited Only:"}</strong>{" "}
                    {isHindi ? "गुणवत्तापूर्ण देखभाल के लिए केवल प्रमाणित अस्पताल चुनें।" : isGujarati ? "ગુણવત્તાયુક્ત સંભાળ માટે પ્રમાણિત હોસ્પિટલો ફિલ્ટર કરો." : "Toggle to display only certified, quality-audited hospitals."}
                  </li>
                  <li>
                    <strong className="text-foreground">{isHindi ? "अधिकतम बजट:" : isGujarati ? "બજેટ:" : "Max Budget Slider:"}</strong>{" "}
                    {isHindi ? "अपने परिवार के वित्तीय बजट के अनुसार अस्पताल खोजें।" : isGujarati ? "તમારા બજેટ અનુસાર પરવડે તેવી હોસ્પિટલો શોધો." : "Filter facilities to fit within your expected insurance or cash budget."}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: 56 DISEASES DIRECT ROUTING & FAQ */}
          {activeTab === "direct" && (
            <div className="space-y-4">
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {isHindi ? "56 रोगों की सीधी डिरेक्टरी व आपातकालीन सहायता" : isGujarati ? "56 રોગોની ડિરેક્ટરી અને કટોકટી મદદ" : "56 Canonical Diseases Directory & Emergency Helpline"}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHindi
                    ? "यदि आपके पास पहले से डॉक्टर का निदान है, तो आप लक्षण परामर्श को छोड़कर सीधे अस्पताल सूची पर जा सकते हैं।"
                    : isGujarati
                    ? "જો તમારી પાસે પહેલેથી જ ડૉક્ટરનું નિદાન હોય, તો તમે સીધા યોગ્ય હોસ્પિટલ પસંદ કરી શકો છો."
                    : "If you already hold a diagnosed condition from a physician, skip triage and route directly to specialized hospitals with 100% confidence."}
                </p>
              </div>

              {/* Direct Routing Instructions */}
              <div className="p-3.5 rounded-xl border border-border bg-card">
                <h5 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  {isHindi ? "सीधे रोग चयन का उपयोग कैसे करें:" : isGujarati ? "સીધા રોગ પસંદગીનો ઉપયોગ:" : "How to use Direct Disease Selection:"}
                </h5>
                <p className="text-xs text-muted-foreground">
                  {isHindi
                    ? "हेडर में '56 रोग' बटन पर क्लिक करें या होमपेज पर 'Direct Disease Selection' चुनें। कार्डियोलॉजी, ऑन्कोलॉजी, ऑर्थोपेडिक्स, न्यूरोलॉजी और जनरल मेडिसिन सहित 56 स्थितियों में से अपना रोग चुनें।"
                    : isGujarati
                    ? "હેડરમાં '56 રોગો' બટન દબાવો અથવા હોમપેજ પર 'Direct Disease Selection' પસંદ કરો. 56 રોગોમાંથી તમારો રોગ પસંદ કરો અને તરત જ હોસ્પિટલો મેળવો."
                    : "Click the '56 Diseases' button in the top header or choose 'Direct Disease Selection' on the homepage. Browse categories (Cardiology, Orthopedics, Oncology, General Medicine) and select your disease to get instant recommendations."}
                </p>
              </div>

              {/* Emergency Helpline Numbers */}
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-2 mb-2">
                  <PhoneCall className="w-4 h-4 text-destructive" />
                  <h5 className="text-xs font-bold text-destructive uppercase tracking-wide">
                    {isHindi ? "भारत में आपातकालीन हेल्पलाइन नंबर:" : isGujarati ? "ભારતમાં ઇમરજન્સી હેલ્પલાઇન નંબરો:" : "National Emergency Helpline Numbers (India):"}
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                  <div className="bg-background/80 border border-border/80 rounded-lg p-2.5 text-center">
                    <span className="text-lg font-black text-destructive block">112</span>
                    <span className="text-[11px] text-muted-foreground">{isHindi ? "अखिल भारतीय आपातकालीन नंबर" : isGujarati ? "અખિલ ભારતીય ઇમરજન્સી" : "All-in-One Emergency"}</span>
                  </div>
                  <div className="bg-background/80 border border-border/80 rounded-lg p-2.5 text-center">
                    <span className="text-lg font-black text-destructive block">108</span>
                    <span className="text-[11px] text-muted-foreground">{isHindi ? "चिकित्सा एम्बुलेंस सेवा" : isGujarati ? "મેડિકલ એમ્બ્યુલન્સ સેવા" : "Medical Ambulance Services"}</span>
                  </div>
                  <div className="bg-background/80 border border-border/80 rounded-lg p-2.5 text-center">
                    <span className="text-lg font-black text-destructive block">102</span>
                    <span className="text-[11px] text-muted-foreground">{isHindi ? "मातृ एवं शिशु स्वास्थ्य" : isGujarati ? "માતૃ અને શિશુ સહાય" : "Maternal & Child Transport"}</span>
                  </div>
                </div>
              </div>

              {/* Nerd Hub tip */}
              <div className="p-3 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">Nerd Hub</Badge>
                  <span className="text-muted-foreground">
                    {isHindi
                      ? "एआई मॉडल आर्किटेक्चर और मेट्रिक्स देखने के लिए हेडर में 'All Models' पर क्लिक करें।"
                      : isGujarati
                      ? "એઆઈ મોડેલ આર્કિટેક્ચર અને મેટ્રિક્સ જોવા હેડરમાં 'All Models' પર ક્લિક કરો."
                      : "Want to inspect mathematical formulas and model benchmarks? Click 'All Models: 3/3 Online' in the header."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/60 bg-secondary/20 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              {isHindi
                ? "मेडीपाथ एआई निर्णय सहायता उपकरण है; आपातकाल में तुरंत डॉक्टर से संपर्क करें।"
                : isGujarati
                ? "મેડીપાથ એઆઈ નિર્ણય સહાયક મંચ છે; કટોકટીમાં તાત્કાલિક ડૉક્ટરનો સંપર્ક કરો."
                : "MediPath AI is a decision support tool; seek certified medical care for acute emergencies."}
            </span>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="gap-2 text-xs font-semibold px-4 h-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer ml-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t("got_it_btn", language) || "Got It, Let's Start"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
