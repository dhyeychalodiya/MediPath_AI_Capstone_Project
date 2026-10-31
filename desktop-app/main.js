const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const http = require('http');
const { startServer } = require('./server');

let mainWindow = null;
let serverInstance = null;
const SERVER_PORT = process.env.PORT || 5000;
const APP_URL = `http://127.0.0.1:${SERVER_PORT}`;

// Enforce single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function checkServerReady(url, maxRetries = 25, delayMs = 300) {
  return new Promise((resolve) => {
    let retries = 0;
    const probe = () => {
      http.get(`${url}/api/health`, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      retries += 1;
      if (retries >= maxRetries) {
        console.warn(`[MediPath Desktop] Server health check timed out after ${maxRetries} attempts.`);
        resolve(false);
      } else {
        setTimeout(probe, delayMs);
      }
    };

    probe();
  });
}

async function initializeBackend() {
  // Check if port 5000 is already active (e.g., external server running)
  const alreadyActive = await checkServerReady(APP_URL, 2, 200);
  if (alreadyActive) {
    console.log(`[MediPath Desktop] Detected active backend on ${APP_URL}`);
    return;
  }

  // Start internal server
  try {
    const result = await startServer(SERVER_PORT);
    serverInstance = result.server;
    console.log(`[MediPath Desktop] Embedded server started on port ${result.port}`);
  } catch (err) {
    console.error(`[MediPath Desktop] Error starting embedded server: ${err.message}`);
  }

  await checkServerReady(APP_URL, 30, 250);
}

let splashWindow = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 380,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    show: false,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.show();
    }
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow(splashStartTime) {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 650,
    center: true,
    show: false, // Don't show until ready-to-show to prevent white flicker
    title: 'MediPath AI - Intelligent Healthcare Navigator',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#0f172a', // Deep slate matches dark theme
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  // Custom application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload Consultation',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.reload(),
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow && mainWindow.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About MediPath AI',
          click: () => {
            shell.openExternal('https://github.com/your-repo/MediPath_AI_Capstone');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Load the web app from local embedded server
  mainWindow.loadURL(APP_URL);

  mainWindow.once('ready-to-show', () => {
    const elapsed = splashStartTime ? Date.now() - splashStartTime : 1800;
    const remainingDelay = Math.max(0, 1800 - elapsed);

    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
      }
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy();
        splashWindow = null;
      }
    }, remainingDelay);
  });

  // Open external links in default OS browser rather than inside the app window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for window controls if requested by renderer
ipcMain.on('app:close', () => {
  if (mainWindow) mainWindow.close();
});
ipcMain.on('app:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on('app:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.handle('app:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// App Lifecycle
app.whenReady().then(async () => {
  const { session } = require('electron');
  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'geolocation') {
        return callback(true);
      }
      callback(false);
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      if (permission === 'geolocation') {
        return true;
      }
      return false;
    });
  }

  createSplashWindow();
  const splashStartTime = Date.now();

  await initializeBackend();
  createMainWindow(splashStartTime);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverInstance) {
    console.log('[MediPath Desktop] Shutting down embedded server...');
    try {
      serverInstance.close();
    } catch (e) {
      // Ignored
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch (e) {
      // Ignored
    }
  }
});
