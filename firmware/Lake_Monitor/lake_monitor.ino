#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>



const char* ssid ="pixel_6956";
const char* password = "adiya123";


const char* serverName = "";


#define TDS_PIN 34
#define TURBIDITY_PIN 35
#define LIGHT_PIN 32
#define ONE_WIRE_BUS 4  


OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);


unsigned long lastTime = 0;
unsigned long timerDelay = 20000; 


#define SAMPLE_COUNT 10

void setup() {
  Serial.begin(115200);

  sensors.begin();

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
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    total += analogRead(pin);
    delay(50);
  }
  return total / SAMPLE_COUNT;
}

void loop() {

  if ((millis() - lastTime) > timerDelay) {

    if (WiFi.status() == WL_CONNECTED) {

      HTTPClient http;

      sensors.requestTemperatures();
      float temperature = sensors.getTempCByIndex(0);

    
      float tdsValue = getAverageAnalog(TDS_PIN);
      float turbidityValue = getAverageAnalog(TURBIDITY_PIN);
      float lightValue = getAverageAnalog(LIGHT_PIN);

     
      float tdsVoltage = tdsValue * (3.3 / 4095.0);
      float turbidityVoltage = turbidityValue * (3.3 / 4095.0);
      float lightVoltage = lightValue * (3.3 / 4095.0);

     
      String httpRequestData = "{";
      httpRequestData += "\"temperature\":" + String(temperature) + ",";
      httpRequestData += "\"tds\":" + String(tdsVoltage) + ",";
      httpRequestData += "\"turbidity\":" + String(turbidityVoltage) + ",";
      httpRequestData += "\"ambient_light\":" + String(lightVoltage);
      httpRequestData += "}";

      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(httpRequestData);

      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);

      Serial.println("Sent Data:");
      Serial.println(httpRequestData);

      http.end();
    }
    else {
      Serial.println("WiFi Disconnected");
    }

    lastTime = millis();
  }
}