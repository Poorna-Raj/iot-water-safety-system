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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SensorGraphs() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    const readingsRef = ref(db, "raw-readings");

    onValue(readingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const formatted = Object.values(data);

      // sort by timestamp
      formatted.sort((a, b) => a.timestamp - b.timestamp);

      setReadings(formatted);
    });
  }, []);

  const labels = readings.map((r) =>
    new Date(r.timestamp).toLocaleTimeString()
  );

  const createChartData = (label, data, color) => ({
    labels: labels,
    datasets: [
      {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
      },
    ],
  });

  return (
    <div style={{ width: "90%", margin: "auto" }}>
      <h2>Temperature</h2>
      <Line
        data={createChartData(
          "Temperature (°C)",
          readings.map((r) => r.temperature),
          "red"
        )}
      />

      <h2>Turbidity</h2>
      <Line
        data={createChartData(
          "Turbidity",
          readings.map((r) => r.turbidity),
          "blue"
        )}
      />

      <h2>Conductivity</h2>
      <Line
        data={createChartData(
          "Conductivity",
          readings.map((r) => r.conductivity),
          "green"
        )}
      />

      <h2>Ambient Light</h2>
      <Line
        data={createChartData(
          "Ambient Light",
          readings.map((r) => r.ambientLight),
          "orange"
        )}
      />
    </div>
  );
}