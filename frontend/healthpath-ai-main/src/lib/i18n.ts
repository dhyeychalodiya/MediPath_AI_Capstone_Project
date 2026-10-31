/**
 * MediPath AI - Centralized Localization System
 * 
 * Provides stable, instant UI localization dictionaries for English, Hindi, and Gujarati,
 * with graceful fallback to English for any unsupported keys or languages.
 * 
 * CRITICAL ARCHITECTURAL BOUNDARIES:
 * - Localizes presentation labels only.
 * - Does NOT alter cost calculation formulas, pricing data, or numerical values.
 * - Does NOT alter hospital names, IDs, coordinates, or official addresses.
 * - Model 2.0 clinical evaluation logic remains in canonical English.
 */

export type SupportedLanguage = "en" | "hi" | "gu" | string;

export interface TranslationDictionary {
  [key: string]: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English", speechLocale: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", speechLocale: "hi-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", speechLocale: "gu-IN" },
];

const en: TranslationDictionary = {
  // Brand & Header
  brand_title: "MediPath AI",
  tagline: "Healthcare Decision Support Platform",
  doctor_ai: "Doctor AI",
  find_hospitals: "Find Hospitals",
  print_summary: "Print Summary",
  reset: "Reset",
  model_active: "Model 2.0 Active",
  login: "Login",
  sign_out: "Sign out",
  welcome_user: "Welcome, {name} · MediPath ID {id}",
  download_desktop_app: "Download App",
  download_for_windows: "Download for Windows",
  desktop_edition: "Desktop Edition",
  offline_ready: "Offline Ready",
  offline_clinical_active: "Offline Clinical Mode Active",

  // Home Page
  hero_badge: "AI-powered healthcare guidance for India",
  hero_title_1: "Find the right care, at the",
  hero_title_2: "right hospital, at the right cost.",
  hero_subtitle: "Describe your symptoms or procedure in any Indian language or English. MediPath AI maps it to a possible condition and shows nearby hospitals with transparent cost estimates.",
  try_label: "Try:",
  feature_multilingual: "Hindi, Gujarati & English",
  feature_costs: "Transparent costs",
  feature_nabh: "NABH-verified",
  footer_text: "MediPath AI · Healthcare Decision Support Platform",

  // SearchBar
  search_placeholder: "Describe your symptoms, illness, or procedure...",
  search_button: "Find Care",
  consult_doctor: "Consult Doctor AI",
  listening: "Listening...",
  speak_prompt: "Speak your symptoms...",
  stop_listening: "Stop listening",
  select_language: "Select language",
  clear: "Clear",
  model_version: "Model Version",
  mic_unavailable: "Microphone access requires microphone permission or compatible browser.",
  search_empty_error: "Please enter or speak your symptoms to begin consultation.",

  // LocationFilter
  showing_hospitals_near: "Showing hospitals near:",
  use_my_location: "Use my location",
  scope_city: "City",
  scope_state: "State",
  scope_all_india: "All India",
  select_city: "Select city",

  // DoctorConsultationPanel
  consultation_title: "Dr. MediPath · AI Clinical Navigator",
  consultation_subtitle: "56 Canonical Primary-Care Classes · Clarification & Hospital Routing",
  model_confidence: "Model Confidence",
  model_confidence_caption: "Model 2.0 statistical alignment across 56 primary-care classes. Preliminary guidance, not a definitive diagnosis.",
  updating_assessment: "Updating assessment...",
  score_unavailable: "Score unavailable (Safe Deferral)",
  differential_threshold: "Differential Threshold: 85%",
  candidate_single: "1 candidate disease",
  candidates_count: "{count} candidates",
  pattern_alignment: "Pattern Alignment:",
  alignment_high: "High Alignment",
  alignment_narrowing: "Narrowing Down",
  alignment_exploring: "Exploring Patterns",
  turn_0_mandatory: "Mandatory Turn 0 Follow-up",
  turn_clarifying: "Turn {n}: Clarifying Evidence",
  evidence_btn: "Evidence",
  evidence_panel_title: "Clinical Evidence & Reasoning Log",
  no_more_symptoms: "No more symptoms (View Results)",
  type_placeholder: "Type any other symptoms or sensations manually...",
  thinking_message: "Dr. MediPath is analyzing your clinical symptoms...",
  send_button: "Send",
  proceed_to_hospitals: "Find Nearby Hospitals",
  possible_cause_identified: "Possible Clinical Match Identified",
  urgency: "Urgency",
  recommended_specialist: "Recommended Specialist",
  back_to_search: "Back to Search",
  emergency_alert: "CRITICAL EMERGENCY",
  safe_deferral_badge: "Clinical Consultation Recommended",
  action_find_hospitals: "Action: Find Nearby Hospitals",
  reported_symptoms: "Reported Symptoms",
  candidate_conditions: "Candidate Conditions",
  clinical_decision_route: "Clinical Decision Route",
  summary_preview: "Summary Preview",
  close_panel: "Close",

  // Hospital ResultsView & Filters
  results_title: "Hospitals Matching Your Care Needs",
  hospitals_found_count: "{n} Hospitals Found for Your Condition",
  showing_results_for: "Showing results for:",
  recommended_specialty: "Recommended department:",
  filter_hospitals: "Filter Hospitals",
  distance_slider: "Max Distance",
  nabh_accredited_only: "NABH Accredited only",
  emergency_services_only: "24/7 Emergency Care only",
  hospital_tier: "Hospital Tier",
  tier_all: "All Tiers",
  tier_budget: "Budget",
  tier_mid: "Mid-tier",
  tier_premium: "Premium",
  sort_by: "Sort By",
  sort_recommended: "Best Match (Recommended)",
  sort_distance: "Distance (Nearest first)",
  sort_cost: "Estimated Cost (Low to High)",
  sort_rating: "Rating (Highest first)",
  view_details: "View Details",
  compare: "Compare",
  directions: "Directions",
  why_recommended: "Why recommended:",
  primary_match: "Primary clinical match for",
  estimated_cost: "Estimated Treatment Cost",
  out_of_pocket: "Out-of-pocket range",
  cost_breakdown_btn: "Cost Breakdown",
  nabh_badge: "NABH Accredited",
  emergency_badge: "24/7 Emergency",
  beds: "Beds",
  no_hospitals_found: "No hospitals found matching your criteria",
  try_adjusting_filters: "Try adjusting distance or tier filters.",
  cost_disclaimer: "Estimates are indicative based on regional hospital tariffs and clinical intensity.",

  // CostBreakdown (Presentation strings only - calculations untouched)
  cost_breakdown_title: "Estimated Cost Breakdown",
  base_procedure: "Base Procedure / Treatment",
  room_charges: "Room & Nursing Charges",
  doctor_fee: "Doctor & Specialist Fee",
  medicines_consumables: "Medicines & Consumables",
  total_estimated: "Total Estimated Range",
  estimated_stay: "Estimated Stay",
  days: "days",
  per_day: "per day",
  base_medical_cost: "Base Medical Cost",
  step1_base_cost: "Step 1: Base Medical Cost",
  step2_tier_factor: "Step 2: Hospital Tier Factor",
  step3_nabh_factor: "Step 3: Accreditation Factor",
  doctor_procedure_fee: "Doctor / Procedure Fee",
  lab_and_tests: "Lab & Diagnostics",
  medicines_injections: "Medicines & Consumables",
  room_rent_stay: "Room Rent ({days} days × {rate}/day)",
  opd_no_stay: "Outpatient Visit (0 days stay)",
  tier_budget_factor: "Budget / Trust (0.60×)",
  tier_mid_factor: "Standard Private (1.00×)",
  tier_premium_factor: "Corporate Super-Specialty (1.75×)",
  nabh_accredited_factor: "NABH Accredited (+5%)",
  non_accredited_factor: "Non-Accredited (1.00×)",
  select_hospital_view_bill: "Select Hospital to View Real Hospital Bill",
  tier_comparison_headline: "Estimated Cost Across Hospital Tiers",
  tier_budget_desc: "Trust / Charitable (~40% cheaper)",
  tier_mid_desc: "Standard Private (Market standard)",
  tier_premium_desc: "Corporate / Super-Specialty (Apollo, Fortis, Max)",
  final_treatment_bill: "Total Treatment Cost",
  formula_explainer: "Total Treatment Cost = Base Medical Cost × Hospital Tier × Accreditation Factor",

  // FilterPanel
  search_hospital_placeholder: "Search hospital name",
  procedure: "Procedure",
  all_procedures: "All procedures",
  specialization: "Specialization",
  all_specializations: "All specializations",
  radius: "Radius",
  open_status: "Open status",
  any_status: "Any status",
  open: "Open",
  closed: "Closed",
  min_rating: "Min rating",
  cost_range: "Cost range",
  no_limit: "No limit",
  max_budget: "Max budget",
  reset_all_filters: "Reset all filters",
  hospitals_match: "{n} hospitals match",

  // ResultsView & Cards
  possible_cause: "Possible cause",
  target_specialization: "Target Specialization",
  matched_procedure: "Matched Procedure / Consultation",
  clinical_pathway: "AI Clinical Recommendation & Department Pathway",
  reconsult_doctor: "Re-Consult Dr. MediPath",
  listen_assessment: "Listen to assessment",
  stop_narration: "Stop narration",
  recommendation_sequence: "Recommendation Sequence:",
  all_sources: "All Sources",
  verified_registry: "Verified Registry",
  google_places: "Google Places",
  openstreetmap: "OpenStreetMap",
  hospitals_near_location: "{count} hospitals near {location}",
  within_radius_sorted: "within {radius} km · sorted by {sort}",
  compared: "Compared",
  verified_specialist_match: "Verified Specialist Match",
  general_care_fallback: "General-Care Fallback / Referral",
  best_match: "Best match",
  emergency_24x7: "24x7 Emergency",
  recommendation_basis: "Recommendation Basis",
  reviews_label: "reviews",
  diagnostics: "Diagnostics",
  contingency_buffer: "Contingency buffer ({pct}%)",
  transparent_estimate_tier: "Transparent estimate based on tier averages",
  confident: "confident",

  // Dialogs & Actions
  contact_and_location: "Contact and location",
  specialties: "Specialties",
  available_procedures: "Available procedures",
  estimated_cost_at_hospital: "Estimated cost at this hospital",
  procedure_range: "Procedure range",
  per_day_stay: "Per day stay",
  avg_stay: "Avg stay",
  total_stay_cost: "Total stay cost",
  get_directions: "Get directions",
  view_on_map: "View on map",
  compare_hospitals: "Compare Hospitals",
  measure: "Measure",
  comparison_disclaimer: "Cost and availability values are estimates based on available hospital data.",
  preliminary_assessment_title: "Preliminary Medical Assessment",
  preliminary_assessment_desc: "This preliminary assessment presents possible conditions based on the information provided and is not a medical diagnosis. A qualified healthcare professional must confirm the cause. Seek urgent medical care if symptoms are severe or worsening.",
  model_uncertain_warning: "The model is uncertain. These are possible matches, not a diagnosis.",

  // Medical Disclaimer Component
  medical_disclaimer_title: "Medical Disclaimer",
  medical_disclaimer_text: "MediPath AI provides informational estimates only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified physician for health concerns. Hospital costs are indicative and may vary based on individual case complexity, insurance, and chosen treatment plan.",

  // Status & Badges
  not_accredited: "Not accredited",
  not_listed: "Not listed",
  phone_not_listed: "Phone number not listed",
  website_not_listed: "Website not listed",
  visit_website: "Visit hospital website",
  limit_hit: "Daily limit reached",
  model_2_guidance: "Model 2.0 Guidance",
  emergency_override_badge: "Emergency Priority",
  safe_referral_badge: "Safe Referral",
  user_finalized_badge: "User Finalized",
  threshold_badge: "Certainty Threshold",
  protocol_active: "Protocol Active",

  // Confirmed Condition Card
  possible_cause_identified_title: "Possible Cause Identified",
  urgent_safety_notice_title: "Urgent Safety Notice",
  general_care_referral_title: "General Care Referral",
  assessment_complete_badge: "Assessment Complete",
  clinical_safety_protocol: "Clinical Safety Rule Protocol",
  clinical_safety_protocol_desc: "Deterministically routed by safety protocols for specialized medical assessment.",
  recommended_procedure_notice: "Recommended Clinical Procedure / Consultation:",
  hospitals_matched_for_procedure: "Hospitals offering this specialized procedure and medical department have been matched for you.",
  preliminary_navigation_notice: "Preliminary Medical Navigation Notice",
  preliminary_navigation_desc: "This is a possible cause based on the information provided and is not a medical diagnosis. A qualified healthcare professional must confirm the cause. Seek urgent medical care if symptoms are severe or worsening.",
  reason_for_referral: "Reason for general referral:",
  click_view_hospitals_for_condition: "Click below to view verified hospitals, mapped procedures, bed availability, and directions for {condition}.",
  click_view_general_care: "Click below to view verified general-care facilities for initial medical evaluation and referral.",

  // Print Summary
  print_summary_title: "Preliminary Healthcare Navigation & Clinical Department Routing Summary",
  print_date: "Date",
  print_time: "Time",
  print_model_build: "Model Build",
  reported_symptoms_history: "Reported Patient Symptoms & Consultation History",
  initial_query_label: "Initial Symptom Entry",
  accumulated_evidence: "Accumulated Clinical Details",
  top_differential_candidates: "Top Differential Care Candidates",
  clinical_decision_rationale: "Clinical Decision Rationale & Triage Action",
  clinical_assessment: "Clinical Assessment",
  specialist_care: "Specialist Care",
  comprehensive_clinical_assessment: "Comprehensive In-Person Clinical Assessment",
  regional_referral_title: "Regional Tertiary Care Referral",
  general_care_facility_title: "General-Care Referral Facilities Recommended",
  close: "Close",

  // Follow-up & Consultation UI localization
  keyboard_hint: "Press Enter to send · Shift + Enter for new line",
  consultation_welcome_desc: "Dr. MediPath clarifies symptoms using TF-IDF and Model 2.0 logistic regression across 56 supported conditions to guide you to appropriate clinical departments and verified care options.",
  prior_assessment: "Prior Assessment",
  prior_clinical_assessment: "Prior Clinical Assessment",
  re_evaluating_below: "Re-evaluating with additional symptoms below...",
  actions_on_latest: "Actions available on latest assessment",
  recommended_accompanying_symptoms: "Recommended accompanying symptoms:",
  recommended_symptoms_patterns: "Recommended symptoms from candidate patterns:",
  select_single_or_multiple: "Select one or multiple",
  click_single_or_toggle: "Click single or toggle multiple",
  btn_only: "Only",
  send_only_this_tooltip: "Send only this symptom",
  submit_selected_chips: "Submit Selected ({count})",
  btn_skip_reveal: "Skip reveal",
  dismiss: "Dismiss",
  scroll_to_latest: "Scroll to latest response",
  language_label: "Language",
  listening_in_lang: "Listening in {lang}...",
  finished_symptoms_cta: "Finished describing symptoms? Click here",
  re_evaluate_hint: "You can enter more symptoms anytime to re-evaluate",
  fallback_assessment_text: "MediPath AI has noted your reported symptoms: \"{symptoms}\". Let's narrow down the candidate causes to guide you to the right hospital department.",
  fallback_question_text: "Are you also experiencing any of these accompanying symptoms?",

  // Information Used Panel
  info_used_title: "Information used in this assessment",
  model_audit_badge: "Model 2.0 Audit",
  hide: "Hide",
  review: "Review",
  info_used_desc: "These are the reported details and model outputs used during the navigation flow. They do not prove a medical diagnosis or show clinical causation.",
  reported_symptom_evidence: "Reported Symptom Evidence",
  additional_reported_label: "Additional Reported:",
  confirmed_selections_label: "Confirmed Selections:",
  none_confirmed: "None confirmed",
  rejected_options_label: "Rejected Candidate Options:",
  options_excluded: "{count} options excluded",
  model_alignment_metrics: "Model Alignment Metrics",
  model_probability_label: "Model Probability:",
  required_threshold_label: "Required Threshold:",
  threshold_status_label: "Threshold Status:",
  threshold_met: "Met",
  threshold_pending: "Pending / Rule",
  decision_source_label: "Decision Source:",
  leading_candidates_label: "Current Leading Candidate Patterns:",

  // Additional ResultsView translations
  referral_note: "Referral Note:",
  google_places_limit_hit_banner: "Google Places Daily Limit Reached ({calls}/{max} calls) — Active Fallback: Verified Registry + OSM",
  google_places_tracker_active: "Google Places API: {calls} / {max} calls used today ({remaining} remaining · resets daily)",

  // Direct Routing & Supported Diseases Directory
  clinical_directory_badge: "Clinical Directory",
  verified_conditions_count: "56 Verified Medical Conditions & Protocols",
  supported_diseases_title: "Supported Diseases & Direct Hospital Routing",
  supported_diseases_subtitle: "Know your diagnosed condition? Click directly on any condition below to bypass symptom triage and instantly route to certified specialists and accredited hospitals.",
  general_medicine_card_title: "Not sure what disease you have? Choose General Medicine",
  general_medicine_card_subtitle: "Comprehensive primary-care evaluation with qualified physicians when symptoms are vague, multifactorial, or not yet diagnosed.",
  route_to_general_hospitals: "Route to General Hospitals",
  search_diseases_placeholder: "Search diseases, ICD-10 code, specialization (e.g., Cataract, E11.9, Cardiology, Wheezing)...",
  all_tiers: "All Tiers",
  tier_routine: "Routine",
  tier_urgent: "Urgent",
  tier_emergency: "Emergency",
  filter_system_label: "System:",
  showing_supported_count: "Showing {count} of 56 supported clinical conditions",
  scroll_explore_hint: "Scroll inside this panel to explore all {count} supported conditions",
  direct_routing_enabled: "Direct Clinical Routing Enabled",
  no_matching_diseases: "No matching diseases found",
  no_matching_diseases_desc: "Try searching with broader terms or check our General Medicine option to see comprehensive physician facilities.",
  route_to_general_medicine_btn: "Route to General Medicine",
  primary_procedure_label: "Primary Procedure",
  recommended_for_ambiguity: "Recommended for Ambiguity",

  // Dedicated Direct Routing Loading State
  direct_clinical_route_badge: "Direct Clinical Route",
  live_geospatial_engine: "Live Geospatial Engine",
  routing_for_condition: "Routing for {name}",
  icd10_identifier_label: "ICD-10 Identifier",
  specialization_label: "Specialization",
  clinical_urgency_label: "Clinical Urgency",
  step_icd_title: "Direct ICD-10 Clinical Anchor",
  step_icd_badge: "Clinical Match",
  step_dept_title: "Specialist Department Filter",
  step_dept_badge: "Facility Ready",
  step_geo_title: "Geospatial Distance & Tier Matrix",
  step_geo_badge: "920+ Hubs",
  step_tariff_title: "Tariff Calibration & Bed Availability",
  step_tariff_badge: "Live Telemetry",
  scanned_nodes_label: "Facilities Scanned",
  matched_facilities_label: "Candidates Matched",
  optimizing_route_label: "Optimizing Route...",

  // Nerd Hub / Model Diagnostics Dialog
  nerd_hub_title: "MediPath AI Diagnostics & Technical Hub",
  nerd_hub_subtitle: "Multi-Model Technical Specifications, Training Provenance, Real Datasets & Verified Hospital Registry",
  tab_deep_dive: "Model Deep-Dive",
  tab_datasets: "Training Datasets",
  tab_hospitals: "Hospital Registry",
  tab_comparison: "3-Model Comparison",
  active_model_badge: "Active Model",
  switch_to_model: "Switch to this Model",
  datasets_section_title: "Model Training Datasets & Provenance",
  datasets_section_desc: "Inspect the real datasets used to train each of our 3 production models",
  select_model_dataset: "Select Model Dataset:",
  download_real_dataset_xlsx: "Download Dataset (.xlsx)",
  download_json_dataset: "Download JSON (.json)",
  preview_real_dataset: "Preview Real Dataset",
  search_dataset_placeholder: "Search samples, symptoms, conditions...",
  hospitals_section_title: "Verified Hospital Registry & Procedural Network",
  hospitals_section_desc: "Browse all 924 verified hospitals, accreditation tiers, procedures and tariffs across India",
  search_hospitals_placeholder: "Search hospitals by name, city, specialty, address...",
  download_hospital_registry: "Download Hospital Registry (.json)",
  all_cities: "All Cities",
  comparison_section_title: "Head-to-Head 3-Model Architectural Comparison Matrix",
  close_diagnostics: "Close Diagnostics",
  all_models_online: "All Models: 3/3 Online",
  diseases_56_btn: "56 Diseases",
  firebase_connected: "Firebase Connected",
  firebase_disconnected: "Firebase Disconnected",
  history_btn: "History",
  help_instructions_btn: "How to Use",
  help_btn_short: "Help",
  help_instructions_title: "How to Use MediPath AI",
  help_instructions_subtitle: "Step-by-step guide to AI symptom triage, 4-tier hospital discovery, and cost estimation",
  got_it_btn: "Got It, Let's Start",
};

const hi: TranslationDictionary = {
  // Brand & Header
  brand_title: "मेडीपाथ एआई",
  tagline: "स्वास्थ्य निर्णय सहायता मंच",
  doctor_ai: "डॉक्टर एआई",
  find_hospitals: "अस्पताल खोजें",
  print_summary: "सारांश प्रिंट करें",
  reset: "रीसेट करें",
  model_active: "मॉडल 2.0 सक्रिय",
  login: "लॉग इन",
  sign_out: "साइन आउट",
  welcome_user: "स्वागत है, {name} · मेडीपाथ आईडी {id}",
  download_desktop_app: "ऐप डाउनलोड करें",
  download_for_windows: "विंडोज़ के लिए डाउनलोड",
  desktop_edition: "डेस्कटॉप संस्करण",
  offline_ready: "ऑफ़लाइन तैयार",
  offline_clinical_active: "ऑफ़लाइन क्लिनिकल मोड सक्रिय",

  // Home Page
  hero_badge: "भारत के लिए एआई-संचालित स्वास्थ्य मार्गदर्शन",
  hero_title_1: "सही देखभाल पाएं, सही",
  hero_title_2: "अस्पताल में, सही खर्च पर।",
  hero_subtitle: "अपने लक्षण या उपचार किसी भी भारतीय भाषा या अंग्रेजी में बताएं। मेडीपाथ एआई इसका संभावित कारण पहचानकर पारदर्शी खर्च अनुमान के साथ नजदीकी अस्पताल दिखाता है।",
  try_label: "उदाहरण:",
  feature_multilingual: "हिन्दी, गुजराती और अंग्रेजी",
  feature_costs: "पारदर्शी खर्च",
  feature_nabh: "एनएबीएच-सत्यापित",
  footer_text: "मेडीपाथ एआई · स्वास्थ्य निर्णय सहायता मंच",

  // SearchBar
  search_placeholder: "अपने लक्षण, बीमारी या उपचार यहाँ लिखें...",
  search_button: "देखभाल खोजें",
  consult_doctor: "डॉक्टर एआई से परामर्श लें",
  listening: "सुन रहे हैं...",
  speak_prompt: "अपने लक्षण बोलें...",
  stop_listening: "बोलना समाप्त करें",
  select_language: "भाषा चुनें",
  clear: "साफ़ करें",
  model_version: "मॉडल संस्करण",
  mic_unavailable: "माइक्रोफ़ोन एक्सेस के लिए अनुमति या समर्थित ब्राउज़र आवश्यक है।",
  search_empty_error: "परामर्श शुरू करने के लिए कृपया अपने लक्षण लिखें या बोलें।",

  // LocationFilter
  showing_hospitals_near: "अस्पताल देखें यहाँ के पास:",
  use_my_location: "मेरा वर्तमान स्थान उपयोग करें",
  scope_city: "शहर",
  scope_state: "राज्य",
  scope_all_india: "पूरा भारत",
  select_city: "शहर चुनें",

  // DoctorConsultationPanel
  consultation_title: "डॉ. मेडीपाथ · एआई क्लिनिकल नेविगेटर",
  consultation_subtitle: "56 प्राथमिक देखभाल वर्ग · लक्षण स्पष्टीकरण और अस्पताल मार्गदर्शन",
  model_confidence: "मॉडल विश्वसनीयता",
  model_confidence_caption: "56 प्राथमिक देखभाल श्रेणियों में मॉडल 2.0 सांख्यिकीय संरेखण। यह प्रारंभिक मार्गदर्शन है, निश्चित निदान नहीं।",
  updating_assessment: "मूल्यांकन अपडेट हो रहा है...",
  score_unavailable: "स्कोर अनुपलब्ध (सुरक्षित रेफरल)",
  differential_threshold: "निश्चितता थ्रेशोल्ड: 85%",
  pattern_alignment: "पैटर्न संरेखण:",
  alignment_high: "उच्च संरेखण",
  alignment_narrowing: "सटीकता बढ़ रही है",
  alignment_exploring: "पैटर्न खोज जारी",
  turn_0_mandatory: "अनिवार्य प्रारंभिक प्रश्न",
  turn_clarifying: "प्रश्न {n}: नैदानिक साक्ष्य स्पष्टीकरण",
  evidence_btn: "साक्ष्य",
  evidence_panel_title: "नैदानिक साक्ष्य एवं तर्क लॉग",
  no_more_symptoms: "और कोई लक्षण नहीं (परिणाम देखें)",
  type_placeholder: "कोई अन्य लक्षण या असुविधा यहाँ लिखें...",
  thinking_message: "डॉ. मेडीपाथ आपके लक्षणों का विश्लेषण कर रहे हैं...",
  send_button: "भेजें",
  proceed_to_hospitals: "नजदीकी अस्पताल खोजें",
  possible_cause_identified: "संभावित नैदानिक कारण पहचाना गया",
  urgency: "प्राथमिकता",
  recommended_specialist: "अनुशंसित विशेषज्ञ",
  back_to_search: "खोज पर वापस जाएं",
  emergency_alert: "गंभीर आपातकाल (CRITICAL EMERGENCY)",
  safe_deferral_badge: "चिकित्सीय परामर्श अनुशंसित",
  action_find_hospitals: "कार्य: नजदीकी अस्पताल खोजें",
  reported_symptoms: "दर्ज किए गए लक्षण",
  candidate_conditions: "संभावित स्थितियाँ",
  clinical_decision_route: "नैदानिक निर्णय मार्ग",
  summary_preview: "सारांश पूर्वावलोकन",
  close_panel: "बंद करें",

  // Hospital ResultsView & Filters
  results_title: "आपकी देखभाल आवश्यकताओं से मेल खाते अस्पताल",
  hospitals_found_count: "आपकी स्थिति के लिए {n} अस्पताल मिले",
  showing_results_for: "इसके लिए परिणाम दिखाए जा रहे हैं:",
  recommended_specialty: "अनुशंसित विभाग:",
  filter_hospitals: "अस्पतालों को फ़िल्टर करें",
  distance_slider: "अधिकतम दूरी",
  nabh_accredited_only: "केवल एनएबीएच (NABH) मान्यता प्राप्त",
  emergency_services_only: "केवल 24/7 आपातकालीन सेवा",
  hospital_tier: "अस्पताल श्रेणी",
  tier_all: "सभी श्रेणियां",
  tier_budget: "बजट",
  tier_mid: "मध्यम श्रेणी",
  tier_premium: "प्रीमियम",
  sort_by: "क्रमबद्ध करें",
  sort_recommended: "सर्वश्रेष्ठ मेल (अनुशंसित)",
  sort_distance: "दूरी (सबसे नजदीकी पहले)",
  sort_cost: "अनुमानित खर्च (कम से अधिक)",
  sort_rating: "रेटिंग (उच्चतम पहले)",
  view_details: "विस्तार से देखें",
  compare: "तुलना करें",
  directions: "मार्ग / दिशा",
  why_recommended: "सिफारिश का कारण:",
  primary_match: "प्राथमिक नैदानिक मिलान:",
  estimated_cost: "अनुमानित उपचार खर्च",
  out_of_pocket: "अनुमानित खर्च सीमा",
  cost_breakdown_btn: "खर्च का विवरण",
  nabh_badge: "एनएबीएच (NABH) मान्यता प्राप्त",
  emergency_badge: "24/7 आपातकाल",
  beds: "बिस्तर",
  no_hospitals_found: "आपके मानदंडों से मेल खाने वाला कोई अस्पताल नहीं मिला",
  try_adjusting_filters: "दूरी या श्रेणी फ़िल्टर बदलकर पुनः प्रयास करें।",
  cost_disclaimer: "अनुमान क्षेत्रीय अस्पताल दरों और उपचार की जटिलता पर आधारित हैं।",

  // CostBreakdown
  cost_breakdown_title: "अनुमानित खर्च का विवरण",
  base_procedure: "मूल प्रक्रिया / उपचार",
  room_charges: "कमरा और नर्सिंग शुल्क",
  doctor_fee: "डॉक्टर और विशेषज्ञ शुल्क",
  medicines_consumables: "दवाएं और उपभोग्य सामग्रियां",
  total_estimated: "कुल अनुमानित सीमा",
  estimated_stay: "अनुमानित भर्ती अवधि",
  days: "दिन",
  per_day: "प्रति दिन",
  base_medical_cost: "मूल चिकित्सा खर्च (Base Medical Cost)",
  step1_base_cost: "चरण 1: मूल चिकित्सा खर्च",
  step2_tier_factor: "चरण 2: अस्पताल श्रेणी गुणक (Hospital Tier)",
  step3_nabh_factor: "चरण 3: गुणवत्ता प्रमाणन गुणक (NABH)",
  doctor_procedure_fee: "डॉक्टर / सर्जरी शुल्क",
  lab_and_tests: "लैब एवं जांच (Diagnostics)",
  medicines_injections: "दवाइयां एवं इंजेक्शन",
  room_rent_stay: "कमरा किराया ({days} दिन × {rate}/दिन)",
  opd_no_stay: "ओपीडी परामर्श (0 दिन भर्ती)",
  tier_budget_factor: "चैरिटेबल / बजट अस्पताल (0.60×)",
  tier_mid_factor: "मानक निजी अस्पताल (1.00×)",
  tier_premium_factor: "कॉर्पोरेट सुपर-स्पेशियलिटी (1.75×)",
  nabh_accredited_factor: "NABH मान्यता प्राप्त (+5%)",
  non_accredited_factor: "गैर-मान्यता प्राप्त (1.00×)",
  select_hospital_view_bill: "अस्पताल का वास्तविक बिल देखने के लिए चुनें",
  tier_comparison_headline: "अस्पताल श्रेणियों के अनुसार अनुमानित खर्च",
  tier_budget_desc: "ट्रस्ट / चैरिटेबल (~40% सस्ता)",
  tier_mid_desc: "मानक निजी अस्पताल (बाज़ार दर)",
  tier_premium_desc: "कॉर्पोरेट / सुपर-स्पेशियलिटी (अपोलो, फोर्टिस, मैक्स)",
  final_treatment_bill: "कुल अनुमानित उपचार खर्च",
  formula_explainer: "कुल खर्च = मूल चिकित्सा खर्च × अस्पताल श्रेणी × एनएबीएच प्रमाणन",

  // FilterPanel
  search_hospital_placeholder: "अस्पताल का नाम खोजें",
  procedure: "उपचार / प्रक्रिया",
  all_procedures: "सभी प्रक्रियाएं",
  specialization: "विशेषज्ञता",
  all_specializations: "सभी विशेषज्ञताएं",
  radius: "दायरा",
  open_status: "खुलने की स्थिति",
  any_status: "कोई भी स्थिति",
  open: "खुला है",
  closed: "बंद है",
  min_rating: "न्यूनतम रेटिंग",
  cost_range: "खर्च सीमा",
  no_limit: "कोई सीमा नहीं",
  max_budget: "अधिकतम बजट",
  reset_all_filters: "सभी फ़िल्टर रीसेट करें",
  hospitals_match: "{n} अस्पताल मेल खाते हैं",

  // ResultsView & Cards
  possible_cause: "संभावित कारण",
  target_specialization: "लक्षित विशेषज्ञता",
  matched_procedure: "उपयुक्त प्रक्रिया / परामर्श",
  clinical_pathway: "एआई नैदानिक सिफारिश और विभाग मार्ग",
  reconsult_doctor: "डॉ. मेडीपाथ से पुनः परामर्श लें",
  listen_assessment: "समीक्षा सुनें",
  stop_narration: "बोलना रोकें",
  recommendation_sequence: "सिफारिश स्रोत क्रम:",
  all_sources: "सभी स्रोत",
  verified_registry: "सत्यापित रजिस्ट्री",
  google_places: "गूगल प्लेसेस",
  openstreetmap: "ओपनस्ट्रीटमैप",
  hospitals_near_location: "{location} के पास {count} अस्पताल मिले",
  within_radius_sorted: "{radius} किमी के भीतर · {sort} अनुसार",
  compared: "तुलना में शामिल",
  verified_specialist_match: "सत्यापित विशेषज्ञ मिलान",
  general_care_fallback: "सामान्य देखभाल रेफरल सुविधा",
  best_match: "सर्वश्रेष्ठ मेल",
  emergency_24x7: "24x7 आपातकालीन सेवा",
  recommendation_basis: "सिफारिश का आधार",
  reviews_label: "समीक्षाएं",
  diagnostics: "जाँच / टेस्ट",
  contingency_buffer: "आपातकालीन बफर ({pct}%)",
  transparent_estimate_tier: "श्रेणी औसत पर आधारित पारदर्शी अनुमान",
  confident: "निश्चितता",

  // Dialogs & Actions
  contact_and_location: "संपर्क और स्थान",
  specialties: "विशेषज्ञताएं",
  available_procedures: "उपलब्ध उपचार प्रक्रियाएं",
  estimated_cost_at_hospital: "इस अस्पताल में अनुमानित खर्च",
  procedure_range: "उपचार खर्च सीमा",
  per_day_stay: "प्रति दिन भर्ती शुल्क",
  avg_stay: "औसत भर्ती दिन",
  total_stay_cost: "कुल भर्ती खर्च",
  get_directions: "मार्ग देखें",
  view_on_map: "नक्शे पर देखें",
  compare_hospitals: "अस्पतालों की तुलना करें",
  measure: "मापदंड",
  comparison_disclaimer: "खर्च और उपलब्धता के आंकड़े उपलब्ध अस्पताल डेटा पर आधारित अनुमान हैं।",
  preliminary_assessment_title: "प्रारंभिक चिकित्सा समीक्षा",
  preliminary_assessment_desc: "यह प्रारंभिक मूल्यांकन प्रदान की गई जानकारी पर आधारित संभावित कारण दिखाता है और यह कोई निश्चित चिकित्सीय निदान नहीं है। किसी योग्य स्वास्थ्य विशेषज्ञ द्वारा पुष्टि अनिवार्य है।",
  model_uncertain_warning: "मॉडल अनिश्चित है। ये संभावित मिलान हैं, पक्का निदान नहीं।",

  // Medical Disclaimer Component
  medical_disclaimer_title: "चिकित्सीय अस्वीकरण (Medical Disclaimer)",
  medical_disclaimer_text: "मेडीपाथ एआई केवल सूचनात्मक अनुमान प्रदान करता है और यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। स्वास्थ्य संबंधी किसी भी चिंता के लिए हमेशा योग्य चिकित्सक से परामर्श लें। अस्पताल का खर्च सांकेतिक है और वास्तविक स्थिति, बीमा और चुने गए उपचार के आधार पर भिन्न हो सकता है।",

  // Status & Badges
  not_accredited: "सत्यापित नहीं",
  not_listed: "सूचीबद्ध नहीं",
  phone_not_listed: "फ़ोन नंबर उपलब्ध नहीं है",
  website_not_listed: "वेबसाइट उपलब्ध नहीं है",
  visit_website: "अस्पताल की वेबसाइट पर जाएँ",
  limit_hit: "दैनिक सीमा समाप्त",
  model_2_guidance: "मॉडल 2.0 मार्गदर्शन",
  emergency_override_badge: "आपातकालीन प्राथमिकता",
  safe_referral_badge: "सुरक्षित रेफरल",
  user_finalized_badge: "उपयोगकर्ता द्वारा पूर्ण",
  threshold_badge: "निश्चितता थ्रेशोल्ड",
  protocol_active: "प्रोटोकॉल सक्रिय",

  // Confirmed Condition Card
  possible_cause_identified_title: "संभावित नैदानिक कारण पहचाना गया",
  urgent_safety_notice_title: "तत्काल सुरक्षा सूचना",
  general_care_referral_title: "सामान्य देखभाल रेफरल",
  assessment_complete_badge: "मूल्यांकन पूर्ण",
  clinical_safety_protocol: "नैदानिक सुरक्षा प्रोटोकॉल",
  clinical_safety_protocol_desc: "विशेषज्ञ चिकित्सा मूल्यांकन के लिए सुरक्षा प्रोटोकॉल द्वारा निर्धारित मार्ग।",
  recommended_procedure_notice: "अनुशंसित नैदानिक प्रक्रिया / परामर्श:",
  hospitals_matched_for_procedure: "इस विशेष प्रक्रिया और विभाग की सुविधा वाले अस्पतालों को आपके लिए चुना गया है।",
  preliminary_navigation_notice: "प्रारंभिक चिकित्सा नेविगेशन सूचना",
  preliminary_navigation_desc: "यह उपलब्ध कराई गई जानकारी पर आधारित संभावित कारण है, चिकित्सीय निदान नहीं। एक योग्य स्वास्थ्य विशेषज्ञ द्वारा कारण की पुष्टि आवश्यक है। यदि लक्षण गंभीर हैं तो तुरंत आपातकालीन देखभाल लें।",
  reason_for_referral: "सामान्य रेफरल का कारण:",
  click_view_hospitals_for_condition: "{condition} के लिए सत्यापित अस्पताल, प्रक्रियाएं, बिस्तर उपलब्धता और मार्ग देखने के लिए नीचे क्लिक करें।",
  click_view_general_care: "प्रारंभिक मूल्यांकन और रेफरल के लिए सत्यापित सामान्य देखभाल सुविधाएं देखने के लिए नीचे क्लिक करें।",

  // Print Summary
  print_summary_title: "प्रारंभिक स्वास्थ्य नेविगेशन एवं नैदानिक विभाग मार्गदर्शन सारांश",
  print_date: "दिनांक",
  print_time: "समय",
  print_model_build: "मॉडल संस्करण",
  reported_symptoms_history: "दर्ज किए गए लक्षण और परामर्श इतिहास",
  initial_query_label: "प्रारंभिक लक्षण विवरण",
  accumulated_evidence: "एकत्रित नैदानिक विवरण",
  top_differential_candidates: "शीर्ष संभावित देखभाल श्रेणियां",
  clinical_decision_rationale: "नैदानिक निर्णय आधार एवं अगला कदम",
  clinical_assessment: "नैदानिक मूल्यांकन",
  specialist_care: "विशेषज्ञ देखभाल",
  comprehensive_clinical_assessment: "व्यापक व्यक्तिगत नैदानिक मूल्यांकन",
  regional_referral_title: "क्षेत्रीय तृतीयक देखभाल रेफरल",
  general_care_facility_title: "सामान्य देखभाल रेफरल सुविधाओं की सिफारिश",
  close: "बंद करें",

  // Follow-up & Consultation UI localization
  keyboard_hint: "भेजने के लिए Enter दबाएं · नई लाइन के लिए Shift + Enter",
  consultation_welcome_desc: "डॉ. मेडीपाथ 56 प्राथमिक स्थितियों में टीएफ-आईडीएफ और मॉडल 2.0 लॉजिस्टिक रिग्रेशन का उपयोग करके लक्षणों को स्पष्ट करते हैं ताकि आपको उपयुक्त क्लिनिकल विभाग और सत्यापित देखभाल मिल सके।",
  prior_assessment: "पिछला मूल्यांकन",
  prior_clinical_assessment: "पिछला क्लिनिकल मूल्यांकन",
  re_evaluating_below: "नीचे दिए गए अतिरिक्त लक्षणों के साथ पुनर्मूल्यांकन जारी है...",
  actions_on_latest: "नवीनतम मूल्यांकन पर उपलब्ध कार्य",
  recommended_accompanying_symptoms: "अनुशंसित संबंधित लक्षण:",
  recommended_symptoms_patterns: "संभावित पैटर्न से अनुशंसित लक्षण:",
  select_single_or_multiple: "एक या अधिक चुनें",
  click_single_or_toggle: "एक चुनें या एक से अधिक",
  btn_only: "केवल यह",
  send_only_this_tooltip: "केवल यह लक्षण भेजें",
  submit_selected_chips: "चयनित लक्षण भेजें ({count})",
  btn_skip_reveal: "एनीमेशन छोड़ें",
  dismiss: "खारिज करें",
  scroll_to_latest: "नवीनतम प्रतिक्रिया पर जाएं",
  language_label: "भाषा",
  listening_in_lang: "{lang} में सुन रहे हैं...",
  finished_symptoms_cta: "लक्षण बताना समाप्त? यहाँ क्लिक करें",
  re_evaluate_hint: "पुनर्मूल्यांकन के लिए कभी भी और लक्षण दर्ज कर सकते हैं",
  fallback_assessment_text: "मेडीपाथ एआई ने आपके दर्ज लक्षणों को नोट कर लिया है: \"{symptoms}\"। आइए संभावित कारणों को स्पष्ट करें ताकि आपको सही अस्पताल विभाग तक पहुंचाया जा सके।",
  fallback_question_text: "क्या आप इनमें से किसी संबंधित लक्षण का भी अनुभव कर रहे हैं?",

  // Information Used Panel
  info_used_title: "इस मूल्यांकन में उपयोग की गई जानकारी",
  model_audit_badge: "मॉडल 2.0 ऑडिट",
  hide: "छिपाएं",
  review: "समीक्षा करें",
  info_used_desc: "ये नेविगेशन प्रवाह के दौरान उपयोग किए गए विवरण और मॉडल आउटपुट हैं। ये चिकित्सीय निदान सिद्ध नहीं करते हैं।",
  reported_symptom_evidence: "दर्ज किए गए लक्षणों के साक्ष्य",
  additional_reported_label: "अतिरिक्त दर्ज लक्षण:",
  confirmed_selections_label: "पुष्टि किए गए चयन:",
  none_confirmed: "कोई पुष्टि नहीं",
  rejected_options_label: "अस्वीकृत विकल्प:",
  options_excluded: "{count} विकल्प बाहर किए गए",
  model_alignment_metrics: "मॉडल संरेखण मेट्रिक्स",
  model_probability_label: "मॉडल प्रायिकता:",
  required_threshold_label: "आवश्यक थ्रेशोल्ड:",
  threshold_status_label: "थ्रेशोल्ड स्थिति:",
  threshold_met: "पूर्ण",
  threshold_pending: "लंबित / नियम",
  decision_source_label: "निर्णय स्रोत:",
  leading_candidates_label: "वर्तमान प्रमुख संभावित स्थितियाँ:",

  // Additional ResultsView translations
  referral_note: "रेफरल विवरण:",
  google_places_limit_hit_banner: "गूगल प्लेसेज दैनिक सीमा समाप्त ({calls}/{max} कॉल) — सक्रिय विकल्प: सत्यापित रजिस्ट्री + OSM",
  google_places_tracker_active: "गूगल प्लेसेज एपीआई: आज {calls} / {max} कॉल प्रयुक्त ({remaining} शेष · दैनिक रीसेट)",

  // Direct Routing & Supported Diseases Directory
  clinical_directory_badge: "क्लिनिकल निर्देशिका",
  verified_conditions_count: "56 सत्यापित चिकित्सा स्थितियां और प्रोटोकॉल",
  supported_diseases_title: "समर्थित रोग और सीधा अस्पताल रूटिंग",
  supported_diseases_subtitle: "क्या आपको अपनी स्थिति पहले से ज्ञात है? लक्षण ट्राइएज को छोड़ कर प्रमाणित विशेषज्ञों और मान्यता प्राप्त अस्पतालों तक तुरंत पहुँचने के लिए नीचे किसी भी बीमारी पर क्लिक करें।",
  general_medicine_card_title: "निश्चित नहीं कि क्या बीमारी है? सामान्य चिकित्सा (General Medicine) चुनें",
  general_medicine_card_subtitle: "जब लक्षण अस्पष्ट हों या निदान न हुआ हो, तब योग्य सामान्य चिकित्सकों के साथ व्यापक प्राथमिक देखभाल मूल्यांकन।",
  route_to_general_hospitals: "सामान्य अस्पतालों पर रूट करें",
  search_diseases_placeholder: "रोग, ICD-10 कोड, विशेषज्ञता खोजें (जैसे मोतियाबिंद, E11.9, कार्डियोलॉजी, घरघराहट)...",
  all_tiers: "सभी स्तर",
  tier_routine: "नियमित",
  tier_urgent: "त्वरित",
  tier_emergency: "आपातकालीन",
  filter_system_label: "प्रणाली:",
  showing_supported_count: "56 समर्थित क्लिनिकल स्थितियों में से {count} प्रदर्शित",
  scroll_explore_hint: "सभी {count} समर्थित स्थितियों को देखने के लिए इस पैनल में स्क्रॉल करें",
  direct_routing_enabled: "सीधा क्लिनिकल रूटिंग सक्रिय",
  no_matching_diseases: "कोई मेल खाने वाला रोग नहीं मिला",
  no_matching_diseases_desc: "व्यापक शब्दों से खोजें या सामान्य चिकित्सक सुविधाओं को देखने के लिए सामान्य चिकित्सा विकल्प चुनें।",
  route_to_general_medicine_btn: "सामान्य चिकित्सा पर रूट करें",
  primary_procedure_label: "प्राथमिक प्रक्रिया",
  recommended_for_ambiguity: "अस्पष्टता के लिए अनुशंसित",

  // Dedicated Direct Routing Loading State
  direct_clinical_route_badge: "सीधा क्लिनिकल मार्ग",
  live_geospatial_engine: "लाइव भू-स्थानिक इंजन",
  routing_for_condition: "{name} के लिए रूटिंग",
  icd10_identifier_label: "ICD-10 पहचानकर्ता",
  specialization_label: "विशेषज्ञता",
  clinical_urgency_label: "क्लिनिकल तात्कालिकता",
  step_icd_title: "प्रत्यक्ष ICD-10 क्लिनिकल एंकर",
  step_icd_badge: "क्लिनिकल मैच",
  step_dept_title: "विशेषज्ञ विभाग व सुविधा फ़िल्टर",
  step_dept_badge: "सुविधा तैयार",
  step_geo_title: "भू-स्थानिक दूरी और टियर मैट्रिक्स",
  step_geo_badge: "920+ केंद्र",
  step_tariff_title: "टैरिफ अंशांकन और बिस्तर उपलब्धता",
  step_tariff_badge: "लाइव टेलीमेट्री",
  scanned_nodes_label: "स्कैन किए गए नेटवर्क नोड्स",
  matched_facilities_label: "मेल खाने वाली विशेषज्ञ सुविधाएं",
  optimizing_route_label: "मार्ग अनुकूलित हो रहा है...",

  // Nerd Hub / Model Diagnostics Dialog
  nerd_hub_title: "AI मॉडल डायग्नोस्टिक्स और आर्किटेक्चर डीप-डाइव",
  nerd_hub_subtitle: "मल्टी-मॉडल तकनीकी विनिर्देश, प्रशिक्षण स्रोत, वास्तविक डेटासेट और सत्यापित अस्पताल रजिस्ट्री",
  tab_deep_dive: "मॉडल डीप-डाइव",
  tab_datasets: "प्रशिक्षण डेटासेट",
  tab_hospitals: "अस्पताल रजिस्ट्री",
  tab_comparison: "3-मॉडल तुलना",
  active_model_badge: "सक्रिय मॉडल",
  switch_to_model: "इस मॉडल पर स्विच करें",
  datasets_section_title: "मॉडल प्रशिक्षण डेटासेट और स्रोत",
  datasets_section_desc: "हमारे तीनों उत्पादन मॉडलों को प्रशिक्षित करने वाले वास्तविक डेटासेट का निरीक्षण करें",
  select_model_dataset: "मॉडल डेटासेट चुनें:",
  download_real_dataset_xlsx: "वास्तविक डेटासेट डाउनलोड करें (.xlsx)",
  download_json_dataset: "JSON डाउनलोड करें (.json)",
  preview_real_dataset: "डेटासेट पूर्वावलोकन",
  search_dataset_placeholder: "नमूने, लक्षण, स्थितियां खोजें...",
  hospitals_section_title: "सत्यापित अस्पताल रजिस्ट्री निर्देशिका",
  hospitals_section_desc: "पूरे भारत में सभी 924 सत्यापित अस्पतालों, मान्यता स्तरों, प्रक्रियाओं और शुल्कों को देखें",
  search_hospitals_placeholder: "अस्पताल का नाम, शहर, विशेषज्ञता, पता खोजें...",
  download_hospital_registry: "अस्पताल रजिस्ट्री डाउनलोड करें (.json)",
  all_cities: "सभी शहर",
  comparison_section_title: "3-मॉडल आर्किटेक्चर और प्रदर्शन तुलना मैट्रिक्स",
  close_diagnostics: "डायग्नोस्टिक्स बंद करें",
  all_models_online: "सभी मॉडल: 3/3 ऑनलाइन",
  diseases_56_btn: "56 रोग",
  firebase_connected: "फ़ायरबेस कनेक्टेड",
  firebase_disconnected: "फ़ायरबेस डिस्कनेक्टेड",
  history_btn: "इतिहास",
  help_instructions_btn: "उपयोग विधि",
  help_btn_short: "मदद",
  help_instructions_title: "मेडीपाथ एआई का उपयोग कैसे करें",
  help_instructions_subtitle: "लक्षण परामर्श, 4-स्तरीय अस्पताल चयन और लागत अनुमान के लिए संपूर्ण मार्गदर्शिका",
  got_it_btn: "समझ गया, शुरू करें",
};

const gu: TranslationDictionary = {
  // Brand & Header
  brand_title: "મેડીપાથ AI",
  tagline: "આરોગ્ય નિર્ણય સહાયક મંચ",
  doctor_ai: "ડૉક્ટર એઆઈ",
  find_hospitals: "હોસ્પિટલો શોધો",
  print_summary: "સારાંશ પ્રિન્ટ કરો",
  reset: "રીસેટ કરો",
  model_active: "મોડેલ 2.0 સક્રિય",
  login: "લૉગ ઇન",
  sign_out: "સાઇન આઉટ",
  welcome_user: "સ્વાગત છે, {name} · મેડીપાથ આઈડી {id}",
  download_desktop_app: "એપ ડાઉનલોડ કરો",
  download_for_windows: "વિન્ડોઝ માટે ડાઉનલોડ",
  desktop_edition: "ડેસ્કટોપ આવૃત્તિ",
  offline_ready: "ઑફલાઇન તૈયાર",
  offline_clinical_active: "ઑફલાઇન ક્લિનિકલ મોડ સક્રિય",

  // Home Page
  hero_badge: "ભારત માટે એઆઈ-આધારિત આરોગ્ય માર્ગદર્શન",
  hero_title_1: "યોગ્ય સંભાળ મેળવો, યોગ્ય",
  hero_title_2: "હોસ્પિટલમાં, યોગ્ય ખર્ચે.",
  hero_subtitle: "તમારા લક્ષણો અથવા સારવાર કોઈપણ ભારતીય ભાષા અથવા અંગ્રેજીમાં જણાવો. મેડીપાથ એઆઈ તેનું સંભવિત કારણ ઓળખીને પારદર્શક ખર્ચ અંદાજ સાથે નજીકની હોસ્પિટલો દર્શાવે છે.",
  try_label: "ઉદાહરણ:",
  feature_multilingual: "હિન્દી, ગુજરાતી અને અંગ્રેજી",
  feature_costs: "પારદર્શક ખર્ચ",
  feature_nabh: "એનએબીએચ-પ્રમાણિત",
  footer_text: "મેડીપાથ એઆઈ · આરોગ્ય નિર્ણય સહાયક મંચ",

  // SearchBar
  search_placeholder: "તમારા લક્ષણો, બીમારી અથવા સારવાર અહીં લખો...",
  search_button: "સંભાળ શોધો",
  consult_doctor: "ડૉક્ટર એઆઈ સાથે સલાહ લો",
  listening: "સાંભળી રહ્યા છીએ...",
  speak_prompt: "તમારા લક્ષણો બોલો...",
  stop_listening: "બોલવાનું બંધ કરો",
  select_language: "ભાષા પસંદ કરો",
  clear: "સાફ કરો",
  model_version: "મોડેલ સંસ્કરણ",
  mic_unavailable: "માઇક્રોફોન ઍક્સેસ માટે પરવાનગી અથવા સુસંગત બ્રાઉઝર આવશ્યક છે.",
  search_empty_error: "સલાહ શરૂ કરવા માટે કૃપા કરીને તમારા લક્ષણો લખો અથવા બોલો.",

  // LocationFilter
  showing_hospitals_near: "અહીં નજીકની હોસ્પિટલો:",
  use_my_location: "મારું વર્તમાન સ્થાન વાપરો",
  scope_city: "શહેર",
  scope_state: "રાજ્ય",
  scope_all_india: "સમગ્ર ભારત",
  select_city: "શહેર પસંદ કરો",

  // DoctorConsultationPanel
  consultation_title: "ડૉ. મેડીપાથ · એઆઈ ક્લિનિકલ નેવિગેટર",
  consultation_subtitle: "56 પ્રાથમિક સંભાળ વર્ગો · લક્ષણ સ્પષ્ટીકરણ અને હોસ્પિટલ રૂટીંગ",
  model_confidence: "મોડેલ આત્મવિશ્વાસ",
  model_confidence_caption: "56 પ્રાથમિક સંભાળ વર્ગોમાં મોડેલ 2.0 આંકડાકીય ગોઠવણી. આ પ્રારંભિક માર્ગદર્શન છે, ચોક્કસ નિદાન નથી.",
  updating_assessment: "મૂલ્યાંકન અપડેટ થઈ રહ્યું છે...",
  score_unavailable: "સ્કોર ઉપલબ્ધ નથી (સુરક્ષિત રેફરલ)",
  differential_threshold: "ચોક્કસતા થ્રેશોલ્ડ: 85%",
  pattern_alignment: "પેટર્ન ગોઠવણી:",
  alignment_high: "ઉચ્ચ ગોઠવણી",
  alignment_narrowing: "ચોક્કસતા વધી રહી છે",
  alignment_exploring: "પેટર્ન શોધ ચાલુ",
  turn_0_mandatory: "પ્રારંભિક ફરજિયાત પ્રશ્ન",
  turn_clarifying: "પ્રશ્ન {n}: પુરાવા સ્પષ્ટીકરણ",
  evidence_btn: "પુરાવા",
  evidence_panel_title: "તબીબી પુરાવા અને વિચારણા લોગ",
  no_more_symptoms: "વધુ કોઈ લક્ષણો નથી (પરિણામો જુઓ)",
  type_placeholder: "અન્ય કોઈ લક્ષણો કે તકલીફ હોય તો અહીં લખો...",
  thinking_message: "ડૉ. મેડીપાથ તમારા લક્ષણોનું વિશ્લેષણ કરી રહ્યા છે...",
  send_button: "મોકલો",
  proceed_to_hospitals: "નજીકની હોસ્પિટલો શોધો",
  possible_cause_identified: "સંભવિત તબીબી કારણ ઓળખાયું",
  urgency: "તાકીદ",
  recommended_specialist: "ભલામણ કરેલ નિષ્ણાત",
  back_to_search: "શોધ પર પાછા જાઓ",
  emergency_alert: "ગંભીર કટોકટી (CRITICAL EMERGENCY)",
  safe_deferral_badge: "તબીબી સલાહ ભલામણ કરેલ",
  action_find_hospitals: "ક્રિયા: નજીકની હોસ્પિટલો શોધો",
  reported_symptoms: "જણાવેલ લક્ષણો",
  candidate_conditions: "સંભવિત પરિસ્થિતિઓ",
  clinical_decision_route: "તબીબી નિર્ણય માર્ગ",
  summary_preview: "સારાંશ પૂર્વાવલોકન",
  close_panel: "બંધ કરો",

  // Hospital ResultsView & Filters
  results_title: "તમારી જરૂરિયાતો સાથે મેળ ખાતી હોસ્પિટલો",
  hospitals_found_count: "તમારી સ્થિતિ માટે {n} હોસ્પિટલો મળી",
  showing_results_for: "આના માટે પરિણામો દર્શાવાય છે:",
  recommended_specialty: "ભલામણ કરેલ વિભાગ:",
  filter_hospitals: "હોસ્પિટલો ફિલ્ટર કરો",
  distance_slider: "મહત્તમ અંતર",
  nabh_accredited_only: "માત્ર એનએબીએચ (NABH) પ્રમાણિત",
  emergency_services_only: "માત્ર 24/7 ઇમરજન્સી સંભાળ",
  hospital_tier: "હોસ્પિટલ શ્રેણી",
  tier_all: "બધી શ્રેણીઓ",
  tier_budget: "બજેટ",
  tier_mid: "મધ્યમ શ્રેણી",
  tier_premium: "પ્રીમિયમ",
  sort_by: "ક્રમમાં ગોઠવો",
  sort_recommended: "શ્રેષ્ઠ મેળ (ભલામણ કરેલ)",
  sort_distance: "અંતર (નજીકથી પ્રથમ)",
  sort_cost: "અંદાજિત ખર્ચ (ઓછાથી વધુ)",
  sort_rating: "રેટિંગ (સૌથી વધુ પ્રથમ)",
  view_details: "વિગતો જુઓ",
  compare: "સરખામણી કરો",
  directions: "દિશા-નિર્દેશ / રસ્તો",
  why_recommended: "શા માટે ભલામણ કરેલ:",
  primary_match: "પ્રાથમિક તબીબી મેળ:",
  estimated_cost: "અંદાજિત સારવાર ખર્ચ",
  out_of_pocket: "અંદાજિત ખર્ચ શ્રેણી",
  cost_breakdown_btn: "ખર્ચ વિગતો",
  nabh_badge: "એનએબીએચ (NABH) પ્રમાણિત",
  emergency_badge: "24/7 ઇમરજન્સી",
  beds: "પથારી",
  no_hospitals_found: "તમારા માપદંડ મુજબ કોઈ હોસ્પિટલ મળી નથી",
  try_adjusting_filters: "અંતર અથવા શ્રેણી ફિલ્ટર બદલીને ફરી પ્રયાસ કરો.",
  cost_disclaimer: "અંદાજો પ્રાદેશિક હોસ્પિટલ દરો અને સારવારની જટિલતા પર આધારિત છે.",

  // CostBreakdown
  cost_breakdown_title: "અંદાજિત ખર્ચનું વિભાજન",
  base_procedure: "મૂળ પ્રક્રિયા / સારવાર",
  room_charges: "રૂમ અને નર્સિંગ ચાર્જ",
  doctor_fee: "ડૉક્ટર અને નિષ્ણાત ફી",
  medicines_consumables: "દવાઓ અને વપરાશ સામગ્રી",
  total_estimated: "કુલ અંદાજિત શ્રેણી",
  estimated_stay: "અંદાજિત દાખલ દિવસો",
  days: "દિવસ",
  per_day: "પ્રતિ દિવસ",
  base_medical_cost: "મૂળ તબીબી ખર્ચ (Base Medical Cost)",
  step1_base_cost: "પગલું 1: મૂળ તબીબી ખર્ચ",
  step2_tier_factor: "પગલું 2: હોસ્પિટલ શ્રેણી ગુણક (Hospital Tier)",
  step3_nabh_factor: "પગલું 3: ગુણવત્તા પ્રમાણીકરણ ગુણક (NABH)",
  doctor_procedure_fee: "ડૉક્ટર / સર્જરી ફી",
  lab_and_tests: "લેબ અને ટેસ્ટ (Diagnostics)",
  medicines_injections: "દવાઓ અને ઇન્જેક્શન",
  room_rent_stay: "રૂમ ભાડું ({days} દિવસ × {rate}/દિવસ)",
  opd_no_stay: "ઓપીડી પરામર્શ (0 દિવસ દાખલ)",
  tier_budget_factor: "ટ્રસ્ટ / બજેટ હોસ્પિટલ (0.60×)",
  tier_mid_factor: "સામાન્ય ખાનગી હોસ્પિટલ (1.00×)",
  tier_premium_factor: "કોર્પોરેટ સુપર-સ્પેશિયાલિટી (1.75×)",
  nabh_accredited_factor: "NABH પ્રમાણિત (+5%)",
  non_accredited_factor: "બિન-પ્રમાણિત (1.00×)",
  select_hospital_view_bill: "વિગતવાર બિલ જોવા માટે હોસ્પિટલ પસંદ કરો",
  tier_comparison_headline: "હોસ્પિટલ શ્રેણીઓ મુજબ અંદાજિત ખર્ચ",
  tier_budget_desc: "ટ્રસ્ટ / ચેરિટેબલ (~40% સસ્તું)",
  tier_mid_desc: "સામાન્ય પ્રાઇવેટ હોસ્પિટલ (બજાર ભાવ)",
  tier_premium_desc: "કોર્પોરેટ સુપર-સ્પેશિયાલિટી (એપોલો, ફોર્ટિસ, મેક્સ)",
  final_treatment_bill: "કુલ અંદાજિત સારવાર ખર્ચ",
  formula_explainer: "કુલ ખર્ચ = મૂળ તબીબી ખર્ચ × હોસ્પિટલ શ્રેણી × એનએબીએચ પ્રમાણપત્ર",

  // FilterPanel
  search_hospital_placeholder: "હોસ્પિટલનું નામ શોધો",
  procedure: "પ્રક્રિયા / સારવાર",
  all_procedures: "બધી પ્રક્રિયાઓ",
  specialization: "નિષ્ણાત વિભાગ",
  all_specializations: "બધા વિભાગો",
  radius: "વિસ્તાર ત્રિજ્યા",
  open_status: "ખુલવાની સ્થિતિ",
  any_status: "કોઈપણ સ્થિતિ",
  open: "ખુલ્લું છે",
  closed: "બંધ છે",
  min_rating: "ઓછામાં ઓછું રેટિંગ",
  cost_range: "ખર્ચ શ્રેણી",
  no_limit: "કોઈ મર્યાદા નથી",
  max_budget: "મહત્તમ બજેટ",
  reset_all_filters: "બધા ફિલ્ટર રીસેટ કરો",
  hospitals_match: "{n} હોસ્પિટલો મેળ ખાય છે",

  // ResultsView & Cards
  possible_cause: "સંભવિત કારણ",
  target_specialization: "લક્ષિત નિષ્ણાત વિભાગ",
  matched_procedure: "અનુરૂપ સારવાર / સલાહ",
  clinical_pathway: "એઆઈ તબીબી ભલામણ અને વિભાગીય માર્ગ",
  reconsult_doctor: "ડૉ. મેડીપાથ સાથે ફરી સલાહ લો",
  listen_assessment: "સમીક્ષા સાંભળો",
  stop_narration: "વાંચન બંધ કરો",
  recommendation_sequence: "ભલામણ સ્ત્રોત ક્રમ:",
  all_sources: "બધા સ્ત્રોત",
  verified_registry: "ચકાસાયેલ રજિસ્ટ્રી",
  google_places: "ગૂગલ પ્લેસેસ",
  openstreetmap: "ઓપનસ્ટ્રીટમેપ",
  hospitals_near_location: "{location} નજીક {count} હોસ્પિટલો મળી",
  within_radius_sorted: "{radius} કિમીમાં · {sort} મુજબ",
  compared: "સરખામણીમાં",
  verified_specialist_match: "ચકાસાયેલ નિષ્ણાત મેળ",
  general_care_fallback: "સામાન્ય સંભાળ રેફરલ સુવિધા",
  best_match: "શ્રેષ્ઠ મેળ",
  emergency_24x7: "24x7 ઇમરજન્સી",
  recommendation_basis: "ભલામણનો આધાર",
  reviews_label: "સમીક્ષાઓ",
  diagnostics: "લેબોરેટરી અને પરીક્ષણો",
  contingency_buffer: "ઇમરજન્સી બફર ({pct}%)",
  transparent_estimate_tier: "શ્રેણી સરેરાશ પર આધારિત પારદર્શક અંદાજ",
  confident: "ચોક્કસતા",

  // Dialogs & Actions
  contact_and_location: "સંપર્ક અને સ્થળ",
  specialties: "નિષ્ણાત વિભાગો",
  available_procedures: "ઉપલબ્ધ સારવાર પ્રક્રિયાઓ",
  estimated_cost_at_hospital: "આ હોસ્પિટલમાં અંદાજિત ખર્ચ",
  procedure_range: "સારવાર ખર્ચ શ્રેણી",
  per_day_stay: "પ્રતિ દિવસ દાખલ ખર્ચ",
  avg_stay: "સરેરાશ દાખલ દિવસો",
  total_stay_cost: "કુલ દાખલ ખર્ચ",
  get_directions: "દિશા મેળવો",
  view_on_map: "નકશા પર જુઓ",
  compare_hospitals: "હોસ્પિટલોની સરખામણી કરો",
  measure: "માપદંડ",
  comparison_disclaimer: "ખર્ચ અને ઉપલબ્ધતાના મૂલ્યો ઉપલબ્ધ હોસ્પિટલ ડેટા પર આધારિત અંદાજ છે.",
  preliminary_assessment_title: "પ્રારંભિક તબીબી સમીક્ષા",
  preliminary_assessment_desc: "આ પ્રારંભિક મૂલ્યાંકન પૂરી પાડવામાં આવેલ માહિતી પર આધારિત સંભવિત પરિસ્થિતિઓ દર્શાવે છે અને તે તબીબી નિદાન નથી. યોગ્ય તબીબ દ્વારા કારણની પુષ્ટિ થવી જોઈએ.",
  model_uncertain_warning: "મોડેલ અનિશ્ચિત છે. આ સંભવિત મેળ છે, ચોક્કસ નિદાન નથી.",

  // Medical Disclaimer Component
  medical_disclaimer_title: "તબીબી અસ્વીકરણ (Medical Disclaimer)",
  medical_disclaimer_text: "મેડીપાથ એઆઈ માત્ર માહિતીપ્રદ અંદાજ પૂરો પાડે છે અને તે વ્યાવસાયિક તબીબી સલાહ, નિદાન કે સારવારનો વિકલ્પ નથી. સ્વાસ્થ્ય સમસ્યાઓ માટે હંમેશા યોગ્ય તબીબની સલાહ લો. હોસ્પિટલનો ખર્ચ સૂચક છે અને દર્દીની સ્થિતિ, વીમા તથા પસંદ કરેલ સારવાર મુજબ બદલાઈ શકે છે.",

  // Status & Badges
  not_accredited: "પ્રમાણિત નથી",
  not_listed: "યાદીમાં નથી",
  phone_not_listed: "ફોન નંબર ઉપલબ્ધ નથી",
  website_not_listed: "વેબસાઇટ ઉપલબ્ધ નથી",
  visit_website: "હોસ્પિટલ વેબસાઇટની મુલાકાત લો",
  limit_hit: "દૈનિક મર્યાદા પૂર્ણ",
  model_2_guidance: "મોડેલ 2.0 માર્ગદર્શન",
  emergency_override_badge: "ઇમરજન્સી પ્રાથમિકતા",
  safe_referral_badge: "સુરક્ષિત રેફરલ",
  user_finalized_badge: "વપરાશકર્તા દ્વારા પૂર્ણ",
  threshold_badge: "ચોક્કસતા થ્રેશોલ્ડ",
  protocol_active: "પ્રોટોકોલ સક્રિય",

  // Confirmed Condition Card
  possible_cause_identified_title: "સંભવિત તબીબી કારણ ઓળખાયું",
  urgent_safety_notice_title: "તાકીદની સુરક્ષા સૂચના",
  general_care_referral_title: "સામાન્ય સંભાળ રેફરલ",
  assessment_complete_badge: "મૂલ્યાંકન પૂર્ણ",
  clinical_safety_protocol: "તબીબી સુરક્ષા પ્રોટોકોલ",
  clinical_safety_protocol_desc: "વિશેષ તબીબી તપાસ માટે સુરક્ષા પ્રોટોકોલ દ્વારા નિર્દેશિત માર્ગ.",
  recommended_procedure_notice: "ભલામણ કરેલ તબીબી પ્રક્રિયા / સલાહ:",
  hospitals_matched_for_procedure: "આ વિશેષ સારવાર અને વિભાગની સુવિધા ધરાવતી હોસ્પિટલો આપના માટે શોધવામાં આવી છે.",
  preliminary_navigation_notice: "પ્રારંભિક તબીબી નેવિગેશન સૂચના",
  preliminary_navigation_desc: "આ આપેલી વિગતો પર આધારિત સંભવિત કારણ છે, તબીબી નિદાન નથી. યોગ્ય તબીબ દ્વારા કારણની પુષ્ટિ થવી જરૂરી છે. જો લક્ષણો ગંભીર હોય તો તાત્કાલિક સારવાર મેળવો.",
  reason_for_referral: "સામાન્ય રેફરલનું કારણ:",
  click_view_hospitals_for_condition: "{condition} માટે ચકાસાયેલ હોસ્પિટલો, પ્રક્રિયાઓ, પથારી ઉપલબ્ધતા અને દિશા જોવા નીચે ક્લિક કરો.",
  click_view_general_care: "પ્રારંભિક તપાસ અને રેફરલ માટે ચકાસાયેલ સામાન્ય સંભાળ હોસ્પિટલો જોવા નીચે ક્લિક કરો.",

  // Print Summary
  print_summary_title: "પ્રારંભિક આરોગ્ય નેવિગેશન અને ક્લિનિકલ વિભાગ રૂટીંગ સારાંશ",
  print_date: "તારીખ",
  print_time: "સમય",
  print_model_build: "મોડેલ બિલ્ડ",
  reported_symptoms_history: "દર્દી દ્વારા નોંધાયેલ લક્ષણો અને ઇતિહાસ",
  initial_query_label: "પ્રારંભિક લક્ષણો",
  accumulated_evidence: "એકત્રિત તબીબી વિગતો",
  top_differential_candidates: "મુખ્ય સંભવિત સારવાર શ્રેણીઓ",
  clinical_decision_rationale: "તબીબી નિર્ણય આધાર અને આગળનું પગલું",
  clinical_assessment: "તબીબી મૂલ્યાંકન",
  specialist_care: "નિષ્ણાત સંભાળ",
  comprehensive_clinical_assessment: "વ્યાપક રૂબરૂ તબીબી મૂલ્યાંકન",
  regional_referral_title: "પ્રાદેશિક તૃતીય સંભાળ રેફરલ",
  general_care_facility_title: "સામાન્ય સંભાળ રેફરલ સુવિધાઓની ભલામણ",
  close: "બંધ કરો",

  // Follow-up & Consultation UI localization
  keyboard_hint: "મોકલવા માટે Enter દબાવો · નવી લાઇન માટે Shift + Enter",
  consultation_welcome_desc: "ડૉ. મેડીપાથ 56 સમર્થિત પરિસ્થિતિઓમાં TF-IDF અને મોડેલ 2.0 લોજિસ્ટિક રીગ્રેશનનો ઉપયોગ કરીને લક્ષણો સ્પષ્ટ કરે છે જેથી તમને યોગ્ય તબીબી વિભાગ અને ચકાસાયેલ સંભાળ મળી શકે.",
  prior_assessment: "અગાઉનું મૂલ્યાંકન",
  prior_clinical_assessment: "અગાઉનું ક્લિનિકલ મૂલ્યાંકન",
  re_evaluating_below: "નીચે આપેલા વધારાના લક્ષણો સાથે પુનઃમૂલ્યાંકન ચાલુ છે...",
  actions_on_latest: "નવીનતમ મૂલ્યાંકન પર ઉપલબ્ધ ક્રિયાઓ",
  recommended_accompanying_symptoms: "ભલામણ કરેલ સંબંધિત લક્ષણો:",
  recommended_symptoms_patterns: "સંભવિત પેટર્નમાંથી ભલામણ કરેલ લક્ષણો:",
  select_single_or_multiple: "એક અથવા વધુ પસંદ કરો",
  click_single_or_toggle: "એક અથવા બહુવિધ પસંદ કરો",
  btn_only: "માત્ર આ",
  send_only_this_tooltip: "માત્ર આ લક્ષણ મોકલો",
  submit_selected_chips: "પસંદ કરેલ લક્ષણો મોકલો ({count})",
  btn_skip_reveal: "એનિમેશન છોડો",
  dismiss: "બંધ કરો",
  scroll_to_latest: "નવીનતમ પ્રતિક્રિયા પર જાઓ",
  language_label: "ભાષા",
  listening_in_lang: "{lang}માં સાંભળી રહ્યા છીએ...",
  finished_symptoms_cta: "લક્ષણો જણાવવાનું પૂર્ણ? અહીં ક્લિક કરો",
  re_evaluate_hint: "પુનઃમૂલ્યાંકન માટે ગમે ત્યારે વધુ લક્ષણો ઉમેરી શકો છો",
  fallback_assessment_text: "મેડીપાથ એઆઈએ તમારા જણાવેલ લક્ષણો નોંધી લીધા છે: \"{symptoms}\". ચાલો સંભવિત કારણો સ્પષ્ટ કરીએ જેથી તમને યોગ્ય હોસ્પિટલ વિભાગ સુધી પહોંચાડી શકાય.",
  fallback_question_text: "શું તમે આમાંથી કોઈપણ સંબંધિત લક્ષણોનો પણ અનુભવ કરી રહ્યા છો?",

  // Information Used Panel
  info_used_title: "આ મૂલ્યાંકનમાં ઉપયોગમાં લેવાયેલી માહિતી",
  model_audit_badge: "મોડેલ 2.0 ઓડિટ",
  hide: "છુપાવો",
  review: "સમીક્ષા કરો",
  info_used_desc: "આ નેવિગેશન પ્રવાહ દરમિયાન ઉપયોગમાં લેવાયેલી વિગતો અને મોડેલ આઉટપુટ છે. આ તબીબી નિદાન સાબિત કરતા નથી.",
  reported_symptom_evidence: "જણાવેલ લક્ષણોના પુરાવા",
  additional_reported_label: "વધારાના જણાવેલ લક્ષણો:",
  confirmed_selections_label: "પુષ્ટિ થયેલ પસંદગીઓ:",
  none_confirmed: "કોઈ પુષ્ટિ નથી",
  rejected_options_label: "નકારેલા વિકલ્પો:",
  options_excluded: "{count} વિકલ્પો બાકાત રાખ્યા",
  model_alignment_metrics: "મોડેલ ગોઠવણી મેટ્રિક્સ",
  model_probability_label: "મોડેલ સંભાવના:",
  required_threshold_label: "જરૂરી થ્રેશોલ્ડ:",
  threshold_status_label: "થ્રેશોલ્ડ સ્થિતિ:",
  threshold_met: "પૂર્ણ",
  threshold_pending: "બાકી / નિયમ",
  decision_source_label: "નિર્ણય સ્ત્રોત:",
  leading_candidates_label: "વર્તમાન અગ્રણી સંભવિત સ્થિતિઓ:",

  // Additional ResultsView translations
  referral_note: "રેફરલ નોંધ:",
  google_places_limit_hit_banner: "ગૂગલ પ્લેસેસ દૈનિક મર્યાદા સમાપ્ત ({calls}/{max} કોલ) — સક્રિય વિકલ્પ: ચકાસાયેલ રજિસ્ટ્રી + OSM",
  google_places_tracker_active: "ગૂગલ પ્લેસેસ API: આજે {calls} / {max} કોલ વપરાયા ({remaining} બાકી · દૈનિક રીસેટ)",

  // Direct Routing & Supported Diseases Directory
  clinical_directory_badge: "ક્લિનિકલ ડિરેક્ટરી",
  verified_conditions_count: "56 ચકાસાયેલ તબીબી સ્થિતિઓ અને પ્રોટોકોલ્સ",
  supported_diseases_title: "સમર્થિત રોગો અને સીધું હોસ્પિટલ રૂટિંગ",
  supported_diseases_subtitle: "શું તમને તમારી સ્થિતિ પહેલેથી જ ખબર છે? લક્ષણ ટ્રાયેજને બાયપાસ કરવા અને પ્રમાણિત નિષ્ણાતો અને માન્યતા પ્રાપ્ત હોસ્પિટલો સુધી તાત્કાલિક પહોંચવા નીચે કોઈપણ રોગ પર સીધા ક્લિક કરો.",
  general_medicine_card_title: "ખાતરી નથી કે કયો રોગ છે? જનરલ મેડિસિન (General Medicine) પસંદ કરો",
  general_medicine_card_subtitle: "જ્યારે લક્ષણો અસ્પષ્ટ હોય અથવા નિદાન ન થયું હોય, ત્યારે લાયક સામાન્ય ચિકિત્સકો સાથે વ્યાપક પ્રાથમિક સંભાળ મૂલ્યાંકન.",
  route_to_general_hospitals: "સામાન્ય હોસ્પિટલો પર રૂટ કરો",
  search_diseases_placeholder: "રોગો, ICD-10 કોડ, વિશેષતા શોધો (દા.ત., મોતિયો, E11.9, કાર્ડિયોલોજી, શ્વાસની તકલીફ)...",
  all_tiers: "બધા સ્તરો",
  tier_routine: "નિયમિત",
  tier_urgent: "ત્વરિત",
  tier_emergency: "ઇમરજન્સી",
  filter_system_label: "સિસ્ટમ:",
  showing_supported_count: "56 સમર્થિત ક્લિનિકલ પરિસ્થિતિઓમાંથી {count} દર્શાવેલ છે",
  scroll_explore_hint: "બધી {count} સમર્થિત પરિસ્થિતિઓ જોવા માટે આ પેનલમાં સ્ક્રોલ કરો",
  direct_routing_enabled: "સીધું ક્લિનિકલ રૂટિંગ સક્ષમ",
  no_matching_diseases: "કોઈ મેળ ખાતો રોગ મળ્યો નથી",
  no_matching_diseases_desc: "વ્યાપક શબ્દોથી શોધો અથવા સામાન્ય ચિકિત્સક સુવિધાઓ જોવા માટે સામાન્ય દવા વિકલ્પ પસંદ કરો.",
  route_to_general_medicine_btn: "જનરલ મેડિસિન પર રૂટ કરો",
  primary_procedure_label: "પ્રાથમિક પ્રક્રિયા",
  recommended_for_ambiguity: "અસ્પષ્ટતા માટે ભલામણ કરેલ",

  // Dedicated Direct Routing Loading State
  direct_clinical_route_badge: "સીધો ક્લિનિકલ માર્ગ",
  live_geospatial_engine: "લાઇવ જીઓસ્પેશિયલ એન્જિન",
  routing_for_condition: "{name} માટે રૂટિંગ",
  icd10_identifier_label: "ICD-10 ઓળખકર્તા",
  specialization_label: "વિશેષતા",
  clinical_urgency_label: "ક્લિનિકલ તાકીદ",
  step_icd_title: "સીધો ICD-10 ક્લિનિકલ એન્કર",
  step_icd_badge: "ક્લિનિકલ મેચ",
  step_dept_title: "નિષ્ણાત વિભાગ અને સુવિધા ફિલ્ટર",
  step_dept_badge: "સુવિધા તૈયાર",
  step_geo_title: "ભૂ-સ્થાનિક અંતર અને ટિયર મેટ્રિક્સ",
  step_geo_badge: "920+ કેન્દ્રો",
  step_tariff_title: "ટેરિફ કેલિબ્રેશન અને પથારી ઉપલબ્ધતા",
  step_tariff_badge: "લાઇવ ટેલિમેટ્રી",
  scanned_nodes_label: "સ્કેન કરેલ નેટવર્ક નોડ્સ",
  matched_facilities_label: "મેળ ખાતી નિષ્ણાત સુવિધાઓ",
  optimizing_route_label: "રૂટ અનુકૂલિત થઈ રહ્યો છે...",

  // Nerd Hub / Model Diagnostics Dialog
  nerd_hub_title: "AI મોડેલ ડાયગ્નોસ્ટિક્સ અને આર્કિટેક્ચર ડીપ-ડાઇવ",
  nerd_hub_subtitle: "મલ્ટી-મોડેલ ટેકનિકલ સ્પષ્ટીકરણો, પ્રશિક્ષણ સ્ત્રોત, વાસ્તવિક ડેટાસેટ્સ અને ચકાસાયેલ હોસ્પિટલ રજિસ્ટ્રી",
  tab_deep_dive: "મોડેલ ડીપ-ડાઇવ",
  tab_datasets: "ટ્રેનિંગ ડેટાસેટ્સ",
  tab_hospitals: "હોસ્પિટલ રજિસ્ટ્રી",
  tab_comparison: "3-મોડેલ સરખામણી",
  active_model_badge: "સક્રિય મોડેલ",
  switch_to_model: "આ મોડેલ પર સ્વિચ કરો",
  datasets_section_title: "મોડેલ ટ્રેનિંગ ડેટાસેટ્સ અને સ્ત્રોત",
  datasets_section_desc: "અમારા ત્રણેય ઉત્પાદન મોડેલોને તાલીમ આપવા માટે વપરાયેલ વાસ્તવિક ડેટાસેટ્સ તપાસો",
  select_model_dataset: "મોડેલ ડેટાસેટ પસંદ કરો:",
  download_real_dataset_xlsx: "વાસ્તવિક ડેટાસેટ ડાઉનલોડ કરો (.xlsx)",
  download_json_dataset: "JSON ડાઉનલોડ કરો (.json)",
  preview_real_dataset: "ડેટાસેટ પૂર્વાવલોકન",
  search_dataset_placeholder: "નમૂના, લક્ષણો, રોગો શોધો...",
  hospitals_section_title: "ચકાસાયેલ હોસ્પિટલ રજિસ્ટ્રી ડિરેક્ટરી",
  hospitals_section_desc: "સમગ્ર ભારતમાં તમામ 924 ચકાસાયેલ હોસ્પિટલો, માન્યતા સ્તરો, પ્રક્રિયાઓ અને શુલ્ક જુઓ",
  search_hospitals_placeholder: "હોસ્પિટલનું નામ, શહેર, વિશેષતા, સરનામું શોધો...",
  download_hospital_registry: "હોસ્પિટલ રજિસ્ટ્રી ડાઉનલોડ કરો (.json)",
  all_cities: "બધા શહેરો",
  comparison_section_title: "3-મોડેલ આર્કિટેક્ચર અને પ્રદર્શન સરખામણી મેટ્રિક્સ",
  close_diagnostics: "ડાયગ્નોસ્ટિક્સ બંધ કરો",
  all_models_online: "બધા મોડેલ્સ: 3/3 ઑનલાઇન",
  diseases_56_btn: "56 રોગો",
  firebase_connected: "ફાયરબેઝ કનેક્ટેડ",
  firebase_disconnected: "ફાયરબેઝ ડિસ્કનેક્ટેડ",
  history_btn: "ઇતિહાસ",
  help_instructions_btn: "કેવી રીતે વાપરવું",
  help_btn_short: "મદદ",
  help_instructions_title: "મેડીપાથ એઆઈનો ઉપયોગ કેવી રીતે કરવો",
  help_instructions_subtitle: "લક્ષણ પરામર્શ, 4-સ્તરીય હોસ્પિટલ શોધ અને ખર્ચ અંદાજ માટે સંપૂર્ણ માર્ગદર્શિકા",
  got_it_btn: "સમજાઈ ગયું, શરૂ કરો",
};

export const DICTIONARIES: Record<string, TranslationDictionary> = {
  en,
  hi,
  gu,
};

// ── CLIENT-SIDE LANGUAGE & TRANSLITERATION DETECTION ──

const GUJARATI_ROMANIZED_PHRASES = [
  /\b(mathu\s+dukhe|pet\s+dukhe|chhati\s+dukhe)\b/i,
  /\b(dukhe\s+chhe|dukhe\s+che)\b/i,
  /\b(thay\s+chhe|thay\s+che|thaye\s+chhe)\b/i,
  /\b(pade\s+chhe|pade\s+che)\b/i,
  /\b(taav\s+chhe|taav\s+che|taav\s+pan)\b/i,
  /\b(shwas\s+levama|saans\s+levama)\b/i,
  /\b(taklif\s+pade\s+chhe|taklif\s+pade|taklif\s+chhe)\b/i,
  /\b(be\s+divas\s+thi|tran\s+divas\s+thi)\b/i,
  /\b(have\s+mane|mane\s+have|have\s+taav)\b/i,
  /\b(kai\s+nathi|kashu\s+nathi|biju\s+kai\s+nathi)\b/i,
];

const GUJARATI_ROMANIZED_WORDS = new Set([
  "mane", "maru", "mari", "maro", "tamne", "amne", "apne",
  "mathu", "pet", "taav", "shwas", "taklif", "ulti", "chakkar", "gadu", "khasi",
  "uthalo", "udhras", "shardi", "chhati", "jhad", "jhada", "dhabkara",
  "chhe", "che", "thay", "thaye", "pade", "rehe", "hato", "hati", "hatu",
  "thi", "ma", "maa", "ane", "pan", "ke", "mate", "sudhi", "ni", "nu", "na",
  "divas", "aaje", "kal", "have", "ghano", "bahu", "aetle", "nathi", "kai", "kashu"
]);

const HINDI_ROMANIZED_PHRASES = [
  /\b(ho\s+raha\s+hai|ho\s+rahi\s+hai|ho\s+rahe\s+hai)\b/i,
  /\b(dard\s+hai|dard\s+ho|dard\s+bhi)\b/i,
  /\b(dikkat\s+ho\s+rahi|takleef\s+ho\s+rahi|takleef\s+hai|dikkat\s+hai)\b/i,
  /\b(bukhar\s+hai|taav\s+hai|bukhar\s+bhi)\b/i,
  /\b(saans\s+lene\s+me|saans\s+lene\s+mein)\b/i,
  /\b(pet\s+me|pet\s+mein|sir\s+me|sir\s+mein|sar\s+me|sar\s+mein)\b/i,
  /\b(do\s+din\s+se|tin\s+din\s+se|ek\s+hafte\s+se|kuch\s+din\s+se)\b/i,
  /\b(chhati\s+me|chhati\s+mein|gale\s+me|gale\s+mein|seene\s+me|seene\s+mein)\b/i,
  /\b(ulti\s+bhi|vomiting\s+bhi|body\s+pain\s+bhi|fever\s+hai|headache\s+hai)\b/i,
  /\b(aur\s+kuch\s+nahi|kuch\s+nahi\s+hai|bas\s+itna\s+hi)\b/i,
];

const HINDI_ROMANIZED_WORDS = new Set([
  "mujhe", "mera", "meri", "mere", "mujhko", "humko", "humein", "aapko", "apko", "tumko",
  "dard", "sar", "sir", "pet", "bukhar", "taav", "ulti", "chakkar", "gale", "khansi",
  "sardi", "jukam", "saans", "jalan", "kamzori", "thakan", "badan", "kamzor", "peshab",
  "chhati", "dikkat", "takleef", "soojan", "khujli", "dast", "behoshi", "aankh", "kaan",
  "peeth", "ghutna", "ghutne", "seene", "kamar", "kandha", "gala", "naak",
  "hai", "hain", "ho", "raha", "rahi", "rahe", "hoga", "hogi", "tha", "thi", "the",
  "mein", "me", "se", "ko", "par", "aur", "bhi", "bohot", "bahut", "thoda", "jyada",
  "din", "raat", "subah", "shaam", "aaj", "kal", "nahi", "nhi", "kuch", "koi"
]);

/**
 * Accurately detects whether text is native Gujarati/Hindi script or Romanized Gujarati/Hindi.
 */
export function detectInputLanguage(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Unicode native Indic script checks
  if (/[\u0A80-\u0AFF]/.test(trimmed)) return "gu";
  if (/[\u0900-\u097F]/.test(trimmed)) return "hi";

  // 2. Romanized phrase matching
  const lower = trimmed.toLowerCase();
  // Standard English conversational closure phrases must not trigger Indic detection
  if (/^(no|no more symptoms|none|nothing|yes|ok|okay|fine|nil|not applicable)$/i.test(lower)) {
    return null;
  }
  for (const phrase of GUJARATI_ROMANIZED_PHRASES) {
    if (phrase.test(lower)) return "gu";
  }
  for (const phrase of HINDI_ROMANIZED_PHRASES) {
    if (phrase.test(lower)) return "hi";
  }

  // 3. Token-based word count
  const words = lower.match(/[a-z]+/g) || [];
  if (words.length === 0) return null;

  let gujaratiMatches = 0;
  let hindiMatches = 0;
  for (const w of words) {
    if (GUJARATI_ROMANIZED_WORDS.has(w)) gujaratiMatches++;
    if (HINDI_ROMANIZED_WORDS.has(w)) hindiMatches++;
  }

  if (gujaratiMatches > hindiMatches && gujaratiMatches >= 1) return "gu";
  if (hindiMatches > 0) return "hi";

  // 4. English detection for Latin words with no Indic matches
  if (words.length > 0 && words.some((w) => w.length >= 3)) {
    return "en";
  }

  return null;
}

// ── 56 MODEL 2.0 CANONICAL CONDITION TRANSLATIONS ──

export const CONDITION_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {
  "Acne": { hi: "मुँहासे (Acne)", gu: "ખીલ (Acne)" },
  "Allergic Conjunctivitis": { hi: "एलर्जिक कंजंक्टिवाइटिस (आँखों की एलर्जी) (Allergic Conjunctivitis)", gu: "એલર્જિક કન્જક્ટિવાઇટિસ (આંખની એલર્જી) (Allergic Conjunctivitis)" },
  "Allergic Reaction / Urticaria": { hi: "एलर्जिक रिएक्शन / पित्ती (Urticaria)", gu: "એલર્જિક રિએક્શન / શીળસ (Urticaria)" },
  "Allergic Rhinitis": { hi: "एलर्जिक राइनाइटिस (एलर्जी वाली सर्दी) (Allergic Rhinitis)", gu: "એલર્જિક રાયનાઇટિસ (એલર્જિક શરદી) (Allergic Rhinitis)" },
  "Anal Fissure": { hi: "एनल फिशर (गुदा में चीरा) (Anal Fissure)", gu: "એનલ ફિશર (ગુદા ચીરો) (Anal Fissure)" },
  "Anxiety Disorder": { hi: "चिंता विकार (घबराहट) (Anxiety Disorder)", gu: "ચિંતા વિકાર (ગભરાટ) (Anxiety Disorder)" },
  "Appendicitis": { hi: "एपेंडिसाइटिस (Appendicitis)", gu: "એપેન્ડિસાઇટિસ (Appendicitis)" },
  "Asthma": { hi: "अस्थमा (दमा) (Asthma)", gu: "અસ્થમા (દમ) (Asthma)" },
  "Bacterial Vaginosis": { hi: "बैक्टीरियल वेजिनोसिस (Bacterial Vaginosis)", gu: "બેક્ટેરિયલ યોનિમાર્ગ ચેપ (Bacterial Vaginosis)" },
  "Benign Prostatic Hyperplasia / BPH": { hi: "पौरुष ग्रंथि वृद्धि / बीपीएच (BPH)", gu: "પ્રોસ્ટેટ વૃદ્ધિ / બીપીએચ (BPH)" },
  "Blepharitis": { hi: "ब्लेफेराइटिस (पलकों की सूजन) (Blepharitis)", gu: "બ્લેફેરાઇટિસ (પાંપણનો સોજો) (Blepharitis)" },
  "Bronchitis": { hi: "ब्रोंकाइटिस (श्वसन नली की सूजन) (Bronchitis)", gu: "બ્રોન્કાઇટિસ (શ્વાસનળીનો સોજો) (Bronchitis)" },
  "Carpal Tunnel Syndrome": { hi: "कार्पल टनल सिंड्रोम (हाथ में नस का दबाव) (Carpal Tunnel Syndrome)", gu: "કાર્પલ ટનલ સિન્ડ્રોમ (Carpal Tunnel Syndrome)" },
  "Cellulitis": { hi: "सेल्युलाइटिस (त्वचा का गंभीर संक्रमण) (Cellulitis)", gu: "સેલ્યુલાઇટિસ (ત્વચાનો ચેપ) (Cellulitis)" },
  "Cervical Spondylosis": { hi: "सर्वाइकल स्पोंडिलोसिस (गर्दन दर्द) (Cervical Spondylosis)", gu: "સર્વાઇકલ સ્પોન્ડિલોસિસ (ડોકનો દુખાવો) (Cervical Spondylosis)" },
  "Common Cold / Upper Respiratory Infection": { hi: "सामान्य सर्दी-जुकाम (Common Cold / URI)", gu: "સામાન્ય શરદી-સળેખમ (Common Cold / URI)" },
  "Conjunctivitis": { hi: "कंजंक्टिवाइटिस (आँख आना) (Conjunctivitis)", gu: "કન્જક્ટિવાઇટિસ (આંખ આવવી) (Conjunctivitis)" },
  "Contact Dermatitis": { hi: "कॉन्टैक्ट डर्मेटाइटिस (त्वचा की एलर्जी) (Contact Dermatitis)", gu: "કોન્ટેક્ટ ડર્મેટોઇટિસ (Contact Dermatitis)" },
  "Dental Abscess": { hi: "दांत का फोड़ा / मसूड़े में मवाद (Dental Abscess)", gu: "દાંતનો ફોલ્લો / પેઢામાં પરુ (Dental Abscess)" },
  "Depressive Symptoms": { hi: "अवसाद के लक्षण (Depressive Symptoms)", gu: "ડિપ્રેશન / હતાશાના લક્ષણો (Depressive Symptoms)" },
  "Eczema / Atopic Dermatitis": { hi: "एक्जिमा / एटोपिक डर्मेटाइटिस (Eczema)", gu: "ખરજવું / એક્ઝિમા (Eczema)" },
  "Endometriosis": { hi: "एंडोमेट्रियोसिस (Endometriosis)", gu: "એન્ડોમેટ્રિઓસિસ (Endometriosis)" },
  "Frozen Shoulder": { hi: "फ्रोजन शोल्डर (कंधे का अकड़ना) (Frozen Shoulder)", gu: "ફ્રોઝન શોલ્ડર (ખભાની જકડન) (Frozen Shoulder)" },
  "Gastritis": { hi: "गैस्ट्राइटिस (पेट में जलन व सूजन) (Gastritis)", gu: "ગેસ્ટ્રાઇટિસ (પેટમાં બળતરા/સોજો) (Gastritis)" },
  "Gastroenteritis": { hi: "गैस्ट्रोएंटेराइटिस (पेट का संक्रमण) (Gastroenteritis)", gu: "ગેસ્ટ્રોએન્ટેરાઇટિસ (પેટનો ચેપ) (Gastroenteritis)" },
  "Gastroesophageal Reflux Disease / GERD": { hi: "गर्ड / एसिड रिफ्लक्स (GERD)", gu: "જીઇઆરડી / એસિડ રિફ્લક્સ (GERD)" },
  "Gingivitis / Periodontal Disease": { hi: "मसूड़ों की सूजन व पायरिया (Gingivitis)", gu: "પેઢાનો સોજો / પાયોરિયા (Gingivitis)" },
  "Hemorrhoids": { hi: "बवासीर (Hemorrhoids / Piles)", gu: "હરસ-મસા (Hemorrhoids / Piles)" },
  "Hypothyroidism": { hi: "हाइपोथायरायडिज्म (थायराइड कमी) (Hypothyroidism)", gu: "હાઇપોથાઇરોઇડિઝમ (Hypothyroidism)" },
  "Influenza": { hi: "इन्फ्लूएंजा / फ्लू (Influenza / Flu)", gu: "ઇન્ફ્લુએન્ઝા / ફ્લૂ (Influenza / Flu)" },
  "Iron-Deficiency Anaemia": { hi: "आयरन की कमी से एनीमिया (रक्त की कमी) (Iron-Deficiency Anaemia)", gu: "આયર્નની ખામીથી એનિમિયા (લોહીની કમી) (Iron-Deficiency Anaemia)" },
  "Irritable Bowel Syndrome / IBS": { hi: "इरिटेबल बाउल सिंड्रोम (आईबीएस) (IBS)", gu: "ઇરિટેબલ બોવેલ સિન્ડ્રોમ (આઇબીએસ) (IBS)" },
  "Kidney Stones": { hi: "गुर्दे की पथरी (Kidney Stones)", gu: "કિડનીની પથરી (Kidney Stones)" },
  "Migraine": { hi: "माइग्रेन (आधे सिर का दर्द) (Migraine)", gu: "માઈગ્રેન (અડધા માથાનો દુખાવો) (Migraine)" },
  "Muscle Strain / Sprain": { hi: "मांसपेशियों में खिंचाव / मोच (Muscle Strain / Sprain)", gu: "સ્નાયુ ખેંચાણ / મચકોડ (Muscle Strain / Sprain)" },
  "Osteoarthritis": { hi: "ऑस्टियोआर्थराइटिस (जोड़ों का घिसाव) (Osteoarthritis)", gu: "ઓસ્ટિઓઆર્થરાઇટિસ (સાંધાનો ઘસારો) (Osteoarthritis)" },
  "Otitis Externa": { hi: "ओटिटिस एक्सटर्ना (बाहरी कान का संक्रमण) (Otitis Externa)", gu: "ઓટાઇટિસ એક્સટર્ના (કાનનો ચેપ) (Otitis Externa)" },
  "Otitis Media": { hi: "ओटिटिस मीडिया (मध्य कान का संक्रमण) (Otitis Media)", gu: "ઓટાઇટિસ મીડિયા (કાનનો ચેપ) (Otitis Media)" },
  "Panic Attack / Panic Disorder": { hi: "पैनिक अटैक / घबराहट का दौरा (Panic Attack)", gu: "પેનિક એટેક / ગભરાટનો હુમલો (Panic Attack)" },
  "Pelvic Inflammatory Disease / PID": { hi: "पेल्विक इंफ्लेमेटरी डिजीज (पीआईडी) (PID)", gu: "પેલ્વિક ઇન્ફ્લેમેટરી ડિસીઝ (પીઆઇડી) (PID)" },
  "Peptic Ulcer Disease": { hi: "पेप्टिक अल्सर (पेट का छाला) (Peptic Ulcer)", gu: "પેપ્ટિક અલ્સર (પેટનો ચાંદો) (Peptic Ulcer)" },
  "Pharyngitis / Strep Throat": { hi: "ग्रसनीशोथ / गले का संक्रमण (Pharyngitis / Strep Throat)", gu: "ગળાનો ચેપ / ફેરીન્જાઇટિસ (Pharyngitis / Strep Throat)" },
  "Pneumonia": { hi: "निमोनिया (फेफड़ों का संक्रमण) (Pneumonia)", gu: "ન્યુમોનિયા (ફેફસાંનો ચેપ) (Pneumonia)" },
  "Prostatitis": { hi: "प्रोस्टेटाइटिस (प्रोस्टेट की सूजन) (Prostatitis)", gu: "પ્રોસ્ટેટાઇટિસ (પ્રોસ્ટેટનો સોજો) (Prostatitis)" },
  "Psoriasis": { hi: "सोरायसिस (Psoriasis)", gu: "સોરાયસિસ (Psoriasis)" },
  "Sciatica": { hi: "साइटिका (पैरों में नस का दर्द) (Sciatica)", gu: "સાયટિકા (રાંઝણનો દુખાવો) (Sciatica)" },
  "Seborrheic Dermatitis": { hi: "सेबोरीक डर्मेटाइटिस (रूसी व त्वचा पपड़ी) (Seborrheic Dermatitis)", gu: "સેબોરિક ડર્મેટોઇટિસ (ખોડો/પપડી) (Seborrheic Dermatitis)" },
  "Sinusitis": { hi: "साइनसाइटिस (साइनस की सूजन) (Sinusitis)", gu: "સાઇનસાઇટિસ (સાઇનસનો સોજો) (Sinusitis)" },
  "Stye / Chalazion": { hi: "गुहेरी / चालजियन (आँख की फुंसी) (Stye / Chalazion)", gu: "આંજણી / ચેલેઝિયન (Stye / Chalazion)" },
  "Tension Headache": { hi: "तनाव सिरदर्द (Tension Headache)", gu: "તણાવજન્ય માથાનો દુખાવો (Tension Headache)" },
  "Tonsillitis": { hi: "टॉन्सिलाइटिस (टॉन्सिल की सूजन) (Tonsillitis)", gu: "ટોન્સિલાઇટિસ (ટોન્સિલનો સોજો) (Tonsillitis)" },
  "Urinary Tract Infection / UTI": { hi: "मूत्र मार्ग संक्रमण (यूटीआई) (UTI)", gu: "પેશાબની નળીઓનો ચેપ (યુટીઆઈ) (UTI)" },
  "Uterine Fibroids": { hi: "गर्भाशय फाइब्रॉएड (गांठ) (Uterine Fibroids)", gu: "ગર્ભાશયની ગાંઠ (Uterine Fibroids)" },
  "Vaginal Candidiasis / Yeast Infection": { hi: "यीस्ट संक्रमण (Vaginal Candidiasis)", gu: "યીસ્ટ ઇન્ફેક્શન (Vaginal Candidiasis)" },
  "Vertigo / BPPV": { hi: "वर्टिगो / चक्कर आना (Vertigo / BPPV)", gu: "વર્ટિગો / ચક્કર આવવા (Vertigo / BPPV)" },
  "Viral Warts": { hi: "मस्से (Viral Warts)", gu: "મસા (Viral Warts)" },
};

/**
 * Localizes a condition name into the target language, preserving canonical clarity in parentheses.
 */
export function localizeConditionName(conditionName?: string | null, lang: string = "en"): string {
  if (!conditionName) return "Clinical Assessment";
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") return conditionName;

  const translation = CONDITION_TRANSLATIONS[conditionName];
  if (translation) {
    if (normalizedLang === "hi" && translation.hi) return translation.hi;
    if (normalizedLang === "gu" && translation.gu) return translation.gu;
  }
  return conditionName;
}

// ── SPECIALIZATION TRANSLATIONS ──

export const SPECIALIZATION_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {
  "Dermatology": { hi: "त्वचा रोग विज्ञान (Dermatology)", gu: "ચામડીના રોગ વિભાગ (Dermatology)" },
  "Ophthalmology": { hi: "नेत्र रोग विज्ञान (Ophthalmology)", gu: "આંખના રોગ વિભાગ (Ophthalmology)" },
  "General Medicine": { hi: "सामान्य चिकित्सा (General Medicine)", gu: "સામાન્ય દવા વિભાગ (General Medicine)" },
  "ENT": { hi: "ईएनटी / कान, नाक, गला (ENT)", gu: "ઇએનટી / કાન, નાક, ગળું (ENT)" },
  "General Surgery": { hi: "सामान्य शल्य चिकित्सा (General Surgery)", gu: "સામાન્ય સર્જરી વિભાગ (General Surgery)" },
  "Psychiatry": { hi: "मनोचिकित्सा (Psychiatry)", gu: "મનોચિકિત્સા વિભાગ (Psychiatry)" },
  "Pulmonology": { hi: "श्वसन व फेफड़े रोग (Pulmonology)", gu: "શ્વસનતંત્ર / ફેફસાં વિભાગ (Pulmonology)" },
  "Gynecology": { hi: "स्त्री एवं प्रसूति रोग (Gynecology)", gu: "સ્ત્રીરોગ વિભાગ (Gynecology)" },
  "Urology": { hi: "मूत्र रोग विज्ञान (Urology)", gu: "મૂત્રતંત્ર વિભાગ (Urology)" },
  "Orthopedics": { hi: "हड्डी व जोड़ रोग (Orthopedics)", gu: "હાડકાં અને સાંધા વિભાગ (Orthopedics)" },
  "Dentistry": { hi: "दंत चिकित्सा (Dentistry)", gu: "દાંતની સારવાર (Dentistry)" },
  "Gastroenterology": { hi: "पेट व पाचन तंत्र (Gastroenterology)", gu: "પાચનતંત્ર / પેટ વિભાગ (Gastroenterology)" },
  "Endocrinology": { hi: "एंडोक्रिनोलॉजी व मधुमेह (Endocrinology)", gu: "ડાયાબિટીસ અને હોર્મોન વિભાગ (Endocrinology)" },
  "Hematology": { hi: "रक्त रोग विज्ञान (Hematology)", gu: "લોહીના રોગ વિભાગ (Hematology)" },
  "Neurology": { hi: "न्यूरोलॉजी / तंत्रिका विज्ञान (Neurology)", gu: "ન્યુરોલોજી / ચેતાતંત્ર વિભાગ (Neurology)" },
  "Cardiology": { hi: "कार्डियोलॉजी / हृदय रोग (Cardiology)", gu: "કાર્ડિયોલોજી / હૃદય રોગ (Cardiology)" },
  "Nephrology": { hi: "नेफ्रोलॉजी / किडनी रोग (Nephrology)", gu: "નેફ્રોલોજી / કિડની રોગ (Nephrology)" },
};

export function localizeSpecialty(specialty?: string | null, lang: string = "en"): string {
  if (!specialty) return "General Physician / Specialist";
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") return specialty;

  const translation = SPECIALIZATION_TRANSLATIONS[specialty];
  if (translation) {
    if (normalizedLang === "hi" && translation.hi) return translation.hi;
    if (normalizedLang === "gu" && translation.gu) return translation.gu;
  }
  return specialty;
}

// ── URGENCY TRANSLATIONS ──

export const URGENCY_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {
  "routine": { hi: "नियमित परामर्श (Routine)", gu: "નિયમિત સલાહ (Routine)" },
  "Routine": { hi: "नियमित परामर्श (Routine)", gu: "નિયમિત સલાહ (Routine)" },
  "urgent": { hi: "त्वरित देखभाल (Urgent)", gu: "ત્વરિત સંભાળ (Urgent)" },
  "Urgent": { hi: "त्वरित देखभाल (Urgent)", gu: "ત્વરિત સંભાળ (Urgent)" },
  "emergency": { hi: "आपातकालीन (Emergency)", gu: "ઇમરજન્સી (Emergency)" },
  "Emergency": { hi: "आपातकालीन (Emergency)", gu: "ઇમરજન્સી (Emergency)" },
  "Prompt": { hi: "शीघ्र परामर्श (Prompt)", gu: "ત્વરિત સલાહ (Prompt)" },
};

export function localizeUrgency(urgency?: string | null, lang: string = "en"): string {
  if (!urgency) return "";
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") return urgency;

  const translation = URGENCY_TRANSLATIONS[urgency];
  if (translation) {
    if (normalizedLang === "hi" && translation.hi) return translation.hi;
    if (normalizedLang === "gu" && translation.gu) return translation.gu;
  }
  return urgency;
}

// ── DECISION SOURCE & BADGES ──

export const DECISION_SOURCE_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {
  "emergency_override": { hi: "आपातकालीन प्राथमिकता (Emergency Override)", gu: "ઇમરજન્સી પ્રાથમિકતા (Emergency Override)" },
  "Emergency Override": { hi: "आपातकालीन प्राथमिकता (Emergency Override)", gu: "ઇમરજન્સી પ્રાથમિકતા (Emergency Override)" },
  "safe_defer": { hi: "सुरक्षित रेफरल (Safe Deferral)", gu: "સુરક્ષિત રેફરલ (Safe Deferral)" },
  "Safe Deferral": { hi: "सुरक्षित रेफरल (Safe Deferral)", gu: "સુરક્ષિત રેફરલ (Safe Deferral)" },
  "user_stopped": { hi: "उपयोगकर्ता द्वारा पूर्ण", gu: "વપરાશકર્તા દ્વારા પૂર્ણ" },
  "User Finalized": { hi: "उपयोगकर्ता द्वारा पूर्ण", gu: "વપરાશકર્તા દ્વારા પૂર્ણ" },
  "Model 2.0 Threshold": { hi: "मॉडल 2.0 निश्चितता थ्रेशोल्ड", gu: "મોડેલ 2.0 ચોક્કસતા થ્રેશોલ્ડ" },
  "ml_model": { hi: "मॉडल 2.0 विश्लेषण", gu: "મોડેલ 2.0 વિશ્લેષણ" },
  "direct_routing": { hi: "सीधा अस्पताल रूटिंग (Direct Routing)", gu: "સીધું હોસ્પિટલ રૂટિંગ (Direct Routing)" },
  "Direct Routing": { hi: "सीधा अस्पताल रूटिंग (Direct Routing)", gu: "સીધું હોસ્પિટલ રૂટિંગ (Direct Routing)" },
};

export function localizeDecisionSource(source?: string | null, lang: string = "en"): string {
  if (!source) return "Model 2.0 Guidance";
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);

  const englishLabel = 
    source === "emergency_override" ? "Emergency Override" :
    source === "safe_defer" ? "Safe Deferral" :
    source === "user_stopped" ? "User Finalized" :
    source === "ml_model" ? "Model 2.0 Threshold" :
    source === "direct_routing" ? "Direct Routing" :
    source;

  if (normalizedLang === "en") return englishLabel;

  const translation = DECISION_SOURCE_TRANSLATIONS[source] || DECISION_SOURCE_TRANSLATIONS[englishLabel];
  if (translation) {
    if (normalizedLang === "hi" && translation.hi) return translation.hi;
    if (normalizedLang === "gu" && translation.gu) return translation.gu;
  }
  return englishLabel;
}

// ── MATCH REASON FOR HOSPITALS ──

export function localizeMatchReason(reason?: string | null, category?: string | null, lang: string = "en"): string {
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") {
    return reason || (category === "verified_specialist"
      ? "Verified specialist department matching candidate condition."
      : "General-care facility recommended for initial in-person medical evaluation and specialist referral.");
  }

  if (normalizedLang === "hi") {
    if (category === "verified_specialist" || (reason && reason.toLowerCase().includes("specialist"))) {
      return "उम्मीदवार स्थिति से मेल खाता सत्यापित विशेषज्ञ विभाग।";
    }
    return "प्रारंभिक व्यक्तिगत चिकित्सा मूल्यांकन और विशेषज्ञ परामर्श के लिए अनुशंसित सामान्य देखभाल सुविधा।";
  }

  if (normalizedLang === "gu") {
    if (category === "verified_specialist" || (reason && reason.toLowerCase().includes("specialist"))) {
      return "ઉમેદવાર સ્થિતિ સાથે મેળ ખાતો ચકાસાયેલ નિષ્ણાત વિભાગ.";
    }
    return "પ્રારંભિક રૂબરૂ તબીબી મૂલ્યાંકન અને નિષ્ણાત રેફરલ માટે ભલામણ કરેલ સામાન્ય સંભાળ સુવિધા.";
  }

  return reason || "";
}

// ── AI CLINICAL PATHWAY SUMMARY ──

export function localizeAiRecommendation(
  summary: string | undefined,
  conditionName: string,
  specialty: string,
  procedure: string,
  confidence: number,
  lang: string = "en"
): string {
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") {
    return summary || `For confirmed ${conditionName} with ${confidence}% diagnostic certainty, prompt clinical consultation with a ${specialty} department is recommended. Verified hospitals below have been filtered specifically for ${procedure} capabilities.`;
  }

  const localizedCondition = localizeConditionName(conditionName, normalizedLang);
  const localizedSpec = localizeSpecialty(specialty, normalizedLang);

  if (normalizedLang === "hi") {
    return `पुष्टीकृत ${localizedCondition} (${confidence}% निश्चितता) के लिए, ${localizedSpec} विभाग से शीघ्र चिकित्सकीय परामर्श की सिफारिश की जाती है। नीचे दिए गए सत्यापित अस्पतालों को विशेष रूप से आवश्यक चिकित्सा क्षमताओं के लिए फ़िल्टर किया गया है।`;
  }

  if (normalizedLang === "gu") {
    return `પુષ્ટિ થયેલ ${localizedCondition} (${confidence}% નિદાન ચોક્કસતા) માટે, ${localizedSpec} વિભાગ સાથે તાત્કાલિક તબીબી સલાહ લેવાની ભલામણ કરવામાં આવે છે. નીચે આપેલ ચકાસાયેલ હોસ્પિટલો ખાસ કરીને સારવાર સુવિધાઓ માટે ફિલ્ટર કરવામાં આવી છે.`;
  }

  return summary || "";
}

// ── CANDIDATE SYMPTOM OPTIONS & CHIPS LOCALIZATION ──

export const SYMPTOM_OPTION_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {
  "2 to 3 days ago": { hi: "2 से 3 दिन पहले", gu: "2 થી 3 દિવસ પહેલાં" },
  "abdomen / stomach": { hi: "पेट / आमाशय", gu: "પેટ / જઠર" },
  "abdominal bloating and excessive gas": { hi: "पेट फूलना और अत्यधिक गैस बनना", gu: "પેટ ફૂલવું અને વધુ પડતો ગેસ" },
  "abdominal cramping relieved by bowel movement": { hi: "शौच के बाद पेट की ऐंठन में आराम", gu: "ઝાડા પછી પેટના ખેંચાણમાં રાહત" },
  "abdominal cramps": { hi: "पेट में मरोड़ या ऐंठन", gu: "પેટમાં ચૂંક અથવા ખેંચાણ" },
  "abdominal cramps and stomach spasms": { hi: "पेट में मरोड़ और ऐंठन", gu: "પેટમાં ચૂંક અને ખેંચાણ" },
  "abdominal pain": { hi: "पेट में दर्द", gu: "પેટમાં દુખાવો" },
  "abdominal tenderness worsening with movement": { hi: "हिलने-डुलने पर पेट का दर्द बढ़ना", gu: "હલનચલનથી પેટનો દુખાવો વધવો" },
  "abnormal rapid eye movements": { hi: "आंखों की असामान्य तेजी से हरकत", gu: "આંખોની અસામાન્ય ઝડપી હલનચલન" },
  "abnormal vaginal discharge": { hi: "असामान्य योनि स्राव", gu: "અસામાન્ય યોનિમાર્ગ સ્રાવ" },
  "accompanied by fever": { hi: "बुखार के साथ", gu: "તાવ સાથે" },
  "acid taste or belching": { hi: "खट्टा स्वाद या खट्टी डकारें", gu: "ખાટો સ્વાદ અથવા ખાટા ઓડકાર" },
  "acne": { hi: "मुहांसे (Acne)", gu: "ખીલ (Acne)" },
  "alternating diarrhea and constipation": { hi: "बारी-बारी से दस्त और कब्ज होना", gu: "વારાફરતી ઝાડા અને કબજિયાત" },
  "anal spasms after defecation": { hi: "शौच के बाद गुदा में ऐंठन", gu: "શૌચ પછી ગુદામાં ખેંચાણ" },
  "anhedonia": { hi: "रुचि की कमी", gu: "રસ ઓછો થવો" },
  "arms or legs": { hi: "हाथ या पैर", gu: "હાથ અથવા પગ" },
  "back or spine": { hi: "पीठ या रीढ़", gu: "પીઠ અથવા કરોડરજ્જુ" },
  "back pain": { hi: "पीठ दर्द", gu: "પીઠનો દુખાવો" },
  "back pain or stiffness": { hi: "पीठ में दर्द या अकड़न", gu: "પીઠમાં દુખાવો અથવા જકડન" },
  "bleeding between menstrual periods": { hi: "मासिक धर्म के बीच में रक्तस्राव", gu: "માસિક સ્રાવ વચ્ચે રક્તસ્રાવ" },
  "bleeding gums": { hi: "मसूड़ों से खून आना", gu: "પેઢામાંથી લોહી આવવું" },
  "bleeding gums during brushing or flossing": { hi: "ब्रश करते समय मसूड़ों से खून आना", gu: "બ્રશ કરતી વખતે પેઢામાંથી લોહી નીકળવું" },
  "bloating and feeling full quickly": { hi: "पेट फूलना और जल्दी पेट भरा लगना", gu: "પેટ ફૂલવું અને ઝડપથી પેટ ભરાઈ જવું" },
  "blocked or congested nose": { hi: "बंद या भरी हुई नाक", gu: "બંધ અથવા ભરેલું નાક" },
  "blurred vision": { hi: "धुंधला दिखाई देना", gu: "ઝાંખું દેખાવું" },
  "blurry vision": { hi: "धुंधली दृष्टि", gu: "ઝાંખી દ્રષ્ટિ" },
  "bone spurs or joint enlargement": { hi: "हड्डी का बढ़ना या जोड़ों का फूलना", gu: "હાડકાં વધવા અથવા સાંધા મોટા થવા" },
  "bright red blood on toilet paper": { hi: "टॉयलेट पेपर पर चमकदार लाल खून", gu: "ટોયલેટ પેપર પર તાજું લાલ લોહી" },
  "burning ache in upper stomach": { hi: "ऊपरी पेट में जलन और दर्द", gu: "ઉપલા પેટમાં બળતરા અને દુખાવો" },
  "burning during urination or intercourse": { hi: "पेशाब या संभोग के दौरान जलन", gu: "પેશાબ કે સંભોગ વખતે બળતરા" },
  "burning hand sensation worse at night": { hi: "हाथ में जलन (रात में अधिक)", gu: "હાથમાં બળતરા (રાત્રે વધુ)" },
  "burning or stinging in eyelids": { hi: "पलकों में जलन या चुभन", gu: "પોપચાંમાં બળતરા કે ડંખ જેવી પીડા" },
  "burning sensation during urination": { hi: "पेशाब करते समय जलन", gu: "પેશાબ કરતી વખતે બળતરા" },
  "burning sensation while urinating": { hi: "पेशाब करते समय जलन", gu: "પેશાબ કરતી વખતે બળતરા" },
  "burning skin irritation from soap or metal": { hi: "साबुन या धातु से त्वचा पर जलन", gu: "સાબુ કે ધાતુથી ચામડી પર બળતરા" },
  "burning stinging sensation when urinating": { hi: "पेशाब करते समय तेज जलन व चुभन", gu: "પેશાબ કરતી વખતે તીવ્ર બળતરા" },
  "changes in sleep and appetite": { hi: "नींद और भूख में बदलाव", gu: "ઊંઘ અને ભૂખમાં ફેરફાર" },
  "chest / heart area": { hi: "सीना / हृदय क्षेत्र", gu: "છાતી / હૃદય વિસ્તાર" },
  "chest burning after heavy meals": { hi: "भारी भोजन के बाद सीने में जलन", gu: "ભારે ખોરાક પછી છાતીમાં બળતરા" },
  "chest discomfort and fear of losing control": { hi: "सीने में बेचैनी और घबराहट", gu: "છાતીમાં બેચેની અને ગભરાટ" },
  "chest or throat": { hi: "सीना या गला", gu: "છાતી અથવા ગળું" },
  "chest pain": { hi: "सीने में दर्द", gu: "છાતીમાં દુખાવો" },
  "chest soreness from coughing": { hi: "खांसने से सीने में दर्द", gu: "ખાંસીને કારણે છાતીમાં દુખાવો" },
  "chest tightness": { hi: "सीने में जकड़न", gu: "છાતીમાં જકડન" },
  "chest tightness after dust exposure": { hi: "धूल के संपर्क के बाद सीने में जकड़न", gu: "ધૂળના સંપર્ક પછી છાતીમાં જકડન" },
  "chest tightness or pressure": { hi: "सीने में जकड़न या भारीपन", gu: "છાતીમાં જકડન અથવા દબાણ" },
  "chills": { hi: "ठंड लगना", gu: "ઠંડી લાગવી" },
  "chronic fatigue and lack of energy": { hi: "लगातार थकान और ऊर्जा की कमी", gu: "સતત થાક અને ઊર્જાનો અભાવ" },
  "chronic pelvic aching before period": { hi: "माहवारी से पहले पेल्विक में पुराना दर्द", gu: "માસિક પહેલાં પેલ્વિક વિસ્તારમાં દુખાવો" },
  "clear runny nose": { hi: "नाक से साफ पानी बहना", gu: "નાકમાંથી સ્વચ્છ પાણી વહેવું" },
  "cloudy or strong-smelling urine": { hi: "धुंधला या तेज गंध वाला पेशाब", gu: "દૂધિયો અથવા તીવ્ર ગંધવાળો પેશાબ" },
  "clustered skin lesions with rough texture": { hi: "खुरदुरी सतह वाले दानों का गुच्छा", gu: "ખરબચડી ચામડીના ફોલ્લીઓનો ઝૂમખો" },
  "cold hands and feet": { hi: "हाथ और पैर ठंडे रहना", gu: "હાથ અને પગ ઠંડા રહેવા" },
  "constant ache with no radiation": { hi: "लगातार हल्का दर्द (बिना फैले)", gu: "સતત હળવો દુખાવો (ફેલાયા વિના)" },
  "constipation and muscle weakness": { hi: "कब्ज और मांसपेशियों में कमजोरी", gu: "કબજિયાત અને સ્નાયુઓની નબળાઈ" },
  "constipation or difficulty having bowel movements": { hi: "कब्ज या शौच में कठिनाई", gu: "કબજિયાત અથવા શૌચમાં તકલીફ" },
  "cough": { hi: "खांसी", gu: "ઉધરસ" },
  "cough or sore throat": { hi: "खांसी या गले में खराश", gu: "ખાંસી અથવા ગળામાં ખરાશ" },
  "cough producing green yellow or bloody phlegm": { hi: "हरा, पीला या खून वाला बलगम आना", gu: "લીલો, પીળો અથવા લોહીવાળો કફ આવવો" },
  "cough with yellow/green phlegm": { hi: "पीले/हरे बलगम के साथ खांसी", gu: "પીળા/લીલા કફ સાથે ખાંસી" },
  "coughing": { hi: "खांसी होना", gu: "ખાંસી આવવી" },
  "coughing worse at night or early morning": { hi: "रात या सुबह खांसी का बढ़ना", gu: "રાત્રે કે વહેલી સવારે ખાંસી વધવી" },
  "cramps": { hi: "ऐंठन या मरोड़", gu: "ખેંચાણ અથવા ચૂંક" },
  "crusty eyelashes upon waking": { hi: "सोकर उठने पर पलकों पर पपड़ी जमना", gu: "સવારે ઉઠતી વખતે પોપચાં પર પોપડા જામવા" },
  "cystic skin blemishes": { hi: "त्वचा पर गांठदार मुहांसे / दाने", gu: "ચામડી પર ઊંડા ફોલ્લા કે ખીલ" },
  "dandruff flakes on scalp hair or eyebrows": { hi: "सिर के बाल या भौंहों पर रूसी की पपड़ी", gu: "માથાના વાળ અથવા ભમર પર ખોડો" },
  "deep throbbing ear pain": { hi: "कान में गहरा धड़कता हुआ दर्द", gu: "કાનમાં ઊંડો ધબકારા મારતો દુખાવો" },
  "dehydration with dry mouth": { hi: "मुंह सूखना और पानी की कमी (डिहाइड्रेशन)", gu: "મોં સુકાવું અને શરીરમાં પાણીની કમી" },
  "dental abscess": { hi: "दांत का फोड़ा", gu: "દાંતનું ગુમડું" },
  "depressed mood": { hi: "उदास मन / अवसाद", gu: "ઉદાસ મન" },
  "diarrhea": { hi: "दस्त / डायरिया", gu: "ઝાડા" },
  "difficulty breathing with cold air": { hi: "ठंडी हवा में सांस लेने में तकलीफ", gu: "ઠંડી હવામાં શ્વાસ લેવામાં તકલીફ" },
  "difficulty concentrating and sleep disturbances": { hi: "एकाग्रता में कमी और नींद की समस्या", gu: "ધ્યાન કેન્દ્રિત કરવામાં મુશ્કેલી અને અનિદ્રા" },
  "difficulty starting urination": { hi: "पेशाब शुरू करने में रुकावट या कठिनाई", gu: "પેશાબ શરૂ કરવામાં અડચણ" },
  "difficulty swallowing or throat clearing": { hi: "निगलने में कठिनाई या बार-बार गला साफ करना", gu: "ગળવામાં તકલીફ અથવા વારંવાર ગળું સાફ કરવું" },
  "difficulty urinating or weak stream": { hi: "पेशाब में रुकावट या कमजोर धार", gu: "પેશાબ કરવામાં તકલીફ અથવા નબળી ધાર" },
  "difficulty walking or climbing stairs": { hi: "चलने या सीढ़ियां चढ़ने में कठिनाई", gu: "ચાલવામાં કે દાદર ચડવામાં તકલીફ" },
  "discomfort while sitting": { hi: "बैठने पर बेचैनी या दर्द", gu: "બેસતી વખતે તકલીફ કે દુખાવો" },
  "discomfort without significant redness": { hi: "बिना अधिक लाली के असुविधा", gu: "વધુ લાલાશ વિના અસ્વસ્થતા" },
  "discomfort worse when lying flat": { hi: "सीधे लेटने पर तकलीफ बढ़ना", gu: "સીધા સૂતી વખતે તકલીફ વધવી" },
  "discomfort worsening over time": { hi: "समय के साथ बढ़ती परेशानी", gu: "સમય સાથે વધતી તકલીફ" },
  "dizziness": { hi: "चक्कर आना", gu: "ચક્કર આવવા" },
  "dizziness lasting seconds to minutes": { hi: "कुछ सेकंड से मिनट तक चक्कर आना", gu: "થોડી સેકન્ડ કે મિનિટ માટે ચક્કર આવવા" },
  "dizziness or lightheadedness": { hi: "चक्कर आना या सिर घूमना", gu: "ચક્કર આવવા અથવા માથું ફરવું" },
  "dizziness, lightheadedness or brittle nails": { hi: "चक्कर आना, सिर घूमना या कमजोर नाखून", gu: "ચક્કર આવવા, માથું હળવું લાગવું કે બરડ નખ" },
  "dry brittle skin and coarse hair": { hi: "रूखी बेजान त्वचा और खुरदुरे बाल", gu: "સૂકી બરડ ચામડી અને બરછટ વાળ" },
  "dry cracked skin patches": { hi: "त्वचा पर सूखे फटे हुए चकत्ते", gu: "ચામડી પર સૂકા ફાટેલા ચકામા" },
  "dry cracked skin that may bleed": { hi: "सूखी फटी त्वचा जिससे खून आ सकता है", gu: "સૂકી ફાટેલી ચામડી જેમાંથી લોહી નીકળી શકે" },
  "dry hacking cough": { hi: "सूखी लगातार खांसी", gu: "સૂકી સતત ખાંસી" },
  "dull aching head pain like a tight band": { hi: "सिर पर पट्टी जैसा भारी सिरदर्द", gu: "માથા પર પટ્ટી બાંધી હોય તેવો દુખાવો" },
  "dull aching pain in shoulder joint": { hi: "कंधे के जोड़ में धीमा दर्द", gu: "ખભાના સાંધામાં ધીમો દુખાવો" },
  "ear canal pain and tenderness": { hi: "कान की नली में दर्द और छूने पर तकलीफ", gu: "કાનની નળીમાં દુખાવો અને સ્પર્શથી પીડા" },
  "ear pain": { hi: "कान का दर्द", gu: "કાનનો દુખાવો" },
  "ear pain or redness": { hi: "कान में दर्द या लाली", gu: "કાનમાં દુખાવો અથવા લાલાશ" },
  "earache or fullness": { hi: "कान में दर्द या भारीपन", gu: "કાનમાં દુખાવો અથવા ભારેપણું" },
  "exhaustion and profound fatigue": { hi: "अत्यधिक कमजोरी और भारी थकान", gu: "અતિશય નબળાઈ અને થાક" },
  "extreme fatigue and weakness": { hi: "चरम थकान और कमजोरी", gu: "તીવ્ર થાક અને અશક્તિ" },
  "extreme sensitivity to cold": { hi: "ठंड के प्रति अत्यधिक संवेदनशीलता", gu: "ઠંડી પ્રત્યે વધુ પડતી સંવેદનશીલતા" },
  "eye pain or aching": { hi: "आंख में दर्द या चुभन", gu: "આંખમાં દુખાવો" },
  "eye pain or redness": { hi: "आंख में दर्द या लाली", gu: "આંખમાં દુખાવો કે લાલાશ" },
  "eye redness": { hi: "आंखों का लाल होना", gu: "આંખો લાલ થવી" },
  "eye redness and bloodshot look": { hi: "आंखों में लाली और खून जैसी लालिमा", gu: "આંખોમાં લાલાશ અને લોહી જેવો રંગ" },
  "eye redness or pain": { hi: "आंख में लाली या दर्द", gu: "આંખમાં લાલાશ અથવા દુખાવો" },
  "eye redness or watering": { hi: "आंखों में लाली या पानी आना", gu: "આંખોમાં લાલાશ અથવા પાણી આવવું" },
  "eyelids stuck together in morning": { hi: "सुबह उठने पर पलकें चिपकी होना", gu: "સવારે ઉઠતી વખતે પોપચાં ચોંટી જવા" },
  "facial pain, pressure and fullness": { hi: "चेहरे पर दर्द, दबाव और भारीपन", gu: "ચહેરા પર દુખાવો, દબાણ અને ભારેપણું" },
  "facial pimples and blackheads": { hi: "चेहरे पर मुहांसे और ब्लैकहेड्स", gu: "ચહેરા પર ખીલ અને બ્લેકહેડ્સ" },
  "fatigue": { hi: "थकान / कमजोरी", gu: "થાક" },
  "fatigue and malaise": { hi: "थकान और अस्वस्थता", gu: "થાક અને સુસ્તી" },
  "fatigue, sweating and low oxygen feeling": { hi: "थकान, पसीना और सांस की कमी", gu: "થાક, પરસેવો અને શ્વાસ ખૂટવો" },
  "feeling of incomplete bladder emptying": { hi: "पेशाब पूरी तरह न उतरने का अहसास", gu: "પેશાબ પૂરેપૂરો ખાલી ન થયાનો અહેસાસ" },
  "feelings of worthlessness or guilt": { hi: "उदासी, अपराधबोध या हीनभावना", gu: "નકામાપણાની કે દોષિત હોવાની લાગણી" },
  "fever": { hi: "बुखार", gu: "તાવ" },
  "fever and chills accompanying rash": { hi: "चकत्तों के साथ बुखार और कंपकंपी", gu: "ચકામા સાથે તાવ અને ધ્રુજારી" },
  "fever and chills with pelvic pain": { hi: "पेल्विक दर्द के साथ बुखार और ठंड", gu: "પેલ્વિક દુખાવા સાથે તાવ અને ઠંડી" },
  "fever and ear fullness": { hi: "बुखार और कान में भारीपन", gu: "તાવ અને કાનમાં ભારેપણું" },
  "fever and swollen glands in neck": { hi: "बुखार और गर्दन की ग्रंथियों में सूजन", gu: "તાવ અને ગળાની લસિકાગ્રંથિઓમાં સોજો" },
  "fever or chills": { hi: "बुखार या ठंड लगना", gu: "તાવ અથવા ઠંડી લાગવી" },
  "fever or chills present": { hi: "बुखार या ठंड मौजूद है", gu: "તાવ અથવા ઠંડી હાજર છે" },
  "fever without cough": { hi: "बिना खांसी के तेज बुखार", gu: "ખાંસી વિના તાવ" },
  "flaking around nose folds and ears": { hi: "नाक और कान के पास त्वचा की पपड़ी", gu: "નાક અને કાન પાસે ચામડીના પોપડા" },
  "flaking skin around eyelash roots": { hi: "पलकों की जड़ों में पपड़ी बनना", gu: "પોપચાંના મૂળ પાસે પોપડી વળવી" },
  "flu-like symptoms with acute pelvic pain": { hi: "फ्लू जैसे लक्षण और अचानक पेल्विक दर्द", gu: "ફ્લૂ જેવા લક્ષણો સાથે તીવ્ર પેલ્વિક દુખાવો" },
  "fluid draining from ear after rupture": { hi: "कान से तरल या मवाद बहना", gu: "કાનમાંથી પ્રવાહી કે પરુ વહેવું" },
  "frequent or urgent urination": { hi: "बार-बार या तुरंत पेशाब लगना", gu: "વારંવાર અથવા તાકીદે પેશાબ થવો" },
  "frequent sneezing": { hi: "बार-बार छींक आना", gu: "વારંવાર છીંકો આવવી" },
  "frequent urination": { hi: "बार-बार पेशाब आना", gu: "વારંવાર પેશાબ થવો" },
  "frequent urination at night": { hi: "रात में बार-बार पेशाब जाना", gu: "રાત્રે વારંવાર પેશાબ લાગવો" },
  "frequent urination from bladder pressure": { hi: "मूत्राशय पर दबाव से बार-बार पेशाब", gu: "મૂત્રાશય પર દબાણથી વારંવાર પેશાબ" },
  "general diffuse bloating": { hi: "पेट में भारीपन या अफरा", gu: "પેટ ફૂલવું અથવા ગેસ" },
  "gnawing or burning stomach pain": { hi: "पेट में जलन या कुतरने जैसा दर्द", gu: "પેટમાં બળતરા અથવા કોરી ખાતો દુખાવો" },
  "gradual worsening of shoulder mobility": { hi: "कंधे की गतिशीलता में धीरे-धीरे कमी", gu: "ખભાની હલનચલનમાં ધીમે ધીમે ઘટાડો" },
  "greasy skin covered with flaky white or yellow scales": { hi: "तैलीय त्वचा पर सफेद या पीली पपड़ी", gu: "ચીકણી ચામડી પર સફેદ કે પીળા પોપડા" },
  "grinding sensation when turning neck": { hi: "गर्दन घुमाने पर घर्षण या कड़कड़ाहट", gu: "ગરદન ફેરવતી વખતે ઘસારો અનુભવાવો" },
  "gritty sandy feeling in eye": { hi: "आंख में रेत या कंकर जैसी चुभन", gu: "આંખમાં કચરો કે રેતી જેવી ખૂંચણી" },
  "gritty sensation in eyes": { hi: "आंखों में किरकिरापन या चुभन", gu: "આંખોમાં કચરો ખૂંચવો" },
  "hard flat growths on soles of feet": { hi: "तलवों पर सख्त चपटे दाने या गांठें", gu: "પગના તળિયે કઠણ ચપટા મસા" },
  "head / neck": { hi: "सिर / गर्दन", gu: "માથું / ગરદન" },
  "headache / face": { hi: "सिरदर्द / चेहरा", gu: "માથાનો દુખાવો / ચહેરો" },
  "headache aggravated by physical activity": { hi: "शारीरिक मेहनत से सिरदर्द बढ़ना", gu: "શારીરિક શ્રમથી માથાનો દુખાવો વધવો" },
  "headache and sore throat": { hi: "सिरदर्द और गले में खराश", gu: "માથાનો દુખાવો અને ગળામાં ખરાશ" },
  "headache not aggravated by routine activity": { hi: "सामान्य काम से न बढ़ने वाला सिरदर्द", gu: "સામાન્ય કામકાજથી ન વધતો માથાનો દુખાવો" },
  "headache or head pressure": { hi: "सिरदर्द या सिर में भारीपन", gu: "માથાનો દુખાવો અથવા માથામાં દબાણ" },
  "headache worsening when leaning forward": { hi: "आगे झुकने पर सिरदर्द का बढ़ना", gu: "આગળ નમવાથી માથાનો દુખાવો વધવો" },
  "headaches starting from back of neck": { hi: "गर्दन के पिछले हिस्से से शुरू होने वाला सिरदर्द", gu: "ગરદનની પાછળથી શરૂ થતો માથાનો દુખાવો" },
  "heart racing or pounding": { hi: "दिल की धड़कन तेज होना", gu: "હૃદયના ધબકારા ઝડપી થવા" },
  "heartburn": { hi: "सीने में जलन", gu: "છાતીમાં બળતરા" },
  "heartburn and nausea": { hi: "सीने में जलन और मतली", gu: "છાતીમાં બળતરા અને ઉબકા" },
  "heartburn burning behind breastbone": { hi: "छाती की हड्डी के पीछे तेज जलन", gu: "છાતીના હાડકા પાછળ તીવ્ર બળતરા" },
  "heartburn or acid reflux": { hi: "सीने में जलन या एसिड रिफ्लक्स", gu: "છાતીમાં બળતરા અથવા એસિડ રિફ્લક્સ" },
  "heavy or irregular menstrual bleeding": { hi: "माहवारी में भारी या अनियमित रक्तस्राव", gu: "માસિકમાં વધુ કે અનિયમિત રક્તસ્રાવ" },
  "heavy or prolonged menstrual periods": { hi: "मासिक धर्म का लंबा चलना या अधिक खून आना", gu: "લાંબા સમય સુધી કે ભારે માસિક સ્રાવ" },
  "high fever and severe chills": { hi: "तेज बुखार और तेज कंपकंपी", gu: "તીવ્ર તાવ અને સખત ઠંડી લાગવી" },
  "high fever with shaking chills": { hi: "कांपने वाली ठंड के साथ तेज बुखार", gu: "ધ્રૂજારી સાથે સખત તાવ" },
  "inability to reach behind back": { hi: "पीठ के पीछे हाथ ले जाने में असमर्थता", gu: "પીઠ પાછળ હાથ લઈ જવામાં અસમર્થતા" },
  "indigestion and abdominal bloating": { hi: "अपच और पेट का फूलना", gu: "અપચો અને પેટ ફૂલવું" },
  "intense itching after exposure": { hi: "संपर्क के बाद तेज खुजली", gu: "સંપર્ક પછી તીવ્ર ખંજવાળ" },
  "intense vaginal itching and irritation": { hi: "योनि में अत्यधिक खुजली और जलन", gu: "યોનિમાર્ગમાં તીવ્ર ખંજવાળ અને બળતરા" },
  "intensely itchy dry skin patches": { hi: "अत्यधिक खुजली वाले सूखे चकत्ते", gu: "અતિશય ખંજવાળવાળા સૂકા ચકામા" },
  "intolerance to fatty foods": { hi: "चिकने/तले भोजन से परेशानी", gu: "ચીકણા/તળેલા ખોરાકથી અપાચન" },
  "irritability and ear tugging in children": { hi: "बच्चों में चिड़चिड़ापन और कान खींचना", gu: "બાળકોમાં ચીડચીડાપણું અને કાન ખેંચવો" },
  "itching and burning skin plaques": { hi: "त्वचा के पपड़ीदार हिस्सों में खुजली व जलन", gu: "ચામડીના પોપડાવાળા ભાગમાં ખંજવાળ અને બળતરા" },
  "itching inside the ear canal": { hi: "कान के अंदरूनी हिस्से में खुजली", gu: "કાનની અંદર ખંજવાળ આવવી" },
  "itching or irritation in anal region": { hi: "गुदा क्षेत्र में खुजली या जलन", gu: "ગુદા વિસ્તારમાં ખંજવાળ કે બળતરા" },
  "itchy and watery eyes": { hi: "आंखों में खुजली और पानी आना", gu: "આંખોમાં ખંજવાળ અને પાણી આવવું" },
  "itchy eyes": { hi: "आंखों में खुजली", gu: "આંખોમાં ખંજવાળ" },
  "itchy nose and roof of mouth": { hi: "नाक और तालू में खुजली", gu: "નાક અને તાળવામાં ખંજવાળ" },
  "joint or back pain": { hi: "जोड़ों या पीठ में दर्द", gu: "સાંધા અથવા પીઠનો દુખાવો" },
  "joint or body pain": { hi: "जोड़ों या पूरे शरीर में दर्द", gu: "સાંધા અથવા શરીરનો દુખાવો" },
  "joint pain": { hi: "जोड़ों का दर्द", gu: "સાંધાનો દુખાવો" },
  "joint pain and aching during activity": { hi: "कामकाज के दौरान जोड़ों में दर्द", gu: "પ્રવૃત્તિ દરમિયાન સાંધાનો દુખાવો" },
  "joint pain or stiffness": { hi: "जोड़ों में दर्द या अकड़न", gu: "સાંધામાં દુખાવો અથવા જકડન" },
  "joint stiffness after resting or in morning": { hi: "आराम के बाद या सुबह जोड़ों में जकड़न", gu: "આરામ પછી કે સવારે સાંધા જકડાઈ જવા" },
  "joints or muscles": { hi: "जोड़ या मांसपेशियां", gu: "સાંધા અથવા સ્નાયુઓ" },
  "knee pain": { hi: "घुटने का दर्द", gu: "ઘૂંટણનો દુખાવો" },
  "knee pain or swelling": { hi: "घुटने में दर्द या सूजन", gu: "ઘૂંટણમાં દુખાવો અથવા સોજો" },
  "light sensitivity": { hi: "प्रकाश के प्रति संवेदनशीलता", gu: "પ્રકાશ પ્રત્યે સંવેદનશીલતા" },
  "localized muscle pain and soreness": { hi: "मांसपेशियों में स्थानीय दर्द व खिंचाव", gu: "સ્નાયુઓમાં ચોક્કસ જગ્યાએ દુખાવો" },
  "localized red itchy skin rash": { hi: "त्वचा पर लाल खुजलीदार दाने", gu: "ચામડી પર લાલ ખંજવાળવાળા ચકામા" },
  "loose feeling in teeth or sensitive gums": { hi: "दांतों का हिलना या संवेदनशील मसूड़े", gu: "દાંત હલવા અથવા પેઢામાં કળતર" },
  "loose stools / diarrhea": { hi: "पतले दस्त / डायरिया", gu: "ઝાડા / ડાયરિયા" },
  "loss of appetite": { hi: "भूख में कमी", gu: "ભૂખ ન લાગવી" },
  "loss of appetite after meals": { hi: "खाना खाने के बाद भूख मर जाना", gu: "જમ્યા પછી ભૂખ ન લાગવી" },
  "loss of balance and unsteadiness": { hi: "संतुलन बिगड़ना और लड़खड़ाहट", gu: "સંતુલન ગુમાવવું અને અસ્થિરતા" },
  "loss of interest in activities": { hi: "दैनिक गतिविधियों में रुचि कम होना", gu: "પ્રવૃત્તિઓમાં રસ ઓછો થવો" },
  "loss of interest in daily activities": { hi: "दैनिक कार्यों में रुचि खत्म होना", gu: "રોજિંદા કામોમાં રસ ઓછો થવો" },
  "loss of joint flexibility and creaking": { hi: "जोड़ों का लचीलापन कम होना और आवाज आना", gu: "સાંધાની લવચીકતા ઘટવી અને અવાજ આવવો" },
  "low-grade fever and mild fatigue": { hi: "हल्का बुखार और हल्की थकान", gu: "હળવો તાવ અને સામાન્ય થાક" },
  "lower abdomen with cramping": { hi: "निचले पेट में ऐंठन के साथ दर्द", gu: "નીચલા પેટમાં ખેંચાણ સાથે દુખાવો" },
  "lower abdominal and pelvic aching": { hi: "निचले पेट और पेल्विक में दर्द", gu: "નીચલા પેટ અને પેલ્વિક વિસ્તારમાં દુખાવો" },
  "lower back pain during period": { hi: "माहवारी के दौरान कमर में दर्द", gu: "માસિક દરમિયાન કમરનો દુખાવો" },
  "lower back pain radiating into buttocks": { hi: "कमर से कूल्हों तक फैलता दर्द", gu: "કમરથી થાપા તરફ ફેલાતો દુખાવો" },
  "lower backache or leg pains": { hi: "कमर दर्द या पैरों में दर्द", gu: "કમરનો દુખાવો અથવા પગનો દુખાવો" },
  "lower pelvic discomfort": { hi: "निचले पेल्विक क्षेत्र में परेशानी", gu: "નીચલા પેલ્વિક વિસ્તારમાં અસ્વસ્થતા" },
  "mild - manageable with rest": { hi: "हल्का - आराम से प्रबंधनीय", gu: "હળવું - આરામથી નિયંત્રિત" },
  "mild ache only after long standing": { hi: "लंबे समय तक खड़े रहने पर ही हल्का दर्द", gu: "લાંબો સમય ઊભા રહેવાથી જ હળવો દુખાવો" },
  "mild discomfort": { hi: "हल्की परेशानी", gu: "હળવી તકલીફ" },
  "mild discomfort only": { hi: "केवल हल्की परेशानी", gu: "માત્ર હળવી તકલીફ" },
  "mild dizziness or weakness": { hi: "हल्के चक्कर या कमजोरी", gu: "હળવા ચક્કર અથવા નબળાઈ" },
  "mild eye soreness and tearing": { hi: "आंख में हल्का दर्द और पानी आना", gu: "આંખમાં હળવો દુખાવો અને પાણી વહેવું" },
  "mild fever and body weakness": { hi: "हल्का बुखार और शरीर में कमजोरी", gu: "હળવો તાવ અને શરીરમાં અશક્તિ" },
  "mild fever and chills": { hi: "हल्का बुखार और हल्की ठंड", gu: "હળવો તાવ અને ઠંડી" },
  "mild sore throat and tickle": { hi: "गले में हल्की खराश और खुजली", gu: "ગળામાં હળવી ખરાશ અને ખૂંચણી" },
  "mild to moderate pain on both sides of head": { hi: "सिर के दोनों तरफ हल्का या मध्यम दर्द", gu: "માથાની બંને બાજુ હળવો કે મધ્યમ દુખાવો" },
  "mild vaginal itching or irritation": { hi: "योनि में हल्की खुजली या जलन", gu: "યોનિમાર્ગમાં હળવી ખંજવાળ કે બળતરા" },
  "moderate - interferes with routine": { hi: "मध्यम - दिनचर्या में बाधा", gu: "મધ્યમ - દિનચર્યામાં અવરોધ" },
  "moderate discomfort": { hi: "मध्यम परेशानी", gu: "મધ્યમ તકલીફ" },
  "mucus discharge after defecation": { hi: "शौच के बाद आंव या श्लेष्मा आना", gu: "ઝાડા પછી ચીકાશ નીકળવી" },
  "mucus in stool": { hi: "मल में आंव या बलगम आना", gu: "ઝાડામાં ચીકાશ કે પરુ આવવું" },
  "muffled hearing from swollen ear canal": { hi: "कान की नली में सूजन से कम सुनाई देना", gu: "કાનમાં સોજાને કારણે ઓછું સંભળાવું" },
  "muffled hearing or ear pressure": { hi: "कान में भारीपन या कम सुनाई देना", gu: "કાનમાં ભારે દબાણ અથવા ઓછું સંભળાવું" },
  "muscle spasms or cramping": { hi: "मांसपेशियों में ऐंठन या मरोड़", gu: "સ્નાયુઓમાં ખેંચાણ કે ચૂંક" },
  "muscle tension and trembling": { hi: "मांसपेशियों में तनाव और कंपकंपी", gu: "સ્નાયુઓમાં તણાવ અને ધ્રૂજારી" },
  "nasal congestion and difficulty breathing": { hi: "नाक बंद होना और सांस में परेशानी", gu: "નાક બંધ થવું અને શ્વાસ લેવામાં તકલીફ" },
  "nasal congestion and stuffiness": { hi: "नाक का भारीपन और बंद होना", gu: "નાક ભરાઈ જવું અને બંધ થવું" },
  "nausea": { hi: "मतली / जी मिचलाना", gu: "ઉબકા આવવા" },
  "nausea and feeling full quickly": { hi: "मतली और थोड़ा खाते ही पेट भरना", gu: "ઉબકા આવવા અને થોડું ખાતાં જ ધરાઈ જવું" },
  "nausea and frequent vomiting": { hi: "मतली और बार-बार उल्टी होना", gu: "ઉબકા અને વારંવાર ઉલટી થવી" },
  "nausea and low-grade fever": { hi: "जी मिचलाना और हल्का बुखार", gu: "ઉબકા અને હળવો તાવ" },
  "nausea and vomiting": { hi: "मतली और उल्टी", gu: "ઉબકા અને ઉલટી" },
  "nausea and vomiting during headache": { hi: "सिरदर्द के साथ मतली और उल्टी", gu: "માથાના દુખાવા સાથે ઉબકા અને ઉલટી" },
  "nausea and vomiting with flank pain": { hi: "पसली/कमर दर्द के साथ मतली और उल्टी", gu: "પડખાના દુખાવા સાથે ઉબકા અને ઉલટી" },
  "nausea and vomiting with movement": { hi: "हिलने पर मतली और उल्टी होना", gu: "હલનચલનથી ઉબકા અને ઉલટી થવી" },
  "nausea or vomiting": { hi: "मतली या उल्टी", gu: "ઉબકા અથવા ઉલટી" },
  "neck stiffness": { hi: "गर्दन में अकड़न", gu: "ગરદનમાં જકડાઈ જવું" },
  "neck stiffness and aching pain": { hi: "गर्दन में अकड़न और दर्द", gu: "ગરદનમાં જકડન અને દુખાવો" },
  "no": { hi: "नहीं", gu: "ના" },
  "no more symptoms": { hi: "और कोई लक्षण नहीं", gu: "વધુ કોઈ લક્ષણો નથી" },
  "no other danger signs": { hi: "कोई अन्य खतरे के संकेत नहीं", gu: "અન્ય કોઈ જોખમી સંકેતો નથી" },
  "no other symptoms": { hi: "और कोई अन्य लक्षण नहीं", gu: "બીજા કોઈ લક્ષણો નથી" },
  "none apply": { hi: "इनमें से कोई नहीं", gu: "આમાંથી કોઈ લાગુ નથી" },
  "none of these": { hi: "इनमें से कोई नहीं", gu: "આમાંથી કોઈ નહીં" },
  "none of these apply": { hi: "इनमें से कोई लागू नहीं", gu: "આમાંથી કોઈ લાગુ નથી" },
  "nothing else": { hi: "और कुछ नहीं", gu: "બીજું કંઈ નથી" },
  "numbness and tingling in thumb and fingers": { hi: "अंगूठे और उंगलियों में सुन्नपन व झनझनाहट", gu: "અંગૂઠા અને આંગળીઓમાં સુન્નતા કે ઝણઝણાટી" },
  "numbness or tingling in fingers": { hi: "उंगलियों में झनझनाहट या सुन्नपन", gu: "આંગળીઓમાં ઝણઝણાટી અથવા બહેરાશ" },
  "numbness or weakness in calf or foot": { hi: "पिंडली या पैर में सुन्नपन या कमजोरी", gu: "પિંડી કે પગમાં સુન્નતા અથવા નબળાઈ" },
  "occurs intermittently for weeks": { hi: "हफ्तों से रुक-रुक कर हो रहा है", gu: "અઠવાડિયાથી વચ્ચે વચ્ચે થાય છે" },
  "oily skin with clogged pores": { hi: "बंद रोमछिद्रों के साथ तैलीय त्वचा", gu: "બંધ છિદ્રો સાથે તેલી ચામડી" },
  "only when taking deep breaths": { hi: "केवल गहरी सांस लेने पर", gu: "માત્ર ઊંડા શ્વાસ લેતી વખતે" },
  "over 1 week ago": { hi: "1 सप्ताह से अधिक समय से", gu: "1 અઠવાડિયાથી વધુ સમયથી" },
  "pain aggravated by prolonged sitting": { hi: "देर तक बैठने पर दर्द का बढ़ना", gu: "લાંબો સમય બેસી રહેવાથી દુખાવો વધવો" },
  "pain in perineum groin or lower back": { hi: "जांघ, कमर या पेल्विक में दर्द", gu: "સાથળ, કમર કે પેલ્વિકમાં દુખાવો" },
  "pain in upper teeth or behind cheeks": { hi: "ऊपरी दांतों या गालों के पीछे दर्द", gu: "ઉપલા દાંતમાં કે ગાલ પાછળ દુખાવો" },
  "pain or burning during urination": { hi: "पेशाब करते समय दर्द या जलन", gu: "પેશાબ કરતી વખતે દુખાવો કે બળતરા" },
  "pain radiating down shoulder and arm": { hi: "कंधे से हाथ की ओर फैलता दर्द", gu: "ખભાથી હાથ તરફ ફેલાતો દુખાવો" },
  "pain radiating to lower abdomen and groin": { hi: "निचले पेट और जांघ तक फैलता दर्द", gu: "નીચલા પેટ અને સાથળ તરફ ફેલાતો દુખાવો" },
  "pain starting near navel and moving down": { hi: "नाभि के पास से शुरू होकर नीचे जाता दर्द", gu: "ડૂંટી પાસે શરૂ થઈ નીચે તરફ જતો દુખાવો" },
  "pain when pulling earlobe or pressing tragus": { hi: "कान छूने या खींचने पर दर्द होना", gu: "કાન ખેંચવા કે દબાવવાથી દુખાવો થવો" },
  "pain worsening when using injured muscle": { hi: "चोटिल अंग पर जोर देने से दर्द बढ़ना", gu: "ઈજાગ્રસ્ત સ્નાયુ વાપરવાથી દુખાવો વધવો" },
  "painful and difficult swallowing": { hi: "निगलने में दर्द और भारी परेशानी", gu: "ખોરાક ગળવામાં દુખાવો અને મુશ્કેલી" },
  "painful ejaculation": { hi: "वीर्यपात के समय दर्द", gu: "સ્ખલન વખતે દુખાવો" },
  "painful intercourse": { hi: "संभोग के समय दर्द", gu: "સંભોગ દરમિયાન દુખાવો" },
  "painful lump or swelling near anus": { hi: "गुदा के पास दर्दनाक गांठ या सूजन", gu: "ગુદા પાસે દુખાવો કરતી ગાંઠ કે સોજો" },
  "painful red bump along eyelid edge": { hi: "पलक के किनारे लाल दर्दनाक फुंसी (बिलनी)", gu: "પોપચાંની કિનારી પર લાલ દુખતી ફોલ્લી (આંજણી)" },
  "painful red bumps on face or back": { hi: "चेहरे या पीठ पर लाल दर्दनाक मुहांसे", gu: "ચહેરા કે પીઠ પર લાલ દુખતા ખીલ" },
  "painful swallowing": { hi: "निगलते समय दर्द होना", gu: "ગળતી વખતે દુખાવો થવો" },
  "painful urination": { hi: "पेशाब में दर्द", gu: "પેશાબમાં દુખાવો" },
  "painful urination or pain during intercourse": { hi: "पेशाब या संभोग के दौरान दर्द", gu: "પેશાબ કે સંભોગ વખતે દુખાવો" },
  "painful urination with intense spasms": { hi: "पेशाब में तेज ऐंठन के साथ दर्द", gu: "પેશાબમાં તીવ્ર ચૂંક સાથે દુખાવો" },
  "painless bleeding during bowel movement": { hi: "शौच के समय बिना दर्द के खून आना", gu: "ઝાડા વખતે દર્દ વિના લોહી નીકળવું" },
  "pale skin and pale inner eyelids": { hi: "पीली त्वचा और पलकों के अंदर पीलापन", gu: "ફિક્કી ચામડી અને પોપચાંમાં ફીકાશ" },
  "palpitations": { hi: "धड़कन तेज होना (Palpitations)", gu: "ધબકારા વધી જવા (Palpitations)" },
  "paresthesia": { hi: "झनझनाहट या सुन्नपन", gu: "ઝણઝણાટી કે સુન્નતા" },
  "passing frequent small amounts of urine": { hi: "थोड़ा-थोड़ा बार-बार पेशाब आना", gu: "થોડો-થોડો વારંવાર પેશાબ થવો" },
  "patches of red skin with greasy scales": { hi: "लाल त्वचा पर चिपचिपी पपड़ीदार परत", gu: "લાલ ચામડી પર ચીકણા પોપડા" },
  "pelvic pain": { hi: "पेल्विक दर्द", gu: "પેલ્વિક દુખાવો" },
  "pelvic pressure or fullness": { hi: "पेल्विक क्षेत्र में भारीपन या दबाव", gu: "પેલ્વિક ભાગમાં ભારે દબાણ" },
  "pelvic pressure or lower belly discomfort": { hi: "निचले पेट में दबाव या भारीपन", gu: "નીચલા પેટમાં દબાણ કે અસ્વસ્થતા" },
  "persistent bad breath": { hi: "मुंह से लगातार दुर्गंध आना", gu: "મોંમાંથી સતત દુર્ગંધ આવવી" },
  "persistent fatigue and sluggishness": { hi: "लगातार थकान और सुस्ती", gu: "સતત થાક અને સુસ્તી રહેવી" },
  "persistent fatigue or tiredness": { hi: "लगातार थकान या कमजोरी", gu: "સતત થાક અથવા અશક્તિ" },
  "persistent fatigue or weakness": { hi: "लगातार थकान या कमजोरी", gu: "સતત થાક અથવા નબળાઈ" },
  "persistent low mood and sadness": { hi: "लगातार उदासी और निराशा", gu: "સતત ઉદાસી અને હતાશા" },
  "persistent low mood or sadness": { hi: "लगातार उदासी या निराशा", gu: "સતત ઉદાસી કે નિરાશા" },
  "persistent productive cough with phlegm": { hi: "बलगम वाली लगातार खांसी", gu: "કફવાળી સતત ખાંસી" },
  "persistent rectal burning": { hi: "गुदा में लगातार जलन", gu: "ગુદામાં સતત બળતરા" },
  "persistent worry and nervousness": { hi: "लगातार चिंता और घबराहट", gu: "સતત ચિંતા અને ગભરાટ" },
  "pimples or facial breakouts": { hi: "चेहरे पर मुहांसे या फुंसियां", gu: "ચહેરા પર ખીલ કે ફોડલીઓ" },
  "pink red or brown blood in urine": { hi: "पेशाब में लाल, गुलाबी या भूरा खून", gu: "પેશાબમાં ગુલાબી, લાલ કે કથ્થઈ લોહી" },
  "pins and needles or numbness in fingers": { hi: "उंगलियों में झनझनाहट या सुन्नपन", gu: "આંગળીઓમાં ઝણઝણાટી કે બહેરાશ" },
  "pins and needles radiating to forearm": { hi: "बांह तक झनझनाहट और सुन्नपन", gu: "હાથ તરફ ફેલાતી ઝણઝણાટી કે સોય ભોંકાતી પીડા" },
  "post-nasal drip and watery eyes": { hi: "गले में कफ टपकना और आंखों में पानी", gu: "ગળામાં કફ પડવો અને આંખોમાંથી પાણી" },
  "pounding heart or rapid palpitations": { hi: "दिल की तेज धड़कन या घबराहट", gu: "હૃદયના ઝડપી ધબકારા કે ધડકન વધવી" },
  "puffy or swollen eyelids": { hi: "फूली हुई या सूजी हुई पलकें", gu: "ફૂલેલા અથવા સોજાવાળા પોપચાં" },
  "pus draining from gum with bad taste": { hi: "मसूड़ों से मवाद और मुंह का खराब स्वाद", gu: "પેઢામાંથી પરુ નીકળવું અને ખરાબ સ્વાદ" },
  "pustules with whiteheads": { hi: "मवाद वाले सफेद दाने / फुंसियां", gu: "પરુ ભરેલા સફેદ દાણા કે ખીલ" },
  "racing heartbeat or palpitations": { hi: "तेज धड़कन या दिल का जोर से धड़कना", gu: "ધબકારા ઝડપી થવા કે ધબકારો વધવો" },
  "radiates to left arm/jaw": { hi: "दर्द बाएं हाथ या जबड़े तक फैलना", gu: "ડાબા હાથ કે જડબા તરફ દુખાવો ફેલાવો" },
  "raised itchy red hives": { hi: "उभरे हुए लाल खुजलीदार चकत्ते (पित्ती)", gu: "ઉપસેલા લાલ ખંજવાળવાળા ઢીમચાં (શીતપિત્ત)" },
  "rapidly expanding skin redness": { hi: "त्वचा की लाली का तेजी से फैलना", gu: "ચામડીની લાલાશ ઝડપથી ફેલાવી" },
  "rash": { hi: "चकत्ते / रैश", gu: "ચકામા / રેશ" },
  "red and swollen tonsils": { hi: "लाल और सूजे हुए टॉन्सिल", gu: "લાલ અને સોજાવાળા કાકડા (ટૉન્સિલ)" },
  "red inflamed skin on elbows or knees": { hi: "कोहनी या घुटनों पर लाल सूजी त्वचा", gu: "કોણી કે ઢીંચણ પર લાલ સોજાવાળી ચામડી" },
  "red skin patches covered with silvery scales": { hi: "चांदी जैसी पपड़ी से ढके लाल चकत्ते", gu: "રૂપેરી પોપડાવાળા લાલ ચકામા" },
  "red swollen eyelid margins": { hi: "पलकों के किनारों पर लाली और सूजन", gu: "પોપચાંની કિનારી પર લાલાશ અને સોજો" },
  "red swollen or puffy gums": { hi: "मसूड़ों में लाली और सूजन", gu: "પેઢામાં લાલાશ અને સોજો" },
  "redness and swelling of the vulva": { hi: "योनि मार्ग के बाहरी हिस्से में लाली व सूजन", gu: "ગુપ્તાંગના બહારના ભાગમાં લાલાશ અને સોજો" },
  "redness in both eyes": { hi: "दोनों आंखों में लाली", gu: "બંને આંખો લાલ થવી" },
  "redness in eyes": { hi: "आंखों में लाली", gu: "આંખોમાં લાલાશ" },
  "restlessness or feeling on edge": { hi: "बेचैनी और चिड़चिड़ापन", gu: "બેચેની અને અજંપો" },
  "right lower side with tenderness": { hi: "निचले दाहिने हिस्से में छूने पर दर्द", gu: "નીચલા જમણા ભાગમાં અડવાથી દુખાવો" },
  "room spinning when turning (vertigo)": { hi: "करवट लेते समय चक्कर आना (वर्टिगो)", gu: "પડખું ફરતી વખતે ચક્કર આવવા (વર્ટિગો)" },
  "rough growths on fingers or hands": { hi: "उंगलियों या हाथों पर खुरदुरे मस्से", gu: "આંગળીઓ કે હાથ પર ખરબચડા મસા" },
  "runny nose": { hi: "बहती नाक", gu: "વહેતું નાક" },
  "runny or stuffy nose": { hi: "बहती या बंद नाक", gu: "વહેતું કે બંધ નાક" },
  "scalp itching and soreness": { hi: "सिर की त्वचा में खुजली और दर्द", gu: "માથાની ચામડીમાં ખંજવાળ અને દુખાવો" },
  "scratchy voice and bad breath": { hi: "बैठी हुई आवाज और सांस में दुर्गंध", gu: "ઘોઘરો અવાજ અને મોંની દુર્ગંધ" },
  "sensitive raw skin flare-ups": { hi: "संवेदनशील त्वचा में जलन व खुजली बढ़ना", gu: "સંવેદનશીલ ચામડીમાં અચાનક બળતરા" },
  "sensitivity to bright light": { hi: "तेज रोशनी से परेशानी (फोटोफोबिया)", gu: "તીવ્ર પ્રકાશથી આંખો અંજાવવી" },
  "sensitivity to hot or cold food": { hi: "ठंडा या गरम खाने पर दांतों में झनझनाहट", gu: "ઠંડો કે ગરમ ખોરાક લેતાં દાંતમાં કળતર" },
  "sensitivity to light and sound": { hi: "रोशनी और तेज आवाज से सिरदर्द", gu: "અજવાળા અને અવાજથી અકળામણ" },
  "severe - intense and distressing": { hi: "गंभीर - तीव्र और कष्टदायक", gu: "ગંભીર - તીવ્ર અને પીડાદાયક" },
  "severe discomfort": { hi: "गंभीर परेशानी", gu: "ગંભીર તકલીફ" },
  "severe generalized body aches": { hi: "पूरे शरीर में अत्यधिक बदन दर्द", gu: "સમગ્ર શરીરમાં તીવ્ર કળતર અને દુખાવો" },
  "severe menstrual cramps and pelvic pain": { hi: "माहवारी में तेज ऐंठन और पेल्विक दर्द", gu: "માસિકમાં અસહ્ય ખેંચાણ અને પેલ્વિક દુખાવો" },
  "severe restriction in raising arm": { hi: "हाथ ऊपर उठाने में भारी रुकावट", gu: "હાથ ઊંચો કરવામાં ભારે મુશ્કેલી" },
  "severe scratchy or raw sore throat": { hi: "गले में अत्यधिक चुभन और तेज दर्द", gu: "ગળામાં સખત છોલાણ કે તીવ્ર ખરાશ" },
  "severe sharp pain in side and back": { hi: "पीठ और पसली में तेज चुभने वाला दर्द", gu: "પીઠ અને પડખામાં તીવ્ર ચસકો મારતો દુખાવો" },
  "severe stiffness in mornings": { hi: "सुबह के समय जोड़ों में अत्यधिक अकड़न", gu: "સવારે સાંધામાં તીવ્ર જકડાઈ જવું" },
  "severe throbbing toothache": { hi: "दांत में असहनीय धड़कता हुआ दर्द", gu: "દાંતમાં સખત ધબકારા મારતો દુખાવો" },
  "sharp chest pain when breathing deeply": { hi: "गहरी सांस लेने पर सीने में तेज चुभन", gu: "ઊંડો શ્વાસ લેતી વખતે છાતીમાં તીક્ષ્ણ દુખાવો" },
  "sharp demarcation where substance touched": { hi: "छूने वाली जगह पर स्पष्ट लाल निशान", gu: "વસ્તુ અડકી હોય તેટલા ભાગમાં ચોક્કસ નિશાન" },
  "sharp pain during bowel movements": { hi: "शौच के समय तेज चुभन या दर्द", gu: "શૌચ વખતે તીવ્ર ચીરા જેવી પીડા" },
  "sharp pain in lower right abdomen": { hi: "निचले दाहिने पेट में तेज चुभने वाला दर्द", gu: "નીચલા જમણા પેટમાં તીક્ષ્ણ દુખાવો" },
  "shooting electric pain down one leg": { hi: "पैर में करंट जैसा दौड़ता हुआ दर्द (सायटिका)", gu: "પગમાં કરંટ જેવો વહેતો દુખાવો (સાયટિકા)" },
  "shortness of breath": { hi: "सांस लेने में कठिनाई / सांस फूलना", gu: "શ્વાસ લેવામાં તકલીફ" },
  "shortness of breath and rapid breathing": { hi: "सांस फूलना और तेज-तेज सांस लेना", gu: "શ્વાસ ચડવો અને ઝડપી શ્વાસોચ્છવાસ" },
  "shortness of breath on exertion": { hi: "थोड़ा चलने या मेहनत पर सांस फूलना", gu: "શ્રમ કે ચાલવાથી શ્વાસ ચડવો" },
  "shortness of breath on lying down": { hi: "लेटने पर सांस फूलना", gu: "સૂતી વખતે શ્વાસ ચડવો" },
  "shortness of breath on mild exertion": { hi: "हल्की मेहनत में ही सांस भर जाना", gu: "હળવા કામમાં પણ શ્વાસ ચડી જવો" },
  "shortness of breath or smothering feeling": { hi: "सांस रुकने या दम घुटने जैसा अहसास", gu: "શ્વાસ રુંધાતો હોય તેવો અહેસાસ" },
  "shortness of breath with mucus": { hi: "बलगम के साथ सांस लेने में तकलीफ", gu: "કફ સાથે શ્વાસ લેવામાં તકલીફ" },
  "skin blister or peeling after contact": { hi: "छूने के बाद त्वचा पर छाले या चमड़ी उतरना", gu: "સંપર્ક પછી ચામડી પર ફોલ્લા કે પોપડા ઉખડવા" },
  "skin firmness or tightness": { hi: "त्वचा में खिंचाव या कड़ापन", gu: "ચામડીમાં ખેંચાણ કે કડકપણું" },
  "skin rash or itching": { hi: "त्वचा पर दाने या खुजली", gu: "ચામડી પર ચકામા કે ખંજવાળ" },
  "skin rash or pimples": { hi: "त्वचा पर दाने या मुहांसे", gu: "ચામડી પર ચકામા અથવા ખીલ" },
  "skin rash or red patches": { hi: "त्वचा पर लाल चकत्ते", gu: "ચામડી પર લાલ ચકામા" },
  "skin rash or spots": { hi: "त्वचा पर दाने या चकत्ते", gu: "ચામડી પર ફોલ્લીઓ કે ડાઘ" },
  "skin thickening from scratching": { hi: "खुजलाने से त्वचा का मोटा पड़ना", gu: "ખંજવાળવાથી ચામડી જાડી થઈ જવી" },
  "small fleshy grainy skin bumps": { hi: "त्वचा पर छोटे दानेदार मस्से", gu: "ચામડી પર નાના દાણાદાર મસા" },
  "small fluid-filled blisters": { hi: "पानी भरे छोटे-छोटे छाले", gu: "પાણી ભરેલા નાના ફોલ્લા" },
  "small pus spot at base of eyelash": { hi: "पलक की जड़ में मवाद वाली फुंसी", gu: "પોપચાંના મૂળમાં પરુવાળી નાની ફોડલી" },
  "sneezing": { hi: "छींक आना", gu: "છીંક આવવી" },
  "sneezing fits": { hi: "लगातार छींकों के दौरे", gu: "વારંવાર આવતી છીંકો" },
  "sore or scratchy throat": { hi: "गले में दर्द या खराश", gu: "ગળામાં દુખાવો કે ખરાશ" },
  "sore throat": { hi: "गले में खराश / दर्द", gu: "ગળામાં ખરાશ અથવા દુખાવો" },
  "sound sensitivity": { hi: "ध्वनि के प्रति संवेदनशीलता", gu: "અવાજ પ્રત્યે સંવેદનશીલતા" },
  "sour or bitter acid regurgitation": { hi: "मुंह में खट्टा या कड़वा पानी आना", gu: "મોંમાં ખાટો કે કડવો પિત્તનો ઓડકાર" },
  "sour taste or acid coming into mouth": { hi: "मुंह में खट्टा पानी या एसिड आना", gu: "મોંમાં ખાટું પાણી કે એસિડ આવવું" },
  "spinning sensation when turning head or rolling over": { hi: "सिर घुमाने या करवट लेने पर चक्कर आना", gu: "માથું ફેરવતી વખતે કે પડખું ફરતાં ચક્કર આવવા" },
  "spreading red skin area": { hi: "त्वचा की लाली का फैलना", gu: "ચામડી પર લાલ ચકામાનું વિસ્તરણ" },
  "started 2-3 days ago": { hi: "2-3 दिन पहले शुरू हुआ", gu: "2-3 દિવસ પહેલાં શરૂ થયું" },
  "started today": { hi: "आज ही शुरू हुआ", gu: "આજે જ શરૂ થયું" },
  "started today (sudden)": { hi: "आज अचानक शुरू हुआ", gu: "આજે અચાનક શરૂ થયું" },
  "stiff shoulder joint worse at night": { hi: "रात में कंधे के जोड़ में अधिक जकड़न", gu: "રાત્રે ખભાના સાંધામાં વધુ જકડાઈ જવું" },
  "stiffness and reduced range of motion": { hi: "जोड़ों में अकड़न और हिलने में रुकावट", gu: "અકડાઈ જવું અને હલનચલન મર્યાદિત થવી" },
  "stomach / abdomen": { hi: "पेट / उदर", gu: "પેટ / પેટનો ભાગ" },
  "stomach / abdominal pain": { hi: "पेट / उदर में दर्द", gu: "પેટમાં દુખાવો" },
  "stomach ache or nausea": { hi: "पेट में दर्द या मतली", gu: "પેટમાં દુખાવો કે ઉબકા" },
  "stomach pain": { hi: "पेट दर्द", gu: "પેટનો દુખાવો" },
  "stomach pain or nausea": { hi: "पेट दर्द या मतली", gu: "પેટમાં દુખાવો અથવા ઉબકા" },
  "stomach pain temporarily relieved by food": { hi: "खाना खाने पर पेट दर्द में कुछ राहत", gu: "ખોરાક લેવાથી પેટના દુખાવામાં હળવાશ" },
  "stringy eye discharge": { hi: "आंखों से रेशेदार या चिपचिपा स्राव", gu: "આંખોમાંથી તાર જેવો ચીકણો સ્ત્રાવ" },
  "strong persistent urge to urinate": { hi: "पेशाब जाने की लगातार तीव्र इच्छा", gu: "વારંવાર પેશાબ જવાની તીવ્ર ઈચ્છા" },
  "sudden episode of intense terror": { hi: "अचानक अत्यधिक डर या घबराहट का दौरा", gu: "અચાનક અત્યંત ડર કે પેનિકનો હુમલો" },
  "sudden skin wheals or welts": { hi: "त्वचा पर अचानक उभरे लाल चकत्ते (पित्ती)", gu: "ચામડી પર અચાનક ઉપસી આવતા ઢીમચાં" },
  "sweating": { hi: "पसीना आना", gu: "પરસેવો વળવો" },
  "sweating and breathlessness": { hi: "पसीना आना और सांस फूलना", gu: "પરસેવો વળવો અને શ્વાસ ચડવો" },
  "swelling and warmth in joint": { hi: "जोड़ में सूजन और गर्माहट", gu: "સાંધામાં સોજો અને ગરમી" },
  "swelling in cheek or jaw": { hi: "गाल या जबड़े में सूजन", gu: "ગાલ અથવા જડબામાં સોજો" },
  "swelling of lips or face": { hi: "होंठों या चेहरे पर सूजन", gu: "હોઠ અથવા ચહેરા પર સોજો" },
  "swelling of the entire eyelid": { hi: "पूरी पलक पर सूजन", gu: "આખા પોપચાં પર સોજો" },
  "swelling or bruising around joint": { hi: "जोड़ के आसपास सूजन या नील पड़ना", gu: "સાંધાની આસપાસ સોજો કે કાળું પડી જવું" },
  "swelling or tenderness around knee or hip": { hi: "घुटने या कूल्हे के पास सूजन व दर्द", gu: "ઢીંચણ કે થાપાની આસપાસ સોજો અને પીડા" },
  "swollen and stiff joints with skin rash": { hi: "चकत्तों के साथ जोड़ों में सूजन व अकड़न", gu: "ચકામા સાથે સાંધામાં સોજો અને જકડન" },
  "swollen eyelids": { hi: "पलकों में सूजन", gu: "પોપચાંમાં સોજો" },
  "swollen eyelids / eyes": { hi: "पलकों या आंखों में सूजन", gu: "પોપચાં અથવા આંખોમાં સોજો" },
  "swollen red tonsils": { hi: "लाल और सूजे हुए टॉन्सिल", gu: "લાલ અને સોજાવાળા કાકડા" },
  "swollen warm and tender skin": { hi: "सूजी हुई, गर्म और दर्दनाक त्वचा", gu: "સોજાવાળી, ગરમ અને દુખતી ચામડી" },
  "tearing sensation in anal area": { hi: "गुदा में चीरा या फटने जैसा अहसास", gu: "ગુદામાં ચીરાઈ જતી હોય તેવી પીડા" },
  "tender gums and gum recession": { hi: "मसूड़ों में दर्द और मसूड़े नीचे खिसकना", gu: "પેઢામાં દુખાવો અને પેઢા ઉતરી જવા" },
  "tender or bleeding gums": { hi: "मसूड़ों से खून आना या दर्द", gu: "પેઢામાંથી લોહી નીકળવું કે દુખાવો" },
  "tender swollen lymph nodes in neck": { hi: "गर्दन में दर्दनाक सूजी हुई गांठें", gu: "ગળામાં દુખતી સોજાવાળી લસિકાગ્રંથિઓ" },
  "tender swollen lymph nodes under jaw": { hi: "जबड़े के नीचे सूजी हुई दर्दनाक गांठें", gu: "જડબા નીચે સોજાવાળી દુખતી ગાંઠો" },
  "tenderness and crusting along eyelid": { hi: "पलक के किनारे दर्द और पपड़ी", gu: "પોપચાંની કિનારી પર પીડા અને પોપડી" },
  "tenderness on scalp neck and shoulder muscles": { hi: "सिर, गर्दन और कंधे की मांसपेशियों में दर्द", gu: "માથું, ગરદન અને ખભાના સ્નાયુઓમાં દુખાવો" },
  "thick white odorless discharge like cottage cheese": { hi: "पनीर जैसा गाढ़ा सफेद गंधहीन स्राव", gu: "ચીઝ જેવો ઘટ્ટ સફેદ ગંધહીન સ્ત્રાવ" },
  "thick yellow or green nasal discharge": { hi: "गाढ़ा पीला या हरा नाक का बलगम", gu: "ઘટ્ટ પીળો અથવા લીલો નાકનો કફ" },
  "thickened pitted or ridged nails": { hi: "मोटे, गड्ढेदार या धारीदार नाखून", gu: "જાડા, ખાડાવાળા કે ઊઝરડાવાળા નખ" },
  "thin grayish-white vaginal discharge": { hi: "पतला भूरा-सफेद योनि स्राव", gu: "પાતળો ભૂખરો-સફેદ યોનિમાર્ગ સ્ત્રાવ" },
  "throbbing pulsating headache on one side": { hi: "एक तरफ धड़कता हुआ तेज सिरदर्द", gu: "એક બાજુ ધબકારા મારતો માથાનો દુખાવો" },
  "tightness or pressure across forehead and temples": { hi: "माथे और कनपटियों पर कसाव व दबाव", gu: "કપાળ અને લમણાં પર ખેંચાણ કે દબાણ" },
  "tingling pins and needles in leg": { hi: "पैर में झनझनाहट और सुन्नपन", gu: "પગમાં કીડીઓ ચડતી હોય તેવી ઝણઝણાટી" },
  "tiny black pinpoints of clotted blood vessels": { hi: "मस्से में खून की नसों के काले बिंदु", gu: "મસામાં રક્તવાહિનીઓના કાળા ઝીણા ટપકાં" },
  "tooth or jaw pain": { hi: "दांत या जबड़े में दर्द", gu: "દાંત અથવા જડબામાં દુખાવો" },
  "tooth pain": { hi: "दांत दर्द", gu: "દાંતનો દુખાવો" },
  "tooth swelling with pus": { hi: "दांत में मवाद के साथ सूजन", gu: "દાંતમાં પરુ સાથે સોજો" },
  "trembling, shaking and sweating": { hi: "कांपना, थरथराना और पसीना आना", gu: "ધ્રૂજારી અને પરસેવો વળવો" },
  "unexplained weight gain": { hi: "बिना कारण वजन बढ़ना", gu: "કારણ વિના વજન વધવું" },
  "unpleasant fishy odor worsening after wash": { hi: "धोने के बाद बढ़ने वाली मछली जैसी दुर्गंध", gu: "ધોયા પછી વધતી માછલી જેવી દુર્ગંધ" },
  "unusual or foul vaginal discharge": { hi: "असामान्य या दुर्गंधयुक्त योनि स्राव", gu: "અસામાન્ય કે દુર્ગંધયુક્ત યોનિમાર્ગ સ્ત્રાવ" },
  "upper abdomen / burning after meals": { hi: "ऊपरी पेट में जलन (भोजन के बाद)", gu: "ઉપલા પેટમાં બળતરા (જમ્યા પછી)" },
  "urgent need to use the toilet": { hi: "तुरंत शौच जाने की तीव्र हाजत", gu: "તાકીદે શૌચ જવાની જરૂર પડવી" },
  "urinary / bladder": { hi: "मूत्र / मूत्राशय", gu: "પેશાબ / મૂત્રાશય" },
  "urinary dribbling at end of flow": { hi: "पेशाब खत्म होने पर बूंद-बूंद टपकना", gu: "પેશાબ પૂરો થતાં ટીપાં પડવા" },
  "vaginal discharge": { hi: "योनि स्राव", gu: "યોનિમાર્ગ સ્રાવ" },
  "vaginal itching": { hi: "योनि में खुजली", gu: "યોનિમાર્ગમાં ખંજવાળ" },
  "vaginal itching or irritation": { hi: "योनि में खुजली या जलन", gu: "યોનિમાર્ગમાં ખંજવાળ અથવા બળતરા" },
  "vaginal soreness and rash": { hi: "योनि में दर्द, खरोंच और दाने", gu: "યોનિમાર્ગમાં દુખાવો અને ચકામા" },
  "vertigo": { hi: "वर्टिगो / चक्कर", gu: "વર્ટિગો / ચક્કર" },
  "visual disturbances or aura": { hi: "आंखों के आगे चमक या धुंधलापन (ऑरा)", gu: "દ્રષ્ટિમાં ઝબકારા કે ખલેલ (ઓરા)" },
  "vomiting": { hi: "उल्टी", gu: "ઉલટી" },
  "warm flushed skin": { hi: "गर्म और लाल पड़ी हुई त्वचा", gu: "ગરમ અને લાલ થયેલી ચામડી" },
  "watering eye with eyelid irritation": { hi: "आंख से पानी और पलक में जलन", gu: "આંખમાંથી પાણી અને પોપચાંમાં બળતરા" },
  "watery diarrhea": { hi: "पानी जैसे पतले दस्त", gu: "પાણી જેવા પાતળા ઝાડા" },
  "watery eyes": { hi: "आंखों से पानी आना", gu: "આંખોમાંથી પાણી આવવું" },
  "watery eyes / excessive tearing": { hi: "आंखों से पानी आना / अत्यधिक आंसू", gu: "આંખોમાંથી પાણી આવવું" },
  "watery itchy eyes": { hi: "आंखों में पानी और खुजली", gu: "આંખોમાં પાણી અને ખંજવાળ" },
  "weak grip strength dropping objects": { hi: "हाथ की पकड़ कमजोर होना (चीजें छूटना)", gu: "હાથની પકડ નબળી પડવી (વસ્તુઓ છૂટવી)" },
  "weak urinary stream": { hi: "पेशाब की कमजोर धार", gu: "પેશાબની નબળી ધાર" },
  "wheezing": { hi: "घरघराहट", gu: "સીટી જેવો અવાજ" },
  "wheezing breath sounds": { hi: "सांस लेते समय सीटी जैसी आवाज", gu: "શ્વાસ લેતી વખતે સીટી જેવો અવાજ" },
  "wheezing or chest whistling": { hi: "सांस लेते समय सीटी जैसी आवाज (घरघराहट)", gu: "શ્વાસ લેતી વખતે સીટી જેવો અવાજ" },
  "white or yellow patches on tonsils": { hi: "टॉन्सिल पर सफेद या पीले धब्बे", gu: "કાકડા પર સફેદ કે પીળા ડાઘ" },
  "worse during exertion or walking": { hi: "चलने या मेहनत करने पर बढ़ना", gu: "ચાલવાથી કે શ્રમ કરવાથી વધવું" },
  "wrist aching after repetitive tasks": { hi: "बार-बार एक ही काम से कलाई में दर्द", gu: "વારંવારના કામ પછી કાંડામાં દુખાવો" },
  "yellow or green eye discharge": { hi: "आंखों से पीला या हरा कीचड़/मवाद", gu: "આંખોમાંથી પીળો કે લીલો ચીકણો સ્ત્રાવ" },
  "yellowish or clear ear drainage": { hi: "कान से पीला या साफ पानी बहना", gu: "કાનમાંથી પીળો કે સ્વચ્છ સ્ત્રાવ વહેવો" },
  "yes": { hi: "हाँ", gu: "હા" },
  "yes, sweating and breathlessness": { hi: "हाँ, पसीना आना और सांस फूलना", gu: "હા, પરસેવો વળવો અને શ્વાસ ચડવો" },
};

export function localizeSymptomOption(option?: string | null, lang: string = "en"): string {
  if (!option) return "";
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") return option;

  // If already in Devanagari or Gujarati, return as-is
  if (/[\u0900-\u097F\u0A80-\u0AFF]/.test(option)) {
    return option;
  }

  const clean = option.trim();
  const lower = clean.toLowerCase();

  const exact = SYMPTOM_OPTION_TRANSLATIONS[lower];
  if (exact) {
    if (normalizedLang === "hi" && exact.hi) return exact.hi;
    if (normalizedLang === "gu" && exact.gu) return exact.gu;
  }

  // Punctuation stripped check
  const stripped = lower.replace(/[.,/#!$%^&*;:{}=_`~()-]/g, " ").replace(/\s+/g, " ").trim();
  const strippedMatch = SYMPTOM_OPTION_TRANSLATIONS[stripped];
  if (strippedMatch) {
    if (normalizedLang === "hi" && strippedMatch.hi) return strippedMatch.hi;
    if (normalizedLang === "gu" && strippedMatch.gu) return strippedMatch.gu;
  }

  return option;
}

// ── BODY SYSTEM LOCALIZATION ──

export const BODY_SYSTEM_TRANSLATIONS: Record<string, { hi: string; gu: string }> = {
  "All": { hi: "सभी", gu: "બધા" },
  "Cardiovascular": { hi: "हृदय व रक्तवाहिका (Cardiovascular)", gu: "કાર્ડિયોવેસ્ક્યુલર (હૃદય)" },
  "Respiratory & Pulmonology": { hi: "श्वसन व फेफड़े (Respiratory)", gu: "શ્વસન અને પલ્મોનોલોજી" },
  "Gastroenterology": { hi: "पेट व पाचन (Gastroenterology)", gu: "ગેસ્ટ્રોએન્ટેરોલોજી (પાચન)" },
  "Ophthalmology & Vision": { hi: "नेत्र व दृष्टि (Ophthalmology)", gu: "ઓપ્થેલ્મોલોજી (આંખ)" },
  "ENT & Hearing": { hi: "कान, नाक, गला (ENT)", gu: "ઇએનટી (કાન, નાક, ગળું)" },
  "Dermatology & Skin": { hi: "त्वचा व चर्मरोग (Dermatology)", gu: "ડર્માટોલોજી (ચામડી)" },
  "Endocrine & Metabolic": { hi: "अंतःस्रावी व मेटाबॉलिक (Endocrine)", gu: "એન્ડોક્રાઇન અને મેટાબોલિક" },
  "Urology & Nephrology": { hi: "मूत्र व गुर्दा (Urology/Kidney)", gu: "યુરોલોજી અને નેફ્રોલોજી" },
  "Infectious & General": { hi: "संक्रामक व सामान्य (Infectious)", gu: "ચેપી અને સામાન્ય" },
  "Orthopedics & Musculoskeletal": { hi: "हड्डी व जोड़ (Orthopedics)", gu: "ઓર્થોપેડિક્સ (હાડકાં/સાંધા)" },
};

export function localizeBodySystem(system?: string | null, lang: string = "en"): string {
  if (!system) return "";
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  if (normalizedLang === "en") return system;

  const translation = BODY_SYSTEM_TRANSLATIONS[system];
  if (translation) {
    if (normalizedLang === "hi" && translation.hi) return translation.hi;
    if (normalizedLang === "gu" && translation.gu) return translation.gu;
  }
  return system;
}

/**
 * Translates a key for a given language, with optional template interpolation.
 * Falls back safely to English if the translation or key is not available.
 */
export function t(
  key: string,
  lang: SupportedLanguage = "en",
  params?: Record<string, string | number>
): string {
  const normalizedLang = (lang || "en").toLowerCase().slice(0, 2);
  const dict = DICTIONARIES[normalizedLang] || DICTIONARIES.en;
  let text = dict[key] || DICTIONARIES.en[key] || key;

  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }

  return text;
}

/**
 * Simple hook wrapper for functional components
 */
export function useTranslation(lang: SupportedLanguage = "en") {
  return {
    t: (key: string, params?: Record<string, string | number>) => t(key, lang, params),
    language: lang,
  };
}
