# LOT SQ-1 — 100-Unit Pilot Run (PCBWay)

**Document:** LOT-SQ1-08 · **Version:** 0.1 · **Date:** 2026-11-15

## 1. Quantities (with yield allowance)

| Item | Build qty | Why |
|---|---|---|
| PCBA | 115 | 100 + 10% assembly / test fallout + 5 golden / RMA |
| Front frames | 112 | CNC scrap allowance |
| Back plates (mirror) | 118 | Polish rejects run about 10–15% |
| Cover glass | 120 | Breakage during bonding |
| Batteries | 120 | Incoming QC |
| Docks | 105 | |

## 2. PCBWay order sequence

1. **PCB + PCBA (turnkey).** Upload Gerbers, BOM (manufacturer part numbers, from 02-BOM) and centroid file → [pcbway.com/pcb-assembly.html](https://www.pcbway.com/pcb-assembly.html). Ask for X-ray on the QFN/LGA parts, conformal coating off, and a panel with rails for the test jig.
2. **CNC.** Upload STEP files for the frame, back plate and Dock → [PCBWay CNC](https://www.pcbway.com/rapid-prototyping/cnc-machining/). Material **316L**. Finishes: frame bead-blast, back **mirror polish**, and laser marking with per-unit serials SQ1-0001…0118 (CSV).
3. **First-article.** Order 5 units of each first and inspect them (dimensions, polish, fit) before releasing the remaining 95.

Lead times (typical, verify when quoting): PCBA 2–3 weeks, CNC + polish 2–3 weeks, run in parallel.

## 3. Final assembly & test (in-house, LOT)

| Step | Station | Pass criteria |
|---|---|---|
| 1 | Pogo jig flash + self-test | All I²C IDs present (0x76, 0x6A, 0x36), camera frame OK, EPD checkerboard |
| 2 | RF check | RSSI ≥ −65 dBm at 1 m from the reference AP |
| 3 | Qi check on the Dock | Charge current ≥ 300 mA within 10 s |
| 4 | Battery + display bond | Visual, no bubbles |
| 5 | Close the case (4× M1.2, 0.05 N·m) | Seam gap uniform, isolation > 10 MΩ between the two parts |
| 6 | Burn-in 24 h on the Dock, 1-min sync to staging | Zero failed syncs |
| 7 | Pair to the owner account | Shows "Hello, <name>" |
| 8 | Pack with the printed manual (manuals/07) | — |

Throughput: about 15 units per day for one person, so about 8 working days for 100.

## 4. Cost summary (estimate)

| | Per unit | × 100 |
|---|---|---|
| Unit cost (02-BOM §F) | $117–183 | $11.7–18.3k |
| Spares / yield overhead | ~12% | $1.4–2.2k |
| NRE: prototypes, jigs, stencils | | $3.5–6.5k |
| NRE: certification (module path → chip-down path) | | $2–15k |
| **Pilot total** | | **≈ $19k – $42k** |

## 5. Shipping

Li-ion cells need **UN38.3** test reports and a Section II PI967 label (battery inside equipment) for air freight. Request UN38.3 reports from the cell vendor before you order.
