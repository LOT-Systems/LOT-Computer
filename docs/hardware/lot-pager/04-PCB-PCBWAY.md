---
title: "LOT PAGER — 04 · PCB & PCBWay Order Specification"
subtitle: "Hardware programme HW-01 · Rev 0.1 · 2026-11-17"
---

# LOT PAGER — 04 · PCB & PCBWAY ORDER SPECIFICATION

```
DOCUMENT   HW-01 / 04-PCB
VENDOR     PCBWay — PCB, PCBA (turnkey) and CNC (enclosure) from one vendor
EDA        KiCad 8 (open, files versioned in this repo under hardware/ from S2)
```

## 1 · Board

| Parameter | Value |
|-----------|-------|
| Outline | 36.0 × 36.0 mm, R 2.5 mm corners, camera cut-out ≈ 9 × 9 mm |
| Layers | 4 (Sig / GND / PWR+Sig / Sig) |
| Thickness | **0.6 mm** (Rev B) · 0.8 mm (Rev A EVT) |
| Material | FR-4 TG170 |
| Copper | 1 oz outer, 0.5 oz inner |
| Min track / space | 0.1 / 0.1 mm (4/4 mil) |
| Min via | 0.2 mm drill / 0.45 mm pad, tented |
| Surface finish | ENIG (flat for QFN + fine pitch) |
| Solder mask / silk | Matte black / white |
| Impedance | 50 Ω coplanar line for antenna feed — request impedance control |
| Panel | 3 × 3, mouse-bite tabs, 5 mm rails, 3 fiducials, tooling holes |

## 2 · Block diagram → nets

```
 Qi coil ─► BQ51050B ─► VBAT (LiPo 100 mAh, NTC) ─► TPS62840 ─► 3V3
                 └─ CHG_N ─► GPIO4                 └─► MAX17048 (I²C)
 3V3 ─► ESP32-S3FH4R2 ─ 40 MHz XTAL ─ RF π-match ─ chip antenna
        ├─ SPI ─► LS011B7DH03 (SCK 36, SI 35, SCS 37, DISP 38, EXTCOMIN ← RV-3028 CLKOUT)
        ├─ I²C (1/2) ─► BME688 · BMI270 · LTR-303 · MAX17048 · RV-3028 · camera SCCB
        ├─ DVP 8-bit ─► GC0308 FPC (D0–D7, PCLK, VSYNC, HREF, XCLK, PWDN)
        ├─ GPIO3 (RTC) ◄─ COPY switch + TVS
        └─ USB D+/D−, EN, BOOT ─► Tag-Connect TC2030 pads
```

Full pin map lives in `firmware/lot-pager/include/config.h` — the board and
firmware share one source of truth.

## 3 · Layout rules

1. Antenna at the board edge under the glass window, ground keep-out per the antenna datasheet, nothing metal within 3 mm.
2. Qi coil pads + BQ51050B close together; AC1/AC2 traces short and wide.
3. BME688 on an island with a slot around it (thermal isolation from the ESP32 and charger).
4. Battery side (bottom) carries only parts ≤ 0.3 mm in the battery zone; nothing tall.
5. All test points on the bottom side for the pogo jig: 3V3, VBAT, GND, EN, BOOT, TX, RX, USB D±, CHG_N.

## 4 · PCBWay order — fields to fill

| Field | Value |
|-------|-------|
| Order page | https://www.pcbway.com/orderonline.aspx |
| Board type | Panel by PCBWay (3 × 3) |
| Quantity | EVT 10 boards → DVT 20 → PVT 110 (100 + 10 spares) |
| Layers / thickness | 4 / 0.6 mm |
| Impedance control | Yes (50 Ω, provide stack-up request) |
| Surface finish | ENIG 1 µ" |
| Via process | Tenting |
| Assembly | https://www.pcbway.com/pcb-assembly.html — Turnkey, double-sided SMT, X-ray inspection on QFN-56, stencil included |
| Files | Gerber RS-274X, drill, BOM (MPN + LCSC/DigiKey), centroid (XY), assembly drawing PDF |
| Notes to PCBWay | "Do not substitute ESP32-S3FH4R2, BME688, BQ51050B, LS011B7DH03. Programming done by customer." |
| CNC enclosure | https://www.pcbway.com/rapid-prototyping/cnc-machining/ — 316L, polishing as per 03-MECH |

## 5 · Bring-up checklist (each new board rev)

1. Visual + X-ray report from PCBWay.
2. Current-limited 3.0 V on VBAT: idle < 5 mA before flashing.
3. Flash via TC2030: `pio run -e lot-pager-reva -t upload`.
4. I²C scan: expect 0x77, 0x68, 0x29, 0x36, 0x52.
5. LCD test pattern; RV-3028 CLKOUT 1 Hz on scope.
6. Wi-Fi RSSI at 1 m and 8 m through the front glass.
7. Deep-sleep current with PPK2: target ≤ 20 µA.
8. Qi charge from 3.6 V: CHG_N low, < 3 h to full, coil temp ≤ 41 °C.
