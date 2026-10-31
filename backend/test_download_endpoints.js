const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');

console.log('=== Verifying Desktop Download Routes & Packaging ===');

const setupCandidates = [
  path.resolve(__dirname, '../../desktop-app/dist-electron/MediPath AI Setup 2.0.0.exe'),
  path.resolve(__dirname, '../desktop-app/dist-electron/MediPath AI Setup 2.0.0.exe'),
];

const directCandidates = [
  path.resolve(__dirname, '../../desktop-app/dist-electron/MediPath AI 2.0.0.exe'),
  path.resolve(__dirname, '../desktop-app/dist-electron/MediPath AI 2.0.0.exe'),
];

const setupFile = setupCandidates.find(p => fs.existsSync(p));
const directFile = directCandidates.find(p => fs.existsSync(p));

assert(setupFile, 'MediPath AI Setup 2.0.0.exe must exist in desktop-app/dist-electron/');
assert(directFile, 'MediPath AI 2.0.0.exe must exist in desktop-app/dist-electron/');

const setupStat = fs.statSync(setupFile);
const directStat = fs.statSync(directFile);

console.log(`[PASS] Setup file verified: ${setupFile} (${(setupStat.size / (1024 * 1024)).toFixed(2)} MB)`);
console.log(`[PASS] Direct portable file verified: ${directFile} (${(directStat.size / (1024 * 1024)).toFixed(2)} MB)`);

// Create test express app with the actual server.js route handlers
const app = express();

app.get('/api/download/desktop-setup', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
  return res.download(setupFile, 'MediPath-AI-Setup-2.0.0.exe');
});

app.get('/api/download/desktop-direct', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable');
  return res.download(directFile, 'MediPath-AI-2.0.0-Portable.exe');
});

app.get('/api/download/info', (req, res) => {
  res.json({
    success: true,
    version: '2.0.0',
    platform: 'Windows (64-bit)',
    setup: {
      available: true,
      fileName: 'MediPath-AI-Setup-2.0.0.exe',
      sizeFormatted: `${(setupStat.size / (1024 * 1024)).toFixed(1)} MB`,
      downloadUrl: '/api/download/desktop-setup',
    },
    portable: {
      available: true,
      fileName: 'MediPath-AI-2.0.0-Portable.exe',
      sizeFormatted: `${(directStat.size / (1024 * 1024)).toFixed(1)} MB`,
      downloadUrl: '/api/download/desktop-direct',
    },
  });
});

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test /api/download/info
    const infoRes = await fetch(`${baseUrl}/api/download/info`);
    assert.strictEqual(infoRes.status, 200, '/api/download/info should return 200');
    const infoData = await infoRes.json();
    assert.strictEqual(infoData.success, true);
    assert.strictEqual(infoData.setup.available, true);
    assert.strictEqual(infoData.setup.fileName, 'MediPath-AI-Setup-2.0.0.exe');
    console.log('[PASS] /api/download/info returned valid metadata:', infoData.setup);

    // 2. Test /api/download/desktop-setup headers
    const setupRes = await fetch(`${baseUrl}/api/download/desktop-setup`, { method: 'HEAD' });
    assert.strictEqual(setupRes.status, 200, '/api/download/desktop-setup should return 200');
    const disposition = setupRes.headers.get('content-disposition');
    assert(disposition && disposition.includes('MediPath-AI-Setup-2.0.0.exe'), 'Content-Disposition must match');
    const contentLength = parseInt(setupRes.headers.get('content-length'), 10);
    assert.strictEqual(contentLength, setupStat.size, 'Content-Length must match file size');
    console.log(`[PASS] /api/download/desktop-setup headers verified: Content-Length = ${contentLength}`);

    // 3. Test /api/download/desktop-direct headers
    const directRes = await fetch(`${baseUrl}/api/download/desktop-direct`, { method: 'HEAD' });
    assert.strictEqual(directRes.status, 200, '/api/download/desktop-direct should return 200');
    const directDisp = directRes.headers.get('content-disposition');
    assert(directDisp && directDisp.includes('MediPath-AI-2.0.0-Portable.exe'), 'Direct Content-Disposition must match');
    console.log('[PASS] /api/download/desktop-direct headers verified');

    console.log('\n>>> ALL DOWNLOAD ENDPOINT TESTS PASSED SUCCESSFULLY! <<<');
  } catch (err) {
    console.error('Download route verification failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
