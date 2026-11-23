#pragma once
#include "Arduino.h"
struct WiFiShim { String macAddress() { return "LOT01-NATIVE-0001"; } };
static WiFiShim WiFi;
