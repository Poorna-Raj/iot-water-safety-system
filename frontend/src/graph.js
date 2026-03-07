import React, { useEffect, useState } from "react";
import { db, ref, onValue } from "../firebase/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ─── Sensor config ────────────────────────────────────────────────────────────
const SENSORS = [
  { key: "temperature",  label: "Temperature",  unit: "°C",    borderColor: "rgb(239,68,68)",   backgroundColor: "rgba(239,68,68,0.1)" },
  { key: "turbidity",    label: "Turbidity",    unit: "NTU",   borderColor: "rgb(59,130,246)",  backgroundColor: "rgba(59,130,246,0.1)" },
  { key: "conductivity", label: "Conductivity", unit: "µS/cm", borderColor: "rgb(34,197,94)",   backgroundColor: "rgba(34,197,94,0.1)" },
  { key: "ambientLight", label: "Ambient Light",unit: "lux",   borderColor: "rgb(245,158,11)",  backgroundColor: "rgba(245,158,11,0.1)" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Individual sensor chart ──────────────────────────────────────────────────
function SensorChart({ sensor, readings }) {
  const latest = readings.length ? readings[readings.length - 1][sensor.key]?.toFixed(2) : "—";

  const data = {
    labels: readings.map((r) =>
      new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    ),
    datasets: [
      {
        label: `${sensor.label} (${sensor.unit})`,
        data: readings.map((r) => r[sensor.key]),
        borderColor: sensor.borderColor,
        backgroundColor: sensor.backgroundColor,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y.toFixed(2)} ${sensor.unit}`,
        },
      },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 6 } },
      y: { beginAtZero: false },
    },
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong style={{ fontSize: "14px", color: "#1e293b" }}>{sensor.label}</strong>
        <span style={{ fontSize: "20px", fontWeight: "700", color: sensor.borderColor }}>
          {latest} <span style={{ fontSize: "12px", color: "#94a3b8" }}>{sensor.unit}</span>
        </span>
      </div>
      <div style={{ height: "180px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

// ─── Weekly chart (all 4 sensors, Mon–Sun) ────────────────────────────────────
function WeeklyChart({ weeklyData }) {
  // weeklyData: array of 7 objects [{ temperature, turbidity, conductivity, ambientLight }, ...]
  // keyed Mon=0 … Sun=6. Build from Firebase "weekly-averages" node or aggregate client-side.

  const data = {
    labels: DAYS,
    datasets: SENSORS.map((s) => ({
      label: `${s.label} (${s.unit})`,
      data: weeklyData.map((d) => d[s.key] ?? null),
      borderColor: s.borderColor,
      backgroundColor: s.backgroundColor,
      borderWidth: 2.5,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Weekly Sensor Overview (Mon – Sun)",
        font: { size: 14, weight: "bold" },
        color: "#1e293b",
      },
    },
    scales: {
      x: { ticks: { font: { weight: "600" } } },
      y: { beginAtZero: false },
    },
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    }}>
      <div style={{ height: "300px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SensorGraphs() {
  const [readings, setReadings] = useState([]);
  const [weeklyData, setWeeklyData] = useState(Array(7).fill({}));

  // ── Live readings (raw-readings node) ──────────────────────────────────────
  useEffect(() => {
    const readingsRef = ref(db, "raw-readings");
    onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const sorted = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
      setReadings(sorted);
    });
  }, []);

  // ── Weekly averages ────────────────────────────────────────────────────────
  // Option A: pull from a dedicated Firebase node "weekly-averages"
  //   Structure expected:
  //   weekly-averages/
  //     0: { temperature, turbidity, conductivity, ambientLight }  ← Monday
  //     1: { ... }                                                  ← Tuesday
  //     ...
  //     6: { ... }                                                  ← Sunday
  //
  // Option B (client-side aggregation from raw-readings): uncomment the block below
  //   and remove the Firebase listener for weekly-averages.

  useEffect(() => {
    // --- Option A: dedicated Firebase node ---
    const weeklyRef = ref(db, "weekly-averages");
    onValue(weeklyRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      // Expecting an array or object with keys 0-6
      const arr = Array.isArray(data) ? data : Object.values(data);
      setWeeklyData(arr);
    });

    // --- Option B: aggregate raw-readings by day-of-week (uncomment to use) ---
    // const rawRef = ref(db, "raw-readings");
    // onValue(rawRef, (snapshot) => {
    //   const data = snapshot.val();
    //   if (!data) return;
    //   const buckets = Array.from({ length: 7 }, () => ({ count: 0, temperature: 0, turbidity: 0, conductivity: 0, ambientLight: 0 }));
    //   Object.values(data).forEach((r) => {
    //     const day = (new Date(r.timestamp).getDay() + 6) % 7; // Mon=0, Sun=6
    //     buckets[day].count++;
    //     SENSORS.forEach(s => { buckets[day][s.key] += r[s.key] ?? 0; });
    //   });
    //   const averages = buckets.map((b) => {
    //     const avg = {};
    //     SENSORS.forEach(s => { avg[s.key] = b.count ? b[s.key] / b.count : null; });
    //     return avg;
    //   });
    //   setWeeklyData(averages);
    // });
  }, []);

  return (
    <div style={{ padding: "24px", background: "#f1f5f9", minHeight: "100vh" }}>

      {/* ── 4 individual sensor charts ── */}
      <h2 style={{ marginBottom: "16px", color: "#1e293b", fontFamily: "sans-serif" }}>
        Live Sensor Readings
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "20px",
        marginBottom: "32px",
      }}>
        {SENSORS.map((sensor) => (
          <SensorChart key={sensor.key} sensor={sensor} readings={readings} />
        ))}
      </div>

      {/* ── Weekly overview chart ── */}
      <h2 style={{ marginBottom: "16px", color: "#1e293b", fontFamily: "sans-serif" }}>
        Weekly Overview
      </h2>
      <WeeklyChart weeklyData={weeklyData} />

    </div>
  );
}