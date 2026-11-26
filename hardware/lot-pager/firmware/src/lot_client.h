// LOT PAGER · LOT API connector (device side)
// Talks to the existing LOT server routes — no server change needed for EVT-0:
//   GET  /api/contextual-prompts   -> autonomous notification candidates
//   GET  /api/live-message         -> global broadcast line
//   POST /api/logs                 -> "Copy" signal, lands in the Log tab
// Auth: Cookie auth_token=<JWT>  (EVT-0). Scoped device token in EVT-1.
#pragma once
#include <Arduino.h>

struct LotNotice {
  String text;      // <= NOTIFY_MAX_CHARS, already trimmed for the screen
  String source;    // "prompt" | "live" | "none"
  int priority;     // 0-10 (prompts), 0 for live
};

struct LotSensorSnapshot {
  float tempC;
  float humidityPct;
  float pressureHPa;
  float gasKOhm;    // BME688 raw gas resistance; IAQ in EVT-1 via BSEC2
  bool valid;
};

namespace lot {
  bool begin();                                   // Wi-Fi up, TLS ready
  LotNotice fetchNotice();                        // best line for the screen
  bool postCopy(const LotNotice& n, const LotSensorSnapshot& s);  // Copy -> Log
  String compress(const String& in, size_t maxChars);             // pager-length line
}
