<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 04 · PCB AND PCBWAY ORDERING

```
DOCUMENT   HW-04 / PCB
ISSUE      2026-11-26 · rev 0.1
EDA        KiCad 8 (open; PCBWay accepts the Gerbers + a KiCad BOM/CPL directly)
```

## 00 · BOARD SPEC

| Parameter | Value |
|-----------|-------|
| Outline | 37.2 × 37.2 mm, 2 Ø1.3 mounting holes for the M1.2 frame bosses |
| Layers | 4 (Sig / GND / PWR / Sig) |
| Thickness | **0.6 mm** |
| Min trace / space | 0.1 / 0.1 mm (4/4 mil) |
| Vias | 0.2 mm drill, 0.4 mm pad. Via-in-pad, filled and capped, for the BGA/WLP parts |
| Finish | ENIG (flat surface for the 0.4 mm-pitch WLP and the dome pad) |
| Mask / silk | Matte black / white. No silk on the dome pad |
| Impedance | Not needed. The module carries the RF; keep GND clear under the antenna |
| Assembly | Double-sided. Top: display FPC connector, dome pad, camera connector, BME688, LTR-303. Bottom: module, BQ51050B, buck, gauge, BHI260AP, haptic driver |

## 01 · SCHEMATIC BLOCKS

```
VBAT (LiPo 3.0–4.2 V) ─┬─ BQ51050B (Qi RX + CC/CV 4.20 V, ~50 mA ICHG) ◀── L1 coil
                       ├─ MAX17048 (I2C 0x36, ALRT → GPIO wake)
                       └─ TPS62840 → 3V3 ──┬─ ESP32-S3-MINI-1
                                           ├─ LS013B7DH03 (SPI: SCLK, SI, SCS; EXTCOMIN 1 Hz; DISP)
                                           ├─ Camera (DVP 8-bit + XCLK + SCCB), load-switched
                                           ├─ BME688 (I2C 0x76), thermal island
                                           ├─ BHI260AP (I2C/SPI host, INT → RTC GPIO wake)
                                           ├─ LTR-303ALS (I2C 0x29)
                                           └─ DRV2605L (I2C 0x5A) → ERM
COPY dome → RTC GPIO (ext0 wake) + 100 kΩ pull-up + TPD1E10B06
Test pads: 3V3, GND, EN, IO0, U0TXD, U0RXD, VBAT — on a 1.27 mm pogo pattern for the EOL jig
```

**Design rules that matter here:**

- Antenna end of the module at the board edge, with no copper on any layer under it.
  Keep 3 mm or more from the steel frame.
- Load-switch the camera (TPS22916). It must draw 0 µA in sleep.
- Drive EXTCOMIN for the memory LCD from an RTC-domain pin or the LEDC peripheral in light
  sleep. In deep sleep, hold DISP high and put up with slow fade only if the panel's
  datasheet allows it. **Verify this in P1.**
- Put the BME688 on a thermal island: a slotted board area with no pour, near the vent.

## 02 · PCBWAY ORDER, STEP BY STEP

1. **PCB:** go to https://www.pcbway.com/orderonline.aspx and choose standard PCB, 4 layers.
   - Size 37.2 × 37.2 mm, qty 5 (EVT-1) / 20 (DVT) / 110 (RUN-100).
   - 0.6 mm, ENIG, 4/4 mil, 0.2 mm min hole.
   - Select "Via in pad, epoxy filled and capped".
2. **Assembly (PCBA):** go to https://www.pcbway.com/pcb-assembly.html and choose **Turnkey**, so PCBWay sources the parts.
   - Upload `bom.csv` and `cpl.csv`, exported from KiCad with the PCBWay plugin.
   - Mark the module, display and camera as **consigned or not populated** if they are sourced separately.
   - Ask for an **X-ray inspection** of the WLP and LGA parts.
3. **Stencil:** framed, both sides, 0.08 mm, electropolished. This is needed for 0.4 mm-pitch parts.
4. **CNC enclosure (same vendor):** go to PCBWay → Rapid Prototyping → CNC Machining. Upload the STEP files and choose
   316L, with finish "Polishing" on P2. Ask for a DFM review on the 0.4 mm back plate, which will flex.
5. **Expected lead times** (typical, not quoted):
   - PCB: 5–7 days.
   - PCBA: +7–12 days once parts arrive.
   - CNC: 7–15 days.
   - Polish: +5 days.

## 03 · EVT-1 CHECKLIST, before upload

- [ ] ERC/DRC clean. Every footprint checked against its datasheet, especially the camera FPC pinout, which varies by vendor.
- [ ] Antenna keep-out confirmed against the 03 mechanical STEP.
- [ ] Coil footprint and ferrite placed under the inlay centre.
- [ ] Test-pad pattern matched to the EOL jig (08).
- [ ] Fiducials: 3 per side.
- [ ] Panel: 2 × 2 with mouse-bite tabs, so the 0.6 mm boards do not flex during SMT.
