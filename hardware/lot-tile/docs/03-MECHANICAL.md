# 03 · Mechanical: Two-Part Stainless Body

**Doc:** LOT-HW-01-MECH · **Rev:** A (2026-11-14)

## 1. Architecture

Two machined 316L stainless parts (304 is acceptable for EVT, quote both):

```
  ┌──── Part B: FRONT BEZEL (0.6 mm face, brushed) ────┐
  │  cover glass GL1 0.4 mm, bonded in a 0.3 mm recess  │
 ═╧═══════════════════════════════════════════════════╧═  gasket + PSA
 ║◄ M1.0                                         M1.0 ►║  side-wall screws
 ║   PCB + display + camera + battery                  ║  (2 per side)
 ╚═══ Part A: BACK TRAY (floor 0.6 mm, #8 mirror) ═════╝
          └── Ø 26 mm window: GL2 NCVM glass 0.5 mm ──┘
```

- **Part A, back tray:** floor and four walls machined from one block. Outer corner radius R4, edge chamfer 0.3 mm.
  Mirror polish #8 on the floor. Walls are brushed in the vertical direction. Laser-etched LOT® mark and serial on the floor, which is *outside*.
- **Part B, front bezel plate:** a 40 × 40 mm plate with apertures for the display window, camera and Copy key.
  The cover glass covers the display and camera. The Copy key is a separate steel cap in its own pocket.
- **Joining:** 4 × M1.0 × 2.5 Torx T3 screws run *horizontally* through two opposite side walls (2 per side), countersunk and
  flush, into tapped tabs on the bezel. No screw heads appear on either face, so the mirror back and the front stay clean.
- **Seal:** die-cut 0.15 mm gasket with PSA between the parts. Target IP54 (splash and dust).

## 2. Front face layout (40 × 40 mm)

```
 x→ 0                                            40
 y  ┌──────────────────────────────────────────────┐
 ↓  │ 2.0                                          │
    │   ┌──────────────────────────────────────┐   │
    │   │  DISPLAY active ~ 27.5 × 11.7 mm      │   │  (outline ≈ 30 × 18, verify)
    │   │  160 × 68 px                          │   │
    │   └──────────────────────────────────────┘   │
    │                                              │
    │    ◯ Ø 3.0 camera                ┌───────┐   │
    │    lens clear zone Ø 4.0         │ COPY  │   │  key 9 × 6 mm
    │                                  └───────┘   │
    │  ▫ BME688 vent (side)  ▫ LTR-303 (ink window)│
    └──────────────────────────────────────────────┘
```

The camera and the ALS sit under the cover glass, which has an IR-transparent ink window for the ALS and a clear hole in the print for the camera.
The BME688 vents through a 0.8 mm hole in the side wall, sealed with an ePTFE membrane, so the reading reflects ambient air, not air trapped in the case.

## 3. Z-stack budget: 5.0 mm is a stretch target

| Layer | EVT (module) mm | DVT (chip-down) mm | Notes |
|-------|---------------:|-------------------:|-------|
| Back floor (316L) | 0.60 | 0.50 | ≤ 0.5 mm risks oil-canning on a 40 mm span. Add a rib |
| Qi coil + ferrite (TDK WR202010) | 0.90 | 0.70 | Thinner Würth or Sunlord coils exist. Verify efficiency |
| Battery | 3.00 (303030) | 1.60 (custom) | Largest single lever |
| Air / swell allowance | 0.20 | 0.10 | LiPo swells ~8 % over its life |
| PCB 4-layer | 0.60 | 0.40 | 0.4 mm is HDI-class at PCBWay |
| Tallest component on PCB | 2.40 (S3-MINI module) | 0.90 (QFN56) | The LRA (2.5 mm) and camera (≤ 2.5 mm) sit in a PCB **cut-out** beside the battery, not on top of it |
| Display (Memory LCD) | 0.95 | 0.95 | Mounted to the bezel. Overlaps the module height zone, only if beside it |
| Cover glass + front plate | 0.60 | 0.50 | |
| **Total (with parallel stacking)** | **≈ 6.5** | **≈ 5.0** | The components that run in parallel (camera, LRA) are not summed |

**Conclusion.** 5.0 mm needs a chip-down ESP32-S3, a custom 1.6 mm cell and a PCB with cut-outs. EVT is planned
at 6.5 mm so the electronics can be validated with off-the-shelf, pre-certified parts. DVT then thins it. (Decision **D-2**.)

## 4. Finishes and the silver look

| Surface | Finish | Spec |
|---------|--------|------|
| Back floor | Mirror #8 | Ra ≤ 0.05 µm, no orange-peel, no swirl visible at 30 cm |
| Qi window GL2 | NCVM mirror silver on 0.5 mm strengthened glass | Sheet resistance > 10 MΩ/□ (non-conductive), colour matched to polished 316L, ΔE ≤ 2 |
| Walls | Fine brushed (#4) | Vertical grain |
| Front bezel | Bead-blasted satin or brushed | Contrast to the mirror back |
| Laser marks | Black anneal marking (no ablation) | LOT® mark, "LOT TILE", serial and FCC ID on the back floor |

## 5. RF windows: required for Wi-Fi

A steel box is a Faraday cage. The Wi-Fi antenna (the module's PCB antenna in EVT, the chip antenna in DVT) **must sit under
the front cover glass**, in the band between the display and the camera, with ≥ 3 mm keep-out from the steel. Plan an antenna
tuning pass on EVT units in the closed enclosure. The Qi window on the back is a second, smaller RF opening.

## 6. Thermal and safety

- Qi heats steel near the coil. The window must be ≥ 3 mm larger than the coil's outer diameter, and the BQ51050B NTC must read the coil area.
  Charge is stopped above 45 °C at the cell.
- The battery sits in a die-cut PET/foam pocket with a 0.2 mm swell gap. It never touches a screw boss.

## 7. CAD deliverables (next session)

- `cad/lot-tile-back-tray.step`, `cad/lot-tile-front-bezel.step`, `cad/lot-tile-assy.step`
- 2D drawings with GD&T for PCBWay CNC: flatness of the back floor 0.03 mm, wall perpendicularity 0.05 mm
- Cover-glass drawing with print layers (black mask, IR ink window, camera clear zone)
