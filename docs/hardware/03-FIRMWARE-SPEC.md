<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA — Vadik, Inventor
  Made in the USA | brand.lot-systems.com
-->

# 03 — Firmware Document (v0.1 draft)

**Target:** ESP32-S3 · ESP-IDF 5.x (PlatformIO optional) · C/C++ · FreeRTOS.

## Modules
| Module | Function |
|---|---|
| `net` | Wi-Fi STA, TLS (cert pinned to lot-systems.com), provisioning via BLE/serial |
| `api` | Device token auth; poll for notifications; post logs/telemetry (see 04) |
| `ui` | Screen renderer: notification text (wrap, 3 lines), time, battery, Wi-Fi; "Coffee time!" style full-screen |
| `btn` | Debounce; short press = **Copy**; long press (2 s) = menu/shutter; double = ack |
| `sens` | BME688 via BSEC (AI gas/IAQ), VEML7700, BMI270; 1/min sample, 10/min batch upload |
| `pwr` | MAX17048 gauge, Qi/charger state, light-sleep between polls, deep sleep < 15 % |
| `cam` | OV2640 capture on demand, JPEG, privacy LED on, opt-in flag from site |
| `ota` | Signed OTA from site, rollback on failed boot |
| `log` | Ring buffer in flash, uploaded with telemetry |

## Behavior
1. Boot -> load token from NVS -> join Wi-Fi -> GET `/api/device/poll` (long-poll 30 s).
2. On notification: wake screen, show text, buzz-free (silent v1; optional haptic v2); mark delivered.
3. Button short press: POST `/api/device/log` `{ text: <current notification or "copy">, event: "device_copy" }`; show ✓.
4. Offline: queue up to 50 events in flash, flush when online.
5. Power target: ≥ 2 days at 1 min poll interval on 150 mAh using light-sleep (to validate in P1).

## Documents produced from firmware repo
Hardware pin map, memory map, boot flow, OTA procedure, factory test procedure, release notes (all Markdown -> PDF).
