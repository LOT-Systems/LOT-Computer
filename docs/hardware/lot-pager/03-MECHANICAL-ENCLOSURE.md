---
title: "LOT PAGER — 03 · Mechanical: Two-Part Stainless Steel Body"
subtitle: "Hardware programme HW-01 · Rev 0.1 · 2026-11-17"
---

# LOT PAGER — 03 · MECHANICAL · TWO-PART STAINLESS STEEL BODY

```
DOCUMENT   HW-01 / 03-MECH
ENVELOPE   40.00 × 40.00 × 5.00 mm · corner radius 4.0 mm · edge chamfer 0.3 mm
MATERIAL   AISI 316L stainless steel (both parts)
MASS       ≈ 38 g target (steel ≈ 30 g + internals ≈ 8 g)
```

## 1 · The two parts

| Part | Role | Finish | Features |
|------|------|--------|----------|
| **A · Back plate** | The "silver square" face | **#8 mirror polish**, no openings | 0.5 mm floor, 4 screw bosses or bonding ledge, laser-etched LOT® mark + serial on the inside |
| **B · Front frame** | Side walls + front face | Fine bead-blast (satin silver) | 0.6 mm front, glass pocket 0.4 mm, Ø 4 mm button bore, 0.5 mm vent hole in side wall, Qi + antenna window |

Parts join at a **step lap** on the side wall at z = 0.5 mm, hidden in the
chamfer line, so the device reads as one silver square.

## 2 · Z-stack budget (front → back)

| Layer | Thickness (mm) | Notes |
|-------|----------------|-------|
| Front frame face / cover glass (flush) | 0.60 | glass 0.40 in 0.40 pocket, 0.20 steel lip around window |
| Display / Qi coil / top-side parts (same layer) | 0.75 | LCD 0.745; coil ≤ 0.6; top-side parts ≤ 0.75 |
| PCB | 0.60 | 4-layer FR-4 |
| Battery / bottom-side parts | 2.00 | LiPo ≤ 2.0 mm, PSA-mounted |
| Clearance + PSA | 0.10 | swelling allowance |
| Back plate | 0.50 | polished |
| **Total** | **4.55** | **margin 0.45 mm to 5.00** |

Camera module (2.5–3.5 mm) passes **through a PCB cut-out**; at the camera XY the stack is
front 0.60 + camera ≤ 3.50 + back 0.50 = **4.60 mm**. The battery sits beside the camera, not under it.

## 3 · Front layout (Side B, viewed from front, 40 × 40)

```
 ┌────────────────────────────────────────┐
 │  ┌──────────────────────────────────┐  │  ← glass window (black mask outside active area)
 │  │   SCREEN  160×68  (32 × 14 mm)   │  │
 │  └──────────────────────────────────┘  │
 │                                        │
 │   (●)        ╭──────────╮        [■]   │
 │  CAMERA      │ Qi coil  │       COPY   │  ← steel button cap, Ø 4 mm
 │  Ø 3 mm      │  Ø 20    │      button  │
 │  aperture    ╰──────────╯              │
 │                          ··· antenna   │  ← under glass edge
 └────────────────────────────────────────┘
                                       ◦ vent (side wall)
```

The glass window covers screen, coil, camera and antenna; the COPY button is a
**separate steel cap** through the frame so it feels like metal, not glass.

## 4 · Why the coil and antenna are on the front (risk R1)

Stainless steel is a poor conductor compared to aluminium, but it still turns a
Qi field into eddy-current heat and blocks 2.4 GHz radio. A solid polished back
cannot pass power or Wi-Fi. Therefore:

- **Charging is face-down**: the glass side rests on the pad, the polished side faces up.
- The **Qi coil** has a ferrite sheet behind it to protect the battery and PCB from the field.
- The **antenna** keeps ≥ 3 mm from steel walls under the glass edge; EVT measures range.
- **Fallback** if EVT fails: two flush pogo contacts in the back plate and a magnetic puck.

## 5 · Sealing, vent, thermal

- Target **IP54**: gasket at the step lap, glass bonded with a 0.1 mm PSA ring.
- BME688 vent: Ø 0.5 mm laser-drilled hole in the side wall with an ePTFE membrane inside, and a 3 mm air channel to the sensor.
- Thermal: read sensors **before** Wi-Fi; firmware does this. During Qi charging the reading is flagged.

## 6 · Drawing package to produce (S2)

1. STEP of both parts (Fusion 360 / Onshape), GD&T on the step lap and glass pocket.
2. Finish callouts: back #8 mirror (Ra ≤ 0.05 µm), front bead-blast #120 glass bead.
3. Laser-etch artwork (LOT® mark, serial `LP-0001…0100`) — brand assets from brand.lot-systems.com.
4. Glass drawing: outline, mask, IR/camera aperture, 0.4 mm CS glass.
