const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');

// Forzar activación de sensores en Windows
app.commandLine.appendSwitch('enable-features', 'Geolocation');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream'); // Auto-permite cámara/micro sin pop-ups molestos

// Icono en Base64 para asegurar visibilidad total
const iconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFm0lEQVR4nO2dS2hcVRSGv3OnmbSJto0v0mAnmIqID6pFRUQLKig+8AEVQUVQUXzgg4qgIqiID3xARVARVMQHPqCCiqAiPigoSBEfVB9S/P6p7Ywm08y95869p5m2idMmmUmTmf2vltl7Zp0zc8/95xyu9xwAAMDvEAAAAAIUAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkEGlUunpZ+SDAXAbI7E9B8BfQAEAAAhQAACAAAUAAKBAAQAASFAAAAAIUAACAAAUAAKBAABIAAAAIEABAAAoUAAAAAIUAAAIUAAAkMHn+w16AAAAAElFTkSuQmCC";

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "GEO CORE",
    icon: nativeImage.createFromDataURL(iconBase64),
    backgroundColor: '#05070a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Auto-approve GPS permissions
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation') {
      return callback(true);
    }
    callback(false);
  });

  mainWindow.loadFile(path.join(__dirname, 'src/frontend/index.html'));

  // Open DevTools in dev mode
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to execute Python scripts via shell
function runPythonScript(scriptName, args = []) {
  let options = {
    mode: 'text',
    pythonPath: 'python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, 'src/backend'),
    args: args
  };

  PythonShell.run(scriptName, options).then(results => {
    console.log(`Python Result [${scriptName}]:`, results);
    if (mainWindow) {
        mainWindow.webContents.send('python-output', { script: scriptName, output: results });
    }
  }).catch(err => {
    console.error(`Python Error [${scriptName}]:`, err);
    if (mainWindow) {
        mainWindow.webContents.send('python-error', { script: scriptName, error: err.message });
    }
  });
}

// IPC Listener for frontend requests
ipcMain.on('run-python-script', (event, arg) => {
    console.log(`Frontend requested script: ${arg}`);
    runPythonScript(arg);
});

// Function to start the Python FastAPI backend automatically
function startPythonBackend() {
  const pythonPath = 'python'; 
  console.log("Iniciando Motor Backend...");
  pythonProcess = spawn(pythonPath, ['-m', 'uvicorn', 'src.backend.backend:app', '--port', '8000']);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`[GEO-SYSTEM]: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    console.error(`[GEO-ERROR]: ${msg}`);
    
    // Alerta de Antivirus / Puerto ocupado
    if(msg.includes("address already in use") || msg.includes("Access is denied")) {
        console.error("⛔ ALERTA CRÍTICA: El acceso al puerto 8000 ha sido denegado por el sistema/antivirus.");
    }
  });

  pythonProcess.on('error', (err) => {
    console.error(`[GEO-CRITICAL-FAIL]: No se pudo iniciar el proceso Python. ¿Está Python en el PATH? ${err}`);
  });
}

app.whenReady().then(() => {
  startPythonBackend(); // Motor ON
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (pythonProcess) {
    // Matar proceso en Windows de forma limpia
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', pythonProcess.pid, '/f', '/t']);
    } else {
      pythonProcess.kill();
    }
  }
  if (process.platform !== 'darwin') app.quit();
});
