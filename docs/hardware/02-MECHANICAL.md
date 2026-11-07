# 02 — MECHANICAL

## Envelope
40.0 × 40.0 × 5.0 mm, corner radius 4 mm, edge chamfer 0.3 mm. Mass target < 35 g (316L ≈ 8 g/cm³; shell ≈ 20 g).

## Two stainless parts
1. **Back plate (Face A)** — 316L, 0.8 mm plate, **mirror polish (#8)**, flat ±0.02 mm. Fully blank.
2. **Frame (Face B)** — 316L, 4.2 mm tall tray with 1.0 mm walls; pocket for PCB/battery; stepped ledge for the glass window; button cut-out on edge.
Joint: laser-weld seam (permanent, IP67) **or** 4× M1.0 micro-screws in the back-plate corners (serviceable; recommended for run #1). Gasket: 0.2 mm silicone.

## Stack budget (Z, mm)
| Layer | mm |
|---|---|
| Back plate | 0.8 |
| Clearance/adhesive | 0.1 |
| Battery (302020) | 2.6 |
| PCB (0.8) + tall parts sharing battery footprint (side-by-side, not stacked) | — |
| Frame tray beneath/around: ESP32 module 2.4, memory LCD 1.0, coil 0.3 | — |
| Window glass 0.5 | 0.5 |
| Frame ledge/adhesive | 0.2 |
| **Total** | **≈4.7–5.0** |
Rule: battery sits beside, not under, the ESP32 module; screen/coil/PCB are laminated in the top 2.2 mm; battery occupies the lower zone. Needs real CAD to confirm — **risk R1**.

## Face B layout (40×40)
Screen 23×23 mm active upper-left; camera Ø1.6 mm pinhole lower-right; button on right edge (side-actuated); antenna end of the ESP32 under glass edge; coil 20 mm Ø centered under glass; LED optional.

## Finish
Back: mirror polish. Frame: bead-blast satin (contrast, fingerprint hiding) or full mirror. Passivate per ASTM A967. Optional DLC none.

## Wireless charging
Coil + ferrite sheet under glass on Face B; charger puck contacts Face B. Steel back must not sit on charger (it'd be shielded). Magnet ring (N52, optional) for alignment — keep ≥8 mm from compass-less IMU or recalibrate.
