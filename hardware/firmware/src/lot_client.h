// LOT device API client — protocol in hardware/docs/07-SOFTWARE-CONNECTOR.md
#pragma once
#include <Arduino.h>

struct LotMessage {
  String id;
  String text;
  uint8_t buzz = 0;
};

struct LotInbox {
  bool ok = false;
  uint32_t cursor = 0;
  uint32_t pollSeconds = 0;
  String digest;
  LotMessage latest;   // newest message, if any (only the newest is shown)
  bool hasMessage = false;
};

struct LotReading {
  float c, rh, hpa;
  int iaq;
  const char* gasClass;
  int batt, rssi;
};

class LotClient {
 public:
  void begin(const String& token);
  bool paired() const { return _token.length() > 0; }
  String claim(const String& code, const String& deviceId);  // returns token or ""
  LotInbox inbox(uint32_t since);
  bool copy(const String& messageId, const String& text);   // → Log tab (device_copy)
  bool telemetry(const LotReading& r);
  bool unpair();
  int lastStatus() const { return _status; }

 private:
  int request(const char* method, const String& path, const String& body, String& out);
  String _token;
  int _status = 0;
};
