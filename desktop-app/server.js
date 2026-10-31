const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const hospitalRoutes = require('./backend/routes/hospitals');
const searchRoutes = require('./backend/routes/search');
const predictionRoutes = require('./backend/routes/predictions');
const triageRoutes = require('./backend/routes/triage');
const errorHandler = require('./backend/middleware/errorHandler');
const { getAvailableModels } = require('./backend/models/symptomModel');

function createApp() {
  const app = express();

  // Allow localhost CORS
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  app.use(express.json({ limit: '100kb' }));

  // Input length guard
  app.use('/api', (req, res, next) => {
    const textPayload = String(req.body?.symptoms || req.body?.query || req.query?.q || req.query?.query || '');
    if (textPayload.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Input text exceeds maximum permitted length of 2000 characters.',
      });
    }
    next();
  });

  // Mount API endpoints
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/triage', triageRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', platform: 'desktop' });
  });

  app.get('/api/model/health', (req, res) => {
    try {
      const models = getAvailableModels();
      res.json({ loaded: models.some(m => m.available), models });
    } catch (err) {
      res.status(500).json({ loaded: false, error: err.message });
    }
  });

  // ── Desktop App Binary Downloads ───────────────────────────────────────────
  const fs = require('fs');
  const SETUP_EXE_CANDIDATES = [
    path.resolve(__dirname, 'dist-electron/MediPath AI Setup 2.0.0.exe'),
    path.resolve(__dirname, '../desktop-app/dist-electron/MediPath AI Setup 2.0.0.exe'),
  ];
  const DIRECT_EXE_CANDIDATES = [
    path.resolve(__dirname, 'dist-electron/MediPath AI 2.0.0.exe'),
    path.resolve(__dirname, '../desktop-app/dist-electron/MediPath AI 2.0.0.exe'),
  ];
  function findExistingFile(candidates) {
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }
  app.get('/api/download/desktop-setup', (req, res) => {
    const setupFile = findExistingFile(SETUP_EXE_CANDIDATES);
    if (setupFile) {
      res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
      return res.download(setupFile, 'MediPath-AI-Setup-2.0.0.exe');
    }
    res.status(404).json({ success: false, message: 'Desktop setup installer not found.' });
  });
  app.get('/api/download/desktop-direct', (req, res) => {
    const directFile = findExistingFile(DIRECT_EXE_CANDIDATES);
    if (directFile) {
      res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
      return res.download(directFile, 'MediPath-AI-2.0.0-Portable.exe');
    }
    res.status(404).json({ success: false, message: 'Direct desktop executable not found.' });
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
        sizeFormatted: setupStat ? `${(setupStat.size / (1024 * 1024)).toFixed(1)} MB` : '114.5 MB',
        downloadUrl: '/api/download/desktop-setup',
      },
      portable: {
        available: Boolean(directFile),
        fileName: 'MediPath-AI-2.0.0-Portable.exe',
        sizeFormatted: directStat ? `${(directStat.size / (1024 * 1024)).toFixed(1)} MB` : '114.2 MB',
        downloadUrl: '/api/download/desktop-direct',
      },
    });
  });

  // Serve static files from dist folder
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // SPA fallback for React Router
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath);
    }
  });

  app.use(errorHandler);

  return app;
}

function startServer(port = process.env.PORT || 5000) {
  return new Promise((resolve, reject) => {
    const app = createApp();
    const server = app.listen(port, '127.0.0.1', () => {
      const actualPort = server.address().port;
      console.log(`[MediPath Desktop Server] Running on http://127.0.0.1:${actualPort}`);
      resolve({ server, port: actualPort });
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
}

if (require.main === module) {
  const targetPort = parseInt(process.env.PORT || '5000', 10);
  startServer(targetPort).catch((err) => {
    console.error('[MediPath Desktop Server] Failed to start:', err);
    process.exit(1);
  });
}

module.exports = { createApp, startServer };
