#include <Wire.h> 
#include <LiquidCrystal_I2C.h>

// Set the LCD address to 0x27 for a 16 chars and 2 line display
// If 0x27 doesn't work, try 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0, 0);
  lcd.print("WATER MONITOR");
  lcd.setCursor(0, 1);
  lcd.print("INITIALIZING...");
  
  delay(2000);
}

void loop() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: 25.4 C"); // Placeholder
  lcd.setCursor(0, 1);
  lcd.print("Status: GOOD"); // Placeholder
  delay(5000);
}