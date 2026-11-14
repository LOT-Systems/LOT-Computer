# 04 · Electrical Design

**Doc:** LOT-HW-01-ELEC · **Rev:** A (2026-11-14)

## 1. Block diagram

```
                 Qi field (back window)
                        │
                 ┌──────▼──────┐   VBAT 3.0–4.2 V   ┌────────────┐
   L1 coil ─────►│ BQ51050B    ├───────┬───────────►│ LiPo + PCM │
                 │ Qi RX + chg │       │            └────────────┘
                 └──┬───────┬──┘       │  ┌──────────┐
             CHG_STAT│    NTC│          ├─►│ MAX17048 │── I²C
                    │       │          │  └──────────┘
                    │       │   ┌──────▼─────┐ 3V3
                    │       │   │ TPS62840   ├──────────────┬────────────┬───────────┐
                    │       │   └────────────┘              │            │           │
               ┌────▼───────▼────────────────────────┐ ┌────▼────┐ ┌─────▼────┐ ┌────▼─────┐
               │            ESP32-S3                 │ │ BME688  │ │ BMI270   │ │ LTR-303  │
               │  Wi-Fi/BLE · 2 MB PSRAM · USB-OTG   │ └────┬────┘ └────┬─────┘ └────┬─────┘
               │                                     │◄─────┴─── I²C ───┴────────────┘
               │  SPI ──────────────► Memory LCD (LS011B7DH03) + EXTCOMIN
               │  DVP 8-bit + XCLK ─► Camera (GC032A/GC0308), PWDN load switch
               │  I²C ──────────────► DRV2605L ──► LRA
               │  GPIO0 (RTC) ◄────── Copy key (to GND, RTC wake)
               │  GPIO (RTC) ◄─────── BMI270 INT1 (pickup wake)
               │  USB D+/D- ────────► Tag-Connect TC2030 (factory only)
               └─────────────────────────────────────┘
```

## 2. Pin map (ESP32-S3, EVT)

| Function | GPIO | Notes |
|----------|-----:|-------|
| I²C SDA / SCL (sensors, haptic, gauge) | 8 / 9 | 400 kHz, 4.7 kΩ pull-ups on the 3V3 sensor rail |
| LCD SCLK / MOSI / CS | 12 / 11 / 10 | Memory LCD: CS is active-high, LSB-first |
| LCD EXTCOMIN | 13 | 1 Hz toggle from the ULP/LEDC during sleep (VCOM inversion) |
| LCD DISP | 14 | Display on/off |
| CAM D0–D7 | 15,16,17,18,39,40,41,42 | DVP |
| CAM PCLK / VSYNC / HREF / XCLK | 4 / 5 / 6 / 7 | XCLK 20 MHz from LEDC |
| CAM SIOD / SIOC | shares I²C 8 / 9 | SCCB-compatible |
| CAM PWDN (load switch EN) | 21 | Camera fully unpowered when idle |
| Copy key | 0 | RTC GPIO wake, also BOOT strap. Hold at reset = download mode |
| IMU INT1 | 1 | RTC wake on pickup |
| Qi CHG_STAT / PGOOD | 2 / 3 | Charging UI, and ext0 wake on dock |
| Fuel gauge ALRT | 47 | Low-battery interrupt |
| USB D- / D+ | 19 / 20 | Native USB-Serial/JTAG for provisioning (`lotctl`) |

## 3. Power budget at the default 5-minute cadence

| State | Current | Time per hour | mAh per hour |
|-------|--------:|-------------:|---------:|
| Deep sleep (RTC + ULP EXTCOMIN + sensors idle + LCD static) | 18 µA | 3 590 s | 0.018 |
| Wi-Fi wake, fetch (fast reconnect with a cached BSSID/channel, TLS session resumption) | 95 mA avg | 12 × 0.9 s | 0.285 |
| BME688 forced-mode read, every 15 min | 1 mA | 4 × 1 s | 0.001 |
| Notification: haptic 300 ms + LCD write | 80 mA | ~3 × 0.4 s | 0.027 |
| Copy press: wake + POST | 95 mA | ~2 × 1.2 s | 0.063 |
| **Total** | | | **≈ 0.39 mAh per hour ≈ 9.5 mAh per day** |

- EVT cell, 150 mAh × 0.85 usable ≈ **13 days** in the ideal case. Plan on **≥ 5 days** with real Wi-Fi retries.
- DVT cell, 70 mAh ≈ **6 days** ideal, ≥ 2–3 days real.
- A persistent socket for true push (v2) costs about 2–3 mA average with DTIM-3 modem sleep, which is about 1 day on the DVT cell. That is why v1 polls.
- Adaptive cadence: 2 minutes while the user is active on lot-systems.com (`next_poll_s` comes from the server), 30 minutes overnight per the user's circadian phase.

## 4. Charging

- **BQ51050B:** WPC 1.1 Qi receiver with an integrated Li-ion charger (4.20 V, set the ILIM resistor to about 150 mA = 1 C for the EVT cell and 70 mA for DVT).
  The TS/CTRL pin is wired to a 10 kΩ NTC on the cell.
- **Charger accessory:** EVT ships with an off-the-shelf WPC-certified 5 W pad. PVT ships with a LOT-branded stainless puck that has a zirconia top, a magnet ring for alignment (the steel walls of the device are only weakly attracted, so use a thin steel shim plate behind GL2) and USB-C input.
- The screen shows `Charging. 64%` and then `Charged.` (LOT style, with a period).

## 5. Sensors: "AI-grade, off-the-shelf"

| Sensor | AI feature used | Output to LOT |
|--------|-----------------|---------------|
| **Bosch BME688** | BSEC2 library (IAQ index), plus a custom gas-class model trained in BME AI-Studio (e.g. "coffee brewing", "fresh air", "stale room") | `temp_c, rh, hpa, iaq, gas_class` every 15 min |
| **Bosch BMI270** | On-chip wrist-wear and any-motion features, used for pickup-to-wake and double-tap = dismiss | Wake events only. No raw motion leaves the device |
| **Lite-On LTR-303** | Lux used for a bedtime "quiet" window | `lux` (coarse) with each telemetry packet |

The BME688 gas class gives LOT a context signal: "coffee brewing" detected leads the site to log a coffee moment and suppress the "Coffee time!" nudge.

## 6. Schematic and layout tasks (next session)

1. KiCad 8 project `hardware/lot-tile/pcb/`: schematic for all of the above, with ERC clean.
2. Layout: 36 × 36 mm, 4 layers (signal, GND, power, signal), 0.6 mm, ENIG, with cut-outs for the LRA and camera.
3. Antenna keep-out per Espressif's ESP32-S3-MINI-1 hardware design guide, placed on the front-glass edge.
4. Test points for bed-of-nails: VBAT, 3V3, USB, EN, GPIO0, I²C, CHG_STAT.
