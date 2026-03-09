#define TURBIDITY_PIN 34
#define SAMPLES 50
#define STATUS_PIN 5

void setup() {
  Serial.begin(115200);
  
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  pinMode(STATUS_PIN, OUTPUT);
  
  Serial.println("--- Water Quality Monitor: Binary Mode ---");
  delay(2000); 
}

void loop() {
  long sum = 0;

  for(int i = 0; i < SAMPLES; i++) {
    sum += analogRead(TURBIDITY_PIN);
    delay(10); 
  }

  float averageRaw = (float)sum / SAMPLES;
  float espVoltage = averageRaw * (3.3 / 4095.0);
  float actualSensorVoltage = espVoltage * 1.5;

  Serial.print("Sensor_V: ");
  Serial.print(actualSensorVoltage);
  Serial.print("V | ");

  // --- SIMPLE BINARY LOGIC ---
  
  if (actualSensorVoltage < 0.5) {
    // Safety check for disconnected sensor
    digitalWrite(STATUS_PIN, LOW);
    Serial.println("STATE: ERROR (Check Wiring)");
  } 
  else if (actualSensorVoltage >= 3.4) {
    // Covers both "Clear" (3.47V) and "Cloudy" (2.7V+)
    digitalWrite(STATUS_PIN, HIGH);
    Serial.println("STATE: GOOD");
  } 
  else {
    // Covers your dirty readings (1.34V)
    digitalWrite(STATUS_PIN, LOW);
    Serial.println("STATE: DIRTY");
  }

  delay(1000); 
}