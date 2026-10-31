# MediPath AI Frontend Application

Modern, patient-facing healthcare-navigation and clinical triage web application built with **React**, **Vite**, and **Tailwind CSS**.

---

## 1. Clinical Navigation User Flow

```
[1. Natural Language Symptom Input]
                 │
                 ▼
[2. Multi-Turn Doctor AI Clarity Questions]
   (Curated discriminative symptom chips)
                 │
                 ▼
[3. Completion: "No more symptoms"]
                 │
                 ▼
[4. Possible Causes & Differential Categories]
   (Calibrated model probability, non-diagnostic phrasing)
                 │
                 ▼
[5. Clinical Specialization & Procedure Guidance]
   (Primary-care routing, e.g. Urology, Gastroenterology)
                 │
                 ▼
[6. Hospital Recommendations & Facility Discovery]
   (Tier, accreditation, procedures offered, rating, distance)
```

---

## 2. Key Features

- **Conversational Doctor Clarity Chat:** Conducts structured clinical differential triage by asking relevant clarifying questions with pre-configured quick-select symptom chips.
- **Strict Clinical Language:** Enforces patient-safe terminology (*"Possible cause"*, *"Initial category"*, *"Requires clinical confirmation"*). Strictly avoids claiming definitive medical diagnosis.
- **Safety Red-Flag Alerts:** Instantly highlights acute life-threatening emergency symptoms with high-visibility red banners and direct emergency contacts.
- **Hospital Explorer:** Interactive facility cards showing hospital tier (`budget`, `mid`, `premium`), NABH accreditation, rating, total beds, and estimated procedure costs.
- **Multi-Turn Chat History:** Remembers previous symptoms and conversational context across turns.

---

## 3. Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS & Lucide Icons
- **State & Routing:** React Router v6 & React Context API

---

## 4. Development & Build

### Install Dependencies
```bash
cd frontend/healthpath-ai-main
npm install
```

### Run Local Development Server
```bash
npm run dev
# App will be accessible at http://localhost:8080 (or port designated by Vite)
```

### Build Production Bundle
```bash
npm run build
```
