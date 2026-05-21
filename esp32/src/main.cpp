#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <Adafruit_PN532.h>
#include <WiFi.h>
#include <HTTPClient.h>

PN532_I2C pn532_i2c(Wire);
PN532 nfc(pn532_i2c);

#define PN532_I2C_ADDR 0x24

const char* ssid = "Alperen";
const char* password = "1453alperr";

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Wire.setClock(10000);  // Hız artırıldı

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("WiFi'ya bağlanıyor...");
  }
  Serial.println("WiFi bağlantısı başarılı!");

  Wire.beginTransmission(PN532_I2C_ADDR);
  if (Wire.endTransmission() != 0) {
    Serial.println("I2C cihazına bağlanılamadı!");
    while (1);
  }

  nfc.begin();
  if (!nfc.getFirmwareVersion()) {
    Serial.println("PN532 modülü bulunamadı!");
    while (1);
  }

  nfc.SAMConfig();
  Serial.println("Kart bekleniyor...");
}

void loop() {
  uint8_t uid[7];
  uint8_t uidLength;

  if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
    Serial.println("Kart bulundu!");

    String cardId = "";
    for (uint8_t i = 0; i < uidLength; i++) {
      if (uid[i] < 0x10) cardId += "0";
      cardId += String(uid[i], HEX);
    }
    cardId.toLowerCase();

    Serial.print("Kart ID: "); Serial.println(cardId);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin("http://192.168.110.56:3003/api/kart-okuma");  // Sunucu IP
      http.addHeader("Content-Type", "application/json");

      String payload = "{\"kartId\":\"" + cardId + "\"}";
      int httpCode = http.POST(payload);
      if (httpCode > 0) {
        String payload = http.getString();
        Serial.println("Kart ID başarıyla gönderildi.");
        Serial.println(payload);
      } else {
        Serial.print("HTTP Hatası: ");
        Serial.println(httpCode);
        Serial.println(http.errorToString(httpCode)); // EKLE
      }

      http.end();
    } else {
      Serial.println("WiFi bağlantısı yok!");
    }

    delay(3000); // Aynı kartın tekrar okutulmasını engellemek için bekleme
  }
}
