================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER
DESK-COMPANION HARDWARE — MECHANICAL + BOM + PRODUCTION ROADMAP
================================================================================

DOCUMENT    LOT-COMPUTER-HARDWARE-SPEC / REV A
ISSUE DATE  2026.09.24
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
SOURCE      S-2 direct brief — "Build a hardware computer connected to the LOT
            site" (19-point logic list), 2026-09-24
COMPANION   docs/technical/LOT-COMPUTER-FIRMWARE-SPEC.md
            docs/technical/LOT-COMPUTER-SOFTWARE-API-SPEC.md
            docs/technical/LOT-COMPUTER-MANUAL-PLAN.md

================================================================================

## 00  PRINCIPLE — WHAT THE LOT COMPUTER IS

A single physical object on a desk that closes the loop the Memory Engine
already runs in software: the site listens, infers, and asks; the LOT
Computer is where an inference can reach the operator without a phone screen,
and where the operator can answer back with one press. It is not a general
computer — it is a **signal terminal**. One short line of AI-authored text
out ("Coffee time!"), one button press in (COPY), both timestamped into the
same Log tab the web app already writes to.

    ONE SCREEN, SHORT TEXT ONLY    ONE BUTTON, ONE SIGNAL    NO NEW SILO —
    EVERYTHING LANDS IN THE EXISTING LOG

This spec covers the metal and the parts. Firmware and the server-side
connector are separate documents by design (point 11 of the S-2 brief) —
distinct documents age and revise independently, and a firmware engineer
should not need to read Fastify route code to do their job.

================================================================================

## 01  INDUSTRIAL DESIGN — THE TWO-PART BODY

```
SIDE A (front)          Mirror-polished 316L stainless steel. No graphics,
                         no seams beyond the perimeter parting line. This is
                         the "off" face — the object reads as a plain silver
                         object when idle, matching brand.lot-systems.com's
                         minimal-object language.

SIDE B (back)            Bead-blasted / satin 316L stainless steel. Houses,
                         flush-mounted:
                           - camera window (sapphire or Gorilla Glass lens
                             cover, anti-reflective coat)
                           - display window (same cover glass, over the
                             Memory LCD — see 02)
                           - one recessed tactile button, laser-engraved
                             cap: COPY

ASSEMBLY                 2-part clamshell: SIDE A and SIDE B are separate
                         CNC shells joined by 4x M1.6 stainless screws into
                         heat-set inserts, with a compressed silicone gasket
                         at the parting line (IP54 — desk object, not a
                         dive watch). No adhesive-only joints — the unit
                         must be openable for battery service and firmware
                         recovery via the debug pads.
```

### FOOTPRINT — THE FLAT SILVER SQUARE

    TARGET (S-2 SPEC):   40mm x 40mm x 5mm
    ENGINEERING REALITY: 40mm x 40mm x 5mm is the footprint of SIDE A alone
                          (the polished cap) at a genuinely flat, coin-like
                          profile. A 5mm total enclosure cannot also hold a
                          camera module, a display, a 300mAh+ cell, a Qi
                          receiver coil, and a 2-layer PCB stack — those
                          parts alone stack past 5mm before a shell exists.

    HONEST REV-A CALL:    40mm x 40mm footprint held exactly as specified.
                          Total height 14-16mm: a 5mm polished SIDE A cap
                          (true to spec, the face the operator actually
                          sees and touches) mated to a 9-11mm SIDE B that
                          carries the electronics stack. The object still
                          reads as "a flat silver square" from the front,
                          on the desk, at rest — which is the design intent.
                          A true 5mm full-thickness Rev-B is a stretch goal
                          gated on a structural-battery PCB and a
                          panel-mount micro camera (see 04, STRETCH).

This tradeoff is PROVISIONAL — mark it, don't paper over it. Re-run this
measurement against real component datasheets once parts are sourced from
PCBWay's SMT partner (see 05); do not treat 14-16mm as final until a
mechanical prototype confirms it.

================================================================================

## 02  BILL OF MATERIALS

Parts below are named by real manufacturer part family so procurement can
search Digi-Key / Mouser / LCSC / PCBWay's own sourcing catalog directly.
No product URLs are included in this document — this session's network
egress does not reach vendor sites, so no link here could be verified as
live; procurement should resolve exact vendor SKUs and current pricing at
purchase time rather than trust a stale link in a spec.

```
#   PART                      CANDIDATE / FAMILY              QTY   EST. UNIT $ (100-unit tier)
--  ----------------------    -----------------------------   ---   ---------------------------
1   MCU / radio               Espressif ESP32-S3 (WROOM-1,     1     $2.20 - $3.50
                               8MB PSRAM) — WiFi 2.4GHz + BLE
                               5.0, camera (DVP) interface,
                               enough headroom for TLS to the
                               LOT API without a co-processor
2   Camera module              OV2640 (2MP) DVP module, or      1     $2.00 - $4.50
                               OV5640 (5MP) if autofocus/higher
                               res is wanted — both are
                               ESP32-camera-standard parts
3   Display                    Sharp Memory LCD LS013B7DH03     1     $8.00 - $12.00
                               (1.28in, 128x128, 1-bit,
                               reflective, ~micro-amp idle) —
                               chosen over OLED for the
                               "pager" use case: always-
                               legible, sunlight-readable,
                               near-zero standby draw
4   Weather / env sensor       Bosch BME280 (temp / humidity /  1     $1.50 - $2.50
                               barometric pressure), I2C
5   Motion / orientation       ST LSM6DSO (6-axis IMU) — desk   1     $1.20 - $2.00
                               tap / pickup detection, wakes
                               the display from sleep
6   Ambient light               Vishay VEML7700 (ambient light  1     $0.60 - $1.00
                               sensor, I2C) — auto-dims the
                               Memory LCD front-light rail
7   Microphone (optional)      Knowles/Infineon IM69D130 or     1     $1.20 - $2.00
                               SPH0645 I2S MEMS mic — ambient
                               ("AI-grade") context only, no
                               always-on recording; firmware-
                               gated, see FIRMWARE-SPEC
8   Wireless charge receiver   TI BQ51013B or ST STWBC-EU Qi    1     $1.80 - $3.00
                               receiver IC + matched coil
                               (Wurth / TDK Qi-BPP coil,
                               ~30mm OD to fit the 40mm shell)
9   Battery                    LiPo, thin-profile, 300-400mAh   1     $2.50 - $4.00
                               (e.g. 042035 or 052035 profile
                               cell family) — sized to the
                               SIDE B cavity from 01
10  Button                     Panasonic EVQ-P (tactile,        1     $0.30 - $0.60
                               IP-rated), custom laser-etched
                               stainless cap reading COPY
11  PCB                        2-layer (Rev A) rigid FR4,       1     PCBWay fab, see 05
                               ENIG finish, PCBWay fab —
                               4-layer if EMI from the Qi coil
                               forces a ground-plane split
12  Enclosure — SIDE A         316L stainless, CNC + mirror     1     PCBWay CNC metal, see 05
                               polish
13  Enclosure — SIDE B         316L stainless, CNC + bead       1     PCBWay CNC metal, see 05
                               blast, machined camera/display/
                               button cutouts
14  Cover glass                Sapphire or Gorilla Glass,       1     $1.50 - $3.00
                               laser-cut to camera + display
                               windows, AR coating
15  Gasket                     Compressed silicone, laser-cut   1     $0.20 - $0.40
                               profile matching parting line
16  Fasteners                  M1.6 stainless screws + heat-    4+1   $0.40 total
                               set brass inserts

ESTIMATED BOM COST (100-UNIT TIER, ELECTRONICS + ENCLOSURE, EX. ASSEMBLY):
    ≈ $24 - $40 per unit, parts only. Assembly, tooling amortization, and
    QC are priced separately in 05.
```

Sensors 4-7 are the "AI-grade off-the-shelf sensors" from the S-2 brief —
the grade is in how the firmware compresses and forwards them (see
FIRMWARE-SPEC 02), not in the silicon itself; every part above is a
standard catalog component, not a bespoke AI chip. Marketing language
should not be allowed to imply otherwise in the manual (see MANUAL-PLAN).

================================================================================

## 03  CHARGER

Two charging paths, both required:

```
IN-BOX             Qi wireless charging puck (off-the-shelf, 5W, matched to
                    the BQ51013B receiver in the BOM). No proprietary
                    connector, no cable that can be lost — the whole point
                    of a desk object is that it never needs to be unplugged
                    to move.

SERVICE / DFU       4-pad pogo-pin debug header inside the shell (accessible
                    only when SIDE A/B are unscrewed) — UART + USB-serial
                    breakout for firmware flashing and battery-dead
                    recovery. Not user-facing; covered in FIRMWARE-SPEC 04.
```

================================================================================

## 04  ELECTRICAL BLOCK DIAGRAM

```
                    +-------------------------------------+
   Qi coil -------> | BQ51013B (Qi RX) -> charge mgmt ->   |
                    | 300-400mAh LiPo -> 3.3V regulator    |
                    +-------------------------------------+
                                    |
                                    v
   Camera (OV2640) <--DVP-->  ESP32-S3  <--I2C-->  BME280 (weather)
                                    |         <--I2C-->  LSM6DSO (motion)
                                    |         <--I2C-->  VEML7700 (light)
                                    |
                          +---------+---------+
                          |                   |
                    SPI: Sharp Memory LCD   GPIO: COPY button
                    (display, "pager" text)  (debounced, wake source)
                                    |
                              WiFi 2.4GHz (802.11 b/g/n)
                                    |
                                    v
                     LOT API connector (see SOFTWARE-API-SPEC)
                                    |
                                    v
                          lot-systems.com  (Log tab, Signal Stream)
```

STRETCH (Rev B, camera + I2S mic together): move sensor fan-out to a
low-power I/O expander (e.g. TI TCA9535) to free ESP32-S3 GPIO count if the
microphone is added — Rev A ships camera+display+3 sensors+button on native
GPIO without an expander.

================================================================================

## 05  MANUFACTURING — PCBWAY, 100-UNIT RUN

PCBWay is used for all three fabrication disciplines under one vendor
relationship, which is the point of naming them first in the S-2 brief —
one supplier, one quote, one QC pass, rather than three vendors to
coordinate across a 100-unit run:

```
STAGE               PCBWAY SERVICE                          RUN QTY
-----               ---------------                         -------
PCB fab              Standard PCB fab (2-layer FR4, ENIG)     100 + 10 spares
PCB assembly (SMT)   PCBA service — turnkey parts sourcing     100 + 10 spares
                      + placement + reflow + AOI
Enclosure (SIDE A/B) CNC machining service, 316L stainless,    100 sets + 10 spares
                      mirror polish (A) / bead blast (B)
Cover glass cutting   Either via PCBWay's partner network or   100 + 10 spares
                      a dedicated glass-cutting vendor if
                      PCBWay's tolerance on optical-clarity
                      glass is insufficient — confirm on
                      first-article sample before committing
                      the full 100-unit glass order
Final assembly + QC   In-house or a contract assembler:         100 units
                      mate SIDE A/B, seat gasket, fasten,
                      pair each unit's API key (see
                      SOFTWARE-API-SPEC 03), functional test
                      (screen on, camera capture, button
                      signal round-trip to a staging Log tab)
```

### SEQUENCE — BUILD ORDER

```
S1   Order 3-5 PCB prototypes + hand-populate for firmware bring-up
     (skip PCBWay PCBA for the prototype pass — hand assembly is faster
     to iterate on).
S2   Firmware bring-up on prototypes: display driver, camera capture,
     sensor polling, WiFi + LOT API connector round-trip, COPY button
     signal — all GREEN before any enclosure is cut (see FIRMWARE-SPEC,
     SOFTWARE-API-SPEC).
S3   Order 1 set of SIDE A / SIDE B shells (CNC, no polish yet) to
     confirm the 01 mechanical tolerances against the real PCB + battery
     + coil stack. Iterate shell dimensions here, not after the 100-unit
     order.
S4   First-article: 5 fully finished units (polish + assembly + glass)
     for a burn-in pass — 72h continuous run, Qi charge cycling, button
     cycle test (rated to 100k presses minimum on the EVQ-P family).
S5   Lock BOM + Gerbers + CNC files. Submit the 100-unit PCBWay order
     (PCB fab + PCBA + CNC enclosures) as one combined quote request.
S6   Final assembly + QC + per-unit API-key pairing on all 100 units.
S7   Package with the printed-or-QR-linked manual (see MANUAL-PLAN) and
     the in-box Qi charging puck.
```

Order matters here the same way it matters in NODE-0 (docs/technical/
LOT-NODE-0-RIG-SPEC.md, section 05): firmware and the API connector are
proven on prototypes BEFORE metal is cut, so a firmware bug never turns
into 100 units of scrap.

================================================================================

## 06  COST ROLL-UP (100-UNIT TIER, ESTIMATE)

```
LINE                          LOW        HIGH        NOTE
----                          ---        ----        ----
BOM (electronics)              $16        $28        table in 02, items 1-10
PCB fab + PCBA                 $6         $12         per unit, 100-qty tier
CNC enclosure (2 shells)       $18        $35         stainless CNC + polish
                                                       is the most expensive
                                                       line — get a real
                                                       PCBWay quote before
                                                       trusting this range
Glass + gasket + fasteners     $2         $4
Final assembly + QC labor      $4         $8
--------------------------     ---        ----
PER-UNIT, LANDED                $46        $87
NRE (tooling, CNC setup,       $2,000     $5,000      one-time, amortize
first-article, firmware bring-                        across the 100-unit
up hours)                                             run or the next one
--------------------------     ---        ----
100-UNIT RUN, ALL-IN            ≈ $6,600    ≈ $13,700  BOM+fab+NRE, ex.
                                                        packaging/shipping/
                                                        duties
```

ESTIMATE — every range above needs replacing with a real PCBWay quote and
a real stainless CNC quote before this number is treated as a budget. Mark
it PROVISIONAL in any external-facing planning doc until first-article
pricing is in hand.

================================================================================

## 07  RELATED / COMPANION DOCUMENTS

```
docs/technical/LOT-COMPUTER-FIRMWARE-SPEC.md      On-device firmware:
                                                   sleep/wake, sensor
                                                   polling, display
                                                   driver, COPY button
                                                   handling, OTA, DFU.
docs/technical/LOT-COMPUTER-SOFTWARE-API-SPEC.md  Server-side LOT API
                                                   connector: device
                                                   pairing, notification
                                                   push, Log tab signal
                                                   ingestion.
docs/technical/LOT-COMPUTER-MANUAL-PLAN.md        PDF manual generation
                                                   (user manual, quick-
                                                   start, service manual).
docs/technical/LOT-NODE-0-RIG-SPEC.md             Precedent hardware doc
                                                   (server rig, not this
                                                   device) — house Terminal
                                                   Grid format source.
docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md
                                                   Existing compression
                                                   logic this device's
                                                   "per-session compress"
                                                   requirement should
                                                   extend, not duplicate.
```

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.24
================================================================================
