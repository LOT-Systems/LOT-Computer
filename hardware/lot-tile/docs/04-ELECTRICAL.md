# 04 · Electrical Design

## 1. Block diagram

```
                ┌────────────── 3V3 (TPS63900 buck-boost, 75 nA Iq) ───────────────┐
                │                                                                  │
  Qi coil ─► BQ51050B ─► VBAT (LiPo ~110 mAh) ─► MAX17048 (fuel gauge, I²C)        │
  Pogo ────────┘ (5 V)        │                                                    │
                              ▼                                                    │
                     ┌──────────────────┐   SPI  ┌──────────────────────┐          │
   COPY dome ──GPIO─►│ ESP32-S3-MINI-1  │──────► │ Sharp LS013B7DH03    │          │
   (RTC wake)        │  N4R2  Wi-Fi/BLE │  DVP8  │ 1.28" memory LCD     │          │
                     │                  │◄────── │ HM0360 camera        │          │
                     │                  │  I²C   ├──────────────────────┤          │
                     │                  │◄─────► │ BME688 · BHI260AP    │          │
                     │                  │        │ LTR-390UV · DRV2605L │──► LRA   │
                     └──────────────────┘        └──────────────────────┘          │
                       privacy LED ◄─GPIO (hard-wired to camera power)             │
```

**Privacy rule:** the LED takes its power from the camera's power-enable line, so the camera cannot be on while the LED is off, whatever the firmware does.

## 2. Pin map (ESP32-S3-MINI-1)

| Function | GPIO | Notes |
|---|---|---|
| BTN_COPY | 1 (RTC) | Wake source ext0, active-low, 100 k pull-up |
| LCD_SCLK / MOSI / CS | 12 / 11 / 10 | SPI2, 1 MHz; CS is active-high on the Sharp panel |
| LCD_EXTCOMIN | 9 | 1 Hz VCOM toggle from the LP core / RTC timer |
| LCD_DISP | 8 | Display on/off |
| I2C_SDA / SCL | 4 / 5 | 400 kHz shared bus |
| BHI_INT | 6 (RTC) | Wakes on tap or flip gesture |
| CAM_D0–D7 | 15,16,17,18,38,39,40,41 | DVP 8-bit |
| CAM_PCLK / VSYNC / HREF / XCLK | 42 / 2 / 3 / 7 | XCLK 12 MHz |
| CAM_PWR_EN | 14 | Also drives the privacy LED |
| HAPTIC_EN | 21 | DRV2605L EN |
| CHG_STAT | 13 | From BQ51050B CHG pin |
| Factory UART / USB | 19/20 (USB-JTAG) | Brought out to the pogo pins / test pads |

## 3. Power budget (Calm mode, ~110 mAh cell)

| State | Current | Time per day | mAh/day |
|---|---|---|---|
| Deep sleep (ESP32-S3 ~8 µA + sensors ~4 µA + LCD ~3 µA + regulator) | ~18 µA | ~23.9 h | 0.43 |
| Wake + Wi-Fi connect + HTTPS sync (TLS session resumption) | ~95 mA average | 1.8 s × 48 wakes | 2.28 |
| Notification shown + buzz | ~40 mA | 0.5 s × 10 | 0.06 |
| BME688 ULP mode (one reading every 5 min) + BSEC | ~0.1 mA average | 24 h | 2.4 → 0.9 with LP scan |
| COPY presses (an extra sync) | 95 mA | 1.8 s × 10 | 0.48 |
| Camera snap (rare) | 120 mA | 3 s × 2 | 0.20 |
| **Total** | | | **≈ 4.4–6.0 mAh/day** |

**→ About 15–20 days on 110 mAh** with 48 server-scheduled wakes per day.
Live mode (Wi-Fi associated, DTIM 3, ~3 mA) gives about 1.5 days. The 6.0 mm / 180 mAh build adds about 60% to both figures.

## 4. PCB specification for PCBWay

| Item | Value |
|---|---|
| Layers | 4 (Sig / GND / PWR / Sig) |
| Thickness | 0.4 mm (0.6 mm fallback) |
| Outline | 38.0 × 38.0 mm, R1.0, with camera cut-out and battery keep-out |
| Min trace / space | 0.075 / 0.075 mm |
| Vias | 0.2 mm drill, via-in-pad filled and capped under the BGAs |
| Finish | ENIG |
| Impedance | Not needed (module includes the RF) |
| Antenna keep-out | Follow Espressif's MINI-1 layout guide: no copper on any layer under the antenna |
| Panel | 2 × 3 with breakaway tabs and fiducials; Tag-Connect TC2030-NL pads for programming |

## 5. Design rules that matter here

1. Keep the ESP32-S3 RTC domain powered in deep sleep only for the GPIOs that can wake it.
2. The BME688 needs a thermally isolated area (slots cut around the sensor). The vent is in the lid, and the radio module heats up during syncs, so the firmware ignores readings for 60 s after each Wi-Fi burst.
3. Put the Qi coil ferrite between the coil and the battery. **Never put a Qi coil behind solid steel** (doc 07).
4. ESD protection (TVS) on the button, the pogo pins and the display FPC. The steel case is bonded to GND through 1 MΩ ∥ 1 nF.
