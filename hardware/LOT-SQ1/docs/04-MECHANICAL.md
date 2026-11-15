# LOT SQ-1 — Mechanical, Body & Charger

**Document:** LOT-SQ1-04 · **Version:** 0.1 · **Date:** 2026-11-15

## 1. Two-part stainless body

| Part | Material | Process | Finish | Key features |
|---|---|---|---|---|
| **Part 1: Front frame** (face A) | 316L | CNC from 6 mm plate | Fine bead-blast (silver satin), R0.8 edges | 37.6×32.2 glass pocket, Ø4.5 camera aperture, 5×3.5 key slot, BME688 vent Ø1.0 on the bottom edge, 4× M1.2 threaded bosses |
| **Part 2: Back plate** (face B) | 316L | CNC 0.4–0.5 mm skin + perimeter lip | **Mirror polish #8**, laser-etched LOT® mark + serial | 4× counter-bored screw seats, ferrite / battery datum |

* Outer envelope: **40.00 × 40.00 × 5.0 mm** (5.5 EVT), corner radius R3.0, steel wall 0.8 mm.
* Joint: a 0.15 mm polyimide **isolator gasket** around the full seam keeps the two parts electrically separate (antenna slot + option-B charging contacts). IP54 target with a silicone bead.
* Mass estimate: 316L ≈ 8.0 g/cm³ → about 11–14 g for the shell, about 20 g total.

## 2. Face A layout (front)

```
 0 ──────────────────────── 40 mm
 │  ┌──────────────────┐   │  ↑
 │  │  EPD active      │   │  │ 31.8 glass window
 │  │  27.6 × 27.6     │   │  │
 │  └──────────────────┘   │  ↓
 │  ANT  (◉)  •      [▭]   │  ← 6 mm strip: antenna, camera, privacy dot, COPY key
 └─────────────────────────┘
```

## 3. Z-stack

See 03-ROADMAP §2.1. Reference stack for EVT-2 (5.5 mm):
glass 0.4 · OCA 0.1 · EPD 1.0 · coil + ferrite 0.5 · PCB 0.6 / Li-Po 2.0 nested · SMD 0.9 · back 0.4 · gap 0.1.

## 4. LOT Dock (wireless charger)

* A CNC puck Ø60 × 12 mm with a **40.4 × 40.4 × 2 mm cradle** that locates the SQ-1 **face-down**, so the Qi coil lines up with the Tx coil through the glass.
* Inside: an off-the-shelf 5 W Qi Tx board, USB-C input, an LED ring hidden under a frosted rim (charging = slow breathe).
* Felt or TPU liner protects the glass. A magnet pair for alignment is optional, but keep it away from the coil (it would saturate the ferrite).
* Option B (contact Dock): two spring pins touch the front frame and the back plate.

## 5. Drawings to produce (HW-02 / HW-03)

1. STEP of the front frame + back plate (Fusion / FreeCAD) → PCBWay CNC quote
2. 2D drawing with GD&T for the glass pocket and the seam
3. Dock STEP + Tx board mount
