<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER — NODE-P
BILL OF MATERIALS
================================================================================

DOCUMENT    BOM / NODE-P
ISSUE DATE  2026.09.10
CLASS       INTERNAL / CONCEPT — see LOT-PAGER-NODE-P-PLAN.md §06 GATE
STATUS      PART FAMILIES CHOSEN. NO PURCHASE ORDER PLACED.

Note on links: part numbers and manufacturer families below are real and
verifiable at the distributors named (Mouser, DigiKey, PCBWay, LCSC). Exact
product-page URLs are intentionally not pasted here — distributor stock,
pricing, and page URLs change week to week, and a URL typed from memory
into a BOM is worse than none. Search the part number at time of order.

================================================================================

## 01  COMPUTE / RADIO

```
PART                    WHY                                          UNIT $
────                    ───                                          ──────
ESP32-S3-WROOM-1        Wi-Fi + BLE, native camera (DVP) interface,   $3–5
(module, 8MB PSRAM)     enough headroom for JPEG capture + a round-
                         LCD driver + Qi charge-detect, all on one
                         chip. Same family used across the open
                         AI-pendant hardware ecosystem, well-
                         documented, PCBWay assembles it routinely.
────                    ───                                          ──────
Distributor: Mouser, DigiKey, LCSC. Search "ESP32-S3-WROOM-1".
```

## 02  CAMERA

```
PART                    WHY                                          UNIT $
────                    ───                                          ──────
OV2640 (2MP, DVP)        Smallest common module with a native ESP32   $3–6
                         camera driver already in esp-idf / Arduino-
                         ESP32. Fixed-focus, no ISP needed on-device
                         — matches FIRMWARE.md §03 (capture, don't
                         process on-device).
ALT: GC0308 (VGA)        Cheaper, smaller, lower-res — fallback if     $2–3
                         the 5mm stack (PLAN §03) forces Path A.
────                    ───                                          ──────
Distributor: LCSC, Mouser, AliExpress (module boards). Search
"OV2640 camera module DVP" or "GC0308 camera module".
```

## 03  SENSORS ("WEATHER" + "AI-GRADE")

```
PART                    WHY                                          UNIT $
────                    ───                                          ──────
Bosch BME688             This is the literal match for brief #15      $6–9
                         "AI-grade off-the-shelf sensors" — Bosch
                         ships it with BSEC AI, an on-chip/on-host
                         gas-classification model layered over temp
                         / humidity / pressure / VOC readings. It is
                         marketed by Bosch itself as an AI-enabled
                         environmental sensor, not a marketing label
                         we're inventing here.
ALT: BME280               Cheaper, no gas/AI layer, temp/humidity/     $2–4
                         pressure only — fallback if BSEC licensing
                         or BOM cost is a blocker at P5 scale.
────                    ───                                          ──────
Distributor: Mouser, DigiKey, Adafruit/SparkFun breakout for
prototyping. Search "BME688" or "BME280".
```

## 04  POWER

```
PART                    WHY                                          UNIT $
────                    ───                                          ──────
LiPo flat/curved cell    ~250mAh flat pouch cell sized to the puck's  $3–5
(~250mAh)                40x40mm footprint keeps the stack within
                         the 5–8mm height budget (PLAN §03).
Qi receiver IC            e.g. TI BQ51013B family — standard Qi        $2–4
                         receiver + charge management, thin PCB
                         coil antenna (~0.5mm) rather than a wound
                         coil to save height. This is brief #19's
                         wireless charger.
Charging stand/puck       A separate small Qi transmitter puck is      $8–15
(transmitter side)       simpler and cheaper than building a custom
                         transmitter base — any Qi-certified
                         transmitter works; spec it as an accessory,
                         not a custom part.
────                    ───                                          ──────
Distributor: Mouser, DigiKey for the IC; any certified Qi charging
pad as the transmitter accessory (no custom development needed).
```

## 05  DISPLAY + INPUT

```
PART                    WHY                                          UNIT $
────                    ───                                          ──────
Round LCD, ~1.28"         GC9A01 driver — the same family used in      $4–7
(GC9A01)                 smartwatch faces, thin (~2mm), round face
                         reads as a clean "one line of text" pager
                         screen per PLAN §02. Square alternative:
                         ST7789 240x240 if a round face proves hard
                         to source at 100-unit volume.
Tactile button            One button, labeled COPY on the shell        <$1
                         (MANUFACTURING §02), wired to a GPIO with
                         debounce in firmware (FIRMWARE §05).
────                    ───                                          ──────
Distributor: Mouser, DigiKey, LCSC.
```

## 06  ENCLOSURE + PCB (see MANUFACTURING.md for detail)

```
ITEM                     SPEC                                        UNIT $
────                     ────                                        ──────
PCB, proto run (5–10)     2-layer, PCBWay, round/near-square to fit   ~$5–15
                         panel, JLC/PCBWay standard proto pricing     per bd
                          (proto)
Stainless enclosure,      2-piece shell, one polished face — see       TBD, see
proto (CNC or MIM sample) MANUFACTURING §02 for tolerancing notes     MFG §03
────                     ────                                        ──────
```

================================================================================

## 07  ESTIMATED UNIT COST (100-UNIT PILOT, ROUGH ORDER OF MAGNITUDE)

```
CATEGORY                          LOW EST.        HIGH EST.
────────                          ────────        ─────────
Electronics (MCU/cam/sensor/PMIC)  $18              $32
Display + button                    $5               $8
Battery + Qi receiver               $5               $9
PCB (fab + assembly, 100 qty)       $6              $15
Stainless enclosure (2-pc, 100 qty) $15              $40   <- widest range,
                                                              depends entirely
                                                              on CNC vs. MIM,
                                                              see MFG §03
────────                          ────────        ─────────
PER-UNIT ROUGH TOTAL                $49              $104
100-UNIT PILOT (parts only)        $4,900           $10,400
```

These are directional numbers for planning, not a quote. Real figures come
from PCBWay + a metal-fab shop at P2/P3 (see PLAN §04 roadmap) and must be
re-confirmed before the P5 gate (PLAN §06).

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF BOM                                                           2026.09.10
================================================================================
