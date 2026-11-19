# 04 · Mechanical: two-part stainless steel body

*Session 01 · 2026-11-19*

## 1. Parts

```
   FRONT FRAME (316L, brushed)          BACK SHELL (316L, mirror #8)
   ┌────────────────────────┐           ┌────────────────────────┐
   │ ┌────────────────────┐ │           │                        │
   │ │  glass pocket 0.6  │ │           │   plain, nothing on it │
   │ │  ○cam  [ LCD ]     │ │    +      │   (serial etched inside)│
   │ │              (●)   │ │           │                        │
   │ └────────────────────┘ │           └────────────────────────┘
   └────────────────────────┘
   40.0 × 40.0, R2.0 corners, 0.3 mm edge chamfer, split line at mid-height
```

| Part | Material | Finish | Critical features |
|---|---|---|---|
| Front frame | 316L | Brushed (unidirectional) or fine bead-blast | 0.60 mm deep glass pocket, Ø6.2 mm button bore, Ø2.0 mm camera aperture in the glass (not the steel), 4 × M1.2 bosses |
| Back shell | 316L | **Mirror polish #8**, optional clear PVD/AF coat | 0.7–0.8 mm skin, internal battery pocket, vent channel to the side seam |
| Glass | Chemically strengthened alumino-silicate, 0.55 mm | Black ink mask outside the LCD window; IR/visible-clear hole for camera | Coil and antenna sit under the masked area |
| Button cap | 316L Ø6.0 mm | Mirror | Silicone gasket, 0.25 mm travel onto SKRP switch |

## 2. Why not all-steel

Steel is a conductor. It **shields 2.4 GHz Wi-Fi** and **absorbs Qi/NFC fields** (eddy currents, heat, charging fails). The rule for this design:

- Every radiating or charging element sits **under the front glass**: chip antenna, Qi coil.
- Keep 3 mm between the antenna and any steel edge. The steel frame stays outside the glass edge.
- The back stays solid steel to keep the polished side clean. That's why charging is from the front (face down on a soft pad) or from the pogo dock.

## 3. Sealing and vents

- Glass bonded to the frame with 0.1 mm PSA (3M 300LSE class). Aim for IP54, not waterproof.
- The BME688 needs air: a **3 mm membrane vent** on an inside channel exits through a 0.4 mm gap at the split line. It's invisible from outside.
- The sensor sits on a PCB "tongue" with slots around it to keep it away from MCU heat. Firmware also corrects for heat (doc 06).

## 4. Assembly order

1. Glass → front frame (PSA, press 10 s, cure 24 h).
2. Button cap + gasket → front frame.
3. PCBA (LCD and coil pre-attached) → front frame, LCD under the glass window.
4. Battery → PCB connector, foam pad.
5. Back shell → 4 × M1.2 Torx (or adhesive ring in DVT).
6. Factory test (doc 09) → laser-etch serial inside back → seal.

## 5. Files to produce (P1–P2)

| File | Tool | Status |
|---|---|---|
| `mech/L01-front.step`, `mech/L01-back.step` | Fusion/Onshape | To do (session 02) |
| `mech/L01-glass.dxf` + ink mask PDF | Fusion | To do |
| 2D drawings with tolerances (±0.02 on pockets) | PDF | To do |

## 6. PCBWay CNC order notes

- Material 316L. Ask for a **mirror-polish first article** before the batch.
- Quantity: 120 back, 110 front (expect polish rejects).
- Tolerance ±0.02 mm on glass pocket; flatness 0.03 mm on back.
- Request a passivation step after machining (ASTM A967) to stop rust spots.
