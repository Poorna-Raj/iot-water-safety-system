const crypto = require("crypto");
const db = require("../firebase/firebase");
const { checkWaterSafety } = require("../utils/processing");
const { sendAlertEmail } = require("../utils/emailService");

exports.saveSensorData = async (req, res) => {
  try {
    const data = req.body;
    const id = Date.now().toString();
    const now = Date.now();

    await db.ref("raw-readings/" + id).set({
      ...data,
      timestamp: now,
    });

    const processed = checkWaterSafety(data);

    await db.ref("processed-results/" + id).set({
      ...processed,
      timestamp: now,
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
        const token = crypto.randomBytes(32).toString("hex");

        await db.ref(`alerts/${alertId}`).set({
          readingId: id,
          type: "Water Unsafe",
          message: processed.message,
          acknowledgedBy: null,
          createdAt: now,
          clearedAt: null,
          currentStatus: true,
          resolveToken: token,
          tokenExpiry: now + 15 * 60 * 1000
        });

        await sendAlertEmail({
          alertId,
          token,
          processed
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
