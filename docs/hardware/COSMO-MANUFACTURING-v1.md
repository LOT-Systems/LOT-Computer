<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA Hardware Division
  Document: COSMO-MANUFACTURING-v1.md
  PCBWay Manufacturing Guide — 100 Unit Production Run
  Date: 2026-06-12
-->

# COSMO® Cube — Manufacturing Guide v1.0

**Document:** COSMO-MANUFACTURING-v1.md  
**Target:** 100-unit production run  
**Manufacturer:** PCBWay (primary)  
**Date:** 2026-06-12  

---

## 1. Manufacturing Overview

The COSMO® Cube is produced across three parallel manufacturing streams:

```
Stream A: PCBWay Electronics
├── PCB fabrication (4-layer, 35×35mm)
├── SMT component placement (turnkey)
├── Reflow soldering (lead-free SAC305)
└── Post-reflow AOI inspection

Stream B: PCBWay CNC Machining
├── 316L SS back plate (mirror polished)
├── 316L SS front bezel (satin + cutouts)
├── CNC tolerances ±0.05mm
└── Laser engraving

Stream C: Custom Components
├── LiPo battery (Grepow, 35×35×2.5mm)
├── OLED display modules
├── Camera modules (Himax HM01B0)
└── Wireless charging coils

Final Assembly (USA or designated facility):
├── PCB → coil → battery → enclosure stacking
├── Firmware flashing + provisioning
├── QA testing (every unit)
└── Packaging
```

---

## 2. PCBWay Order — Step by Step

### 2.1 PCB Fabrication Order

**URL:** https://www.pcbway.com/orderonline.aspx

**Files to upload:**
- Gerber files (ZIP): `COSMO-PCB-v1-gerbers.zip`
  - Copper layers: F.Cu, B.Cu, In1.Cu, In2.Cu
  - Drill files: drill.drl, drill-NPTH.drl
  - Paste layers: F.Paste, B.Paste
  - Silk: F.Silkscreen
  - Mask: F.Mask, B.Mask
  - Outline: Edge.Cuts

**PCBWay Order Parameters:**
```
Layers:           4
Board Dimensions: 35 × 35 mm
Board Thickness:  0.8 mm
Quantity:         110
Surface Finish:   ENIG
Copper Weight:    1 oz (outer), 0.5 oz (inner)
Min Hole Size:    0.2 mm (laser via)
Min Track/Space:  4/4 mil
Solder Mask:      Black
Silkscreen:       White (top only)
Via Filling:      Filled + capped (IPC-4761 Type VII)
IPC Class:        Class 2
RoHS:             Yes
```

**Estimated price (110 boards, 4-layer):** $280–$380

---

### 2.2 SMT Assembly Order (Turnkey)

**URL:** https://www.pcbway.com/assembly/

**Files to upload:**
- BOM file: `COSMO-BOM-Assembly.csv` (see format below)
- Pick-and-Place file: `COSMO-CPL-v1.csv`
- Schematic PDF: `COSMO-Schematic-v1.pdf`

**BOM CSV Format for PCBWay:**
```csv
Comment,Designator,Footprint,Quantity,LCSC/Mouser MPN,Supplier,Notes
ESP32-S3-MINI-1U-N8,U1,ESP32S3-MINI-1U,1,713-ESP32-S3-MINI-1U,Mouser,Provide socket
SSD1327 OLED,DISP1,FPC-24P-0.5mm,1,SEE BOM,BuyDisplay,DNP - hand install
BME280,U2,BME280-LGA,1,828-BME280,Mouser,Near mesh cutout
ICM-42688-P,U3,QFN-14-2.5x2.5,1,ICM-42688-P,Mouser,SPI interface
APDS-9960,U4,LCC-6,1,630-APDS-9960,Mouser,Behind display
BQ51013B,U5,VQFN-20,1,595-BQ51013BRHLR,Mouser,
BQ25892,U6,WQFN-24,1,BQ25892RTWR,Mouser,
AP2112K-1.8V,U7,SOT-23-5,1,AP2112K-1.8TRG1,DigiKey,
W25Q64JV,U8,SOP-8,1,W25Q64JVSSIQ,DigiKey,Optional
RGB LED,LED1,1206,1,APTR3216ZGCK,Mouser,
Tactile Button,SW1,SMD-6x6mm,1,EVQ-Q2C03W,Mouser,
100nF cap,C1-C20,0402,20,GCM155R71C104KA55D,Mouser,Decoupling
10µF cap,C21-C25,0603,5,GRM188R61A106KE69D,Mouser,Bulk
10kΩ res,R1-R10,0402,10,RC0402FR-0710KL,Mouser,Pull-up/down
```

**Assembly Parameters:**
```
Solder paste: SAC305 (lead-free)
Reflow:       Standard lead-free profile (peak 260°C)
Testing:      100% AOI
X-ray:        On U5 (BQ51013B VQFN), U6 (BQ25892 WQFN)
DNP list:     DISP1, J_CAM (camera connector), J_BAT (battery connector)
```

**Estimated assembly cost (110 units):** $900–$1,500

---

### 2.3 CNC Machining Order

**URL:** https://www.pcbway.com/rapid-prototyping/manufacture/?type=cnc

**Files to upload:**
- Part A (Back plate): `COSMO-Back-Plate.step` + `COSMO-Back-Plate.dxf`
- Part B (Front bezel): `COSMO-Front-Bezel.step` + `COSMO-Front-Bezel.dxf`
- Technical drawing: `COSMO-Enclosure-Drawing-v1.pdf`

**Part A — Back Plate Specifications:**
```
Material:     316L Stainless Steel
Dimensions:   40.0 × 40.0 × 0.8 mm (overall)
Features:
  - Flat plate, no through-holes (wireless charging only)
  - 4× M1.0 threaded blind holes, 1.5mm deep, at corners (3mm from each edge)
  - Stepped rim: 0.3mm × 0.3mm rebate around perimeter for gasket
Surface:
  - Face finish: Mirror polished #8 (Ra <0.025µm)
  - Rim finish: Bead blasted satin
Engraving:
  - "LOT®" center, 8mm wide, 0.2mm deep laser etch
  - "COSMO® CIA" lower-right, 4mm wide, 0.15mm deep
  - Serial number lower-left, 3mm wide (variable per unit)
  - Fill all engravings with black epoxy
Qty: 110
```

**Part B — Front Bezel Specifications:**
```
Material:     316L Stainless Steel
Overall:      40.0 × 40.0 × 4.2 mm (assembled height)
Wall:         0.5mm minimum thickness
Features:
  - Rectangular frame with 5mm rim
  - Central display aperture: 29 × 29mm (glass/OLED seats inside)
  - 4× M1.0 countersunk through-holes at corners
  - Camera aperture: 5mm diameter circle, bottom-left (8mm from left, 5mm from bottom)
  - Button aperture: 8mm diameter circle, bottom-center, 4mm depth recess
  - LED aperture: 2.5mm diameter circle, bottom-right
  - Weather mesh: 5×5mm area, 0.5mm hole grid, right-center
  - EPDM gasket channel: 0.5 × 0.5mm square groove, inner perimeter
  - PCB standoffs: 4× M1.0 × 1.5mm blind post, interior, 5mm from corners
Surface:
  - Exterior: Bead blasted satin (Ra 0.4–1.6µm)
  - Interior: As-machined (no finish)
Qty: 110
```

**CNC Order Notes for PCBWay:**
> "We require 316L (not 304) stainless steel for corrosion resistance.
> Back plates require mirror polishing to #8 finish — Ra <0.025µm.
> Front bezels require bead blast satin finish.
> All laser engraving to be filled with black epoxy (standard jewelry technique).
> Serial numbers are sequential: CQ-001-26 through CQ-110-26.
> Please provide per-unit serial engraving as a variable field.
> Requested dimensional tolerance: ±0.05mm.
> Request DFM review before production start."

**Estimated CNC cost (110 sets):** $4,000–$6,000

---

## 3. Quality Control

### 3.1 PCB QA Checkpoints

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Visual inspection | AOI (automated) | No bridges, missing parts, tombstones |
| Solder joint quality | X-ray (BQ chips) | Full pad coverage, no voids >25% |
| Power rail voltage | Bench measurement | 3.3V ±2%, 1.8V ±2% |
| WiFi connectivity | ESP-IDF test firmware | -70dBm or better at 1m |
| Display function | Firmware test screen | All 16 gray levels displayed |
| Button function | Bench press + scope | Clean falling edge, < 5ms bounce |
| Sensor readings | Firmware sensor test | Temp ±2°C of reference, humidity ±5% |
| Wireless charging | Qi pad @ 5W | Full charge current within 30s of placement |

### 3.2 Enclosure QA

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Dimension check | Caliper measurement | ±0.1mm on all critical dims |
| Mirror finish | Visual + Ra measurement | No scratches, Ra <0.05µm |
| Engraving depth | Optical profilometer | 0.15–0.25mm depth |
| Assembly fit | Hand assembly test | No gap > 0.1mm when assembled |
| IP54 splash | 5-min water spray test | No water ingress |

### 3.3 System QA (Every Unit)

```
COSMO® Cube QA Checklist — Unit: CQ-___-26

□ 1. Flash firmware v1.0.0-001
□ 2. Run provisioning tool — assign serial + API key
□ 3. Boot — verify boot screen displays
□ 4. WiFi connection — verify connects within 30s
□ 5. API poll — verify notification received from LOT test server
□ 6. Notification display — verify text renders correctly on OLED
□ 7. Copy button — verify LED pulse + Log entry on lot-systems.com
□ 8. BME280 — verify temp/humidity/pressure within calibrated range
□ 9. APDS-9960 — verify ambient light value, proximity response
□ 10. ICM-42688 — verify accelerometer reads ≈ 9.81 Z-axis
□ 11. Wireless charging — verify charge current, LED indicator
□ 12. Deep sleep — verify wakeup from button press
□ 13. Enclosure assembly — secure M1.0 screws (torque: 0.3 N·m)
□ 14. Final visual — no scratches on mirror face, clean front

QA Technician: ___________  Date: ___________  Pass / Fail
```

---

## 4. Production Timeline

### 4.1 Gantt Chart (Target: 10-Week Build)

```
Week | Activity
─────┼─────────────────────────────────────────────────────
  1  │ PCB design finalized → Gerbers generated
     │ Order: Battery (Grepow) — 8-week lead
     │ Order: SS enclosure (PCBWay CNC) — 3-week lead
     │
  2  │ Order: All SMD components (Mouser/DigiKey)
     │ Order: OLED displays (BuyDisplay) — 2-week lead
     │ Order: Camera modules (ArduCam)
     │ Order: Qi coils + ferrite (Alibaba)
     │
  3  │ PCB + SMT order placed (PCBWay) — 2-week lead
     │ Firmware development begins (ESP-IDF)
     │
  4  │ Components arrive (SMD, sensors)
     │ Firmware: WiFi + API integration
     │
  5  │ PCB boards arrive (PCBWay)
     │ Prototype assembly (10 units)
     │ Firmware: Display driver, button handler
     │
  6  │ Prototype QA — identify issues
     │ CNC enclosures arrive (PCBWay CNC)
     │ Firmware: Sensor drivers, power management
     │
  7  │ Firmware: OTA, security, factory provisioning
     │ LOT backend: hardware API endpoints
     │
  8  │ Battery arrives (Grepow)
     │ Full production assembly begins (100 units)
     │ LOT Log tab: hardware entry display
     │
  9  │ QA testing — all 100 units
     │ Failed units: rework or replace
     │ Packaging
     │
 10  │ 100-unit build complete
     │ Documentation finalized (PDF export)
     │ Ship to Vadim / warehouse
```

---

## 5. Engineering Files Required

### 5.1 For PCBWay PCB Order

```
cosmo-pcb-v1/
├── gerbers/
│   ├── COSMO-F_Cu.gbr          # Front copper
│   ├── COSMO-B_Cu.gbr          # Back copper
│   ├── COSMO-In1_Cu.gbr        # Inner layer 1 (GND plane)
│   ├── COSMO-In2_Cu.gbr        # Inner layer 2 (Power plane)
│   ├── COSMO-F_Mask.gbr
│   ├── COSMO-B_Mask.gbr
│   ├── COSMO-F_Paste.gbr
│   ├── COSMO-F_Silkscreen.gbr
│   ├── COSMO-Edge_Cuts.gbr
│   ├── COSMO-drill.drl
│   └── COSMO-drill-NPTH.drl
├── COSMO-BOM-Assembly.csv       # BOM for turnkey SMT
├── COSMO-CPL-v1.csv             # Pick and place coordinates
└── COSMO-Schematic-v1.pdf
```

### 5.2 For PCBWay CNC Order

```
cosmo-enclosure-v1/
├── 3D-Models/
│   ├── COSMO-Back-Plate.step
│   └── COSMO-Front-Bezel.step
├── 2D-Drawings/
│   ├── COSMO-Back-Plate.dxf
│   ├── COSMO-Front-Bezel.dxf
│   └── COSMO-Enclosure-Drawing-v1.pdf
└── Engraving/
    └── COSMO-Engraving-Layout.ai  # Adobe Illustrator for laser paths
```

**Design tool recommendation:** KiCad 8.0 (PCB, free, open-source), FreeCAD or Fusion 360 (enclosure CAD).

---

## 6. Cost Summary

| Item | Unit Cost | 100 Units | 110 Ordered |
|------|-----------|-----------|-------------|
| PCB fabrication | $3.50 | $350 | $385 |
| SMT assembly | $12.00 | $1,200 | $1,320 |
| ESP32-S3-MINI-1U | $3.80 | $380 | $418 |
| OLED display | $5.50 | $550 | $605 |
| Camera (HM01B0) | $4.20 | $420 | $462 |
| BME280 | $2.80 | $280 | $308 |
| ICM-42688-P | $3.50 | $350 | $385 |
| APDS-9960 | $2.10 | $210 | $231 |
| Qi Rx IC (BQ51013B) | $2.80 | $280 | $308 |
| Qi Rx coil + ferrite | $1.50 | $150 | $165 |
| Power IC (BQ25892) | $2.60 | $260 | $286 |
| Battery (custom LiPo) | $6.50 | $650 | $715 |
| Passives + misc SMD | $3.00 | $300 | $330 |
| SS Enclosure (2 parts) | $40.00 | $4,000 | $4,400 |
| Qi Tx pad (charger) | $9.00 | $900 | — |
| Packaging | $4.00 | $400 | — |
| **Subtotal** | | **$10,730** | |
| Contingency 15% | | $1,610 | |
| **Total** | | **$12,340** | |
| **Per-unit cost** | **$110** | | |

**Target retail price:** $349 (2.9× markup, reflects premium SS finish + LOT platform value)

---

*Document v1.0 — COSMO® CIA — LOT Systems, Inc.*  
*Inventor: Vadim Marmeladov — 2026-06-12*
