const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://iot-water-quality-73b9e-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.database();

module.exports = db;
