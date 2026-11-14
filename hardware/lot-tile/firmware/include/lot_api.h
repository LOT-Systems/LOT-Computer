// LOT API connector — device side. Protocol: docs/06-LOT-API-CONNECTOR.md
#pragma once
#include <Arduino.h>

struct LotNotification {
  String id;
  String text;     // <= LOT_NOTIFY_MAX_CHARS
  String kind;     // nudge | checkin | weather | system
  uint32_t ts = 0;
};

struct LotSyncResult {
  bool ok = false;
  int httpStatus = 0;           // 401 => token revoked -> re-pair
  LotNotification latest;       // newest undelivered, if any
  bool hasNew = false;
  String cursor;
  uint32_t nextPollS = 0;
};

struct LotTelemetry {
  float tempC, rh, hPa, iaq;
  int gasClass, lux, batteryPct, rssi;
};

class LotApi {
 public:
  void begin(const String& host, const String& serial, const String& token);
  // Pairing
  bool registerDevice(String& pairCodeOut, uint32_t& expiresS);
  bool pollPair(const String& pairCode, String& tokenOut, String& nameOut);  // true when token issued
  // Runtime
  LotSyncResult sync(const String& cursor);
  bool copy(const String& notificationId);
  bool photo(const String& notificationId, const uint8_t* jpeg, size_t len);
  bool telemetry(const LotTelemetry& t);
  void setToken(const String& t) { token_ = t; }

 private:
  int postJson(const char* path, const String& body, String& resp, bool auth = true);
  int getJson(const String& pathAndQuery, String& resp);
  String host_, serial_, token_;
};
