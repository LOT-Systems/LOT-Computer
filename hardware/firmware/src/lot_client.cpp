#include "lot_client.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include "config.h"

// TLS: pin the ISRG Root X1 (Let's Encrypt) CA. Fill in at P1 from the live chain of lot-systems.com.
static const char* ROOT_CA = nullptr;  // TODO(P1): PEM string

void LotClient::begin(const String& token) { _token = token; }

int LotClient::request(const char* method, const String& path, const String& body, String& out) {
  WiFiClientSecure tls;
  if (ROOT_CA) tls.setCACert(ROOT_CA); else tls.setInsecure();  // insecure ONLY on breadboard
  HTTPClient http;
  http.setTimeout(HTTP_TIMEOUT_MS);
  if (!http.begin(tls, String(LOT_API_BASE) + path)) return (_status = -1);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("User-Agent", "LOT-L01/" L01_FW_VERSION);
  if (_token.length()) http.addHeader("Authorization", "Bearer " + _token);
  _status = http.sendRequest(method, body);
  out = _status > 0 ? http.getString() : "";
  http.end();
  return _status;
}

String LotClient::claim(const String& code, const String& deviceId) {
  JsonDocument d;
  d["code"] = code; d["deviceId"] = deviceId; d["hw"] = HW_NAME; d["fw"] = L01_FW_VERSION;
  String body, out; serializeJson(d, body);
  if (request("POST", "/pair/claim", body, out) != 200) return "";
  JsonDocument r; if (deserializeJson(r, out)) return "";
  _token = r["deviceToken"].as<String>();
  return _token;
}

LotInbox LotClient::inbox(uint32_t since) {
  LotInbox ib; String out;
  if (request("GET", "/inbox?since=" + String(since), "", out) != 200) return ib;
  JsonDocument r; if (deserializeJson(r, out)) return ib;
  ib.ok = true;
  ib.cursor = r["cursor"] | since;
  ib.pollSeconds = r["pollSeconds"] | DEFAULT_POLL_S;
  ib.digest = r["digest"].as<String>();
  JsonArray msgs = r["messages"].as<JsonArray>();
  if (msgs.size()) {
    JsonObject m = msgs[msgs.size() - 1];
    ib.latest.id = m["id"].as<String>();
    ib.latest.text = m["text"].as<String>().substring(0, SCREEN_MAX_CHARS);
    ib.latest.buzz = m["buzz"] | 1;
    ib.hasMessage = true;
  }
  return ib;
}

bool LotClient::copy(const String& messageId, const String& text) {
  JsonDocument d; d["messageId"] = messageId; d["text"] = text;
  String body, out; serializeJson(d, body);
  return request("POST", "/copy", body, out) == 200;
}

bool LotClient::telemetry(const LotReading& x) {
  JsonDocument d; JsonObject r = d["readings"].to<JsonArray>().add<JsonObject>();
  r["c"] = x.c; r["rh"] = x.rh; r["hpa"] = x.hpa; r["iaq"] = x.iaq;
  r["gasClass"] = x.gasClass; r["batt"] = x.batt; r["rssi"] = x.rssi;
  String body, out; serializeJson(d, body);
  return request("POST", "/telemetry", body, out) == 204;
}

bool LotClient::unpair() {
  String out; bool ok = request("DELETE", "/token", "", out) == 204;
  _token = ""; return ok;
}
