# 06 · Firmware

*Session 01 · 2026-11-19 · Code: `hardware/firmware/` (PlatformIO, Arduino-on-ESP-IDF). Status: **skeleton, not compiled yet**. It compiles in P1 on the DevKit.*

## 1. Files

| File | Role |
|---|---|
| `platformio.ini` | Target `l01-devkit` (ESP32-S3-DevKitC-1 N8R8), libraries |
| `include/config.h` | Pin map (matches doc 05 §2), timings, limits |
| `src/main.cpp` | The wake → fetch → show → sleep cycle, the Copy button, offline queue, reset |
| `src/lot_client.{h,cpp}` | LOT device API client (doc 07): claim, inbox, copy, telemetry, unpair |

## 2. State machine

```
           ┌──────────── deep sleep (≈15 µA, LCD holds image) ◄────────────┐
           │ timer (pollSeconds) / Copy button / IMU pick-up                │
           ▼                                                                │
       [boot] ── button held 8 s ──► unpair + factory reset                 │
           │                                                                │
       paired? ── no ──► show "Pair me on lot-systems.com." ── sleep 1 h ───┤
           │ yes                                                            │
       Wi-Fi up (≤ 6 s)                                                     │
           │── woke by button ──► buzz · "Copied." · POST /copy (or queue)  │
           │── flush offline Copy queue                                     │
           │── GET /inbox?since=cursor ──► new? buzz + store text           │
           │── read sensors ──► POST /telemetry                             │
           └── draw screen · Wi-Fi off ─────────────────────────────────────┘
```

## 3. Button

| Press | Action |
|---|---|
| Short (< 2 s) | **Copy**: send the text on screen to the Log tab |
| Long (2 s) | Reserved for camera capture. Off in v1 (decision D-04) |
| Hold at boot (8 s) | Unpair (DELETE /token), clear NVS, restart |

## 4. Screen (LOT style)

From the repo style guide: plain text, no icons, no emoji, periods instead of symbols ("Copied." not "✓").
- Lines 1–5: the message (≤ 80 chars, word-wrapped).
- Bottom line: `09:41 · 12°C · IAQ 41` or `Offline.`
- The memory LCD needs the EXTCOMIN toggle at about 1 Hz while powered. On the PCB, drive it from the ESP32 ULP or a tiny RTC-domain PWM so the main core can sleep.

## 5. Sensors

- **BME688 via Bosch BSEC2**: IAQ, eCO₂, bVOC, and an optional **AI Studio gas class** (e.g. `coffee`, `normal`, `stale`) trained by LOT and flashed as a BSEC config blob.
- **Self-heating correction**: `T_ambient = T_sensor − k·(duty) − offset`, with k fitted during the EVT thermal test against the SHT45 and a reference thermometer.
- **BMI270**: any-motion/pick-up interrupt on INT1 wakes the device and refreshes the inbox right away.
- **MAX17048**: battery %. Sent in telemetry and shown on the site's device page.
- **HM0360**: powered off by a load switch unless used. Turning it on always turns on LED1 (wired in hardware), so the camera can't run in secret.

## 6. Security

- Device token kept in NVS with **flash encryption + secure boot v2** turned on at PVT. Keys are burned per unit at the test jig.
- TLS with a pinned root CA (ISRG Root X1). `setInsecure()` is allowed only in the breadboard build. It's flagged `TODO(P1)` in `lot_client.cpp`.
- OTA updates: `esp_https_ota` from `GET /api/device/v1/firmware` (added in P2) with a signed image and rollback.

## 7. Session compression on the device

See doc 11. In short: while the device is offline, readings are averaged into 15-minute buckets in RTC memory (up to 96 buckets = 24 h) and sent as one batch. Copy presses queue in NVS (max 20).

## 8. Build (P1)

```bash
pip install platformio
cd hardware/firmware && pio run -e l01-devkit -t upload && pio device monitor
```
