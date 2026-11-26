// Copy to include/config.h (git-ignored) and fill in. NEVER commit config.h.
#pragma once

#define LOT_WIFI_SSID      "your-ssid"
#define LOT_WIFI_PASS      "your-pass"
#define LOT_HOST           "lot-systems.com"
#define LOT_PORT           443

// EVT-0 ONLY: the auth_token cookie value of a dedicated test account.
// It is a full-account credential (30-day JWT). EVT-1 replaces it with a
// scoped device token issued by pairing (see 06-SOFTWARE-CONNECTOR-LOT-API.md).
#define LOT_AUTH_TOKEN     "paste-test-account-jwt-here"

#define LOT_DEVICE_ID      "TILE40-EVT0-001"

// Pins — XIAO ESP32S3 Sense mapping. Custom PCB remaps in EVT-1.
#define PIN_BUTTON         1   // D0, active LOW, internal pull-up, RTC-capable (wake source)
#define PIN_LCD_SCK        7   // D8
#define PIN_LCD_MOSI       9   // D10
#define PIN_LCD_CS         2   // D1
#define PIN_I2C_SDA        5   // D4
#define PIN_I2C_SCL        6   // D5

#define POLL_INTERVAL_S    (15 * 60)  // notification poll when idle
#define NOTIFY_MAX_CHARS   64         // a pager line, not an essay
