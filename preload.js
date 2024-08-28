const { contextBridge, ipcRenderer } = require("electron");

// Expose IPC methods to the renderer process
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) =>
      ipcRenderer.on(channel, (event, ...args) => func(...args)),
  },

  // Custom methods for resizing and moving the window
  getDisplayBounds: () => ipcRenderer.invoke("get-display-bounds"),
  getWindowBounds: () => ipcRenderer.invoke("get-window-bounds"),
  setWindowBounds: (bounds) => ipcRenderer.send("set-window-bounds", bounds),
  moveTo: (position) => ipcRenderer.invoke("move-to", position),
  moveToCenter: () => ipcRenderer.send("move-to-center"),
  resizeToFitContent: (width, height) =>
    ipcRenderer.send("resize-to-fit-content", { width, height }),

  // New methods for detecting window movement
  onWindowMoving: (callback) =>
    ipcRenderer.on("window-moving", (event, bounds) => callback(bounds)),
  onWindowMoved: (callback) =>
    ipcRenderer.on("window-moved", (event, bounds) => callback(bounds)),
});
