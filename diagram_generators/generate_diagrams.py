import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

OUTPUT_DIR = r"d:\MediPath_AI_Capstone\MediPath_AI_Capstone\documentation_assets\diagrams"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Common styling constants
FONT_FAMILY = 'sans-serif'
C_NAVY = '#0F172A'
C_SLATE = '#334155'
C_LIGHT_BG = '#F8FAFC'
C_CARD_BG = '#FFFFFF'
C_BORDER = '#CBD5E1'
C_TEAL = '#0D9488'
C_TEAL_LIGHT = '#CCFBF1'
C_BLUE = '#2563EB'
C_BLUE_LIGHT = '#DBEAFE'
C_EMERALD = '#059669'
C_EMERALD_LIGHT = '#D1FAE5'
C_AMBER = '#D97706'
C_AMBER_LIGHT = '#FEF3C7'
C_ROSE = '#E11D48'
C_ROSE_LIGHT = '#FFE4E6'
C_PURPLE = '#7C3AED'
C_PURPLE_LIGHT = '#EDE9FE'

def create_base_fig(width=13.5, height=8.8, title="", subtitle=""):
    fig, ax = plt.subplots(figsize=(width, height), dpi=220)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    # Background
    bg = patches.Rectangle((0, 0), 100, 100, facecolor=C_LIGHT_BG, edgecolor=C_BORDER, linewidth=1.5)
    ax.add_patch(bg)
    # Header banner
    if title:
        header_box = patches.Rectangle((0, 91.5), 100, 8.5, facecolor=C_NAVY, edgecolor='none')
        ax.add_patch(header_box)
        ax.text(3, 96.0, title, fontsize=13.5, fontweight='bold', color='#FFFFFF', va='center', family=FONT_FAMILY)
        if subtitle:
            ax.text(3, 93.3, subtitle, fontsize=8.8, color='#94A3B8', va='center', family=FONT_FAMILY)
    return fig, ax

def draw_box(ax, x, y, w, h, title, lines=None, bg_color=C_CARD_BG, border_color=C_BORDER, 
             title_color=C_NAVY, title_size=9.5, text_size=7.5, radius=1.2, line_spacing=None):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0.5,rounding_size={radius}",
                                facecolor=bg_color, edgecolor=border_color, linewidth=1.2)
    ax.add_patch(box)
    if title:
        ax.text(x + w/2, y + h - 2.2, title, fontsize=title_size, fontweight='bold', 
                color=title_color, ha='center', va='top', family=FONT_FAMILY)
    if lines:
        n_lines = len(lines)
        avail_h = h - (4.8 if title else 2.0)
        if line_spacing is None:
            spacing = min(2.5, avail_h / max(n_lines + 0.3, 1))
        else:
            spacing = line_spacing
        
        eff_text_size = text_size
        if spacing < 1.8:
            eff_text_size = max(6.5, text_size - 1.0)
        elif spacing < 2.1:
            eff_text_size = max(7.0, text_size - 0.5)

        curr_y = y + h - (4.6 if title else 1.8)
        for line in lines:
            if line == "":
                curr_y -= spacing * 0.5
                continue
            max_chars = int(w * 2.2)
            disp_line = line
            if len(disp_line) > max_chars and not any(k in disp_line for k in ["http", "formula", "Haversine"]):
                disp_line = disp_line[:max_chars - 3] + "..."
            ax.text(x + 1.8, curr_y, disp_line, fontsize=eff_text_size, color=C_SLATE, ha='left', va='top', family=FONT_FAMILY)
            curr_y -= spacing

def draw_arrow(ax, x1, y1, x2, y2, label="", color=C_TEAL, width=1.4, label_pos=0.5, label_offset=1.8, style="->", label_side="top"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=width, shrinkA=3, shrinkB=3, mutation_scale=11))
    if label:
        dist = ((x2 - x1)**2 + (y2 - y1)**2)**0.5
        lx = x1 + (x2 - x1) * label_pos
        ly = y1 + (y2 - y1) * label_pos
        if label_side == "top":
            ly += label_offset
        elif label_side == "bottom":
            ly -= label_offset
        elif label_side == "left":
            lx -= label_offset
        elif label_side == "right":
            lx += label_offset
        
        font_s = 6.8 if dist < 10 or len(label) > 18 else 7.5
        ax.text(lx, ly, label, fontsize=font_s, fontweight='bold', color=color, ha='center', va='center', family=FONT_FAMILY,
                bbox=dict(boxstyle="round,pad=0.18", facecolor="#FFFFFF", edgecolor=color, alpha=0.95, lw=0.6))

# -------------------------------------------------------------
# 1. Overall System Architecture (Master Complete Blueprint)
# -------------------------------------------------------------
def gen_fig01():
    fig, ax = create_base_fig(13.5, 9.0, "Figure 1: MediPath AI — Complete Overall System Architecture (Production Baseline)",
                              "Comprehensive multi-tier topology: Client SPA, Express API Gateway, Model 2.0 In-Memory Engine, and Verified Registries")
    # Tier 1: Client Presentation Tier
    draw_box(ax, 3, 50, 29, 39, "TIER 1: CLIENT PRESENTATION (:8080)",
             ["• React 18.3 + TypeScript + Vite 5.4 SPA",
              "• DoctorConsultationPanel.tsx (Chat Engine)",
              "  - Progressive typewriter streaming",
              "  - Dual message streams (UI / Print)",
              "  - Unified composer (Enter & Send)",
              "• 56 Supported Diseases Direct Routing Grid",
              "  - Compact scrollable container",
              "  - Dedicated pulse-and-wave AI animation",
              "• Model Diagnostics & 'Nerd Hub' Modal",
              "  - 3-model dataset preview & CSV download",
              "  - 920-facility verified hospital explorer",
              "• ResultsView.tsx & Care Summary Printing",
              "• Multilingual Web Speech API (EN, HI, GU)",
              "• Live Firebase Auth & 3/3 Models Online Pill"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    # Tier 2: API Gateway & Controller Tier
    draw_box(ax, 35.5, 50, 29, 39, "TIER 2: API GATEWAY & CONTROLLERS (:5000)",
             ["• Node.js Express REST Server (port 5000)",
              "• Security & Hardening Middleware Chain:",
              "  - CORS Origin Allowlist (:8080, :3000)",
              "  - In-Memory IP Rate Limiter (120 req/m)",
              "  - 2,000-Character Input Payload Guard",
              "  - Request Correlation ID Logging",
              "• TriageController (/api/triage/chat)",
              "  - Canonical evidence deduplication",
              "  - 6-step clarification lifecycle orchestration",
              "• HospitalController (/api/hospitals/search)",
              "• Emergency Red-Flag Interceptor (11 rules)",
              "• Oncology Guard & Lab Screening Advisories"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    # Tier 3: Intelligent ML & Service Tier
    draw_box(ax, 68, 50, 29, 39, "TIER 3: INTELLIGENT CLINICAL SERVICES",
             ["• Model 2.0 In-Memory Inference Engine:",
              "  - 3,910 word unigram/bigram TF-IDF features",
              "  - 56 independent OvR logistic sigmoid units",
              "  - Sub-150 µs zero-Python Node.js serving",
              "  - Calibrated class thresholds tau in [0.79, 0.85]",
              "• Consultation State Machine:",
              "  - Turn 0 non-finalization guarantee",
              "  - Real-time confidence delta (+/- %)",
              "  - Differing symptom penalization formula",
              "• Multilingual Translation Gateway:",
              "  - Indic script & Romanized detectors",
              "  - Gemini 3.5-flash with 3.5s AbortController",
              "  - 100% offline dictionary (280/280 cards)",
              "• 4-Tier Hospital & Procedure Cost Engine"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)

    # Tier 4: Persistence & Verified Data Registry Tier
    draw_box(ax, 3, 6, 94, 38, "TIER 4: PERSISTENCE, VERIFIED DATA REGISTRIES & EXTERNAL PROVIDERS (ZERO-PYTHON RUNTIME)",
             ["• symptom-model_MedP_AI_V2.0.json (5 MB) : Pre-computed linear weights (W: 56x3910, b: 56), IDF vector, and vocabulary table loaded into Node.js heap",
              "• hospitals.json (501 KB) : Verified registry of 920 healthcare facilities across Tier-1, Tier-2, and Tier-3 Indian cities with specialty & procedure maps",
              "• cities-mapping.json & Fuse.js Fuzzy Index : Multi-lingual Indian city aliases (Surat, Ahmedabad, Mumbai, Bengaluru, Delhi) with geo coordinates",
              "• CONDITION_COST_PROFILES : 56 clinical condition cost benchmarks with procedural stay, diagnostic, and medication tiers adjusted for hospital grade",
              "• External Google Places API : Real-time nearby hospital discovery with local 100 calls/day quota tracker and OpenStreetMap (Overpass API) fallback",
              "• External Google Gemini 3.5-Flash : Cloud neural translation fallback with strict 3.5s timeout; falls back to local 280-symptom dictionary if unavailable",
              "• Historical Models Archive : Complete training and evaluation benchmarks for Model 1.0 (41 classes) and Model 1.5 (SGD Softmax)"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.8)

    # Inter-tier communication connectors with generous spacing
    draw_arrow(ax, 32, 73, 35.5, 73, "HTTP REST", color=C_BLUE, label_offset=2.0)
    draw_arrow(ax, 35.5, 63, 32, 63, "JSON State", color=C_BLUE, label_offset=-2.0, label_side="bottom")
    draw_arrow(ax, 64.5, 73, 68, 73, "Evaluate", color=C_TEAL, label_offset=2.0)
    draw_arrow(ax, 68, 63, 64.5, 63, "Sigmoids", color=C_PURPLE, label_offset=-2.0, label_side="bottom")
    
    draw_arrow(ax, 20, 50, 20, 44, "Load Preview Datasets", color=C_BLUE, label_offset=2.0, label_side="right")
    draw_arrow(ax, 50, 50, 50, 44, "Query 920 Hospitals & Costs", color=C_TEAL, label_offset=2.0, label_side="right")
    draw_arrow(ax, 82, 50, 82, 44, "Load In-Memory W & b (5 MB)", color=C_PURPLE, label_offset=2.0, label_side="right")

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig01_overall_architecture.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 2. System Context Diagram
# -------------------------------------------------------------
def gen_fig02():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 2: MediPath AI — System Context & External Boundary Diagram",
                              "Illustrates user interactions, core application boundary, and external medical information & cloud services")
    # Patient User
    draw_box(ax, 3, 32, 22, 36, "PATIENT / USER",
             ["• Enters clinical symptoms",
              "• Speaks in native language",
              "• Explores 56 direct diseases",
              "• Selects clarifying chips",
              "• Inspects hospital options",
              "• Reviews procedure costs",
              "• Prints clinical summary"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.8)

    # Core System Boundary
    draw_box(ax, 33, 10, 36, 78, "MEDIPATH AI CORE SYSTEM BOUNDARY",
             ["[Frontend Client Boundary :8080]",
              "• Symptom Entry & Speech Dictation",
              "• 56 Supported Diseases Direct Grid",
              "• Dynamic Multi-turn Consultation",
              "• Model Diagnostics & Nerd Hub",
              "• Authoritative Confidence Display",
              "• Interactive Hospital Discovery",
              "",
              "[Backend API Boundary :5000]",
              "• Input Normalizer & Indic Regex",
              "• In-Memory Model 2.0 Engine",
              "• 6-Step Consultation State Machine",
              "• 4-Tier Hospital Ranking Algorithm",
              "• Clinical Cost Calculator",
              "• Emergency Red-Flag Interceptor"],
             bg_color="#FFFFFF", border_color=C_NAVY, title_color=C_NAVY, radius=2.0, text_size=8.0)

    # External Entities
    draw_box(ax, 76, 68, 21, 20, "EXTERNAL LLM PROVIDER",
             ["• Google Gemini API",
              "• Model: gemini-3.5-flash",
              "• 3.5s AbortController timeout",
              "• Symptom normalization",
              "• Offline dictionary fallback"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)

    draw_box(ax, 76, 39, 21, 20, "EXTERNAL MAPS & PLACES",
             ["• Google Places API",
              "• 100 calls/day tracker",
              "• OpenStreetMap fallback",
              "• Live hospital discovery",
              "• Offline fallback if quota hit"],
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.5)

    draw_box(ax, 76, 10, 21, 20, "LOCAL HOSPITAL REGISTRY",
             ["• 920 Verified Facilities",
              "• NABH accreditation status",
              "• Tier & bed capacities",
              "• City & state coverage",
              "• Zero external network call"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    # Connections with ample gaps
    draw_arrow(ax, 25, 54, 33, 54, "Symptoms / Speech", color=C_BLUE, label_offset=2.0)
    draw_arrow(ax, 33, 44, 25, 44, "Triage / Results", color=C_BLUE, label_offset=-2.0, label_side="bottom")
    draw_arrow(ax, 69, 78, 76, 78, "Translation Fallback", color=C_PURPLE, label_offset=2.0)
    draw_arrow(ax, 69, 49, 76, 49, "Live Geo Search", color=C_AMBER, label_offset=2.0)
    draw_arrow(ax, 69, 20, 76, 20, "Offline 920 Registry", color=C_EMERALD, label_offset=2.0)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig02_system_context.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 3. Frontend Component Architecture
# -------------------------------------------------------------
def gen_fig03():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 3: MediPath AI — Frontend Component Architecture",
                              "React 18 component hierarchy, modal flows, and progressive assistant rendering components")
    # Top Level
    draw_box(ax, 36, 78, 28, 11, "App.tsx / Index.tsx",
             ["• Root State & Multi-stage Router",
              "• Stage: home | consultation | results",
              "• Header Telemetry & Status Badges"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE)

    # Level 2
    draw_box(ax, 3, 40, 29, 28, "HOME & DIRECT ROUTING",
             ["• Header.tsx (Language & Telemetry)",
              "• SearchBar.tsx (Voice & Input)",
              "• SupportedDiseasesSection.tsx",
              "  - 56-disease scrollable grid",
              "  - Direct routing bypass",
              "• ThinkingState.tsx (AI pulse animation)",
              "• LocationFilter.tsx (GPS / City)",
              "• NerdHubDialog.tsx (Diagnostics)"],
             bg_color=C_CARD_BG, border_color=C_BORDER, title_color=C_NAVY, text_size=7.5)

    draw_box(ax, 35.5, 40, 29, 28, "DoctorConsultationPanel.tsx",
             ["• Turn-based Clinical Chat Stream",
              "• Unified Composer (Enter & Send)",
              "• ProgressiveAssistantMessage.tsx",
              "• AssistantTypingIndicator.tsx",
              "• ModelConfidenceBar.tsx",
              "• InformationUsedPanel.tsx",
              "• ConsultationPrintSummary.tsx"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    draw_box(ax, 68, 40, 29, 28, "ResultsView.tsx",
             ["• ConfidenceMeter.tsx (Real score)",
              "• HospitalCard.tsx (List & Badges)",
              "• FilterPanel.tsx (Tiers & Radius)",
              "• CostBreakdown.tsx (Estimates)",
              "• HospitalDetailsDialog.tsx",
              "• HospitalComparisonDialog.tsx",
              "• Speech Narration Controller"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)

    # Shared Services / State
    draw_box(ax, 10, 6, 80, 25, "SHARED HOOKS, CONTEXTS & SERVICES",
             ["• hospitalService.ts : evaluateDoctorTriageV2(), findHospitals(), getModelStatus()",
              "• i18n.ts : English, Hindi, Gujarati translation strings, condition & specialization localizers (280/280 chips)",
              "• useSpeechRecognition.ts : Web Speech API integration with Indian English, Hindi, and Gujarati locales",
              "• useProgressiveText.ts : Fluid progressive typewriter animation engine respecting prefers-reduced-motion",
              "• AuthContext.tsx : Firebase Authentication context for user sign-in and session state"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.8)

    # Connections with generous 10-unit vertical drop
    draw_arrow(ax, 38, 78, 18, 68, "Search / Direct Click", color=C_BLUE, label_offset=2.0)
    draw_arrow(ax, 50, 78, 50, 68, "Start Consultation", color=C_TEAL, label_offset=2.0)
    draw_arrow(ax, 62, 78, 82, 68, "Diagnosis Ready", color=C_PURPLE, label_offset=2.0)
    draw_arrow(ax, 50, 40, 50, 31, "Shared Services Binding", color=C_EMERALD, label_offset=2.0, label_side="right")

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig03_frontend_component_architecture.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 4. Backend Component Architecture
# -------------------------------------------------------------
def gen_fig04():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 4: MediPath AI — Backend Component & Routing Architecture",
                              "Express.js structure, middleware chain, triage controllers, model inference and external providers")
    # Server Entry
    draw_box(ax, 36, 78, 28, 11, "server.js (HTTP Server :5000)",
             ["• Express Application Bootstrap",
              "• Routes registration & health probes"],
             bg_color=C_NAVY, border_color=C_NAVY, title_color='#FFFFFF')

    # Middleware
    draw_box(ax, 3, 40, 28, 28, "SECURITY & GUARDS",
             ["• cors.js (Frontend origin allowlist)",
              "• 2,000-char input payload limit",
              "• Rate Limiter: 120 req/min/IP",
              "• Emergency regex bypass rule",
              "• errorHandler.js (Safe JSON errors)",
              "• Correlation ID Logger"],
             bg_color=C_ROSE_LIGHT, border_color=C_ROSE, title_color=C_ROSE, text_size=7.5)

    # Routes & Controllers
    draw_box(ax, 35.5, 40, 29, 28, "ROUTES & CONTROLLERS",
             ["• /api/triage/chat -> triageController",
              "• /api/triage/translate -> translation",
              "• /api/hospitals/search -> hospitalController",
              "• /api/model/health -> symptomModel",
              "• /api/health -> Health probe",
              "• Canonical evidence merging",
              "• Differing symptom penalty formula"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    # Models & Services
    draw_box(ax, 68, 40, 29, 28, "MODELS & SERVICES",
             ["• symptomModel.js :",
              "  - evaluateDoctorClarity()",
              "  - predictConditions()",
              "• translationService.js :",
              "  - Script & Romanized detectors",
              "  - 280/280 offline dictionary map",
              "• geminiProvider.js (3.5s timeout)",
              "• hospitalProvider.js (Geo search)"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    # In-memory artifact
    draw_box(ax, 10, 6, 80, 25, "ZERO-PYTHON IN-MEMORY INFERENCE ENGINE (symptomModel.js)",
             ["• JSON Model Loading : symptom-model_MedP_AI_V2.0.json cached in Node.js heap (<150µs execution)",
              "• Text Normalizer : NFKD unicode decomposition + 45 Indian/clinical medical synonym mappings",
              "• TF-IDF Vectorizer : Matches n-gram tokens against 3,910 learned vocabulary features",
              "• Linear Sigmoid Dot Product : Computes zk = Wk·x + bk and Pk = 1/(1+e^-zk) for all 56 classes",
              "• Bit-level Python-Node Parity : Maximum probability divergence <= 3.88e-16 across 6,552 comparisons"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.8)

    # Arrows with generous vertical clearance
    draw_arrow(ax, 36, 81, 17, 68, "Middleware", color=C_ROSE, label_offset=2.0)
    draw_arrow(ax, 50, 78, 50, 68, "Dispatch", color=C_BLUE, label_offset=2.0)
    draw_arrow(ax, 64.5, 54, 68, 54, "Execute", color=C_TEAL, label_offset=2.0)
    draw_arrow(ax, 82, 40, 65, 31, "In-Memory Predict", color=C_PURPLE, label_offset=2.0)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig04_backend_component_architecture.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 5. Deployment Architecture
# -------------------------------------------------------------
def gen_fig05():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 5: MediPath AI — Runtime Deployment & Hosting Architecture",
                              "Local dual-server execution topology, port bindings, environment isolation and zero-database architecture")
    # Outer Machine
    draw_box(ax, 3, 6, 94, 83, "HOST / DEVELOPER MACHINE RUNTIME ENVIRONMENT",
             [""], bg_color="#FFFFFF", border_color=C_NAVY, title_color=C_NAVY, radius=2.0)

    # Launcher
    draw_box(ax, 8, 71, 84, 14, "ONE-CLICK SYSTEM LAUNCHER (start-project.bat)",
             ["• Verifies Node.js (>= v18) & npm in PATH  • Copies .env.example templates if missing",
              "• Auto-installs missing dependencies  • Launches backend (:5000) & frontend (:8080) in separate terminals"],
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER)

    # Process 1: Frontend
    draw_box(ax, 8, 14, 38, 50, "FRONTEND PROCESS (:8080)",
             ["[Runtime: Node.js / Vite Dev Server]",
              "• Path: frontend/healthpath-ai-main",
              "• Command: npm run dev",
              "• Framework: React 18 SPA",
              "• Port: http://localhost:8080",
              "",
              "[Build Output: dist/]",
              "• Vite production bundle (7.98s)",
              "• Zero TypeScript compiler errors",
              "• Static assets & CSS bundle"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE)

    # Process 2: Backend
    draw_box(ax, 54, 14, 38, 50, "BACKEND PROCESS (:5000)",
             ["[Runtime: Node.js v18+ / v20+ / v22+]",
              "• Path: backend/",
              "• Command: node server.js",
              "• Framework: Express.js REST API",
              "• Port: http://localhost:5000",
              "",
              "[Engine: Zero-Python Node.js]",
              "• Loads Model 2.0 JSON in memory",
              "• Loads 920 Hospitals JSON in memory",
              "• Zero external database dependency",
              "• Ephemeral client-side session state"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL)

    # Inter-process communication: Clean single bidirectional arrow with ample clearance
    draw_arrow(ax, 46, 42, 54, 42, "HTTP REST API (CORS :8080 -> :5000) / JSON Responses (<150µs)", 
               color=C_NAVY, width=2.0, style="<->", label_offset=2.5)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig05_deployment_architecture.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 6. Complete User Journey Flow
# -------------------------------------------------------------
def gen_fig06():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 6: MediPath AI — Complete End-to-End User Journey",
                              "Step-by-step traversal from initial multilingual symptom entry to doctor consultation, hospital ranking, and care summary")
    steps = [
        ("1. LAND ON HOME", 
         ["• Select interface language (EN / HI / GU)",
          "• Set patient location or GPS auto-detect",
          "• Explore 56-disease direct condition grid",
          "• View real-time Firebase & model telemetry",
          "• Click 'Explore Diseases' or enter text"], C_BLUE_LIGHT, C_BLUE),
        ("2. ENTER SYMPTOMS", 
         ["• Type sensations in natural free-text",
          "• Or speak via Web Speech API microphone",
          "• Full support for Indic & Romanized input",
          "• Client normalizes and validates payload",
          "• Dispatches initial query to /api/triage/chat"], C_BLUE_LIGHT, C_BLUE),
        ("3. DOCTOR CONSULTATION", 
         ["• Mandatory Turn 0: never finalizes immediately",
          "• Model 2.0 evaluates 56 sigmoid probabilities",
          "• Renders initial baseline confidence progress",
          "• Displays active candidate differential diseases",
          "• Presents discriminative doctor question & chips"], C_TEAL_LIGHT, C_TEAL),
        ("4. ANSWER FOLLOW-UP", 
         ["• Patient selects option chips or types details",
          "• Evidence accumulates: all prior symptoms kept",
          "• Real-time confidence delta (+X% / -Y%) shown",
          "• Differing symptom penalty formula applied",
          "• Candidates eliminate iteratively until 1 remains"], C_TEAL_LIGHT, C_TEAL),
        ("5. VIEW ASSESSMENT", 
         ["• Conclusive assessment card renders smoothly",
          "• Top candidate condition & ICD-10 code",
          "• Authoritative real confidence score displayed",
          "• Summary of confirmed & ruled-out evidence",
          "• Immediate unlock to hospital recommendations"], C_EMERALD_LIGHT, C_EMERALD),
        ("6. HOSPITAL SEARCH", 
         ["• Queries 920 verified hospital registry",
          "• Matches clinical specialty and procedures",
          "• Sorts by 4-tier match score & Haversine km",
          "• Displays live Google ratings & NABH badges",
          "• Interactive filters for distance, tier, emergency"], C_PURPLE_LIGHT, C_PURPLE),
        ("7. COST & PRINT", 
         ["• Sourced from 56-condition cost profiles",
          "• Tier multipliers: Budget, Mid-tier, Corporate",
          "• Multi-page printable care summary export",
          "• Non-diagnostic disclaimer & safety notice",
          "• Option to re-consult or explore more symptoms"], C_AMBER_LIGHT, C_AMBER)
    ]
    # Row 1 (Steps 1 to 4)
    for i, (title, lines, bg, col) in enumerate(steps[:4]):
        x = 3 + i * 24.5
        draw_box(ax, x, 55, 21.5, 30, title, lines, bg_color=bg, border_color=col, title_color=col, text_size=7.4)
        if i < 3:
            draw_arrow(ax, x + 21.5, 70, x + 24.5, 70, color=col, width=1.5)

    # Turn arrow down
    draw_arrow(ax, 87.25, 55, 87.25, 42, color=C_TEAL, width=1.5)

    # Row 2 (Steps 5 to 7)
    for j, (title, lines, bg, col) in enumerate(steps[4:]):
        x = 76.5 - j * 24.5
        draw_box(ax, x, 12, 21.5, 30, title, lines, bg_color=bg, border_color=col, title_color=col, text_size=7.4)
        if j < 2:
            draw_arrow(ax, x, 27, x - 3, 27, color=col, width=1.5)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig06_user_journey.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 7. Symptom Translation and Inference Sequence
# -------------------------------------------------------------
def gen_fig07():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 7: Multilingual Symptom Translation & Model 2.0 Inference Sequence",
                              "Bidirectional language pipeline preserving patient vernacular while evaluating canonical English clinical representations")
    actors = [("Patient User", 10), ("Frontend (React)", 34), ("Translation Gateway", 58), ("Model 2.0 Engine", 82)]
    for name, x in actors:
        ax.plot([x, x], [10, 84], color=C_BORDER, linestyle='--', lw=1.2)
        ax.text(x, 86, name, fontsize=9.5, fontweight='bold', color=C_NAVY, ha='center', va='bottom', family=FONT_FAMILY,
                bbox=dict(boxstyle="round,pad=0.35", facecolor=C_BLUE_LIGHT, edgecolor=C_BLUE, lw=1))

    # Sequence steps with generous vertical spacing and centered internal loops
    y_steps = [
        (80, 10, 34, "1. Enters Hindi/Gujarati/Romanized symptoms", C_NAVY),
        (72, 34, 58, "2. Detects Script/Romanized & calls translate", C_BLUE),
        (64, 58, 58, "3. Normalizes & translates to Canonical English", C_PURPLE),
        (56, 58, 82, "4. Passes Canonical English symptoms", C_TEAL),
        (48, 82, 82, "5. Computes Sigmoid probabilities for 56 classes", C_EMERALD),
        (40, 82, 58, "6. Returns assessment, questions & options (EN)", C_TEAL),
        (32, 58, 34, "7. Translates output to user conversation language", C_PURPLE),
        (24, 34, 10, "8. Renders localized chips with canonical tags", C_BLUE),
        (16, 10, 34, "9. User clicks localized chip (submits canonical text)", C_NAVY)
    ]
    for y, x1, x2, label, col in y_steps:
        if x1 == x2:
            # Internal self-loop on lifeline
            if x1 == 58:
                # Curves rightward into corridor towards lifeline 82
                ax.annotate("", xy=(x1, y - 1.8), xytext=(x1, y + 1.8),
                            arrowprops=dict(arrowstyle="->", color=col, lw=1.3,
                                            connectionstyle="arc3,rad=-0.8"))
                ax.text(x1 + 3.5, y, label, fontsize=7.6, color=col, family=FONT_FAMILY, fontweight='bold',
                        va='center', ha='left', bbox=dict(boxstyle="round,pad=0.22", facecolor="#FFFFFF", edgecolor=col, alpha=0.95))
            else:
                # Curves leftward into corridor towards lifeline 58 (zero off-canvas drift)
                ax.annotate("", xy=(x1, y - 1.8), xytext=(x1, y + 1.8),
                            arrowprops=dict(arrowstyle="->", color=col, lw=1.3,
                                            connectionstyle="arc3,rad=0.8"))
                ax.text(x1 - 3.5, y, label, fontsize=7.6, color=col, family=FONT_FAMILY, fontweight='bold',
                        va='center', ha='right', bbox=dict(boxstyle="round,pad=0.22", facecolor="#FFFFFF", edgecolor=col, alpha=0.95))
        else:
            draw_arrow(ax, x1, y, x2, y, label, color=col, width=1.3, label_offset=1.6)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig07_multilingual_translation_sequence.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 8. Model 2.0 Preprocessing & Inference Pipeline
# -------------------------------------------------------------
def gen_fig08():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 8: Model 2.0 (MedP_AI_V2.0) — Preprocessing & Inference Pipeline",
                              "Mathematical progression from raw clinical text to 3,910-feature TF-IDF projection, linear dot products and independent sigmoids")
    stages_top = [
        ("1. RAW SYMPTOM INPUT", 
         ["• Free-text clinical symptoms from chat",
          "• Accumulated multi-turn evidence string",
          "• Handles colloquial & informal expressions",
          "• e.g. 'watery, itchy eyes, puffy lids'",
          "• Preserves negation & severity tokens"], 3, 52),
        ("2. TEXT NORMALIZATION", 
         ["• Unicode NFKD canonical decomposition",
          "• Lowercase conversion & punctuation strip",
          "• 45+ Indian medical synonym expansions",
          "• 'chhati me dard' -> 'chest pain'",
          "• Eliminates chat conversational noise"], 27.5, 52),
        ("3. N-GRAM TOKENIZATION", 
         ["• Word unigrams & bigrams extraction",
          "• Filters stop words & non-clinical tokens",
          "• Extracts clinical compound phrases",
          "• Tokens: ['watery', 'itchy', 'eyes', 'puffy']",
          "• Excludes control signals ('no more')"], 52, 52),
        ("4. TF-IDF PROJECTION", 
         ["• Maps tokens to 3,910 learned features",
          "• Sublinear TF scaling: 1 + log(tf)",
          "• Smooth IDF weighting from training",
          "• L2 Euclidean normalization: ||x||_2 = 1.0",
          "• Sparse float64 vector generation"], 76.5, 52),
    ]
    for title, lines, x, y in stages_top:
        draw_box(ax, x, y, 21.5, 35, title, lines, bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.4)
        if x < 76.5:
            draw_arrow(ax, x + 21.5, y + 17.5, x + 24.5, y + 17.5, color=C_BLUE, width=1.5)

    # Snake arrow down from Stage 4 to Stage 5
    draw_arrow(ax, 87.25, 52, 87.25, 45, color=C_TEAL, width=1.5)

    stages_bottom = [
        ("5. LINEAR DOT PRODUCT", 
         ["• Precomputed weight matrix W (56 x 3,910)",
          "• Class intercept bias vector b (56)",
          "• Closed-form dot product zk = Wk · x + bk",
          "• Sub-150 µs native Node.js execution",
          "• Bit-level parity: delta < 1e-15 vs Python"], 73, 10),
        ("6. INDEPENDENT SIGMOID", 
         ["• Logistic activation: Pk = 1 / (1 + e^-zk)",
          "• 56 One-vs-Rest independent outputs",
          "• Eliminates softmax zero-sum competition",
          "• Supports multi-morbidity & comorbidities",
          "• Prevents squashing of low-prior diseases"], 41, 10),
        ("7. THRESHOLD & RANKING", 
         ["• Class-calibrated decision thresholds tau_k",
          "• Ambiguity ratio: P(top) / P(runner-up) > 1.1",
          "• Differing symptom penalty verification",
          "• Sets status: possible_cause_ready",
          "• Unlocks ICD-10 code & hospital routing"], 9, 10),
    ]
    for title, lines, x, y in stages_bottom:
        draw_box(ax, x, y, 24, 35, title, lines, bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.4)

    # Left-pointing snake arrows across bottom row
    draw_arrow(ax, 73, 27.5, 65, 27.5, color=C_TEAL, width=1.5)
    draw_arrow(ax, 41, 27.5, 33, 27.5, color=C_TEAL, width=1.5)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig08_model_preprocessing_inference.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 9. Model 2.0 Training Pipeline
# -------------------------------------------------------------
def gen_fig09():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 9: Model 2.0 (MedP_AI_V2.0) — Offline Training & Evaluation Pipeline",
                              "Reproducible pipeline: data curation, signature group stratification, benchmark selection, and serving parity")
    steps_top = [
        ("1. RAW DATASET", 
         ["• 157,036 doctor-patient encounter rows",
          "• Datasets/symptom-based-disease-v2.xlsx",
          "• SHA-256 integrity hash verification",
          "• Primary care encounters across India",
          "• Contains raw free-text symptom dialogues"], 3, 52),
        ("2. CURATION & SCOPE", 
         ["• Strict 56 canonical primary-care classes",
          "• Drop out-of-scope conditions (52,745 rows)",
          "• Retain 104,291 clean encounters (66.4%)",
          "• Audit 113,003 mapped symptom tokens",
          "• Standardize to official ICD-10 taxonomy"], 27.5, 52),
        ("3. GROUP STRATIFICATION", 
         ["• 101,137 unique symptom combination groups",
          "• StratifiedGroupKFold on symptom hash",
          "• Train: 72,741 rows (70,088 unique groups)",
          "• Val: 15,786 rows | Test: 15,764 rows",
          "• 0% symptom signature leakage guaranteed"], 52, 52),
        ("4. BENCHMARK SELECTION", 
         ["• Benchmarked 4 OvR algorithms:",
          "  - LinearSVC (OvR): Macro F1 0.676",
          "  - LogisticRegression: Macro F1 0.623 (Selected)",
          "  - Multinomial NB: Macro F1 0.542",
          "  - Random Forest: Macro F1 0.491",
          "• Logistic chosen for smooth probabilities"], 76.5, 52)
    ]
    for title, lines, x, y in steps_top:
        draw_box(ax, x, y, 21.5, 35, title, lines, bg_color=C_CARD_BG, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.4)
        if x < 76.5:
            draw_arrow(ax, x + 21.5, y + 17.5, x + 24.5, y + 17.5, color=C_PURPLE, width=1.5)

    # Snake arrow down from Step 4 to Step 5
    draw_arrow(ax, 87.25, 52, 87.25, 45, color=C_EMERALD, width=1.5)

    steps_bottom = [
        ("5. THRESHOLD TUNING", 
         ["• Grid search on validation set (N=15,786)",
          "• Class-specific thresholds tau_k in [0.15, 0.85]",
          "• Optimization objective: F-beta with beta=0.5",
          "• Mean optimal threshold: 0.85 across classes",
          "• Maximizes clinical precision over recall"], 73, 10),
        ("6. FINAL TEST EVALUATION", 
         ["• Evaluated on untouched test set (N=15,764)",
          "• Micro F1: 0.7837 | Macro F1: 0.7199",
          "• Top-1 Hit Rate: 88.2%",
          "• Top-3 Hit: 99.03% | Top-5 Hit: 99.80%",
          "• Verified zero overfit on test split"], 41, 10),
        ("7. SERVING PARITY EXPORT", 
         ["• Export JSON weight matrix (5.08 MB)",
          "• Matrix W (56 x 3,910), bias b (56), IDF",
          "• Direct Node.js float64 in-memory load",
          "• Parity check: max delta <= 3.88e-16",
          "• Zero Python dependency at runtime"], 9, 10)
    ]
    for title, lines, x, y in steps_bottom:
        draw_box(ax, x, y, 24, 35, title, lines, bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.4)

    # Left-pointing snake arrows across bottom row
    draw_arrow(ax, 73, 27.5, 65, 27.5, color=C_EMERALD, width=1.5)
    draw_arrow(ax, 41, 27.5, 33, 27.5, color=C_EMERALD, width=1.5)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig09_model_training_pipeline.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 10. Consultation State Machine
# -------------------------------------------------------------
def gen_fig10():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 10: MediPath AI — Consultation State Machine & Decision States",
                              "Formal state machine showing mandatory initial follow-up, evidence thresholds, emergency overrides, and dynamic recovery")
    # States
    draw_box(ax, 37, 76, 26, 12, "INITIAL_INPUT", ["Patient submits symptom", "Script & Romanized check"], bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE)
    draw_box(ax, 3, 46, 27, 20, "EMERGENCY_OVERRIDE", ["Immediate red-flag rule", "Bypasses all follow-ups", "Confidence: null", "Prompt hospital guidance"], bg_color=C_ROSE_LIGHT, border_color=C_ROSE, title_color=C_ROSE, text_size=7.5)
    draw_box(ax, 36.5, 46, 27, 20, "NEEDS_MANDATORY_FOLLOWUP", ["Turn 0 guarantee: never finalize", "Model probability up to 99%", "Presents discriminative question", "Generates option chips"], bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.5)
    draw_box(ax, 70, 46, 27, 20, "NEEDS_MORE_INFORMATION", ["Turn 1 to 3 active inquiry", "Deduplicates prior questions", "Max 4 turns defensive bound", "Accumulates new evidence"], bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)
    
    # Bottom states with wide corridor between them
    draw_box(ax, 14, 10, 29, 26, "POSSIBLE_CAUSE_READY", ["Evidence meets threshold tau_k", "No ambiguity against competitors", "Displays authoritative score", "Unlocks hospital navigation"], bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)
    draw_box(ax, 57, 10, 29, 26, "SAFE_DEFERRAL", ["Insufficient / vague symptoms", "Failed decision threshold", "Score unavailable (Safe Deferral)", "Recoverable upon new symptoms"], bg_color=C_LIGHT_BG, border_color=C_SLATE, title_color=C_SLATE, text_size=7.5)

    # Transitions with generous clearance
    draw_arrow(ax, 37, 80, 18, 66, "Emergency Red Flag", color=C_ROSE, label_offset=2.0)
    draw_arrow(ax, 50, 76, 50, 66, "Turn 0 Symptoms", color=C_AMBER, label_offset=2.0)
    draw_arrow(ax, 63.5, 56, 70, 56, "Uncertain", color=C_PURPLE, label_offset=2.0)
    draw_arrow(ax, 43, 46, 28, 36, "Threshold Met", color=C_EMERALD, label_offset=2.0)
    draw_arrow(ax, 57, 46, 70, 36, "'No more' & low conf", color=C_SLATE, label_offset=2.0)
    draw_arrow(ax, 82, 46, 75, 36, "Max turns", color=C_SLATE, label_offset=2.0)
    draw_arrow(ax, 57, 23, 43, 23, "New Symptoms (Recovery)", color=C_EMERALD, width=1.8, label_offset=2.0)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig10_consultation_state_machine.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 11. Follow-up Evidence Accumulation Sequence
# -------------------------------------------------------------
def gen_fig11():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 11: Follow-Up Consultation Evidence Accumulation Sequence",
                              "Multi-turn data flow showing preservation of initial query, appending clinical evidence, and deduplicating control signals")
    # Turn 0
    draw_box(ax, 3, 54, 29, 32, "TURN 0: INITIAL SUBMISSION",
             ["• Patient input: 'watery, itchy eyes'",
              "• InitialSymptoms stored",
              "• Model 2.0: Allergic Conjunctivitis 95%",
              "• MANDATORY RULE: Turn 0 cannot finalize",
              "• Counter-question: 'Any swelling or pain?'",
              "• Options: ['Puffy eyelids', 'No more']"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    # Turn 1
    draw_box(ax, 35.5, 54, 29, 32, "TURN 1: EVIDENCE ADDITION",
             ["• Patient clicks: 'Puffy eyelids'",
              "• Appended to AdditionalSymptoms",
              "• ConfirmedSymptoms: {'puffy eyelids'}",
              "• RejectedSymptoms: None",
              "• CanonicalEvidence: 'watery, itchy eyes",
              "  puffy eyelids'",
              "• Model 2.0 evaluates combined string"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    # Turn 2
    draw_box(ax, 68, 54, 29, 32, "TURN 2: EVIDENCE FINALIZATION",
             ["• Threshold test: 98% >= tau (0.83)",
              "• Lead ratio: 98% / 12% = 8.1 (> 1.1)",
              "• Medical terms matched: 2",
              "• STATUS: possible_cause_ready",
              "• Top condition: Allergic Conjunctivitis",
              "• Real confidence: 98% passed verbatim"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    # Turn 3: Continuous Conversation
    draw_box(ax, 10, 8, 80, 34, "POST-ASSESSMENT CONTINUOUS CONSULTATION LIFECYCLE",
             ["• The patient is NOT locked out after assessment card is displayed",
              "• Patient submits additional forgotten symptom: 'Also feeling severe eye pain'",
              "• Evidence accumulation preserves entire prior history (watery, itchy eyes, puffy eyelids)",
              "• Dynamic re-inference executes: Model 2.0 updates probability distribution across all 56 classes",
              "• If evidence shifts (e.g. pain suggests Corneal Abrasion or Acute Glaucoma referral), card updates smoothly",
              "• Assessment state tracks askedQuestions and previouslyPresentedOptions to prevent repeated questions",
              "• Unified composer handles both Enter key and Send button identically without duplicated submissions"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.8)

    draw_arrow(ax, 32, 70, 35.5, 70, "User Input", color=C_TEAL, label_offset=2.0)
    draw_arrow(ax, 64.5, 70, 68, 70, "Re-Evaluate", color=C_EMERALD, label_offset=2.0)
    draw_arrow(ax, 82.5, 54, 82.5, 42, "Continuous Conversation", color=C_PURPLE, label_offset=2.0, label_side="right")

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig11_evidence_accumulation_sequence.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 12. Confidence and Assessment Decision Flow
# -------------------------------------------------------------
def gen_fig12():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 12: Authoritative Confidence & Assessment Decision Flow",
                              "Deterministic decision logic distinguishing raw classifier probabilities, class thresholds, and display scores")
    # Top box
    draw_box(ax, 36, 76, 28, 12, "INPUT CLINICAL TEXT", ["Canonical English evidence", "Token match check"], bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE)

    # Decision tier
    draw_box(ax, 3, 48, 28, 18, "SAFETY OVERRIDES", ["1. Emergency red flags?", "2. Cancer/tumor terms?", "3. Lab screening only?"], bg_color=C_ROSE_LIGHT, border_color=C_ROSE, title_color=C_ROSE, text_size=7.5)
    draw_box(ax, 36, 48, 28, 18, "MODEL 2.0 SIGMOID", ["Compute Pk for 56 classes", "P1 (top), P2 (runner-up)", "Threshold tau_k in [0.79, 0.85]"], bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)
    draw_box(ax, 69, 48, 28, 18, "TURN & CONTROL CHECK", ["Is Turn 0? -> Must ask", "Selected 'No more'? -> Evaluate", "Ambiguity: P1-P2 < 0.05?"], bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.5)

    # Outcomes
    draw_box(ax, 3, 10, 28, 28, "SAFETY GUIDANCE", ["• Status: emergency_override", "• Confidence: null", "• Immediate ER routing", "• Emergency 112/108 alert"], bg_color=C_ROSE_LIGHT, border_color=C_ROSE, title_color=C_ROSE, text_size=7.5)
    draw_box(ax, 36, 10, 28, 28, "AUTHORITATIVE CAUSE", ["• Status: possible_cause_ready", "• Real Score: Math.round(P1*100)", "• Confidence passed verbatim", "• Unlocks Hospital Recommendations"], bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)
    draw_box(ax, 69, 10, 28, 28, "SAFE DEFERRAL", ["• Status: safe_defer", "• Confidence: null", "• Rendered: 'Score unavailable'", "• General Medicine referral"], bg_color=C_LIGHT_BG, border_color=C_SLATE, title_color=C_SLATE, text_size=7.5)

    draw_arrow(ax, 36, 82, 17, 66, "Safety Rules", color=C_ROSE, label_offset=2.0)
    draw_arrow(ax, 50, 76, 50, 66, "Standard Triage", color=C_TEAL, label_offset=2.0)
    draw_arrow(ax, 64, 57, 69, 57, "Probabilities", color=C_AMBER, label_offset=2.0)
    draw_arrow(ax, 17, 48, 17, 38, "Triggered", color=C_ROSE, label_offset=2.0)
    draw_arrow(ax, 50, 48, 50, 38, "Threshold Passed", color=C_EMERALD, label_offset=2.0)
    draw_arrow(ax, 83, 48, 83, 38, "Threshold Failed / Vague", color=C_SLATE, label_offset=2.0)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig12_confidence_decision_flow.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 13. Safe-Deferral Recovery Flow
# -------------------------------------------------------------
def gen_fig13():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 13: Recoverable Safe-Deferral & Dynamic Re-Evaluation Flow",
                              "Proves that clinical safe deferrals are non-terminal and dynamically recover when distinctive evidence is introduced")
    draw_box(ax, 3, 54, 29, 32, "STEP 1: INSUFFICIENT INPUT",
             ["• Patient inputs vague symptom: 'pain'",
              "• System asks for location & severity",
              "• Patient responds: 'No more symptoms'",
              "• Model 2.0 evaluation: Fails threshold tau_k",
              "• STATUS: safe_defer",
              "• CONFIDENCE: null (Score unavailable)",
              "• Honest clinical report (zero fake 80%)"],
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.5)

    draw_box(ax, 35.5, 54, 29, 32, "STEP 2: NEW DISTINCTIVE EVIDENCE",
             ["• Consultation remains ACTIVE in chat",
              "• Patient adds forgotten detail:",
              "  'Severe throbbing right temple pain,",
              "   light sensitivity and nausea'",
              "• System detects clinical evidence",
              "• Un-rejects related symptoms",
              "• Appends new terms to canonical string"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    draw_box(ax, 68, 54, 29, 32, "STEP 3: DYNAMIC RECOVERY",
             ["• Fresh inference through Model 2.0",
              "• Vector reflects temple pain & nausea",
              "• Migraine probability: 99.4%",
              "• Class threshold (0.85) MET",
              "• STATUS: possible_cause_ready",
              "• CONFIDENCE: 99% displayed genuine",
              "• Seamless recovery without reset"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    # Summary box
    draw_box(ax, 10, 8, 80, 34, "KEY ARCHITECTURAL GUARANTEES IN RECOVERY LIFECYCLE",
             ["• 100% History Preservation: Previous user inputs and assistant assessments remain intact in the chat stream.",
              "• Authoritative Score Handoff: The recovered genuine score (e.g. 99%) transfers verbatim to the Hospital Page.",
              "• Defensive Bound: Persistent vague inputs respect MAX_FOLLOWUP_TURNS = 4 before concluding with safe referral.",
              "• Zero Artificial Inflation: Safe deferrals strictly show 'Score unavailable' with null confidence, avoiding synthetic scores.",
              "• Seamless Continuity: Patients can re-open assessment at any time by entering newly recalled symptoms."],
             bg_color=C_CARD_BG, border_color=C_NAVY, title_color=C_NAVY, text_size=7.8)

    draw_arrow(ax, 32, 70, 35.5, 70, "Patient adds detail", color=C_BLUE, label_offset=2.0)
    draw_arrow(ax, 64.5, 70, 68, 70, "Re-inference", color=C_EMERALD, label_offset=2.0)
    draw_arrow(ax, 82.5, 54, 82.5, 42, "Handoff to Care Report", color=C_PURPLE, label_offset=2.0, label_side="right")

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig13_safe_deferral_recovery_flow.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 14. Hospital Recommendation Sequence
# -------------------------------------------------------------
def gen_fig14():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 14: Hospital Discovery, Recommendation & Handoff Sequence",
                              "Handoff from consultation completion to hospital registry filtering, tier matching, and distance calculation")
    actors = [("ResultsView.tsx", 14), ("hospitalService.ts", 38), ("hospitalController.js", 63), ("920 Hospitals JSON", 88)]
    for name, x in actors:
        ax.plot([x, x], [10, 84], color=C_BORDER, linestyle='--', lw=1.2)
        ax.text(x, 86, name, fontsize=9.5, fontweight='bold', color=C_NAVY, ha='center', va='bottom', family=FONT_FAMILY,
                bbox=dict(boxstyle="round,pad=0.3", facecolor=C_LIGHT_BG, edgecolor=C_NAVY, lw=1))

    y_steps = [
        (80, 14, 38, "1. onDiagnosisConfirmed(condition, allSymptoms)", C_NAVY),
        (72, 38, 63, "2. POST /api/hospitals/search with filters & geo", C_BLUE),
        (64, 63, 88, "3. Query 920 facilities by City / State / Radius", C_TEAL),
        (56, 88, 63, "4. Return raw facilities within geographic scope", C_TEAL),
        (48, 63, 63, "5. Apply 4-Tier Match Score & Haversine distance", C_PURPLE),
        (40, 63, 63, "6. Calculate cost range using CONDITION_COST_PROFILES", C_AMBER),
        (32, 63, 38, "7. Return EnrichedHospital[] + authoritative confidence", C_EMERALD),
        (24, 38, 14, "8. Render ranked hospital cards & cost breakdown", C_BLUE),
        (16, 14, 14, "9. User inspects facilities or clicks Re-consult AI", C_NAVY)
    ]
    for y, x1, x2, label, col in y_steps:
        if x1 == x2:
            # Internal self-loop on lifeline curving rightward into wide corridor
            ax.annotate("", xy=(x1, y - 1.8), xytext=(x1, y + 1.8),
                        arrowprops=dict(arrowstyle="->", color=col, lw=1.3,
                                        connectionstyle="arc3,rad=-0.8"))
            ax.text(x1 + 3.5, y, label, fontsize=7.6, color=col, family=FONT_FAMILY, fontweight='bold',
                    va='center', ha='left', bbox=dict(boxstyle="round,pad=0.22", facecolor="#FFFFFF", edgecolor=col, alpha=0.95))
        else:
            draw_arrow(ax, x1, y, x2, y, label, color=col, width=1.3, label_offset=1.6)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig14_hospital_recommendation_sequence.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 15. Hospital Ranking Flow
# -------------------------------------------------------------
def gen_fig15():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 15: Hospital Recommendation 4-Tier Matching & Ranking Formula",
                              "Detailed scoring model combining clinical tier matches, procedure relevance, Google ratings, and accreditation")
    draw_box(ax, 3, 50, 29, 38, "MATCH TIER CLASSIFICATION",
             ["• Tier 1: Primary Specialist Match",
              "  (e.g. Urology for UTI) -> +400 pts",
              "• Tier 2: Direct Procedure Match",
              "  (e.g. Lithotripsy) -> +300 pts",
              "• Tier 3: General Care Fallback",
              "  (General Medicine) -> +200 pts",
              "• Tier 4: Regional Referral",
              "  (Tertiary center) -> +100 pts"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    draw_box(ax, 35.5, 50, 29, 38, "ADDITIONAL WEIGHTED SCORES",
             ["• Primary Specialty: +40 pts",
              "• Fallback Specialty: +15 pts",
              "• Matched Procedures: Up to +30 pts",
              "  formula: min(matched/2, 1) * 30",
              "• Google Rating: Up to +10 pts",
              "  formula: (rating / 5) * 10",
              "• NABH Accreditation: +5 pts"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    draw_box(ax, 68, 50, 29, 38, "TOTAL RANKING & SORTING",
             ["• Base Match Score Formula:",
              "  Score = tierBonus + specialtyScore",
              "        + procedureScore + ratingScore",
              "        + nabhScore",
              "• Secondary sort: Haversine distance",
              "• Top facility awarded 'Best Match'",
              "• Referral notice shown for Tier 3"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    # Cost Profile
    draw_box(ax, 10, 8, 80, 34, "COST ESTIMATION INTEGRATION & MULTIPLIERS",
             ["• Base Condition Cost: Sourced from CONDITION_COST_PROFILES (min, max, stayDays, perDay, diagnostics, medicines)",
              "• Hospital Tier Multiplier: Premium = 1.75x | Mid-tier = 1.00x | Budget = 0.60x",
              "• Accreditation Multiplier: NABH Accredited = 1.05x | Standard = 1.00x",
              "• Total Formula: CostMin = round(base.min * tierMult * nabhMult) | CostMax = round(base.max * tierMult * nabhMult)",
              "• Fixed-Formula Guarantee: All estimates are deterministic guidelines, clearly distinguished from live quotes."],
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.8)

    draw_arrow(ax, 32, 69, 35.5, 69, color=C_TEAL, width=1.5)
    draw_arrow(ax, 64.5, 69, 68, 69, color=C_EMERALD, width=1.5)
    draw_arrow(ax, 82, 50, 65, 42, color=C_AMBER, width=1.5)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig15_hospital_ranking_flow.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 16. Data-Flow Diagram (Level 1 DFD)
# -------------------------------------------------------------
def gen_fig16():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 16: MediPath AI — System Level-1 Data Flow Diagram (DFD)",
                              "Flow of data across patient boundaries, normalization, inference engine, hospital index, and report generation")
    # External Entity
    draw_box(ax, 3, 36, 17, 28, "PATIENT ENTITY", 
             ["• Free-Text Symptoms", 
              "• Speech Audio Input", 
              "• Follow-Up Option Choices", 
              "• Device GPS Coordinates",
              "• Diagnostic Care Report"], 
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.4)

    # Upper Triage Loop (Processes P1, P2, P3)
    draw_box(ax, 28, 62, 20, 23, "P1: INPUT & TRANSLATE", 
             ["• Auto language detection", 
              "• Translates Indic to EN", 
              "• Preserves negations & slang"], 
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.4)
             
    draw_box(ax, 52, 62, 20, 23, "P2: MODEL 2.0 TRIAGE", 
             ["• 3,910 TF-IDF projection", 
              "• 56 Independent Sigmoids", 
              "• Evaluates tau_k thresholds"], 
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.4)
             
    draw_box(ax, 76, 62, 20, 23, "P3: QUESTION GEN", 
             ["• Synthesizes doctor inquiry", 
              "• Curates discriminative chips", 
              "• Prevents question repeats"], 
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.4)

    # Lower Confirmed Diagnosis & Routing Path (Processes P4, P5)
    draw_box(ax, 52, 11, 20, 24, "P4: HOSPITAL SEARCH", 
             ["• 4-tier match scoring", 
              "• Haversine geo-distance", 
              "• Calibrated procedural cost"], 
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.4)
             
    draw_box(ax, 76, 11, 20, 24, "P5: PRINT SUMMARY", 
             ["• Multilingual compilation", 
              "• Non-diagnostic disclaimer", 
              "• Multi-page CSS layout"], 
             bg_color=C_CARD_BG, border_color=C_NAVY, title_color=C_NAVY, text_size=7.4)

    # Upper Loop Connections (Zero Line Crossings)
    draw_arrow(ax, 20, 56, 28, 72, "Raw Input", color=C_BLUE, label_offset=2.0)
    draw_arrow(ax, 48, 73.5, 52, 73.5, "Canonical EN", color=C_TEAL, label_offset=2.0)
    draw_arrow(ax, 72, 73.5, 76, 73.5, "Sigmoids", color=C_PURPLE, label_offset=2.0)
    
    # Return channel from P3 back to Patient Entity via upper arch
    ax.plot([86, 86, 11.5, 11.5], [85, 89.5, 89.5, 64], color=C_AMBER, lw=1.5, linestyle='-')
    draw_arrow(ax, 11.5, 67, 11.5, 64, color=C_AMBER, width=1.5)
    ax.text(49, 91.2, "Questions & Option Chips (Feedback Loop)", fontsize=7.8, fontweight='bold',
            color=C_AMBER, family=FONT_FAMILY, ha='center',
            bbox=dict(boxstyle="round,pad=0.2", facecolor="#FFFFFF", edgecolor=C_AMBER, lw=1))

    # Lower Path Connections (Zero Line Crossings)
    draw_arrow(ax, 62, 62, 62, 35, "Confirmed Cause", color=C_EMERALD, label_offset=2.0, label_side="right")
    draw_arrow(ax, 72, 23, 76, 23, "Hospitals List", color=C_NAVY, label_offset=2.0)
    draw_arrow(ax, 52, 23, 20, 42, "Ranked Centers & Tariffs", color=C_EMERALD, label_offset=2.0)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig16_data_flow_diagram.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 17. API Interaction Diagram
# -------------------------------------------------------------
def gen_fig17():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 17: Frontend-to-Backend REST API Interaction & Payload Contracts",
                              "Full HTTP route contracts: POST /api/triage/chat, POST /api/hospitals/search, and probe endpoints")
    actors = [("Client Browser", 15), ("Express API Router", 50), ("Backend Controllers", 85)]
    for name, x in actors:
        ax.plot([x, x], [10, 84], color=C_BORDER, linestyle='--', lw=1.2)
        ax.text(x, 86, name, fontsize=10, fontweight='bold', color=C_NAVY, ha='center', va='bottom', family=FONT_FAMILY,
                bbox=dict(boxstyle="round,pad=0.3", facecolor=C_LIGHT_BG, edgecolor=C_NAVY, lw=1))

    y_steps = [
        (80, 15, 50, "1. GET /api/model/health -> Probe model status", C_BLUE),
        (72, 50, 85, "2. Check loaded state of Model 2.0 in memory", C_TEAL),
        (64, 85, 15, "3. Return { loaded: true, models: [...] }", C_EMERALD),
        (56, 15, 50, "4. POST /api/triage/chat { symptoms, turnCount, lang }", C_BLUE),
        (48, 50, 85, "5. triageController.chatTriage() -> Model 2.0 inference", C_PURPLE),
        (40, 85, 15, "6. Return { assessmentStatus, counterQuestion, quickOptions }", C_EMERALD),
        (32, 15, 50, "7. POST /api/hospitals/search { condition, filters, origin }", C_BLUE),
        (24, 50, 85, "8. hospitalController.searchHospitals() -> 4-tier match", C_AMBER),
        (16, 85, 15, "9. Return { condition, hospitals: [...], dataSource }", C_EMERALD)
    ]
    for y, x1, x2, label, col in y_steps:
        draw_arrow(ax, x1, y, x2, y, label, color=col, width=1.3, label_offset=1.6)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig17_api_interaction_diagram.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 18. Printing and Summary Generation Flow
# -------------------------------------------------------------
def gen_fig18():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 18: Consultation Summary & Multi-Page Printing Generation Flow",
                              "Extraction of canonical messages, safety notice generation, layout structuring and CSS print media rules")
    draw_box(ax, 3, 54, 29, 32, "1. EVIDENCE EXTRACTION",
             ["• Reads messages[] from state",
              "• Filters out temporary UI cards",
              "• Filters out revealing animations",
              "• Retains only completed turns",
              "• Extracts confirmedCondition",
              "• Reads effectiveConfidence"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    draw_box(ax, 35.5, 54, 29, 32, "2. DOCUMENT COMPILATION",
             ["• MediPath AI & Model 2.0 header",
              "• Timestamp & Date metadata",
              "• Non-diagnostic safety disclaimer",
              "• Possible cause & ICD-10 code",
              "• Authoritative confidence badge",
              "• Specialization & next steps"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    draw_box(ax, 68, 54, 29, 32, "3. PRINT CSS STYLING",
             ["• @media print stylesheet rules",
              "• print:block hidden on screen",
              "• print-page-break-avoid classes",
              "• High-contrast black & white text",
              "• Preserves table borders",
              "• Calls window.print()"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    draw_box(ax, 10, 8, 80, 34, "VERIFIED PRINTING RESILIENCE GUARANTEES",
             ["• No Animation Dependency: Printable summary uses allCanonicalMessages directly, ensuring content is never truncated if user prints during progressive text streaming.",
              "• Multi-page Safety: Headers, disclaimers, and assessment blocks enforce page-break-inside: avoid to prevent splitting across paper margins.",
              "• Score Honesty: Renders 'Score unavailable (Safe Deferral)' in safe deferral states, avoiding synthetic or default fallback numbers.",
              "• Cross-platform Printing: Validated across Chromium, Firefox, and Edge print preview rendering engines."],
             bg_color=C_CARD_BG, border_color=C_NAVY, title_color=C_NAVY, text_size=7.8)

    draw_arrow(ax, 32, 70, 35.5, 70, color=C_TEAL, width=1.5)
    draw_arrow(ax, 64.5, 70, 68, 70, color=C_EMERALD, width=1.5)
    draw_arrow(ax, 82.5, 54, 82.5, 42, "Printing Guarantees", color=C_NAVY, label_offset=2.0, label_side="right")

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig18_print_summary_flow.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 19. Project Folder Structure Diagram (Updated to Clean Build)
# -------------------------------------------------------------
def gen_fig19():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 19: MediPath AI — Complete Project Directory & Codebase Map",
                              "Visual repository hierarchy showing backend services, frontend application, datasets, notebooks, and test suites")
    draw_box(ax, 3, 50, 45, 39, "BACKEND DIRECTORY (backend/)",
             ["• server.js : Express startup, CORS, rate-limiter, guards",
              "• controllers/ : triageController.js, hospitalController.js",
              "• routes/ : triage.js, hospitals.js, predictions.js, search.js",
              "• services/ : translationService.js, geminiProvider.js",
              "• models/ : symptomModel.js (Zero-Python In-Memory Engine)",
              "• models/MedP_AI_V2.0/ : symptom-model JSON, reports, metrics",
              "• data/ : hospitals.json (920 facilities), google_usage.json",
              "• Tests : 6 core verification test suites (100% pass rate)"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.6)

    draw_box(ax, 52, 50, 45, 39, "FRONTEND DIRECTORY (frontend/healthpath-ai-main/)",
             ["• src/pages/ : Index.tsx (Main orchestrator), Login, NotFound",
              "• src/components/medipath/ : DoctorConsultationPanel (78KB),",
              "  SupportedDiseasesSection (Scrollable 56-disease grid),",
              "  NerdHubDialog (Model diagnostics & dataset explorer),",
              "  ResultsView, ConfidenceMeter, CostBreakdown, HospitalCard,",
              "  ThinkingState (AI loading animation), ConsultationPrintSummary",
              "• src/services/ : hospitalService.ts (API client & interfaces)",
              "• src/lib/ : i18n.ts (100% 280/280 chips), symptomHelpers.ts",
              "• src/test/ : 15 Vitest test suites (87/87 tests passing)"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.6)

    draw_box(ax, 3, 6, 45, 38, "DATASETS & NOTEBOOKS (Datasets/ & notebooks/)",
             ["• Datasets/symptom-based-disease-prediction-v2.xlsx :",
              "  157,036 raw rows, SHA-256 validated training data",
              "• Datasets/hospital.xlsx : Hospital registry source data",
              "• notebooks/train_v2_multilabel.py : Complete reproducible",
              "  training script with zero-leakage group stratification",
              "• notebooks/MedP_AI_V2_Training.ipynb : Exploration notebook",
              "• scripts/extract_dataset_previews.py : Preview CSV exporter"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.6)

    draw_box(ax, 52, 6, 45, 38, "DOCUMENTATION & DELIVERABLES",
             ["• start-project.bat : Automated one-click project launcher",
              "• MediPath_AI_Complete_Handbook_Revised.docx : Master Handbook",
              "• MediPath_AI_Three_Models_Comprehensive_Specification.docx : Report",
              "• doc_compilers/ : compile_handbook.py & handbook_part1-5.py",
              "• diagram_generators/ : generate_diagrams.py (23 blueprints)",
              "• documentation_assets/diagrams/ : High-DPI rendered assets",
              "• README.md : Quickstart guide and architecture overview"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.6)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig19_folder_structure.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 20. Three-Model Architectural & Performance Comparison
# -------------------------------------------------------------
def gen_fig20():
    fig, ax = create_base_fig(13.5, 8.8, "Figure 20: MediPath AI — Comprehensive 3-Model Architectural Comparison",
                              "Evolutionary analysis across Model 1.0 (Baseline), Model 1.5 (SGD Linear), and Model 2.0 (Doctor AI Engine)")

    # Model 1.0 Box
    draw_box(ax, 3, 27, 29, 61, "MODEL 1.0 (BASELINE)",
             ["• Multinomial Softmax Logistic Regression",
              "• 53 Single-Label Disease Classes",
              "• 7,046 TF-IDF n-grams (unigram/bigram)",
              "• HealthPath Dataset (64,200 rows)",
              "• Forced Mutual Exclusivity (Sum = 1.0)",
              "• Zero-sum probability distortion flaw",
              "• Single-shot static prediction only",
              "• No follow-up clarifying questions",
              "• No contradictory symptom detection",
              "• Static global 50% cutoff threshold",
              "----------------------------------------",
              "• Micro F1: 0.7092  | Macro F1: 0.6808",
              "• Top-1 Hit: 82.4%  | Top-3 Hit: 95.1%",
              "• Latency: < 14 ms  | Memory: 8.88 MB"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    # Model 1.5 Box
    draw_box(ax, 35.5, 27, 29, 61, "MODEL 1.5 (CALIBRATED SGD)",
             ["• Calibrated Linear SGD Classifier",
              "• Platt Temperature Scaling (T-scaled)",
              "• 53 Single-Label Disease Classes",
              "• 12,362 TF-IDF n-grams (extended)",
              "• Updated01 Dataset (85,420 rows)",
              "• Temperature-Softmax (Sum = 1.0)",
              "• Improved probability calibration",
              "• Ultra-fast training & sub-8ms serving",
              "• Lacks multi-turn conversational state",
              "• No differing symptom penalization",
              "• Static global 55% cutoff threshold",
              "----------------------------------------",
              "• Micro F1: 0.7721  | Macro F1: 0.7410",
              "• Top-1 Hit: 85.2%  | Top-3 Hit: 97.5%",
              "• Latency: < 8 ms   | Memory: 15.65 MB"],
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.5)

    # Model 2.0 Box
    draw_box(ax, 68, 27, 29, 61, "MODEL 2.0 (DOCTOR AI ENGINE)",
             ["• One-vs-Rest Independent Binary Sigmoids",
              "• 56 Canonical Primary-Care Classes",
              "• 280 Clinical Symptoms across 56 conditions",
              "• 3,910 Sublinear TF-IDF n-grams",
              "• Prediction-V2 (104,291 clean encounters)",
              "• P(y_k = 1|x) = 1 / (1 + exp(-z_k))",
              "• Eliminates zero-sum softmax squashing",
              "• Dynamic Multi-turn State Machine",
              "• Contradictory symptom penalty formula",
              "• Per-class calibrated tau in [0.79, 0.85]",
              "• 11 Emergency red-flag safety overrides",
              "• 100% Hindi & Gujarati card translations",
              "----------------------------------------",
              "• Micro F1: 0.7837  | Top-1 Hit: 88.2%",
              "• Top-3 Hit: 99.0%  | Top-5 Hit: 99.8%",
              "• Latency: < 12 ms  | Memory: 5.08 MB"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    # Summary Comparison Banner
    draw_box(ax, 3, 5, 94, 19, "KEY ARCHITECTURAL EVOLUTION & CLINICAL SUPERIORITY OF MODEL 2.0",
             ["1. Independent Sigmoids vs Softmax: Model 2.0 eliminates artificial probability competition between comorbid and differential conditions.",
              "2. Multi-Turn Clarification: Turn 0 mandatory follow-up + symptom accumulation iteratively narrows candidate diseases until 1 condition remains.",
              "3. Real Confidence Tracking: Dynamic penalization for differing symptoms prevents false certainty; displays authentic turn deltas (+X% / -Y%).",
              "4. Zero-Python Serving: In-memory sparse matrix dot product executes in Node.js with exact bit-level parity to Scikit-Learn (delta < 1e-15).",
              "5. Production Status: Model 2.0 is the sole authoritative production engine across the entire MediPath AI platform."],
             bg_color=C_CARD_BG, border_color=C_TEAL, title_color=C_TEAL, text_size=7.6)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig20_three_models_comparison.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 21. 56-Disease Direct Clinical Routing Architecture
# -------------------------------------------------------------
def gen_fig21():
    fig, ax = create_base_fig(13.5, 8.5, "Figure 21: MediPath AI — 56-Disease Direct Clinical Routing & Telemetry",
                              "Fast-path bypass architecture for diagnosed conditions with live 4-stage geospatial facility routing")

    draw_box(ax, 3, 54, 20.5, 32, "1. USER SELECTION",
             ["• 56 Disease Directory",
              "• Scrollable container UI",
              "• Search by name / ICD-10",
              "• System filter: Cardio, ENT",
              "• Or General Medicine",
              "• Clicks known condition"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    draw_arrow(ax, 23.5, 70, 27.5, 70, color=C_BLUE, width=1.5)

    draw_box(ax, 27.5, 54, 20.5, 32, "2. CLINICAL ANCHOR",
             ["• Exact ICD-10 Code",
              "• Target Specialization",
              "• Primary Procedure",
              "• Clinical Urgency Level",
              "• 100% Diagnostic Anchor",
              "• Bypasses multi-turn triage"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    draw_arrow(ax, 48, 70, 52, 70, color=C_TEAL, width=1.5)

    draw_box(ax, 52, 54, 21.5, 32, "3. ROUTING TELEMETRY",
             ["• Dedicated AI Loading Screen",
              "• 4-Step Animated Pipeline:",
              "  1. Direct ICD-10 Anchor",
              "  2. Specialist Dept Filter",
              "  3. Geospatial Distance",
              "  4. Tariff Calibration",
              "• Scans 920+ verified hubs"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)

    draw_arrow(ax, 73.5, 70, 77.5, 70, color=C_PURPLE, width=1.5)

    draw_box(ax, 77.5, 54, 19.5, 32, "4. RESULTS VIEW",
             ["• Ranked Verified Hospitals",
              "• Specialty Match Badge",
              "• 3-Step Tariff Breakdown",
              "• NABH Accreditation Factor",
              "• Emergency 24/7 Filter",
              "• Turn Navigation CTA"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    # Bottom General Medicine Fallback & Emergency Subsystem
    draw_box(ax, 3, 10, 46, 35, "GENERAL MEDICINE FAST-PATH (FOR UNCERTAIN USERS)",
             ["• Purpose: Primary care evaluation when symptoms are multifactorial or undiagnosed",
              "• Clinical Action: Routes directly to General Physician and Internal Medicine departments",
              "• Geospatial Query: Matches general-care hospitals, community health centers, and trusts",
              "• Safe Navigation: Bypasses complex specialized procedures, directing patient to primary consultation",
              "• Transparent Costing: Outpatient OPD consultation tariffs and standard diagnostic bundles"],
             bg_color=C_CARD_BG, border_color=C_BORDER, title_color=C_NAVY, text_size=7.8)

    draw_box(ax, 51, 10, 46, 35, "GEOSPATIAL RANKING & COST CALCULATION ENGINE",
             ["• Radius Haversine Filtering: d = 2R * arcsin(sqrt(sin^2(dlat/2) + cos*cos*sin^2(dlng/2)))",
              "• Verified Registry Priority: 924 curated hospitals across 40+ Indian metro and tier-2 cities",
              "• 3-Step Treatment Cost: Total Cost = Base Medical Cost * Hospital Tier * Accreditation Factor",
              "• Tier Multipliers: Budget / Trust (0.60x) | Mid-tier Private (1.00x) | Corporate (1.75x)",
              "• NABH Accreditation Quality Factor: +5% tariff calibration for quality compliance"],
             bg_color=C_CARD_BG, border_color=C_BORDER, title_color=C_NAVY, text_size=7.8)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig21_direct_routing_and_loading_engine.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 22. Model Diagnostics & Nerd Hub Architecture
# -------------------------------------------------------------
def gen_fig22():
    fig, ax = create_base_fig(13.5, 8.8, "Figure 22: MediPath AI — Model Diagnostics & Nerd Hub Architecture",
                              "Full technical transparency hub offering multi-model deep-dives, training datasets, and hospital registry")

    # Header Telemetry
    draw_box(ax, 3, 78, 94, 11, "APPLICATION HEADER STATUS INDICATORS",
             ["• Firebase Connection Status: Real-time Firebase RTDB / Cloud Firestore synchronization telemetry badge",
              "• All Models Status: 'All Models: 3/3 Online' interactive indicator button opening Model Diagnostics Hub"],
             bg_color=C_NAVY, border_color=C_NAVY, title_color='#FFFFFF')

    # 4 Tabs of Nerd Hub with generous widths and margins
    draw_box(ax, 3, 20, 21.8, 54, "TAB 1: MODEL DEEP-DIVE",
             ["• Active Model Selector",
              "  (Model 2.0 / 1.5 / 1.0)",
              "• Core Algorithm & Activation",
              "• Mathematical Formulation",
              "• Hyperparameters Roster",
              "• Top Performing Classes",
              "• Weakest Classes & Reasons",
              "• Serving Latency & Memory",
              "• Switch Active Model CTA"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    draw_box(ax, 27.2, 20, 21.8, 54, "TAB 2: TRAINING DATASETS",
             ["• Dataset Source & Provenance",
              "• SHA-256 Hash Validation",
              "• 104,291 Clean Encounters",
              "• Group Stratification Rules",
              "• Real Dataset In-App Preview",
              "  (Interactive scrollable table)",
              "• Download Real Dataset (.xlsx)",
              "• Download JSON Schema (.json)",
              "• Search samples & symptoms"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    draw_box(ax, 51.3, 20, 21.8, 54, "TAB 3: HOSPITAL REGISTRY",
             ["• 924 Verified Hospitals Roster",
              "• Pan-India Coverage Telemetry",
              "• Tier & Accreditation Breakdown",
              "• City & State Multi-filter",
              "• Search by hospital, specialty",
              "• Live hospital preview cards",
              "• Download Verified Registry",
              "  Complete JSON file export"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    draw_box(ax, 75.5, 20, 21.8, 54, "TAB 4: 3-MODEL COMPARISON",
             ["• Head-to-Head Comparison Matrix",
              "• Micro / Macro / Weighted F1",
              "• Top-1, Top-3, Top-5 Hit Rates",
              "• Probability Calibration (Brier)",
              "• Multi-Label Support Matrix",
              "• Interactive Triage Support",
              "• Emergency Override Rules",
              "• Serving Memory Footprint"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)

    # Multilingual Banner
    draw_box(ax, 3, 5, 94, 12, "FULL MULTILINGUAL LOCALIZATION OF NERD HUB & DATASETS",
             ["• Entire Nerd Hub UI is localized into Hindi and Gujarati while strictly preserving technical model identifiers (_MedP_AI_V2.0, ICD-10).",
              "• Interactive dataset search and hospital registry filtering function smoothly across English, Hindi, and Gujarati."],
             bg_color=C_CARD_BG, border_color=C_BORDER, title_color=C_NAVY, text_size=7.8)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig22_nerd_hub_architecture.png"))
    plt.close(fig)

# -------------------------------------------------------------
# 23. 6-Step Multi-Turn Clarification Lifecycle
# -------------------------------------------------------------
def gen_fig23():
    fig, ax = create_base_fig(13.5, 8.8, "Figure 23: MediPath AI — 6-Step Multi-Turn Clarification, Candidate Elimination & Finalization Lifecycle",
                              "Complete state transition lifecycle: patient entry, mandatory follow-up, evidence accumulation, candidate elimination, and safe fallback")

    # Step 1
    draw_box(ax, 3, 54, 16, 34, "STEP 1: ENTRY",
             ["• User enters query",
              "• Free-text or voice",
              "• Natural language",
              "• Indic/Romanized",
              "• Dispatched to triage",
              "• Ingests Turn 0"],
             bg_color=C_BLUE_LIGHT, border_color=C_BLUE, title_color=C_BLUE, text_size=7.5)

    draw_arrow(ax, 19, 71, 23, 71, color=C_BLUE, width=1.5)

    # Step 2
    draw_box(ax, 23, 54, 16.5, 34, "STEP 2: MANDATE",
             ["• Turn 0 Rule: Never finalize",
              "• Evaluates Model 2.0",
              "• Returns 1st question",
              "• Shows real baseline score",
              "• Shows candidate diseases",
              "• Candidate count badge"],
             bg_color=C_TEAL_LIGHT, border_color=C_TEAL, title_color=C_TEAL, text_size=7.5)

    draw_arrow(ax, 39.5, 71, 43.5, 71, color=C_TEAL, width=1.5)

    # Step 3
    draw_box(ax, 43.5, 54, 17, 34, "STEP 3: ACCUMULATION",
             ["• appendRealSymptom()",
              "• Deduplicates tokens",
              "• Evaluates Model 2.0",
              "• Real confidence delta",
              "  (+X% or -Y%)",
              "• Next clarifying Q"],
             bg_color=C_PURPLE_LIGHT, border_color=C_PURPLE, title_color=C_PURPLE, text_size=7.5)

    draw_arrow(ax, 60.5, 71, 64.5, 71, color=C_PURPLE, width=1.5)

    # Step 4
    draw_box(ax, 64.5, 54, 18, 34, "STEP 4: ELIMINATION",
             ["• Iterates until 1 left",
              "• Path A: isOneCandidateLeft",
              "  -> Automatic Final Answer",
              "• Path B: 'No more symptoms'",
              "  -> Top candidate shown",
              "  (if threshold >= tau_k)"],
             bg_color=C_EMERALD_LIGHT, border_color=C_EMERALD, title_color=C_EMERALD, text_size=7.5)

    draw_arrow(ax, 82.5, 71, 86.5, 71, color=C_EMERALD, width=1.5)

    # Step 5
    draw_box(ax, 86.5, 54, 10.5, 34, "STEP 5: CHAT",
             ["• Composer open",
              "• User adds symptom",
              "• Re-opens loop",
              "• Dynamic recovery",
              "• Full history kept"],
             bg_color=C_AMBER_LIGHT, border_color=C_AMBER, title_color=C_AMBER, text_size=7.2)

    # Bottom Step 6 Fallback box
    draw_box(ax, 3, 8, 46, 41, "STEP 6: SYSTEM SAFE FALLBACK PROTOCOL",
             ["• Trigger Condition: Low confidence, unrecognized input, or threshold tau_k not met",
              "• Assessment Status: safe_defer / unsupported_uncertain_condition",
              "• Score Display: 'Score unavailable (Safe Deferral)' — strictly null, no fabricated numbers",
              "• Clinical Action: Comprehensive referral to General Physician for physical examination",
              "• Dynamic Recovery: If patient later provides specific symptoms, system seamlessly recovers"],
             bg_color=C_CARD_BG, border_color=C_BORDER, title_color=C_NAVY, text_size=7.8)

    # Bottom Emergency Override box
    draw_box(ax, 51, 8, 46, 41, "SAFETY RED-FLAG IMMEDIATE EMERGENCY OVERRIDE",
             ["• Trigger Condition: Input matches 11 emergency patterns (cardiac, stroke, shock, anaphylaxis)",
              "• Assessment Status: emergency_override (100% immediate safety priority)",
              "• Lifecycle Impact: Completely bypasses mandatory follow-up delays, typing animations, and chips",
              "• Presentation: Red alert banner, siren warning, instant 108 emergency calling prompt",
              "• Hospital Routing: Direct bypass to 24/7 accredited Trauma & Emergency Centers"],
             bg_color=C_ROSE_LIGHT, border_color=C_ROSE, title_color=C_ROSE, text_size=7.8)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, "fig23_followup_six_step_lifecycle.png"))
    plt.close(fig)

def main():
    print("Generating 23 publication-quality architectural diagrams with proper spacing and zero overlap...")
    gen_fig01()
    print("  [1/23] fig01_overall_architecture.png")
    gen_fig02()
    print("  [2/23] fig02_system_context.png")
    gen_fig03()
    print("  [3/23] fig03_frontend_component_architecture.png")
    gen_fig04()
    print("  [4/23] fig04_backend_component_architecture.png")
    gen_fig05()
    print("  [5/23] fig05_deployment_architecture.png")
    gen_fig06()
    print("  [6/23] fig06_user_journey.png")
    gen_fig07()
    print("  [7/23] fig07_multilingual_translation_sequence.png")
    gen_fig08()
    print("  [8/23] fig08_model_preprocessing_inference.png")
    gen_fig09()
    print("  [9/23] fig09_model_training_pipeline.png")
    gen_fig10()
    print("  [10/23] fig10_consultation_state_machine.png")
    gen_fig11()
    print("  [11/23] fig11_evidence_accumulation_sequence.png")
    gen_fig12()
    print("  [12/23] fig12_confidence_decision_flow.png")
    gen_fig13()
    print("  [13/23] fig13_safe_deferral_recovery_flow.png")
    gen_fig14()
    print("  [14/23] fig14_hospital_recommendation_sequence.png")
    gen_fig15()
    print("  [15/23] fig15_hospital_ranking_flow.png")
    gen_fig16()
    print("  [16/23] fig16_data_flow_diagram.png")
    gen_fig17()
    print("  [17/23] fig17_api_interaction_diagram.png")
    gen_fig18()
    print("  [18/23] fig18_print_summary_flow.png")
    gen_fig19()
    print("  [19/23] fig19_folder_structure.png")
    gen_fig20()
    print("  [20/23] fig20_three_models_comparison.png")
    gen_fig21()
    print("  [21/23] fig21_direct_routing_and_loading_engine.png")
    gen_fig22()
    print("  [22/23] fig22_nerd_hub_architecture.png")
    gen_fig23()
    print("  [23/23] fig23_followup_six_step_lifecycle.png")
    print("All 23 diagrams generated successfully in:", OUTPUT_DIR)

if __name__ == '__main__':
    main()
