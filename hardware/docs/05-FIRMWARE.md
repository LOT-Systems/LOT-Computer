# 05 · FIRMWARE

```
DOCUMENT  HW-05-FW        ISSUE 2026.11.25      CLASS INTERNAL / BUILD
FIRMWARE  v0.1.0 skeleton · hardware/firmware/ · NOT YET COMPILED OR RUN ON HARDWARE
```

## 01 · Platform

| Item       | Choice                                                    |
|------------|-----------------------------------------------------------|
| SoC        | ESP32-S3 (dual-core LX7, 240 MHz, vector instructions for ESP-DL) |
| Framework  | Arduino-ESP32 on PlatformIO for v0.x; move to ESP-IDF 5.x at DVT for finer power control |
| Libraries  | ArduinoJson 7, Adafruit SHARP Memory, Adafruit GFX, Bosch BSEC2 (production IAQ), esp32-camera / Himax driver, ESP-DL |
| Storage    | NVS: Wi-Fi credentials, device token, copy queue. RTC RAM: inbox ring, cursor, counters |
| Bench target | Seeed XIAO ESP32-S3 (`env:xiao_bench`)                  |

## 02 · State machine

```
            cold boot
               │
               ▼
        ┌─ token? ──no──► PAIR (BLE / NFC provisioning, §06) ─┐
        │ yes                                                  │
        ▼                                                      │
      WAKE ◄──────────────── deep sleep ◄──────────────────────┘
        │  cause = timer ──► due for sync? ──yes──► SYNC (Wi-Fi ≤ 3 s, 1 GET + 1 POST)
        │  cause = button ─► gesture: SHORT=Copy · DOUBLE=next · LONG=photo · 10 s=re-pair
        │  cause = IMU ────► refresh time / weather line
        ▼
      SELECT DUE NOTE (fireAt ≤ now, ttl alive) ──► SHOW (memory LCD holds image at ~µW)
        │
        ▼
      SLEEP until min(next fireAt, next sync)
```

The key idea: **the site sends tomorrow's "Coffee time." today.** Each note can
carry `fireAt`. The TILE stores up to 8 notes in RTC RAM and wakes on the RTC
timer at the right second to show each one, without turning the radio on.

## 03 · Source map

| File                | Responsibility                                              |
|---------------------|-------------------------------------------------------------|
| `platformio.ini`    | Build environments and pinned library versions             |
| `src/config.h`      | Version, API base URL, timing, pin map (bench vs product)  |
| `src/lot_api.h`     | LOT Device API client: `inbox`, `copy`, `telemetry` (same wire format as `connector/lot-device.mjs`) |
| `src/main.cpp`      | Wake handling, gestures, scheduler, display, sleep         |

To be added at EVT-1: `camera.cpp` (HM01B0 capture → PGM/JPEG ≤ 30 KB →
`/api/device/photo`), `provision.cpp` (BLE GATT + NFC NDEF pairing),
`gauge.cpp` (MAX17048), `ota.cpp` (signed OTA), `bsec.cpp` (Bosch BSEC2 IAQ
state saved to NVS every 6 h).

## 04 · Display rules

- 128 × 128, 1-bit. Message in the 2× font (≈ 10 characters × 4 lines), meta
  line in the 1× font: `HH:MM  21C  44%`.
- No icons, no emoji. Sentences end with a period. The site enforces this
  before sending (doc 06 §05). The firmware renders what it receives.
- Feedback words: `Copied.` · `Not copied.` · `Offline.` · `Pair.` · `Photo.`
- VCOM: the Sharp LCD needs its polarity toggled at about 1 Hz. During deep
  sleep use the EXTCOMIN pin driven by the ULP co-processor, or accept
  software VCOM on each wake (a DC bias over long sleeps shortens panel life).
  Decide at EVT-1 (open item F-3).

## 05 · Power behaviour

| Rule                                         | Why                                       |
|----------------------------------------------|-------------------------------------------|
| Wi-Fi only inside SYNC or COPY, hard off after | The radio is 95 % of the energy budget   |
| 3 s connect budget, then give up             | A weak network must not drain the cell    |
| Sync interval comes from the server (`s`)    | The site can slow a TILE down at night    |
| No sync while charging and above 95 %        | Avoid heat in a sealed steel case         |
| BME688 in forced mode once per wake          | Heater is ~12 mA; BSEC2 ULP mode = 1 reading / 5 min |
| Camera rail hard-off except during capture   | HM01B0 leakage is small but nonzero       |

Budget: ≈ 6.2 mAh/day → ≈ 15 days on a 95 mAh usable cell (doc 04 §03).

## 06 · Pairing (provisioning)

1. On lot-systems.com: **Settings → Devices → Add TILE** shows a 6-digit code
   (valid 10 min).
2. Hold Copy for 10 s. The TILE shows `Pair.` and opens BLE provisioning
   (ESP-IDF `wifi_provisioning` over BLE, security 1 with proof-of-possession =
   code printed on the box).
3. The phone browser (Web Bluetooth) or the LOT PWA sends Wi-Fi SSID and
   password plus the 6-digit code.
4. The TILE calls `POST /api/device/pair`, stores the `lotdev_` token in
   encrypted NVS, and shows `Paired.`

The NFC-WLC coil also works as an NFC tag (PTX30W supports data), so a later
version can pair with a phone tap instead of BLE.

## 07 · Security

- TLS to lot-systems.com with the root CA pinned in firmware. The bench build
  uses `setInsecure()` and **must not ship**. This is flagged in code.
- Device token is per-device, revocable from Settings, stored hashed on the
  server, and kept in NVS with flash encryption on in production.
- Secure Boot v2 + flash encryption enabled at PVT, one key per batch kept
  offline.
- OTA images signed and verified before switching partition.

## 08 · On-device AI (requirement 15)

| Sensor       | AI function                                          | Runs where          |
|--------------|------------------------------------------------------|---------------------|
| BME688       | BSEC2 IAQ / CO₂-equivalent + custom gas classes trained in Bosch BME AI-Studio (e.g. "coffee brewing", "fresh air") | ESP32-S3 (BSEC2 lib) |
| LSM6DSV16X   | Machine Learning Core decision tree: pick-up, flip-to-mirror, tap | Inside the IMU, MCU sleeps |
| HM01B0       | Person / presence detection (ESP-DL or TFLite-Micro) to decide whether a photo is worth sending | ESP32-S3, on capture only |

A BME688 "coffee brewing" class makes a loop with the site: the TILE smells
coffee and reports it, the site can then decide not to send "Coffee time."

## 09 · Build and flash (bench)

```
cd hardware/firmware
pio run -e xiao_bench
pio run -e xiao_bench -t upload
pio device monitor
```

Before flashing, write Wi-Fi credentials and a token into NVS. Until the
provisioning module exists, temporarily add the three `prefs.putString`
calls in `setup()`.

## 10 · Open firmware items

| ID  | Item                                                       | Gate   |
|-----|------------------------------------------------------------|--------|
| F-1 | Compile and run on the XIAO bench kit                      | EVT-0  |
| F-2 | Offline Copy queue in NVS, flushed on next sync            | EVT-0  |
| F-3 | VCOM strategy in deep sleep                                | EVT-1  |
| F-4 | HM01B0 driver + photo upload                               | EVT-1  |
| F-5 | BLE provisioning + pairing                                 | EVT-1  |
| F-6 | IMU MLC config (pick-up / flip) and ext1 wake mask         | EVT-1  |
| F-7 | CA pinning, Secure Boot, flash encryption, signed OTA      | DVT    |
| F-8 | Factory test mode (doc 09 §03)                             | DVT    |
