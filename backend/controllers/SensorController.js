const db = require("../firebase/firebase");
const { checkWaterSafety } = require("../utils/processing");

exports.saveSensorData = async (req, res) => {
  try {
    const data = req.body;
    const id = Date.now().toString();

    await db.ref("raw-readings/" + id).set({
      ...data,
      timestamp: Date.now(),
    });

    const processed = checkWaterSafety(data);

    await db.ref("processed-results/" + id).set({
      ...processed,
      timestamp: Date.now(),
    });

    const alertsSnapshot = await db
      .ref("alerts")
      .orderByChild("currentStatus")
      .equalTo(true)
      .once("value");

    const unresolvedAlerts = alertsSnapshot.val();
    const hasUnresolvedAlerts =
      unresolvedAlerts && Object.keys(unresolvedAlerts).length > 0;

    if (!hasUnresolvedAlerts) {
      if (!processed.safe) {
        const alertId = Date.now().toString();
        await db.ref(`alerts/${alertId}`).set({
          readingId: id,
          type: "Water Unsafe",
          message: processed.message,
          acknowledgedBy: null,
          createdAt: timestamp,
          clearedAt: null,
          currentStatus: true,
        });
      }
      await db.ref("current-status").set({
        lastReadingId: id,
        safe: processed.safe,
        qualityScore: processed.qualityScore,
        message: processed.message,
        updatedAt: Date.now(),
      });
    } else {
      console.error("There are unsolved alerts. Current Status not Updated!");
    }

    return res.status(200).json({ message: "Sensor data saved successfully" });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    return res.status(500).json({ error: "Failed to save sensor data" });
  }
};
