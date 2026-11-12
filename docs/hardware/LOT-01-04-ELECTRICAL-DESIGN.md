<!--
  LOT SYSTEMS CORPORATION
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT-01 — ELECTRICAL DESIGN
================================================================================
DOCUMENT    HW-04 / ELEC
ISSUE       2026.11.12 · REV A (preliminary — schematic capture is session 02+)
PCB         36 × 36 mm, 6-layer HDI 0.6 mm (EVT) · 4-layer 0.4 mm (DVT)
================================================================================
```

## 1 · BLOCK DIAGRAM

```
  Qi coil ──► BQ51050B ──► VBAT (LiPo 90 mAh) ──► TPS62840 ──► 3V3 rail
  (under glass)  │ CHG, TS◄NTC        │                          │
                 └──────────► GPIO    └─► MAX17048 (I²C)          │
                                                                 ▼
 ┌───────────────────────────── ESP32-S3-PICO-1-N8R2 ─────────────────────────┐
 │  Wi-Fi 2.4 GHz + BLE 5 ──► matching ──► chip antenna (glass edge)          │
 │  DVP 8-bit ◄── GC0308 camera            SPI ──► Sharp LS013B7DH03 LCD       │
 │  I²C bus ◄──► BME688, BMI270, MAX17048   GPIO ◄── COPY button (wake)       │
 │  GPIO ──► MOSFET ──► coin motor (buzz)   GPIO ◄── BMI270 INT1 (wake)       │
 │  USB D+/D−, UART0, EN, GPIO0 ──► pogo test pads (factory only)             │
 └────────────────────────────────────────────────────────────────────────────┘
```

## 2 · PIN MAP (preliminary)

Avoid strapping pins GPIO0 / 3 / 45 / 46 for anything that is driven at
boot. N8R2 has quad PSRAM, so GPIO 33–37 stay free.

| Function          | Signal          | GPIO | Notes                              |
|-------------------|-----------------|------|------------------------------------|
| Camera            | XCLK            | 15   | 20 MHz via LEDC                     |
|                   | PCLK            | 13   |                                    |
|                   | VSYNC / HREF    | 6 / 7|                                    |
|                   | D0–D7           | 11, 9, 8, 10, 12, 18, 17, 16 |              |
|                   | SIOD / SIOC     | 4 / 5| SCCB, separate from sensor I²C      |
|                   | PWDN            | 39   | camera off by default (non-RTC is fine) |
| LCD (SPI)         | SCLK / MOSI / CS| 36 / 35 / 34 | CS is active-high on Sharp |
|                   | EXTCOMIN        | 33   | 1 Hz toggle from RTC (or software)  |
|                   | DISP            | 37   | display on/off                      |
| Sensor I²C        | SDA / SCL       | 1 / 2| BME688 0x76, BMI270 0x68, MAX17048 0x36 |
| IMU wake          | INT1            | 21   | RTC-capable, wake on tap/lift       |
| COPY button       | BTN             | 14   | RTC GPIO → wakes from deep sleep (ext1), 10 k pull-up |
| Motor             | MOT             | 40   | via N-MOSFET                        |
| Charger status    | CHG             | 41   | BQ51050B open-drain                 |
| Fuel gauge alert  | ALRT            | 42   |                                    |
| Factory           | U0TXD / U0RXD   | 43 / 44 | pogo pads                        |
|                   | USB D− / D+     | 19 / 20 | pogo pads, flashing + logs      |

**Open item (pin map).** Deep-sleep wake needs RTC GPIOs (0–21 on ESP32-S3).
The camera bus takes most of them, so camera PWDN sits on GPIO 39 and COPY
takes the freed RTC pin GPIO 14; BMI270 INT1 uses RTC GPIO 21. Some
ESP32-S3-PICO-1 pins are not bonded out or are used internally: check every
row against the PICO-1 datasheet pin list during schematic capture. Treat
this table as a starting point.

## 3 · POWER BUDGET

| State                          | Current         | Time / day     | mAh / day |
|--------------------------------|-----------------|----------------|-----------|
| Deep sleep + LCD static + IMU low-power | ~ 15 µA | ~ 23.9 h       | 0.36      |
| Wake + Wi-Fi + HTTPS poll      | ~ 100 mA avg × 3 s | 288 polls (5 min) | 24.0  |
| BME688 reading (BSEC2 LP, 3 s) | low             | continuous LP  | 1.0       |
| COPY + frame upload (10/day)   | ~ 180 mA × 5 s  | 10 ×           | 2.5       |
| Buzz (10 × 300 ms)             | 60 mA           |                | 0.05      |
| **Total**                      |                 |                | **≈ 28**  |

90 mAh cell → **≈ 3 days** at 5-minute polls; **≈ 6 days** at 10-minute
polls. The server returns `next_poll_s`, so it can slow polling at night
and speed it up when a message is expected (HW-06).

## 4 · CHARGING (Qi)

- BQ51050B: Qi v1.2 receiver and Li-ion charger in one chip, 4.20 V float.
- Set charge current ≈ 45 mA (0.5 C) with the ILIM resistor. Small cell,
  small coil, low heat.
- 10 k NTC on the battery → TS pin. Stop charge above 45 °C.
- CHG pin → GPIO so the screen can show "Charging." and "Charged."
- Coil location: under the LCD, ferrite toward the PCB. **EVT test:**
  measure charge efficiency and LCD temperature with the coil under the LCD.
  Fallback: smaller coil (Ø 20 mm) shifted below the LCD outline.

## 5 · SENSORS ("AI-grade, off-the-shelf")

| Sensor  | Measures                                   | AI part                                             |
|---------|--------------------------------------------|-----------------------------------------------------|
| BME688  | Temperature, humidity, pressure, VOC/gas   | Bosch BSEC2 + BME AI-Studio: train gas classes (e.g. *coffee*, *fresh air*, *cooking*) and run them on-device |
| BMI270  | Motion, tap, lift, orientation             | Built-in gesture/activity features; wakes the MCU on lift |
| GC0308  | VGA image                                   | Frames go to LOT for AI description, or ESP-DL on-device |
| ESP32-S3| —                                           | Vector instructions for small on-device models (ESP-DL) |

Placement: BME688 on the bottom-edge of the PCB, thermally isolated by a
routed slot, behind the vent. Keep it ≥ 8 mm from the ESP32-S3 and the
charger IC.

## 6 · RF

- Chip antenna at the top edge, on the glass side of the PCB, with a
  ≥ 5 × 8 mm copper keep-out on all layers.
- Pi matching network (3 × 0201) — tune on EVT bodies with a VNA, inside
  the closed steel case.
- Pass criteria: RSSI ≥ −70 dBm at 5 m line of sight from a home AP.

## 7 · TEST PADS (factory)

Six pogo pads on the PCB bottom, reachable before the battery is fitted:
VBAT, GND, EN, GPIO0, USB D−, USB D+. Flashing, serial number, and
self-test happen here (HW-07).
