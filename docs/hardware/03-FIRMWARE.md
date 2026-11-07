# 03 — FIRMWARE

**Target:** ESP32-C3, ESP-IDF 5.x (C), FreeRTOS. Repo path proposed: `firmware/lot-p1/` (not created yet).

## Modules
`net` (Wi-Fi, TLS, HTTPS client) · `api` (device protocol, HMAC) · `ui` (memory-LCD renderer, 1-bit fonts) · `btn` (debounce, short/long press) · `sense` (SHT45, BMP390, BME688/BSEC, VEML7700, BHI260AP) · `cam` (HM0360 capture, off by default) · `pwr` (BQ25100 status, Qi state, deep sleep) · `ota` (signed OTA, 2 slots) · `prov` (BLE provisioning) · `log` (ring buffer in flash).

## State machine
`PROVISION → IDLE(deep sleep) → WAKE(timer/button/IMU) → SYNC(poll, post telemetry) → SHOW(notification) → ACK(button) → IDLE`

- **Wake sources:** RTC timer (poll every 60 s idle, 15 min battery-saver), button GPIO, IMU interrupt (pick-up lights screen).
- **Notification:** `GET /api/device/inbox` → up to 3 messages ≤ 64 chars + icon id; shown 20 s; memory LCD keeps it with ~0 power until replaced.
- **Button "Copy":** short press → `POST /api/device/event {type:"copy", notificationId}`; queue offline, retry with backoff. Long press (2 s) → pairing/status screen. Screen blinks once as receipt.
- **Telemetry** every 10 min: temp, RH, pressure, IAQ class, battery %, RSSI → batched.
- **Security:** per-device ECDSA key in eFuse/flash-encryption, secure boot v2, TLS 1.2+, signed OTA, no camera upload without active user flag.
- **Power target:** < 25 µA deep sleep w/o BSEC, avg < 0.9 mA at 10-min cadence → 90 mAh ≈ 4 days at heavy duty; ~2–3 weeks with 30-min cadence and BME688 off. Measure in Phase 2.

## Docs/tests
Unit tests (Unity), HIL script using dev board + mock server, release artifact: `lot-p1-vX.Y.Z.bin` + SHA256 + signature.
