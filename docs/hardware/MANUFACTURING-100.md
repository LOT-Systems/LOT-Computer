# Manufacturing — 100-unit run

## 1. PCBWay (req. 1)
- Services: PCB fab + turnkey assembly ([quote](https://www.pcbway.com/pcb-assembly.html)); CNC ([quote](https://www.pcbway.com/cnc-machining-quote.html)). PCBWay quotes assembly manually — no instant price; upload Gerber, BOM (with MPNs), pick-and-place.
- Prototype first (5–10 boards), then 100.
- Expect customs/duties on import (anecdotally up to ~25% for US).
- No public 100-unit price found in research; budget from BOM.md and replace with quotes.

## 2. Electronics
4-layer, ~36×36 mm, antenna keep-out under non-metal window, castellation/test pads for line programming.

## 3. Enclosure (reqs. 3, 4, 17, 18)
- Two 316L parts: **front cup** (screen window, camera hole, button) and **back plate** (mirror polish). Screws or laser-weld; start with 4 × M1.2 screws.
- Polished side: mirror polish (~Ra < 0.05 µm) is a hand/chem-polish step and the main cost driver; bead-blast the front for contrast.
- Non-metal window for antenna/coil (R2). Sapphire/ceramic is costly; PEEK/glass cheaper but less premium.

## 4. Sequence for 100 units
1. EVT boards + steel mock-up RF/Qi test
2. Freeze PCB → PCBWay PCBA ×20 (DVT)
3. CNC ×20 → fit → fix tolerances
4. Pilot 100: PCBA, CNC, polish, assembly, factory test with host tool, serial/pair code
5. QA: sample drop, charge, display, camera, sensor calibration spot-check; ship

## 5. Unknowns
Compliance (FCC/CE/UN38.3), polish yield, lead times, true 100-unit quotes.
