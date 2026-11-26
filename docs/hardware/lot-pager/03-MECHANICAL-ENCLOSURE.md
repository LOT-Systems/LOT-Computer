<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 03 · MECHANICAL AND ENCLOSURE

```
DOCUMENT   HW-03 / MECHANICAL
ISSUE      2026-11-26 · rev 0.1
MATERIAL   AISI 316L stainless steel (body), zirconia (inlay), aluminosilicate glass (front)
ENVELOPE   40.0 × 40.0 × 5.0 mm target  ·  ≤ 6.0 mm EVT-1 acceptance
MASS       ~28–34 g estimate (steel dominates)
```

## 00 · TWO PARTS

```
SECTION A–A (not to scale)

   glass 0.55 ─┐   key cap ─┐   camera lens ─┐
 ══════════════╧════════════╧═══════════════╧═══  ← FRONT FRAME (part 1), 316L, wall 1.2
 ║  LCD 0.8 │ FPC │  dome  │ cam module 3.2 │  ║
 ║──────────── PCB 0.6 (4L HDI) ─────────────── ║
 ║  BATTERY 202030 · 2.0   │ ESP32-S3-MINI 2.4  ║
 ║  Qi coil + ferrite 0.55 │                    ║
 ═══════════════════( inlay )═══════════════════  ← BACK PLATE (part 2), 316L mirror, 0.4
```

| Part | Name | Process | Finish | Features |
|------|------|---------|--------|----------|
| P1 | **Front frame** | 5-axis CNC from a 316L bar | Bead-blast (#120 glass) or fine brushed, silver | Glass pocket with 0.3 mm ledge; Ø5.2 key bore; camera bore Ø2.2; 0.6 mm step lip around the rear opening; PCB bosses inside; antenna keep-out at the top edge (glass extends 4 mm past the display there) |
| P2 | **Back plate** | CNC from 0.6 mm stock, then lapped and **#8 mirror polished** | Mirror, Ra ≤ 0.05 µm | Ø18.2 inlay bore; 0.4 mm final; no holes, no visible fasteners; laser-etched "LOT" + serial at 0.02 mm depth |

**Joint:** the back plate drops into the frame's step lip and is bonded with a
3M VHB 5952 die-cut ring (0.25 mm). The polished face has no fasteners. The PCB is held by
2× M1.2 Torx T2 screws into the internal bosses of the frame, so no screw is visible from outside.
The design can be serviced: warm the back to 70 °C, lift it with a suction cup at the inlay,
and fit a new VHB ring.

**Water resistance:** IP54 target, which covers splash and sweat. The ePTFE vent over the
BME688 keeps the sensor exposed to ambient air without letting water in.

## 01 · Z-STACK BUDGET (the hard number)

| Layer | mm | Notes |
|-------|----|-------|
| Cover glass | 0.55 | Sapphire 0.40 saves 0.15 mm |
| OCA / air gap | 0.10 | |
| Memory LCD | 0.80 | Verify against the LS013B7DH03 drawing |
| Foam + display frame | 0.10 | |
| PCB | 0.60 | 4-layer HDI |
| Battery 202030 | 2.00 | Components on the PCB underside must live *beside* the cell |
| Qi coil + ferrite | 0.55 | |
| Back plate | 0.40 | |
| **TOTAL** | **5.10** | Over budget by 0.10 mm with zero tolerance → **R-01** |

**Ways to get back to 5.0 mm, in order of preference:**

1. Use sapphire 0.40 mm (−0.15).
2. Bond the display directly into the frame pocket instead of using a display frame (−0.10).
3. Use a 1.5 mm cell, about 60 mAh (−0.5), at the cost of battery life.

**Realistic EVT-1 number: 5.4–5.8 mm.** This is honest, and still the thinnest steel object of
its kind.

**In-plane layout:** the interior is 37.6 × 37.6 mm.

- Display: about 26 × 27 mm, centre-left.
- Camera: 8.5 × 8.5 mm, top-right.
- COPY key: Ø5, bottom-right.
- Underside: the battery (20 × 30) sits next to the ESP32-S3-MINI-1 (15.4 × 20.5). Together they
  are 35.4 mm wide, which fits.
- The module's antenna end points at the top edge, under the glass extension.

## 02 · DECISION D-01 · WIRELESS CHARGING THROUGH STEEL

Qi works by induction at about 110–205 kHz, and a continuous steel back blocks it. The field
induces eddy currents, so the steel heats, the coupling collapses, and the transmitter's
foreign-object detection shuts charging off. This is physics. Better parts will not fix it.

| Option | What | Keeps the polished back? | Truly wireless? | Cost | Pick |
|--------|------|--------------------------|-----------------|------|------|
| **A** | Ø18 mm mirror zirconia **inlay** in the back plate, with the coil behind it. A matched **LOT puck** (Qi TX) with a magnet for alignment | Yes. A polished steel field with a jewel-like ceramic centre | **Yes** | +$5 | **RECOMMENDED** |
| B | Two magnetic pogo pins on one edge, plus a dock | Yes, a 100 % steel back | No (contact) | −$3 | Fallback |
| C | Charge through the front glass | Yes | Yes | — | **Rejected.** The memory LCD has a metallic reflective layer and the PCB copper sits under it |

With option A, the tile charges at about 0.2–0.3 W (0.5 C of 85 mAh), and a full charge
takes about 2 h. Generic phone pads may refuse the small receiver, so **the LOT puck is
the supported charger**.

The inlay also doubles as a second RF window for Wi-Fi/BLE.

## 03 · THE LOT PUCK (charger)

- Ø50 × 8 mm. Aluminium 6061, bead-blasted silver, or 316L to match the tile.
- Contents: a pre-certified 5 V Qi TX module, and an N52 ring magnet centred on the coil.
- The tile carries a small steel or magnet target, offset outside the coil area, so
  that it self-centres on the puck.
- USB-C input and a silicone foot.
- One white status LED behind a 0.3 mm micro-perforation: on while charging, off when full.

## 04 · CNC NOTES FOR PCBWAY

- Material: 316L (state it explicitly, because 304 polishes worse and is less biocompatible).
- General tolerance ±0.05 mm. Glass pocket: +0.05/−0. Inlay bore: +0.02/−0, for a press fit plus adhesive.
- Mirror polish on P2 is a secondary process. Order it as "mirror polish #8, both
  cosmetic faces A". Specify that **no scratches are visible at 30 cm under a D65 light booth**
  (this is the acceptance test).
- Laser marking happens after polish. Use a fibre laser with low-power annealing, which
  gives black marks without a recess.
- Deliver as STEP AP214 plus a PDF drawing showing cosmetic faces, datum A = the back plane.
- CAD files are not produced this session. P2 deliverable: `hardware/lot-pager/mech/` (FreeCAD or Onshape export).
