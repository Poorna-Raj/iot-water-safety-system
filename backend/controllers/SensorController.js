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
          tokenExpiry: now + 15 * 60 * 1000,
        });

        await sendAlertEmail({
          alertId,
          token,
          processed,
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
// GET /api/last-readings?sensor=turbidity&limit=10
exports.getLastReadings = async (req, res) => {
  try {
    const { sensor, limit = 10 } = req.query;

    if (!sensor) return res.status(400).json({ error: "Sensor type required" });

    const snapshot = await db
      .ref("raw-readings")
      .orderByChild("timestamp")
      .limitToLast(+limit);
    const data = await snapshot.once("value");
    const readings = data.val();

    if (!readings) return res.json([]);

    const sorted = Object.values(readings)
      .map((r) => ({ timestamp: r.timestamp, value: r[sensor] }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return res.json(sorted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch last readings" });
  }
};

// GET /api/weekly-averages?sensor=turbidity
exports.getWeeklyAverages = async (req, res) => {
  try {
    const { sensor } = req.query;
    if (!sensor) return res.status(400).json({ error: "Sensor type required" });

    const snapshot = await db.ref("raw-readings").once("value");
    const readings = snapshot.val();
    if (!readings) return res.json([]);

    const now = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const dailySums = Array(7).fill(0);
    const dailyCounts = Array(7).fill(0);

    Object.values(readings).forEach(r => {
      const diffDays = Math.floor((now - r.timestamp) / MS_PER_DAY);
      if (diffDays >= 0 && diffDays < 7) {
        const dayIndex = 6 - diffDays;
        dailySums[dayIndex] += r[sensor] || 0;
        dailyCounts[dayIndex] += 1;
      }
    });

    const weeklyAverages = dailySums.map((sum, i) =>
      dailyCounts[i] > 0 ? sum / dailyCounts[i] : null
    );

    return res.json({
      sensor,
      weeklyAverages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weekly averages" });
  }
};