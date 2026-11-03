// LOT Pager firmware v0.1 scaffold (P1 dev-kit). UNTESTED on hardware — see docs/hardware/04_FIRMWARE.md
// Implements spec 03: long-poll /inbox, show notification, Copy button -> POST /event.
#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Preferences.h>

static const int PIN_BTN = D1;
enum State { BOOT, CONNECT, IDLE, NOTIFY };
static State st = BOOT;
static Preferences prefs;
static String token, wifiSsid, wifiPsk, curTitle, curBody;
static long lastId = 0, curId = 0;

static bool api(const char* method, const String& path, const String& body, String& out) {
  WiFiClientSecure c; c.setInsecure(); // TODO: pin CA before production (spec 03 Security)
  HTTPClient h; h.setTimeout(30000);
  if (!h.begin(c, String(LOT_API_BASE) + path)) return false;
  h.addHeader("Authorization", "Bearer " + token);
  h.addHeader("Content-Type", "application/json");
  int code = String(method) == "GET" ? h.GET() : h.POST(body);
  if (code > 0) out = h.getString();
  h.end();
  return code >= 200 && code < 300;
}

static void showCard(const String& t, const String& b) { Serial.printf("[SCREEN] %s | %s\n", t.c_str(), b.c_str()); /* TODO ST7789 */ }

static void sendEvent(const char* type) {
  JsonDocument d; d["type"] = type; d["payload"]["notification_id"] = curId;
  String body, out; serializeJson(d, body);
  api("POST", "/event", body, out); // TODO: queue to NVS when offline (<=50)
}

void setup() {
  Serial.begin(115200); pinMode(PIN_BTN, INPUT_PULLUP);
  prefs.begin("lot", false);
  token = prefs.getString("token", ""); wifiSsid = prefs.getString("ssid", ""); wifiPsk = prefs.getString("psk", "");
  st = CONNECT;
}

void loop() {
  if (st == CONNECT) {
    if (token.isEmpty() || wifiSsid.isEmpty()) { showCard("PAIRING", "run lotpager provision"); delay(2000); return; }
    WiFi.begin(wifiSsid.c_str(), wifiPsk.c_str());
    for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);
    if (WiFi.status() == WL_CONNECTED) { String o; sendEvent("boot"); st = IDLE; }
  } else if (st == IDLE) {
    String out;
    if (api("GET", "/inbox?since=" + String(lastId) + "&wait=25", "", out)) {
      JsonDocument d;
      if (!deserializeJson(d, out) && d.size() > 0) {
        JsonObject n = d[0]; curId = n["id"]; lastId = curId;
        curTitle = n["title"].as<String>(); curBody = n["body"].as<String>();
        showCard(curTitle, curBody); st = NOTIFY;
      }
    } else delay(5000);
  } else if (st == NOTIFY) {
    if (digitalRead(PIN_BTN) == LOW) { delay(30); if (digitalRead(PIN_BTN) == LOW) { sendEvent("copy"); showCard("COPIED", ""); delay(1200); st = IDLE; } }
  }
}
