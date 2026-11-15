# LOT SQ-1 — Firmware Architecture

**Document:** LOT-SQ1-05 · **Version:** 0.1 · **Date:** 2026-11-15
**Source:** `hardware/LOT-SQ1/firmware/` (PlatformIO, Arduino-ESP32 core 3.x)

## 1. Design rules

1. **Asleep by default.** The MCU is in deep sleep more than 99.9% of the time. It wakes only on: RTC timer (`next_sync_s`), COPY button (EXT0), or IMU interrupt (EXT1).
2. **One sync per wake.** Each wake does at most one HTTPS round trip: telemetry goes up, and one notification comes down.
3. **E-paper holds the state.** The last message stays on screen with no power, so there is no need to refresh it again.
4. **The server decides.** The device never chooses what to show. It renders what `/sync` returns.
5. **Privacy in hardware.** The camera rail is switched by a GPIO, and the same rail drives the privacy LED.

## 2. Wake state machine

```
            ┌────────── deep sleep ◄────────────────────────┐
   timer    │ button(EXT0)                IMU(EXT1)         │
     ▼      ▼                               ▼               │
  [SYNC]  [BUTTON] ─short─► [COPY] ─► POST /copy ─► ✓ glyph ─┤
     │        └──long 1.5s─► [PHOTO] ─► POST /photo ───────────┤
     │                                [GESTURE] dbl-tap → weather card
     ▼                                                       │
  read BME688 + battery → POST /sync → new msg? → EPD + buzz ┘
```

## 3. Modules (`firmware/src/`)

| File | Role |
|---|---|
| `config.h` | Pins, API host, default intervals, firmware version |
| `main.cpp` | Wake-cause dispatch, the state machine above |
| *(HW-02)* `lot_api.*` | HTTPS client, token in NVS, JSON (ArduinoJson) |
| *(HW-02)* `display.*` | GxEPD2 SSD1681 render: message, ✓, weather, battery, pairing code |
| *(HW-02)* `sensors.*` | BSEC2 for BME688, LSM6DSOX MLC config, MAX17048 |
| *(HW-02)* `provision.*` | BLE or SoftAP pairing: Wi-Fi credentials + 6-digit pairing code |

In v0.1, `main.cpp` holds all of these as compact functions so the whole flow can be read in one file. Splitting it up is an HW-02 task.

## 4. Pin map (EVT-1, ESP32-S3)

| Signal | GPIO | Note |
|---|---|---|
| COPY button | **GPIO 1** (RTC) | active low, EXT0 wake |
| IMU INT1 | GPIO 2 (RTC) | EXT1 wake |
| I²C SDA / SCL | 8 / 9 | BME688 0x76, LSM6DSOX 0x6A, MAX17048 0x36, camera SCCB (shared bus) |
| EPD SPI MOSI / SCK / CS / DC / RST / BUSY | 11 / 12 / 10 / 13 / 14 / 4 | SSD1681 |
| Camera XCLK / PCLK / VSYNC / HREF | 15 / 6 / 47 / 48 | DVP |
| Camera D0–D7 | 16, 17, 18, 21, 38, 39, 40, 41 | DVP |
| Vibration | GPIO 5 | MOSFET gate, ~60 mA |
| Camera power + privacy LED | GPIO 7 | high = on |
| Spare | GPIO 42 | |
| Reserved | 19/20 USB, 26–37 flash + octal PSRAM, 0/3/45/46 strapping, 43/44 UART0 debug | |

## 5. Provisioning (first boot)

1. No token in NVS → the EPD shows **"Pair at lot-systems.com · Settings > Devices"**.
2. On lot-systems.com the user opens **Settings → Devices → Add SQ-1** and gets a **6-digit code** (10-minute TTL).
3. The user gives the device Wi-Fi credentials and the code:
   * **v0.1 (breadboard):** USB serial commands `wifi <ssid> <pass>`, `pair <code>`
   * **HW-02+:** a SoftAP captive portal `LOT-SQ1-XXXX` (or BLE GATT from a phone) with the fields SSID · password · code
4. The device calls `POST /api/device/v1/pair` with `{code, serial, fw}`, receives `device_token`, stores it in NVS (flash encryption is enabled in release builds), and shows "Hello, <name>".

## 6. OTA updates

`/sync` returns `fw: {version, url, sha256}` when an update is available. The device downloads it to the inactive OTA slot, verifies SHA-256, reboots, and rolls back if the next sync fails.

## 7. Build

```bash
cd hardware/LOT-SQ1/firmware
pio run -e sq1-evt1          # build
pio run -e sq1-evt1 -t upload  # flash over native USB pads
pio device monitor
```

> v0.1 has **not been compiled yet**. This session had no ESP32 toolchain. The first compile is part of P1 Breadboard.
