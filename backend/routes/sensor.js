const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/SensorController");

router.post("/sensor-data", sensorController.saveSensorData);

module.exports = router;
