# LOT-HW-04 — Firmware (v0.1 scaffold)

Path: `hardware/firmware/lot-pager/` · Target: ESP32-S3, Arduino core on PlatformIO for EVT. Move to ESP-IDF 5.x at DVT for secure boot and flash encryption.

## Build
```
cd hardware/firmware/lot-pager
cp src/config.example.h src/config.h   # Wi-Fi + device token (git-ignored)
pio run -e evt -t upload && pio device monitor
```

## What v0.1 does
1. Connects to Wi-Fi and shows "Ready." on the e-paper screen.
2. Polls `GET /api/device/inbox` every `poll_s` seconds (60 by default).
3. On a new notice: draws the text, buzzes twice, then acks.
4. **Short press (20 ms – 1.5 s) = Copy** → `POST /event {type:copy, notice_id}`, with a short confirming buzz.
5. Every 15 min: BME280 reading → `POST /event {type:sensor}`.

## Modules (target architecture)
`net` (Wi-Fi, TLS, backoff 2→60 s) · `api` (token in encrypted NVS) · `ui` (one notice + status line) · `input` (short=Copy, long 1.5 s=dismiss, 5 s=pair mode) · `sensors` (BME688+BSEC, LSM6DSO, VEML7700) · `haptic` (DRV2605L) · `camera` (off by default, LED hard-wired to sensor power) · `power` (light sleep, GPIO/IMU wake) · `ota` (signed A/B images).

## Open TODOs in code
- Pin the lot-systems.com CA (v0.1 uses `setInsecure()`, **EVT only**).
- Offline queue: up to 50 events in flash, flushed FIFO.
- Light sleep. Target < 3 mA average, about 7 days on 130 mAh (unverified).
- The pin map is a placeholder until the EVT schematic.

## Test plan
Host tests (JSON parse, queue) · simulator parity (`lot-pager-sim.mjs` uses the same contract) · HIL button/screen · 72 h soak · 1 m drop · battery < 45 °C while charging.
