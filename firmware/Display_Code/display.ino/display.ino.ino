#include<ESP8266WiFi.h>
#include<Firebase_ESP_Client.h>
#include<LiquidCrystal_I2C.h>


#define WIFI_SSID "";
#define WIFI_PASSWORD "";

#define API_KEY "";
#define DATABASE_URL "";

#define IR_SENSOR D5;
#define  BUZZER D6;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

LiquidCrystal_I2C lcd(0x27,17,2);

bool safeStatus = true;
String messageText = "";
int qaulityScore =0;

void streamCallBack(FirebaseStream data);
void streamTimeoutCallBack(bool timeout);

void setup()
{
  Serial.begin(115200);

  pinMode(IR_SENSOR,INPUT);
  pinMode(BUZZER, OUTPUT);

  lcd.init();
  lcd.backlight();

  WiFi.begin(WiFi_SSID, WiFi_PASSWORD);
  Serial.print("Connecting to WiFi");

  while(WiFi.status() !=WL_CONNECTED)
  {
    delay(500)
    Serial.print(".");
  }

  Serial.print("Connected");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  if(!Firebase.RTDB.beginStream(&fbdo, "/current-status"))
  {
    Serial.println("Stream got Failed");
    Serial.println(fbdo.errorReason());
  }

  Firebase.RTDB.setStreamCallBack(&fbdo, streamCallBack, streamTimeoutCallBack);
  
}

void loop()
{
  int irValue = digitalRead(IR_SENSOR);

  if(!safeStatus && irValue == HIGH)
  {
    digitalWrite(BUZZER, HIGH);
  }
  else
  {
    digitalWrite(BUZZER, LOW);
  }

  delay(100);
}
 void setStreamCallBack(FirebaseStream data)
  {
    Serial.println("Data Updated");

    if(data.dataType()=="json")
    {
      FirebaseJson *json = data.to<FirebaseJson *>();

      FirebaseJsonData result;

      json->get(result, "safe");
      safeStatus = result.boolValue;

      json->get(result, "message");
      messageText = result.stringValue;

      json->get(result, "qualityScore");
      qualityScore = result.intValue;

      lcd.clear();
      lcd.setCursor(0,0);
      lcd.print("Score:");
      lcd.print(quantiyScore);

      lcd.setCursor(0,1);
      lcd.print(messageText);

      Serial.println(messageText);

    }
  }
void streamTimeOutCallBack(bool timeout)
{
  if(timeout)
  {
    Serial.println("Stream Timeout, reconnecting");
  }
}
