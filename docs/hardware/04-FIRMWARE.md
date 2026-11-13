<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager — Firmware Specification

**Document:** LOT-HW-01 / FW · **Rev:** A (2026-11-13) · **Target:** ESP32-S3, ESP-IDF v5.x (C)

## 1. Stack

| Layer | Choice |
|-------|--------|
| SDK / RTOS | ESP-IDF v5.x + FreeRTOS |
| Network | esp_wifi (station), esp_http_client + mbedTLS, TLS session resumption |
| Setup | NimBLE (BLE provisioning, `wifi_provisioning` component) |
| Display | Custom driver for Sharp memory LCD (SPI, 1-bit framebuffer 2 KB) + small bitmap font |
| Camera | esp32-camera style DVP driver, HM0360 register set; JPEG via software encoder |
| Sensors | Bosch BSEC2 library (BME688), BHI260AP firmware blob + host driver |
| Haptics | DRV2605L over I²C, built-in effect library |
| Identity | ATECC608B via esp-cryptoauthlib |
| Payloads | CBOR (tinycbor) + **heatshrink** compression |
| Updates | esp_https_ota, A/B partitions, signed images |

Repo layout (to be created in session 2 as `hardware/firmware/`):

```
firmware/
  main/            app_main, state machine
  components/
    lot_api/       HTTPS client for /api/device/*  (doc 05)
    lot_ui/        memory-LCD driver, fonts, screens
    lot_sensors/   BME688 (BSEC2), BHI260AP, VEML6030, MAX17048
    lot_cam/       HM0360 capture + JPEG
    lot_haptic/    DRV2605L patterns
    lot_store/     NVS, outbox queue, compression
  partitions.csv   nvs | otadata | ota_0 | ota_1 | storage
```

## 2. State machine

```
 BOOT ─▶ UNPAIRED ─(BLE setup ok)─▶ IDLE_SLEEP ◀───────────────┐
                                      │  wake: timer | button | motion | Qi
                                      ▼                          │
                                    SYNC ── poll inbox, flush outbox, OTA check
                                      │                          │
                         new notice?  ├─yes─▶ ALERT (buzz + show) ┤
                                      └─no──────────────────────▶ ┘
 Button (any state): COPY → enqueue copy event → SYNC (immediate)
```

## 3. Events from the button

| Gesture | Firmware action | Payload sent |
|---------|-----------------|--------------|
| Short press | `copy` | notice id + text, weather snapshot, battery |
| Long press 1.5 s | `copy` + photo | as above + JPEG (QVGA, ~15 KB) |
| Double press | local only | shows BME688 reading |

Debounce 30 ms on the snap dome; the button GPIO is an EXT1 deep-sleep wake source.

## 4. Session compression ("compress the information in each session")

A **device session** = one wake → sync → sleep cycle. Everything that happened since the
last sync (button events, sensor samples, battery, errors) goes into one outbox record:

1. Encode as CBOR with short integer keys (no JSON field names on the wire).
2. Sensor series are delta-encoded (temperature in 0.01 °C steps, etc.).
3. Compress with heatshrink (window 8, lookahead 4: ~1 KB RAM).
4. POST once as `application/cbor` with `Content-Encoding: x-heatshrink`.

Typical session: 5 min of BME688 samples + 1 copy event ≈ 420 B JSON → ~110 B on the wire.
Fewer bytes = shorter radio-on time = longer battery life. The server decodes and expands to
normal Log rows (doc 05).

## 5. Power budget (80 mAh EVT cell)

| Consumer | Assumption | mAh/day |
|----------|------------|--------:|
| Sleep floor (ESP32-S3 deep sleep + BHI260AP + LCD static) | ~35 µA | 0.84 |
| Inbox polls | every 10 min 07:00–23:00 (96/day), 0.8 s @ 90 mA with fast reconnect | 1.92 |
| BME688 | ULP mode, every 5 min | 0.10 |
| Button / alerts / camera | 10 copies, 10 buzzes, 2 photos | 0.40 |
| **Total** | | **≈ 3.3** |

→ **~24 days** on 80 mAh (EVT), **~13 days** on 45 mAh (5 mm DVT). Spec: ≥ 7 days.
Quiet hours come from the user's timezone on lot-systems.com.

## 6. Security

- Secure Boot v2 + flash encryption enabled in production builds.
- Device private key generated inside ATECC608B at factory; never leaves the chip.
- Device token (from pairing, doc 05) stored in encrypted NVS; requests signed with the ATECC key (header `X-LOT-Device-Sig`).
- TLS: pin the lot-systems.com CA chain (ISRG Root X1/X2) with a fallback bundle; OTA images signed (ECDSA P-256).

## 7. Screen UI

- 128 × 128 1-bit. Fonts: one 16 px bitmap font for notices (wraps to 6 lines × 14 chars), one 8 px for status.
- Status row: time · Wi-Fi · battery.
- Screens: `NOTICE`, `COPIED ✓`, `WEATHER`, `CHARGING nn%`, `PAIR CODE: XXXX-XXXX`, `OFFLINE (n queued)`.
- Text only, no images — matches the pager concept.

## 8. Factory / test firmware

A separate `factory` build (doc 08) runs self-test: I²C scan, LCD pattern, camera frame,
BME688 read, haptic pulse, Qi detect, battery gauge, Wi-Fi RSSI, ATECC key gen, then prints a
JSON line over the pogo UART for the test jig.
