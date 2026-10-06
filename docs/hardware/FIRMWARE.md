# LOT® Pager — Firmware Specification (v0.1)

**Target:** ESP32-S3, ESP-IDF 5.x (C/C++), FreeRTOS. Repo path when created: `hardware/firmware/`.

## 1. Modules
| Module | Role |
|---|---|
| `net` | Wi-Fi STA, TLS, device token storage (NVS encrypted) |
| `lotapi` | Calls the device API (see SOFTWARE-CONNECTOR) |
| `ui` | LVGL on GC9A01; screens: Notify, Idle(clock/weather), Status |
| `alert` | piezo/haptic patterns (`soft`, `urgent`) |
| `button` | debounce, short press = Copy, long press = dismiss/ack, 10 s = pairing mode |
| `sense` | BME688 (BSEC2), VEML7700, IMU; 5-min sampling |
| `cam` | on-demand capture only, JPEG ≤ 100 KB, upload on explicit action |
| `power` | Qi state, gauge, charger, sleep policy |
| `ota` | signed OTA via server, rollback on failed boot |

## 2. States
`PROVISION → PAIR → IDLE(light sleep) ⇄ NOTIFY ⇄ CAPTURE`, with `CHARGING` overlay.

## 3. Timing
Poll 30 s on battery, 5 s on charger. Sensor post every 5 min, batched. Target ≥ 3 days on 120 mAh.

## 4. Notification handling
Payload: `{id, text, level, expires_at}`. Show text (≤ 60 chars), play pattern by `level`, wait for button. Short press → `copy` event with `notification_id`; long press → `ack`. Unacknowledged notifications re-alert once, then expire. Quiet hours enforced server-side and mirrored locally.

## 5. Security
Secure boot v2 + flash encryption; TLS pinned to server CA; token revocable from site; no inbound ports.

## 6. Camera / privacy
Camera never streams. Capture only on button chord or server request that the user approves on-device; screen shows a capture indicator.

## 7. Build / test
`idf.py build`; unit tests on host for parsing and state machine; HIL test via host CLI.
