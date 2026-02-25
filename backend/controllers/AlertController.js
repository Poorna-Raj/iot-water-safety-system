const db = require("../firebase/firebase");

exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(500).send("Invalid Request. Token Missing!");
    }

    const alertRef = db.ref(`alerts/${alertId}`);
    const snapshot = await alertRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).send("Alert not found!");
    }

    const alertData = snapshot.val();

    if (alertData.resolveToken !== token) {
      return res.status(403).send("Invalid token.");
    }

    if (Date.now() > alertData.tokenExpiry) {
      return res.status(403).send("Token expired.");
    }

    if (!alertData.currentStatus) {
      return res.send("Alert already resolved.");
    }

    const now = Date.now();

    await alertRef.update({
      currentStatus: false,
      clearedAt: now,
      acknowledgedBy: "Authorized User",
      resolveToken: null,
      tokenExpiry: null,
    });

    return res.send(`
        <h2>✅ Alert Successfully Resolved</h2>
        <p>The system has been restored to normal operation.</p>
        `);
  } catch (error) {
    console.error("Error resolving alert:", error);
    return res.status(500).send("Internal server error.");
  }
};
