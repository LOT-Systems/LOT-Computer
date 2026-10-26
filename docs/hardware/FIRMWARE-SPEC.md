# Firmware & Host Software Spec — P0

## 1. Stack
ESP32-S3, ESP-IDF 5.x (C/C++), LVGL for UI, FreeRTOS, ESP-IDF OTA with rollback, secure boot + flash encryption in production.

## 2. States
`DEEP_SLEEP` → wake on button/IMU tap/timer → `CONNECT` → `FETCH` → `SHOW` → `SLEEP`. Target: battery life ≥ 3 days at 1 poll / 60 s (to be measured on EVT).

## 3. Modules
display, button (debounce, long-press), haptic, sensors (BME688 via BSEC, VEML7700, BMI270), power (MAX17048, Qi status), net (Wi-Fi provisioning over BLE, TLS client), api (see API-CONNECTOR), camera (capture on demand, active LED forced on), ota, log.

## 4. Notification UX
Full-screen text, haptic pattern per payload, button short-press = Copy (sends event, brief checkmark), long-press = dismiss. Idle screen: time-less minimal glyph + temp.

## 5. Weather
Sensor read every 5 min when awake; batched telemetry. Gas/IAQ uses Bosch BSEC library (check its licence before shipping).

## 6. Camera
Disabled by default; capture only on server request, LED mandatory, no local storage.

## 7. Host software
CLI/desktop tool (Node/TypeScript to match repo): flash firmware, provision Wi-Fi + pairing, read logs over USB-CDC, factory test (sensor self-check, button, display, charge). Used on the 100-unit line.

## 8. Test
Unit tests on host (api, state machine), hardware-in-loop smoke at EVT, soak at DVT.
