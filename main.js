const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');

// SharedArrayBuffer: webSecurity:false already enables it in Electron.
// Also add the flag as belt-and-suspenders for all Electron versions.
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: '光田影音小助手',
    // titleBarStyle: 'hiddenInset', // uncomment for macOS native traffic-lights
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,          // allows local file:// access for media assets
    },
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);

  // Open external links in the system browser instead of a new Electron window
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
