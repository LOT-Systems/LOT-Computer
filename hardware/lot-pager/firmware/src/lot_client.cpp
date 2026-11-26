#include "lot_client.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

static WiFiClientSecure tls;

static String url(const char* path) {
  return String("https://") + LOT_HOST + path;
}

static void addAuth(HTTPClient& http) {
  http.addHeader("Cookie", String("auth_token=") + LOT_AUTH_TOKEN);
  http.addHeader("User-Agent", String("LOT-Pager/") + LOT_FW_VERSION);
}

bool lot::begin() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(LOT_WIFI_SSID, LOT_WIFI_PASS);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) delay(100);
  // EVT-0: setInsecure() keeps bring-up simple. EVT-1 pins the ISRG Root X1 CA
  // (Let's Encrypt, used by lot-systems.com behind Caddy) via tls.setCACert().
  tls.setInsecure();
  return WiFi.status() == WL_CONNECTED;
}

// Pager-length compression: collapse whitespace, drop trailing clause after
// the first sentence if too long, hard-cut with a period. No ellipsis glyphs:
// LOT style is "Done." not "Done…".
String lot::compress(const String& in, size_t maxChars) {
  String s;
  bool space = false;
  for (size_t i = 0; i < in.length(); i++) {
    char c = in[i];
    if (c == '\n' || c == '\t' || c == ' ') { space = true; continue; }
    if ((uint8_t)c >= 0x80) continue;  // memory LCD font is ASCII; strip emoji/UTF-8
    if (space && s.length()) s += ' ';
    space = false;
    s += c;
  }
  if (s.length() <= maxChars) return s;
  int dot = s.indexOf(". ");
  if (dot > 0 && (size_t)dot < maxChars) return s.substring(0, dot + 1);
  String cut = s.substring(0, maxChars - 1);
  int sp = cut.lastIndexOf(' ');
  if (sp > (int)maxChars / 2) cut = cut.substring(0, sp);
  return cut + ".";
}

LotNotice lot::fetchNotice() {
  LotNotice best{ "", "none", -1 };
  HTTPClient http;

  // 1) Autonomous, per-user prompts from the pattern engine
  if (http.begin(tls, url("/api/contextual-prompts"))) {
    addAuth(http);
    if (http.GET() == 200) {
      JsonDocument doc;
      if (!deserializeJson(doc, http.getStream())) {
        for (JsonObject p : doc["prompts"].as<JsonArray>()) {
          int pr = p["priority"] | 0;
          if (pr > best.priority) {
            best = { lot::compress(p["message"] | "", NOTIFY_MAX_CHARS), "prompt", pr };
          }
        }
      }
    }
    http.end();
  }
  if (best.priority >= 0) return best;

  // 2) Fallback: global live message (admin broadcast, e.g. "Coffee time!")
  if (http.begin(tls, url("/api/live-message"))) {
    addAuth(http);
    if (http.GET() == 200) {
      JsonDocument doc;
      if (!deserializeJson(doc, http.getStream())) {
        const char* m = doc["message"] | "";
        if (strlen(m)) best = { lot::compress(m, NOTIFY_MAX_CHARS), "live", 0 };
      }
    }
    http.end();
  }
  return best;
}

bool lot::postCopy(const LotNotice& n, const LotSensorSnapshot& s) {
  HTTPClient http;
  if (!http.begin(tls, url("/api/logs"))) return false;
  addAuth(http);
  http.addHeader("Content-Type", "application/json");

  JsonDocument body;
  body["text"] = n.text.length() ? n.text : String("Copy.");
  body["event"] = "note";  // 'note' is always displayed in the Log tab
  JsonObject meta = body["metadata"].to<JsonObject>();
  meta["source"] = "lot-pager";
  meta["action"] = "copy";
  meta["deviceId"] = LOT_DEVICE_ID;
  meta["fw"] = LOT_FW_VERSION;
  meta["noticeSource"] = n.source;
  if (s.valid) {
    JsonObject w = meta["deviceWeather"].to<JsonObject>();
    w["tempC"] = s.tempC;
    w["humidity"] = s.humidityPct;
    w["pressureHPa"] = s.pressureHPa;
    w["gasKOhm"] = s.gasKOhm;
  }
  String payload;
  serializeJson(body, payload);
  int code = http.POST(payload);
  http.end();
  return code == 200 || code == 201;
}
