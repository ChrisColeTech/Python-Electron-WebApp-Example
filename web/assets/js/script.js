// ELECTRON FUNCTIONS //
// Function to animate window movement
function animateWindowMove(targetX, targetY, duration = 500) {
  window.electron
    .getWindowBounds()
    .then(async (startBounds) => {
      const startX = startBounds.x;
      const startY = startBounds.y;
      const startTime = Date.now();

      // Get the work area
      const display = await window.electron.getDisplayBounds();
      const workArea = {
        x: display.workArea.x,
        y: display.workArea.y,
        width: display.workArea.width,
        height: display.workArea.height,
      };

      function update() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const newX = startX + (targetX - startX) * progress;
        const newY = startY + (targetY - startY) * progress;

        // Ensure the window stays within the work area
        const adjustedX = Math.min(
          Math.max(newX, workArea.x),
          workArea.x + workArea.width - startBounds.width
        );
        const adjustedY = Math.min(
          Math.max(newY, workArea.y),
          workArea.y + workArea.height - startBounds.height
        );

        window.electron.setWindowBounds({
          x: Math.round(adjustedX),
          y: Math.round(adjustedY),
          width: startBounds.width,
          height: startBounds.height,
        });

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          // Ensure final position is set correctly
          window.electron.setWindowBounds({
            x: adjustedX,
            y: adjustedY,
            width: startBounds.width,
            height: startBounds.height,
          });
        }
      }

      update();
    })
    .catch((error) => console.error("Failed to get window bounds:", error));
}

function animateWindowBounds(
  targetX,
  targetY,
  targetWidth,
  targetHeight,
  duration = 500
) {
  return new Promise((resolve) => {
    window.electron
      .getWindowBounds()
      .then((startBounds) => {
        const startX = startBounds.x;
        const startY = startBounds.y;
        const startWidth = startBounds.width;
        const startHeight = startBounds.height;
        const startTime = Date.now();

        function update() {
          const elapsedTime = Date.now() - startTime;
          const progress = Math.min(elapsedTime / duration, 1);

          const newX = startX + (targetX - startX) * progress;
          const newY = startY + (targetY - startY) * progress;
          const newWidth = startWidth + (targetWidth - startWidth) * progress;
          const newHeight =
            startHeight + (targetHeight - startHeight) * progress;

          window.electron.setWindowBounds({
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          });

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            resolve();
          }
        }

        update();
      })
      .catch((error) => console.error("Failed to get window bounds:", error));
  });
}

function animateWindowResize(targetWidth, targetHeight, duration = 500) {
  return new Promise((resolve) => {
    window.electron
      .getWindowBounds()
      .then((startBounds) => {
        const startWidth = startBounds.width;
        const startHeight = startBounds.height;
        const startTime = Date.now();

        function update() {
          const elapsedTime = Date.now() - startTime;
          const progress = Math.min(elapsedTime / duration, 1);

          const newWidth = startWidth + (targetWidth - startWidth) * progress;
          const newHeight =
            startHeight + (targetHeight - startHeight) * progress;

          window.electron.setWindowBounds({
            x: startBounds.x, // Keep the x position unchanged
            y: startBounds.y, // Keep the y position unchanged
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          });

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            resolve();
          }
        }

        update();
      })
      .catch((error) => console.error("Failed to get window bounds:", error));
  });
}

// Handle IPC events
window.electron
  .getDisplayBounds()
  .then((displayBounds) => {
    // Handle move-to-center event
    window.electron.ipcRenderer.on("move-to-center", () => {
      window.electron
        .getWindowBounds()
        .then((windowBounds) => {
          const centerX =
            displayBounds.x + (displayBounds.width - windowBounds.width) / 2;
          const centerY =
            displayBounds.y + (displayBounds.height - windowBounds.height) / 2;
          animateWindowMove(centerX, centerY, 300);
        })
        .catch((error) => console.error("Failed to get window bounds:", error));
    });
  })
  .catch((error) => console.error("Failed to get display bounds:", error));

// HELPER FUNCTIONS //

if (
  localStorage.getItem("lastClass") &&
  localStorage.getItem("lastInactiveClass")
) {
  var lastClass = JSON.parse(localStorage.getItem("lastClass"));
  var lastInactiveClass = JSON.parse(localStorage.getItem("lastInactiveClass"));
  addCSS(lastInactiveClass.key, lastInactiveClass.values[0]);
  addCSS(lastClass.key, lastClass.values[0]);
}

function getCSSRule(ruleName) {
  ruleName = ruleName.toLowerCase();
  var result = null;
  var find = Array.prototype.find;

  Array.prototype.find.call(document.styleSheets, (styleSheet) => {
    try {
      if (styleSheet.cssRules) {
        result = find.call(styleSheet.cssRules, (cssRule) => {
          return (
            cssRule instanceof CSSStyleRule &&
            cssRule.selectorText.toLowerCase() == ruleName
          );
        });
      }
    } catch (e) {
      // Handle cross-origin or other access errors
      // console.info("Cannot access cssRules for stylesheet:", e);
    }
    return result != null;
  });
  return result;
}

function addCSS(selector, styles) {
  var rule = getCSSRule(selector);

  for (var property in styles) {
    if (styles.hasOwnProperty(property)) {
      rule.style.setProperty(property, styles[property], "important");
    }
  }
}

function updateCSS(selector, styles) {
  var button = getCSSRule(selector);
  button.style.setProperty("bottom", styles.bottom, "important");
  button.style.setProperty("right", styles.right, "important");
}

window.barChart = async function () {
  checkForUpdates("active-chart", "bar");
  await updateChartSize();
  moveToCenter();
};

window.lineChart = async function () {
  checkForUpdates("active-chart", "line");
  await updateChartSize();
  moveToCenter();
};

window.smallChart = async function () {
  checkForUpdates("chart-size", "small");
  await updateChartSize();
  moveToCenter();
};

window.mediumChart = async function () {
  checkForUpdates("chart-size", "medium");
  await updateChartSize();
  moveToCenter();
};

window.largeChart = async function () {
  checkForUpdates("perf-monitor-position", "center");
  checkForUpdates("chart-size", "large");
  await updateChartSize();
  moveToCenter();
};

function moveToCenter() {
  if (localStorage.getItem("perf-monitor-position") === "center") {
    setTimeout(() => {
      window.electron.ipcRenderer.send("move-to-center");
    }, 150);
  }
}
function checkForUpdates(key, value) {
  var previous = localStorage.getItem(key);
  var updated = previous != value;
  localStorage.setItem("hasUpdates", updated);
  localStorage.setItem(key, value);
}

async function isWindowOutsideWorkingArea() {
  const size = localStorage.getItem("chart-size") ?? "small";
  const sizes = getSizes();
  const sizeStyles = sizes[size];
  const buttonHeight = +sizeStyles.height;
  const buttonWidth = +sizeStyles.width;

  // Get display bounds
  const displayBounds = await window.electron.getDisplayBounds();
  const windowBounds = await window.electron.getWindowBounds();

  const windowLeft = windowBounds.x;
  const windowTop = windowBounds.y;
  const windowRight = windowLeft + buttonWidth;
  const windowBottom = windowTop + buttonHeight;

  const displayLeft = displayBounds.x;
  const displayTop = displayBounds.y;
  const displayRight = displayLeft + displayBounds.workArea.width;
  const displayBottom = displayTop + displayBounds.workArea.height;
  let isOutside =
    windowLeft < displayLeft ||
    windowTop < displayTop ||
    windowRight > displayRight ||
    windowBottom > displayBottom;

  if (isOutside) {
    console.log("The window is outside the working area.");
  } else {
    console.log("The window is within the working area.");
  }

  return isOutside;
}

function getSizes() {
  const savedChart = localStorage.getItem("active-chart") ?? "bar";
  var sizes = {};
  if (savedChart == "bar") {
    sizes = {
      small: { height: "150", width: "180" },
      medium: { height: "350", width: "450" },
      large: { height: "500", width: "700" },
    };
  } else {
    sizes = {
      small: { height: "110", width: "160" },
      medium: { height: "245", width: "425" },
      large: { height: "380", width: "700" },
    };
  }
  return sizes;
}

// Listen for window-moving event
electron.onWindowMoving((bounds) => {
  // Perform actions based on the window moving state
});

// Listen for window-moved event
electron.onWindowMoved(async (bounds) => {
  console.log("Window has been moved:", bounds);
  // Perform actions based on the window moved state
  await getNearestPosition();
});
// SETTINGS MENU //
// POSITIONS BUTTONS
document.querySelectorAll(".position-clickable").forEach((button) => {
  button.addEventListener("click", async function () {
    const position = this.id;

    localStorage.setItem("perf-monitor-position", position);

    // Get display bounds
    const display = await window.electron.getDisplayBounds();
    const windowBounds = await window.electron.getWindowBounds();

    // Define positions based on work area
    const positions = {
      "bottom-right": {
        x: display.workArea.x + display.workArea.width - windowBounds.width,
        y: display.workArea.y + display.workArea.height - windowBounds.height,
      },
      "bottom-left": {
        x: display.workArea.x,
        y: display.workArea.y + display.workArea.height - windowBounds.height,
      },
      "bottom-center": {
        x:
          display.workArea.x +
          (display.workArea.width - windowBounds.width) / 2,
        y: display.workArea.y + display.workArea.height - windowBounds.height,
      },
      "top-right": {
        x: display.workArea.x + display.workArea.width - windowBounds.width,
        y: display.workArea.y,
      },
      "top-left": { x: display.workArea.x, y: display.workArea.y },
      "top-center": {
        x:
          display.workArea.x +
          (display.workArea.width - windowBounds.width) / 2,
        y: display.workArea.y,
      },
      "left-center": {
        x: display.workArea.x,
        y:
          display.workArea.y +
          (display.workArea.height - windowBounds.height) / 2,
      },
      "right-center": {
        x: display.workArea.x + display.workArea.width - windowBounds.width,
        y:
          display.workArea.y +
          (display.workArea.height - windowBounds.height) / 2,
      },
    };

    const pos = positions[position];
    if (pos) {
      // Animate the window move
      animateWindowMove(pos.x, pos.y);
    } else {
      console.error("Invalid position:", position);
    }

    // Optionally hide the settings menu and adjust UI
    const settingsMenu = document.getElementById("settingsMenu");
    settingsMenu.classList.remove("show"); // Hide the menu if visible

    document.querySelectorAll(".chart-row").forEach((row) => {
      row.classList.remove("no-drag");
      row.classList.add("drag");
    });
  });
});

// Show or hide the settings menu when the settings icon is clicked
document
  .getElementById("popupTrigger")
  .addEventListener("click", function (event) {
    const settingsMenu = document.getElementById("settingsMenu");
    settingsMenu.classList.toggle("show"); // Toggle the 'show' class for animation

    document.querySelectorAll(".chart-row").forEach((row) => {
      row.classList.add("no-drag");
      row.classList.remove("drag");
    });
    document.querySelectorAll("canvas").forEach((row) => {
      row.classList.add("no-drag");
      row.classList.remove("drag");
    });
    setTimeout(() => {
      const settingsMenuHr = document.getElementById("settings-hr");
      settingsMenuHr.classList.add("show"); // Toggle the 'show' class for animation
    }, 300);

    event.stopPropagation();
  });

// Hide the settings menu when clicking outside
window.addEventListener("click", function (e) {
  if (e.target.className.includes("settings")) {
    return;
  }

  const settingsMenu = document.getElementById("settingsMenu");
  const trigger = document.getElementById("popupTrigger");
  if (!settingsMenu.contains(e.target) && e.target !== trigger) {
    settingsMenu.classList.remove("show"); // Hide the menu if clicking outside
  }
  document.querySelectorAll("canvas").forEach((row) => {
    row.classList.remove("no-drag");
    row.classList.add("drag");
  });
  document.querySelectorAll(".chart-row").forEach((row) => {
    row.classList.remove("no-drag");
    row.classList.add("drag");
  });
});

// Calculate if the menu will overflow the bottom of the viewport
document.getElementById("popupTrigger").addEventListener("click", function () {
  const menu = document.getElementById("settingsMenu");
  const menuRect = menu.getBoundingClientRect();
  const buttonRect = this.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  if (menu.offsetTop < 0) {
    menu.style.position = "absolute";
    menu.style.top = `29px`;
  }
  let topPosition = buttonRect.bottom;
  if (topPosition + menuRect.height > viewportHeight) {
    // Calculate how much the menu overflows the viewport
    const overflowAmount = topPosition + menuRect.height - viewportHeight;
    // Apply the calculated position
    menu.style.position = "absolute"; // Ensure the menu is positioned absolutely
    menu.style.top = `-${overflowAmount}px`;
  }
});

// MAIN METHODS //

async function getCoordinates() {
  var position = localStorage.getItem("perf-monitor-position");
  const size = localStorage.getItem("chart-size") ?? "small";
  const sizes = getSizes();
  const sizeStyles = sizes[size];
  const buttonHeight = +sizeStyles.height;
  const buttonWidth = +sizeStyles.width;
  // Get display bounds
  const display = await window.electron.getDisplayBounds();
  const windowBounds = await window.electron.getWindowBounds();

  // Define positions based on work area
  const positions = {
    "bottom-right": {
      x: display.workArea.x + display.workArea.width - buttonWidth,
      y: display.workArea.y + display.workArea.height - buttonHeight,
    },
    "bottom-left": {
      x: display.workArea.x,
      y: display.workArea.y + display.workArea.height - buttonHeight,
    },
    "bottom-center": {
      x: display.workArea.x + (display.workArea.width - buttonWidth) / 2,
      y: display.workArea.y + display.workArea.height - buttonHeight,
    },
    "top-right": {
      x: display.workArea.x + display.workArea.width - buttonWidth,
      y: display.workArea.y,
    },
    "top-left": { x: display.workArea.x, y: display.workArea.y },
    "top-center": {
      x: display.workArea.x + (display.workArea.width - buttonWidth) / 2,
      y: display.workArea.y,
    },
    "left-center": {
      x: display.workArea.x,
      y: display.workArea.y + (display.workArea.height - buttonHeight) / 2,
    },
    "right-center": {
      x: display.workArea.x + display.workArea.width - buttonWidth,
      y: display.workArea.y + (display.workArea.height - buttonHeight) / 2,
    },
    center: {
      x: display.x + (display.width - buttonWidth) / 2,
      y: display.y + (display.height - buttonHeight) / 2,
    },
  };

  var hw = buttonWidth / 2;
  var hh = buttonHeight / 2;
  const windowCenter = {
    x: windowBounds.x + hw,
    y: windowBounds.y + hh,
  };
  const workAreaCenter = {
    x: display.workArea.x + display.workArea.width / 2,
    y: display.workArea.y + display.workArea.height / 2,
  };
  const distanceToCenter = {
    x: Math.abs(workAreaCenter.x - windowCenter.x),
    y: Math.abs(workAreaCenter.y - windowCenter.y),
  };
  const threshold = 100; // Define a threshold to determine proximity

  if (distanceToCenter.x < threshold && distanceToCenter.y < threshold) {
    position = "center";
  }

  const pos = positions[position];
  return pos;
}

async function getNearestPosition() {
  const size = localStorage.getItem("chart-size") ?? "small";
  const sizes = getSizes();
  const sizeStyles = sizes[size];
  const buttonHeight = +sizeStyles.height + 25;
  const buttonWidth = +sizeStyles.width + 25;

  // Get display bounds
  const display = await window.electron.getDisplayBounds();
  const windowBounds = await window.electron.getWindowBounds();

  // Define positions based on work area
  const positions = {
    "bottom-right": {
      x: display.workArea.x + display.workArea.width - buttonWidth,
      y: display.workArea.y + display.workArea.height - buttonHeight,
    },
    "bottom-left": {
      x: display.workArea.x,
      y: display.workArea.y + display.workArea.height - buttonHeight,
    },
    "bottom-center": {
      x: display.workArea.x + (display.workArea.width - buttonWidth) / 2,
      y: display.workArea.y + display.workArea.height - buttonHeight,
    },
    "top-right": {
      x: display.workArea.x + display.workArea.width - buttonWidth,
      y: display.workArea.y,
    },
    "top-left": { x: display.workArea.x, y: display.workArea.y },
    "top-center": {
      x: display.workArea.x + (display.workArea.width - buttonWidth) / 2,
      y: display.workArea.y,
    },
    "left-center": {
      x: display.workArea.x,
      y: display.workArea.y + (display.workArea.height - buttonHeight) / 2,
    },
    "right-center": {
      x: display.workArea.x + display.workArea.width - buttonWidth,
      y: display.workArea.y + (display.workArea.height - buttonHeight) / 2,
    },
    center: {
      x: display.workArea.x + display.workArea.width / 2,
      y: display.workArea.y + display.workArea.height / 2,
    },
  };

  // Get current window position
  const currentX = windowBounds.x;
  let currentY = windowBounds.y;

  const windowCenter = {
    x: windowBounds.x + buttonWidth / 2,
    y: windowBounds.y + buttonHeight / 2,
  };
  const workAreaCenter = {
    x: display.workArea.x + display.workArea.width / 2,
    y: display.workArea.y + display.workArea.height / 2,
  };
  const distanceToCenter = {
    x: Math.abs(workAreaCenter.x - windowCenter.x),
    y: Math.abs(workAreaCenter.y - windowCenter.y),
  };
  const threshold = 100; // Define a threshold to determine proximity

  let nearestPosition = null;
  if (distanceToCenter.x < threshold && distanceToCenter.y < threshold) {
    nearestPosition = "center";
  } else {
    // Function to calculate distance
    function calculateDistance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Find the nearest position
    let minDistance = Infinity;

    for (const [key, pos] of Object.entries(positions)) {
      // Adjust for edge cases
      const adjustedPosX = Math.max(
        display.workArea.x,
        Math.min(
          pos.x,
          display.workArea.x + display.workArea.width - buttonWidth
        )
      );
      const adjustedPosY = Math.max(
        display.workArea.y,
        Math.min(
          pos.y,
          display.workArea.y + display.workArea.height - buttonHeight
        )
      );

      const distance = calculateDistance(
        currentX,
        currentY,
        adjustedPosX,
        adjustedPosY
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPosition = key;
      }
    }
  }

  // Output or use the nearest position
  console.log("Nearest position:", nearestPosition);
  // Set the position
  const pos = positions[nearestPosition];
  localStorage.setItem("perf-monitor-position", nearestPosition);

  return pos;
}

async function updateChartSize() {
  const settingsMenu = document.getElementById("settingsMenu");
  settingsMenu.classList.remove("show"); // Hide the menu if visible
  $("#chart-wrapper").fadeOut();
  document.querySelectorAll(".chart-row").forEach((row) => {
    row.classList.remove("no-drag");
    row.classList.add("drag");
  });

  document.querySelectorAll("canvas").forEach((row) => {
    row.classList.remove("no-drag");
    row.classList.add("drag");
  });

  const size = localStorage.getItem("chart-size") ?? "small";
  const chartContainer = document.getElementById("chart-container");
  const savedChart = localStorage.getItem("active-chart") ?? "bar";

  chartContainer.classList.remove("small", "medium", "large", "bar", "line");
  chartContainer.classList.add(size);
  chartContainer.classList.add(savedChart);

  const sizes = getSizes();
  const sizeStyles = sizes[size];
  const buttonHeight = +sizeStyles.height;
  const buttonWidth = +sizeStyles.width;

  // Check if the window is outside the working area
  const isOutside = await isWindowOutsideWorkingArea();
  const coords = await getCoordinates();
  const pos = coords;
  var position = localStorage.getItem("perf-monitor-position");

  if (pos && isOutside) {
    // Animate the window resize and move
    await animateWindowBounds(
      pos.x,
      pos.y,
      buttonWidth + 25,
      buttonHeight + 25,
      400
    );
  } else {
    if (position === "center") {
      // Animate the window resize to the final dimensions
      await animateWindowResize(buttonWidth + 25, buttonHeight + 25, 300);
      moveToCenter();
    } else {
      // Animate the window resize to the final dimensions
      await animateWindowResize(buttonWidth + 25, buttonHeight + 25, 300);
    }
  }

  var sizeClasses = ["small", "medium", "large"];

  const chartButton = document.getElementById("chart-button");
  chartButton.classList.add(size);
  sizeClasses.forEach((prop) => {
    if (prop != size) {
      chartButton.classList.remove(prop);
    }
  });

  var actulaButtonHeight = 0;

  viewportHeight = +buttonHeight + 25;
  viewportWidth = +buttonWidth + 25;

  switch (size) {
    case "small":
      actulaButtonHeight = viewportHeight * 0.83;
      actualButtonWidth = viewportWidth * 0.83;
      break;
    case "medium":
      actulaButtonHeight = viewportHeight * 0.93;
      actualButtonWidth = viewportWidth * 0.93;
      break;
    default:
      actulaButtonHeight = viewportHeight * 0.96;
      actualButtonWidth = viewportWidth * 0.96;
      break;
  }

  const bottom = `12.5px`;
  const right = `12.5px`;

  $(chartButton).each(function () {
    this.style.setProperty("bottom", bottom, "important");
    this.style.setProperty("right", right, "important");

    if (size === "large") {
      this.style.setProperty("background-color", ` #000000d6`, "important");
    } else {
      this.style.setProperty("background-color", ` #00000096`, "important");
    }
  });

  const hasUpdates = localStorage.getItem("hasUpdates") ?? "false";

  if (hasUpdates === "true") {
    if (savedChart == "bar") {
      $(chartContainer).each(function () {
        this.style.setProperty(
          "height",
          `${actulaButtonHeight * 0.95}px`,
          "important"
        );
      });

      initializeBarChart();
    } else {
      initializeLineChart();
    }
  } else {
    $("#chart-wrapper").fadeIn();
  }
  localStorage.setItem("hasUpdates", "false");

  const active = `#chart-button.top-left.active`;
  positionStyles = {
    bottom: bottom,
    right: right,
  };
  var lastClass = {
    key: active,
    values: [positionStyles],
  };
  var lastClassString = JSON.stringify(lastClass);
  localStorage.setItem("lastClass", lastClassString);
}

setTimeout(() => {
  const chartButton = document.getElementById("chart-button");
  chartButton.classList.add("bottom-left");
  showPerfMonitor();
}, 1000);

var shouldShowPerfMonitor = false;

window.showPerfMonitor = async function () {
  shouldShowPerfMonitor = !shouldShowPerfMonitor;
  localStorage.setItem("shouldShowPerfMonitor", shouldShowPerfMonitor);
  const chartButton = document.getElementById("chart-button");
  const chartWrapper = document.getElementById("chart-wrapper");

  if (shouldShowPerfMonitor === true) {
    localStorage.setItem("hasUpdates", "true");
    startInterval();
    await updateChartSize();
  } else {
    setTimeout(() => {
      stopInterval();
    }, 500);
    chartButton.classList.remove("small", "medium", "large");
    $(chartWrapper).fadeOut();
  }

  $(chartButton).toggleClass("active");
};

// when the close button is clicked
document.getElementById("close-button").addEventListener("click", function () {
  document.getElementById("settingsMenu").classList.remove("show"); // Hide the menu
  document.querySelectorAll(".chart-row").forEach((row) => {
    row.classList.remove("no-drag");
    row.classList.add("drag");
  });
  showPerfMonitor();
  setTimeout(() => {
    window.electron.ipcRenderer.send("close-window");
  }, 500);
});
