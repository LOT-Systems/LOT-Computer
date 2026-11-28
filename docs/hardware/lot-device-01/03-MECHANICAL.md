# LOT DEVICE-01 — Mechanical Design (2-part stainless body)

**Doc:** HW-03-MECH · **Rev:** A · **Date:** 2026-11-28

## 1. Envelope

- 40.00 × 40.00 mm square. Corner radius R3.0, edge chamfer 0.2 mm.
- Target thickness **5.0 mm** (chip-down board) or **6.0 mm** (module board). See decision gate G-1.
- Material: **316L austenitic stainless**. It is non-magnetic, corrosion-resistant and skin-safe.
- Estimated mass: 22–26 g.

## 2. The two parts

**Part A — back shell (the polished side)**
- CNC-machined as a shallow tray from 316L. The floor is 0.5 mm and the walls are 0.6 mm.
- The outside is mirror polished (#8), with nothing on it: no logos, no holes, no screws. The brand mark is an optional laser micro-etch on the **inside** of the floor (a serial number and "LOT").
- Four internal bosses with M1.2 threads.

**Part B — front bezel (the working side)**
- A 316L frame 0.4 mm thick with a 2.5 mm border, finished brushed or bead-blasted so it reads as "satin" against the mirror back.
- The pocket holds one **35 × 35 × 0.4 mm glass window**. The glass is printed black on the inside except for the screen area and a Ø2.2 mm camera aperture.
- The **Copy button** is a stainless plunger through the bezel at the lower-right edge. It is Ø1.6 mm with an O-ring and travels 0.25 mm.
- The **sensor vent** is a Ø0.6 mm hole in the side wall behind an ePTFE membrane, for the BME688.
- Four countersunk M1.2 Torx screws at the bezel corners hold Part B to Part A.

## 3. Z stack-up (chip-down, target)

| Layer | Z (mm) |
|---|---|
| Glass window | 0.40 |
| Optically clear adhesive / air gap | 0.05 |
| Memory LCD module, with the Qi coil beside it in the same layer | 0.80 |
| Foam / ferrite sheet behind the coil | (in the same layer) |
| PCB 0.6 mm, 4-layer HDI | 0.60 |
| Bottom-side components (max), with the battery beside them | 2.00 (battery 2.0) |
| Adhesive under the battery | 0.10 |
| Part A floor | 0.50 |
| Assembly tolerance | 0.35 |
| **Total** | **4.80** |

The module version adds about 1.2 mm: the ESP32-S3-MINI-1 is 2.4 mm tall and cannot share a layer with the LCD, so the total is **≈ 6.0 mm**.

**Camera:** the module sits in a PCB cut-out under the camera aperture, with the lens up against the glass. It must be **≤ 3.0 mm tall** to fit within glass + LCD layer + PCB + part of the bottom layer. This is the main 5 mm risk, together with battery thickness.

## 4. Layout (top view, working side)

```
 ┌────────────────────────────────────────┐ 40 mm
 │ ┌────────────────────────────────────┐ │
 │ │  ◯ cam            ANT ▭            │ │
 │ │  ┌──────────────────────────────┐  │ │
 │ │  │                              │  │ │
 │ │  │   Memory LCD 144×168          │  │ │  ← Qi coil runs as a
 │ │  │   "Coffee time!"              │  │ │    flat ring around
 │ │  │                 09:41  21°C   │  │ │    the LCD, under glass
 │ │  └──────────────────────────────┘  │ │
 │ │                                     │ │
 │ └────────────────────────────────────┘ │
 │                                    (●) │ ← Copy button (bezel edge)
 └────────────────────────────────────────┘
```

## 5. RF and charging rules (from finding F-1)

1. Nothing that has to transmit or receive (antenna, coil) may sit over the steel. Everything goes under the glass.
2. Keep a 3 mm clearance between the antenna and the bezel inner wall. Tune the matching network on the assembled device, not on a bare board.
3. Put a ferrite sheet (0.1–0.2 mm) behind the coil so the field doesn't reach the PCB and the steel back.
4. Firmware must cut off charging if the board passes 45 °C, because steel near the coil warms up.

## 6. Ordering the CNC parts at PCBWay

1. Export STEP files of Part A, Part B and the plunger. Use units mm and tolerance class ISO 2768-f.
2. Order at PCBWay → Rapid Prototyping → CNC machining, material "Stainless Steel 316L", with these finishes:
   - Part A: "mirror polish" on the outside only. Call out "no tool marks on A-surface".
   - Part B: "bead blast" or "brushed".
3. Add a drawing (PDF) with the critical dimensions: 40.00 ±0.05, floor 0.50 ±0.03, glass pocket depth 0.40 +0.02/-0, M1.2 threads.
4. Order 12 sets for EVT before committing to 110.
