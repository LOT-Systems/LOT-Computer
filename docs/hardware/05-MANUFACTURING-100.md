<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA — Vadik, Inventor
  Made in the USA | brand.lot-systems.com
-->

# 05 — Manufacturing, 100-Unit Run, Manuals

## PCBWay path
1. Fab + assembly (PCBA) turnkey: https://www.pcbway.com/pcb-assembly.html — 4-layer, 0.8 mm, ENIG, 40×40 mm; upload Gerbers, BOM, pick-and-place; DFM review.
2. Machining/stainless: https://www.pcbway.com/cnc-machining-quote.html — 316L, two parts, mirror polish on the back plate; request tolerance ±0.05 mm and sample of finish.
3. Prototype lots: 5 -> 20 -> 100. Ask PCBWay for functional test jig quote for 100 units.

## Body
- Part 1 (face frame): window pocket, button bore, camera bore, internal bosses.
- Part 2 (back plate): flat 1.0 mm, mirror polish, optional laser engraving (serial + brand mark per brand.lot-systems.com — pending).
- Joint: 4 × M1.2 screws or laser weld (welding makes service impossible -> screws in v1).

## Charger
Qi 5 W pad (off-the-shelf) in v1; USB-C service port is not exposed (thickness) — use pogo pads for flashing.

## Test & quality
Per-unit: boot, Wi-Fi join, sensor read, screen pattern, button, camera frame, charge current, serial burn. Sample: reflow profile check, drop 1 m, 60 °C soak.

## Manuals (PDF)
Source Markdown in docs/hardware/manuals/ -> PDF via pandoc: Quick-Start (1 page), User Manual, Service/Provisioning Manual, Firmware Manual (03), API Manual (04), Safety & Compliance sheet (battery, RF). Build step to be added to CI in P4.
