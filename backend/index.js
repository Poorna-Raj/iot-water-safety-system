const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/sensor-data", (req, res) => {
  console.log("Received: " + req.body);
  res.json({
    message: "Data Received Successfully",
  });
});

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});
