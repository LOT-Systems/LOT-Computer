# 04 — Firmware

Stack: ESP-IDF 5.x (C/C++), FreeRTOS; alternative PlatformIO/Arduino-ESP32 for P1.

## Modules
`net` (Wi-Fi, TLS, long-poll) · `api` (03 client) · `ui` (LVGL/TFT_eSPI, notification
card, status bar) · `input` (button debounce, short/long press) · `sensors` (BME688, IMU,
fuel gauge) · `cam` (on-demand JPEG) · `power` (deep sleep, charge state) · `store` (NVS
config, offline queue) · `ota` (signed, rollback) · `prov` (USB serial provisioning, 05).

## State machine
BOOT → PROVISIONED? (no → PAIRING screen) → CONNECT → IDLE (screen off, light sleep, Wi-Fi
DTIM) → NOTIFY (wake on poll result: buzz + show) → [button] COPY → send event → IDLE.
Double press = dismiss; long press (2 s) = status screen; 10 s hold = factory reset.
Motion (IMU tap/raise) wakes the screen.

## Power budget (est.)
Light sleep ≈ 1–3 mA with Wi-Fi modem-sleep; 100 mAh → ~1.5–3 days. Improvement: BLE
beacon-wake or 5–10 min poll intervals (hours of latency) → ~1–2 weeks. Pager "instant"
delivery conflicts with battery life; make cadence configurable via /config.

## Versioning/OTA
SemVer, signed images, A/B partitions, rollback on failed boot, `/config` pins target version.

## Test hooks
Self-test command over USB serial: sensors, LCD pattern, button, camera frame, charge IC, RSSI.
