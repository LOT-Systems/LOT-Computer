// LOT·01 — client for /device-api/v1 (see 07-LOT-API-CONNECTOR.md)
#pragma once
#include <Arduino.h>

struct LotItem {
  String id;
  String text;   // <= LOT_MAX_TEXT
  String kind;   // nudge | reminder | weather | system
  uint32_t ts = 0;
};

struct LotEnv {
  float c = NAN, rh = NAN, hpa = NAN, iaq = NAN;
};

namespace lot {
bool begin(const String& token);                 // set bearer token
bool pairStart(String& deviceCode, String& userCode, uint32_t& intervalS);
int  pairPoll(const String& deviceCode, String& tokenOut, String& deviceIdOut); // 0 pending, 1 ok, -1 error
bool inbox(const String& since, LotItem& newest, uint32_t& nextPollS);          // true if new item
bool ack(const String& id);
bool copy(const LotItem& item, const LotEnv& env, String& logIdOut);
bool telemetry(int batPct, int mv, int rssi, uint32_t uptimeS);
}
