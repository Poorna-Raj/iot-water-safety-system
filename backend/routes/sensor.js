const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/SensorController");

router.post("/sensor-data", sensorController.saveSensorData);
router.get("/last-readings", sensorController.getLastReadings);
router.get("/weekly-averages", sensorController.getWeeklyAverages);

module.exports = router;
