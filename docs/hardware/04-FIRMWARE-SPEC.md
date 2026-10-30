# 04 — Firmware & Host Software

## 1. Stack
ESP-IDF 5.x (C/C++), FreeRTOS, esp32-camera, mbedTLS, BSEC2 for BME688, LVGL not needed (text UI on 128×64). Repo location (proposed): `/firmware` in this repo or a new `lot-systems/lot-node-firmware`.

## 2. States
`PROVISION → IDLE(deep sleep) → WAKE(poll inbox) → NOTIFY(show + haptic) → ACK(button) → POST hw_copy → IDLE`. Also `CHARGING`, `LOW_BATT`, `OTA`, `FACTORY_TEST`.
- Wake sources: timer (60 s default), button (EXT1), Qi-detect.
- Display: notice text 2 lines × 16 chars at large font; auto-dim; clear after TTL.
- Button: short = Copy/ack; long (3 s) = status screen; very long (10 s) = pair reset.
- Camera: off by default; v1 only on explicit local gesture; no upload in v1 (R6).

## 3. Storage
NVS: token, Wi-Fi creds, config. Flash ring buffer for offline events.

## 4. Security
Secure boot v2 + flash encryption in production; signed OTA (A/B partitions); TLS cert pinning; no secrets in repo.

## 5. OTA
`GET /api/device/config` returns `{fw, url, sha256, sig}`; update only on charger and >50 % battery.

## 6. Host software (connect to firmware)
- `lotnode` CLI (Node/TS to match repo): `flash`, `provision --wifi`, `monitor`, `selftest`, `serial-number`.
- Web Serial provisioning page on lot-systems.com (Chrome) for end users: Wi-Fi + claim code.
- Factory test jig script: voltage rails, OLED pattern, BME688 read, button, Qi detect, camera frame → PASS/FAIL + serial label.

## 7. Firmware docs to deliver
Architecture, memory/partition map, state machine, API contract (links 03), power budget, test plan, release/OTA procedure, factory test procedure.

## 8. Power budget (target 7 days)
Deep sleep ~20 µA; a 60 s wake of ~2.5 s at ~100 mA ≈ 4.2 mA avg ⇒ ~50 h on 220 mAh. **Too short.** Mitigate: 5 min poll (~0.9 mA ⇒ ~10 days), or ESP32 light-sleep with Wi-Fi DTIM, plus Qi top-up. Measure in Phase 2.
