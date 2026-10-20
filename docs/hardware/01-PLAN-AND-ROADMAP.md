# LOT COMPUTER (Hardware) — Plan, Feasibility & Roadmap

Doc ID: LOT-HW-01 · Rev A · 2026-10-20 · Owner: Vadik Marmeladov (Inventor, COSMO® CIA)
Status: PLAN — not yet validated on hardware. All prices are estimates and must be re-quoted.

## 1. Product in one line
A 40 mm stainless-steel tile: a polished mirror face on one side; camera, small screen and one button on the other. It is a pager for lot-systems.com. The site sends autonomous notifications ("Coffee time!"), the screen shows them, and the button ("Copy") sends a signal back to the site's **Log** tab.

## 2. Requirement trace (your 19 points)

| # | Requirement | Where it is handled | Status |
|---|---|---|---|
| 1 | PCBWay | PCB fab + SMT assembly + 100-unit run, see 02-BOM §6 | Planned |
| 2 | Pager-like notifications from AI site | 03-FIRMWARE-API-SPEC §3 | Spec only; server endpoints not built |
| 3 | 2-part stainless body | 04-MECHANICAL §2 | Planned |
| 4 | Flat silver square 4×4 cm × 5 mm | 04-MECHANICAL §1. **5 mm is not feasible with all parts (see §3 risk R1). v1 = 40×40×9 mm.** | RISK |
| 5 | Camera | OV2640 on ESP32-S3 | Planned |
| 6 | LOT API connector | 03-FIRMWARE-API-SPEC §2 | Spec only |
| 7 | PDF manuals | 05-MANUALS (+ `build-pdf.sh`) | PDF built this session |
| 8 | Compress info each session | 06-SESSION-COMPRESSION | Process defined |
| 9 | Firmware documents | 03-FIRMWARE-API-SPEC | Done (draft) |
| 10 | Software to connect with firmware | `tools/` plan (provisioning CLI, §6) | Spec only |
| 11 | Separate documents | This folder: 01…06 | Done |
| 12 | Charger | Qi pad (Qi receiver in device) | Planned |
| 13 | 100 units run | Roadmap Phase 5 | Planned |
| 14 | Weather sensor | BME280 / BME688 | Planned |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC gas AI), SGP41, optional IMU | Planned |
| 16 | Button "Copy" → Log tab | Firmware event `device_copy`, spec §2.3 | Spec only |
| 17 | One side polished stainless | Mirror (#8 / BA) finish, 04 §3 | Planned |
| 18 | Other side camera + screen + button | 04 §1 | Planned |
| 19 | Wireless charger | Qi RX, 02-BOM; **steel conflicts with Qi, see R2** | RISK |

## 3. Top risks (read first)

- **R1 — 5 mm thickness.** Stack: LiPo ≥ 2.5 mm, display module ≈ 2.0 mm, PCB 0.8 mm, ESP32-S3 module 2.4 mm, camera 4–5 mm, Qi coil ≥ 0.6 mm, steel walls 2 × 0.5 mm. That is roughly 9–11 mm. Options:
  (a) 40×40×9–10 mm v1, with camera bump flush;
  (b) 5 mm only if the camera is dropped, or the unit is split: 5 mm tile + separate battery/charger puck;
  (c) read item 4 as the charger pad (40×40×5 mm silver square). That reading is workable, and the plan supports it (see 04 §5).
  **Decision needed from Vadik.**
- **R2 — Stainless blocks Qi.** Conductive steel absorbs the field (eddy currents, heat). Fix: a non-metal back window (ceramic/PEEK/glass, ≥ 25 mm) over the coil, with a ferrite shield layer behind the coil. A fully closed steel shell will not charge.
- **R3 — Stainless blocks Wi-Fi/BLE.** Antenna must sit behind a plastic/glass window or use an external ceramic antenna at a non-metal edge gap. The 2-part body gives a natural seam with a non-conductive gasket.
- **R4 — Privacy (camera).** Always-on camera in a "pager" is sensitive. v1: camera is captured only on explicit press-hold, with a hardware LED and shutter indicator, and no continuous streaming. Required by design.
- **R5 — Site endpoints do not exist yet.** The repo has user-session cookie auth only (`src/server/routes/auth.ts`); no device tokens. See spec §1.
- **R6 — Sites unreachable in this run.** brand/about/institute pages returned DNS errors from the sandbox, so brand tokens (colors, logo rules, CQGS) were NOT applied. Re-run with access.

## 4. Architecture
```
 lot-systems.com (AI engine, Log tab)
        ▲ HTTPS/TLS (device token)       ▼ notification (poll + optional push)
   ESP32-S3 (Wi-Fi) ── SPI ── display 1.54" IPS 240×240
        ├── DVP ── OV2640 camera
        ├── I²C ── BME688 (T/H/P/gas) , optional IMU
        ├── GPIO ─ button "Copy"
        └── PMIC ─ Qi RX → LiPo 3.7 V
```
Chosen MCU: **ESP32-S3-WROOM-1-N16R8** (Wi-Fi, BLE 5, native camera DVP, PSRAM, USB-C for flashing, ESP-IDF OTA).

## 5. Roadmap (calendar assumes start 2026-11-01)

| Phase | Weeks | Deliverable | Exit gate |
|---|---|---|---|
| 0 Decisions | 1 | Resolve R1, R2, brand pull | Dimensions frozen |
| 1 Dev-kit prototype | 2–5 | ESP32-S3 dev board + breakout parts, firmware talks to a staging API | "Coffee time!" shows; button creates Log entry |
| 2 Server connector | 3–6 | Device token, `/api/device/*`, Log event `device_copy` visible in Log tab | Server tests green |
| 3 Custom PCB v1 | 5–10 | Schematic, layout, PCBWay 5-pc proto | Boots, charges on Qi, camera frame |
| 4 Enclosure | 6–12 | Two-part steel prototypes (CNC/ MIM quote) | Fit + Qi window + RF test |
| 5 EVT/DVT | 12–18 | 20 units, drop/thermal/Qi/RF tests | Pass list in 05 |
| 6 Pilot run | 18–26 | **100 units** via PCBWay assembly + body supplier | Yield ≥ 90 %, QC report |
| 7 Ship | 26–30 | Manuals PDF, OTA, support | First 100 delivered |

Critical path: enclosure (steel lead time 6–10 weeks) and Qi-through-steel validation. Start both in Phase 1.

## 6. Software to connect with firmware (`tools/lot-device`)
CLI (Node/TypeScript, matches repo): `lot-device flash`, `provision` (Wi-Fi + token), `log` (serial tail), `test-notify "Coffee time!"`, `ota`. Not yet created.

## 7. Cost model (100 units, estimate, USD, unverified)
See 02-BOM §7: ≈ 65–150 per unit electronics + ≈ 40–90 per unit steel body at 100 qty. Rough total ≈ 18k–35k including tooling/NRE and contingency (02-BOM §7).

## 8. Open questions for Vadik
1. 5 mm: device or charger? (R1)
2. Battery life target (days between charges)?
3. Wi-Fi only, or add cellular (adds antenna + SIM, thicker)?
4. Who gets a device: one device per account? Pairing by QR on Settings page?
5. Brand: engraved logo on mirror face?
