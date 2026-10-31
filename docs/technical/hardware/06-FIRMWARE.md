# LOT PLATE — Firmware Spec (HW-06)

REV A · 2026-10-31 · Skeleton in `firmware/` is **UNCOMPILED / UNTESTED** (no PlatformIO or hardware in this sandbox).

## Stack
PlatformIO, ESP32-S3, Arduino-ESP32 core (EVT) → ESP-IDF (DVT). Libraries: ArduinoJson, HTTPClient (TLS), Adafruit BME680/BME68x (BSEC later), Adafruit ST7789/GFX, Bosch BMI270, esp32-camera.

## State machine
`BOOT → PROVISION (no token) → ONLINE_IDLE (screen off) → NOTIFY (screen on, haptic) → ACK (COPY pressed) → ONLINE_IDLE`
- **PROVISION**: SoftAP "LOT-PLATE-xxxx" or BLE; operator enters Wi-Fi + pairing code from lot-systems.com Settings → Devices; device exchanges code for a scoped token (07). Token in NVS (encrypted flash, DVT).
- **ONLINE_IDLE**: long-poll `GET /api/device/notifications?since=ID`; every 5 min telemetry; battery % in header.
- **NOTIFY**: render text (max 3 lines x 16 chars at 240 px, uppercase, LOT style: no emoji, "Military Purity"), haptic 200 ms, auto-dim 30 s.
- **COPY**: debounce 30 ms; `POST /api/device/event {type:"copy", notificationId}`; on 2xx show "COPIED." 1 s; on fail queue (ring buffer, 32) and retry with backoff 2/4/8/16 s.
- **Camera**: only on server command `capture` in poll reply; LED on; log event `device_capture`.

## OTA / security
HTTPS only (pin lot-systems.com CA), signed OTA (ESP secure boot v2 at DVT), token revoke = device wipes NVS. No secrets in source; `secrets.h` is gitignored.

## Compression of data
Telemetry JSON → short keys + delta since last; device sends ≤200 B/5 min. Server stores raw in Log metadata.

## Software to connect
`tools/lot-device-sim.mjs` — Node simulator that behaves exactly like the device against any server speaking 07 (uses `tools/mock-lot-api.mjs` locally). Used for server development before hardware exists.

## Test plan
Sim vs mock (automated, run in this repo) · Hardware-in-loop on P1 breadboard · 24 h soak · fault: Wi-Fi drop, 401 revoke, 5xx · battery curve.
