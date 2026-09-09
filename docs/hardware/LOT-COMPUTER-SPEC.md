================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER
PHYSICAL AI COMPANION — HARDWARE SPECIFICATION
STAINLESS · SILENT · ONE BUTTON
================================================================================

DOCUMENT    LOT-COMPUTER-SPEC v0.1
ISSUE DATE  2026.09.09
CLASS       INTERNAL / CONCEPT-TO-BUILD
STYLE       TERMINAL GRID
STATUS      PLANNING — pre-prototype. Dimensions below carry an open
            engineering risk flagged in §04. Read that section before quoting
            the 5mm figure to a fabricator.

================================================================================

## 00  WHAT THIS OBJECT IS

LOT Computer is a physical companion to the LOT Memory Engine and Quantum
Operating System (QOS) already running at lot-systems.com. It does not run
a model, hold a keyboard, or replace the app. It does one thing the phone
cannot: it sits in a room, in the light, disconnected from a screen you're
staring at, and says the one sentence LOT decided you needed —

    "Coffee time."
    "You're in recovery mode. Sit down."
    "Weather shifted — that's usually when you feel it."

— then goes dark again. A pager, not a dashboard. The single button on the
back does the opposite motion: it pushes a moment back to the site's Log
tab without ever opening a phone. Notice in, notice out, nothing in
between.

    RECEIVE ONE LINE    SHOW IT    LOG ONE TAP    GO DARK

================================================================================

## 01  INDUSTRIAL DESIGN

### FORM

Flat square tile, two-part stainless steel shell, sandwich-assembled around
a single rigid PCB.

    FOOTPRINT     40mm × 40mm (4cm × 4cm)
    HEIGHT        5mm target — see §04 RISK for the real number
    MASS          target ≈ 35–45g (steel-dense, deliberately "too heavy
                  for its size" — the same trick a good watch uses)

### SIDE A — FRONT (mirror face)

Polished stainless steel, one continuous surface. No visible button, no
visible camera, no seams beyond the shell parting line at the edge.
LOT wordmark laser-etched, filled black, matte-on-mirror. This is the side
that sits facing the room — a mirror tile until it lights up.

### SIDE B — BACK (function face)

    - Micro camera lens (flush, small bezel ring)
    - Display window (screen text only — no icons, no chrome)
    - One button: "Copy"
    - Wireless-charging contact zone (no port, no pins)

Bead-blasted or brushed finish on this side, matte — so fingerprints from
daily handling don't show the way they would on the mirror face.

### MATERIALS / FINISH

    SHELL         2× 316L stainless steel shells, CNC-machined
    FRONT FINISH  Mirror polish (Ra < 0.05 µm), laser-etched logo
    BACK FINISH   Bead-blast / brushed, laser-cut lens + window apertures
    JOIN          Precision press-fit + adhesive gasket (IP-rated seam),
                  no visible screws
    WINDOW        Sapphire or hardened glass lens over camera; acrylic or
                  glass over display, both flush with the back face

================================================================================

## 02  ELECTRONICS — THE STACK

```
BLOCK           PART (OFF-THE-SHELF)              WHY THIS PART
─────           ────────────────────              ─────────────
MCU / RADIO     ESP32-S3 (WROOM-1 module)          Wi-Fi + BLE, camera
                                                    (DVP) interface native,
                                                    AI-accelerated instructions
                                                    for on-device tiny ML,
                                                    sub-$3 in volume.
CAMERA          OV2640 (2MP) module                 Smallest common DVP
                                                    camera footprint that
                                                    still gives a usable
                                                    frame; huge supply base.
DISPLAY         Sharp Memory LCD, 1.3"–1.6" mono   Reflective, near-zero
                                                    standby power, readable
                                                    in daylight — matches
                                                    "glance, don't stare."
WEATHER SENSOR  Bosch BME280 (temp/humidity/       I2C, 2.5×2.5mm, the
                pressure)                          reference "AI-grade"
                                                    off-the-shelf env sensor
                                                    — feeds QOS context.
CHARGE IC       Qi receiver IC + coil               Wireless-only by design;
                (e.g. BQ51013B-class)                no port to seal, no
                                                     port to fail.
BATTERY         Thin LiPo pouch cell, 3.7V           Sized last, against
                                                     whatever the 5mm/8mm
                                                     shell decision leaves.
BUTTON          Tactile SMD switch under steel      Single input. "Copy."
                back, laser-cut actuator dot          Nothing else on the
                                                     device takes input.
```

Everything above is chosen to be sourceable off-the-shelf from Digi-Key,
Mouser, or LCSC in the quantities this run needs — see
[`LOT-COMPUTER-BOM.md`](./LOT-COMPUTER-BOM.md) for parts, links, and
100-unit pricing.

================================================================================

## 03  PCB / MANUFACTURING PARTNER

One partner carries the whole physical build: **PCBWay**.

    PCB FAB       4-layer rigid, ENIG finish, ≤ 32mm × 32mm to clear the
                  40mm shell with room for the gasket channel
    PCBA          PCBWay SMT assembly — turnkey, they place and reflow the
                  BOM in §BOM, you receive tested boards
    CNC / SHEET   PCBWay's CNC machining service cuts both stainless shells
    METAL         (front mirror shell, back function shell) from the same
                  order pipeline as the electronics — one vendor, one
                  shipment consolidation point, one QC contact.

This is the reason "PCB Way" is item 1 on the founding list: it is not just
the board house, it is the single manufacturing partner for board, assembly,
and enclosure on a 100-unit run where spinning up three separate vendor
relationships would cost more in coordination than the parts do.

================================================================================

## 04  RISK — THE 5mm HEIGHT

Flag this before anyone quotes a fabricator. Stacked minimum thicknesses of
the parts already chosen:

```
LAYER                                   TYPICAL THICKNESS
─────                                   ──────────────────
Front steel shell                       0.5–0.8mm
PCB (rigid, 4L)                         0.6–1.0mm
OV2640 camera module (bare, no lens
  housing)                              3.5–4.5mm  ← the blocker
Sharp Memory LCD glass module           1.0–1.6mm
LiPo pouch cell (thinnest available)    0.5–1.0mm
Back steel shell                        0.5–0.8mm
```

A 5mm total is achievable for a **sensor-and-screen-only** version (drop the
camera, or use a chip-on-board camera die instead of a housed module — those
exist below 2mm but cost more per unit and need custom lens integration).
With the camera as a standard off-the-shelf module, realistic height is
**8–10mm**, still a flat, pocketable "silver square," just not a coin.

    DECISION NEEDED FROM VADIK BEFORE PCBWay QUOTE:
    (a) Keep 5mm, drop the camera from v1 — ship weather + screen + button,
        add camera in v2 with a bare-die module.
    (b) Accept 8–10mm for v1, ship camera on day one.
    Recommendation: (a) for the 100-unit run — camera is the single highest
    schedule and cost risk item (lens alignment, image pipeline, privacy
    copy for the manual). Ship the pager first, prove the notification loop
    works, add the eye in v2.

================================================================================

## 05  SOFTWARE / SESSION MODEL

    - The device pairs to one LOT account (see
      [`LOT-COMPUTER-API.md`](./LOT-COMPUTER-API.md) for the pairing and
      notification protocol).
    - Every connect cycle, the site returns one **compressed session
      digest** — a single headline string sized for the display, not a
      feed. This reuses the existing Memory Engine compression pattern in
      `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` rather
      than inventing a second compression scheme.
    - The "Copy" button posts one signal. It creates a Log entry the same
      way the web Logs tab does today (`Logs.tsx` / `recordLogSignal`) —
      the device is a second input surface for the same Log table, not a
      parallel system.

See [`LOT-COMPUTER-FIRMWARE.md`](./LOT-COMPUTER-FIRMWARE.md) for the
on-device loop and [`LOT-COMPUTER-API.md`](./LOT-COMPUTER-API.md) for the
server side of that same loop — kept as two documents per the founding
list's instruction to separate firmware docs from software docs.

================================================================================

## 06  RELATED DOCUMENTS

```
LOT-COMPUTER-BOM.md         Full components buying list, supplier links,
                             per-unit and 100-unit costs.
LOT-COMPUTER-ROADMAP.md     Phased build order, concept → 100-unit run.
LOT-COMPUTER-FIRMWARE.md    On-device firmware architecture.
LOT-COMPUTER-API.md         LOT API connector — pairing, notify, Copy→Log,
                             weather ingest, session digest.
LOT-COMPUTER-MANUAL.md      Source for the printed/PDF user manuals.
```

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
CONCEPT SPEC — NOT YET BUILT                                        2026.09.09
================================================================================
