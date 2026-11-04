# LOT Pager — Firmware Specification (v0)

**Stack:** ESP-IDF 5.x (C/C++), FreeRTOS. LVGL for UI. Target ESP32-S3.

## Power states
| State | What's on | Current (est.) | Entry/Exit |
|---|---|---|---|
| DEEP | RTC only | ~10 µA | Wake: button, IMU tap, timer |
| LIGHT | CPU asleep, Wi-Fi power-save | ~1–3 mA | Between polls |
| POLL | Wi-Fi up, HTTPS GET | ~100 mA × ~2 s | Every 60 s |
| ALERT | Screen + haptic | ~60 mA × 10 s | New notification |
| CAPTURE | Camera + Wi-Fi upload | ~150 mA × few s | Long-press (future) |

## Boot flow
ROM → bootloader (secure boot v2) → app (OTA slot A/B) → load NVS (Wi-Fi, device token) → unpaired? → BLE/pogo pairing mode : poll loop.

## Tasks
`net_task` (poll/post), `ui_task` (LVGL), `sensor_task` (BME688 via BSEC every 3 s in ULP mode when active; 5 min otherwise), `btn_task` (debounce, short/long press), `haptic_task`.

## Behaviors
1. Poll `GET /api/device/poll?since=<id>`; show newest notification, buzz pattern by `priority`.
2. COPY short-press → `POST /api/device/event {type:"copy", notificationId, text}`; screen flashes "COPIED"; if offline, queue up to 32 events in NVS.
3. Every 5 min POST sensor snapshot (T, RH, P, gas class, battery %).
4. OTA: server returns `firmware: {version, url, sha256}` in poll; verify signature, flash inactive slot, rollback on failed boot.

## Security
Per-device token (256-bit) in NVS-encrypted partition; TLS pinning to lot-systems.com; flash encryption + secure boot on production units; no listening ports.

## Files (to create)
`firmware/` (ESP-IDF project), `firmware/docs/` (this doc split into API, power, UI).
