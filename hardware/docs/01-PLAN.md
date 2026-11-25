# 01 · PLAN — LOT-HW-01 "TILE"

```
DOCUMENT  HW-01-PLAN      ISSUE 2026.11.25      CLASS INTERNAL / BUILD
```

## 00 · One sentence

A 40 × 40 × 5 mm stainless steel square that shows short notifications from
lot-systems.com and, with one press of **Copy**, writes them back to the
user's Log.

## 01 · What it is, and what it is not

It is a **pager**, not a phone. One line of text at a time. No apps, no feed,
no scrolling. The site decides what to send. The object only receives,
shows, senses and copies.

```
  SITE (lot-systems.com)                     TILE
  ─────────────────────                      ────
  Memory Engine / QIE  ──► compress ──►      screen: "Coffee time."
  scheduled nudges     ──► 1 line   ──►      [Copy] ──► Log tab
  weather-mood insights ◄── sensor  ◄──      BME688 T / RH / P / gas
                       ◄── photo    ◄──      camera (long-press)
```

## 02 · Product definition

| Property          | Value                                                                  |
|-------------------|------------------------------------------------------------------------|
| Size              | 40.0 × 40.0 mm, 5.0 mm target height (6.0 mm fallback, see risk R1)    |
| Body              | Two parts, 316L stainless steel, CNC machined                          |
| Side A            | Mirror-polished stainless steel (#8 finish), no openings               |
| Side B            | Bead-blasted stainless frame + 0.55 mm cover glass: screen, camera, Copy button |
| Screen            | 1.28" 128 × 128 Sharp Memory LCD, reflective silver, always-on, ~µW    |
| Camera            | Himax HM01B0 320 × 320 mono, ultra-low-power, on-device AI capable     |
| Button            | One metal-dome button, labelled Copy                                   |
| Sensors           | Bosch BME688 (T / RH / P / VOC + AI gas), ST LSM6DSV16X IMU (machine-learning core: tap, pick-up, flip) |
| Radio             | Wi-Fi 2.4 GHz + Bluetooth LE 5 (ESP32-S3), NFC for pairing             |
| Charging          | Wireless: NFC Wireless Charging (WLC) through the glass face; Qi as alternate (see doc 07) |
| Battery           | ~90–110 mAh thin Li-Po, ~1.6 mm                                        |
| Battery life      | Target 14 days at 15-minute sync (calculation in doc 05)               |
| Cloud link        | LOT Device API (new, doc 06) on lot-systems.com                        |
| First run         | 100 units                                                              |

## 03 · Architecture

```
┌──────────────────────── TILE ────────────────────────┐        ┌──── lot-systems.com ────┐
│                                                      │        │                          │
│  BME688 ─┐                                           │  Wi-Fi │  /api/device/inbox       │
│  LSM6DSV ┼─I²C─┐                                     │ ─────► │  /api/device/copy ─► Log │
│  MAX17048┘     │      ESP32-S3-PICO-1 (8 MB / 2 MB)  │  HTTPS │  /api/device/telemetry   │
│                ├──────  RTC · deep sleep · ESP-DL    │        │  /api/device/photo       │
│  HM01B0 ──DVP──┘        Wi-Fi + BLE                  │        │                          │
│  Memory LCD ──SPI──┘                                 │        │  Memory Engine compresses│
│  Copy dome ──GPIO (wake)                             │        │  each session into one   │
│                                                      │        │  line for the screen     │
│  PTX30W NFC-WLC + charger ◄── coil under display     │        └──────────────────────────┘
│  Li-Po 100 mAh ── TPS62840 3.3 V                     │
└──────────────────────────────────────────────────────┘
          ▲ face-down on dock
┌─── DOCK ───┐
│ PTX130W WLC│◄── USB-C 5 V
└────────────┘
```

## 04 · How a notification travels

1. The site creates a notification for the user (manual, scheduled, or
   autonomous from the Memory Engine / Quantum Intent Engine).
2. The site **compresses** it: one line, at most 64 characters, no emoji
   (LOT style: "Coffee time." not "☕ Coffee time! ✓").
3. The TILE wakes every 15 minutes (configurable), syncs once over Wi-Fi,
   and downloads its inbox. Items can carry a future `fireAt` time, so
   "Coffee time." at 15:00 shows at 15:00 exactly, without the radio on.
4. The screen shows the line. The IMU wakes the screen highlight on pick-up.
5. The user presses **Copy**. The TILE writes a Log entry:
   `event: "device_copy"`, text = the notification, metadata = device id,
   notification id, temperature, humidity, pressure, air-quality index.
6. The entry appears in the Log tab on lot-systems.com.

## 05 · Button grammar (one button, three gestures)

| Gesture        | Action                                                  |
|----------------|---------------------------------------------------------|
| Short press    | **Copy** current notification to Log                    |
| Long press 2 s | Take a photo, upload it, attach to Log as `device_photo`|
| Double press   | Dismiss / next notification                             |
| Hold 10 s      | Re-pair (shows a 6-digit code for the site)             |

## 06 · Requirement traceability (the 19 points)

| #  | Requirement                                   | Where it is answered                                     | Status |
|----|-----------------------------------------------|----------------------------------------------------------|--------|
| 1  | PCBWay                                        | Doc 04 §06 PCB + PCBA order sheet; doc 03 §05 CNC at PCBWay | Planned |
| 2  | Pager-like notification from AI-powered site  | Doc 06 inbox API; doc 05 sync loop                       | Designed |
| 3  | Two-part stainless steel body                 | Doc 03 §02                                               | Designed |
| 4  | Flat silver square 4 × 4 cm × 5 mm            | Doc 03 §03 stack-up (5.0 mm is tight, risk R1)           | At risk |
| 5  | Camera                                        | HM01B0, doc 02 / 04 / 05                                 | Designed |
| 6  | LOT API connector                             | Doc 06 + `connector/lot-device.mjs`                      | Prototype code |
| 7  | PDF manuals                                   | `manuals/*.pdf`                                          | Done (v0.1) |
| 8  | Compress the information in each session     | Doc 06 §05 (AI one-line compression + CBOR wire format + per-session digest) | Designed |
| 9  | Firmware documents                            | Doc 05                                                   | Done (v0.1) |
| 10 | Software to connect with firmware             | `connector/`, `firmware/`, doc 06                        | Prototype code |
| 11 | Separate documents                            | `docs/01…10`                                             | Done |
| 12 | Charger                                       | Doc 07 dock                                              | Designed |
| 13 | 100-unit run                                  | Doc 09, costs in doc 02                                  | Planned |
| 14 | Weather sensor                                | BME688                                                   | Designed |
| 15 | AI-grade off-the-shelf sensors                | BME688 (BME AI-Studio), LSM6DSV16X (MLC), HM01B0 (TinyML) | Designed |
| 16 | Copy button → Log tab on lot-systems.com      | Doc 06 `POST /api/device/copy` → `logs` table            | Designed, needs server work |
| 17 | One side polished stainless                   | Doc 03, Side A, #8 mirror                                | Designed |
| 18 | Other side camera + screen + button           | Doc 03, Side B layout                                    | Designed |
| 19 | Wireless charger                              | Doc 07 (NFC-WLC through glass; Qi alternate)             | Designed, risk R2 |

## 07 · Three engineering truths that shape the design

1. **Stainless steel blocks radio and wireless power.** A closed steel box is
   a Faraday cage, and Qi through steel heats the steel instead of charging
   the battery. Therefore all radio and charging energy goes through the
   **glass face (Side B)**. The antenna sits under the glass border, the
   charging coil sits under the display, and the TILE charges face-down. The
   polished face stays pure, with no window or seam.
2. **5 mm is the whole budget.** Glass 0.55 + display 0.74 + coil 0.25 +
   PCB 0.6 + battery 1.6 + steel back 0.6 + tolerances = 4.9–5.2 mm. The camera
   sits in a cut-out in the PCB beside the battery. There is no room for a
   connector, so there is no USB port. That is a feature: the object is sealed.
3. **A pager does not need to be always connected.** Pre-scheduled delivery
   (`fireAt`) plus a 15-minute sync gives "on time" behaviour at about 1/20 of
   the power of an always-on Wi-Fi link.

## 08 · Brand rules applied to the object

From `docs/technical/LOT-STYLE-GUIDE.md`: no decorative colour, no emoji,
periods over symbols, system-default type. On the TILE this means a monochrome
reflective screen, one font size for the message and one smaller for the
metadata line, sentences that end with a period, and one word on the button:
**Copy**. brand.lot-systems.com could not be reached from this build session
(network policy), so cross-check finishes and wordmark placement against it
before ordering the enclosure.
