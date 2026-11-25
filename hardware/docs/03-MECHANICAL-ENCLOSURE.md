# 03 · MECHANICAL — TWO-PART STAINLESS BODY

```
DOCUMENT  HW-03-MECH      ISSUE 2026.11.25      CLASS INTERNAL / BUILD
```

## 01 · Outline

```
        SIDE B (front: glass face)                      SIDE A (back: mirror)
   ┌────────────────────────────────────┐        ┌────────────────────────────────────┐
   │ ○ cam                         vent·│        │                                    │
   │   ┌────────────────────────┐       │        │                                    │
   │   │                        │       │        │                                    │
   │   │      Coffee time.      │       │        │         316L  #8  MIRROR           │
   │   │                        │       │  40.0  │                                    │
   │   │  15:00 · 21°C · 44%    │       │        │       (no holes, no seams,         │
   │   │                        │       │        │        optional laser mark         │
   │   └────────────────────────┘       │        │        "LOT" 0.02 mm deep)         │
   │                          ( Copy )  │        │                                    │
   └────────────────────────────────────┘        └────────────────────────────────────┘
                   40.0                                          40.0
   Corner radius R4.0 · edge chamfer 0.3 × 45° · height 5.0 (target)
```

Positions (from the top-left corner of Side B, in mm, to be frozen at EVT-1):

| Feature           | Centre (x, y) | Size                         |
|-------------------|---------------|------------------------------|
| Display active area | 20.0, 19.0  | 23.0 × 23.0 (LS013B7DH03)    |
| Camera window     | 5.5, 5.5      | Ø 2.2 clear aperture in the glass print |
| Copy button       | 33.5, 35.0    | Ø 4.0 cap, 0.25 mm travel    |
| BME688 vent       | side wall, top edge, x = 34 | Ø 0.8 hole + ePTFE membrane |
| Antenna keep-out  | right glass border, 3 mm wide | no metal above chip antenna |

## 02 · The two parts

**Part A — back shell (Side A).** A machined cup: 0.6 mm floor, 0.8 mm walls,
inner pocket for the battery. The outside face is mirror-polished to #8
(Ra < 0.05 µm). The polished face has no holes at all. This is the "flat
silver square" when the TILE lies face-down on a table or on its dock.

**Part B — front frame (Side B).** A machined ring, 0.8 mm walls, 0.5 mm glass
ledge, bead-blasted (fine glass bead, satin silver) so it reads as a
different silver from the mirror. It holds the cover glass, the Copy button
bore and the side vent.

**Joint.** The parts meet at a single parting line 1.2 mm below the glass
face. Two options, decided at EVT-1:

| Option              | How                                                        | Pro                     | Con                          |
|---------------------|------------------------------------------------------------|-------------------------|------------------------------|
| J1 Screws (default) | 4 × M1.0 × 2.5 through Part B corners into Part A bosses   | Serviceable, battery replaceable | Screw heads visible on Side B |
| J2 Bonded           | Press-fit lip + 0.2 mm PSA gasket                          | Seamless, IP54-class    | Opening = destructive        |

Recommendation: **J1 for EVT and the 100-unit run.** First units will need
reopening.

## 03 · Stack-up (Z budget, top = glass face)

| Layer                           | mm     | Running |
|---------------------------------|--------|---------|
| Cover glass                     | 0.55   | 0.55    |
| OCA / air gap                   | 0.10   | 0.65    |
| Memory LCD                      | 0.74   | 1.39    |
| NFC-WLC flex coil + ferrite     | 0.25   | 1.64    |
| Main PCB (0.6 mm HDI)           | 0.60   | 2.24    |
| Tallest bottom-side part / battery (1.6) + foam 0.1 | 1.70 | 3.94 |
| Clearance                       | 0.10   | 4.04    |
| Part A floor                    | 0.60   | 4.64    |
| Tolerance stack (±)             | 0.30   | **4.94** |

The **camera** module (~2.8–3.2 mm tall with lens) cannot stack. It sits in a
cut-out in the PCB and battery footprint, in the top-left corner, resting on
the Part A floor and looking up through the glass window. This is the
critical detail: confirm module height at EVT-0. If the chosen camera is
> 3.4 mm, go to 6.0 mm height (risk R1, doc 08).

The ESP32-S3-PICO-1 (7 × 7 × ~1.1 mm) goes on the **bottom** side of the PCB,
beside the battery, not under the display. That keeps the top side flat for
the coil and display.

## 04 · Radio and power through steel

- Steel faces carry no antenna or coil. The chip antenna sits at the PCB edge
  under the **glass border** on the right, with a 3 mm metal keep-out in Part B
  (the frame is relieved under the glass there, glass extends to the edge).
- Expect −6 to −10 dB of antenna efficiency compared with a plastic product.
  Wi-Fi at home distances is fine; check range at EVT-1 (test plan in doc 09).
- The charging coil sits under the display, with ferrite behind it to shield
  the PCB and battery. The TILE charges **face-down** on the dock: glass on
  the dock, mirror up.

## 05 · Manufacturing the body

| Step                  | Where                                   | Notes |
|-----------------------|-----------------------------------------|-------|
| CNC 5-axis 316L       | PCBWay CNC service (upload STEP) or a watch-case shop (Dongguan / Shenzhen) | 100 sets is small: CNC from bar, no forging |
| Mirror polish Side A  | Same supplier, "mirror polishing" option | Ask for #8, protective film before shipping |
| Bead-blast Part B     | Same supplier                           | Mask glass ledge and threads |
| Laser mark            | Supplier fibre laser                    | "LOT" on Side A (optional), "Copy" on button cap, serial on inner wall |
| Passivation           | ASTM A967 citric                         | Required for skin contact, corrosion |
| Glass                 | Cover-glass supplier                     | 0.55 mm, chemically strengthened, black silkscreen border, IR/AR, camera hole as clear print window (no drilled hole) |

Order sheet for PCBWay CNC:

```
Material          316L stainless steel
Process           CNC milling, 5-axis
Qty               10 (EVT) → 110 (production, 10 spares)
Tolerance         ±0.02 mm on glass ledge and button bore, ±0.05 elsewhere
Surface Part A    Mirror polish (#8) outside, as-machined inside
Surface Part B    Bead blast, fine, outside; as-machined inside
Threads           M1.0 × 0.25, 4 places in Part A
Inspection        CMM report on 5 pcs, cosmetic AQL 1.0 on Side A
Files             STEP + 2D PDF drawing with critical dimensions
```

## 06 · Skin, sweat, water

- 316L is the watch-industry steel: low nickel release, passivated.
- Target IP54 with J1 + gasket. The BME688 needs air, so its vent uses an ePTFE
  membrane (air passes, water does not).
- No user-accessible port. Charging is wireless; firmware updates go over Wi-Fi.

## 07 · CAD next actions

1. Build the STEP model in Fusion 360 / Onshape from §01 and §03.
2. Download the 3D models for LS013B7DH03, ESP32-S3-PICO-1, HM01B0 module and
   the chosen battery, and place them in the assembly.
3. Run an interference check, then freeze the PCB outline (DXF to KiCad).
4. Print two SLA resin mock-ups to check feel and 5 mm thickness by hand
   before cutting steel.
