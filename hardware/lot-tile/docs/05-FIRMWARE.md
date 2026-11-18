# 05 · Firmware

**Target:** ESP32-S3 · **SDK:** ESP-IDF v5.3+ · **Language:** C · **Source:** `hardware/lot-tile/firmware/`
**Status:** reference skeleton (S1). It has not been compiled, because the sandbox has no ESP-IDF; compiling it is the first S2 task.

## 1. Design principles

1. **Asleep by default.** Every wake has a reason (timer, button, gesture or charger) and ends in deep sleep within about 2 s.
2. **The server sets the schedule.** The device does not poll on a fixed timer. Each sync response includes `next_wake_at`, so the site's AI decides when "Coffee time!" arrives and the device wakes just before it.
3. **The screen keeps showing the last message.** A memory LCD keeps its image at about 10 µW, so the last notification stays visible while the chip sleeps, like a pager.
4. **Send little data.** Payloads are CBOR, notifications are capped at 96 UTF-8 bytes, and telemetry is sent as deltas.
5. **Never lose a COPY.** Button events go into an RTC-memory ring buffer (16 entries) first and are only cleared after the server sends an `ack`.

## 2. Modules

| File | Responsibility |
|---|---|
| `main.c` | Boot, finding out why the chip woke, the state machine, deep sleep |
| `lot_api.c/.h` | HTTPS client for `/api/device/v1`, the device token kept in NVS (encrypted), CBOR/JSON |
| `ui.c/.h` | Sharp memory-LCD driver, 1-bit framebuffer (2 KB), LOT bitmap font, screens |
| `sensors.c/.h` | BME688 + BSEC2, LTR-390UV, MAX17048, BHI260AP gesture interrupt |
| `haptic.c` | DRV2605L effect playback (`PAGER_SOFT` = effect 1 + 47) |
| `camera.c` | HM0360 capture → JPEG (esp_jpeg), QR decode for pairing (quirc) |
| `board.h` | Pin map (doc 04 §2) |
| `ota.c` | Signed OTA (A/B partitions, rollback) |

## 3. State machine

```
            ┌──────────┐  first boot / no token
  POWER ──► │ UNPAIRED │──────────────────────────► show 6-digit code + "scan QR"
            └────┬─────┘                            camera reads the QR on lot-systems.com
                 │ token stored in NVS
                 ▼
  wake ─►  ┌──────────┐  timer/charger   ┌──────────┐  200 OK   ┌───────────┐
           │  WAKE    │ ───────────────► │  SYNC    │ ────────► │  SHOW     │─┐
           └────┬─────┘                  └────┬─────┘           │ + buzz    │ │
                │ button                      │ error           └───────────┘ │
                ▼                             ▼                                │
           ┌──────────┐                  ┌──────────┐                          │
           │  INPUT   │──COPY──► queue ─►│ BACKOFF  │ next wake = min(2^n·60s, │
           └──────────┘                  └──────────┘  server hint)            │
                                                                               ▼
                                                             DEEP SLEEP until next_wake_at
```

## 4. Button grammar (one button)

| Gesture | Action | Feedback |
|---|---|---|
| **Short press** | **COPY** the message on screen to the Log tab | Screen shows "⧉ COPIED", short tick |
| Double press | Mark read / dismiss and show the previous message | Screen flips |
| Long press 2 s | **Snap to Log**: one photo, uploaded with the message as context. Only works if the camera is enabled in site settings | LED on, "● SNAP" |
| Press during the first boot screen | Start QR pairing | — |
| Hold 10 s | Factory reset (wipes the token) | Three buzzes |
| Tap the case twice (BHI260AP) | Wake and refresh the weather screen | — |

## 5. Screens (128×128, 1-bit)

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ LOT        ▮▮▯ │  │ LOT        ▮▮▯ │  │ LOT · PAIR     │
│                │  │ 18°  54%  UV2  │  │                │
│  Coffee time!  │  │ AIR  good      │  │   482 913      │
│                │  │ 1013 hPa  ↗    │  │                │
│ 09:41   ⧉ COPY │  │ 09:41          │  │ lot-systems.com│
└────────────────┘  └────────────────┘  └────────────────┘
   NOTIFICATION         WEATHER              PAIRING
```

## 6. Storage

| Partition | Size | Use |
|---|---|---|
| nvs (encrypted) | 24 KB | Device token, Wi-Fi credentials, settings |
| otadata | 8 KB | |
| ota_0 / ota_1 | 1.6 MB each | A/B firmware |
| storage | 640 KB | Font, last 32 notifications, pending events |

## 7. Security

- Flash encryption and Secure Boot v2 are enabled in production (the eFuses are burned at end-of-line).
- The device token is 256 bits, created by the server and stored only in encrypted NVS. The server stores only its SHA-256 hash.
- TLS 1.2+ with the certificate authority bundle pinned to the lot-systems.com chain (ISRG Root X1 plus a backup root).
- OTA images are signed with ECDSA P-256 and checked before switching partitions.

## 8. Wi-Fi provisioning

- First setup uses BLE (ESP-IDF `wifi_provisioning` over BLE, with Espressif's open-source provisioning app), **or** a Wi-Fi QR code scanned by the camera (`WIFI:S:<ssid>;T:WPA;P:<pass>;;`), which lot-systems.com can display.
- Up to 3 networks are stored, for example home, office and phone hotspot.

## 9. Build (for S2)

```bash
. $IDF_PATH/export.sh
cd hardware/lot-tile/firmware
idf.py set-target esp32s3
idf.py menuconfig      # LOT TILE → API host, Calm/Live default
idf.py build flash monitor
```
