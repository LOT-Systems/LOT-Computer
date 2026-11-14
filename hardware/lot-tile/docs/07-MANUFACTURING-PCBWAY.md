# 07 · Manufacturing: 100-Unit Run with PCBWay

**Doc:** LOT-HW-01-MFG · **Rev:** A (2026-11-14)

PCBWay does all four of the main manufacturing steps: PCB fabrication, PCBA (turnkey parts), CNC machining in stainless steel with polishing, and box build.
Running all of them through one vendor makes the run simpler to manage.

| Service | Link | What we order |
|---------|------|---------------|
| PCB fabrication | https://www.pcbway.com/orderonline.aspx | 4-layer, 0.6 mm (EVT) / 0.4 mm HDI (DVT), ENIG, 36 × 36 mm, panelised 3 × 3 with mouse bites |
| Flex PCB (optional) | https://www.pcbway.com/flexible-pcb-manufacturer.html | Camera/antenna/LRA flex, polyimide, 0.1 mm |
| PCB assembly | https://www.pcbway.com/pcb-assembly.html | Turnkey for commodity parts. Consigned: display, camera, cell |
| CNC machining | https://www.pcbway.com/rapid-prototyping/cnc-machining/ | 316L back tray and front bezel, #8 mirror polish, laser marking |
| Box build | https://www.pcbway.com/ (quote by email) | Final assembly, test and packaging (PVT) |

## 1. Build phases and quantities

| Build | Qty | PCB | Enclosure | Purpose |
|-------|----:|-----|-----------|---------|
| EVT-0 | 3 | Dev kits on breadboard | 3D-printed (SLA) | Firmware and API bring-up |
| EVT-1 | 10 | Custom PCB, module | 5 CNC + 5 SLA | Electrical validation, RF in a steel box, Qi through the window |
| DVT | 20 | Chip-down if D-2 = 5 mm | CNC, final finish | Thermal, drop, battery life, cosmetics, pre-scan for FCC |
| **PVT / run** | **100 (+10 spares)** | Final | CNC + polish | Customer units |

## 2. Files PCBWay needs

- Gerbers (RS-274X) and NC drill, a stack-up note, and impedance control on the antenna feed (50 Ω)
- Centroid / pick-and-place (`.csv`) and assembly drawing (top and bottom)
- BOM in PCBWay format: export `docs/bom.csv` with columns `Designator, Qty, MPN, Manufacturer, Description, Package`
- STEP files for the enclosure plus 2D PDF drawings with tolerances (03 §7)
- Finish spec: "#8 mirror on the outer back face, Ra ≤ 0.05 µm; side walls #4 brushed vertical; no tool marks; protective film before shipping"

## 3. Estimated run cost at 100 units (USD)

These are estimates for planning, not quotes.

| Line | Estimate |
|------|---------:|
| Material (02-BOM, EVT variant) | 10 425 |
| PCB fab + PCBA labour, stencil, X-ray for QFN/LGA | 1 800 |
| CNC NRE / set-up, first-article samples | 900 |
| Test fixture (bed of nails, pogo, Tag-Connect, Qi pad) | 600 |
| Final assembly + test labour (~15 min/unit) | 1 000 |
| Freight (DDP) + battery dangerous-goods surcharge | 600 |
| **Run subtotal** | **≈ 15 300 (≈ $153 per unit)** |
| FCC (module path: Part 15B + modular grant reuse + SAR exempt check) | 3 000 – 5 000 |
| FCC (chip-down path: full Part 15C intentional radiator) | 10 000 – 18 000 |

## 4. Certification and compliance

- **FCC (USA):** the EVT/PVT module path reuses the Espressif modular grant, and the unintentional-radiator test (Part 15B) is still required.
  The label shows "Contains FCC ID: 2AC7Z-ESPS3MINI1" on the laser-marked back. Re-check the grant for the exact module variant.
- **Qi:** "Qi-compatible" wording only. "Qi Certified" (WPC logo) needs WPC membership and testing, which is not budgeted for 100 units.
- **Battery transport:** UN38.3 test summary and MSDS from the cell vendor, IATA PI 967 (cells inside equipment).
- **RoHS / REACH** declarations from PCBWay and the cell vendor. **Prop 65** check for the California market.
- **WEEE / battery** labels if selling to the EU (out of scope for the first 100).

## 5. Final functional test (each unit)

1. Program and run the factory test (05 §7). The fixture logs pass/fail to `test-log.csv`, keyed by serial.
2. Qi: place on the reference pad. CHG_STAT must assert within 5 s, and charge current must be within ±15 %.
3. Wi-Fi: associate to the fixture AP. RSSI must be ≥ −65 dBm at 1 m, with the enclosure closed.
4. Camera: capture a target chart and check the JPEG hash range plus mean luminance.
5. Haptic: LRA back-EMF auto-calibration passes on the DRV2605L.
6. Cosmetic: inspect the back mirror under a D65 light booth, then fit the protective film.
7. Ship in "unpaired" state. The first press shows a pair code.
