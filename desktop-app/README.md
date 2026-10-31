# MediPath AI — Standalone Desktop PC Application

This folder (`desktop-app/`) contains the complete, standalone **PC Desktop Application** for **MediPath AI (MedP_AI_V2.0)** built with **Electron** and **Node.js**.

---

## 1. Desktop Architecture & Components

```
desktop-app/
├── main.js                  # Electron main process (lifecycle, native window & tray)
├── preload.js               # Safe context isolation bridge (IPC security)
├── server.js                # Embedded Express server (APIs + Model 2.0 + Static UI)
├── package.json             # Electron & electron-builder packaging configurations
├── .env                     # Local environment API keys & ports
├── run-pc-app.bat           # One-click Windows desktop launcher
├── assets/
│   └── icon.ico             # High-resolution desktop & installer icon
├── backend/                 # Embedded clinical decision support engine
│   ├── controllers/         # Triage & Hospital Controllers
│   ├── data/                # 920 Verified Indian hospitals & usage records
│   ├── middleware/          # CORS & Error handling
│   ├── models/              # Model 2.0 in-memory ML inference (symptomModel.js)
│   ├── routes/              # Express API endpoints (/api/triage, /api/hospitals)
│   └── services/            # Gemini translation & Google Places/OSM providers
└── dist/                    # Compiled production React 18 + Vite frontend bundle
```

### Key Highlights:
1. **Self-Contained & Zero-Python**:
   The desktop application includes the pure JavaScript inference engine (`backend/models/symptomModel.js`) and the 56-class clinical model weights (`symptom-model_MedP_AI_V2.0.json`). It runs 100% offline for symptom navigation with zero Python runtime needed.
2. **Embedded Server & Single Instance**:
   `main.js` automatically starts the local Express server on port 5000, checks health readiness, and renders the application in a sleek, hardware-accelerated desktop window. If the app is already open, opening it again brings the active window to focus.
3. **Graceful Lifecycle Management**:
   When the desktop application window is closed, the embedded background server shuts down cleanly with zero orphaned processes.

---

## 2. How to Run the Desktop App (Development / Testing)

### Option A: One-Click Launcher
Double-click `run-pc-app.bat` inside this folder or from the project root.

### Option B: Terminal Command
```powershell
cd d:\MediPath_AI_Capstone\desktop-app
npm start
```

---

## 3. How to Build the Standalone Windows `.exe` Installer

To package this application into a standalone installer (`.exe`) that can be distributed and installed on any Windows PC:

```powershell
cd d:\MediPath_AI_Capstone\desktop-app
npm run dist
```

This will generate two ready-to-use binaries in `desktop-app/dist-electron/`:
1. **`MediPath AI Setup 2.0.0.exe`**: Standard NSIS Windows installer with desktop shortcut, Start Menu shortcut, and uninstaller.
2. **`MediPath AI 2.0.0.exe`**: Portable standalone executable that runs immediately without installation.

---

## 4. Re-syncing Frontend Changes
If you make changes to the web application in `../MediPath_AI_Capstone/frontend/healthpath-ai-main`, update the desktop app by running:

```powershell
# In frontend folder:
npm run build

# Copy new dist to desktop folder:
Copy-Item -Path "..\MediPath_AI_Capstone\frontend\healthpath-ai-main\dist\*" -Destination ".\dist" -Recurse -Force
```
