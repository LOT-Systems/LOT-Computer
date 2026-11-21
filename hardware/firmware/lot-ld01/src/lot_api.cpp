// LOT Systems · LD-01 · HTTPS client for /api/device/v1 (see docs/hardware/05)
#include "lot_api.h"
#include "config.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ISRG Root X1 (Let's Encrypt). TODO(S-2): paste PEM and call setCACert(); insecure only for bench.
static const char* ROOT_CA = nullptr;

static String g_token;
static String g_etag;  // RTC persistence TODO(S-2)

static bool begin_req(HTTPClient& http, WiFiClientSecure& c, const char* path) {
  if (ROOT_CA) c.setCACert(ROOT_CA); else c.setInsecure();
  String url = String("https://") + LD01_API_HOST + LD01_API_BASE + path;
  if (!http.begin(c, url)) return false;
  http.addHeader("Authorization", "Bearer " + g_token);
  http.addHeader("X-LOT-Device", String("LD01/") + LD01_FW_VERSION);
  http.setTimeout(8000);
  return true;
}

namespace lot_api {

void begin(const char* token) { g_token = token; }

int fetchInbox(LotNotification* out, int max, uint32_t* pollIntervalS) {
  WiFiClientSecure c; HTTPClient http;
  if (!begin_req(http, c, "/inbox")) return -1;
  if (g_etag.length()) http.addHeader("If-None-Match", g_etag);
  const char* keys[] = {"ETag"}; http.collectHeaders(keys, 1);
  int code = http.GET();
  if (code == 304) { http.end(); return 0; }
  if (code != 200) { http.end(); return -1; }
  g_etag = http.header("ETag");
  JsonDocument doc;
  if (deserializeJson(doc, http.getString())) { http.end(); return -1; }
  http.end();
  // Server envelope: reply.ok(payload) -> payload may be top-level or under "data"
  JsonVariant root = doc["data"].isNull() ? doc.as<JsonVariant>() : doc["data"];
  if (pollIntervalS && root["pollInterval"].is<uint32_t>()) *pollIntervalS = root["pollInterval"];
  int n = 0;
  for (JsonObject it : root["notifications"].as<JsonArray>()) {
    if (n >= max) break;
    strlcpy(out[n].id, it["id"] | "", sizeof(out[n].id));
    strlcpy(out[n].text, it["text"] | "", sizeof(out[n].text));
    n++;
  }
  return n;
}

bool postCopy(const char* notificationId, const char* text, const SensorSnap& s) {
  WiFiClientSecure c; HTTPClient http;
  if (!begin_req(http, c, "/copy")) return false;
  http.addHeader("Content-Type", "application/json");
  JsonDocument doc;
  if (notificationId && *notificationId) doc["notificationId"] = notificationId;
  doc["text"] = text;
  JsonObject sn = doc["sensors"].to<JsonObject>();
  sn["t"] = s.t; sn["rh"] = s.rh; sn["p"] = s.p; sn["gas"] = s.gasKohm;
  String body; serializeJson(doc, body);
  int code = http.POST(body);
  http.end();
  return code == 200;
}

} // namespace lot_api
