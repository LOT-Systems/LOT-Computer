#pragma once
#include <Arduino.h>

struct LotNotification { char id[40]; char text[64]; };
struct SensorSnap { float t; float rh; float p; float gasKohm; };

namespace lot_api {
  void begin(const char* token);
  // Returns number of notifications written to out (0 on 304/no change, -1 on error)
  int  fetchInbox(LotNotification* out, int max, uint32_t* pollIntervalS);
  bool postCopy(const char* notificationId, const char* text, const SensorSnap& s);
}
