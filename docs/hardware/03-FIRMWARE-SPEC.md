# HW-001 Firmware and Host Software Spec

## Stack

ESP32-S3, ESP-IDF 5.x (or Arduino-ESP32 for the prototype), LVGL for the screen, `esp_camera` for OV2640, esp-websocket-client, mbedTLS, OTA with signed images.

## State machine

`BOOT → UNPAIRED (show QR/code) → CONNECTING → IDLE (clock/weather) ⇄ NOTIFY (alert) → SLEEP`

## Behaviour

- **Notify:** WebSocket message wakes the screen, haptic pulse, shows up to 2 lines of 60 characters, stays up to `ttl` (default 60 s), sends `ack`.
- **Copy button (short press while a notification is shown):** `POST /api/device/event {type:"copy"}`, shows "COPIED ✓", brief haptic. If offline, queue up to 50 events in NVS flash and flush on reconnect.
- **Long press:** camera shutter → JPEG → `/api/device/photo`.
- **Idle screen:** time, temperature and humidity from the BME280.
- **Power:** deep-sleep between 10-minute telemetry windows; keep WebSocket only while on the charger or when "live mode" is on. Pager-like instant delivery on battery needs a wake-on-WiFi trade-off, so decide the latency target (see Open items).
- **Charging:** a BQ51013B handles Qi; the charger IC reports state on a GPIO; show a charging glyph.

## OTA

Check `/api/device/fw/latest` daily and on charger connect. Verify sha256 and ed25519 signature, write to the inactive partition, roll back if the new image does not confirm within 60 s.

## Host software

- **Web flasher:** ESP Web Tools page at `lot-systems.com/device/flash` (Chrome, WebSerial) for the first flash and for recovery.
- **Site page `/device`:** pair, rename, revoke, send test notification, view last telemetry, set quiet hours.
- **Dev CLI:** `scripts/device-sim.ts` that fakes a device against staging for backend work (planned).

## Test plan

1. Pairing succeeds and rejects a wrong code.
2. Notify → shown within 2 s (plugged in).
3. Copy → Log entry appears within 3 s; offline queue flushes.
4. 24 h soak with Wi-Fi drops.
5. Battery life measured in IDLE and live mode.
6. OTA rollback with a bad image.

## Open items

- Latency target on battery (instant vs up to 10 minutes).
- Screen UI font from the LOT brand kit (not read this session; sites unreachable).
