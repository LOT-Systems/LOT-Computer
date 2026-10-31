// LOT PLATE firmware skeleton (EVT). UNCOMPILED / UNTESTED. Contract: ../../07-LOT-API-CONNECTOR.md
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include "secrets.h"

static const char* BASE = "https://lot-systems.com/api/device";
static const int PIN_COPY = 4;
static Preferences prefs;
static String token;
static long lastId = 0, shownId = 0;
static String shownText;
static uint32_t lastTelemetry = 0;

static bool http(const char* method, const String& path, const String& body, String& out) {
  WiFiClientSecure c; c.setInsecure();  // TODO(DVT): pin CA instead
  HTTPClient h; h.begin(c, String(BASE) + path);
  h.addHeader("Content-Type", "application/json");
  if (token.length()) h.addHeader("Authorization", "Bearer " + token);
  int code = String(method) == "GET" ? h.GET() : h.POST(body);
  if (code >= 200 && code < 300) out = h.getString();
  h.end();
  return code >= 200 && code < 300;
}

static void showText(const String& t) { Serial.println("SCREEN: " + t); /* TODO: ST7789 draw, haptic */ }

static void pair() {
  String out; JsonDocument d; d["code"] = PAIR_CODE; d["hwId"] = WiFi.macAddress(); d["fw"] = "0.0.1";
  String b; serializeJson(d, b);
  if (http("POST", "/pair", b, out)) { JsonDocument r; deserializeJson(r, out); token = r["token"].as<String>(); prefs.putString("token", token); }
}

static void onCopy() {
  JsonDocument d; d["type"] = "copy"; d["notificationId"] = shownId; d["ts"] = (uint32_t)millis();
  String b, out; serializeJson(d, b);
  // TODO: queue + backoff (2/4/8/16 s) on failure
  if (http("POST", "/event", b, out)) showText("COPIED."); else Serial.println("copy queued");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_COPY, INPUT_PULLUP);
  prefs.begin("lot", false); token = prefs.getString("token", "");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  if (!token.length()) pair();
}

void loop() {
  String out;
  if (http("GET", "/notifications?since=" + String(lastId) + "&wait=30", "", out)) {
    JsonDocument r; deserializeJson(r, out);
    for (JsonObject n : r["items"].as<JsonArray>()) { lastId = n["id"]; shownId = lastId; shownText = n["text"].as<String>(); showText(shownText); }
  }
  static uint32_t pressed = 0;
  if (digitalRead(PIN_COPY) == LOW && millis() - pressed > 30) { pressed = millis(); onCopy(); }
  if (millis() - lastTelemetry > 300000) { lastTelemetry = millis(); /* TODO: BME688 read -> POST /telemetry */ }
}
