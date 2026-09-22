================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — MECHANICAL SPECIFICATION
2-PART STAINLESS BODY
================================================================================

DOCUMENT    LOT-COMPUTER-MECHANICAL-SPEC
ISSUE DATE  2026.09.22
CLASS       INTERNAL / BUILD

================================================================================

## 00  FORM FACTOR (point 4)

```
FOOTPRINT   40mm x 40mm  (flat silver square)
HEIGHT      5mm target (strict) / 6-8mm buildable-now (see 02)
MATERIAL    Stainless steel, 2 shells (point 3)
```

A coin-and-a-half, flat, sitting face-up on a desk or in a wireless dock.

================================================================================

## 01  TWO FACES (point 17, 18)

```
FACE A — "the quiet side"           FACE B — "the working side"
──────────────────────────          ─────────────────────────
Polished stainless steel            Camera aperture (small, off-center
(point 17). Blank. Mirror           or centered per Phase 2 fit-check)
finish, 304 grade. No visible       Screen window (display sits behind
seam, no branding beyond a          a sapphire or hardened-glass lens
minimal laser-etched LOT mark       bonded to the shell cutout)
(depth <0.1mm, does not break       Button ("Copy" — point 16), flush
the polish plane).                  or near-flush tactile dome under a
This is the side that faces         metal cap bonded to the shell
up when charging — the object       Weather sensor port (a small gas-
reads as a clean object, not        permeable vent, not an open hole —
a gadget, when idle.                keeps the BME680 exposed to ambient
                                     air while staying sealed against dust)
```

FACE A and FACE B are the two halves of the 2-part shell (point 3); they
meet at the 40x40mm parting line, gasket-sealed (see 04).

================================================================================

## 02  HEIGHT BUDGET — THE 5mm PROBLEM, SHOWN IN NUMBERS

```
LAYER                                  STRICT 5mm    BUILDABLE-NOW 6-8mm
─────                                  ──────────    ────────────────────
FACE A shell wall                      0.3mm         0.4mm
FACE B shell wall (incl. lens/vent)    0.3mm         0.4mm
Display module (incl. FPC + glass)     0.8mm         1.2-1.5mm (0.42" OLED)
Camera module (FPC, no lens barrel)    0.8mm         1.5-2.0mm (OV2640 w/ barrel)
Battery (LiPo pouch)                   0.5mm         1.0-1.5mm
Qi receiver coil + PMIC                0.6mm         1.0mm
MCU + passives (flex-PCB, dbl-side)    0.5mm         0.8-1.0mm
Weather sensor die                     0.3mm         0.5mm
Button travel + dome                   0.5mm         0.5mm
Air gap / tolerance stack              0.4mm         0.5mm
                                        ──────        ──────
TOTAL                                  ~5.0mm        ~7.4-8.6mm
```

Reading straight down that column: the strict 5mm path requires EVERY
layer to hit its thinnest available real-world number simultaneously,
with almost no tolerance stack. That is a rev-B target once parts are
sourced individually against exact datasheets, not a rev-A commitment.
The buildable-now path (6-8mm) uses the same component classes at their
commonly-stocked thickness (see BOM 01) and is what PHASE 2 (ROADMAP 04)
actually machines and fit-checks.

This number is why the camera reference part in the BOM is listed as
"board-to-board FPC variant" rather than a standard lensed module — the
lens barrel is usually the single tallest component in the whole stack
after the battery.

================================================================================

## 03  WIRELESS CHARGING DOCK (point 12, 19)

The Qi receiver coil sits directly under FACE A (the polished, blank
side) so the object charges face-down or in a cradle with FACE A resting
against the charging coil — keeping FACE B (camera/screen/button) always
facing the user, even while charging. A flat magnetic alignment ring
(embedded under FACE A, non-visible) centers the object on a standard Qi
puck without requiring a custom dock — any commodity Qi charger works,
though a LOT-branded dock is the intended default accessory.

================================================================================

## 04  SEALING + ASSEMBLY

- FACE A / FACE B join via a compressed silicone gasket at the 40x40mm
  parting line — not adhesive, so the unit can be reopened for repair/
  battery service without destroying the shell.
- 4 concealed screw bosses (one per corner, inset from the edge) draw the
  two faces together and compress the gasket; screw heads sit below the
  FACE A polish plane, capped with a friction-fit stainless plug so no
  fastener is visible from either face.
- The weather-sensor vent (FACE B) uses a PTFE membrane (the same class
  used in phone microphone ports) — gas/humidity permeable, liquid- and
  dust-sealed to roughly an IP54-equivalent level. Full IP rating is a
  Phase 2 test item, not a spec claim yet.

================================================================================

## 05  RF NOTE (carried from BOM 01)

A stainless enclosure attenuates 2.4GHz WiFi/BLE. This spec assumes a
PCB trace antenna with no metal window over it (see BOM 01, ANTENNA line).
Actual range-through-shell is unverified until a real shell exists —
flagged here again because it is a mechanical decision (antenna
placement, shell keep-out zone) as much as an electrical one, and it is
the top open risk in this whole build.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END LOT-COMPUTER-MECHANICAL-SPEC                                     2026.09.22
================================================================================
