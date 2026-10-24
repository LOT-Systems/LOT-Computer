# LOT PAGER — Hardware Plan, BOM, Roadmap

**Owner:** S-2 Vadik Marmeladov · **Status:** PLAN v0.1 (2026-10-24) · **Class:** ENGINEERING
**Product (working name):** LOT Pager — a 4×4 cm stainless-steel pocket device that receives autonomous notifications from lot-systems.com, shows them on a small screen, and sends a "Copy" signal back to the site's Log tab.

> Honesty markers: **VERIFIED** = confirmed from a source this session. **ESTIMATE** = engineering guess, validate with a vendor quote. **UNVERIFIED** = vendor/part named but price/availability not checked. The LOT sites (brand/about/institute CQGS) were unreachable from the build sandbox (DNS), so brand/CQGS details are NOT used here — S-2 to supply or re-run with network access.

---

## 1. Product definition (from the 19-point brief)

| # | Brief item | Resolution |
|---|-----------|-----------|
| 1 | PCBWay | PCB fab + SMT assembly + (separately quoted) CNC steel. https://www.pcbway.com/pcb-assembly.html (VERIFIED: SMT/THT/box-build offered; needs Gerber + BOM + centroid) |
| 2,16 | Pager-like push from AI site; Copy button → Log tab | Section 4 (API). **Gap found:** no device-auth endpoint exists today. |
| 3,17,18 | 2-part stainless body; one side polished; other side camera + screen + button | Section 3 |
| 4 | Flat silver square 40×40×5 mm | **Risk R1: 5 mm is likely infeasible** with camera+screen+cell. Plan: EVT at 40×40×9 mm, DVT target ≤6 mm, 5 mm stretch. |
| 5 | Camera | Thin FPC camera module (OV2640-class) — Section 2 |
| 6 | LOT API connector | Section 4 |
| 7,9,11 | PDF manuals, firmware docs, separate documents | Section 6 (docs set) |
| 8 | Compress info each session | Per-session `.md` report + benchmark ledger/lexicon (lot-benchmark protocol) |
| 10 | Software to connect with firmware | Section 5 (companion CLI/web flasher) |
| 12,19 | Charger / wireless charger | Qi receiver coil + IC; Section 3 shows the steel conflict (R2) |
| 13 | 100-unit run | Section 7 |
| 14,15 | Weather sensor; AI-grade off-the-shelf sensors | BME280-class (T/RH/P) + IMU + ambient light; Section 2 |

## 2. Architecture and bill of materials (per unit, 100-unit run)

**Compute/radio:** ESP32-S3 (dual-core, Wi-Fi + BLE, camera + LCD interfaces, enough RAM with PSRAM for JPEG capture). Prototype on Waveshare ESP32-S3-LCD-1.28 (1.28" round 240×240 GC9A01, QMI8658 IMU, LiPo charger, USB-C) — https://www.waveshare.com/ESP32-S3-LCD-1.28.htm (VERIFIED existence; the touch variant https://www.waveshare.com/ESP32-S3-Touch-LCD-1.28.htm adds CST816S). Neither has a camera or Qi (VERIFIED by search: no off-the-shelf board combines all).

| Block | Part (candidate) | Qty | Unit USD (ESTIMATE) | Source | Status |
|-------|------------------|-----|---------------------|--------|--------|
| MCU module | ESP32-S3-MINI-1U / WROOM-1 (N8R2) | 1 | 3.5–5 | https://www.digikey.com / https://www.lcsc.com | UNVERIFIED |
| Display | 1.28" round IPS 240×240, GC9A01 (fits 32 mm in 40 mm square) | 1 | 3–5 | Waveshare / https://www.aliexpress.com | UNVERIFIED |
| Camera | OV2640 FPC module, ≤4 mm stack (or OV2640 bare + custom lens holder) | 1 | 3–6 | https://www.aliexpress.com / https://www.arducam.com | UNVERIFIED |
| Weather sensor | Bosch BME280 (temp/humidity/pressure), or BME680 for VOC | 1 | 2–4 | https://www.digikey.com | UNVERIFIED |
| Motion | QMI8658 or LSM6DSO IMU (wake-on-motion, orientation) | 1 | 1–2 | https://www.lcsc.com | UNVERIFIED |
| Ambient light | VEML7700 or LTR-303 (auto-dim) | 1 | 0.8–1.5 | https://www.digikey.com | UNVERIFIED |
| Cell | LiPo 3.7 V, ~100–150 mAh, ≤4 mm thick (e.g. 401230/402025 class) | 1 | 2–4 | https://www.aliexpress.com | UNVERIFIED |
| Charger IC | BQ25100/MCP73831 (LiPo) | 1 | 0.5–1 | https://www.digikey.com | UNVERIFIED |
| Qi receiver | Wireless power RX IC (e.g. Renesas P9025, NXP, or STWLC-class) + RX coil with ferrite sheet (≈15–20 mm coil) | 1 | 3–6 | https://www.digikey.com | UNVERIFIED |
| Button | Low-profile tact switch / sealed dome ("Copy") | 1 | 0.2–0.5 | https://www.lcsc.com | UNVERIFIED |
| Haptic/buzzer | LRA motor or piezo (pager feel) | 1 | 1–2 | https://www.digikey.com | UNVERIFIED |
| PCB | 4-layer, 38×38 mm, ENIG, 0.8 mm | 1 | 2–4 @100 | https://www.pcbway.com | ESTIMATE |
| SMT assembly | PCBWay SMT, per-board at 100 pcs + NRE | 1 | 4–8 | https://www.pcbway.com/pcb-assembly.html | ESTIMATE |
| Body | 316L stainless, CNC 2 parts, one side mirror-polished | 1 set | 25–60 @100 | PCBWay CNC (quote) / https://www.jlcmfg.com | ESTIMATE — dominant cost |
| Misc | gaskets, screws, glass/sapphire window, adhesive | 1 | 2–5 | — | ESTIMATE |

**Rolled-up unit cost: ≈ $55–110 at 100 units (ESTIMATE; steel body drives the range).** Run total ≈ $5.5k–11k + NRE (stencil, fixtures, tooling, certification). Get 3 real quotes before committing.

## 3. Mechanical and RF — read before ordering anything

- **R1 — Height.** Round 1.28" LCD (~2–3 mm) + camera (3–4 mm) + cell (≥3.5 mm) + PCB (0.8 mm) + coil/ferrite (0.5–1 mm) cannot fit in 5 mm without folding the stack. Mitigation: place the camera beside the display under a second window and the cell beside the PCB (40 mm footprint allows side-by-side), target 7–8 mm; push toward 5–6 mm only after DVT measurement. **Needs S-2 decision: accept ~8 mm EVT?**
- **R2 — Steel blocks Qi.** Charging through a solid steel back does not work. Options: (a) glass/ceramic/sapphire inset window over the coil on the *charging* face; (b) make the *polished* face the non-charging face and keep a non-metal charging disc on the other; (c) contact pads (pogo) as a fallback to wireless. Recommend (a).
- **R3 — Steel blocks Wi-Fi/BLE.** A fully enclosed steel shell is a Faraday cage. Use a non-metal window (the same glass/ceramic as the display) with the module's antenna placed behind it, or an FPC antenna on the window side. Antenna keep-out ≥ 5 mm from steel.
- **Body split:** Part A = polished mirror back (316L, ~1.2 mm). Part B = tray/bezel with openings for screen window, camera, button; screws or laser-welded seam; gasket for splash resistance.
- **Colour/finish:** "flat silver square" = brushed or bead-blasted 316L on the front, mirror-polish on the back.

## 4. LOT API connector (grounded in this repo)

Findings from `src/server/routes/api.ts` and `public-api.ts`:
- Existing endpoints: `GET /api/logs` (api.ts:1082), `GET /api/live-message` (api.ts:820), `GET /api/weather` (api.ts:1038), `GET /api/ping`.
- All `/api/*` routes are session/user-authenticated (`req.user`); **there is no device token, no device-scoped route, and no log-write route for non-browser clients.**

Proposed new surface (NOT yet implemented — needs S-2 approval; touches production auth):
1. `POST /api/device/pair` — user approves a 6-digit code on the site; returns a long-lived, revocable **device token** (hashed at rest, scoped to `notify:read`, `log:write`).
2. `GET /api/device/poll?since=<id>` (long-poll / SSE) or MQTT-over-TLS — returns pending notifications `{id, title, body, ttl, haptic}`; the AI notification scheduler (`scheduled-jobs.ts`) enqueues e.g. "Coffee time!".
3. `POST /api/device/event` — body `{type:"copy", notificationId, ts, device}`; creates a Log-tab entry ("COPY ← LOT Pager"). Idempotency key = `deviceId+notificationId`.
4. `POST /api/device/telemetry` — optional weather/IMU readings, rate-limited.
Security: TLS only, token pinned to one device, rate limits, revoke from site settings, no PII on-device, signed firmware (ESP32 secure boot + flash encryption for the 100-unit run).

## 5. Firmware and software

- Firmware: ESP-IDF (C/C++) or Arduino-ESP32 for EVT; LVGL for UI. Modules: Wi-Fi provisioning (BLE or SoftAP), poll/SSE client, notification renderer (title + 2 lines), haptic, button handler → `copy` event, camera capture (button long-press), sensors, deep-sleep/duty cycling, OTA with rollback.
- Companion software: web flasher (ESP Web Tools / WebSerial) + pairing page on lot-systems.com; CLI `lot-pager` for factory provisioning of the 100 units (burn token-less firmware, write device ID, print QR).
- "Copy" semantics: the button copies the shown notification text to the user's LOT Log (server-side), since a pager has no clipboard; the site optionally mirrors it to the user's clipboard on next open.

## 6. Document set (all separate files, PDF export)

`docs/technical/pager/` (to create in EVT): User Manual, Quick-Start, Safety/Care (steel, battery, Qi), Firmware Architecture, Firmware Release Notes, Hardware Design (schematic/BOM/stack-up), Manufacturing Pack (Gerber/BOM/centroid/assembly drawing), API Spec, Test Plan. Each exported to PDF via the repo's existing pipeline or pandoc. One `.md` session report per working session (`docs/benchmark/LOT-SR-*.md`).

## 7. Roadmap

| Phase | Deliverable | Gate |
|-------|-------------|------|
| P0 (now) | This plan, risk list, quotes requested | S-2 decisions on R1/R2/R3 |
| P1 Proof-of-concept (2–3 wk) | Waveshare ESP32-S3-LCD-1.28 + OV2640 + BME280 on a breadboard; device API implemented behind a flag; "Coffee time!" end-to-end; Copy → Log | Notification round-trip < 5 s |
| P2 EVT (4–6 wk) | Schematic + PCB v1, 5–10 boards from PCBWay; 3D-printed + 1–2 CNC body prototypes | Wi-Fi/Qi work through chosen window |
| P3 DVT (4–6 wk) | Rev 2 PCB, 20 units, finish selection, height reduction, drop/splash test, firmware signed + OTA | Pass test plan |
| P4 PVT (3–4 wk) | 100-unit pilot on PCBWay SMT + CNC lot, fixture test, serial/QR | ≥ 95% first-pass yield |
| P5 Run (4–8 wk lead) | 100 units, pairing flow live, PDF manuals shipped | Units paired to accounts |
| Compliance (parallel) | FCC Part 15 (US, Made-in-USA positioning), Qi/WPC if branded "Qi", battery UN38.3 for shipping | Test-lab quotes |

Indicative total: 4–6 months to 100 units (ESTIMATE; CNC steel and certification are the long poles).

## 8. Open decisions for S-2

1. Accept thicker EVT (≈8 mm) while chasing 5 mm? (R1)
2. Approve glass/ceramic windows in the steel (RF + Qi)? (R2/R3)
3. Approve implementing the device-auth API surface in `src/server/routes/` (production auth change)?
4. Round 1.28" screen inside a square body OK, or require a square display?
5. Provide brand/CQGS/about specifics (sites unreachable in this run) for naming, finish and manual voice.

## 9. Sources
- Waveshare ESP32-S3-LCD-1.28: https://waveshare.com/ESP32-S3-LCD-1.28.htm
- Waveshare ESP32-S3-Touch-LCD-1.28: https://www.waveshare.com/ESP32-S3-Touch-LCD-1.28.htm
- PCBWay assembly: https://www.pcbway.com/pcb-assembly.html
- Repo: `src/server/routes/api.ts`, `src/server/routes/public-api.ts`, `src/server/scheduled-jobs.ts`, `docs/technical/OS_API.md`
