# LOT Computer — Hardware Program (working name: COSMO® Pager Unit, "P0")

Owner: Vadik Marmeladov (Inventor, COSMO® CIA) · Opened: 2026-10-26 · Status: PLAN (pre-EVT)

Documents (kept separate by design):

| File | Purpose |
|---|---|
| `README.md` | This file: concept, architecture, roadmap, risks |
| `BOM.md` | Components buying list with links, 100-unit estimates |
| `API-CONNECTOR.md` | LOT API device connector spec (server work required) |
| `FIRMWARE-SPEC.md` | Firmware + host software spec |
| `MANUFACTURING-100.md` | PCBWay + enclosure + 100-unit run plan |
| `LEDGER.md` | One compressed line per session (item 8) |

## 1. Concept

A 40 × 40 mm palm-sized stainless object. One face: polished mirror steel. Other face: camera, small screen, one button.
It is a physical endpoint of lot-systems.com: the AI site pushes pager-style notifications ("Coffee time!") to the screen; the button
works as **Copy** and writes a signal back to the site's **Log** tab. Weather/environment sensors feed context to the site.
Consistent with the site's COSMO® positioning (About page: personal robotics division, target hardware 2028–2029) — P0 is the
earliest physical probe, not the COSMO® unit.

## 2. Requirement map (your 19 points)

| # | Requirement | Where addressed |
|---|---|---|
| 1 | PCBWay | MANUFACTURING-100 §1 |
| 2 | Pager-like notification from AI site | API-CONNECTOR §3, FIRMWARE §4 |
| 3 | 2-part stainless body | MANUFACTURING-100 §3 |
| 4 | Flat silver square 40×40×5 mm | Risks R1 — 5 mm is not feasible with camera + Qi + battery; proposed 40×40×8 mm |
| 5 | Camera | BOM, FIRMWARE §6 |
| 6 | LOT API connector | API-CONNECTOR |
| 7 | PDF manuals | Roadmap M5 (generate from these .md files; not yet produced) |
| 8 | Compress info per session | LEDGER.md |
| 9 | Firmware docs | FIRMWARE-SPEC |
| 10 | Host software | FIRMWARE-SPEC §7 |
| 11 | Separate documents | table above |
| 12 | Charger | BOM (Qi pad) |
| 13 | 100-unit run | MANUFACTURING-100 |
| 14, 15 | Weather + AI-grade off-the-shelf sensors | BOM (BME688, SHT4x/ICM/ambient light) |
| 16 | Button = Copy → Log tab | API-CONNECTOR §4 |
| 17, 18 | Polished steel side / camera+screen+button side | Architecture §3 |
| 19 | Wireless charger | Risks R2 |

## 3. Architecture

```
 lot-systems.com (Fastify) ──HTTPS/SSE──► P0 (ESP32-S3, Wi-Fi)
   /api/device/*  (NEW)                    ├─ 1.3" IPS 240×240 screen
   Log tab ◄── POST button events          ├─ camera (JPEG stills, on demand)
                                           ├─ BME688 (T/RH/P/gas), light, IMU
                                           ├─ 1 tactile button, haptic motor
                                           └─ Li-Po + Qi receiver
```

Body: 316L stainless, two machined parts. Front (screen/camera/button) is a cup; back is the polished plate.

## 4. Critical risks (read first)

- **R1 — 5 mm height.** Stack: screen module ~2.0, PCB 0.8–1.0, battery ≥2.5–3.0, Qi coil ~0.8–1.0, camera 3–4+, two 0.8–1.0 mm steel walls. Not achievable at 5 mm with these features. Recommend **40×40×8 mm**; at 5 mm drop the camera or the Qi coil.
- **R2 — Steel blocks wireless charging and Wi-Fi/BLE.** Metal shields RF and Qi. A closed steel shell will kill the antenna and charging. Mitigations: (a) non-metal window (ceramic/sapphire/glass) over the antenna and a non-metal charging insert, or (b) polished face stays steel and the *screen side* carries a glass/ceramic window covering the antenna + coil; coil sits under the glass side, so the pad charges with the screen face down. Needs EVT prototype test before tooling commitment.
- **R3 — Camera privacy/regulatory.** Always-off by default, hardware LED, on-demand capture only. FCC/CE for 100 units sold or distributed externally needs certification (est. $5–15k) unless modular pre-certified ESP32 module is used and units stay internal.
- **R4 — Li-Po shipping/battery safety**, UN38.3 for transport.
- **R5 — Server has no device auth.** `POST /api/logs` uses user sessions (`req.user`). Device tokens must be built (see API-CONNECTOR).

## 5. Roadmap

| Milestone | Scope | Est. duration |
|---|---|---|
| M0 Plan (this session) | Docs, BOM, spec | done |
| M1 Dev kit proof | ESP32-S3 devkit + screen + BME688 + button; server `/api/device` endpoints; "Coffee time!" end to end | 3 wks |
| M2 EVT PCB | KiCad design, 5 boards via PCBWay, antenna/Qi test in a steel mock-up | 6–8 wks |
| M3 Enclosure proto | 5 sets CNC 316L, polish, fit check, resolve R1/R2 | 6 wks (parallel) |
| M4 DVT | 20 units, firmware beta, OTA, drop/thermal tests | 6 wks |
| M5 Docs | PDF manuals (user, firmware, service) from .md | 2 wks |
| M6 Pre-compliance + PVT | 100-unit pilot run, certification path | 8–10 wks |
| M7 100-unit run | Build, QA, ship | 6–8 wks |

Realistic total: ~8–10 months to 100 units. Fast path to a demo: M1 only (3 weeks, ~$150).

## 6. Decisions needed from Vadik

1. Accept 8 mm height (or drop camera/Qi at 5 mm)?
2. Internal pilot only, or external sale (drives certification)?
3. Approve the device-token endpoints being added to the LOT server.
