<!--
  LOT SYSTEMS CORPORATION
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT-01 — FIRMWARE DOCUMENT
================================================================================
DOCUMENT    HW-05 / FW
ISSUE       2026.11.12 · REV A
PLATFORM    ESP32-S3 · ESP-IDF v5.x · C
SOURCE      hardware/firmware/lot01/  (skeleton: main/main.c, main/lot01.h)
VERSION     0.1.0 (skeleton; syntax-checked, not yet built with ESP-IDF)
================================================================================
```

## 1 · PRINCIPLE

The device sleeps. It wakes for four reasons, does one short job, and
sleeps again. The memory LCD keeps its image with no power, so the screen
always shows the last message even while the chip is off.

```
            ┌──────────── deep sleep (≈ 15 µA) ◄──────────────┐
            │                                                  │
   timer ───┤ WAKE_POLL : Wi-Fi up → flush queue → GET inbox    │
            │             → show + buzz → ack → telemetry → OTA │
   COPY  ───┤ WAKE_COPY : read sensors → [long press: camera]   │
            │             → POST /copy → "Copied to Log." → poll│
   lift  ───┤ WAKE_LIFT : show clock + weather (no radio)        │
   reset ───┤ WAKE_BOOT : if not paired → BLE provisioning       │
            └──────────────────────────────────────────────────┘
```

## 2 · MODULES

| File (planned)     | Job                                                                 |
|--------------------|---------------------------------------------------------------------|
| `main.c`           | Wake reason → job → sleep. **Written (skeleton).**                   |
| `lot01.h`          | Pins, constants, interfaces. **Written.**                            |
| `lot_hw.c`         | LCD driver (Sharp SPI, 1 bit/pixel, VCOM toggle), button, motor, sensors |
| `lot_api.c`        | HTTPS client for `/api/device/*` (HW-06), Bearer token from NVS       |
| `lot_provision.c`  | BLE provisioning (ESP-IDF `wifi_provisioning`): Wi-Fi + 6-digit code  |
| `lot_queue.c`      | Offline COPY queue in NVS (max 20), flushed on next network wake       |
| `lot_ota.c`        | `esp_https_ota` from a signed manifest, A/B partitions, rollback       |
| `lot_font.c`       | One bitmap font, 2 sizes. LOT style: plain text, no icons             |

Libraries: `espressif/esp32-camera` (GC0308), Bosch **BSEC2** (BME688 IAQ +
AI-Studio gas classes), Bosch **BMI270 SensorAPI** (lift/tap interrupt).

## 3 · SCREEN

128 × 128, black on silver. Three layouts only.

```
 MESSAGE                 STATUS                  CLOCK (on lift)
 ┌──────────────────┐   ┌──────────────────┐    ┌──────────────────┐
 │ Coffee time.     │   │                  │    │      09:41       │
 │                  │   │  Copied to Log.  │    │                  │
 │                  │   │                  │    │  12°C  RH 55%    │
 │ 09:41      87%   │   │                  │    │  Air good.       │
 └──────────────────┘   └──────────────────┘    └──────────────────┘
```

Text rules match the LOT style guide: periods, not symbols. No emoji. The
server already compresses messages to ≤ 64 characters (HW-06 §3); firmware
wraps to 4 lines of 16 characters and never scrolls.

## 4 · BUTTON

| Press          | Action                                                      |
|----------------|-------------------------------------------------------------|
| Short (< 0.8 s)| COPY the message on screen + current readings to the Log tab |
| Long (≥ 0.8 s) | COPY + one camera frame (screen shows "CAM" first)           |
| 10 s hold      | Factory reset → unpair → provisioning                        |

## 5 · BUZZ PATTERNS (pager)

| Pattern | Meaning                    | Shape                |
|---------|----------------------------|----------------------|
| PAGER   | New message                | 120 ms · 80 ms gap · 120 ms |
| TICK    | Copied                     | 40 ms                |
| ERROR   | Failed, saved for retry    | 300 ms               |

## 6 · TIMING AND POWER RULES

- Wi-Fi up budget: 6 s, then give up and sleep (no retry loops).
- TLS session tickets on, so most polls skip the full handshake.
- Poll interval comes from the server (`next_poll_s`), clamped 60–3600 s.
- Telemetry at most every 15 minutes, piggy-backed on a poll.
- Camera powered (PWDN low) only during a long-press COPY.

## 7 · SECURITY

- Device token stored in NVS; **PVT builds enable flash encryption and
  Secure Boot v2** so the token cannot be read off the chip.
- TLS with the server certificate chain pinned to the CA bundle.
- OTA images signed; device refuses unsigned or older versions.
- No open ports. The device only makes outbound HTTPS.

## 8 · BUILD + FLASH

```
cd hardware/firmware/lot01
idf.py set-target esp32s3
idf.py build
idf.py -p /dev/ttyACM0 flash monitor      # via USB D+/D− test pads or dev kit
```

## 9 · P1 TASK LIST (prototype on XIAO ESP32S3 Sense)

1. LCD driver on the Adafruit 1.3" Sharp display; render the three layouts.
2. Button wake from deep sleep (ext1) + long-press detection.
3. Wi-Fi + HTTPS GET `/inbox` against the staging connector or the simulator.
4. COPY → `/copy` → confirm the entry appears in the Log tab.
5. BME688 via BSEC2; BMI270 lift wake.
6. Measure real current per state with a power profiler; update HW-04 §3.
