// LOT·01 — board peripherals: display, sensors, haptic, battery
#pragma once
#include <Arduino.h>
#include "lot_api.h"

namespace hw {
void begin();
void showText(const String& text, const String& footer = "");
void showPairCode(const String& userCode);
void buzz(uint8_t pulses);
LotEnv readEnv();
int batteryPct();
int batteryMv();
bool onCharger();
void powerDownPeripherals();
}
