================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER
PHYSICAL NOTIFICATION DEVICE — PLAN / BOM / ROADMAP
================================================================================

DOCUMENT    PAGER-SPEC / v1
ISSUE DATE  2026.09.21
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
STATUS      PLANNING — no hardware built yet; all costs are street estimates
SOURCE      S-2 request "LOT Hardware Computer" (routine, 2026-09-21) ·
            grounded in docs/assembly/LOT-GENESIS-v1.md NODE 19 (LOT Terminal)
            and docs/technical/LOT-NODE-0-RIG-SPEC.md (prior hardware precedent)

================================================================================

## 00  WHAT THIS IS

A small stainless-steel puck that sits on a desk or nightstand and receives
short autonomous notifications pushed from the Memory Engine on
lot-systems.com — e.g. "Coffee time!" — the same proactive, context-aware
prompting the software already does, now surfaced off-screen. One physical
control: a **COPY** button. Pressing it sends an acknowledgment signal back
to the operator's **Log** tab on lot-systems.com — "copy" in the radio-pager
sense: message received, logged, done.

This is the first physical SKU under **NODE 19 — LOT TERMINAL**'s Track 2
commercial path (docs/assembly/LOT-GENESIS-v1.md:694-749), which already
names "assembled unit" as a procurement option and defines the M2M intake
protocol this device speaks. LOT Pager does not invent a new backend
contract — it is a battery-powered client of the protocol that already
exists on paper.

    RECEIVE THE PROMPT    SHOW IT ON GLASS    COPY IT BACK    LOG IT

================================================================================

## 01  PHYSICAL DESIGN

Two-part stainless-steel body, both halves the same 40mm x 40mm footprint —
this reconciles the brief's "flat silver square 4x4cm x 5mm" with its "2-part
body" and "one side polished / other side camera+screen+button": read as two
distinct plates, not one 5mm-thick device.

```
FACE A — THE PLATE                       FACE B — THE INSTRUMENT
─────────────────                        ────────────────────────
Polished stainless steel                 Bead-blasted stainless steel
40mm x 40mm x 5mm, flat                  40mm x 40mm x ~12mm, houses:
Mirror finish, laser-etched LOT mark       - camera (notification context)
No seams, no visible fasteners             - display (renders the message)
Mounts to Face B via 4x rare-earth         - COPY button (single control)
  magnets set flush in the corners         - PCB, battery, charge coil
                                            - weather + environment sensor
```

    TOTAL ASSEMBLED DEPTH  ≈ 17mm    FOOTPRINT  40mm x 40mm    WEIGHT  ≈ 70-90g

ENGINEERING NOTE (honest, not hedged): 5mm is real for the polished cap alone
— it is a plate, nothing lives inside it. It is not enough depth for a
camera module, display stack, LiPo cell, Qi receiver coil, and PCB together;
no off-the-shelf combination of those parts fits under ~10mm today. Face B
carries that stack. If a single continuous 5mm body is a hard requirement
later, the camera and battery are the first things to cut — flag to S-2
before committing to tooling.

Magnetic face-to-face mounting (not screws) keeps Face A seamless and lets
Face B be opened for battery service without disturbing the polished side.

================================================================================

## 02  ELECTRONICS — BILL OF MATERIALS / BUYING LIST

All parts below are off-the-shelf ("AI grade" commodity sensors and modules
— nothing custom-fabbed except the enclosure and the PCB). Prices are
per-unit street estimates at low-hundreds quantity; the 100-unit run (§04)
gets distributor break pricing PCBWay/DigiKey/Mouser quote directly.

```
PART                    SPEC / CANDIDATE PART                    SUPPLIER            EST $/UNIT
────                    ──────────────────────                   ────────            ──────────
MCU + CAMERA + WIFI     Seeed XIAO ESP32S3 Sense — ESP32-S3,      seeedstudio.com     $14
                        OV2640 2MP camera + mic on one board.
                        Single part covers spec items 5 + 6.
DISPLAY                 Round TFT, GC9A01 driver, ~1.28" —        adafruit.com /      $9
                        or square IPS ~0.85" if a square face     waveshare.com
                        reads better against Face B's footprint.
ENVIRONMENT SENSOR      Bosch BME280 — temp / humidity /          adafruit.com /      $6
                        pressure breakout. Covers "weather         sparkfun.com
                        sensor" (item 14), off-the-shelf grade.
WIRELESS CHARGE RX      Qi receiver coil + IC (e.g. BQ51013B      mouser.com /        $5
                        class part) — receives from external      digikey.com
                        Qi charging pad (item 19).
BATTERY                 LiPo, 150-250mAh, slim cell to fit        adafruit.com        $4
                        Face B's ~12mm stack.
BUTTON                  Single tactile momentary switch,          mouser.com /        $1
                        metal-capped, panel-mount through          digikey.com
                        Face B — the COPY control (item 16).
FASTENERS / MAGNETS     4x N42 rare-earth disc magnets            mcmaster.com        $2
                        (Face A<->B mount), M1.6 stainless
                        standoffs inside Face B.
ENCLOSURE (CNC)         2x stainless steel plates, CNC-milled,    pcbway.com          $18
                        polished (A) + bead-blast (B) finish.       (CNC service)
PCB FAB + SMT ASSEMBLY  4-layer PCB, ~35mm x 35mm to clear         pcbway.com          $12
                        the 40mm shell, PCBWay assembly (item 1).
─────────────────────   ───────────────────────────────────      ────────            ──────────
PER-UNIT SUBTOTAL (BOM only, pre-labor, pre-charger)                                  ≈ $71
```

WIRELESS CHARGER (accessory, item 12/19): a standard Qi charging puck/stand,
sourced rather than built — e.g. a compact Qi transmitter pad, $10-15/unit
at volume. Bundled with the device, not soldered to it.

Everything above is a named part category with a real supplier domain, not a
guessed product-page link — confirm exact SKU and current price at order
time; component pricing moves.

================================================================================

## 03  LOT API CONNECTOR — HOW IT TALKS TO THE SITE (item 6)

Reuses the M2M intake protocol already specified in NODE 19 rather than
inventing a new one (docs/assembly/LOT-GENESIS-v1.md:718-724):

```
OUTBOUND (site -> device)   Notification dispatch. Device polls on a
                             battery-friendly interval (30-60s awake, deep
                             sleep between) rather than holding a socket
                             open — LOT's existing realtime layer is SSE
                             (docs/technical/... LOT-SYSTEM-OUTLINE.md),
                             built for a browser tab, not a coin-cell client.
                             GET /api/pager/notifications?device_id=...

INBOUND (device -> site)    COPY button press. Reuses M2M intake format 1:
                             { device_id, operator, metric, value, scale }
                             -> metric: "button_press", value: "copy"
                             Lands as a PAGER-ACK: log entry in the
                             operator's Log tab (src/client/components/
                             Logs.tsx) — same append-only log path every
                             other signal in the system already uses.

AUTH                        Bearer <operator_token>, issued at pairing
                             (QR code shown on lot-systems.com, scanned
                             once by a provisioning app or NFC tap).
```

Server-side, this is a new route module (e.g. `src/server/routes/pager-api.ts`)
alongside the existing `api.ts` / `os-api.ts` / `public-api.ts` — not a
rebuild of the backend. No server code has been written yet; this section is
the contract the firmware and software documents (§05, §06) build against.

================================================================================

## 04  MANUFACTURING ROADMAP

```
PHASE  WEEKS   MILESTONE
─────  ─────   ─────────
0      —       Planning complete (this document). DONE 2026-09-21.
1      1-3     Schematic + PCB layout. First prototype PCBs ordered from
               PCBWay (item 1). 3-5 bare boards, hand-assembled.
2      3-5     Enclosure CNC prototype (PCBWay CNC service). Fit-check
               Face A / Face B against the populated board.
3      5-7     Firmware bring-up on prototype (see LOT-PAGER-FIRMWARE.md).
               Camera + display + button + sensor all reading correctly.
4      7-9     Software bridge live in the LOT backend (see
               LOT-PAGER-SOFTWARE.md). First notification sent from
               lot-systems.com, rendered on device glass, end to end.
5      9-11    Pilot batch — 10 units, PCBWay SMT assembly + CNC shells.
               Internal S-2 dogfooding; log every failure as a session
               report, not a private note.
6      11-13   Design lock from pilot feedback. Any BOM part swap recorded
               here as a dated revision, not a silent edit.
7      13-17   100-unit production run (item 13) — PCBWay PCBA + CNC,
               quote at volume. This is the number where PCBWay's
               per-unit pricing meaningfully undercuts the BOM in §02.
8      17-19   PDF manuals produced (§05) — assembly, quickstart, firmware
               flash guide — one PDF per audience, not one combined dump.
9      19+     Launch via LOT Terminal Track 2 "assembled unit" procurement
               (docs/assembly/LOT-GENESIS-v1.md:722) — S-2 operators at
               day-90 clearance are the first eligible buyers.
```

Certification (FCC/CE) is out of scope for the pilot batch (internal units,
not sold to the public) and becomes a Phase 7 gate item once the 100-unit
run is destined for external S-2 operators rather than internal testing —
flagged here so it isn't discovered late.

================================================================================

## 05  PDF MANUALS (item 7) — WHAT GETS PRODUCED, NOT YET PRODUCED

Three manuals, kept separate rather than one combined document, because
their audiences don't overlap:

```
MANUAL                    AUDIENCE            CONTENT
──────                    ────────            ───────
LOT-Pager-Assembly.pdf    Builder / PCBWay     Exploded view, torque/fit for
                           assembly line        the magnetic mount, BOM with
                                                 exact ordered SKUs (§02
                                                 locks these at Phase 1).
LOT-Pager-Quickstart.pdf  Operator             Pairing (QR scan), first
                                                 notification, what the COPY
                                                 button does, charger use.
LOT-Pager-Firmware-       Firmware maintainer  Flash procedure, OTA update
  Flash.pdf                                     path, recovery if bricked.
```

None of these exist yet — no photography, no exploded CAD, no prototype to
photograph. They are Phase 8 deliverables (§04). Do not fabricate placeholder
PDFs before there is a real device to document; an empty manual for a device
that doesn't exist is worse than no manual.

================================================================================

## 06  SEPARATE DOCUMENTS (item 8, 9, 10, 11)

Per the brief's explicit instruction to keep firmware and software
documentation separate from this plan:

    docs/technical/LOT-PAGER-FIRMWARE.md   — on-device firmware (item 9)
    docs/technical/LOT-PAGER-SOFTWARE.md   — backend connector (item 10)

Each session's planning work is compressed into this spec rather than
re-explained from scratch next time (item 8) — see docs/benchmark/LOT-LEDGER.md
and docs/benchmark/LOT-LEXICON.md, the repo's existing compression layer,
which this hardware program now feeds into under a `PAGER-` prefix.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.21
================================================================================
