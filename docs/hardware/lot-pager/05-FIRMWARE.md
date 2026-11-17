---
title: "LOT PAGER — 05 · Firmware Document"
subtitle: "Hardware programme HW-01 · firmware v0.1.0 · 2026-11-17"
---

# LOT PAGER — 05 · FIRMWARE

```
DOCUMENT   HW-01 / 05-FW
SOURCE     firmware/lot-pager/  (PlatformIO, Arduino-ESP32 on espressif32@6.9.0)
VERSION    0.1.0
BUILD      pio run -e lot-pager-devkit   (P0 breadboard)
           pio run -e lot-pager-reva     (custom PCB)
STATUS     Written + reviewed; NOT YET COMPILED (S1 sandbox blocked the PlatformIO registry)
```

## 1 · Files

| File | Purpose |
|------|---------|
| `platformio.ini` | Pinned platform + libraries, two build environments |
| `include/config.h` | API base, root CA, **pin map** (single source of truth with the PCB), I²C addresses, timings |
| `src/main.cpp` | Wake → session → sleep state machine, display, sensors, API, provisioning |
| `tools/lot-pager-cli.mjs` | Host software: pair, provision, notify, simulate |

## 2 · Session model — "one wake, one call"

```
           ┌──────────── deep sleep (≈15 µA, LCD holds image) ────────────┐
           │                                                               │
  timer ───┤                                                     button ───┤
           ▼                                                               ▼
   read BME688 + battery (before radio heats the board)         short: COPY → POST /copy
   Wi-Fi up (≤ 8 s)                                              long : camera (S2)
   every 4th wake: POST /telemetry                               show COPIED / ERR
   GET /frame?fw=&bat=  → {i,m,s,ts,n,q}                                   │
   draw message, store id+text in RTC RAM                                  │
   sleep n seconds (server decides, 60…3600) ◄─────────────────────────────┘
```

**Session compression:** the device never downloads history. Each wake moves one
81-byte JSON frame; message text is already compressed server-side to ≤ 52 ASCII
characters (2 lines × 26 at 6×8 px). The last message lives in RTC RAM (64 B),
so COPY works without another fetch.

## 3 · Display

- Sharp LS011B7DH03, 160 × 68, SPI, `Adafruit_SharpMem`.
- Header row: `LOT` + status (`NEW`, `+2` queued, `COPIED`, `OFF`, `PAIR`).
- Messages ≤ 13 characters render at 2× size (e.g. **Coffee time!**).
- VCOM: RV-3028 CLKOUT programmed to 1 Hz at cold boot → EXTCOMIN. No MCU wake needed.
- `DISP` pin held high through deep sleep with `gpio_hold_en`.

## 4 · Provisioning protocol (USB-CDC, 115200, line based)

| Command | Effect | Reply |
|---------|--------|-------|
| `WIFI <ssid> <password>` | Stores Wi-Fi in NVS (`lot` namespace) | `OK WIFI` |
| `TOKEN lotd.…` | Stores device token | `OK TOKEN` |
| `INFO` | Firmware, wake count, SSID, token present | text |
| `WIPE` | Factory reset NVS | `OK WIPE` |
| `SLEEP` | Leave the provisioning window | — |

The window is open for 3 s after a cold boot and extends while the host is talking.
`tools/lot-pager-cli.mjs provision` drives it.

## 5 · Security

- TLS only. Firmware **refuses** API calls while `LOT_ROOT_CA` is empty — never `setInsecure()`.
  Fill it from the live chain before production: `openssl s_client -connect lot-systems.com:443 -showcerts`.
- Token stored in NVS. Production (DVT+): enable **flash encryption + secure boot v2** and NVS encryption.
- Revoking on the site (`DELETE /api/devices/:id`) makes the device show `PAIR` on its next wake.

## 6 · Error states on screen

| Screen | Meaning | Action |
|--------|---------|--------|
| `Set up Wi-Fi` · SETUP | No credentials | Provision |
| last message · OFF | Wi-Fi or server unreachable | Auto-retry next wake |
| last message · PAIR | HTTP 401 — token revoked/invalid | Pair again |
| `Nothing to copy` | COPY pressed with no message | — |

## 7 · Build, flash, monitor

```bash
cd firmware/lot-pager
pio run -e lot-pager-devkit -t upload      # devkit over USB
pio run -e lot-pager-reva   -t upload      # custom PCB via Tag-Connect TC2030 (USB pads)
pio device monitor
node tools/lot-pager-cli.mjs provision --port /dev/ttyACM0 --ssid HOME --pass **** --token lotd.…
```

## 8 · Roadmap (firmware)

| Version | Adds |
|---------|------|
| 0.1.0 (S1) | Session loop, frame poll, COPY → Log, telemetry, provisioning |
| 0.2.0 (S2) | Camera QVGA JPEG on long-press → `/photo`; BSEC2 IAQ; BMI270 flip-to-silence |
| 0.3.0 | OTA (signed images, A/B partitions); BLE provisioning from the LOT site |
| 1.0.0 (PVT) | Secure boot + flash encryption, factory test mode for the jig |
