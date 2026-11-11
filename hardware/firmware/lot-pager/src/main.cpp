// LOT Pager firmware v0.1 (EVT, ESP32-S3, Arduino core).
// Contract: docs/hardware/LOT-HW-03-API-CONNECTOR.md (server: src/server/routes/device-api.ts)
//   GET  /api/device/inbox  -> {notices:[{id,text,ts}], poll_s}
//   POST /api/device/ack    {ids:[...]}
//   POST /api/device/event  {type:"copy", notice_id} | {type:"sensor", t_c, rh, hpa, battery}
// Pins are devkit placeholders until the EVT schematic is frozen.
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <GxEPD2_BW.h>
#include "config.h"

#ifndef LOT_FW_VERSION
#define LOT_FW_VERSION "0.1.0"
#endif

static const int PIN_BUTTON = 0;      // "Copy" (active low)
static const int PIN_HAPTIC = 21;     // LRA driver enable / buzzer
static const int PIN_EPD_CS = 10, PIN_EPD_DC = 9, PIN_EPD_RST = 8, PIN_EPD_BUSY = 7;
static const uint32_t SENSOR_PERIOD_MS = 15UL * 60UL * 1000UL;

GxEPD2_BW<GxEPD2_154_D67, GxEPD2_154_D67::HEIGHT> epd(GxEPD2_154_D67(PIN_EPD_CS, PIN_EPD_DC, PIN_EPD_RST, PIN_EPD_BUSY));
Adafruit_BME280 bme;
bool hasBme = false;

String currentId, currentText;
uint32_t pollMs = 60000, lastPoll = 0, lastSensor = 0;

// ---- net -------------------------------------------------------------------
// TODO(EVT): pin the lot-systems.com CA (setCACert) instead of setInsecure().
int api(const char *method, const String &path, const String &body, String &out) {
  WiFiClientSecure tls; tls.setInsecure();
  HTTPClient http;
  http.begin(tls, String(LOT_HOST) + "/api/device" + path);
  http.addHeader("Authorization", String("Bearer ") + LOT_DEVICE_TOKEN);
  http.addHeader("X-LOT-FW", LOT_FW_VERSION);
  http.addHeader("Content-Type", "application/json");
  int code = http.sendRequest(method, body);
  out = code > 0 ? http.getString() : "";
  http.end();
  return code;
}

// ---- ui --------------------------------------------------------------------
void show(const String &text) {
  epd.setRotation(0);
  epd.setFullWindow();
  epd.firstPage();
  do {
    epd.fillScreen(GxEPD_WHITE);
    epd.setTextColor(GxEPD_BLACK);
    epd.setTextSize(2);
    epd.setCursor(8, 24);
    epd.print("LOT");
    epd.setCursor(8, 64);
    epd.print(text);   // GxEPD2 wraps at screen edge; ≤80 chars guaranteed by server
  } while (epd.nextPage());
  epd.hibernate();
}

void buzz() { digitalWrite(PIN_HAPTIC, HIGH); delay(120); digitalWrite(PIN_HAPTIC, LOW); delay(80);
              digitalWrite(PIN_HAPTIC, HIGH); delay(120); digitalWrite(PIN_HAPTIC, LOW); }

// ---- logic -----------------------------------------------------------------
void pollInbox() {
  String res;
  if (api("GET", "/inbox", "", res) != 200) return;
  JsonDocument doc;
  if (deserializeJson(doc, res)) return;
  if (doc["poll_s"].is<int>()) pollMs = doc["poll_s"].as<int>() * 1000UL;
  JsonArray notices = doc["notices"].as<JsonArray>();
  if (notices.size() == 0) return;
  currentId = notices[0]["id"].as<String>();
  currentText = notices[0]["text"].as<String>();
  show(currentText);
  buzz();
  JsonDocument ack; JsonArray ids = ack["ids"].to<JsonArray>();
  for (JsonObject n : notices) ids.add(n["id"].as<const char *>());
  String body, out; serializeJson(ack, body);
  api("POST", "/ack", body, out);
}

void sendCopy() {
  if (currentId.isEmpty()) return;
  JsonDocument ev; ev["type"] = "copy"; ev["notice_id"] = currentId;
  String body, out; serializeJson(ev, body);
  int code = api("POST", "/event", body, out);
  // TODO(EVT): queue in flash (max 50) when offline, flush FIFO on reconnect.
  if (code == 200) { digitalWrite(PIN_HAPTIC, HIGH); delay(40); digitalWrite(PIN_HAPTIC, LOW); }
}

void sendSensor() {
  if (!hasBme) return;
  JsonDocument ev; ev["type"] = "sensor";
  ev["t_c"] = bme.readTemperature(); ev["rh"] = bme.readHumidity(); ev["hpa"] = bme.readPressure() / 100.0f;
  String body, out; serializeJson(ev, body);
  api("POST", "/event", body, out);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_HAPTIC, OUTPUT);
  epd.init(115200);
  show("Connecting...");
  Wire.begin();
  hasBme = bme.begin(0x76) || bme.begin(0x77);
  WiFi.mode(WIFI_STA);
  WiFi.begin(LOT_WIFI_SSID, LOT_WIFI_PASS);
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(250);
  show(WiFi.status() == WL_CONNECTED ? "Ready." : "No Wi-Fi");
}

void loop() {
  static uint32_t pressedAt = 0;
  bool down = digitalRead(PIN_BUTTON) == LOW;
  if (down && !pressedAt) pressedAt = millis();
  if (!down && pressedAt) {               // release: short press = COPY
    if (millis() - pressedAt > 20 && millis() - pressedAt < 1500) sendCopy();
    pressedAt = 0;
  }
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); delay(1000); return; }
  if (millis() - lastPoll > pollMs) { lastPoll = millis(); pollInbox(); }
  if (millis() - lastSensor > SENSOR_PERIOD_MS) { lastSensor = millis(); sendSensor(); }
  delay(10);   // TODO(EVT): light sleep + GPIO wake to hit < 3 mA average
}
