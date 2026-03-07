#include <BH1750.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <WiFi.h>
#include <Wire.h>

// --- WiFi Credentials ---
const char *ssid = "A13Pro";
const char *password = "poorna4449";
const char *serverName =
    "http://10.92.122.70:5000/sensor/sensor-data"; // Replace with your actual
                                                   // endpoint

// --- Pin Definitions ---
#define TDS_PIN 34
#define TURBIDITY_PIN 35
#define PIR_PIN 13 // PIR Motion Sensor
#define IR_DIGITAL_PIN 14 // IR Obstacle Sensor (DO)
#define ONE_WIRE_BUS 4 // DS18B20 Temp Sensor

// --- Sensor Objects ---
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
BH1750 lightMeter;

unsigned long lastTime = 0;
unsigned long timerDelay = 20000;

void setup() {
  Serial.begin(115200);

  // Initialize I2C and Sensors
  Wire.begin();
  sensors.begin();

  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 Initialized");
  } else {
    Serial.println("Error initializing BH1750");
  }

  pinMode(PIR_PIN, INPUT);
  pinMode(IR_DIGITAL_PIN, INPUT);

  // WiFi Connection
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

float getAverageAnalog(int pin) {
  float total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(pin);
    delay(20);
  }
  return total / 10.0;
}

void loop() {
  if ((millis() - lastTime) > timerDelay) {

    if (WiFi.status() == WL_CONNECTED) {

      WiFiClient client;
      HTTPClient http;

      // Read sensors
      sensors.requestTemperatures();
      float temperature = sensors.getTempCByIndex(0);

      float lux = lightMeter.readLightLevel();

      float turbidityVoltage = getAverageAnalog(TURBIDITY_PIN) * (3.3 / 4095.0);

      // readingId (string)
      String readingId = String(timestamp);

      // JSON payload
      String httpRequestData = "{";
      httpRequestData += "\"readingId\":\"" + readingId + "\",";
      httpRequestData += "\"temperature\":" + String(temperature) + ",";
      httpRequestData += "\"turbidity\":" + String(turbidityVoltage) + ",";
      httpRequestData += "\"ambientLight\":" + String(lux) + ",";
      httpRequestData += "}";

      http.begin(client, serverName);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(httpRequestData);

      Serial.println("--- DATA SENT ---");
      Serial.println(httpRequestData);
      Serial.print("Response Code: ");
      Serial.println(httpResponseCode);

      http.end();

    } else {
      Serial.println("WiFi Disconnected");
    }

    lastTime = millis();
  }
}