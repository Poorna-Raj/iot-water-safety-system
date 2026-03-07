#define PIR_PIN 13  // Pin connected to PIR OUT

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT); // Set the PIR pin as an input
  
  Serial.println("PIR Motion Sensor Warm-up (takes ~30-60 seconds)...");
  delay(30000); // PIR sensors need time to stabilize their infrared map
  Serial.println("Ready!");
}

void loop() {
  int motionDetected = digitalRead(PIR_PIN);

  if (motionDetected == LOW) {
    Serial.println("--- MOTION DETECTED! ---");
  } else {
    Serial.println("Scanning...");
  }

  delay(500); // Small delay to make the serial monitor readable
}