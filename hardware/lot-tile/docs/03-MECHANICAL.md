# 03 · Mechanical — Two-Part Stainless Body

## 1. Outline

```
        FRONT (working face)                  BACK (mirror face)
  ┌────────────────────────────┐        ┌────────────────────────────┐
  │ o                        o │        │                            │
  │  ┌──────────────────────┐  │        │                            │
  │  │ ┌──────────┐   ◉ cam │  │        │          ╭──────╮          │
  │  │ │  1.28"   │   · led │  │        │          │ Ø22  │ zirconia │
  │  │ │  memory  │         │  │        │          │ (D1B)│  window  │
  │  │ │   LCD    │  antenna│  │        │          ╰──────╯          │
  │  │ └──────────┘   zone  │  │        │                            │
  │  └──── sapphire 34×24 ──┘  │        │      316L mirror #8        │
  │            ( ● )  COPY     │        │                            │
  │ o                        o │        │ ▪ ▪ pogo (edge chamfer)    │
  └────────────────────────────┘        └────────────────────────────┘
       40.0 × 40.0 mm, R1.5 corners, 0.3 mm × 45° edge chamfer
```

- **Part 1 · Front lid** (316L, 1.0 mm plate): sapphire pocket, Ø6.2 mm button bore, 4 × M1.0 countersunk holes in the corners (visible, a deliberately instrument-like look), ePTFE vent hole Ø0.8 mm near the bottom edge, finish bead-blast or vertical brush.
- **Part 2 · Back tub** (316L, 0.5 mm floor, 0.6 mm walls): outside mirror-polished #8. It holds 4 × M1.0 threaded bosses (or press-in inserts), the two pogo-pin bores on the lower chamfer, and the Ø22 mm zirconia window if decision D1 = B.
- **Joint:** lid sits on a 0.3 mm FIP silicone bead and is closed by 4 screws. Target IP54, rain and sweat. IP67 is not a P1 goal.

## 2. Material and finish

| Item | Spec |
|---|---|
| Alloy | 316L stainless (skin-safe, low nickel release, polishes better than 304) |
| Back finish | Mechanical mirror polish #8, Ra ≤ 0.05 µm; optional anti-fingerprint nano-coating |
| Front finish | Bead-blast #120 or brushed #4; laser-etched "LOT" mark and serial number |
| Tolerances | ±0.02 mm on mating faces, ±0.05 mm elsewhere; flatness 0.03 mm |
| Weight (estimate) | Steel ≈ 22 g + internals ≈ 9 g → **≈ 31 g** |

## 3. Z-stack (5.0 mm build)

Parts are placed side by side as well as stacked: the battery and the radio module sit next to each other under the PCB.

| Layer (front → back) | Battery zone | Module zone | Camera zone |
|---|---|---|---|
| Sapphire window + adhesive | 0.50 | 0.50 | 0.50 |
| Memory LCD | 0.95 | 0.95 | — (camera through a PCB cut-out) |
| Foam / gap | 0.10 | 0.10 | — |
| PCB 4L 0.4 mm | 0.40 | 0.40 | cut-out |
| Underside parts / module | — | 2.40 (ESP32-S3-MINI-1) | camera module 3.0 |
| Gap + battery (swell margin 0.2) | 0.10 + 1.80 + 0.20 | — | — |
| Qi coil + ferrite (D1 = B) | 0.45 | — | — |
| Back floor | 0.50 | 0.50 | 0.50 (rest on floor) |
| **Total** | **5.00** ✔ (0 mm spare) | **4.85** ✔ | **4.00** ✔ |

**Reading the table:** 5.0 mm works, but there is no spare height in the battery zone. A 6.0 mm build (D2) allows a 2.8 mm / ~180 mAh cell and is the recommended EVT build.

## 4. RF and magnetic openings in a steel box

Steel blocks both 2.4 GHz radio and Qi charging. The design keeps three openings:

1. **Antenna zone:** the module's PCB antenna sits under the right-hand strip of the sapphire window, with no copper or ink above it. Target: no more than 8 dB loss compared with open air, measured at EVT.
2. **The seam:** the gasket keeps the lid and tub apart electrically, so the gap can act as a slot antenna. EVT tests both "seam isolated" and "seam bonded".
3. **Charging window:** a Ø22 mm zirconia disc in the back (D1 = B), or no window at all with the pogo dock (D1 = A). See doc 07.

## 5. PCBWay CNC order notes

- Upload STEP + 2D PDF drawings with finish callouts; ask for **316L**, not 304.
- Order **mirror polishing** as a separate finishing line item, with **protective film after polishing**.
- First-article inspection: CMM report on 5 parts per lot.
- Tap M1.0 threads in steel, or use press-in inserts if tapping causes yield problems.
- Laser marking: front logo plus a serial number in the form `P1-0001`.

## 6. Assembly order

1. Bond the sapphire into the lid (3M 9474LE + UV-cure edge seal).
2. Fit the button cap, silicone seal and snap dome (the dome is on the PCB).
3. Fit the Qi coil in the tub (if D1 = B) and stick the battery down with pull-tab adhesive.
4. Place the PCBA, connect the display FPC and the battery JST-SH or solder tabs.
5. Dispense the FIP gasket, close the lid, torque the 4 screws to 0.03 N·m.
6. End-of-line test (doc 08 §4).
