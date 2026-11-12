<!--
  LOT SYSTEMS CORPORATION
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT-01 — MANUFACTURING: 100-UNIT RUN VIA PCBWAY
================================================================================
DOCUMENT    HW-07 / MFG
ISSUE       2026.11.12 · REV A
QUANTITY    110 built (100 ship + 10 spares / returns / test)
================================================================================
```

## 1 · WHAT PCBWAY BUILDS

| Order                 | PCBWay service              | Files to upload                                   |
|-----------------------|-----------------------------|---------------------------------------------------|
| Bare PCB              | Advanced PCB (HDI)          | Gerbers, drill, stack-up note (6L 0.6 mm, ENIG, via-in-pad, impedance 50 Ω for RF) |
| PCB assembly          | Turnkey PCBA                | BOM (CSV), centroid/pick-and-place, assembly drawing; request X-ray for LGA/QFN |
| Steel body + button   | CNC machining               | STEP + 2D drawing (HW-03 §4), finish callouts     |
| Dock ring             | CNC machining               | STEP + 2D drawing                                 |

Order URLs (verify): https://www.pcbway.com/orderonline.aspx ·
https://www.pcbway.com/pcb-assembly.html · https://www.pcbway.com/rapid-prototyping/

Not from PCBWay: cover glass (custom glass vendor), LiPo cells (cell
maker with UN38.3), Qi TX modules, packaging.

## 2 · ORDER NOTES

- Consign or let PCBWay source: ESP32-S3-PICO-1, BQ51050B, BME688 are
  usually stocked; the Sharp LCD and GC0308 module are **not** SMT parts —
  they are hand-connected (FPC) at final assembly, not by PCBWay.
- Ask for panelization with tooling rails; 0.6 mm boards flex.
- Ask for the PCBA to be flashed with the **factory test firmware** via the
  pogo pads if PCBWay offers programming; otherwise flash on the jig.

## 3 · FINAL ASSEMBLY (per unit, ≈ 12 min)

1. Jig test PCBA (below). Record S/N + MAC.
2. Fit coil + ferrite, connect LCD FPC and camera FPC.
3. Bond cover glass to the bezel (die-cut adhesive, 30 s press, 0.5 kg).
4. Fit COPY cap + switch; place GORE vent behind the edge slot.
5. Battery into the back cup (adhesive pull-tab); connect.
6. Place PEEK gasket; close with 4 × M1.2 Torx at 0.06 N·m.
7. Charge test on a Dock face-down; final functional test.
8. Peel protective film only at QC photo; re-film for packing.

## 4 · TEST JIG (pogo bed)

| Step              | Pass criteria                                       |
|-------------------|-----------------------------------------------------|
| Power             | 3V3 within ±3 %; sleep current ≤ 25 µA               |
| Flash + S/N       | Factory FW flashed; S/N written to eFuse/NVS         |
| I²C scan          | BME688 0x76, BMI270 0x68, MAX17048 0x36 present      |
| BME688            | T within ±2 °C of reference; gas heater responds     |
| Camera            | Frame captured; mean luma within window              |
| LCD               | Checkerboard + text; operator visual check           |
| Button / motor    | Press detected; motor current 40–80 mA               |
| RF                | Join jig AP; RSSI ≥ −55 dBm at 1 m (open board)      |
| Qi                | CHG goes low on jig TX coil within 5 s               |

Jig: 3D-printed fixture + 6 pogo pins + USB-serial + a laptop script.
Estimated cost US$ 900 (in HW-02 NRE).

## 5 · QA SAMPLING

- 100 % jig + functional test.
- 10 % cosmetic inspection under 1000 lux (mirror side: no scratch > 0.2 mm).
- 5 units: 48 h soak (poll every 60 s), 1 m drop × 10 on wood, 2 h on
  Dock at 25 °C (case ≤ 42 °C).
- First article: 3 units CMM on the steel parts.

## 6 · LOGISTICS

- LiPo shipping needs the UN38.3 report and MSDS from the cell maker.
- Packaging: rigid box 70 × 70 × 30 mm, foam insert holds device + Dock,
  cable, one printed card with a QR to the PDF manual.
- Serial format: `LOT01-<build>-<NNNN>`, e.g. `LOT01-PVT-0042`.

## 7 · TIMELINE FOR THE RUN (after DVT sign-off)

| Week | Step                                              |
|------|---------------------------------------------------|
| 0    | Place PCB/PCBA, CNC, glass, cell orders            |
| 2–3  | PCBA arrives; jig-test all                         |
| 3–4  | CNC bodies + glass arrive; first article           |
| 4–6  | Final assembly 110 units (≈ 22 h of labor)          |
| 6–7  | QA, soak, pack                                     |
| 7–8  | Ship                                               |
