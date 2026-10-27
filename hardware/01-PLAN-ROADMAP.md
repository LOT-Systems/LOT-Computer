# 01 · Plan & Roadmap — LOT Pager

## 1. Concept
A 40×40 mm stainless-steel "pager" for lot-systems.com. The site's AI decides when to nudge the user ("Coffee time!"); the device shows it on a small screen. Pressing the button acts as **Copy** and writes a `device_copy` entry into the user's **Log** tab. Camera + weather + motion sensors feed back context (opt-in).

## 2. Requirements trace (your 19 points → where handled)
| # | Requirement | Where |
|---|---|---|
| 1 | PCBWay | 06 (PCB, SMT, CNC) |
| 2 | Pager-like AI notifications | 04, 05 |
| 3 | 2-part stainless body | 03 |
| 4 | 4×4 cm × 5 mm silver flat square | 03 (thickness analysis — see risk R1) |
| 5 | Camera | 02, 03, 04 |
| 6 | LOT API connector | 05 |
| 7 | PDF manuals | `pdf/` build (README) |
| 8 | Compress info each session | `STATE.md` + digest at top of each report |
| 9 | Firmware documents | 04 |
| 10 | Software to connect with firmware | 04 §7 (LOT Device Tool) |
| 11 | Separate documents | one file per topic |
| 12, 19 | Charger / wireless charger | 02, 03 (R2) |
| 13 | 100-unit run | 06 |
| 14, 15 | Weather + AI-grade off-the-shelf sensors | 02 |
| 16 | Button "Copy" → Log tab | 05 |
| 17, 18 | Polished back; camera+screen+button front | 03 |

## 3. Roadmap
| Phase | Weeks | Output | Exit gate |
|---|---|---|---|
| **P0 Plan** | 0 | This package | Vadik approves BOM tier A |
| **P1 Server** | 1–3 | `/api/device/*`, `device_copy` log, pairing UI | Simulated device (script) round-trips in Log tab |
| **P2 Dev-kit prototype** | 2–5 | ESP32-S3 dev board + 1.54" TFT + OV2640 + button on breadboard; firmware v0.1 | "Coffee time!" displays; Copy appears in Log |
| **P3 EVT PCB** | 5–10 | 5–10 rigid PCBs (PCBWay), 3D-printed + CNC aluminium test shells | Fits 40×40; Qi + RF window test pass/fail known |
| **P4 DVT** | 10–16 | 20 units, real 316L CNC bodies, polish, battery, certification pre-scan | Thickness, RF range, Qi ≥ 2.5 W at coil, 7-day battery |
| **P5 PVT / pilot** | 16–22 | 100-unit run (06) | ≥ 95 % units pass functional test |
| **P6 Certify & ship** | 18–28 | FCC/CE/UN38.3, manuals PDF, OTA | Certificates in hand |

Critical path: **Qi/RF window decision (R2)** → steel body drawing freeze → 100-unit order. Do not order steel tooling before P3 results.

## 4. Risk register
| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | 5 mm total thickness infeasible | High | High | EVT at 7.5 mm; DVT tries 6 mm with bare-die ESP32-S3 + OV2640 CSP + 3 mm cell; keep 5 mm for the no-camera variant |
| R2 | Steel shields Qi and 2.4 GHz | High | High | Dielectric (ceramic/glass/PEEK) windows: RF slot at the seam between the two halves, Qi window in back mirror (sapphire/ceramic disc) or contact-charge fallback |
| R3 | Battery safety in sealed metal case | Med | High | Protected cell, BQ-class charger w/ NTC, UN38.3 certified cell, vent-free design review |
| R4 | Camera privacy/regulation | Med | Med | Hardware indicator LED tied to camera power, default OFF, explicit opt-in in site settings |
| R5 | Polished mirror shows fingerprints/scratches | High | Low | #8 mirror finish + optional PVD coating; document in manual |
| R6 | Unit cost > target | Med | Med | See 02 totals; steel is ~40 % — evaluate MIM or stamped back plate at volume |
| R7 | Brand assets not yet read | — | Low | HW-02 task |

## 5. Success metrics
- Notification latency (site → screen): < 5 s while on Wi-Fi, < 40 s in power-save.
- Copy press → Log entry visible: < 3 s.
- Battery: ≥ 5 days typical (screen wakes ≤ 30×/day, 30-min sensor cadence).
- 100-unit yield ≥ 95 %.
