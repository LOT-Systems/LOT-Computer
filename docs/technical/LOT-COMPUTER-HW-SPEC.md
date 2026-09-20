<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
COSMO® CUBE — LOT HARDWARE COMPUTER
MECHANICAL + BOM + PRODUCTION SPECIFICATION
================================================================================

DOCUMENT    LOT-COMPUTER-HW-SPEC
VERSION     v2.0 (rebuild — see LINEAGE below)
ISSUE DATE  2026.09.20
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
S-2         VADIK MARMELADOV

================================================================================

## LINEAGE — WHY THIS IS v2.0

MANIFEST §01 records a prior BEST iteration: `COSMO Hardware | brave-lamport-t9z5u8
| c7d353ef | 14/14 | BEST | 7 files | +2610 | COSMO® Cube — complete hardware
computer design v1.0`. That branch is no longer reachable on `origin` — 14
iterations of design work exist only as that one-line MANIFEST summary. Per
WIKI-GUARD / Manifest Hygiene doctrine, the MANIFEST row is provenance, not
proof of content; nothing verbatim survives to build on. This document does
not assume anything about v1.0's actual content beyond the MANIFEST line
itself — it re-derives the design from the current request and the live repo.
**ESTIMATE:** the physical description in v1.0 was likely similar in spirit
(a small stainless "cube"/puck) but the concrete BOM below is new work, not a
recovery. Treat v1.0 as lost; treat this as the new ground truth.

================================================================================

## 00 — PRINCIPLE: WHAT THIS DEVICE IS

A physical, ambient companion to lot-systems.com — not a screen you check, a
presence you notice. The QIE (Quantum Intention Engine) already detects
behavioral state server-side (P76 morning-launch, MCL:/EVE:/MOM: log blocks,
weather via Open-Meteo). Today those surface only inside the web app. COSMO
Cube is the first output device that gets a LOT nudge onto a desk without a
phone screen in the loop — a pager-like buzz plus a two-word message ("Coffee
time!"), and a single physical button ("Copy") that writes an acknowledgment
straight back into the operator's Log tab.

    OWN THE OBJECT    ONE BUTTON    NO APP TO OPEN    LOG IS THE MEMORY

This is a companion output/input surface for the existing system, not a new
brain. All intelligence (what to say, when to say it) stays server-side in
the QIE; the device is a thin, honest terminal — the RIG-SPEC principle
("transparency by default") applies here too: every button press is a
Log.create() row before anything else happens.

================================================================================

## 01 — INDUSTRIAL DESIGN

### Form factor (as specified, with one flagged tension)

```
FOOTPRINT     40mm x 40mm square puck (matches "flat silver square 4x4cm")
BODY          2-piece stainless steel shell (SUS304), split front/back
FRONT FACE    Polished stainless steel (mirror finish, Ra ≤ 0.1um) — blank,
              no controls. This is the side that sits "up" on a desk.
BACK FACE     Interactive face: camera aperture, round display window,
              single "Copy" button. Faces down/away or mounts to a stand —
              operator picks up the puck and flips it to interact.
```

**Flagged tension — height.** The brief specifies "5mm height" for the flat
silver square. A 5mm stack cannot honestly hold a camera module + display +
Li-Po cell + PCB + Qi receiver coil + steel shell with parts that exist
off-the-shelf today (a bare camera module alone is typically 4-6mm thick).
Two honest paths, not one fudged number:

```
OPTION A — ACCENT PLATE (recommended)      OPTION B — ULTRA-THIN PUCK
5mm is the polished FRONT PLATE only,      Whole device is 5mm. Requires:
laminated onto a thicker back shell.       no camera (drop item 5), a
Total device: 40x40x14mm. Every listed     flexible/solid-state thin cell
component (camera, screen, weather         (<=2mm), and a display-only front
sensor, Qi coil, battery) fits with        (no camera). This is a real product
margin. Matches "2 parts stainless         family (like a Qi-charged e-ink
steel body" literally: thin polished       badge) but is a DIFFERENT device
plate (part 1) + machined back shell       than "camera, screen, button" (item
holding everything (part 2).               18) asks for. Kept as SKU-2 (below).
```

This spec builds **Option A** as SKU-1 (the full-featured device: camera +
screen + button + weather sensor) and records **Option B** as SKU-2, a
lighter notification-only puck, so the 5mm literal spec is not simply
discarded — it becomes a real, buildable second product instead of a
fabricated claim about the full device.

```
SKU-1  "COSMO Cube"        40 x 40 x 14mm   Camera + 1.28" display + button
                                             + BME280 + Qi receiver
SKU-2  "COSMO Cube Mini"   40 x 40 x 5mm    Display only, no camera, thin
                                             printed battery, Qi receiver
```

### Two-piece shell detail (SKU-1)

```
PART 1  FRONT PLATE   0.8mm SUS304, polished mirror finish, laser-cut LOT
                       wordmark (recessed, filled black epoxy — no paint
                       that chips). Bonded to Part 2 with structural
                       adhesive (3M VHB or epoxy) + 4 hidden M1.6 screws.
PART 2  BACK SHELL    CNC-machined SUS304, ~13mm deep cavity. Bead-blasted
                       matte finish (grippable, fingerprint-resistant —
                       contrast with the polished front). Machined
                       features: 8mm camera aperture (sapphire window),
                       28mm display window (mineral glass), 6mm button
                       bore, weather-sensor vent slot (0.3mm mesh, IP-rated
                       membrane behind it so moisture reaches the BME280
                       without water ingress).
SEAL            Silicone gasket between the two halves, IP54 target
                (desk object, not outdoor-rated — the weather sensor reads
                room conditions, it does not need to survive rain).
```

================================================================================

## 02 — ELECTRONICS BOM (SKU-1, per unit)

Real, sourceable, off-the-shelf parts. Links go to vendor/category pages
(exact SKUs shift with vendor stock; search the part number at that vendor).

```
QTY  PART                          ROLE                          SRC / SEARCH TERM
---  ----                          ----                          -----------------
1    ESP32-S3-WROOM-1 (N16R8)      MCU: WiFi+BLE, camera DVP      digikey.com / mouser.com
                                    interface, 8MB PSRAM for       "ESP32-S3-WROOM-1-N16R8"
                                    camera framebuffer + on-device
                                    wake-word inference headroom
1    OV2640 2MP camera module      Camera (item 5)                lcsc.com / "OV2640 FPC24"
1    GC9A01 1.28" round LCD, SPI   Display — round window echoes  aliexpress.com, buyd
     240x240, IPS                  the puck form                  isplay.com / "GC9A01 1.28"
1    Bosch BME280                  Weather sensor (item 14):      digikey.com / "BME280"
                                    temp / humidity / pressure,
                                    I2C, 2.5x2.5mm
1    Knowles/InvenSense INMP441    I2S MIC — wake-word / voice    digikey.com / "INMP441"
                                    trigger, "AI-grade off-shelf
                                    sensor" (item 15)
1    Vishay VEML7700               Ambient light — auto display   digikey.com / "VEML7700"
                                    brightness (item 15)
1    PixArt/generic mini-PIR       Presence detection — wakes     digikey.com / "AS312" or
     (AS312)                       device from sleep on approach   "HC-SR505" module
1    Tactile switch, IP-rated      "Copy" button (item 16),       digikey.com / "IP67 tactile
                                    stainless cap bonded on top    switch 6mm"
1    Renesas/IDT P9221 Qi receiver Wireless charge receiver IC    digikey.com / "P9221RQFR"
1    Würth WE-WPCC Qi coil         Charge coil (item 19)          we-online.com / "WE-WPCC 15x15"
1    Li-Po 3.7V 250mAh (thin)      Battery, ~3mm thick cell       aliexpress.com / "301230
                                                                    lipo 250mah"
1    TP4056 + protection           Battery charge management      lcsc.com / "TP4056 IP5306"
     (or MCP73831)                                                 or "MCP73831"
1    4-layer PCB, ENIG finish      Main board                     pcbway.com (see §03)
```

**Approx BOM cost per unit at 100-unit volume: $14–$22** (electronics only,
excludes stainless shell, assembly labor, and Qi charging dock). SKU-2 (Mini,
no camera/PIR/mic) drops to roughly $6–$9 in electronics.

================================================================================

## 03 — PCB + ASSEMBLY: PCBWAY (item 1)

PCBWay (pcbway.com) is the named fab partner and does full turnkey:
fabrication + SMT assembly + (separately) CNC machining for the stainless
shell, so hardware and enclosure can be sourced from one vendor relationship.

```
STAGE           PCBWAY SERVICE          NOTES
-----           --------------          -----
Bare PCB        PCB Prototyping /       4-layer, ENIG (gold finish — matches
                Fabrication              the "silver square" aesthetic under
                                         a window, and ENIG solders reliably
                                         for a 100-unit SMT run)
Assembly        PCBA (Turnkey SMT)      PCBWay sources + places all parts
                                         above except battery/coil (hand-
                                         placed or contracted separately —
                                         battery cells often ship direct
                                         from a certified battery vendor
                                         for shipping-compliance reasons)
Shell (SKU-1)   CNC Machining service    SUS304 back shell; front plate can
                                         be CNC or metal-stamped depending
                                         on 100-unit vs. future-scale cost
Polish/finish   PCBWay finishing        Mirror-polish front plate; bead-
                options                  blast back shell
```

DFM note: keep the board round or square-with-rounded-corners to match the
40mm puck — PCBWay's standard PCBA flow handles non-rectangular boards fine,
just flag panel-utilization in the quote request (irregular shapes waste
panel area and raise unit cost at low volume).

================================================================================

## 04 — 100-UNIT PRODUCTION RUN (item 13)

```
PHASE  STEP                                          UNITS   NOTES
-----  ----                                          -----   -----
P0     Bench prototype x3                             3      Hand-assembled,
                                                               dev boards, validate
                                                               camera/display/Qi/
                                                               weather-sensor wiring
                                                               before committing Gerbers
P1     PCBWay small-batch PCBA pilot                  10     Validate SMT placement,
                                                               reflow yield, firmware
                                                               flash-and-test jig
P2     Shell pilot (CNC, both finishes)                10     Validate gasket fit,
                                                               window bonding, polish
                                                               durability
P3     Full 100-unit PCBA run                         100    Panelized run at PCBWay;
                                                               order Li-Po cells direct
                                                               from a UN38.3-certified
                                                               battery vendor in parallel
P4     Full 100-unit shell run                        100    CNC (100 units is below
                                                               stamping/deep-draw MOQ
                                                               economics — CNC is
                                                               correct at this volume;
                                                               revisit stamping only if
                                                               a run beyond ~1,000 units
                                                               is ever planned)
P5     Final assembly + flash + QC + pair-to-LOT-API   100    Each unit gets a unique
                                                               device_id + operator
                                                               pairing token at this step
                                                               (see connector spec)
```

Estimated all-in cost per unit at 100 units (electronics + shell + assembly
labor, excludes NRE tooling): **$45–$70** for SKU-1. NRE (CNC fixturing,
stencil, pilot iterations) is a one-time cost on top, not per-unit.

================================================================================

## 05 — WIRELESS CHARGING DOCK (items 12, 19)

The puck holds only the Qi **receiver** (P9221 + WE-WPCC coil, §02). The
charger itself is a separate small dock:

```
DOCK          Qi transmitter, TI BQ500211 reference design (or a certified
              off-the-shelf 5W Qi charging pad repurposed with a shallow
              stainless-steel puck-shaped recess so the Cube seats and
              aligns coil-to-coil every time — alignment matters more than
              wattage here since the puck is small and easy to place off-
              center).
FINISH        Matches the Cube's bead-blasted back-shell finish — the dock
              is furniture, not a gadget; it should look like a paperweight
              the Cube rests in, not a charging brick.
```

================================================================================

## 06 — ROADMAP

```
PHASE                          DELIVERABLE                              STATUS
-----                          -----------                              ------
1. Spec (this session)         HW spec + firmware spec + connector      DONE
                                spec, all as separate documents (item 11)
2. Bench prototype (P0 above)  3 hand-built units on dev boards          NEXT
3. Firmware v0.1                See LOT-COMPUTER-FIRMWARE-SPEC.md        NEXT
4. LOT API connector v0.1       See LOT-COMPUTER-CONNECTOR-SPEC.md       NEXT
5. Pilot run (P1-P2 above)      13 units, validate manufacturing         PLANNED
6. PDF manuals                  User manual + assembly manual, generated PLANNED
                                via the existing reportlab pipeline
                                (scripts/generate_badge_pdf_v31.py is
                                the closest live precedent for this repo's
                                PDF toolchain — a new
                                scripts/generate_hardware_manual_pdf.py
                                follows the same pattern)
7. Full 100-unit run (P3-P5)    100 paired, flashed, QC'd units          PLANNED
```

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.20
================================================================================
