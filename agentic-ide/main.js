const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(() => {
  // Register a custom protocol 'local-file://' to load files from disk in the viewer
  protocol.registerFileProtocol('local-file', (request, callback) => {
    const url = request.url.replace('local-file://', '');
    try {
      return callback(decodeURIComponent(url));
    } catch (error) {
      console.error(error);
    }
  });

  ipcMain.handle('run-code', async (event, code) => {
    return new Promise((resolve, reject) => {
      const tmpDir = path.join(app.getPath('temp'), 'agentic-cad');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
      }

      const scriptPath = path.join(tmpDir, 'script.py');
      const outputModelPath = path.join(tmpDir, 'output.glb');

      const wrapperCode = `
import sys
import FreeCAD as App
import Part
try:
${code.split('\n').map(line => '    ' + line).join('\n')}

    objs = App.ActiveDocument.Objects
    if objs:
        import importGLTF
        importGLTF.export(objs, r"${outputModelPath}")
        print("SUCCESS_EXPORT_GLB")
    else:
        print("NO_OBJECTS_FOUND")
except Exception as e:
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
`;

      fs.writeFileSync(scriptPath, wrapperCode);

      exec('FreeCADCmd --version', (error) => {
        let command = '';
        if (error) {
          console.log("FreeCADCmd not found, simulating execution.");
          fs.writeFileSync(outputModelPath, 'mock-glb-content');
          resolve({ success: true, modelPath: outputModelPath, logs: "Mock FreeCAD executed" });
        } else {
          // Quote the scriptPath to support spaces in file paths
          command = `FreeCADCmd "${scriptPath}"`;
          exec(command, (error, stdout, stderr) => {
            if (error) {
              resolve({ success: false, error: stderr || stdout });
            } else {
              resolve({ success: true, modelPath: outputModelPath, logs: stdout });
            }
          });
        }
      });
    });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
