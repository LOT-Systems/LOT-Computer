<!--
  LOT SYSTEMS CORPORATION
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT-01 — MECHANICAL: TWO-PART STAINLESS STEEL BODY
================================================================================
DOCUMENT    HW-03 / MECH
ISSUE       2026.11.12 · REV A
MATERIAL    AISI 316L stainless steel (marine grade, low-nickel-release finish)
VENDOR      PCBWay CNC machining + polishing
================================================================================
```

## 1 · OUTSIDE

| Item              | Value                                                   |
|-------------------|---------------------------------------------------------|
| Footprint         | 40.00 × 40.00 mm, corner radius R4.0                     |
| Height            | 5.0 mm target (DVT) · 6.0 mm EVT                         |
| Edge              | 0.3 mm × 45° chamfer on both faces                       |
| Back (side A)     | Solid 316L, **mirror polish #8 (Ra ≤ 0.05 µm)**, no holes, no text (optional laser mark inside only) |
| Front (side B)    | 316L bezel plate with glass window + COPY button bore    |
| Mass (est.)       | 38–45 g                                                  |

```
 FRONT (side B)                               SECTION A-A (EVT 6.0 mm)
 ┌────────────────────────────────────┐
 │ ┌────────────────────────────────┐ │       glass 0.55 ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 │ │ ◯ cam                          │ │       adhesive 0.10
 │ │      ┌──────────────────┐      │ │       LCD 0.75 ─────────────
 │ │      │   memory LCD     │      │ │       Qi coil + ferrite 0.55
 │ │      │   23 × 23 active │      │ │       PCB 0.60 ════════════════
 │ │      └──────────────────┘      │ │       battery 2.00 / parts 1.0
 │ │  glass window 32 × 30 mm       │ │       back wall 0.50  ▁▁▁▁▁▁▁▁▁ mirror
 │ └────────────────────────────────┘ │
 │                              ( ● ) │ ← COPY button Ø 4.5 mm, steel cap
 └────────────────────────────────────┘
   bottom strip 8 mm: steel, holds button + BME688 vent slot (edge)
```

## 2 · THE TWO PARTS

**Part 1 — Back cup (mirror side).** Machined from solid 316L. Floor
0.50 mm (EVT) / 0.40 mm (DVT), walls 1.2 mm. Four M1.2 threaded bosses in the
corners (blind, do not break through the mirror face). Internal pocket for
battery with 0.1 mm clearance. Polished **after** all machining; ships with
protective film on.

**Part 2 — Front bezel plate.** 316L, 0.8 mm thick at the face, with:
- glass window 32 × 30 mm, 0.3 mm ledge for the cover glass;
- COPY button bore Ø 4.6 mm with a 0.2 mm step to retain the cap;
- vent slot 0.4 × 3 mm on the bottom edge (behind it: GORE vent → BME688);
- four counter-sunk holes for M1.2 Torx screws.

**Seam.** A 0.3 mm PEEK gasket between the two parts. It seals the joint and
breaks the steel loop so 2.4 GHz energy can leave through the seam. Do not
replace it with a metal shim.

## 3 · Z-STACK BUDGET

| Layer                          | EVT (mm) | DVT (mm) | How DVT gets thinner                    |
|--------------------------------|----------|----------|-----------------------------------------|
| Cover glass                    | 0.55     | 0.40     | 0.4 mm chemically strengthened glass    |
| Optical adhesive               | 0.10     | 0.05     | OCA film                                |
| Memory LCD                     | 0.75     | 0.75     | — (verify actual on datasheet)          |
| Qi coil + ferrite              | 0.55     | 0.45     | thinner ferrite sheet                    |
| PCB                            | 0.60     | 0.40     | 4-layer 0.4 mm HDI                       |
| Battery (beside electronics strip) | 2.00 | 1.60     | 1.6 mm cell, lower capacity (~ 65 mAh)   |
| Back floor                     | 0.50     | 0.40     | thinner floor + rib                     |
| Tolerances / air               | 0.95     | 0.95     | —                                        |
| **Total**                      | **6.00** | **5.00** |                                          |

The camera module (≤ 3.0 mm) cannot sit on top of the PCB at 5.0 mm. It
drops into a **cut-out through the PCB** and is held by its FPC, lens
directly under a clear window in the glass ink mask.

## 4 · CNC + FINISH SPEC FOR PCBWAY

| Field                  | Back cup                    | Front bezel                     |
|------------------------|-----------------------------|---------------------------------|
| Material               | SS 316L bar                 | SS 316L plate                    |
| General tolerance      | ISO 2768-f                  | ISO 2768-f                       |
| Critical tolerance     | Pocket depth ±0.02          | Glass ledge ±0.02, flatness 0.03 |
| Threads                | M1.2 × 0.25, depth 2.0      | —                                |
| Outside finish         | Mirror polish #8            | Bead blast fine **or** brushed (inventor's choice) |
| Inside finish          | As machined                 | As machined                      |
| Marking                | Laser inside: "LOT-01 · S/N" | none                             |
| Packing                | Protective film, individual bag | individual bag                |
| Inspection             | CMM first article ×3, then 10 % sampling | same                 |

Files to send: STEP (both parts), 2D PDF drawing with tolerances and finish
callouts. CAD is the next deliverable (see roadmap, session 02).

## 5 · LOT DOCK (charger)

Ø 50 × 8 mm 316L polished ring, 1.0 mm ceramic or glass top, Qi TX coil
directly under the top. The device lies **face-down** (glass to glass). A
shallow 0.3 mm recess 40.4 × 40.4 mm in the top centers the device so the
coils line up. USB-C on the side. Silicone ring on the base.

## 6 · RULES

1. No metal over the Qi coil, on either the device or the Dock.
2. No metal within 3 mm of the chip antenna except the PCB ground it needs.
3. The mirror back never gets a hole, logo cut or screw head.
4. Polish is the last machining step. Film stays on until packing.
