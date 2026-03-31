const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  // FFmpeg.wasm needs SharedArrayBuffer → require COOP/COEP headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Cross-Origin-Opener-Policy': ['same-origin'],
        'Cross-Origin-Embedder-Policy': ['require-corp'],
      },
    });
  });

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: '光田影音小助手',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Allow local file access for video/audio assets
      webSecurity: false,
    },
  });

  win.loadFile('index.html');

  // Remove default menu bar
  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
