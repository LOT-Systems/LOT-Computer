---
title: "LOT-01 SQUARE — Mechanical Design (2-part Stainless Body)"
subtitle: "Doc 04 · Rev A (2026-11-24)"
---

# LOT-01 — Mechanical Design

## 1. Envelope

* **40.00 × 40.00 × 5.00 mm**, corner radius R3.0, edge chamfer 0.3 × 45°.
* Material **AISI 316L** (low-carbon, medical/watch grade, good mirror finish, low nickel release when passivated).
* Target mass ≈ 22–26 g (steel ≈ 14 g, internals ≈ 10 g).

## 2. The two parts

| Part | Name | Description | Finish |
|---|---|---|---|
| **P1** | Front tray | Four walls (0.6 mm) + front face (0.5 mm) in one CNC part. Window pocket 36.0 × 30.0 mm (0.55 mm deep ledge, 0.6 mm land). Button bore Ø4.2 mm, centred 5 mm above the bottom edge. BME688 vent Ø0.5 mm in the bottom wall (ePTFE membrane inside). Four M1.0 bosses or a weld land | Fine brushed (vertical grain) or bead blast. The brief says "silver", so no colour |
| **P2** | Back plate | Flat 0.5 mm plate, no openings, 0.2 mm step to locate in P1 | **Mirror polish** Ra ≤ 0.05 µm, passivated (ASTM A967), protective film until packing |

Joining options (choose at EVT):

* **A. Screws:** 4× M1.0 × 2 mm from the back. Serviceable, battery can be replaced. The screw heads are visible on the mirror face (countersunk and polished flush).
* **B. Laser seam weld:** perfect mirror surface, sealed. Not serviceable. Polish after welding.
* **Recommendation:** A for EVT/DVT and the pilot of 100 (repairable), B as an option for a later "collector" run.

## 3. Stack-up (Z, front → back)

The 5.0 mm height is met with a **split level**: the battery sits beside the PCB, not under it.

**Zone A: under the display (≈ 30 mm of the height)**

| Layer | mm |
|---|---|
| Sapphire window (sits in the P1 front-face pocket) | 0.50 |
| OCA / gap | 0.05 |
| Memory LCD | 0.75 |
| NFC flex antenna + ferrite sheet (ring) | 0.22 |
| Battery 2.0 × 25 × 30 | 2.00 |
| Clearance for battery swell (≈ 8 %) | 0.18 |
| Back plate P2 | 0.50 |
| **Total / margin to 5.00** | **4.20 / 0.80** |

**Zone B: bottom strip (≈ 10 mm), worst-case column = camera**

| Layer | PCB column | Camera column | Motor column |
|---|---|---|---|
| Sapphire window | 0.50 | 0.50 | 0.50 |
| Gap | 0.10 | — | 0.10 |
| Main PCB | 0.60 | (camera drops through a PCB cut-out) | 0.60 |
| Parts on the back side of the PCB | 1.00 | camera 2.60 + stiffener 0.20 | coin motor 2.00 |
| Clearance | 0.10 | 0.10 | 0.10 |
| Back plate | 0.50 | 0.50 | 0.50 |
| **Total** | **2.80** | **3.90** | **3.80** |

The worst column is 3.90 mm, which leaves 1.10 mm for the P1 face, adhesive and
tolerances. The tightest real constraint is the camera height (≤ 2.6 mm), and it
is checked in risk R1.

Rule: **nothing taller than 1.0 mm on the PCB under the battery.** The ESP32-S3 (0.9),
BME688 (0.93), LSM6DSV16X (0.83) and PMIC (0.6) all pass. The coin motor (2.0) and
camera (≤ 2.6) go in Zone B only.

## 4. Front layout (40 × 40)

```
 ┌──────────────────────────────────────┐
 │ ┌──────────────────────────────────┐ │  ← window 36 × 30 (sapphire)
 │ │ ╭─NFC ring──────────────────────╮│ │
 │ │ │   ┌──────────────────────┐    ││ │
 │ │ │   │  1.28" memory LCD    │    ││ │
 │ │ │   │  23 × 23 active      │    ││ │
 │ │ │   └──────────────────────┘    ││ │
 │ │ ╰───────────────────────────────╯│ │
 │ │  ◉ cam                     ⌁ ant │ │
 │ └──────────────────────────────────┘ │
 │                 ( ● )  COPY          │  ← 316L plunger Ø4.0
 └──────────────────────────────────────┘
```

## 5. Seals and environment

* Window bonded with 0.1 mm structural PSA (3M VHB-class) → IP54 target.
* Button: silicone X-ring around the plunger.
* Vent: Ø0.5 mm hole + ePTFE membrane, so the weather sensor sees outside air while the case stays splash-proof.
* Skin temperature limit while charging: 41 °C (IEC 62368-1 / wearable practice).

## 6. Drawings to produce (S2/S3)

1. `P1_front_tray.step` + 2D drawing with GD&T on the window ledge and button bore.
2. `P2_back_plate.step`, flatness 0.03 mm, finish callout "MIRROR, Ra ≤ 0.05 µm, passivate".
3. `ASSY_stack.step`, the R1 feasibility mock-up.
4. PCBWay CNC order notes: material cert 316L (EN 10204 3.1), 100 % visual inspection of the mirror side, individual protective film.
