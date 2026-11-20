# LOT-DEVICE-01 · Firmware

**Doc:** LOT-HW-FW · Rev A · 2026-11-20
**Code:** `hardware/lot-device-01/firmware/` (PlatformIO, Arduino-ESP32)
**Status:** v0.1.0 skeleton. **Not compiled yet.** The PlatformIO registry (`*.platformio.org`) is blocked in the routine's network sandbox. To build locally: `cd hardware/lot-device-01/firmware && pio run -e devkit -t upload`.

## 1. Targets

| Env | Hardware | Purpose |
|---|---|---|
| `devkit` | Seeed XIAO ESP32S3 Sense + Sharp Memory LCD breakout + BME688 breakout | Stage A loop proof |
| `evt` | Custom PCB, ESP32-S3FH4R2 (pin map `include/board_evt.h`, placeholder) | EVT boards from PCBWay |

## 2. Libraries

ArduinoJson 7 · Adafruit SHARP Memory Display + GFX · Adafruit BME680 (BME688-compatible basic mode; Bosch **BSEC2** for IAQ/AI gas classes in S3) · NimBLE-Arduino (provisioning) · esp32-camera (phase 2).

## 3. State machine (one wake)

```
            ┌──────────── deep sleep (~30 µA total) ─────────────┐
            │ wake: timer (w s) │ Copy button (EXT0) │ IMU (EXT1) │
            └───────────────┬─────────────────────────────────────┘
                            ▼
   no creds? ──yes──► show "LOT. Pair at lot-systems.com" → BLE provisioning
                            │ no
                            ▼
        read BME688 (cold board) ─► Wi-Fi fast-connect (cached BSSID/channel)
                            ▼
   first boot? → POST /hello  (show "Ready.")
   short press? → POST /copy {i,t}   (show "Copied.", short buzz)
   long press?  → [phase 2] camera capture → POST /copy {img}
                            ▼
        GET /inbox → new? show text + buzz → POST /ack
                            ▼
        POST /telemetry {t,h,p,g,b} → Wi-Fi OFF → deep sleep(w)
```

The Memory LCD holds the last image with no refresh. On EVT, the LCD's EXTCOMIN 1 Hz VCOM toggle is driven by the LEDC/ULP during sleep.

## 4. Provisioning (S2)

1. A signed-in user opens lot-systems.com → Settings → Device → **Pair**. The site calls `POST /api/device/pair` and receives the token.
2. The browser connects over **Web Bluetooth** to GATT service `LOT-PROV`. It writes `ssid`, `pass` and `token` (characteristics are write-only and need encrypted pairing).
3. The device stores them in NVS (namespace `lot`, flash encryption on in production), reboots and calls `/hello`.

## 5. Power budget (80 mAh cell, 15 min poll)

| Item | Current × time | mAh/day |
|---|---|---|
| Deep sleep: ESP32-S3 RTC 8 µA + BMI270 low-power ~15 µA + LCD ~3 µA + gauge 3 µA | ≈ 30 µA × 24 h | 0.72 |
| Wake: Wi-Fi fast-connect + TLS resume + 3 calls ≈ 2.5 s @ ~110 mA avg | 0.076 mAh × 96 | 7.3 |
| BME688 forced read with gas heater | ~0.003 × 96 | 0.3 |
| Buzz 5×/day | ~0.03 | 0.03 |
| **Total** | | **≈ 8.4 mAh/day → ~9 days** |

At a 30 min poll: **~16 days**. The server controls `w`, so the interval can be tuned per user (e.g. 60 min at night).

## 6. Security

- Device token in NVS with flash encryption and Secure Boot v2 enabled for PVT.
- TLS: pin ISRG Root X1. The skeleton still uses `setInsecure()` and is marked **TODO S2, must fix before any field unit**.
- Token revocable from the site. The server stores only the hash.

## 7. OTA (S4)

`GET /api/device/v1/fw` → `{ v, url, sha256 }`. Dual-partition OTA with rollback. Run only while on the charger.

## 8. Test plan (EVT)

| Test | Pass |
|---|---|
| Pair → hello → "Ready." | < 60 s end to end |
| Site notify → screen | ≤ 1 poll interval |
| Copy → Log tab shows `DEVICE [COPY]:` | 100 / 100 presses |
| Battery life at 15 min poll | ≥ 7 days |
| Wi-Fi RSSI with steel body | ≥ −75 dBm at 5 m from AP |
| Qi charge face-down, 0 → 100 % | ≤ 2 h, case ≤ 40 °C |
