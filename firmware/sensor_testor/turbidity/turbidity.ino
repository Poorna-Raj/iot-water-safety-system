#define TURBIDITY_PIN 35

void setup() {
  Serial.begin(115200);
  // ESP32 ADC resolution (0 to 4095)
  analogReadResolution(12);
  
  Serial.println("--- KIE Turbidity Sensor Test ---");
  Serial.println("Dip the probe in clear water to begin.");
}

void loop() {
  // Take 50 samples and average them to remove 'noise'
  long sum = 0;
  for(int i = 0; i < 50; i++) {
    sum += analogRead(TURBIDITY_PIN);
    delay(5); 
  }
  float averageRaw = sum / 50.0;

  // Convert the 0-4095 raw value to Voltage (0-3.3V)
  float voltage = averageRaw * (3.3 / 4095.0);

  Serial.print("Raw: ");
  Serial.print(averageRaw);
  Serial.print(" | Voltage: ");
  Serial.print(voltage);
  Serial.print("V | ");

  // Basic Diagnosis
  if (voltage > 2.5) {
    Serial.println("STATUS: CLEAR WATER");
  } else if (voltage > 1.0) {
    Serial.println("STATUS: CLOUDY / TURBID");
  } else if (voltage < 0.1) {
    Serial.println("STATUS: ERROR (Check Power/Wiring)");
  } else {
    Serial.println("STATUS: VERY DIRTY");
  }

  delay(1000); 
}