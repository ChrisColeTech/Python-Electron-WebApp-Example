// VARS AND CONST
const hostname = "localhost"; // Gets the host without port
const baseUrl = `http://${hostname}:5000`; // Append the port 5000
const apiUrl = `${baseUrl}/gpu_usage/`;

const colorPalette = [
  "rgb(240, 193, 90, 0.2)",
  "rgb(240, 142, 219, 0.2)",
  "rgb(24, 90, 219, 0.2)",
  "rgb(127, 161, 195, 0.2)",
  "rgb(128, 239, 145, 0.2)",
  "rgb(245, 245, 245, 0.2)",
  "rgb(240, 142, 219, 0.2)",
  "rgb(159, 238, 209, 0.2)",
];

const borderColors = [
  "rgb(240, 193, 90)",
  "rgb(240, 142, 219)",
  "rgb(24, 90, 219)",
  "rgb(127, 161, 195)",
  "rgb(128, 239, 145)",
  "rgb(245, 245, 245)",
  "rgb(240, 142, 219)",
  "rgb(159, 238, 209)",
];

let currentChart = null; // Track the current chart instance
const MAX_DATA_POINTS = 50; // Number of data points to keep

// Custom plugin to draw fixed labels in the middle of the chart area
const fixedLabelPlugin = {
  id: "fixedLabelPlugin",
  afterDatasetsDraw(chart) {
    const { ctx, scales, data } = chart;
    ctx.save();

    const centerX = scales.x.left + scales.x.width / 2;
    const labelPositions = [];
    data.datasets[0].data.forEach((value, index) => {
      const yPos = chart.getDatasetMeta(0).data[index].y;

      // Store yPos for positioning labels
      labelPositions.push({
        x: centerX,
        y: yPos,
        value: `${value.toFixed(2)}` + `${index == 5 ? "°" : "%"}`,
      });
    });

    ctx.font = "8px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    labelPositions.forEach((label) => {
      ctx.fillText(label.value, label.x, label.y);
    });

    ctx.restore();
  },
};

// Initialize the bar chart
function initializeBarChart() {
  localStorage.setItem("active-chart", "bar");
  const chartContainer = document.getElementById("chart-container");
  const existingCanvas = document.getElementById("usage-chart");
  const chartWrapper = document.getElementById("chart-wrapper");
  if (existingCanvas) {
    chartContainer.removeChild(existingCanvas);
  }

  // Create a new canvas element
  const newCanvas = document.createElement("canvas");
  newCanvas.id = "usage-chart";
  newCanvas.classList.add("bar"); // Add the class directly to the canvas element
  chartContainer.appendChild(newCanvas);

  const ctx = newCanvas.getContext("2d");
  $(chartWrapper).hide();

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["CPU", "RAM", "GPU", "VRAM", "HDD", "TEMP"],
      datasets: [
        {
          label: "Usage",
          data: [0, 0, 0, 0, 0],
          barPercentage: 0.8, // Adjust space occupied by bars
          categoryPercentage: 1, // Adjust space between bars
          backgroundColor: function (context) {
            const value = context.dataset.data[context.dataIndex];
            return value > 90 ? "#D9534F" : colorPalette[context.dataIndex];
          },
          borderColor: function (context) {
            const value = context.dataset.data[context.dataIndex];
            return value > 90 ? "#D9534F" : borderColors[context.dataIndex];
          },
          borderWidth: 1.5,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal bars
      scales: {
        x: {
          grid: {
            display: false, // Hide all grid lines
          },
          border: {
            display: false, // Hide all grid lines
          },
          beginAtZero: true,
          max: 100,
          ticks: {
            color: "#ffffff",
            font: {
              size: 7,
              weight: 600,
            },
            align: "center",
            callback: function (value, index, ticks) {
              return value + "%";
            },
          },
        },
        y: {
          grid: {
            display: false,
          },
          border: {
            color: "#ffffff30",
            width: 1, // Width of the axis border
          },
          ticks: {
            color: "#FFFFFF",
            crossAlign: "far",
            font: {
              weight: 600,
            },
            // Specify the maximum number of ticks to show
            maxTicksLimit: 10,
            // Control the step size between ticks
            stepSize: 1,
            // Optional: Set font size and other style properties
            font: {
              size: 7,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
    plugins: [fixedLabelPlugin], // Register the custom plugins
  });

  currentChart.options.animation = true;
  const legendContainer = document.getElementById("custom-legend");
  legendContainer.innerHTML = "";

  document.getElementById("settingsMenu").classList.remove("show"); // Hide the menu

  document.querySelectorAll("canvas").forEach((row) => {
    row.classList.remove("no-drag");
    row.classList.add("drag");
  });

  window.addEventListener("resize", () => {
    currentChart.resize();
  });
  $(chartWrapper).fadeIn(300);
}

// Initialize the line chart
function initializeLineChart() {
  localStorage.setItem("active-chart", "line");
  const existingCanvas = document.getElementById("usage-chart");
  const chartContainer = document.getElementById("chart-container");
  const chartWrapper = document.getElementById("chart-wrapper");
  if (existingCanvas) {
    chartContainer.removeChild(existingCanvas);
  }

  // Create a new canvas element
  const newCanvas = document.createElement("canvas");
  newCanvas.id = "usage-chart";
  newCanvas.classList.add("line"); // Add the class directly to the canvas element
  chartContainer.appendChild(newCanvas);
  $(chartWrapper).hide();

  const ctx = newCanvas.getContext("2d");

  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "CPU",
          data: [],
          borderColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return borderColors[datasetIndex % borderColors.length];
          },
          borderWidth: 1.5,
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return colorPalette[datasetIndex % borderColors.length];
          },
          fill: false,
          tension: 0.1,
        },
        {
          label: "RAM",
          data: [],
          borderColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return borderColors[datasetIndex % borderColors.length];
          },
          borderWidth: 1.5,
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return colorPalette[datasetIndex % borderColors.length];
          },
          fill: false,
          tension: 0.1,
        },
        {
          label: "GPU",
          data: [],
          borderColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return borderColors[datasetIndex % borderColors.length];
          },
          borderWidth: 1.5,
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return colorPalette[datasetIndex % borderColors.length];
          },
          fill: false,
          tension: 0.1,
        },
        {
          label: "VRAM",
          data: [],
          borderColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return borderColors[datasetIndex % borderColors.length];
          },
          borderWidth: 1.5,
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return colorPalette[datasetIndex % borderColors.length];
          },
          fill: false,
          tension: 0.1,
        },
        {
          label: "HDD",
          data: [],
          borderColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return borderColors[datasetIndex % borderColors.length];
          },
          borderWidth: 1.5,
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return colorPalette[datasetIndex % borderColors.length];
          },
          fill: false,
          tension: 0.1,
        },
        {
          label: "TEMP",
          data: [],
          borderColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return borderColors[datasetIndex % borderColors.length];
          },
          borderWidth: 1.5,
          backgroundColor: function (context) {
            const dataset = context.dataset;
            const datasetIndex = context.datasetIndex;
            const shouldUseRed = dataset.data.some((value) => value > 90);

            if (shouldUseRed) {
              return "#D9534F"; // Return red color if any value exceeds 90
            }
            return colorPalette[datasetIndex % borderColors.length];
          },
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      animation: {
        enabled: false,
        tension: {
          duration: 1000,
          easing: "linear",
          from: 1,
          to: 0,
          loop: true,
        },
      },
      elements: {
        point: {
          radius: 0,
        },
      },
      scales: {
        x: {
          ticks: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: "#FFFFFF",
            crossAlign: "far",
            padding: 0,
            font: {
              weight: 600,
              size: 7,
            },
            callback: function (value, index, ticks) {
              return value + "%";
            },
          },
        },
      },
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            generateLabels: false,
          },
        },
        title: {
          display: false,
        },
      },
    },
  });

  currentChart.options.animation = false;
  generateCustomLegend();
  document.getElementById("settingsMenu").classList.remove("show"); // Hide the menu

  window.addEventListener("resize", () => {
    currentChart.resize();
  });
  $(chartWrapper).fadeIn(300);
}

function generateCustomLegend() {
  const legendContainer = document.getElementById("custom-legend");
  legendContainer.innerHTML = "";

  currentChart.data.datasets.forEach((dataset, index) => {
    const legendItem = document.createElement("div");
    legendItem.className = "custom-legend-item";

    // Create text element
    const legendText = document.createElement("span");
    legendText.className = "custom-legend-text";
    legendText.textContent = dataset.label;
    const shouldUseRed = dataset.data.some((value) => value > 90);
    legendText.style.color = shouldUseRed
      ? "#D9534F"
      : `${borderColors[index]}`;

    legendText.style.fontWeight = shouldUseRed ? "700" : `400`;
    legendText.style.fontSize = "10px";

    legendItem.appendChild(legendText);
    legendContainer.appendChild(legendItem);
  });
}
async function updateUsage() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const timestamp = new Date();

    if (currentChart) {
      if (currentChart.config.type === "bar") {
        // Update data for bar chart
        currentChart.data.datasets[0].data = [
          data.cpu,
          data.ram,
          data.gpu,
          data.vram,
          data.hdd,
          data.temp,
        ];
      } else if (currentChart.config.type === "line") {
        // Update data for line chart
        currentChart.data.labels.push(timestamp);
        currentChart.data.datasets[0].data.push(data.cpu);
        currentChart.data.datasets[1].data.push(data.ram);
        currentChart.data.datasets[2].data.push(data.gpu);
        currentChart.data.datasets[3].data.push(data.vram);
        currentChart.data.datasets[4].data.push(data.hdd);
        currentChart.data.datasets[5].data.push(data.temp);

        // Prune old data if the number of points exceeds the limit
        if (currentChart.data.labels.length > MAX_DATA_POINTS) {
          currentChart.data.labels.shift(); // Remove the oldest label
          currentChart.data.datasets.forEach((dataset) => dataset.data.shift()); // Remove the oldest data points
        }
        generateCustomLegend();
      }

      // Update the chart with new data
      currentChart.update();
    }
  } catch (error) {
    console.error("Failed to fetch usage data.", error);
  }
}

let intervalId; // Variable to store the interval ID
// Function to start the interval
function startInterval() {
  intervalId = setInterval(updateUsage, 500);
}
// Function to stop the interval
function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null; // Optional: Reset intervalId to indicate no active interval
  }
}
