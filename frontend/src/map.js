import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

let map;
let marker;

export function initMap(lat, lng) {
  map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  marker = L.circleMarker([lat, lng], {
    radius: 20,
    color: "green",
    fillOpacity: 0.5,
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 100);
}

export function updateMarker(safe) {
  marker.setStyle({
    color: safe ? "green" : "red",
  });
}
