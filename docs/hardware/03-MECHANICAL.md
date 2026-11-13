<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager — Mechanical & Enclosure

**Document:** LOT-HW-01 / MECH · **Rev:** A (2026-11-13)

## 1. Form

- Envelope: **40.0 × 40.0 mm**, corner radius 4 mm, thickness **6.0 mm (EVT) → 5.0 mm (DVT stretch)**.
- Material: **316L stainless** (better corrosion and skin contact than 304).
- Two parts:
  - **Part A — "Tub"**: back plate + four side walls, one piece, CNC. Outside back face **#8 mirror polish**. This is the polished side.
  - **Part B — "Bezel"**: front frame, 0.8 mm wide, holds the cover glass, has the Ø 5 mm key hole. Brushed (or polished to match).
- Joint: Part B drops into Part A; 4 × M1.2 Torx screws hidden under the glass edge print, or a 3M VHB ring for a screwless look (VHB makes battery service impossible — pick screws for EVT).

```
 FRONT (Part B + glass)                 SIDE SECTION (EVT, not to scale)
 ┌──────────────────────────┐           glass 0.55 ───────────────────────────
 │ ◉ cam        ┌────────┐  │           OCA   0.10 ───────────────────────────
 │              │  LCD   │  │           LCD   0.90 ████████████    ▐cam 2.2▌
 │              │ 128²   │  │           Qi coil 0.45 ═══════════   ▐       ▌
 │              └────────┘  │           ferrite 0.10 ───────────   ▐       ▌
 │                   (COPY) │           PCB 0.60 + parts 0.80 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 └──────────────────────────┘           battery 1.50 ░░░░░░░░░░░ (notched for cam)
   antenna corner: top-left              clearance 0.20
                                         Part A wall 0.60 ▀▀▀▀▀▀▀ (mirror outside)
                                         ─────────────────────────── = 5.80 mm
```

## 2. Z-stack budget

| Layer | EVT (mm) | DVT 5 mm target (mm) | Notes |
|-------|---------:|---------------------:|-------|
| Cover glass | 0.55 | 0.40 | 0.4 mm sapphire at DVT |
| Optical adhesive | 0.10 | 0.10 | |
| Memory LCD | 0.90 | 0.70 | **VERIFY** panel datasheet |
| Qi coil | 0.45 | 0.45 | |
| Ferrite sheet | 0.10 | 0.10 | |
| PCB | 0.60 | 0.60 | 4-layer HDI |
| Tallest back-side parts | 0.80 | 0.60 | LRA moves into battery notch at DVT |
| Battery | 1.50 (~80 mAh) | 1.00 (~45 mAh) | Semi-custom pouch |
| Clearance / foam | 0.20 | 0.15 | Pouch swell allowance |
| Back wall (Part A) | 0.60 | 0.45 | Polishing removes ~0.05 mm |
| **Total** | **5.80** | **4.55 + 0.45 margin = 5.0** | |

Camera module (≤ 2.2 mm) sits in a PCB cut-out in the top-left corner and occupies the battery notch.

## 3. The two hard problems

### 3.1 Wireless charging vs. stainless steel (decision D-1)

316L is non-magnetic but conductive. At Qi frequencies (~110–205 kHz) its skin depth is
~1.1 mm, so a 0.6 mm wall passes some field — but eddy currents heat the steel and the
charger's **Foreign Object Detection** will stop charging. So the coil cannot sit behind
the polished steel.

| Option | How | Pro | Con |
|--------|-----|-----|-----|
| **A (recommended for EVT)** | Coil behind the front glass, under the LCD. Device charges **face-down** on the pad | Keeps the back 100 % polished steel | User must place it screen-down; coil behind LCD must be tested |
| B | Zirconia ceramic disc (Ø 28 mm) set into the back | Charges face-up, looks like a watch back | Back is no longer pure steel; extra part |
| C | Magnetic pogo-pin cradle (not Qi) | Simplest, cheapest | Not wireless — breaks brief item 19 |

Stage 0 test: Qi pad + coil + 0.5 mm 316L sheet, and coil + LCD + glass, measure charge current and temperature.

### 3.2 Radio through a steel box

Wi-Fi/BLE antenna goes in the top-left corner, under the glass, with ≥ 3 mm of clearance to
any steel edge. The bezel (Part B) is electrically isolated from the tub (Part A) with a
0.1 mm Kapton or anodised-insert gap so the seam does not short the antenna field. Plan one
antenna tuning pass (VNA) on EVT units — budget in doc 07.

## 4. Other details

- **Weather vent:** Ø 0.8 mm hole in the side wall next to BME688, ePTFE membrane inside; small sealed chamber around the sensor (thermal isolation from the ESP32).
- **Button:** steel key (Ø 5 mm, 0.6 mm travel) over a 4 mm snap dome on the PCB. Laser-etched "COPY". O-ring for dust.
- **Camera window:** clear hole in the glass print mask, Ø 2.5 mm.
- **Ingress target:** IP54 (splash). No ports — firmware updates over Wi-Fi.
- **Mass target:** ≤ 35 g.

## 5. PCBWay CNC order notes

- Material 316L, tolerance ±0.02 mm on mating faces, ±0.05 mm elsewhere.
- Finish: Part A outside — mirror (#8); inside — bead-blast. Part B — brushed #4 or mirror.
- Send STEP + 2D PDF drawing with critical dims; ask for a first-article report on 3 units before the run of 100.
- Laser-etch: LOT mark and serial number inside Part A.
