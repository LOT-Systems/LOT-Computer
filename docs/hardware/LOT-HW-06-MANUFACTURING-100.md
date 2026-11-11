# LOT-HW-06 — Manufacturing: 100-Unit Run

## PCBWay flow
1. KiCad 8 → Gerbers, drill, centroid, BOM (LCSC part numbers).
2. PCBWay PCB + turnkey PCBA. Consign the display, battery, Qi coil and camera.
3. Spins: **5 EVT → 20–30 DVT → 110 PVT** (10 % spare).
4. Steel: PCBWay CNC 316L, 2 parts (back shell A + front bezel B). Side A mirror polish (600→1500 grit + buff), side B bead-blast. Ask for a DFM review on 0.6 mm walls (R7).

## Assembly (per unit)
PCBA → battery + coil (adhesive) → glass into bezel (UV glue) → PEEK/silicone gasket → close (4 × M1.2 hidden screws on B, or laser weld at PVT) → test.

## Test jig (≤ 90 s/unit)
Pogo pins on test pads (3V3, GND, USB D+/D−, EN, IO0). Steps: flash → write the device token into NVS → screen pattern → button → BME reading in range → Wi-Fi RSSI ≥ −70 dBm at 1 m → Qi charge current > 100 mA → label + serial.

## Compliance (needed only if you sell)
FCC Part 15B (+ ESP32 modular grant for 15C) · CE-RED for the EU · UN38.3 + MSDS for battery shipping · do not use the Qi logo without WPC certification ("wireless charging" is fine). Pre-scan budget is $3–10k. Internal or gift units need far less.

## Cost at 100 units (estimates)
Parts about $63/unit · NRE (jig, fixtures, CNC programs, first-article) about $3–6k · compliance $3–10k → **about $15–30k total**.
