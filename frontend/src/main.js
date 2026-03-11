import "leaflet/dist/leaflet.css";
import { initMap, updateMarker } from "./map";
import { db, ref, onValue } from "./firebase";
import { updateUI } from "./ui";
import "./style.css";
import Chart from "chart.js/auto";

// ─── Sensor config ────────────────────────────────────────────────────────────
const SENSORS = [
  { key: "temperature",  label: "Temperature (°C)", borderColor: "rgb(239,68,68)",  backgroundColor: "rgba(239,68,68,0.1)" },
  { key: "turbidity",    label: "Turbidity (NTU)",  borderColor: "rgb(59,130,246)", backgroundColor: "rgba(59,130,246,0.1)" },
 
  { key: "ambientLight", label: "Ambient Light (lux)", borderColor: "rgb(245,158,11)", backgroundColor: "rgba(245,158,11,0.1)" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM Ready");

  const LAT = 8.2499;
  const LNG = 80.4828;

  initMap(LAT, LNG);

  // =============================
  // STATUS LISTENER
  // =============================

  const statusRef = ref(db, "current-status");

  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    updateUI(data);
    updateMarker(data.safe);
  });

  // =============================
  // 4 INDIVIDUAL SENSOR CHARTS
  // =============================
  // Your HTML needs 4 canvas elements:
  //   <canvas id="chart-temperature"></canvas>
  //   <canvas id="chart-turbidity"></canvas>
  //   <canvas id="chart-conductivity"></canvas>
  //   <canvas id="chart-ambientLight"></canvas>

  const sensorCharts = {};

  const readingsRef = ref(db, "raw-readings");

  onValue(readingsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const readings = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);

    const labels = readings.map((r) =>
      new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    SENSORS.forEach((sensor) => {
      const ctx = document.getElementById(`chart-${sensor.key}`);
      if (!ctx) return;

      const sensorData = readings.map((r) => r[sensor.key]);

      // Destroy old chart before redrawing
      if (sensorCharts[sensor.key]) {
        sensorCharts[sensor.key].destroy();
      }

      sensorCharts[sensor.key] = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: sensor.label,
              data: sensorData,
              borderColor: sensor.borderColor,
              backgroundColor: sensor.backgroundColor,
              borderWidth: 2,
              pointRadius: 2,
              pointHoverRadius: 5,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: false },
          },
          scales: {
            x: { ticks: { maxTicksLimit: 6 } },
            y: { beginAtZero: false },
          },
        },
      });
    });
  });

  // =============================
  // WEEKLY CHART (Mon – Sun)
  // =============================
  // Your HTML needs one canvas:
  //   <canvas id="chart-weekly"></canvas>
  //
  // Option A: pull from "weekly-averages" Firebase node
  //   Expected structure:
  //     weekly-averages/
  //       0: { temperature, turbidity, conductivity, ambientLight }  ← Monday
  //       1: { ... }
  //       ...
  //       6: { ... }                                                  ← Sunday
  //
  // Option B: aggregate from raw-readings by day-of-week (uncomment block below)

  let weeklyChart;

  // --- Aggregate raw-readings by day-of-week (Mon=0 … Sun=6) ---
  onValue(readingsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const buckets = Array.from({ length: 7 }, () => ({
      count: 0, temperature: 0, turbidity: 0, conductivity: 0, ambientLight: 0,
    }));

    Object.values(data).forEach((r) => {
      const day = (new Date(r.timestamp).getDay() + 6) % 7; // Mon=0, Sun=6
      buckets[day].count++;
      SENSORS.forEach((s) => { buckets[day][s.key] += r[s.key] ?? 0; });
    });

    const averages = buckets.map((b) => {
      const avg = {};
      SENSORS.forEach((s) => { avg[s.key] = b.count ? b[s.key] / b.count : null; });
      return avg;
    });

    renderWeeklyChart(averages);
  });

  function renderWeeklyChart(weekRows) {
    const ctx = document.getElementById("chart-weekly");
    if (!ctx) return;

    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: DAYS,
        datasets: SENSORS.map((s) => ({
          label: s.label,
          data: weekRows.map((d) => d[s.key] ?? null),
          borderColor: s.borderColor,
          backgroundColor: s.backgroundColor,
          borderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Weekly Sensor Overview (Mon – Sun)",
            font: { size: 14, weight: "bold" },
          },
        },
        scales: {
          x: { ticks: { font: { weight: "600" } } },
          y: { beginAtZero: false },
        },
      },
    });
  }

});