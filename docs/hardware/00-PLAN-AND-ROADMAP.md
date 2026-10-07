# LOT COMPUTER (Hardware) — Plan & Roadmap
Doc: HW-00 · Rev A · 2026-10-07 · Owner: Vadik (Inventor, COSMO® CIA) · Status: PLAN (pre-EVT)

> Source sites (brand / about / CQGS) were **unreachable** from the build sandbox (egress blocked). Brand finish and CQGS grading are not yet applied; see Open Items.

## 1. Product in one line
A 40 × 40 × 5 mm stainless-steel "pager" puck. One face is polished steel. The other face has a small screen, a camera and one button (**COPY**). It receives autonomous notifications ("Coffee time!") from lot-systems.com and reports button presses and sensor readings back to the site's **Log** tab.

## 2. Requirement trace (your 19 points → where handled)
| # | Requirement | Handling | Doc |
|---|---|---|---|
| 1 | PCBWay | Fab + turnkey SMT assembly (PCBA) | HW-01, §6 |
| 2 | Pager-like AI notification | Server push → buzzer/LRA + screen text | HW-03 |
| 3 | 2-part stainless body | 316L: back plate + frame/bezel, laser-welded or 4× M1.2 | HW-02 |
| 4 | Flat silver square 4×4 cm × 5 mm | 40 × 40 × 5.0 mm envelope, R2 corners | §3 |
| 5 | Camera | Ultra-thin FPC module (see risk R1) | HW-01 |
| 6 | LOT API connector | Device endpoints under `/api/device/*` | HW-03 |
| 7 | PDF manuals | Markdown → PDF build (pandoc), per release | §7 |
| 8 | Compress info each session | `SESSION-LOG.md` rolling digest | HW-90 |
| 9 | Firmware documents | Spec + state machine | HW-03 |
| 10 | Software to connect to firmware | Provisioning CLI/web-serial tool | HW-03 §6 |
| 11 | Separate documents | HW-00…HW-03, HW-90 | this folder |
| 12/19 | Charger / wireless charger | Qi receiver coil + standard Qi pad | HW-01 |
| 13 | 100-unit run | Pilot batch, gated by DVT | §5 |
| 14 | Weather sensor | BME688 (T/RH/P/gas) | HW-01 |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC gas AI), LSM6DSO (on-chip ML core) | HW-01 |
| 16 | Button "Copy" → Log tab | `POST /api/device/log {type:"copy"}` | HW-03 |
| 17 | One side polished stainless | Back plate, #8 mirror, no openings | HW-02 |
| 18 | Other side: camera, screen, button | Front frame with glass window | HW-02 |

## 3. Mechanical stack (5.0 mm budget) — the core engineering problem
| Layer | mm |
|---|---|
| Back plate (polished 316L) | 0.6 |
| Qi coil + ferrite (thin, e.g. 0.3–0.5) | 0.5 |
| LiPo (ultra-thin, ~2.0 mm class, ~50–80 mAh) | 2.0 |
| PCB (4-layer, 0.8) + parts | 0.8 |
| Screen module (FPC, ~1.2) / cover glass 0.4 | 1.6 |
| **Total** | **5.5 ✗** |

The naive stack overshoots by ~0.5 mm. Options (decide at EVT): (a) side-by-side layout, screen and camera over a PCB cut-out where the battery sits, (b) relax to 6 mm, (c) drop battery to ~1.5 mm / ~30 mAh and run mostly docked. **Recommend (a) + 5.5 mm fallback.** Validate with a 3D-printed + CNC aluminium dummy before any PCB order.

## 4. Top risks
| ID | Risk | Mitigation |
|---|---|---|
| R1 | Camera modules are usually 6–8 mm thick; 5 mm body needs a ≤2.5 mm FPC module (GC2145/OV2640-class bare FPC) with a pinhole/lens window | Source thin module in EVT; fall back to OV-class 1 mm "endoscope" sensor |
| R2 | **Stainless blocks Wi-Fi/BLE and Qi.** | Antenna under a non-metal window (glass/ceramic/PEEK) on the front; coil faces the glass side → user docks puck **screen-down** on the pad (or use a non-metal ring). Test early (EVT-0 RF test). |
| R3 | Battery life of a Wi-Fi pager in 50 mAh | Duty-cycled: wake every 30–60 s or MQTT keepalive on light-sleep; target ≥2 days off-dock; dock-resident is the default use case |
| R4 | Polished-steel scratches/fingerprints | Specify PVD/DLC optional; accept patina as brand feature |
| R5 | Camera = privacy surface | Hardware shutter-less design → camera only on explicit button hold + LED/screen indicator; no background capture |
| R6 | Cost at 100 units | See HW-01 estimate; steel machining dominates |
| R7 | Certification (FCC/CE for radio) | Use pre-certified ESP32-S3 module; unintentional-radiator testing for pilot; full cert before any sale |

## 5. Roadmap (analysis)
| Phase | Weeks | Exit gate | Est. spend |
|---|---|---|---|
| P0 Plan & freeze requirements (this doc) | 0–1 | Vadik signs HW-00 | $0 |
| P1 Dev-kit proof: ESP32-S3 + breakout screen/BME688/camera on LOT API | 1–4 | Notification → screen+buzz; COPY → Log tab; works on desk | $300–500 |
| P2 EVT: CAD, 3D-print/aluminium dummy, RF-through-glass test, 5 flex/rigid PCB prototypes at PCBWay | 4–10 | Stack ≤5.5 mm, Wi-Fi RSSI OK, Qi ≥ 200 mA | $1.5–3k |
| P3 DVT: 10–20 PCBA + 316L CNC bodies, firmware beta, battery/drop/ingress tests | 10–18 | Firmware freeze, pairing tool, manual v1 | $4–8k |
| P4 PVT / **100-unit run** (turnkey PCBA at PCBWay + CNC bodies) | 18–26 | ≥90% yield, FCC pre-scan | $9–14k |
| P5 Ship pilot, collect Log-tab telemetry | 26+ | Field data → Rev B | — |

Spend and cost figures are **planning estimates, not quotes**. Get a PCBWay quote (1–2 business days after uploading Gerber + BOM + centroid) and a CNC quote before committing.

## 6. PCBWay workflow
1. Design in KiCad (4-layer, 40×40 mm, 0.8 mm, ENIG). 2. Export Gerber, drill, BOM (LCSC/Digi-Key part numbers), pick-and-place. 3. Upload at pcbway.com → *PCB Assembly → Turnkey*. 4. Review DFM comments, then pay. PCBWay also offers CNC machining (stainless) for the bodies, which can keep the run with one vendor. For the 100-unit run request: panelisation, X-ray on any BGA/QFN, functional-test jig fee.

## 7. PDF manuals
`docs/hardware/*.md` are the source of truth. Build: `pandoc HW-0X.md -o HW-0X.pdf`. Release set: User Manual, Quick Start, Firmware Manual, Assembly/Test Manual, Safety & Battery sheet. (User/Quick-start not yet written — P3.)

## 8. Open items for Vadik
1. Confirm **dock screen-down** is acceptable (consequence of R2), or allow a non-metal ring on the back.
2. Confirm thickness: hold 5.0 mm, or accept 5.5–6 mm?
3. "COPY": copy *what*? (Assumed: logs a "copy" event; optionally copies the currently displayed notification text into the Log tab.)
4. Provide brand specs (colors/fonts) and CQGS grading scheme — sites were blocked here; paste or allow-list `*.lot-systems.com`.
5. Confirm `/api/device/*` can be added to the site repo (this repo is the right place).
