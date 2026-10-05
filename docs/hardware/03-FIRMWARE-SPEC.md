# 03 — FIRMWARE SPEC

## 1. Stack
- MCU: ESP32-S3, ESP-IDF 5.x (C/C++), FreeRTOS. Arduino-ESP32 acceptable for EVT only.
- OTA: dual-partition, signed images, HTTPS from lot-systems.com.
- Storage: NVS for device ID, token, Wi-Fi creds, last notification ID.

## 2. State machine
```
DEEP_SLEEP --timer/button--> WAKE --> WIFI_CONNECT --> SYNC
SYNC: GET /api/device/notifications?since=<id>
      POST /api/device/telemetry (weather, battery) every Nth wake
      POST /api/device/events (queued button events)
SYNC --new notification--> DISPLAY (screen on, buzz) --timeout 20s/Copy--> DEEP_SLEEP
```
Poll interval: 60–300 s (config from server). Button is a GPIO wake source, so Copy works even between polls (event queued in RTC memory, sent on next connect).

## 3. Display
Screen shows: message (max ~60 chars, 2–3 lines), time, battery. Terminal-grid style (monospace, no emoji, periods not symbols), per LOT-STYLE-GUIDE.

## 4. Sensors
BME688: temp/humidity/pressure every poll; gas/IAQ via Bosch BSEC when awake ≥ 3 s (optional). Values rounded and sent as one JSON object.

## 5. Camera
Off by default. Capture only on a long-press of the button; status LED forced on during capture; JPEG ≤ 100 KB uploaded to `/api/device/events` (type `photo`). No continuous streaming; no audio hardware.

## 6. Self-test (factory jig)
Reports PASS/FAIL JSON over USB/UART pogo: flash ID, PSRAM, Wi-Fi scan, display pattern, BME688 ID, camera ID, button, battery voltage, charge IC status.

## 7. Firmware document set (item 9)
| Doc | Content | Format |
|-----|---------|--------|
| FW-ARCH | this spec, expanded with task/memory maps | MD |
| FW-PINMAP | GPIO assignments per board rev | MD/CSV |
| FW-PROTOCOL | wire format; mirrors 04 | MD |
| FW-BUILD | toolchain, build, flash, sign, OTA | MD |
| FW-RELEASE-NOTES | per version | MD |
| MANUAL | user manual, PDF | PDF |
Repo layout proposed: `hardware/firmware/` (ESP-IDF project) and `hardware/tools/` (host software).
