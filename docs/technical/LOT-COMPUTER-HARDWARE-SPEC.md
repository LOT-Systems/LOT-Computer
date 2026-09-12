================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — DESK NOTIFICATION HARDWARE
PLAN · BILL OF MATERIALS · ROADMAP
================================================================================

DOCUMENT    HW-SPEC / LOT-COMPUTER v0.1
ISSUE DATE  2026.09.12
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
INVENTOR    VADIK MARMELADOV — LOT SYSTEMS / COSMO® CIA
SOURCE      S-2 build order, 2026.09.12 (19-point spec)

================================================================================

## 00  WHAT THIS OBJECT IS — AND WHAT IT IS NOT

The LOT Computer is a desk-resident PRESENCE object: a small stainless-steel
puck that receives one thing from lot-systems.com — a short, human-readable
notification ("Coffee time!") — and shows it on a low-power screen. A single
button ("Copy") lets the operator acknowledge or capture the moment back into
their own Log, on the site.

It is NOT the three other LOT/COSMO hardware lines already on record, and
this document exists partly to keep the naming straight:

    LOT-NODE-0-RIG-SPEC.md      Self-hosted AI SERVER — a workstation tower
                                 running local inference. Stays in a room.
    LOT-CUBIQ-QUANTUM-CUBE-v0   LOT®'s ACTUATED notification cube — moves,
                                 hops. Output is motion.
    LOT_ROBOTICS_COSMO.md       COSMO® companion ROBOT — long-horizon,
                                 soul-transfer vision, not a v1 product.
    LOT COMPUTER (this doc)     A STATIONARY pager. Output is a screen line.
                                 Input is one button and a camera. This is
                                 the smallest, nearest-term physical product
                                 of the four.

================================================================================

## 01  FORM FACTOR

```
FOOTPRINT      40mm x 40mm (flat silver square)
FACE A         Polished 316 stainless steel cap. No electronics. 5mm.
FACE B         Electronics housing: camera, screen, button. ~10-14mm.
ASSEMBLED      Two-part shell, press-fit + 4x M1.6 screws from the B side.
TOTAL HEIGHT   ~15-19mm at the electronics module, tapering to the
               5mm polished rim — NOT a uniform 5mm puck.
```

HONEST NOTE: the source brief calls for "a flat silver square 4x4cm x 5mm."
A 5mm total enclosure cannot hold a camera module, display, battery, and Qi
coil today — the thinnest commodity camera + display stack alone runs
6-8mm. Read literally, 5mm is Face A only: the polished stainless cap. Face
B, holding the working electronics, is thicker. This is stated plainly
rather than claiming a 5mm total that the BOM below cannot deliver.

================================================================================

## 02  ELECTRONICS STACK

```
PART                SPEC                                    ROLE
────                ────                                    ────
MCU                 ESP32-S3 (WROOM-1, 8MB PSRAM)            WiFi, camera I/F,
                                                              display driver
CAMERA              OV2640 2MP, FPC ribbon, 8.5x8.5mm module Log photo capture
DISPLAY             1.28" round TFT (GC9A01, 240x240, SPI)   Notification text
BUTTON              Tactile SMD, waterproof silicone cap      "Copy" signal
WEATHER SENSOR      Bosch BME680 (temp/humidity/pressure/VOC) Env. data + AI
                                                              air-quality signal
WIRELESS CHARGE     Qi receiver IC (e.g. IDT P9221) + coil    5W input, USB-C
                                                              fallback for dev
BATTERY             LiPo 3.7V 300mAh pouch cell                ~2-3 day standby
                                                              on notification-
                                                              only duty cycle
```

"AI grade off-the-shelf sensor" here means: digital-output, I2C/SPI sensors
whose readings are already in a form the LOT AI stack can reason over without
custom analog front-end work — BME680 (env + gas), OV2640 (vision), and the
MCU's own RSSI/uptime telemetry. No sensor on this list is bespoke.

================================================================================

## 03  PCB — PCBWAY

```
STEP 1   Schematic + layout (KiCad) — single 4-layer board, ~35x35mm to fit
         inside the 40x40mm shell with mounting clearance.
STEP 2   PCBWay prototype fab: 4-layer, ENIG finish, 5-10 boards.
         Typical turnaround: 3-5 business days + shipping.
STEP 3   PCBWay Assembly (PCBA): submit Gerbers + BOM + CPL (pick-and-place)
         file; PCBWay places and reflows SMD parts, hand-solders the FPC
         camera connector and button.
STEP 4   Bring-up: flash ESP-IDF bootloader, verify camera + display + Qi
         rail, confirm BME680 I2C address.
STEP 5   100-unit run: re-order the same PCBA job at qty 100 once STEP 4
         passes. PCBWay's small-batch PCBA tier covers 100 units without
         moving to a dedicated contract manufacturer.
```

LINK: pcbway.com — Prototype PCB + PCBA (Printed Circuit Board Assembly)
service. (S-2: verify current PCBWay PCBA MOQ and lead time at order time —
pricing and MOQs move quarter to quarter; no live quote was pulled for this
document.)

================================================================================

## 04  COMPONENTS / BUYING LIST (PER UNIT, ESTIMATE)

```
COMPONENT               QTY   UNIT (1-off)   UNIT @ QTY 100     SOURCE
─────────               ───   ────────────   ──────────────     ──────
ESP32-S3-WROOM-1 (8MB)   1     $3.50          $2.20              Espressif dist.
OV2640 camera module     1     $4.00          $2.50              Generic FPC cam
GC9A01 1.28" round TFT   1     $5.50          $3.80              Round-LCD vendors
BME680 breakout/bare     1     $8.00          $3.00              Bosch dist. (bare
                                                                  die at qty; module
                                                                  price at 1-off)
Qi receiver IC + coil    1     $2.50          $1.60              IDT/TI Qi RX
LiPo 300mAh              1     $2.80          $1.90              UL1642-cert cell
4-layer PCB (bare)       1     $6.00 (proto)  $1.20              PCBWay
PCBA (assembly labor)    1     $12.00 (proto) $4.50              PCBWay
Tactile button + cap     1     $0.60          $0.25              —
Stainless steel Face A   1     $9.00          $5.50              CNC + polish, 316
Stainless steel Face B   1     $11.00         $6.80              CNC, 316, machined
                                                                  window cutouts
Misc (screws, gasket,
  diffuser lens, ribbon) 1     $2.00          $1.00              —
─────────               ───   ────────────   ──────────────
PER-UNIT TOTAL                 $67.00         $34.25 (ESTIMATE)
```

ESTIMATE flagged: these are catalog street-price ranges assembled from
component class, not live quotes. Treat as planning figures, re-price at
order time.

================================================================================

## 05  MECHANICAL RISK — WIRELESS CHARGING THROUGH STEEL

A solid stainless-steel enclosure over a Qi coil is a real problem, not a
detail: 316 stainless is not strongly ferromagnetic but it is electrically
conductive, and induction charging through a conductive shell induces eddy
currents — reduced charge efficiency and localized heating under the coil.

MITIGATION (pick one, decide before PCBWay order):
    (a) Non-metallic charging window: a ~30mm polymer or ceramic insert in
        Face B directly over the coil, stainless everywhere else.
    (b) Move charging contact-based (pogo-pin dock) instead of Qi, keep the
        full-steel aesthetic. Simpler, but breaks "wireless charger" (pt 19).
    (c) Thin the steel specifically over the coil zone and add a ferrite
        shield between coil and shell to redirect flux.

RECOMMENDATION: (a). It preserves true Qi wireless charging (pt 19) and
costs one extra machining step on Face B, already a two-material part.

================================================================================

## 06  ROADMAP

```
v0.1   Breadboard proof-of-concept. ESP32-S3 dev kit + round TFT + BME680 on
       a bench. Prove: WiFi notification round-trip, screen render, button
       press → HTTP POST. No enclosure, no camera yet.               2-3 wks

v0.2   First PCBWay prototype (5-10 boards). Camera + Qi added. Bring-up
       against a real LOT account (staging).                          3-4 wks

v0.3   Enclosure fit: Face A / Face B machined samples from a local shop or
       PCBWay's sheet-metal partner. Fit-check against v0.2 board.     2-3 wks

v0.4   Firmware freeze candidate — see LOT-COMPUTER-FIRMWARE-SPEC.md.
       Battery life + charging-window validation (Section 05 fix confirmed).
                                                                        2 wks

v1.0   100-unit PCBA production run via PCBWay + stainless run via the
       enclosure vendor. QC pass on first 10, ship remaining 90.       4-6 wks
```

TOTAL, PROTOTYPE-TO-100-UNITS: roughly 13-18 weeks, sequential. Phases can
compress if enclosure and PCB tracks run in parallel from v0.2 onward.

================================================================================

## 07  100-UNIT RUN — COST SUMMARY (ESTIMATE)

```
BOM @ qty 100 (Section 04)        100 x $34.25   = $3,425
PCBWay tooling / NRE (one-time)                   = $250-500
Enclosure CNC setup (one-time)                     = $400-800
QC + bring-up labor (bench time, not a BOM line)   = not priced here
─────────────────────────────────────────────────────────
TOTAL, 100 UNITS                                   ≈ $4,100-$4,700
PER-UNIT AT 100                                    ≈ $41-$47
```

================================================================================

## 08  REFERENCES READ

    docs/technical/LOT-NODE-0-RIG-SPEC.md         Form + Terminal Grid style
    docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   Naming disambiguation
    docs/corporate/LOT_ROBOTICS_COSMO.md          COSMO® brand context
    docs/corporate/LOT-TERMINAL-VISION.md         S-2 / open-hardware tone
    docs/corporate/LOT-TERMINAL-M2M.md            M2M intake contract (device
                                                   data → LOT® Systems)
    docs/benchmark/LOT-MANIFEST.md                Prior "COSMO Hardware" ship-
                                                   queue entry (branch since
                                                   pruned; no spec survived —
                                                   this document replaces it)
    brand.lot-systems.com, lot-systems.com/about,
    institute.lot-systems.com/cqgs.html           UNREACHABLE from this
                                                   sandbox (egress-blocked);
                                                   substituted with the local
                                                   mirrors above (CQGS-WHITE-
                                                   PAPER-SNAPSHOT.md et al.)

Firmware detail: LOT-COMPUTER-FIRMWARE-SPEC.md
Software / API integration: LOT-COMPUTER-SOFTWARE-INTEGRATION.md
Operator-facing manual: LOT-COMPUTER-MANUAL.md / .pdf

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.12
================================================================================
