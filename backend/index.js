const express = require("express");
const cors = require("cors");
const db = require("./firebase/firebase");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/sensor-data", async (req, res) => {
  try {
    const data = req.body;
    const id = Date.now().toString();

    await db.ref("raw-readings/" + id).set({
      ...data,
      timestamp: Date.now(),
    });

    res.json({
      message: "Saved to Firebase",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});
