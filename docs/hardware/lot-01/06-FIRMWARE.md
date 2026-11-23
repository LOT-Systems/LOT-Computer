# LOT·01 — Firmware Document

**Target:** ESP32-S3FH4R2 · **Framework:** Arduino-ESP32 3.x on PlatformIO (ESP-IDF 5.x underneath) · **Source:** `firmware/`

## 1. Modules
| File | Role |
|---|---|
| `src/main.cpp` | Boot, wake-cause dispatch, state machine |
| `src/config.h` | Pins, intervals, API host, limits |
| `src/lot_api.{h,cpp}` | HTTPS client for `/device-api/v1` (pair, inbox, ack, copy, telemetry) |
| `src/hw.{h,cpp}` | Sharp memory LCD, BME688 (BSEC2), MAX17048, haptic, charger status |

## 2. State machine
```
           ┌──────────── no token ────────────┐
 BOOT ─────┤                                  ▼
           │                               PAIRING ── shows user_code, polls /pair/poll
           └── token ──► WAKE_DISPATCH          │ ok → store token in NVS
                             │                  ▼
        timer ───────────────┼─► POLL ─ new item? ─► NOTIFY (buzz ×2, draw text) ─► ACK
        Copy key ────────────┼─► COPY  (POST /copy with shown item + env) ─► "✓ Logged"
        Copy long-press 1.5 s┼─► CAPTURE (Phase 2: photo → /copy multipart)
        IMU double-tap ──────┼─► REDRAW (show last message + battery + weather)
        Qi present ──────────┴─► CHARGING (show %, poll every 5 min)
                             ▼
                       DEEP_SLEEP (timer = next_poll_s, ext1 = KEY | IMU_INT1)
```

## 3. Power rules
- Wi-Fi up only inside POLL/COPY/TELEMETRY. Target < 1.2 s on-air per poll (static IP cache, TLS session resume).
- LCD keeps its image with no CPU. EXTCOMIN 1 Hz comes from LEDC, which stays on in light sleep. In deep sleep, use the LCD's serial VCOM mode and wake every 30 s, or a tiny RTC-driven toggle. **Validate at P1.**
- Camera and BME688 heater are behind load switches; both are off in sleep.
- Battery < 10 %: polling drops to hourly and the screen shows "Charge me ◐". Battery < 3 %: hard sleep until Qi is present.

## 4. Storage (NVS)
`token`, `device_id`, `wifi_ssid/pass` (provisioned via BLE in P1 → SoftAP fallback), `last_item_id`, `last_text`, `fw_channel`.

## 5. Wi-Fi provisioning
First boot: BLE provisioning with Espressif's `wifi_prov_mgr` (phone app or LOT web-bluetooth page). If BLE isn't available, the device starts a SoftAP `LOT-01-XXXX` with a captive page.

## 6. OTA
`/telemetry` may return `{ota:{url, sha256, ver}}`. Flash it only on Qi power. Uses an A/B partition scheme with rollback if the new image doesn't reach `POLL OK` within 2 boots. Images are signed (Secure Boot v2 in PVT) and flash encryption is on.

## 7. Factory flashing & test
1. Pogo fixture hits the USB D+/D− and EN/BOOT pads.
2. `esptool.py --chip esp32s3 write_flash 0x0 factory.bin`.
3. Self-test firmware checks the LCD pattern, I²C IDs (BME688 0x76/0x77, LSM6DSOX 0x6A, MAX17048 0x36), camera ID, haptic, key, Wi-Fi scan RSSI, and Qi charge current. It prints a JSON line that the fixture logs against the serial number.
4. Production firmware is flashed and the serial is written to eFuse/NVS.

## 8. Build
```
cd docs/hardware/lot-01/firmware
pio run -e lot01            # build
pio run -e lot01 -t upload  # flash devkit (P1: ESP32-S3-DevKitC-1)
pio device monitor
```
For P1, set `LOT_API_BASE` in `config.h` to the simulator (`node ../connector/lot-device-sim.mjs --serve`) or to staging.


## Native test (S02): firmware client ↔ real server, no ESP32 toolchain needed
`firmware/test/native/` compiles the **unmodified** `src/lot_api.cpp` on Linux with g++ and the real ArduinoJson 7.2.1. It uses small shims (`Arduino.h` String/Stream, `HTTPClient` backed by curl, `WiFi`), then runs the full protocol against `connector/device-api.itest.mjs --serve`: pair → claim → token → empty inbox → "Coffee time!" → ack → since-cursor → Copy → Log row → telemetry → bad-token rejection. **Result: 12/12 pass.** The production TLS path (`setCACert`) also compiles.

Not yet covered: `main.cpp` and `hw.cpp`, which need the ESP32 core plus the BSEC2, SharpMem and MAX1704x libraries. Those need `pio run -e lot01-p1` on a machine that can reach `dl.platformio.org`. This session's network blocked it.

**TLS roots (S02):** `lot_api.cpp` now embeds ISRG Root X1 + X2 (Let's Encrypt) in place of the placeholder. Verify the live chain of lot-systems.com before PVT. If the edge uses Google Trust Services, add GTS Root R1/R4.
