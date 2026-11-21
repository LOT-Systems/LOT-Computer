<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · Firmware

**Document:** LD-01-DOC-04 · Rev A · 2026-11-21
**Source:** `hardware/firmware/lot-ld01/` (PlatformIO, Arduino-ESP32 core 3.x on ESP-IDF 5.x)

## 1. Modules

| Module | File | Job |
|--------|------|-----|
| `app` | `src/main.cpp` | State machine, wake reasons, scheduling |
| `lot_api` | `src/lot_api.cpp` | HTTPS client for `/api/device/v1/*`, device token, ETag |
| `display` | in `main.cpp` (Rev A) | Sharp memory LCD (SPI, VCOM toggle 1 Hz) |
| `sensors` | in `main.cpp` (Rev A) | BME688 sampling + delta/CBOR batch |
| `config` | `include/config.h` | Pins, timings, API base URL |

## 2. State machine

```
         ┌───────────┐  first boot / reset hold 10 s
         │ PROVISION │──► BLE (or SoftAP) Wi-Fi setup → shows 6-char pairing code
         └─────┬─────┘     user types code at lot-systems.com → Settings → Devices
               ▼
         ┌───────────┐  timer (poll_interval) │ button │ IMU tap/lift │ Qi attach
   ┌────►│   SLEEP   │◄──────────────────────────────────────────────────────┐
   │     └─────┬─────┘                                                       │
   │           ▼ wake                                                        │
   │     ┌───────────┐  sample BME688 → append to RTC-RAM batch             │
   │     │   SENSE   │                                                       │
   │     └─────┬─────┘                                                       │
   │           ▼ if poll due OR button OR batch full                         │
   │     ┌───────────┐  Wi-Fi up (≤ 1.5 s, fast reconnect from RTC cache)   │
   │     │   SYNC    │  GET inbox → render → haptic tick                    │
   │     │           │  POST copy / capture / telemetry                     │
   │     └─────┬─────┘  Wi-Fi off                                            │
   └───────────┘                                                             │
```

## 3. Button semantics

| Gesture | Firmware action | API call |
|---------|-----------------|----------|
| Short press (< 600 ms) | Copy the current notification + sensor snapshot | `POST /copy` |
| Long press (≥ 1.5 s) | Take an HM0360 frame (QVGA greyscale, JPEG ~8–15 kB) | `POST /capture` |
| Hold 10 s | Factory reset → PROVISION | — |

When the server confirms, the screen shows `Copied.` for 2 s and then returns to the notification.
With no network, the event goes into a 16-slot RTC-RAM outbox and is retried at the next sync.

## 4. Session compression (requirement 8)

Weather samples are taken every 5 min and uploaded at most every 60 min.

- First sample is stored in full: `t` (int16, 0.01 °C), `rh` (uint16, 0.01 %), `p` (uint32, Pa), `gas` (uint32, Ω), `iaq` (uint16).
- Later samples are stored as **zig-zag varint deltas** from the previous sample.
- The batch is encoded as **CBOR** (`application/cbor`). 12 samples take ~70 bytes instead of ~1.1 kB of JSON (≈ 15× smaller).
- The server decodes the batch, keeps an hourly summary (min/max/mean) for the user's Memory/Weather context, and drops the raw samples after 7 days.

## 5. Power budget (100 mAh cell)

| State | Current | Duty | Avg (µA) |
|-------|---------|------|----------|
| Deep sleep (ESP32-S3 + RTC) | 8 µA | ~99 % | 8 |
| Memory LCD static + VCOM | 4 µA | 100 % | 4 |
| BME688 forced-mode sample (5 min) | 1 mA × 0.2 s | — | 0.7 |
| BHI260AP always-on wake gestures | 30 µA | 100 % | 30 |
| Wi-Fi sync (15 min, ~2 s @ 90 mA) | — | — | 200 |
| Haptic + button events (est.) | — | — | 10 |
| **Total** | | | **≈ 250 µA → ~16 days theoretical, ~7–10 days real** |

The default poll is 15 min. "Pager mode" (2 min poll) cuts real-world life to about 2 days.
Notification latency therefore equals the poll interval in Rev A. Rev B adds a
BLE-relay-from-phone path so notifications can arrive in under 10 s.

## 6. Security

- TLS 1.2 to `lot-systems.com`. The ISRG Root X1 certificate is pinned in flash.
- The device token (256-bit, issued at pairing) is stored in an **NVS encrypted** partition.
  Flash encryption and secure boot v2 are enabled at PVT.
- OTA: `GET /api/device/v1/firmware` returns `{version, url, sha256}`. The device uses A/B
  partitions and rolls back automatically if the new image fails its health check.

## 7. Display rules (LOT style)

- 128 × 128 monochrome. One notification at a time, ≤ 60 chars, wrapped. No emoji. Periods, not symbols.
- Bottom line: `21°  41%  1012` + `HH:MM`. Battery appears only when ≤ 20 % or charging.

## 8. Test IDs

T-01 boot/provision · T-02 inbox render · T-03 copy round-trip < 3 s · T-04 Qi thermal ·
T-05 battery life · T-06 OTA rollback · T-07 BME688 self-heat calibration · T-08 drop 1 m ×6 faces.
