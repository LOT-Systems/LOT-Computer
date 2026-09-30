# LOT PAGER — Firmware Spec v0.1 (DRAFT)

**Target:** ESP32-S3, ESP-IDF 5.x (C), FreeRTOS. Repo path proposal: `hardware/firmware/`.

## Tasks
| Task | Prio | Role |
|---|---|---|
| net | 5 | Wi-Fi, TLS, long-poll inbox, event/telemetry POST, backoff |
| ui | 4 | LVGL 240×240 render: notification, idle clock, status bar |
| input | 6 | button ISR → debounced event queue → net |
| sense | 3 | BME688 (BSEC), light, IMU; batch every 5–15 min |
| power | 3 | fuel gauge, Qi status, deep-sleep scheduling |
| cam | 2 | on-demand capture, JPEG upload (only on server request or long-press) |
| ota | 1 | signed OTA from `/api/device/firmware` |

## Power budget target
Light sleep between polls; Wi-Fi DTIM listen; screen off after 10 s; goal ≥ 3 days on 250 mAh (to validate on EVT).

## States
`PROVISION → PAIRED → IDLE ⇄ NOTIFY → (BUTTON) COPY_SENT`, `LOW_BATT`, `OTA`, `FAULT`.

## Compression per session (item 8)
Telemetry batched + delta-encoded (CBOR), gzip when >512 B; JPEG quality 12; notification history capped 20 entries in flash.

## Host software (item 10)
`hardware/tools/lotpager-cli` (Python): flash, provision Wi-Fi + pair code, read serial log, run self-test, fetch factory report.
Needs ESP-IDF toolchain + `esptool`; USB-C-less design → pogo-pad programming header on board (test-point fixture for 100-unit run).
