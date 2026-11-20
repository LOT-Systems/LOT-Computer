# LOT-DEVICE-01 · Enclosure & Mechanical

**Doc:** LOT-HW-MECH · Rev A · 2026-11-20

## 1. Form

- Flat silver square, **40.0 × 40.0 mm**, target **5.0 mm** thick, corner radius R4, edge chamfer 0.3 mm.
- **2-part 316L stainless steel** body:
  - **Front frame (ENC1):** CNC, bead-blasted satin edge. It holds the 0.55 mm cover glass on a 0.4 mm ledge.
  - **Back cover (ENC2):** CNC, **#8 mirror polish**, no markings. Any laser mark (serial number, FCC ID) goes inside or on the inner face, or uses e-labelling on screen.
- Joined with 4 × M1.2 Torx screws from the back corners, or a press-fit with die-cut adhesive (decide in EVT). Screws allow service. Press-fit gives the cleaner mirror back.

## 2. Front face layout (40 × 40)

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────┐   ◯    │  ◯ camera window Ø3.0 (HM0360)
│  │                          │        │
│  │   Sharp Memory LCD       │        │
│  │   128×128 · 1.28"        │        │
│  │   "Coffee time."         │        │
│  │                          │   ●    │  ● Copy button (Ø5 steel cap
│  └──────────────────────────┘        │      over SW1, 0.2 mm travel)
│                          · vent (edge)│  · BME688 vent with ePTFE membrane
└──────────────────────────────────────┘
  Qi Rx coil + 2.4 GHz antenna sit UNDER the glass (behind / beside the LCD)
```

## 3. Height stack-up

| Layer | Stacked (EVT) mm | Side-by-side (DVT target) mm |
|---|---|---|
| Cover glass | 0.55 | 0.55 |
| Optical adhesive | 0.10 | 0.10 |
| Memory LCD | 0.75 *(verify datasheet)* | 0.75 |
| Qi coil + ferrite sheet | 0.60 | 0.60 |
| PCB 0.6 + tallest parts 0.9 | 1.50 | — (beside battery) |
| LiPo cell | 2.00 | 2.00 (PCB strip runs beside it) |
| Foam / tolerance | 0.00 | 0.50 |
| Back wall (316L) | 0.50 | 0.50 |
| **Total** | **≈ 6.0** | **≈ 5.0** |

**Analysis:** 5.0 mm only works if the PCB and battery sit **side by side** in the same layer. That means a ~12 × 38 mm PCB strip next to a ~20 × 30 mm cell (~80 mAh). EVT uses the easier stacked 6.0 mm build to prove function. DVT moves to 5.0 mm.

The camera module (≤ 3 mm) sits on the PCB strip under its glass window. Total height there is glass + 3.0 + back ≈ 4.1 mm, which fits.

## 4. RF and wireless charging through steel

- Stainless steel blocks 2.4 GHz and Qi fields. The **only RF and power window is the front glass**.
- The Qi coil sits behind the Memory LCD (a glass panel with no metal backplate). Ferrite goes on the PCB side. The user charges the device **face-down** on the puck.
- The flex antenna (Molex 146153) sits at the glass edge on the side away from the coil, with ≥ 3 mm clearance from the steel frame. Tune it with the steel frame installed.
- EVT test: measure Qi efficiency and Wi-Fi RSSI with the stainless sample plate (Stage A BOM) in place.

## 5. Sensors and environment

- The BME688 sits on an edge, thermally isolated from U1 and the battery by board slots, behind a Ø1.0 mm vent with an ePTFE membrane (IP54 goal).
- Take a reading before each Wi-Fi burst (cold board). Correct for self-heating in firmware.

## 6. Finishes and QA

| Part | Finish | QA check |
|---|---|---|
| Back | #8 mirror, Ra ≤ 0.05 µm | No orange-peel, no swirl under a 5000 K light |
| Frame | Bead-blast #120 satin | Uniform matte, no tool marks |
| Glass | AR coat, black mask, camera window clear | Alignment ±0.1 mm |
| Assembly | Flatness ≤ 0.05 mm, total height ≤ 5.0 + 0.1 mm | Height gauge, 100 % of units |

## 7. CAD deliverables (next sessions)

- `hardware/lot-device-01/mech/` will hold the parametric CAD (FreeCAD/OpenSCAD) for front frame, back cover, glass and charger puck, plus STEP exports for the PCBWay CNC quote.
