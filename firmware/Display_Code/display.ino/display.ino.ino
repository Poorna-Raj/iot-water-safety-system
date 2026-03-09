#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// Credentials
#define WIFI_SSID "A13Pro"
#define WIFI_PASSWORD "poorna4449"
#define DATABASE_SECRET "NWqZpURlREf7Ygz209zowfj8g8QBVC7bLNa0CcIV" 
#define DATABASE_URL "iot-water-quality-73b9e-default-rtdb.asia-southeast1.firebasedatabase.app"

// Pins
#define IR_SENSOR D5
#define BUZZER D6

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
LiquidCrystal_I2C lcd(0x27, 16, 2);

bool safeStatus = true;
int qualityScore = 0;

void streamCallBack(FirebaseStream data);
void streamTimeoutCallback(bool timeout);

void setup() {
  Serial.begin(9600);
  
  pinMode(IR_SENSOR, INPUT);
  pinMode(BUZZER, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.print("Connecting...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Start streaming specific folder
  if (Firebase.RTDB.beginStream(&fbdo, "/current-status")) {
    Serial.println("Stream Started!");
  }

  Firebase.RTDB.setStreamCallback(&fbdo, streamCallBack, streamTimeoutCallback);
}

void loop() {
  if (Firebase.ready()) {
    int irValue = digitalRead(IR_SENSOR);
    
    // Logic: Buzzer ON only if Water is NOT safe AND IR detects glass
    if (safeStatus == false && irValue == LOW) {
      digitalWrite(BUZZER, HIGH);
    } else {
      digitalWrite(BUZZER, LOW);
    }
  }
  delay(100);
}

void streamCallBack(FirebaseStream data) {
  if (data.dataType() == "json") {
    FirebaseJson *json = data.to<FirebaseJson *>();
    FirebaseJsonData result;
    if (json->get(result, "safe")) safeStatus = result.boolValue;
    if (json->get(result, "qualityScore")) qualityScore = result.intValue;
  } else {
    String path = data.dataPath();
    if (path == "/safe") safeStatus = data.boolData();
    if (path == "/qualityScore") qualityScore = data.intData();
  }

  // Refresh Screen
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(safeStatus ? "Status: SAFE" : "Status: UNSAFE!");
  lcd.setCursor(0, 1);
  lcd.print("Score: " + String(qualityScore));
  
  Serial.printf("Update: Safe=%s, Score=%d\n", safeStatus ? "Yes" : "No", qualityScore);
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) Serial.println("Stream timeout, retrying...");
}