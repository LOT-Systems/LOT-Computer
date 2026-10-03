# LOT-P1 "Pager" — LOT Computer Hardware Program

**Owner:** Vadik Marmeladov, Inventor, COSMO® CIA · **Status:** PLAN (Session 1, 2026-10-03)
**One line:** A 40×40×5 mm stainless-steel pager that shows autonomous notifications from lot-systems.com ("Coffee time!"), reports weather, takes photos, and sends a "Copy" button press back to the site's Log tab.

> Sources not reachable this session: brand.lot-systems.com, lot-systems.com/about, institute.lot-systems.com/cqgs.html were blocked by the egress proxy. Brand and CQGS alignment below is taken from the repo (`tailwind.config.js`, `About.tsx`, `docs/wiki`) and must be reviewed against the live pages. See STATE.md → OPEN.

## Document set (item 11: separate documents)

| Doc | Purpose |
|---|---|
| [README.md](README.md) | Plan, architecture, requirement trace, roadmap, risks (this file) |
| [BOM.md](BOM.md) | Components buying list with links, cost model, 100-unit budget |
| [MANUFACTURING.md](MANUFACTURING.md) | PCBWay flow, stainless body, charging, 100-unit run plan |
| [CONNECTOR_API.md](CONNECTOR_API.md) | LOT API connector spec (site ⇄ device), Log-tab "Copy" signal |
| [FIRMWARE.md](FIRMWARE.md) | Firmware architecture + host software ("LOT Link") plan |
| [MANUALS.md](MANUALS.md) | PDF manual set plan and build pipeline |
| [STATE.md](STATE.md) | Compressed session state (item 8) — read this first each session |

## Requirement trace (the 19 items)

| # | Requirement | Where addressed | Status |
|---|---|---|---|
| 1 | PCBWay | MANUFACTURING §1, BOM | Planned |
| 2 | Pager-like notification from AI site | CONNECTOR_API §3 | Spec |
| 3 | 2-part stainless body | MANUFACTURING §3 | Planned |
| 4 | Flat silver square 4×4 cm × 5 mm | Mechanical §3 below | **High risk (stack height)** |
| 5 | Camera | BOM, FIRMWARE §5 | Planned |
| 6 | LOT API connector | CONNECTOR_API | Spec |
| 7 | PDF manuals | MANUALS | Planned |
| 8 | Compress info per session | STATE.md + session report TL;DR | Done (process) |
| 9 | Firmware documents | FIRMWARE | Spec |
| 10 | Software to connect with firmware | FIRMWARE §7 (LOT Link) | Spec |
| 11 | Separate documents | table above | Done |
| 12 | Charger | BOM (Qi TX pad + USB-C dev charger) | Planned |
| 13 | 100 units run | MANUFACTURING §5 | Budgeted |
| 14 | Weather sensor | BME280/BME688 | Planned |
| 15 | AI-grade off-the-shelf sensors | BOM sensors | Planned |
| 16 | "Copy" button → Log tab | CONNECTOR_API §4 | Spec |
| 17 | One side polished stainless | Mechanical §3 | Planned |
| 18 | Other side: camera, screen, button | Mechanical §3 | Planned |
| 19 | Wireless charger | Mechanical §3 (RF/charging window) | **High risk** |

## 1. System architecture

```
 lot-systems.com (Fastify API, Postgres)         LOT-P1 device (ESP32-S3)
 ┌──────────────────────────────┐   HTTPS/WSS   ┌──────────────────────────┐
 │ QIE / AI engine → notification│ ───────────▶ │ inbox poll / WS push     │ → screen + haptic
 │ POST /api/device/* (new)      │ ◀─────────── │ button "Copy", sensors,  │
 │ Log tab ← device_copy event   │   telemetry   │ camera frame             │
 └──────────────────────────────┘               └──────────────────────────┘
        ▲ provisioning / OTA via "LOT Link" (USB-C dev + BLE, phone/desktop)
```

Existing hooks in repo: `GET /api/live-message`, `GET /api/weather`, `GET /api/logs` (displayable-event whitelist in `src/server/routes/api.ts`). Auth today is user-session based; the device needs its own token scheme (CONNECTOR_API §2).

## 2. Design decisions (recommendations)

- **MCU:** ESP32-S3 (Wi-Fi + BLE 5, camera interface, USB, AI vector instructions). Use the bare module `ESP32-S3-MINI-1U/-1` N8R2 on-board for PCBWay assembly.
- **Screen:** 1.3" 240×240 IPS (ST7789) or 1.28" round GC9A01 — a "simple screen" for short text. Prototype with a module; production with a custom FPC panel.
- **Camera:** OV2640-class 2 MP FPC module for prototype; ultra-thin VGA/2 MP module (≤2.5 mm Z) for production.
- **Alert:** LRA haptic (DRV2605L) = silent pager buzz; optional piezo beep.
- **Power:** thin LiPo + Qi receiver (BQ51013B-class) + charger/fuel gauge. USB-C test pads only (no connector — keeps the case sealed and thin).
- **Sensors (AI-grade, off-the-shelf):** BME688 (T/H/P/gas + Bosch BSEC AI classifier), BMI270 (IMU, on-chip gesture AI), VEML7700 (ambient light → auto brightness). SHT45 as high-accuracy humidity alternative. No microphone in v1 (privacy; COSMO Gate).

## 3. Mechanical concept

- **Body:** 316L stainless, two parts: (A) polished back plate, (B) front frame/bezel with window cut-outs for screen, camera, button. Laser-welded or screw-sealed; target 40.0 × 40.0 × 5.0 mm, corner R2.
- **Back (item 17):** mirror-polished stainless, engraved LOT® / COSMO® mark and serial.
- **Front (item 18):** glass cover over screen; camera pin-hole/lens window; single tactile "Copy" button (side-mounted at 5 mm height is easier than a front button — decision gate G1).

### Hard physics the plan must respect (read before ordering)

1. **Stainless steel blocks Wi-Fi/BLE and Qi charging.** A fully metal sealed case is a Faraday cage. Required: a non-metal RF/charging window (glass front for the antenna side; ceramic/sapphire/PEEK insert or a plastic gasket slot) and a ferrite-backed coil on the window side. A "fully polished steel back" and "wireless charging through the back" cannot both hold. Recommended: coil + antenna face the **glass front**, coil placed in the annulus around the screen; back stays pure polished steel. Validate with a prototype before tooling.
2. **5 mm total height is extremely tight** (steel walls 2×0.5 + glass 0.5 + display ~1.8 + PCB 0.8 + battery ≥2.5 + coil/ferrite 0.6 + camera). Realistic first build: **6.5–7 mm**. Fallback path: ship P1 at ≤7 mm, redesign for 5 mm after the camera/battery are fixed. Gate G2.
3. **Battery:** at ≤3 mm thickness expect ~60–100 mAh → hours-to-days with aggressive sleep, not weeks. Design for poll-based low power.
4. **Camera + 5 mm** forces a wafer-level/FPC module; OV2640 is a prototype stand-in.

## 4. Roadmap

| Phase | Weeks | Output | Gate |
|---|---|---|---|
| P0 Plan & BOM | 0–1 | This doc set | S-2 approves scope |
| P1 Breadboard | 1–4 | ESP32-S3 devkit + display + BME688 + button talking to a staging API | Notification → screen, Copy → Log tab works |
| P2 Backend connector | 2–5 | `/api/device/*`, `device_copy` log event, token auth, Log tab render | Staging green (`lot-benchmark`) |
| P3 Schematic/PCB v0.1 | 4–9 | KiCad project, 4-layer, fits 36×36 mm board outline | DRC/ERC clean, DFM at PCBWay |
| P4 Mechanical v0 | 5–10 | CAD, 316L CNC sample ×3 (PCBWay CNC), RF/Qi window test | **G1/G2** (height, charging) |
| P5 EVT build | 10–14 | 5–10 PCBA + bodies, firmware 0.5 | Charge, RF range, sensors, photo upload |
| P6 DVT + manuals | 14–20 | 20 units, firmware 0.9, PDF manuals, LOT Link | Drop/thermal/battery tests |
| P7 PVT / 100-unit run | 20–28 | 100 units, QA, serials, provisioning | ≥90% yield, COSMO Gate sign-off |
| P8 Field | 28+ | Units to operators, telemetry | Feeds COSMO® roadmap |

Positioning: P1 Pager is a precursor/dev platform. `About.tsx` states COSMO® hardware availability 2028–2029; the P1 run de-risks the stainless body, charging, and API connector for that.

## 5. Top risks

| Risk | Sev | Mitigation |
|---|---|---|
| Metal blocks RF/Qi | High | Glass-side antenna/coil, test coupons in P4 |
| 5 mm stack | High | Accept 6.5–7 mm for v1; stack drawing before PCB |
| Battery safety/shipping (UN38.3, 100 pcs) | Med | Use certified cells, protection IC, ship via DDP/express with docs |
| Radio compliance (FCC/CE) for 100 units | Med | Use pre-certified ESP32 module; evaluate FCC modular + unintentional radiator testing; pilot units labelled "evaluation" |
| Camera privacy | Med | Hardware LED/shutter cue, local-only until user taps Copy; COSMO Gate review |
| Link/price drift | Low | BOM links re-verified at order time |
| Site auth for devices | Med | Per-device revocable token, rate limits, no user creds on device |

## 6. Brand notes (from repo; verify against brand.lot-systems.com)

Dark `#1a1a1a` / `#050505` surfaces, accent blue `#43aff3`, yellow `#fef17b` (tailwind config). Screen UI: dark background, accent-blue notification text, one-line "Made in the USA" claims are **not** to be printed on units unless final assembly is actually in the USA.

## 7. Decisions needed from S-2

1. Accept 6.5–7 mm v1 height, or hold firm on 5 mm and delay? (G2)
2. Charging via glass-front coil (recommended) vs. pogo-pin magnetic dock + polished back?
3. Camera privacy posture (LED, shutter, or physical lens cap).
4. Final assembly location (affects "Made in USA" labelling and cost).
