<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA Hardware Division
  Document: COSMO-BOM-v1.md
  Bill of Materials — 100 Unit Production Run
  Date: 2026-06-12
-->

# COSMO® Cube — Bill of Materials v1.0

**Document:** COSMO-BOM-v1.md  
**Revision:** 1.0  
**Date:** 2026-06-12  
**Quantity:** 100 units (+ 10% overage = 110 sets ordered)  
**Prepared by:** Vadim Marmeladov, Inventor  

---

## Purchasing Summary

| Category | Est. Unit Cost | Est. 100-Unit Total |
|----------|---------------|---------------------|
| Main MCU Module | $4.20 | $420 |
| Display | $5.50 | $550 |
| Camera | $4.80 | $480 |
| Weather Sensor | $3.10 | $310 |
| IMU Sensor | $3.80 | $380 |
| Ambient Light Sensor | $2.40 | $240 |
| Wireless Charging (Rx) | $5.90 | $590 |
| Battery | $6.50 | $650 |
| Power Management IC | $2.80 | $280 |
| Passives + Misc SMD | $3.00 | $300 |
| PCB (4-layer, PCBWay) | $4.50 | $450 |
| SMT Assembly (PCBWay) | $12.00 | $1,200 |
| SS Enclosure (2 parts, CNC) | $38.00 | $3,800 |
| Wireless Charger (Tx pad) | $9.00 | $900 |
| Packaging | $4.00 | $400 |
| **Total per unit** | **~$110** | — |
| **100-unit run total** | — | **~$10,750** |
| Contingency (15%) | — | $1,613 |
| **Grand Total** | — | **~$12,363** |

---

## Section 1 — Main Processing

### 1.1 MCU Module: ESP32-S3-MINI-1U

| Field | Detail |
|-------|--------|
| Manufacturer | Espressif Systems |
| MPN | ESP32-S3-MINI-1U-N8 |
| Description | WiFi + BLE5 SoM, 8MB Flash, U.FL antenna, 15.4×20.5mm |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$3.50–$4.20 |
| Primary supplier | Mouser Electronics |
| Mouser MPN | 713-ESP32-S3-MINI-1U |
| Backup supplier | DigiKey — search MPN `ESP32-S3-MINI-1U-N8` |
| Datasheet | https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf |
| PCBWay note | Specify U.FL variant for external antenna trace on PCB edge |

### 1.2 External SPI Flash (Optional Expansion)

| Field | Detail |
|-------|--------|
| Manufacturer | Winbond |
| MPN | W25Q64JVSSIQ |
| Description | 64Mb SPI NOR Flash, SOP-8 |
| Quantity per unit | 1 (optional, if 8MB insufficient) |
| Unit price | ~$0.80 |
| Supplier | DigiKey — search `W25Q64JVSSIQ` |

---

## Section 2 — Display

### 2.1 OLED Display Module: SSD1327 1.0" 128×128

| Field | Detail |
|-------|--------|
| Manufacturer | Various (Solomon Systech controller, generic module) |
| MPN | ER-OLED013-1W (or equivalent 1.0" SSD1327 square module) |
| Description | 1.0" 128×128 grayscale OLED, SPI, 3.3V, white |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$4.50–$6.00 |
| Primary supplier | Buydisplay.com or BuyDisplay.cn |
| Backup supplier | Alibaba — search `1 inch SSD1327 OLED 128x128` |
| Alternate MPN | Adafruit 1431 (for prototyping) |
| Notes | Specify SPI interface (not I2C) for speed. Confirm 3.3V logic. Order with 0.5mm FPC connector. |

---

## Section 3 — Camera

### 3.1 Camera Module: Himax HM01B0

| Field | Detail |
|-------|--------|
| Manufacturer | Himax Technologies |
| MPN | HM01B0 |
| Description | Ultra-low power 320×320 CMOS camera, DVP, CSP package |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$3.50–$5.00 |
| Primary supplier | ArduCam (arducam.com) — sells HM01B0 breakout/module |
| Alternate supplier | Himax direct via distributor — search `HM01B0-AAA` |
| Datasheet | Available via Himax NDR program |
| Lens | Requires M7 macro lens, 2.35mm EFL, HFOV 66° |
| Notes | Request with included M7 lens module for thin mounting. Total camera + lens stack: ~3.5mm |

**Fallback camera (prototype/simpler):**

| Field | Detail |
|-------|--------|
| MPN | OV2640 (2MP) |
| Module | ArduCam Mini 2MP OV2640 |
| Supplier | arducam.com — search `OV2640` |
| Notes | Thicker (8mm with lens) — for prototype only, not final 5mm form factor |

---

## Section 4 — Environmental Sensors

### 4.1 Weather Sensor: Bosch BME280

| Field | Detail |
|-------|--------|
| Manufacturer | Bosch Sensortec |
| MPN | BME280 |
| Description | Temp/Humidity/Pressure, LGA 2.5×2.5×0.93mm |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$2.50–$3.50 |
| Primary supplier | Mouser Electronics — search `BME280` |
| Mouser MPN | 828-BME280 |
| Backup supplier | DigiKey — search `BME280` |
| Interface | I2C (0x76 or 0x77 address) |
| Datasheet | https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/ |
| Notes | Place near weather mesh cutout on PCB for accurate ambient readings. Keep away from battery thermal zone. |

### 4.2 AI-Grade IMU: TDK InvenSense ICM-42688-P

| Field | Detail |
|-------|--------|
| Manufacturer | TDK InvenSense |
| MPN | ICM-42688-P |
| Description | 6-axis IMU (accel + gyro), QFN 2.5×2.5×0.91mm |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$3.20–$4.50 |
| Primary supplier | Mouser — search `ICM-42688-P` |
| Backup supplier | DigiKey — search `ICM-42688-P` |
| Interface | SPI (4-wire, up to 24MHz) |
| Key feature | FIFO 4KB, DMP (hardware motion detection), tap detection, step counter |
| Notes | Use SPI for speed. Enable FIFO tap detection for button-less gesture. |

### 4.3 Ambient Light + Gesture: Broadcom APDS-9960

| Field | Detail |
|-------|--------|
| Manufacturer | Broadcom / Avago |
| MPN | APDS-9960 |
| Description | Gesture + Proximity + ALS + RGBC, LCC 3.94×2.36mm |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$1.80–$2.80 |
| Primary supplier | Mouser — search `APDS-9960` |
| Mouser MPN | 630-APDS-9960 |
| Interface | I2C (address 0x39) |
| Notes | Mount behind 0.5mm aperture in SS face near display. Used for sleep/wake and notification dismiss gesture. |

---

## Section 5 — Power System

### 5.1 Battery: Custom LiPo 280mAh

| Field | Detail |
|-------|--------|
| Chemistry | Lithium Polymer |
| Capacity | 280mAh (range: 250–300mAh acceptable) |
| Dimensions | 35mm × 35mm × 2.5mm (H × W × T) |
| Voltage | 3.7V nominal, 4.2V max |
| Connector | JST-PH 1.25mm 2-pin |
| Protection | Built-in PCM (overcharge, overdischarge, short) |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$5.00–$8.00 |
| Primary supplier | Shenzhen Grepow Battery — custom cell order: https://www.grepow.com |
| Backup supplier | Alibaba — search `3535250 LiPo battery 280mAh` |
| Certification | UN38.3 transport certification required |
| Notes | Request custom order for 35×35×2.5mm. Minimum order may be 200 units — order 200 for buffer. |

### 5.2 Wireless Charging Receiver IC: TI BQ51013B

| Field | Detail |
|-------|--------|
| Manufacturer | Texas Instruments |
| MPN | BQ51013BRHLR |
| Description | Qi-certified wireless power receiver, 5W, VQFN-20 |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$2.50–$3.50 |
| Primary supplier | Mouser — search `BQ51013B` |
| Mouser MPN | 595-BQ51013BRHLR |
| Datasheet | https://www.ti.com/product/BQ51013B |
| Notes | Requires 30mm Qi receiver coil + resonant capacitors. See reference design BQ51013B EVM. |

### 5.3 Wireless Charging Coil (Receiver)

| Field | Detail |
|-------|--------|
| Type | Qi receiver coil, 30mm diameter |
| Inductance | 15µH ± 20% |
| DCR | < 450mΩ |
| Thickness | 0.4mm (coil only, no ferrite) |
| Ferrite sheet | 35mm × 35mm × 0.3mm (between coil and battery) |
| Quantity per unit | 1 coil + 1 ferrite |
| Total ordered | 110 sets |
| Unit price | ~$1.00–$1.80 |
| Supplier | Alibaba — search `Qi receiver coil 30mm 15uH` or Würth Elektronik 760308101 |
| Notes | Ferrite sheet mandatory to prevent battery RF heating. Stack order: Back SS plate → ferrite → coil → battery → PCB → front SS bezel |

### 5.4 Power Management IC: TI BQ25892

| Field | Detail |
|-------|--------|
| Manufacturer | Texas Instruments |
| MPN | BQ25892RTWR |
| Description | I2C single-cell LiPo charger + OTG + PMIC, WQFN-24 |
| Quantity per unit | 1 |
| Total ordered | 110 |
| Unit price (100+) | ~$2.20–$3.20 |
| Primary supplier | Mouser — search `BQ25892` |
| Datasheet | https://www.ti.com/product/BQ25892 |
| Notes | Handles Qi input, charges LiPo, outputs regulated 3.3V system rail. I2C configuration by ESP32-S3. |

### 5.5 LDO Regulator (1.8V for camera): Diodes Inc AP2112K-1.8TRG1

| Field | Detail |
|-------|--------|
| MPN | AP2112K-1.8TRG1 |
| Description | 600mA LDO, 1.8V output, SOT-23-5 |
| Quantity per unit | 1 |
| Unit price | ~$0.30 |
| Supplier | DigiKey — search `AP2112K-1.8TRG1` |

---

## Section 6 — User Interface

### 6.1 Copy Button: Stainless Steel Tactile Dome

| Field | Detail |
|-------|--------|
| Type | Stainless steel tactile dome, SMD |
| Diameter | 8mm (external cap) |
| Actuation Force | 180gF (firm, intentional press) |
| Travel | 0.2mm |
| Life | 1,000,000 cycles |
| MPN | Panasonic EVQ-Q2C03W or equivalent |
| Quantity per unit | 1 |
| Unit price | ~$0.25 |
| Supplier | Mouser — search `EVQ-Q2C03W` |
| Notes | SS cap machined into front bezel as integrated dome. Button signal to ESP32-S3 GPIO with hardware debounce (100nF + 10kΩ). |

### 6.2 Status LED: RGB LED, 1206 SMD

| Field | Detail |
|-------|--------|
| MPN | Kingbright APTR3216ZGCK (or Cree CLVBA-FKA) |
| Description | RGB LED, 1206, common cathode |
| Quantity per unit | 1 |
| Unit price | ~$0.20 |
| Supplier | Mouser or DigiKey — search `APTR3216ZGCK` |
| Notes | Behind 0.8mm frosted SS diffuser cutout. PWM-controlled by ESP32-S3 (GPIO). |

---

## Section 7 — PCB

### 7.1 Custom 4-Layer PCB

| Field | Detail |
|-------|--------|
| Manufacturer | PCBWay |
| Service URL | https://www.pcbway.com/orderonline.aspx |
| Layer Count | 4 |
| Board Size | 35mm × 35mm |
| Board Thickness | 0.8mm |
| Copper Weight | 1oz outer, 0.5oz inner |
| Surface Finish | ENIG (Electroless Nickel Immersion Gold) |
| Solder Mask | Black |
| Silkscreen | White (front side only) |
| Min Trace/Space | 4mil / 4mil |
| Min Drill | 0.2mm (laser via) |
| Via Fill | Filled + capped vias for flat surface |
| Quantity | 110 boards |
| Est. Price | ~$180–$350 total (100–110 units, 4-layer) |
| PCBWay Order | Upload Gerbers at https://www.pcbway.com/orderonline.aspx |
| Delivery | 5–7 business days (standard), 2–3 days (rush) |
| Notes | Use IPC Class 2. Request DFM review. Specify RoHS-compliant materials. |

### 7.2 SMT Assembly (Turnkey)

| Field | Detail |
|-------|--------|
| Service | PCBWay Turnkey SMT Assembly |
| Service URL | https://www.pcbway.com/assembly/ |
| Type | Full turnkey (PCBWay sources components from BOM) |
| Solder Paste | SAC305 lead-free (RoHS) |
| Reflow Profile | Standard SMD lead-free profile |
| Testing | 100% AOI, optional X-ray for BGA |
| Quantity | 110 boards assembled |
| Est. Assembly Cost | ~$800–$1,400 total |
| Files required | BOM (this document), Gerbers, Pick-and-Place (CPL), schematic |
| Notes | Mark ESP32-S3-MINI-1U, display connector, camera connector as DNP sockets — hand-assemble after reflow. Mark battery connector as DNP — connect during final assembly. |

---

## Section 8 — Mechanical Enclosure

### 8.1 Stainless Steel Enclosure (2-Part)

| Field | Detail |
|-------|--------|
| Material | 316L Stainless Steel |
| Parts | 2: (A) Back plate + (B) Front bezel |
| Manufacturer | PCBWay CNC Service |
| CNC URL | https://www.pcbway.com/rapid-prototyping/manufacture/?type=cnc |
| External Dimensions | 40mm × 40mm × 5mm |
| Wall Thickness | 0.4mm minimum (back plate), 0.5mm bezel walls |
| Assembly Method | 4× M1.0 countersunk screws + continuous gasket seal |
| Tolerances | ±0.05mm (CNC machined) |
| Back Plate Finish | Mirror polish #8 (Ra <0.025µm) — specify "mirror polishing" in PCBWay order |
| Front Bezel Finish | Bead-blasted satin (Ra 0.4–1.6µm) |
| Engraving | Laser-etched, 0.2–0.3mm depth, filled with black epoxy |
| Gasket | EPDM O-ring, 38mm × 38mm square, 0.5mm cross-section |
| Quantity | 110 sets (220 pieces total) |
| Unit price (100 sets) | ~$32–$45 per set (CNC + finishing at 100 qty) |
| Total cost | ~$3,500–$4,500 |
| Lead Time | 7–14 business days |
| Notes | Request separate quotes for: (1) raw CNC, (2) mirror polishing (back), (3) bead blast (front), (4) laser engraving. PCBWay CNC team handles all. Attach 2D drawings (DXF) + 3D model (STEP). |

### 8.2 Internal Screws

| Field | Detail |
|-------|--------|
| Type | M1.0 × 2.0mm flat-head, SS316 |
| Quantity per unit | 4 |
| Supplier | Alibaba — search `M1.0 stainless steel screw flat head` |
| Unit price | ~$0.05 each |

### 8.3 Thermal Interface Material

| Field | Detail |
|-------|--------|
| Type | Thermal pad, 1mm thick, 6 W/m·K |
| Size | 20mm × 20mm (cut to fit over ESP32-S3 module) |
| MPN | Fujipoly XR-m (or equivalent) |
| Notes | Between ESP32-S3 and SS enclosure for passive heat transfer |

---

## Section 9 — Wireless Charger (Transmitter)

### 9.1 Desktop Qi Charging Pad (for user kit)

| Field | Detail |
|-------|--------|
| Standard | Qi 5W |
| Form Factor | Square pad, 80mm × 80mm × 6mm |
| Input | USB-C, 5V/2A |
| Finish | Matte black TPU top, SS bottom weight |
| LED Indicator | Breathing white LED during charge |
| Cable | 1.5m USB-C to USB-A, braided |
| Brand/Supplier | OEM Qi pad — Alibaba search `5W Qi charging pad square OEM` |
| Quantity | 100 units (1 per device) |
| Unit price (100+) | ~$6.00–$10.00 |
| LOT Branding | Request custom pad with LOT® wordmark silk-printed on top |
| Notes | Specify Qi-certified transmitter IC (TI BQ500215 or STWBC series). Request CE/FCC pre-certified module. |

---

## Section 10 — Packaging

### 10.1 Retail Box

| Field | Detail |
|-------|--------|
| Type | Rigid gift box, magnetic closure |
| Dimensions | 100mm × 100mm × 60mm |
| Material | Matte black rigid cardboard, spot UV on LOT® logo |
| Interior | Custom foam tray (EVA foam, cut-to-fit) |
| Contents per box | (1) COSMO® Cube, (1) Qi charging pad + cable, (1) Quick Start card, (1) QR code card → firmware docs |
| Quantity | 100 boxes |
| Supplier | Alibaba — search `custom rigid gift box magnetic 100x100x60` |
| Unit price (100+) | ~$3.00–$5.00 |

### 10.2 Documentation Insert

| Field | Detail |
|-------|--------|
| Format | 4-page folded card, 100mm × 100mm |
| Content | Device overview, pairing instructions, button function, Qi charging, support QR code |
| Print | 4-color CMYK, 300gsm uncoated |
| Printer | Local US print shop or Vistaprint for 100 qty |

---

## Section 11 — Component Purchasing Order

### Priority Order Sequence

```
Week 1 (Order immediately — longest lead time):
  □ Custom LiPo battery (Grepow, 6–8 week lead)
  □ SS enclosure quote + order (PCBWay CNC, 2–3 week)
  □ Qi receiver coils + ferrite (Alibaba, 2–3 week shipping)

Week 2 (Order in parallel):
  □ ESP32-S3-MINI-1U (Mouser, 1–2 week)
  □ BME280 (Mouser, in-stock)
  □ ICM-42688-P (Mouser, 1–2 week)
  □ APDS-9960 (Mouser, in-stock)
  □ BQ51013B (Mouser, 1–2 week)
  □ BQ25892 (Mouser, 1–2 week)
  □ OLED display modules (BuyDisplay, 2–3 week)

Week 3 (After PCB Gerbers ready):
  □ Submit PCB + SMT order to PCBWay (2–3 week turnkey)
  □ Camera modules (ArduCam, 1–2 week)
  □ Packaging (Alibaba, 3–4 week)

Week 4–5:
  □ PCB boards arrive
  □ Begin enclosure assembly
  □ Firmware flash + QA

Week 6:
  □ 100-unit build complete
```

---

## Section 12 — Key Supplier Links

| Supplier | Use | URL |
|----------|-----|-----|
| PCBWay PCB | PCB fabrication | https://www.pcbway.com/orderonline.aspx |
| PCBWay Assembly | SMT turnkey | https://www.pcbway.com/assembly/ |
| PCBWay CNC | SS enclosure machining | https://www.pcbway.com/rapid-prototyping/manufacture/?type=cnc |
| Mouser Electronics | Electronic components | https://www.mouser.com |
| DigiKey | Electronic components | https://www.digikey.com |
| ArduCam | Camera modules | https://www.arducam.com |
| Grepow Battery | Custom LiPo | https://www.grepow.com |
| BuyDisplay | OLED displays | https://www.buydisplay.com |
| Texas Instruments | BQ51013B, BQ25892 datasheets | https://www.ti.com |
| Bosch Sensortec | BME280 | https://www.bosch-sensortec.com |
| Espressif | ESP32-S3 | https://www.espressif.com |

---

*Document v1.0 — COSMO® CIA — LOT Systems, Inc.*  
*Inventor: Vadim Marmeladov — 2026-06-12*
