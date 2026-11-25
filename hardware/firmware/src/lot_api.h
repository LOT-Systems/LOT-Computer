// LOT Device API client — same wire format as hardware/connector/lot-device.mjs
#pragma once
#include <Arduino.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

struct LotNote {
  uint32_t id;
  char     text[LOT_MAX_TEXT + 4];   // UTF-8, "…" is 3 bytes
  uint32_t fireAt;                    // epoch s, 0 = now
  uint32_t ttl;
  uint8_t  flags;
};

struct LotEnv { float t, rh, p, iaq; };

class LotApi {
 public:
  explicit LotApi(const char* token) : token_(token) {}

  // GET /api/device/inbox?since=<cursor>&fmt=c  → fills out[], returns count, updates cursor/serverNow/syncSec
  int inbox(uint32_t& cursor, LotNote* out, int max, uint32_t& serverNow, uint32_t& syncSec) {
    String body;
    if (!request("GET", String("/api/device/inbox?fmt=c&since=") + cursor, "", body)) return -1;
    JsonDocument doc;
    if (deserializeJson(doc, body)) return -1;
    cursor = doc["c"] | cursor;
    serverNow = doc["t"] | 0;
    syncSec = doc["s"] | LOT_SYNC_SEC_DEFAULT;
    int n = 0;
    for (JsonArray it : doc["i"].as<JsonArray>()) {
      if (n >= max) break;
      out[n].id = it[0];
      strlcpy(out[n].text, it[1] | "", sizeof(out[n].text));
      out[n].fireAt = it[2];
      out[n].ttl = it[3];
      out[n].flags = it[4];
      n++;
    }
    return n;
  }

  // POST /api/device/copy → creates a Log entry with event "device_copy"
  bool copy(const LotNote& n, const LotEnv& e, uint32_t now) {
    JsonDocument doc;
    doc["id"] = n.id;
    doc["text"] = n.text;
    doc["at"] = now;
    JsonObject env = doc["env"].to<JsonObject>();
    env["t"] = e.t; env["rh"] = e.rh; env["p"] = e.p; env["iaq"] = e.iaq;
    String payload, resp;
    serializeJson(doc, payload);
    return request("POST", "/api/device/copy", payload, resp);
  }

  // POST /api/device/telemetry — one compressed digest per wake session
  bool telemetry(uint32_t sid, uint16_t wakes, uint16_t copies, uint8_t batt, const LotEnv& e) {
    JsonDocument doc;
    doc["sid"] = sid; doc["w"] = wakes; doc["cp"] = copies; doc["b"] = batt;
    JsonObject env = doc["e"].to<JsonObject>();
    env["t"] = e.t; env["rh"] = e.rh; env["p"] = e.p; env["iaq"] = e.iaq;
    String payload, resp;
    serializeJson(doc, payload);
    return request("POST", "/api/device/telemetry", payload, resp);
  }

 private:
  const char* token_;

  bool request(const char* method, const String& path, const String& payload, String& out) {
    WiFiClientSecure tls;
    tls.setInsecure();  // BENCH ONLY. EVT-1: embed the lot-systems.com root CA (ISRG Root X1) and verify
    HTTPClient http;
    if (!http.begin(tls, String(LOT_API_BASE) + path)) return false;
    http.addHeader("Authorization", String("Bearer ") + token_);
    http.addHeader("User-Agent", "LOT-TILE/" LOT_FW_VERSION);
    http.setTimeout(8000);
    int code;
    if (strcmp(method, "GET") == 0) code = http.GET();
    else { http.addHeader("Content-Type", "application/json"); code = http.POST(payload); }
    if (code == 200) out = http.getString();
    http.end();
    return code == 200;
  }
};
