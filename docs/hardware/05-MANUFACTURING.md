# 05 — MANUFACTURING (PCBWay, 100-unit run)

## Flow
1. **Gerber/BOM/CPL** from KiCad → PCBWay PCB + turnkey SMT (https://www.pcbway.com/pcb-assembly.html). 4-layer 0.8 mm ENIG, 38×38 mm, DFM review.
2. **Body**: STEP/DXF → PCBWay CNC (316L) (https://www.pcbway.com/cnc-machining-quote.html). Ask for: mirror polish #8 on plate, passivation, flatness 0.02, ±0.05 on pocket. If polish quote is poor, order machined parts and have a polishing shop finish them.
3. **Glass window**: custom cut/print vendor (PCBWay or Alibaba glass-cover vendors). 0.5 mm, AR.
4. **Final assembly in-house**: battery, window adhesive (3M 468MP / OCA), gasket, screw/weld. 100 units ≈ 2 days with a jig.
5. **QA**: see below. **Pack**: foam tray + puck charger + card.

## Stages
| Stage | Qty | Gate |
|---|---|---|
| EVT (proof of concept, dev boards) | 1–2 | Notification → screen → Copy → Log tab works |
| DVT (custom PCB + printed/ordered shells) | 5 | Stack fits 5 mm; Qi charges; Wi-Fi RSSI OK behind steel |
| PVT (pilot) | 20 | 72 h soak, drop 1 m, QA yield ≥ 90 % |
| **MP-1** | **100** | Release by S-2 |

## QA checklist per unit
Visual (mirror scratches), flatness, boot, Wi-Fi join, screen pixel test, button, each sensor ID, camera frame hash, Qi charge 10 min, battery cutoff, OTA to current, serial/key registered, label printed.

## Compliance
Pre-certified Wi-Fi module + Qi RX IC; run FCC Part 15B/CE-RED pre-scan (~$1–3k) before selling. Li-ion: UN38.3 for shipping (cell vendor cert), battery < 100 Wh. RoHS/REACH declaration from PCBWay.

## Budget
~$13–18k (see 01-BOM). Lead time: DVT 3–4 wks; MP-1 4–6 wks after PVT sign-off.
