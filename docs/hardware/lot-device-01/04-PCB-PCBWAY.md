# LOT DEVICE-01 — PCB and PCBWay Production

**Doc:** HW-04-PCB · **Rev:** A · **Date:** 2026-11-28

## 1. Board specification

| Parameter | Value |
|---|---|
| Outline | 37.0 × 37.0 mm, R2.5 corners, battery cut-out 26 × 31 mm (see note), camera cut-out |
| Layers | 4 (Sig / GND / PWR / Sig) |
| Thickness | 0.6 mm |
| Vias | Laser microvias 0.1/0.25 mm, via-in-pad for the QFN56 thermal pad |
| Min trace/space | 0.075 / 0.075 mm (3/3 mil) |
| Finish | ENIG |
| Mask | Matte black. Silk: none on top; serial number on the bottom |
| Impedance | 50 Ω antenna feed (coplanar waveguide with ground) |
| Tools | KiCad 9 (open source, keeps the files in git) |

Note: the battery does not overlap the components. It sits in a region of the PCB with no parts on the bottom side, or in an outline cut-out, depending on the final placement. The EVT layout tries both.

## 2. Schematic blocks

1. **Power:** Qi coil → BQ51050B (RX + 4.2 V charge) → LiPo → TPS62840 → 3V0 rail. MAX17048 on VBAT. TPS22916 switches 3V0_AUX to the camera and BME688 heater.
2. **SoC:** ESP32-S3FH4R2, 40 MHz crystal, π-match to the chip antenna, native USB to the test pads, BOOT and EN pads.
3. **Screen:** SPI (SCLK, MOSI, CS), plus EXTCOMIN driven by the RTC/LEDC at 1 Hz and DISP enable.
4. **Camera:** 8-bit DVP (HM0360 also supports MIPI; use DVP for the ESP32-S3), XCLK from LEDC, SCCB on I²C bus 1.
5. **Sensors:** BME688 and MAX17048 on I²C bus 0 (400 kHz).
6. **User I/O:** button to an RTC-capable GPIO (wake from deep sleep) with an RC debounce and ESD diode; haptic MOSFET on a PWM GPIO.

## 3. PCBWay order steps (100-unit run)

1. **Gerbers + drill + IPC netlist:** export from KiCad, zip it, and upload at [pcbway.com/orderonline.aspx](https://www.pcbway.com/orderonline.aspx). Choose "HDI", 4L, 0.6 mm, ENIG, 110 pcs.
2. **Assembly:** use [pcbway.com/pcb-assembly.html](https://www.pcbway.com/pcb-assembly.html), Turnkey, double-sided. Upload the BOM (CSV with MPN, qty, ref, alternates) and the centroid (pick-and-place) file.
3. **Parts PCBWay can't source** (Memory LCD, camera module, battery, coil) are sent to PCBWay as consigned parts, or fitted at final assembly. Recommended: fit the screen, camera, coil and battery by hand at final assembly, because they connect by FPC or solder tab.
4. **Inspection:** ask for X-ray on the QFN and AOI, and the "Function Test" option with our pogo-jig firmware (05-FIRMWARE.md §9).
5. **Lead time to plan for:** about 2–3 weeks for PCBA plus 1–2 weeks for CNC, in parallel.

## 4. Files to keep in git (next session)

```
hardware/lot-device-01/
  kicad/          lot-device-01.kicad_pro / .kicad_sch / .kicad_pcb
  mech/           part-a.step  part-b.step  plunger.step  drawings.pdf
  fab/            gerbers.zip  bom.csv  cpl.csv
```

The KiCad project is not started yet. It is the first job of roadmap Phase 1.
