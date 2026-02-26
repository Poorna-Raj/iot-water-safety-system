export function updateUI(data) {
  const statusCard = document.getElementById("statusCard");
  const statusText = document.getElementById("statusText");
  const qualityScore = document.getElementById("qualityScore");
  const lastUpdated = document.getElementById("lastUpdated");

  statusText.textContent = data.safe ? "Water is Safe" : "Water is Unsafe";
  qualityScore.textContent = data.qualityScore;
  lastUpdated.textContent = new Date(data.updatedAt).toLocaleString();

  statusCard.classList.remove("status-safe", "status-unsafe");
  statusCard.classList.add(data.safe ? "status-safe" : "status-unsafe");
}