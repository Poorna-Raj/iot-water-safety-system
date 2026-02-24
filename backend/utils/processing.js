exports.checkWaterSafety = (data) => {
  const safe =
    data.turbidity < 5 &&
    data.temperature < 25 &&
    data.conductivity < 32 &&
    data.ambientLight < 69;
  const qualityScore = safe ? 50 : 100;
  const message = safe ? "Water is safe" : "Water is not safe";

  return { safe, qualityScore, message };
};
