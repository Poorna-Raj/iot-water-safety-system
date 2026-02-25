const express = require("express");
const router = express.Router();

const { resolveAlert } = require("../controllers/AlertController");

router.get("/resolve/:alertId", resolveAlert);

module.exports = router;
