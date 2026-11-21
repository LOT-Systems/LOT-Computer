<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · Mechanical & Enclosure

**Document:** LD-01-DOC-03 · Rev A · 2026-11-21

## 1. Form

- Outline **40.00 × 40.00 mm** square, corner radius R4.0, edge chamfer 0.3 mm.
- Height: **6.0 mm EVT**, **5.0 mm DVT stretch**.
- Material: **316L stainless** for both parts (good corrosion resistance against skin contact, polishes to a mirror).
- Mass target ≤ 28 g.

## 2. The two parts

```
   SIDE SECTION (not to scale)

   FRONT  ┌──────────────── glass 0.55 ────────────────┐   ◄ Part B bezel ring (316L, brushed)
          │ ▓▓▓▓▓ display 0.75 ▓▓▓▓▓   ○ cam   ● btn   │
          │ ░░░ Qi coil + ferrite 0.45 ░░░             │
          │ ═══════ PCB 0.6 (+ parts 1.0) ═════════════│
          │ ▒▒▒▒▒▒▒ LiPo 1.6–2.0 ▒▒▒▒▒▒▒   [S3-MINI]   │
   BACK   └──────────── Part A shell floor 0.5 ────────┘   ◄ Part A cup (316L, mirror #8)
```

| Part | Process | Finish | Features |
|------|---------|--------|----------|
| **A: back shell (cup)** | 5-axis CNC from 316L bar | Outside: mirror polish #8, Ra ≤ 0.05 µm. Inside: as-machined | 0.5 mm floor, 0.8 mm walls, 4 bosses, battery pocket, LOT mark laser-etched **inside** so the mirror stays unbroken |
| **B: front bezel ring** | CNC from 316L | Bead-blast + fine brush (silver satin) | 0.6 mm glass ledge, Ø3.6 mm button bore, Ø1.0 mm vent hole, 4 countersinks |

Joining: 4 × M1.0 Torx from the front, hidden under the glass edge mask. Alternative: a laser-welded seam (not serviceable) at PVT.

## 3. Z-stack budget

| Layer | EVT (mm) | DVT stretch (mm) | Notes |
|-------|----------|------------------|-------|
| Front glass | 0.70 | 0.55 | Chemically strengthened, AR/AF |
| OCA + display (LS013B7DH03) | 0.90 | 0.80 | |
| Qi coil + ferrite | 0.60 | 0.45 | Behind the display. Ferrite shields the PCB |
| PCB | 0.80 | 0.40 (flex-rigid) | |
| Tallest part on PCB underside | — | — | S3-MINI (2.4) sits **beside** the cell, not under it |
| LiPo | 2.00 | 1.60 | |
| Air / tolerance | 0.30 | 0.20 | |
| Back shell floor | 0.70 | 0.50 | |
| **Total** | **6.00** | **4.50–5.00** | |

Camera (HM0360 module, ≤ 3.0 mm) sits in a corner pocket beside the display and lines up with an
open hole in the glass mask.

## 4. Front-face layout (40 × 40)

```
 ┌────────────────────────────────────────┐
 │  ○ cam                         vent ·  │
 │   ┌────────────────────────────┐       │
 │   │                            │       │
 │   │   Coffee time.             │       │
 │   │                            │       │
 │   │   21°  41%  1012 hPa       │       │
 │   │                    09:41   │       │
 │   └────────────────────────────┘       │
 │                                  (●)   │ ◄ Copy button
 └────────────────────────────────────────┘
```

## 5. RF and Qi rules

- Keep steel out of the area above the ESP32-S3 module's PCB antenna (≥ 5 mm keep-out), and route that zone to the glass side. Bring the module's antenna end up to a bezel corner that has a **glass-only** zone.
- Qi charges through the front: the device lies face-down on a microfiber-topped pad. The polished back never touches the pad, so it stays unscratched.
- Thermal test **T-04**: the shell must stay ≤ 41 °C after 90 min of charging at 25 °C ambient.

## 6. Sensor port

The BME688 needs ambient air. It gets a Ø1.0 mm hole in the bezel top edge, an ePTFE membrane, and a
sealed channel of about 6 mm³ so internal heat does not bias the reading. Firmware applies a
self-heating offset that is calibrated in test T-07.

## 7. Drawings to produce (next session)

- `LD01-A-SHELL.step`, `LD01-B-BEZEL.step`, `LD01-GLASS.dxf` (mask print), plus 2D drawings with
  GD&T. These go to PCBWay CNC together with the finish spec in §2.
