import { app, BrowserWindow } from 'electron';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    frame: true,
    fullscreen: true,
    useContentSize: false,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

function startPythonServer() {
  const pythonServer = execFile(path.resolve(__dirname, 'bin/OLOS_Server.exe'));
  if (pythonServer.stdout) {
    pythonServer.stdout.on('data', (data) => {
      console.log(`Python Server Output: ${data}`);
    });
  }
  if (pythonServer.stderr) {
    pythonServer.stderr.on('data', (data) => {
      console.error(`Python Server Error: ${data}`);
    });
  }
  pythonServer.on('close', (code) => {
    console.log(`Python Server exited with code ${code}`);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});
app.on('ready', () => {
  startPythonServer();
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});
