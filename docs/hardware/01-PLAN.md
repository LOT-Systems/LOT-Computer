# 01 — Plan: LOT Computer (working name "LOT Pager")

Owner: Vadik, Inventor — COSMO® CIA. Date: 2026-10-18. Status: DRAFT v1.

## 1. Concept
A pocket object that receives autonomous notifications from lot-systems.com (e.g. "Coffee time!"), shows them on a small screen, and sends a signal back when its button is pressed ("Copy" → an event on the site's Log tab). It carries a camera, a weather/environment sensor, and charges wirelessly. It is the first physical endpoint of the LOT API; it is distinct from COSMO® (the robotics division, target 2028–2029 per About.tsx) and can serve as its first sensor/notification node.

## 2. Requirement map (your 19 items)
| # | Item | Plan |
|---|---|---|
| 1 | PCBWay | PCB fab + turnkey assembly (SMT) at PCBWay; also their CNC service for steel as an option (quote vs. a dedicated CNC shop). |
| 2 | Pager-like notification from AI site | Server-side "device notifications" queue; AI generates text; device polls/receives. See 03. |
| 3 | 2-part stainless body | Part A: polished back plate. Part B: front bezel/frame. 316L or 304. Laser-weld or screw (4x M1.2) joined; gasket optional. |
| 4 | Flat silver square 40x40 mm, 5 mm | Target for DVT. EVT is ~8 mm (see §3). |
| 5 | Camera | Thin DVP module (OV2640-class) on FPC; stills only for MVP. |
| 6 | LOT API connector | Device token auth over HTTPS; endpoints in 03. |
| 7 | PDF manuals | Generated from Markdown (04). |
| 8 | Compress info per session | "Compressed state" block in README.md, updated each session. |
| 9 | Firmware documents | 03-FIRMWARE-API.md + per-release changelog in `firmware/`. |
| 10 | Software to connect with firmware | Browser flasher (Web Serial / esptool-js) + pairing page on the site. |
| 11 | Separate documents | This folder. |
| 12 | Charger | Qi-style puck/pad (off-the-shelf 5 W) for EVT; custom branded pad at DVT. |
| 13 | 100-unit run | PVT/pilot run after DVT. See roadmap. |
| 14 | Weather sensor | Bosch BME280 (T/RH/pressure) at minimum; BME688 adds gas/IAQ. |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC gas AI), QMI8658 or BMI270 IMU, ambient light. No custom sensing silicon. |
| 16 | Button = "Copy" → Log tab | Button press POSTs `device_copy` event; Log tab shows it (needs one list entry, see 03). |
| 17 | One side polished stainless | Part A, mirror polish (#8/BA finish). |
| 18 | Other side: camera, screen, button | Part B with three apertures. |
| 19 | Wireless charger | Qi RX coil + BQ51013B-class receiver + LiPo charger. |

## 3. Mechanical feasibility (honest check)
Z-stack at 5 mm total (all in mm):
| Layer | Thickness |
|---|---|
| Back plate wall | 0.6 |
| Front bezel/top wall | 0.6 |
| Display module (1.3" IPS, FPC folded) | ~2.0 |
| PCB (4-layer, 0.8) + tallest components | ~1.2 |
| Battery (thinnest realistic ~2.0–3.0) | 2.0+ |
| Ferrite + Qi coil | ~0.6 |
| **Sum** | **~7–8** |

Conclusion: 5 mm is **not achievable** with screen + camera + battery + coil all in one layer stack. Options: (a) EVT/DVT at 8–9 mm, then thin down; (b) put battery beside, not under, the screen (40x40 area is tight, forces a smaller battery ~50 mAh); (c) drop the camera or use a flex-only ~2.5 mm class module. **Recommendation: build EVT at 8 mm, validate function, then attack 5 mm in DVT with a 0.8–1.0 mm cell and flex camera.**

Wireless-charging risk: **stainless steel shields Qi**. The coil must face a non-metal surface. Options: glass/sapphire window or PEEK/ceramic insert on the charging side; or charge through the front bezel side where the display glass sits (coil mounted around/behind a non-metal area). Do not let a fully-steel back plate cover the coil. This conflicts with "polished steel back" unless the back has an insert disc — or the charger contacts the *front* (glass) side. Needs decision D2.

Other: steel body kills the Wi-Fi/BLE antenna. Use an external/ceramic antenna at a non-metal window edge (or a slot in the frame filled with polymer). Antenna keep-out is the #2 mechanical risk.

## 4. Decisions needed from you (default in bold)
- D1 EVT height: **8 mm** / hold 5 mm.
- D2 Charging side: **front glass side** / insert in back plate.
- D3 Connectivity: **Wi-Fi poll (ESP32-S3)** / BLE to phone.
- D4 Screen: **1.3" 240x240 IPS square (ST7789)** / OLED / e-paper.
- D5 Camera for MVP: **yes, stills** / defer to v2.

## 5. Roadmap
| Phase | Weeks (from go) | Output | Exit gate |
|---|---|---|---|
| 0 Decisions | 0–1 | D1–D5, brand skin from brand.lot-systems.com | signed off |
| 1 Breadboard POC | 1–4 | Waveshare ESP32-S3 + BME280 + button; polls the LOT API, shows "Coffee time!", button→Log tab | end-to-end demo |
| 2 EVT (custom PCB) | 4–10 | KiCad schematic/layout, 5–10 PCBs from PCBWay, 3D-printed shells | boots, charges, camera still, sensors OK |
| 3 Mechanical | 6–14 | CAD, 5 steel sample sets (2 parts each), polish spec | fits, antenna passes range test |
| 4 DVT | 14–22 | 20 units, steel body, firmware v0.9, manuals draft, EMC pre-scan | 7-day soak, charge cycles |
| 5 Certification | 18–30 | FCC/CE (radio module pre-certified helps), battery UN38.3, RoHS | reports |
| 6 PVT / 100-unit run | 30–38 | 100 units, PDF manuals, flasher, QC jig | ≥95% yield |

Realistic total: ~9 months to 100 units (certification + steel lead times dominate). Faster demo-only: Phase 1 in a month.

## 6. Risks (ranked)
1. Steel blocks RF (Qi and Wi-Fi). 2. 5 mm stack. 3. Battery safety in a sealed steel body (protection IC, NTC, venting). 4. Camera module height. 5. Certification cost/time. 6. Steel machining + mirror polish yield at 100 units. 7. Brand pages unread (styling).
