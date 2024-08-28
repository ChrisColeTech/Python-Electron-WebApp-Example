const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let pythonProcess;
let mainWindow;

function startPythonServer() {
  const scriptPath = path.join(__dirname, "api", "http_server.py");
  console.log(`Starting Python server with script at: ${scriptPath}`);

  pythonProcess = spawn("python", [scriptPath]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on("error", (error) => {
    console.error(`Failed to start Python process: ${error.message}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    if (code !== 0) {
      console.error("Python process exited with an error.");
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    transparent: true,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    backgroundColor: "rgba(0, 0, 0, 0)",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(
    path.join(
      __dirname,
      "web",
      "templates",
      "perf-monitor",
      "perf-monitor.html"
    )
  );

  mainWindow.webContents.openDevTools({ mode: "undocked" });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Event listener for when the window is about to move
  mainWindow.on("will-move", (event, newBounds) => {
    // console.log("Window is about to move to:", newBounds);
    // You can handle the event here if needed
  });

  // Event listener for when the window is moving
  mainWindow.on("move", () => {
    const bounds = mainWindow.getBounds();
    // console.log("Window is moving to:", bounds);
    // Send the new position to the renderer process if needed
    mainWindow.webContents.send("window-moving", bounds);
  });

  // Event listener for when the window has been moved
  mainWindow.on("moved", () => {
    const bounds = mainWindow.getBounds();
    console.log("Window has been moved to:", bounds);
    // Send the new position to the renderer process if needed
    mainWindow.webContents.send("window-moved", bounds);
  });
}

// IPC handler to get display bounds
ipcMain.handle("get-display-bounds", () => {
  const display = screen.getPrimaryDisplay();
  return {
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    workArea: {
      x: display.workArea.x,
      y: display.workArea.y,
      width: display.workArea.width,
      height: display.workArea.height,
    },
  };
});

ipcMain.on("resize-to-fit-content", (event, { width, height }) => {
  if (mainWindow) {
    // Validate and convert width and height to numbers
    const newWidth = Number(width) + 25;
    const newHeight = Number(height) + 25;

    if (!isNaN(newWidth) && !isNaN(newHeight)) {
      // Set new size
      // mainWindow.setMinimumSize({ height: newWidth, width: newHeight });
      mainWindow.setResizable(true);
      mainWindow.setSize(newWidth, newHeight);
      mainWindow.setResizable(false);
      console.log("Window resized to:", { width: newWidth, height: newHeight });
    } else {
      console.error("Invalid width or height provided:", width, height);
    }
  }
});

// IPC to move window to center
ipcMain.on("move-to-center", () => {
  if (mainWindow) {
    mainWindow.webContents.send("move-to-center");
  }
});

// IPC to move window to a specific position
ipcMain.on("move-to", (event, position) => {
  if (mainWindow) {
    mainWindow.webContents.send("move-to", position);
  }
});

// IPC handler to get window bounds
ipcMain.handle("get-window-bounds", () => {
  if (mainWindow) {
    return mainWindow.getBounds();
  }
  return null;
});

// IPC to set window bounds
ipcMain.on("set-window-bounds", (event, bounds) => {
  if (mainWindow) {
    mainWindow.setBounds(bounds);
  }
});

app.whenReady().then(() => {
  startPythonServer(); // Start the Python server

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

ipcMain.on("minimize-window", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on("close-window", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on("restart-app", () => {
  app.relaunch(); // Restart the app
  app.exit(); // Close the current instance
});

ipcMain.on("open-settings", () => {
  // Handle opening the settings window or dialog
});
