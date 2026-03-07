#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4  // Your data pin

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  Serial.println("DS18B20 Temperature Sensor Test");
  
  sensors.begin();
  
  // Check if at least one sensor is connected
  if (sensors.getDeviceCount() == 0) {
    Serial.println("Error: No DS18B20 sensor detected! Check your wiring/resistor.");
  } else {
    Serial.print("Found ");
    Serial.print(sensors.getDeviceCount());
    Serial.println(" sensor(s).");
  }
}

void loop() {
  Serial.print("Requesting temperatures...");
  sensors.requestTemperatures(); // Send the command to get temperatures
  
  float tempC = sensors.getTempCByIndex(0);

  if(tempC == DEVICE_DISCONNECTED_C) {
    Serial.println("Error: Could not read temperature data");
  } else {
    Serial.print("Temperature: ");
    Serial.print(tempC);
    Serial.println("°C");
  }

  delay(2000); // Wait 2 seconds between readings
}