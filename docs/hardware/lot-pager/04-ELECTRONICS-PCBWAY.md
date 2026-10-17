# LOT® PAGER — Electronics & PCBWay

## 1. Block diagram
```
[Qi coil]→[BQ51013B]→5V→[BQ25185]→[Li‑Po]→[MAX17048]
                                  └→[TPS62840]→3V3→ ESP32‑S3‑MINI‑1U
ESP32‑S3 ─ SPI ─ Display (ST7789)
         ─ DVP ─ Camera (OV2640/5640) + SCCB
         ─ I²C ─ BME688, BMI270, VEML7700, MAX17048
         ─ GPIO ─ Button, LED, buzzer/LRA
         ─ u.FL ─ external 2.4 GHz antenna on non-metal window
```

## 2. PCB spec (PCBWay quote sheet)
| Item | Value |
|---|---|
| Outline | 38 × 38 mm with corner R3 (1 mm clearance to steel) |
| Layers | 4 (SIG/GND/PWR/SIG) |
| Thickness | **0.8 mm** (not standard 1.6 — z-height) |
| Min trace/space | 0.1 / 0.1 mm (4/4 mil) |
| Finish | ENIG |
| Via | 0.2/0.4 mm, filled/capped under BGA/WCSP |
| Copper | 1 oz outer, 0.5 oz inner |
| Impedance | 50 Ω on antenna and camera lines, controlled |
| Colour | Black/matte |
| Assembly | Both-side SMT, turnkey (PCBWay sources parts) or consigned |
| Stencil / test | Yes; flying probe |
| Quantities | Proto 5 → EVT 10 → DVT 25 → run 100 (+10 %) |

Feasibility: a flex-rigid is better for v1 (display + coil + camera on flex fold). PCBWay quotes flex and rigid-flex; ask for stack-up review for 0.8 mm 4-layer.

## 3. PCBWay workflow
1. Design in KiCad 8 (open format, produces Gerbers + BOM + CPL).
2. Upload Gerbers at https://www.pcbway.com/orderonline.aspx for fab quote.
3. Use PCBWay Assembly for BOM sourcing (https://www.pcbway.com/pcb-assembly.html); expect 2–3 line items to be "unavailable" → consign those (BQ51013B, BME688 shortages are common).
4. Add the CNC stainless job at https://www.pcbway.com/cnc-machining-quote.html (STEP + drawing + polish spec).
5. Request DFM report before paying.

## 4. Design rules / checklist
- Keep camera DVP traces < 50 mm, matched ±5 mm.
- Decouple ESP32‑S3 per datasheet (3V3 ≥ 10 µF + 100 nF on each supply pin); 500 mA peak on TX.
- Qi coil keep-out: no copper on layers under the coil; ferrite shield between coil and battery.
- Battery: protection IC, thermistor on pack, never charge < 0 °C.
- ESD (TPD4E05U06) on button and any exposed pad.
- Test points for UART0, SWD-equivalent (USB-JTAG on S3), 3V3, 5V, BAT, I²C.
- Programming: pogo-pin pads (4-pin: 3V3/GND/D+/D−) on PCB edge reachable only with shell open; no USB port on finished unit.
