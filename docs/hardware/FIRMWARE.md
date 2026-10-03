# Firmware & Host Software Plan (items 9, 10)

## 1. Toolchain
ESP-IDF 5.x (C/C++), FreeRTOS, LVGL 9 for UI, `esp32-camera`, `esp_http_client`/WSS, Bosch BSEC2, NVS + OTA (dual partitions, signed images, secure boot v2, flash encryption in PVT).

## 2. Tasks
| Task | Role |
|---|---|
| net | Wi-Fi provisioning, TLS, inbox long-poll, event/telemetry upload |
| ui | LVGL: notification card, status bar (battery, Wi-Fi), idle clock |
| input | Button debounce, gestures (short=Copy, long=photo, double=dismiss) |
| sensors | BME688/BSEC2, BMI270, VEML7700 on I²C; sleep-friendly sampling |
| power | Light-sleep between polls, charge state, brightness from lux, brownout |
| ota | Check version in `/api/device/inbox` metadata; signed update |
| store | Offline queue (≤50 events) in NVS/LittleFS |

## 3. Power budget goal
Light-sleep + Wi-Fi DTIM, polling 25–30 s long-poll → ~1–2 mA avg; ≥24 h on 60–100 mAh; deep-sleep mode with button wake for "travel".

## 4. Memory map (8 MB flash)
bootloader 32 K · nvs 24 K · otadata 8 K · app0 2.5 M · app1 2.5 M · storage (LittleFS) 2 M · coredump 64 K.

## 5. Camera
JPEG capture on long-press, VGA, ≤120 kB; no frames persisted on device; LED lit while the sensor is on (privacy).

## 6. Security
Per-device token in encrypted NVS; no secrets in image; signed OTA; no inbound ports; debug UART disabled in PVT.

## 7. Host software "LOT Link" (item 10)
- Cross-platform desktop/web (Web Serial + Web Bluetooth) in a new `tools/lot-link/` (or a `/device` page on the site).
- Functions: flash firmware, enter Wi-Fi creds, pair code entry, view live logs, run factory test, factory-reset, export device report.
- Delivered in P6; P2–P5 use `esptool` + a Node CLI (`lotctl`) wrapping the connector API for testing.

## 8. Test plan
Unit tests (Unity), HIL jig, soak 72 h, RF range (≥10 m through glass), drop test 1 m, battery cycle 100×.

## 9. Repo layout (proposed)
```
hardware/
  firmware/        ESP-IDF project
  pcb/             KiCad project
  mech/            STEP, DXF
  tools/lot-link/  host software
docs/hardware/     (this directory)
```
