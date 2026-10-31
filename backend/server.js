const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const hospitalRoutes = require('./routes/hospitals');
const searchRoutes = require('./routes/search');
const predictionRoutes = require('./routes/predictions');
const triageRoutes = require('./routes/triage');
const errorHandler = require('./middleware/errorHandler');
const { getAvailableModels } = require('./models/symptomModel');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:8080')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${requestOrigin} is not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));

// Input length guard for symptom text and search queries (Max 2000 chars)
app.use('/api', (req, res, next) => {
  const textPayload = String(req.body?.symptoms || req.body?.query || req.query?.q || req.query?.query || '');
  if (textPayload.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Input text exceeds the maximum permitted length of 2000 characters.',
    });
  }
  next();
});

// Basic in-memory rate limiter (120 requests/minute/IP), exempting emergency red-flags
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 120;

app.use('/api', (req, res, next) => {
  // Never block emergency guidance
  const payload = String(req.body?.symptoms || req.body?.query || req.query?.q || '').toLowerCase();
  const isEmergency = /\b(chest pain|heart attack|stroke|breathing difficulty|anaphylaxis|uncontrolled bleed|loss of consciousness|seizure|emergency)\b/i.test(payload);
  if (isEmergency) return next();

  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);

  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a moment before trying again.',
    });
  }
  next();
});

app.use('/api/hospitals', hospitalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/triage', triageRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/model/health', (req, res) => {
  const models = getAvailableModels();
  res.json({ loaded: models.some(model => model.available), models });
});

// ── Desktop App Binary Downloads ─────────────────────────────────────────────
const fs = require('fs');
const SETUP_EXE_CANDIDATES = [
  path.resolve(__dirname, '../../desktop-app/dist-electron/MediPath AI Setup 2.0.0.exe'),
  path.resolve(__dirname, '../desktop-app/dist-electron/MediPath AI Setup 2.0.0.exe'),
  path.resolve(__dirname, 'public/downloads/MediPath AI Setup 2.0.0.exe'),
];

const DIRECT_EXE_CANDIDATES = [
  path.resolve(__dirname, '../../desktop-app/dist-electron/MediPath AI 2.0.0.exe'),
  path.resolve(__dirname, '../desktop-app/dist-electron/MediPath AI 2.0.0.exe'),
  path.resolve(__dirname, 'public/downloads/MediPath AI 2.0.0.exe'),
];

function findExistingFile(candidates) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

app.get('/api/download/desktop-setup', (req, res) => {
  const setupFile = findExistingFile(SETUP_EXE_CANDIDATES);
  if (setupFile) {
    res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
    return res.download(setupFile, 'MediPath-AI-Setup-2.0.0.exe');
  }
  res.status(404).json({
    success: false,
    message: 'Desktop setup installer is currently being built. Please check back shortly.',
  });
});

app.get('/api/download/desktop-direct', (req, res) => {
  const directFile = findExistingFile(DIRECT_EXE_CANDIDATES);
  if (directFile) {
    res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
    return res.download(directFile, 'MediPath-AI-2.0.0-Portable.exe');
  }
  res.status(404).json({
    success: false,
    message: 'Direct desktop executable is currently being built. Please check back shortly.',
  });
});

app.get('/api/download/info', (req, res) => {
  const setupFile = findExistingFile(SETUP_EXE_CANDIDATES);
  const directFile = findExistingFile(DIRECT_EXE_CANDIDATES);

  const setupStat = setupFile ? fs.statSync(setupFile) : null;
  const directStat = directFile ? fs.statSync(directFile) : null;

  res.json({
    success: true,
    version: '2.0.0',
    platform: 'Windows (64-bit)',
    setup: {
      available: Boolean(setupFile),
      fileName: 'MediPath-AI-Setup-2.0.0.exe',
      sizeBytes: setupStat ? setupStat.size : 114507598,
      sizeFormatted: setupStat ? `${(setupStat.size / (1024 * 1024)).toFixed(1)} MB` : '114.5 MB',
      downloadUrl: '/api/download/desktop-setup',
      type: 'Official Windows Installer (Desktop shortcut & Start Menu)'
    },
    portable: {
      available: Boolean(directFile),
      fileName: 'MediPath-AI-2.0.0-Portable.exe',
      sizeBytes: directStat ? directStat.size : 114234899,
      sizeFormatted: directStat ? `${(directStat.size / (1024 * 1024)).toFixed(1)} MB` : '114.2 MB',
      downloadUrl: '/api/download/desktop-direct',
      type: 'Standalone Portable App (Zero installation required)'
    },
    offlineFeatures: [
      '100% Offline Clinical Mode: Model 2.0 ML triage operates with zero internet',
      '924 Verified Emergency Hospitals pre-cached in local memory',
      'Instant sub-15ms inference latency directly on local CPU',
      'Complete patient privacy: health searches never leave your PC'
    ]
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
