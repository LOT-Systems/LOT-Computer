// Copy to config.h (git-ignored) and fill in. In production the token lives in
// encrypted NVS, written by the factory jig, never in source.
#pragma once
#define LOT_WIFI_SSID   "your-ssid"
#define LOT_WIFI_PASS   "your-pass"
#define LOT_HOST        "https://lot-systems.com"
#define LOT_DEVICE_TOKEN "lotd_..."   // from POST /api/devices (shown once)
