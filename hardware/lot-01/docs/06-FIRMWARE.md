---
title: "LOT-01 SQUARE — Firmware Design"
subtitle: "Doc 06 · Firmware v0.x specification · Rev A (2026-11-24)"
---

# LOT-01 — Firmware Design

## 1. Platform

* **ESP-IDF v5.x** (C, FreeRTOS), single image, two OTA slots + factory slot.
* Security: **Secure Boot v2** (RSA-3072), **flash encryption** (release mode), NVS encryption. The device token never leaves encrypted NVS.
* Components: `esp32-camera` (fork with GC032A), Bosch **BSEC2** (BME688), ST **LSM6DSV16X** driver + MLC `.ucf` config, `esp_https_ota`, `network_provisioning` (BLE), `esp_http_client` + `esp_crt_bundle`, `cJSON`.

## 2. Partition table (4 MB)

| Name | Type | Size |
|---|---|---|
| nvs (encrypted) | data | 24 KB |
| otadata | data | 8 KB |
| phy_init | data | 4 KB |
| factory | app | 1.2 MB |
| ota_0 | app | 1.2 MB |
| ota_1 | app | 1.2 MB |
| outbox | data (littlefs) | 320 KB, offline Copy queue with up to ~20 photos |

## 3. Module map

```
main/
  app_main.c        boot, wake-cause dispatch, state machine
  power.c           BQ25120A, battery %, charge state, sleep entry
  ulp/vcom.c        ULP-RISC-V: toggle LCD EXTCOMIN at 1 Hz in deep sleep
  display.c         Sharp memory LCD driver (SPI, line-addressed updates)
  ui.c              1-bit layouts: NOTE, IDLE, COPIED, PHOTO, CHARGING, PAIR
  fonts/            LOT bitmap font 8/12/16 px (Arial-like grotesk, 1-bit)
  net.c             Wi-Fi STA, fast reconnect (stored BSSID/channel), PS mode
  provision.c       BLE provisioning: Wi-Fi creds + 6-digit LOT pairing code
  lot_client.c      LOT API Connector client (doc 07): claim/inbox/copy/telemetry
  outbox.c          persistent queue of Copy events while offline
  sensors.c         BME688 via BSEC2 (ULP mode), LSM6DSV16X MLC events
  camera.c          power-gated capture, QVGA JPEG q=12 (~12–20 KB)
  button.c          debounce, short / long / double press classification
  haptic.c          buzz patterns
  ota.c             signed HTTPS OTA, rollback on failed self-test
```

## 4. State machine

```
            ┌──────────── timer (next_poll_s) ─────────────┐
            │                                              ▼
 DEEP_SLEEP ├─ button (ext1) ──► BUTTON ──► COPY/PHOTO ──► SYNC ──► RENDER ──► DEEP_SLEEP
     ▲      ├─ IMU INT1 (pick-up) ─────────────────────────► SYNC
     │      └─ charger status ──► CHARGING (screen: %, ring)
     └──────────────────────────────────────────────────────────────┘
SYNC = wifi_up → POST outbox → GET inbox (If-None-Match) → POST telemetry (1×/h) → wifi_down
```

Rules:

* A Copy always goes into the **outbox first**, then sync, so a button press is never lost.
* The screen is redrawn only when content changes. The memory LCD keeps the image at ~0 power.
* `next_poll_s` from the server overrides the local default (600 s), clamped to 120–1800 s.
* Quiet hours (from server): no buzz, notes still delivered.

## 5. Button semantics (brief item 16)

| Gesture | Timing | Event sent | Log entry on lot-systems.com |
|---|---|---|---|
| Short | < 600 ms | `copy` | `device_copy` with note text, `messageId`, BME688 data, battery |
| Long | ≥ 1000 ms | `copy` + `image/jpeg` | `device_copy` + photo attachment (`metadata.photo`) |
| Double | 2 × < 300 ms within 500 ms | none (local dismiss) | — |
| Hold 10 s | — | hard reset (PMIC MR) | — |
| Hold 5 s on boot | — | enter PAIR mode (BLE advertising "LOT-01-XXXX") | — |

## 6. Display layouts (128 × 128, 1-bit)

```
NOTE                      IDLE                      COPIED
┌────────────────┐        ┌────────────────┐        ┌────────────────┐
│ LOT        09:41│        │                │        │                │
│                 │        │     09:41      │        │                │
│  Coffee time!   │        │   MON 24 NOV   │        │    COPIED ✓    │
│                 │        │                │        │   → LOG        │
│  ─────────────  │        │  21° · 48% RH  │        │                │
│  COPY → LOG     │        │  CALM          │        │                │
└────────────────┘        └────────────────┘        └────────────────┘
```

Notes are at most **42 characters** (2 lines × 21 at the 12 px font). The server guarantees the limit, and the device truncates with "…" as a safety net.

## 7. Wire format (device side)

Requests are JSON with short keys, gzip when > 256 B, and a hard cap of 512 B without a photo.
Photo uploads go as `multipart/form-data` (≤ 40 KB).

```json
// POST /api/public/device/copy
{"m":"msg_8f2c","t":"Coffee time!","ts":1795507260,
 "s":{"tc":21.4,"rh":48.1,"hp":1012.6,"iaq":42,"gas":"clean"},
 "b":81,"fw":"0.3.0"}
```

## 8. Factory flow

1. Pogo jig: flash the factory image + per-device eFuse key, burn secure-boot digest.
2. Self-test: LCD checker pattern, camera frame, BME688/IMU ID, buzz, button, Wi-Fi scan RSSI, charge detect.
3. Print the serial + QR (device ID) for the box. The QR opens `lot-systems.com/devices/pair?d=<id>`.

## 9. Versioning

`MAJOR.MINOR.PATCH`. The server stores the last-seen `fw`. OTA rolls out in staged
percentages (10 → 50 → 100 %) with automatic rollback when the post-update
self-test fails.
