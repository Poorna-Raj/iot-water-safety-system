require("dotenv").config();
const express = require("express");
const cors = require("cors");

const sensorRoutes = require("./routes/sensor");
const alertRoutes = require("./routes/alerts");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/sensor", sensorRoutes);
app.use("/alerts", alertRoutes);

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});
