# LOT-HW-04 — Firmware Document
Target: ESP32-S3, ESP-IDF 5.x (C/C++), FreeRTOS.
## Modules
`net` (Wi-Fi provisioning, TLS, SSE client) · `api` (LOT connector, token store in NVS) · `ui` (text screen, 1 notice + status bar) · `input` (button: short=Copy, long=dismiss/pair) · `sensors` (BME688 w/ BSEC, BMI270, light) · `haptic` (DRV2605L patterns) · `camera` (off by default; shutter on request) · `power` (deep sleep, charge state) · `ota` (signed images, A/B partitions).
## Power model
Deep sleep between 30 s SSE keepalive wakes is not feasible with persistent SSE; use light sleep + Wi-Fi power-save (DTIM) target < 3 mA avg; fallback poll every 60 s for ~7 days on 130 mAh (to be measured in EVT).
## States
BOOT → PROVISION (BLE/pogo) → PAIR (code) → IDLE → NOTICE → ACK → IDLE; CHARGING overlay.
## Security
Secure boot + flash encryption on production units; token in encrypted NVS; OTA signature check.
## Tests
Unit (host), HIL button/screen, 72 h soak, drop, thermal (battery < 45 °C).
