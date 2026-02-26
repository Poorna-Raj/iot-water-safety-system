import "leaflet/dist/leaflet.css";
import { initMap, updateMarker } from "./map";
import { db, ref, onValue } from "./firebase";
import { updateUI } from "./ui";
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Ready");

  const LAT = 6.9271;
  const LNG = 79.8612;

  initMap(LAT, LNG);

  const statusRef = ref(db, "current-status");

  onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    updateUI(data);
    updateMarker(data.safe);
  });
});