# LOT PAGER (`LOT-P1`) — Plan, Analysis & Roadmap v0

**Date:** 2026-10-25 · **Owner:** Vadik Marmeladov, Inventor, COSMO® CIA · **Status:** Draft for approval
**Confidence note:** Prices and part availability are estimates from engineering knowledge, not live quotes (web lookups were thin; see BOM). Treat as ±30%.

## 1. Product in one paragraph
A 40 × 40 mm mirror-polished stainless-steel tile. One face is plain polished steel. The other has a small screen, a camera and one button. LOT's AI on lot-systems.com decides when to nudge you ("Coffee time!"); the device vibrates, shows the text, and pressing the button **Copy**s that item back to your **Log** tab. It charges wirelessly, senses local weather, and ships as a 100-unit first run.

## 2. Your 19 requirements → decision

| # | Requirement | Decision / finding |
|---|---|---|
| 1 | PCBWay | Use PCBWay for PCB + turnkey SMT assembly (and CNC steel — they offer 316 machining + polishing). Quote is manual, 1–2 business days; BOM needs exact MPNs. |
| 2 | Pager-like notification from AI site | Server creates `device_notification` rows; device holds a WebSocket/long-poll and buzzes + shows text. See Firmware/API doc. |
| 3 | 2-part stainless body | Back plate (polished) + front bezel (satin or polished), 316L, M1.2 screws or laser-weld. Gasket for splash resistance (IP54 target). |
| 4 | Flat silver square 4×4 cm × 5 mm | **Form: 40×40 mm, corner R4.** Height 5 mm is **not feasible** with items 5/18/19 (see §3). EVT 8–9 mm; "5 mm" variant = no camera, no Qi. |
| 5 | Camera | OV2640 2 MP DVP module through a sapphire/AR-glass window. Long-press button = snapshot to site (v1). |
| 6 | LOT API connector | Per-device token, REST + WebSocket, reuses existing `POST /api/logs`. New `/api/device/*` routes. |
| 7 | Result in PDF manuals | Manual set generated from Markdown → PDF at DVT (list in Firmware doc §7). |
| 8 | Compress info each session | `SESSION-DIGEST.md` rewritten ≤ 40 lines every session. |
| 9 | Firmware documents | Firmware/API doc + per-module READMEs when code lands. |
| 10 | Software to connect with firmware | `lot hardware` / `lot sync` CLI (LOT Terminal) + web flasher (WebSerial) — see Firmware doc §5. |
| 11 | Separate documents | Done: Plan / BOM / Firmware-API / Digest as separate files. |
| 12 / 19 | Charger / wireless charger | Qi 5 W receiver on device + off-the-shelf Qi pad for EVT; custom polished dock later. |
| 13 | 100-unit run | Budget in BOM doc: ≈ **$9–13 k parts+build** + **$8–12 k one-time** (certs, tooling, fixtures), est. |
| 14 / 15 | Weather + AI-grade COTS sensors | Bosch BME688 (T/H/P/gas + BSEC AI classification), BMI270 IMU (on-chip gesture AI), LTR-390 UV/ambient light. |
| 16 | "Copy" button → Log tab | Press = POST `device_copy` event; appears in Log after adding to the Log allowlist. |
| 17 | One side polished stainless | Back plate, #8 mirror finish. |
| 18 | Other side camera + screen + button | Front: 1.3" 240×240 IPS, camera at top-right, button at bottom edge (side) or front corner. |

## 3. Two physics problems you must decide on

### 3.1 Thickness: 5 mm is not possible with this feature set
| Layer | Min thickness (mm) |
|---|---|
| Steel back plate (milled pocket floor) | 0.8 |
| Qi coil + ferrite sheet | 0.6 |
| LiPo (e.g. 353035, ~250–300 mAh) | 3.5 |
| PCB 4-layer | 0.8 |
| ESP32-S3-MINI-1 / camera module (tallest part) | 2.4 – 4.0 |
| Display module (glass+backlight+FPC) | 1.6 |
| Front bezel / cover glass | 0.5–0.8 |
| **Stack (parts side by side where possible)** | **≈ 8–9 mm** |

Options: **A)** EVT 8–9 mm (recommended; everything works). **B)** 5 mm "Pager Lite": no camera, no Qi, ~80 mAh 301030 cell, USB-C pogo charge — lower battery, 1-2 days. **C)** 5 mm with everything needs custom flex/CSP parts and a 100k+ run — not for 100 units.

### 3.2 Stainless steel blocks radio and Qi
Solid 316L is a Faraday cage: Wi-Fi/BLE and Qi both fail inside a sealed steel can. Fixes:
- Put the ESP antenna under the **front glass** (top edge, beside display), keep ≥ 8 mm from steel; verify with a VNA/range test.
- Qi: add a **glass or zirconia ceramic disc (Ø 28 mm) inset in the polished back**; mirror-polish keeps the look. Coil + ferrite sit behind it. Alternative: charge face-down through the front glass (coil must then sit beside, not under, the display — less efficient).
- Steel 316L is only weakly magnetic; fine for the ferrite arrangement.

## 4. Architecture
```
 AI engine (lot-systems.com) ──► device_notification queue ──► wss/long-poll ──► LOT-P1
        ▲                                                                       │ screen+haptic
        └──── Log tab ◄── POST /api/device/copy  ◄── button "Copy" ◄───────────┘
                         ◄── POST /api/device/telemetry (weather, battery)
```
Power: Qi pad → STWLC38 (5 V) → BQ25185 (charger + power path) → LiPo → TPS62840 3.3 V. Sleep: ESP32 light-sleep with WS keep-alive 30 s (~1–2 mA avg → ~5–7 days on 250 mAh, est.); deep-sleep polling mode as fallback.

## 5. Risks (ranked)
1. Thickness/RF/Qi vs steel (§3) — mitigated by glass inset + antenna window.
2. PCBWay turnkey sourcing of STWLC38 (WLCSP) and BME688 — check stock early; allow substitutes (BME280 + SGP40).
3. Battery shipping/certification (UN38.3, UL 2054 / IEC 62133) — use a certified cell vendor.
4. Wireless certification: ESP module is pre-certified (modular), the finished device still needs FCC Part 15B / CE; budget in BOM.
5. Camera privacy: hardware shutter or LED + off-by-default; consent text in manual.
6. Security: per-device keys, secure boot v2 + flash encryption (ESP32-S3 eFuses — irreversible, do only on production units).
7. Server: no device auth exists yet; `POST /api/logs` requires a user session cookie.

## 6. Roadmap (dates are targets from 2026-10-25)
| Phase | Window | Exit criteria |
|---|---|---|
| **P0 Spec freeze** | 10-25 → 11-15 | Vadik approves §3 choices; digest updated; brand assets pasted |
| **P1 Dev-kit + server** | 11-15 → 12-15 | ESP32-S3 devkit + OV2640 + ST7789 + BME688 on a breadboard shows a live notification and logs a Copy; `/api/device/*` shipped |
| **P2 EVT PCB** | 12-01 → 01-20 | KiCad design, 5 bare+assembled boards from PCBWay; bring-up report |
| **P3 EVT mechanical** | 01-10 → 02-28 | 5 CNC 316L two-part housings (PCBWay), glass inset, fit check, Qi range test |
| **P4 DVT** | 03-01 → 04-15 | 20 units, firmware OTA, drop/ingress/battery tests, pre-scan EMC, PDF manuals v1 |
| **P5 PVT / 100-unit run** | 04-15 → 06-30 | Certs done, PCBWay 100 PCBA + steel, packaging, serial/token provisioning, ship |

## 7. Immediate next actions
1. Vadik: answer the four open questions in `SESSION-DIGEST.md`.
2. Build server device API + Log events (session 02).
3. Send BOM to PCBWay for a binding quote; request CNC 316L quote with polish + glass inset drawing.
4. Order devkit parts (P1) — about $120.
