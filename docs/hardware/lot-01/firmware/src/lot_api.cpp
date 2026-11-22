// LOT·01 — HTTPS JSON client for the LOT device API.
#include "lot_api.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ISRG Root X1 (Let's Encrypt). Replace/append the backup root before PVT.
static const char* LOT_ROOT_CA = R"PEM(
-----BEGIN CERTIFICATE-----
REPLACE_WITH_ISRG_ROOT_X1_PEM
-----END CERTIFICATE-----
)PEM";

static String g_token;

static bool request(const char* method, const String& path, const JsonDocument* body, JsonDocument& out) {
  WiFiClientSecure tls;
#ifdef LOT_INSECURE_DEV
  tls.setInsecure();            // simulator on LAN only, never in production builds
#else
  tls.setCACert(LOT_ROOT_CA);
#endif
  HTTPClient http;
  http.setTimeout(8000);
  String url = String(LOT_API_BASE) + path;
  bool isHttps = url.startsWith("https://");
  if (isHttps ? !http.begin(tls, url) : !http.begin(url)) return false;
  http.addHeader("Content-Type", "application/json");
  if (g_token.length()) http.addHeader("Authorization", "Bearer " + g_token);

  String payload;
  if (body) serializeJson(*body, payload);
  int code = http.sendRequest(method, payload);
  if (code <= 0) { http.end(); return false; }
  DeserializationError err = deserializeJson(out, http.getStream());
  http.end();
  return code >= 200 && code < 300 && !err;
}

namespace lot {

bool begin(const String& token) { g_token = token; return true; }

bool pairStart(String& deviceCode, String& userCode, uint32_t& intervalS) {
  JsonDocument req, res;
  req["serial"] = WiFi.macAddress();
  req["fw"] = LOT_FW_VERSION;
  req["hw"] = LOT_HW_REV;
  if (!request("POST", "/pair/start", &req, res)) return false;
  deviceCode = res["device_code"].as<String>();
  userCode = res["user_code"].as<String>();
  intervalS = res["interval"] | 5;
  return deviceCode.length() > 0;
}

int pairPoll(const String& deviceCode, String& tokenOut, String& deviceIdOut) {
  JsonDocument req, res;
  req["device_code"] = deviceCode;
  if (!request("POST", "/pair/poll", &req, res)) return -1;
  if (res["status"] == "ok") {
    tokenOut = res["token"].as<String>();
    deviceIdOut = res["device_id"].as<String>();
    return 1;
  }
  return res["status"] == "pending" ? 0 : -1;
}

bool inbox(const String& since, LotItem& newest, uint32_t& nextPollS) {
  JsonDocument res;
  String path = "/inbox";
  if (since.length()) path += "?since=" + since;
  if (!request("GET", path, nullptr, res)) return false;
  nextPollS = constrain((uint32_t)(res["next_poll_s"] | LOT_DEFAULT_POLL_S), LOT_MIN_POLL_S, LOT_MAX_POLL_S);
  JsonArray items = res["items"].as<JsonArray>();
  if (items.isNull() || items.size() == 0) return false;
  JsonObject last = items[items.size() - 1];
  newest.id = last["id"].as<String>();
  newest.text = last["t"].as<String>().substring(0, LOT_MAX_TEXT);
  newest.kind = last["k"] | "nudge";
  newest.ts = last["ts"] | 0;
  return true;
}

bool ack(const String& id) {
  JsonDocument req, res;
  req["id"] = id;
  return request("POST", "/ack", &req, res);
}

bool copy(const LotItem& item, const LotEnv& env, String& logIdOut) {
  JsonDocument req, res;
  if (item.id.length()) req["id"] = item.id;
  req["t"] = item.text;
  req["ts"] = (uint32_t)time(nullptr);
  if (!isnan(env.c)) {
    JsonObject e = req["env"].to<JsonObject>();
    e["c"] = env.c; e["rh"] = env.rh; e["hpa"] = env.hpa;
    if (!isnan(env.iaq)) e["iaq"] = env.iaq;
  }
  if (!request("POST", "/copy", &req, res)) return false;
  logIdOut = res["log_id"].as<String>();
  return true;
}

bool telemetry(int batPct, int mv, int rssi, uint32_t uptimeS) {
  JsonDocument req, res;
  req["bat"] = batPct; req["mv"] = mv; req["rssi"] = rssi;
  req["fw"] = LOT_FW_VERSION; req["up_s"] = uptimeS;
  return request("POST", "/telemetry", &req, res);
  // TODO(P3): handle res["ota"] → esp_https_ota on Qi power only.
}

}  // namespace lot
