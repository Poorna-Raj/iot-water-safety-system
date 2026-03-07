exports.checkWaterSafety = (currentData, lastReading) => {
  const turbiditySafe = currentData.turbidity < 5;
  const lightSafe = currentData.ambientLight < 60;

  let temDifference = true;

  if (lastReading) {
    const diff = Math.abs(currentData.temperature - lastReading.temperature);
    tempDiffSafe = diff < 3;
  }

  const safe = turbiditySafe && lightSafe && tempDiffSafe;

  const qualityScore = safe ? 50 : 100;

  let message = "Water is safe";

  if (!turbiditySafe) {
    message = "High turbidity detected";
  } else if (!lightSafe) {
    message = "Abnormal light exposure detected";
  } else if (!tempDiffSafe) {
    message = "Sudden temperature change detected";
  }

  return { safe, qualityScore, message };
};
