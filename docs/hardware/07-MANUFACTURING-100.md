# 100-Unit Pilot Run Plan (PCBWay-centric)

## Flow
1. EVT: 5 boards, PCBWay rigid-flex + PCBA; 5 CNC shell sets (prototype, before polish).
2. DVT: 20 units; freeze Gerber/BOM/STEP.
3. PVT: 100 PCBA (order 110 for 10 % scrap), 105 shell sets, 110 glass, 110 cells.
4. Assembly: in-house or PCBWay assembly of final product (ask) — pogo flash → `lot-link` QA → seal → mirror clean → pack.

## Estimated cost (unverified, USD)
| Item | Cost |
|---|---|
| PCB+PCBA ×110 (incl. stencil, setup) | 3,500–5,500 |
| Stainless shells ×105 sets, incl. polish | 9,000–13,000 |
| Glass, gasket, LRA, battery, misc | 2,500–3,500 |
| Test jig + pogo fixtures | 500–1,000 |
| Prototypes/NRE (EVT, DVT) | 2,000–3,500 |
| Certification (FCC test, UN38.3 docs) | 5,000–8,000 |
| Packaging, shipping, duties | 800–1,500 |
| **Total** | **≈ 23–36k all-in** (≈ 16.5–23.5k excl. NRE & cert) |

## QA gates per unit
Visual → flash+pair → sensor self-test → Wi-Fi RSSI → button → camera frame → Qi charge 5 min → leak/gap check → serial label.

## Traceability
Serial = `LOT-P1-YYMM-NNN`; stored with token fingerprint, fw version, QA CSV.
