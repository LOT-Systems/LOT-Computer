================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — FIRMWARE SPECIFICATION
================================================================================

DOCUMENT    FW-SPEC / LOT-COMPUTER v0.1
ISSUE DATE  2026.09.12
CLASS       INTERNAL / BUILD
COMPANION   LOT-COMPUTER-HARDWARE-SPEC.md (electronics), LOT-COMPUTER-
            SOFTWARE-INTEGRATION.md (server-side contract this firmware
            talks to)

================================================================================

## 00  PLATFORM

```
TARGET       ESP32-S3-WROOM-1, 8MB PSRAM
FRAMEWORK    ESP-IDF (C), FreeRTOS scheduler underneath
DISPLAY      LVGL on top of a GC9A01 SPI driver — round-display friendly
CAMERA       esp32-camera driver, OV2640, JPEG output at QVGA for Log photos
OTA          ESP-IDF native OTA (dual-partition A/B), signed images only
```

FreeRTOS over bare-metal because three independent duty cycles run
concurrently and must not block each other: the notification poll/SSE task,
the button-debounce task, and the weather-sensor sample task. A single
super-loop would make the button feel laggy under a slow network read.

================================================================================

## 01  BOOT + PAIRING

```
COLD BOOT
  1. Load WiFi credentials + device token from NVS (encrypted partition).
  2. If absent → enter PAIRING MODE: device broadcasts a SoftAP
     "LOT-COMPUTER-XXXX", serves a captive portal with WiFi SSID/password
     entry AND a 6-digit pairing code shown on the round display.
  3. Operator enters that 6-digit code at lot-systems.com/devices/pair
     (server side, see SOFTWARE-INTEGRATION doc — this endpoint does not
     exist yet and is a required software task, not assumed live).
  4. On success, server issues a long-lived device token scoped to that
     operator's account. Device stores it in NVS, reboots into NORMAL MODE.

NORMAL BOOT
  1. Join WiFi (stored creds).
  2. Open the notification channel (Section 02).
  3. Start weather-sensor task (60s sample interval, BME680).
  4. Idle screen: LOT wordmark, small WiFi/battery glyphs. Waits for signal.
```

================================================================================

## 02  NOTIFICATION CHANNEL — "PAGER-LIKE"

The device does not run a web browser or hold a persistent render of the
site. It holds ONE line of text at a time. Two transport options, ranked:

```
OPTION A (preferred)  Persistent connection to the existing SSE endpoint,
                       GET /sync, already live in src/server/routes/api.ts.
                       That endpoint emits {event, data} JSON frames
                       (e.g. "live_message", "settings_updated"). This
                       firmware adds a client for one more frame type:
                       {"event": "device_notification", "data": {"text": "..."}}
                       — a NEW event type, server-side work, not yet emitted.
                       ESP32 SSE clients are lightweight; one open TCP
                       socket, no polling overhead.

OPTION B (fallback)   5-second poll of a lightweight endpoint that returns
                       the single most recent unread notification for the
                       device's operator. Simpler to implement first;
                       worse battery life; use only if SSE proves unstable
                       on-device during v0.2 bring-up.
```

On receipt: render text centered on the round display, 2-4 word wrap,
vibrate-free (no haptic motor in this BOM — CUBIQ owns motion, this device
does not), auto-dim after 30s, clear on next notification or after 10 min.

================================================================================

## 03  THE "COPY" BUTTON

```
PRESS            Debounce 40ms (FreeRTOS timer), single-press only —
                 no long-press/double-press gesture in v1. One button,
                 one job, per the source brief.
ON PRESS         1. Capture a QVGA JPEG from the camera (best-effort;
                    skip silently if camera init failed — never block
                    the signal on a camera fault).
                 2. POST the event to the LOT API (contract in
                    SOFTWARE-INTEGRATION.md, Section 01) with the
                    current on-screen notification text (if any) and
                    the photo as a base64 or multipart attachment.
                 3. Flash the display border green for 400ms = local
                    acknowledgment, independent of server response.
ON FAILURE       Queue the event in a small ring buffer (8 entries) in
                 NVS; retry on next successful WiFi check-in. Never drop
                 silently, never block the UI waiting on a retry.
```

This is the device's only write path. It is intentionally narrow: one
button, one event type, one server contract.

================================================================================

## 04  WEATHER SENSOR LOOP

```
SAMPLE           BME680 every 60s: temperature (C), humidity (%),
                 pressure (hPa), gas resistance (VOC proxy, ohms).
LOCAL USE        Small icon-row on the idle screen (temp + a 3-state
                 air quality glyph derived from gas resistance banding).
UPLOAD           Batched, not per-sample: one weather_update log event
                 every 15 minutes, reusing the event type that already
                 exists in the LOT API's displayableEvents whitelist
                 (src/server/routes/api.ts) — no new event type needed
                 for this path, unlike the notification channel above.
```

================================================================================

## 05  SESSION COMPRESSION (source brief, point 8)

"Compress the information in each session" is implemented as: the device
does not stream raw sensor ticks to the server. It accumulates a session —
boot to next deep-sleep or reconnect — and folds it into ONE summary struct
before any upload:

```
struct SessionSummary {
  uint32_t  session_start_epoch;
  uint32_t  session_end_epoch;
  float     temp_min, temp_max, temp_mean;
  float     humidity_mean;
  uint16_t  notifications_received;
  uint8_t   copy_presses;
  uint8_t   wifi_reconnects;
};
```

One struct, one upload, per session — not a log line per sensor tick. This
mirrors the repo's own COCKPIT-RULE doctrine (docs/benchmark/LOT-DOCTRINE.md
§ Log Military Style): the body is instrument readings, compressed, not
narrated, not raw.

================================================================================

## 06  POWER STATES

```
ACTIVE     WiFi + SSE socket open, screen on. ~120mA average. Only while
           a notification is on-screen or within 30s of one.
IDLE       WiFi connected, SSE socket open, screen dimmed/off. ~45mA.
DEEP SLEEP Not used in v1 — the SSE model requires a held connection, so
           the device stays IDLE rather than sleeping. Battery budget
           (Section 06 below) is sized for continuous IDLE, not sleep
           cycling. A v1.1 revisit could move to OPTION B polling +
           deep sleep between polls if 2-3 day runtime proves too short
           for the intended "leave it on the desk" use case.
```

Battery runtime at the 300mAh cell (HARDWARE-SPEC Section 02), ~45mA idle
draw: roughly 6-7 hours without charging if never docked. This device is
explicitly NOT designed to run untethered for days — it is meant to sit on
its wireless charging pad continuously, per point 19 of the source brief.
Stated plainly rather than implying multi-day battery life the power
budget does not support.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.12
================================================================================
