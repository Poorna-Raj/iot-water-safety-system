import "leaflet/dist/leaflet.css";
import { initMap, updateMarker } from "./map";
import { db, ref, onValue } from "./firebase";
import { updateUI } from "./ui";
import "./style.css";
import Chart from "chart.js/auto";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Ready");

  const LAT = 8.2499;   // 8°15' north approx
  const LNG = 80.4828;  // 80°28' east approx

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
  // GRAPH LISTENER
  // =============================

  const readingsRef = ref(db, "raw-readings");

  const charts = {};

  onValue(readingsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const readings = Object.values(data);
    readings.sort((a, b) => a.timestamp - b.timestamp);

    const labels = readings.map((r) =>
      new Date(r.timestamp).toLocaleTimeString()
    );

    createOrUpdateChart(
      "tempChart",
      "Temperature (°C)",
      labels,
      readings.map((r) => r.temperature)
    );

    createOrUpdateChart(
      "turbChart",
      "Turbidity",
      labels,
      readings.map((r) => r.turbidity)
    );

    createOrUpdateChart(
      "condChart",
      "Conductivity",
      labels,
      readings.map((r) => r.conductivity)
    );

    createOrUpdateChart(
      "lightChart",
      "Ambient Light",
      labels,
      readings.map((r) => r.ambientLight)
    );
  });

  function createOrUpdateChart(id, label, labels, data) {
    const ctx = document.getElementById(id);
    if (!ctx) return;

    if (charts[id]) {
      charts[id].destroy();
    }

    charts[id] = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
});