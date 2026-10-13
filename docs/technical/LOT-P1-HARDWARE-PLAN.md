# LOT-P1 — Hardware Computer · Plan, BOM, Roadmap

**Owner:** S-2 Vadik Marmeladov · **Rev:** A · **Date:** 2026-10-13
**Status:** PLAN (pre-EVT). Working codename **LOT-P1** ("pager"). Naming vs. COSMO® is an open question (see §10).
**Sources read:** this repo (API, Log tab, brand palette, About copy). `lot-systems.com`, `brand.lot-systems.com`, `institute.lot-systems.com/cqgs.html` were **not reachable from the build sandbox** (DNS failure) — brand and CQGS specifics must be confirmed by S-2 (§10).
**Honesty marks:** `ESTIMATE` = my number, not a quote. Vendor links are product-family pages; **MPNs, stock and prices must be re-verified at quote time** — none were checked live.

---

## 1. Product in one paragraph

A 40 × 40 mm, ~5 mm-class, two-part stainless-steel slab. **Back:** polished stainless. **Front:** small screen, camera, one button. It receives autonomous, AI-written, pager-style notifications from lot-systems.com ("Coffee time!"), shows them on a simple screen, buzzes, reads environmental sensors (weather), and sends the **Copy** button press back to the site's **Log** tab. Charges wirelessly. Built via PCBWay; first run 100 units.

## 2. Requirement trace (your 19 items → where handled)

| # | Your item | Handled in | Note |
|---|-----------|-----------|------|
| 1 | PCBWay | §6, §8 | PCB fab + SMT assembly + CNC (they offer all three) |
| 2 | Pager notification from AI site | §5 | server job → device queue → screen+haptic |
| 3 | 2-part stainless body | §4 | 316L, CNC, laser/TIG-free snap+screw seam |
| 4 | Flat silver square 4×4 cm × 5 mm | §4 | **5 mm is the hardest constraint** — see R1/R2 |
| 5 | Camera | §3, §10 | privacy LED + shutter policy required |
| 6 | LOT API connector | §5 | new `/api/device/*` routes (don't exist yet) |
| 7 | PDF manuals | §9 | generated from the same MD sources |
| 8 | Compress info each session | §9, §11 | lexicon/ledger + 64-byte CBOR payloads |
| 9 | Firmware documents | §9 | |
| 10 | Software to connect with firmware | §5, §7 | provisioning/flash tool + OTA |
| 11 | Separate documents | §9 | one doc per concern |
| 12 | Charger | §3 | Qi transmitter pad (off-the-shelf, then branded) |
| 13 | 100-unit run | §8 | |
| 14 | Weather sensor | §3 | |
| 15 | AI-grade off-the-shelf sensors | §3 | BME688 (on-sensor AI/BSEC), BMI270 gestures, light |
| 16 | Button = "Copy" → Log tab | §5 | event `device_copy` |
| 17 | One side polished stainless | §4 | |
| 18 | Other side: camera, screen, button | §4 | |
| 19 | Wireless charger | §3, R3 | stainless blocks Qi — needs a window |

## 3. Components / buying list (BOM v0.1, per unit)

Prices are **ESTIMATE** at ~100-unit volume, USD.

| Block | Pick (v0.1) | Why | Link | Est. |
|-------|-------------|-----|------|------|
| MCU + Wi-Fi/BLE | **ESP32-S3-MINI-1** (module, 2.4 mm tall, PCB-trace antenna) | camera (DVP) support, vector instr. for edge AI, OTA, huge ecosystem | [datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf) · [Espressif](https://www.espressif.com/en/products/socs/esp32-s3) | $3.5 |
| Camera | **OV2640** 2 MP DVP module on flex, custom ≤3 mm lens stack (EVT: stock OV2640 board) | cheapest supported path; OV5640 if 5 MP wanted | [OmniVision](https://www.ovt.com/) · search "OV2640 module" at [DigiKey](https://www.digikey.com/) | $4 |
| Screen | **1.54" 200×200 e-paper** (≈1 mm thick) — alt: 1.3" mono OLED SH1106 | pager feel, near-zero power, thinnest; OLED if faster refresh/brightness needed | [Good Display](https://www.good-display.com/) · [Waveshare](https://www.waveshare.com/) | $6 |
| Weather / air | **Bosch BME688** (T/H/P/gas, on-sensor AI via BSEC) | "AI-grade" off-the-shelf, 3×3 mm LGA | [Bosch](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/) | $5 |
| Motion | **Bosch BMI270** IMU (wrist/gesture, tap-wake) | on-chip gesture engine | [Bosch](https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/) | $2.5 |
| Light | **Vishay VEML7700** ambient light (auto brightness / camera hint) | tiny, I²C | [Vishay](https://www.vishay.com/en/product/84286/) | $1.2 |
| Haptic/alert | **DRV2605L** + thin LRA or piezo disc (≤2 mm) | the "pager buzz" | [TI](https://www.ti.com/product/DRV2605L) | $3 |
| Qi receiver | **TI BQ51013B** (Qi Rx) + flat FPC Rx coil (Würth WE-WPCC family) | 5 V out, tiny WCSP | [TI](https://www.ti.com/product/BQ51013B) · [Würth](https://www.we-online.com/en/components/products/WPCC) | $5 |
| Battery charger | **TI BQ25185** (or BQ25125) | power-path, low Iq | [TI](https://www.ti.com/product/BQ25185) | $1.5 |
| Battery | **3.0 mm LiPo, ~150–200 mAh** custom/pouch (UN38.3 cert required) | only thing that fits 5 mm | search "3 mm LiPo 303040" — [Adafruit](https://www.adafruit.com/category/574) for EVT | $4 |
| Fuel gauge | **MAX17048** | % battery on screen | [Analog Devices](https://www.analog.com/en/products/max17048.html) | $1.5 |
| Button | **ALPS SKRRA / Panasonic EVQ low-profile** side-mount tact (≤1.2 mm) | the "Copy" button | [DigiKey](https://www.digikey.com/) | $0.4 |
| Privacy LED | 0402 LED hard-wired to camera power rail | trust/legal | — | $0.1 |
| Antenna window | PEEK/ceramic gasket ring in the seam | RF can't pass steel | — | in body |
| Body | **316L stainless, 2 parts, CNC + polish** | | [PCBWay CNC](https://www.pcbway.com/cnc-machining-quote.html) | $60–90 `ESTIMATE` |
| PCB | 6-layer rigid + FPC for camera/coil; ENIG | | [PCBWay](https://www.pcbway.com/) | $9–14 |
| Passives/connectors/misc | | | | $5 |
| **Total (unit)** | | | | **≈ $115–150 `ESTIMATE`** |

**Charger (separate SKU):** EVT = any 5 W Qi pad ([Qi spec / WPC](https://www.wirelesspowerconsortium.com/)). PVT = branded stainless puck with Qi Tx IC (e.g. [Renesas P9242](https://www.renesas.com/) family, MPN to verify).

**Dev kit for week 1 (breadboard proof, ≈ $120 `ESTIMATE`):** ESP32-S3 dev board with camera header, e-paper 1.54" module, BME688 breakout, BMI270 breakout, DRV2605L breakout, Qi Rx module, 200 mAh LiPo. Buy from [Adafruit](https://www.adafruit.com/), [SparkFun](https://www.sparkfun.com/), [Waveshare](https://www.waveshare.com/).

## 4. Mechanical

- **Envelope:** 40 × 40 mm, ≤5 mm target. Budget (Z-stack, mm): back plate 0.5 · Qi coil+ferrite 0.6 · battery 3.0 · PCB 0.8 · MCU module 2.4 (sits beside battery, not above) · screen 1.2 · front plate 0.5. **Does not close at 5 mm with a stacked layout** → EVT/DVT use **side-by-side placement** (battery under one half, MCU/camera under the other) and a **realistic EVT thickness of 7–8 mm**. 5 mm is a DVT stretch goal requiring a custom flex camera and bare-die/lower-profile RF.
- **Two parts:** (A) **Back** — polished 316L slab, mirror finish (#8). (B) **Front** — 316L frame with openings: screen (glass-covered), camera (sapphire/AR glass window), button (side or recessed). Parts join by recessed screws or press-fit + adhesive; a **0.5–1 mm PEEK/ceramic ring in the seam** serves as the RF + charging aperture.
- **Finish:** back mirror polish; front bead-blast or satin for contrast (brand call).
- Tolerances/gaskets: IP54 target for splash; sealed IP67 is out of scope for v1.

## 5. System / LOT API connector

Existing in repo (verified by reading `src/server/routes/api.ts`): `GET /api/live-message`, `GET /api/logs` (whitelist of displayable event types), `GET /api/weather`, session-cookie auth, scheduled jobs (`src/server/scheduled-jobs.ts`), Resend email. **None are device-ready** (cookie auth, no device identity).

**New (to build, software side):**
| Piece | Spec |
|-------|------|
| Device registry | `Device` model: id, owner userId, pubkey, fw version, last seen. Pair via 6-digit code shown on screen, confirmed in site Settings. |
| Auth | Per-device ECDSA key generated on-chip (stored in eFuse/NVS-encrypted); short-lived bearer token; no cookies. |
| `GET /api/device/notifications?since=` | long-poll/SSE (MQTT optional later). Payload CBOR ≤ 64 B: `{id, text, kind, ts}`. |
| `POST /api/device/events` | `{type:"device_copy", notifId, ts}` · `{type:"sensor", t,h,p,gas}` · `{type:"heartbeat"}` |
| Log tab | add `device_copy`, `device_sensor`, `device_pair` to the displayable-events list in `/api/logs`; render "Copied: *Coffee time!* · LOT-P1". |
| Notification author | scheduled job selects context (calendar, QIE state, weather) → AI generates ≤40-char message → enqueues for device. Same AI router already used for other jobs. |
| Copy button | press = send `device_copy` for the currently displayed notification (log + optional clipboard on the paired phone via BLE/PWA in v2). Long press = dismiss. |
| Weather | device sensor readings local; server `/api/weather` as fallback/forecast. |

## 6. PCBWay workflow

1. Gerbers + BOM + pick-and-place from KiCad 8 → upload to [PCBWay](https://www.pcbway.com/) (PCB + Assembly + CNC quotes; same account).
2. Proto: 5 rigid-flex/FPC boards, turnkey assembly, ~2–3 weeks.
3. Body: CNC quote for 316L 2-part + polish (PCBWay CNC or a local polisher; send STEP files).
4. 100-unit: panelised SMT assembly, AOI + X-ray on LGAs, functional test jig (ours), then final assembly in-house.
5. Request DFM review before every order.

## 7. Firmware

ESP-IDF 5.x (C/C++) · FreeRTOS · deep-sleep duty cycle (wake: button, IMU tap, timer, notification poll every N min) · secure boot v2 + flash encryption · signed OTA with rollback · e-paper driver + simple UI (notification, battery, temp, pair code) · BME688 BSEC · camera captured **only on explicit user action**, privacy LED forced on. Companion **flash/provision CLI** (Node, in this repo under `scripts/device/`) writes keys, serial, pairing seed.

## 8. Roadmap

| Phase | Weeks | Output | Exit gate |
|-------|-------|--------|-----------|
| 0 Spec lock | 0–2 | decide §10 questions; naming; finish | S-2 sign-off |
| 1 Software API | 1–4 | Device model, `/api/device/*`, Log tab events, simulator | green build, simulator shows "Coffee time!" on Log round-trip |
| 2 Breadboard proof | 2–5 | dev-kit end-to-end: notify → screen → Copy → Log | demo video |
| 3 EVT PCB | 5–10 | rigid-flex rev A (PCBWay), 5 units, 3D-printed + CNC Al body | boots, charges, all sensors read |
| 4 Qi-through-steel test | 6–10 | coil/window experiments with 316L samples | ≥60 % of free-air efficiency, or window design chosen |
| 5 DVT | 10–18 | rev B, 316L bodies, 20 units, firmware beta, OTA | 72 h soak; drop; thermal |
| 6 Compliance | 12–22 | FCC/CE (Wi-Fi/BLE modular approval helps), Qi, UN38.3 battery, RoHS | pre-scan pass |
| 7 PVT / 100-unit run | 22–30 | 100 units assembled, tested, serial-provisioned, manuals | ≥90 % yield |
| 8 Ship | 30–34 | packaging, charger, PDFs, support site | |

Calendar total ≈ **8 months** to 100 shipped `ESTIMATE`; compliance and battery cert are the usual slips.

**Budget `ESTIMATE`:** NRE ≈ $6–12 k (protos, jigs, test, polishing samples) + compliance ≈ $8–15 k + 100 × ≈$130 ≈ $13 k → **≈ $27–40 k all-in.**

## 9. Documents (separate files, all generated to PDF from Markdown)

`docs/technical/` (this folder; `style/` if created):
1. `LOT-P1-HARDWARE-PLAN.md` (this) · 2. `LOT-P1-BOM.csv` · 3. `LOT-P1-FIRMWARE.md` (architecture, power budget, OTA) · 4. `LOT-P1-API-CONNECTOR.md` (device endpoints, auth) · 5. `LOT-P1-MECHANICAL.md` (STEP, Z-stack, finish) · 6. `LOT-P1-USER-MANUAL.md` → PDF · 7. `LOT-P1-SERVICE-MANUAL.md` → PDF · 8. `LOT-P1-COMPLIANCE.md` · 9. `LOT-P1-CHARGER.md`.
**Compression rule (item 8):** every session ends with one report in `docs/benchmark/` + a one-line ledger entry; repeating concepts get a lexicon token; wire payloads are CBOR ≤64 B. PDF build: `pandoc` + brand CSS (script in Phase 1).

## 10. Risks & open questions (need S-2)

**Risks**
- **R1 — 5 mm thickness.** Stack math (§4) does not close with stacked layout and a 3 mm cell. Expect 7–8 mm EVT.
- **R2 — Stainless kills RF and Qi.** A solid 316L shell attenuates Wi-Fi/BLE and induction. Needs the PEEK/ceramic aperture ring and a charge window; test early (Phase 4). Polished side can stay unbroken only if the coil faces the front/side aperture, or the back plate is ≤0.3 mm with ferrite — efficiency will be poor.
- **R3 — Li-Po in a sealed steel case:** UN38.3, overcharge protection, thermal cutoff; no swelling room at 3 mm.
- **R4 — Camera privacy/regulation:** hardware LED, no continuous capture, documented data flow, GDPR/CCPA. Decide what the camera is *for*.
- **R5 — Always-on secrets in device:** per-device keys, signed OTA.

**Open questions**
1. What does the camera do (photo to Log? QR/pairing? ambient AI)?
2. What exactly does **Copy** copy (notification text to phone clipboard, or only the Log signal)?
3. Screen: e-paper (slow, pager-like) vs OLED (fast, bright)?
4. Is LOT-P1 the COSMO® hardware (target 2028–29 per About copy) or a separate product line?
5. Brand: exact colors/typography/finish from brand.lot-systems.com and CQGS relationship (`institute.lot-systems.com/cqgs.html`) — unreachable from sandbox.
6. Who is the vendor for the polished steel body (PCBWay CNC vs a polishing specialist)?
7. Target retail/giveaway price for the 100 units.
