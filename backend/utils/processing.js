exports.checkWaterSafety = (currentData, lastReading) => {
  let tempDiffSafe = true;

  if (lastReading) {
    const diff = Math.abs(currentData.temperature - lastReading.temperature);
    tempDiffSafe = diff < 3;
  }

  const TURBIDITY_THRESHOLD_GOOD = 3.4;
  const TURBIDITY_THRESHOLD_DIRTY = 1.5;

  let turbidityScore;

  if (currentData.turbidity >= TURBIDITY_THRESHOLD_GOOD) {
    turbidityScore = 0;
  } else if (currentData.turbidity <= TURBIDITY_THRESHOLD_DIRTY) {
    turbidityScore = 100;
  } else {
    turbidityScore =
      ((TURBIDITY_THRESHOLD_GOOD - currentData.turbidity) /
        (TURBIDITY_THRESHOLD_GOOD - TURBIDITY_THRESHOLD_DIRTY)) *
      100;
  }

  const lightSafe = currentData.ambientLight < 60;
  if (!lightSafe) {
    turbidityScore = Math.min(turbidityScore + 20, 100);
  }

  const tempScore = tempDiffSafe ? 0 : 50;

  const rawScore = Math.min(
    Math.round(turbidityScore * 0.7 + tempScore * 0.3),
    100,
  );

  let message = "Water is safe";
  if (rawScore > 80) {
    message =
      "Water is unsafe! High turbidity or sudden temperature change detected.";
  } else if (turbidityScore > 50) {
    message = "Moderate turbidity detected";
  } else if (!tempDiffSafe) {
    message = "Sudden temperature change detected";
  } else if (!lightSafe) {
    message = "High ambient light detected, turbidity reading may be affected";
  }
  const qualityScore = 100 - rawScore;
  const safe = qualityScore >= 50;

  return { safe, qualityScore, message };
};
