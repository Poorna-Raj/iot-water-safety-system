const express = require("express");
const cors = require("cors");
const sensorRoutes = require("./routes/sensor")

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/",sensorRoutes);

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});
