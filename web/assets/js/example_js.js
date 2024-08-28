// scripts.js
document.addEventListener("DOMContentLoaded", () => {
  const fetchDataButton = document.getElementById("fetchData");
  const restartButton = document.getElementById("restartApp");
  const minimizeButton = document.getElementById("minimizeButton");
  const closeButton = document.getElementById("closeButton");
  const settingsButton = document.getElementById("settingsButton");
  const dataContainer = document.getElementById("dataContainer");

  // Fetch data from the backend
  fetchDataButton.addEventListener("click", () => {
    fetch("http://localhost:5000/api/data")
      .then((response) => response.json())
      .then((data) => {
        dataContainer.innerHTML = `<p>${data.message}</p>`;
      })
      .catch((error) => {
        dataContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
      });
  });

  // Restart the app
  restartButton.addEventListener("click", () => {
    window.electron.ipcRenderer.send("restart-app");
  });

  // Minimize the window
  minimizeButton.addEventListener("click", () => {
    window.electron.ipcRenderer.send("minimize-window");
  });

  // Close the window
  closeButton.addEventListener("click", () => {
    window.electron.ipcRenderer.send("close-window");
  });

  // Open settings
  settingsButton.addEventListener("click", () => {
    window.electron.ipcRenderer.send("open-settings");
  });
});
