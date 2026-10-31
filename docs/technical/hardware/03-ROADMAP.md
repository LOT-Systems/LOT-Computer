# LOT PLATE — Roadmap & Analysis (HW-03)

REV A · 2026-10-31 · Dates are ESTIMATE from today; one-person-plus-AI cadence assumed. Gate = go/no-go for S-2.

| Phase | Window | Output | Gate (exit criteria) |
|---|---|---|---|
| P0 Plan | Oct–Nov 2026 | These docs, S-2 answers to Q1–Q7 | R1–R3 decisions made |
| P1 Breadboard | Nov–Dec 2026 | XIAO ESP32S3 Sense + BME688 + screen; firmware skeleton talks to server; **server `/api/device/*` shipped** (Ship Mode) | Notification appears on screen ≤30 s; COPY writes a Log entry; 24 h soak |
| P2 EVT-1 PCB | Jan–Feb 2027 | 10 boards PCBWay (assembled), 3D-printed/Al body | Boots, Wi-Fi, all sensors read, camera frame, Qi charges battery |
| P3 EVT-2 steel | Mar 2027 | 10 x 316L two-part bodies + glass window + isolator | **RF + Qi measured through real steel** (go/no-go for design) |
| P4 DVT | Apr–Jun 2027 | 30 units, 5.0 mm attempt (bare S3, thin cell), jig, drop/thermal | ≥90 % yield; battery ≥5 days @ 10 notif/day; pre-compliance scan |
| P5 PVT | Jul 2027 | 100-unit pilot build drawing from frozen BOM | Cpk on polish/fit; UN38.3 + FCC/CE plan done |
| P6 Run | Aug–Sep 2027 | 100 units shipped | RMA < 5 % in 30 days |

## Critical path
Steel-window RF/Qi result (P3) → everything. Pull a cheap proof forward: in P1 buy a 40x40 mm 316L blank with a pocket (PCBWay CNC, ~$60 x 3) and test Wi-Fi RSSI + Qi with a Qi RX dev board **before** committing PCB layout.

## Risk register
| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R1 | 5 mm stack infeasible | H | H | Stack budget in 04; decide EVT 7.5 / DVT 6 / goal 5 |
| R2 | Steel kills RF | H | H | Isolator seam + glass window; external flex antenna on seam edge; test P1 |
| R3 | Steel blocks Qi | H | H | Glass window over coil; fallback pogo |
| R4 | Thin LiPo supply / safety (UN38.3, swelling) | M | H | Use protected cell from certified vendor; no custom cell for 100 units if MOQ high |
| R5 | Camera ≤2.5 mm sourcing | M | M | OV2640 CSP flex module; or drop camera on rev B |
| R6 | Polish scratching in handling | M | L | Film + QA gloves; PVD optional |
| R7 | Certification (FCC/CE) cost if sold | M | M | Pre-certified module; modular approval needs intact antenna, may need re-test in metal (≈$8–15k ESTIMATE) |
| R8 | Privacy (camera) | M | H | Shutter or LED + log every capture to Log tab; no auto-upload |
| R9 | Server abuse via device tokens | M | M | Scoped tokens, rate limit, revoke in Settings |
| R10 | Scope: COSMO® confusion | L | M | Brand line in About: PLATE ≠ COSMO® |

## Analysis (honest)
- Software side is low risk and fast (P1 in ~4 weeks). Hardware side is dominated by the steel enclosure, not the electronics.
- Cost drivers at 100 units: CNC steel (≈40 %) and polish. Doubling qty to 200 cuts per-unit steel ≈15 % (ESTIMATE).
- Cheapest way to cut risk: build P1 first, then a "steel test coupon" — both < $300.
- Schedule slack: none for certification if units are sold; internal/beta units avoid it.
