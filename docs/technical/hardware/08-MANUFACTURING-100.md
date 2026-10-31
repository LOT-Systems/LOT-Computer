# LOT PLATE — 100-Unit Run: PCBWay & Cost (HW-08)

REV A · 2026-10-31 · All figures ESTIMATE; no live quotes obtained (sandbox offline to vendors). Get real quotes in P2.

## PCBWay scope
| Service | Use | Link |
|---|---|---|
| PCB fab | 4L 0.8 mm ENIG | https://www.pcbway.com/ |
| PCB assembly (turnkey/consigned) | SMT both sides, X-ray BGA/QFN check | https://www.pcbway.com/pcb-assembly.html |
| CNC machining | 316L front/back, polish | https://www.pcbway.com/cnc-machining-quote.html |
| 3D printing (EVT-1 body) | SLA/MJF | https://www.pcbway.com/rapid-prototyping/ |
Upload: Gerbers, BOM (MPN + LCSC/DigiKey #), CPL, drawings (STEP + PDF with tolerances ±0.05, Ra callout). Ask for DFM review before P2.

## Cost model (qty 100, USD)
| Line | Per unit | x100 |
|---|---|---|
| Electronics BOM (02-A) | 42.5 | 4,250 |
| PCB + SMT + test (ESTIMATE 14–20) | 17 | 1,700 |
| Steel x2 + polish + glass + isolator (46–86) | 66 | 6,600 |
| Dock (custom puck) | 15 | 1,500 |
| Packaging + QA + shipping in | 8 | 800 |
| **Unit subtotal** | **148.5** | **14,850** |
| NRE: stencil/jig/fixtures/CAD review | | ~1,500 |
| Pre-compliance + UN38.3 cell docs | | ~3,000 |
| FCC/CE formal (only if sold; ESTIMATE 8–15k) | | 0–15,000 |
| Prototype iterations P1–P4 (10+10+30 units) | | ~6,000 |
| **Run total** | | **≈ $25k internal / ≈ $40k sellable** |
Spare 10 % yield buffer (110 starts) adds ≈ $1.5k.

## Quality & shipping
Incoming: sample AQL on steel (flatness, Ra, aperture position). EOL jig: flash, sensors, Wi-Fi ping to test server, button, Qi, camera. Serial + QR (hwId). Batteries: UN38.3 transport, ship by ground/sea or certified air with <100 Wh, packed per PI 967/966.

## Schedule (see 03): order P6 materials Jul 2027, ship Sep 2027 (lead time CNC 2–3 wk, PCB 2 wk, assembly 2 wk, ESTIMATE).
