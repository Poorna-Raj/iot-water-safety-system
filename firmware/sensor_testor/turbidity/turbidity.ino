#define TURBIDITY_PIN 34
#define SAMPLES 50

void setup() {
  // Start serial communication at 115200 baud
  Serial.begin(115200);
  
  // Ensure the ADC is set to 12-bit (0-4095)
  analogReadResolution(12);
  
  // Set attenuation for 0-3.3V range (standard for ESP32)
  analogSetAttenuation(ADC_11db);
  delay(2000); 
}

void loop() {
  long sum = 0;

  for(int i = 0; i < SAMPLES; i++) {
    sum += analogRead(TURBIDITY_PIN);
    delay(10); 
  }

  float averageRaw = (float)sum / SAMPLES;

  // 1. Calculate the voltage seen by the ESP32 (0V - 3.3V)
  float espVoltage = averageRaw * (3.3 / 4095.0);

  // 2. Calculate actual Sensor Voltage (reversing the 10k/20k divider)
  // Formula: V_sensor = V_esp * ((R1 + R2) / R2) -> V_esp * 1.5
  float actualSensorVoltage = espVoltage * 1.5;

  // Output results to Serial Plotter/Monitor
  Serial.print("Raw_Avg:");
  Serial.print(averageRaw);
  Serial.print(" | ESP_V:");
  Serial.print(espVoltage);
  Serial.print("V | Sensor_V:");
  Serial.print(actualSensorVoltage);
  Serial.print("V | STATUS: ");

  // Logic based on the ACTUAL sensor voltage (0V to 4.5V+)
  if (actualSensorVoltage > 2.5) {
    Serial.println("OK");
  } else if (actualSensorVoltage < 0.5) {
    Serial.println("WIRING ERROR / DISCONNECTED");
  } else {
    Serial.println("DIRTY / HIGH TURBIDITY");
  }

  delay(1000); 
}