# LOT PLATE — Plan (HW-01)

CODENAME: LOT PLATE (P1)  ·  OWNER: S-2 Vadik Marmeladov (Inventor, COSMO® CIA)  ·  DATE: 2026-10-31  ·  REV A
STATUS: PLAN. Nothing here is built or tested. All prices/dimensions marked ESTIMATE are unverified.

## 1. What it is
A 40 x 40 mm flat stainless-steel "plate" computer, ~5 mm target thickness, bound to one LOT account.
It receives autonomous notifications from lot-systems.com (pager-style, e.g. "Coffee time!"), shows them on a small screen,
reads the room (weather/air/motion/light), has a camera, and one button. The button is **COPY**: press once and a signal
returns to the site's **Log tab** (a `device_copy` log entry). It is the first physical precursor of COSMO® hardware
(COSMO® target 2028–2029, see About.tsx "COSMO®"; requires Purple Benchmark Arbitrage™). It is NOT COSMO®.

## 2. Requirement trace (S-2 list → decision)
| # | Requirement | Decision | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB + SMT assembly + CNC 316L body all quoted at PCBWay | 08 |
| 2 | Pager-like notification from AI site | Device polls/pushes `/api/device/*`; site AI (existing job engine) enqueues notifications | 07 |
| 3 | 2-part stainless body | Front bezel + back plate, 316L, 4 screws or laser-weld seam (DVT) | 04 |
| 4 | Flat silver square 4x4 cm x 5 mm | 40x40 mm, 5.0 mm target; EVT at ≤7.5 mm (see risk R1) | 04 |
| 5 | Camera | Thin DVP module on ESP32-S3; still capture + on-demand upload | 05 |
| 6 | LOT API connector | Device token + REST (`/api/device/*`), reference sim in `tools/` | 07 |
| 7 | PDF manuals | Generated from these .md → `manuals/*.pdf` | 09 |
| 8 | Compress info each session | `STATE.md` (≤1 page) rewritten each session; reports verbatim in docs/benchmark | README |
| 9 | Firmware documents | `06-FIRMWARE.md` + `firmware/` skeleton | 06 |
| 10 | Software to connect with firmware | `tools/lot-device-sim.mjs` + serial provisioning spec | 06/07 |
| 11 | Separate documents | One file per concern (this folder) | — |
| 12 | Charger | Qi dock (off-the-shelf EVT, custom puck PVT) | 05 |
| 13 | 100 units run | Cost + schedule model | 08 |
| 14 | Weather sensor | Bosch BME688 (T/RH/P/gas) | 05 |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC AI gas classes), BMI270/BHI260 class IMU, VEML7700 light; ESP32-S3 vector instr. for on-device TinyML | 05 |
| 16 | Button "Copy" → Log tab | `POST /api/device/event {type:"copy"}` → Log `event:"device_copy"` | 07 |
| 17 | One side polished stainless | Back plate, mirror polish (Ra ≤0.05 µm target, ESTIMATE) | 04 |
| 18 | Other side camera+screen+button | Front bezel | 04 |
| 19 | Wireless charger | Qi RX (BQ51050B class) + glass window in back plate | 05 |

## 3. Three physics problems S-2 must decide on (the real plan risk)
These are why a sealed all-steel plate does not work as drawn. Detail in 04.
1. **RF**: a closed stainless shell is a Faraday cage; Wi-Fi/BLE die. Fix: non-metal aperture (ceramic/PEEK isolator along one seam edge + glass window).
2. **Qi**: steel blocks inductive charging (eddy currents). Fix: non-conductive window over the coil (⌀~26 mm glass/sapphire disc set flush in the polished back, mirror-black look). Fallback: 2 magnetic pogo pads (violates req 19 — S-2 call).
3. **Thickness**: 5.0 mm with camera + screen + battery + steel walls does not stack with an ESP32 module. EVT builds thicker; 5.0 mm needs bare-die ESP32-S3 + ≤1.6 mm cell + ≤2.3 mm camera. Decision needed: is 5 mm a hard spec or DVT goal?

## 4. Architecture (one paragraph)
Site AI (existing QIE/jobs) → notification row in DB → `GET /api/device/notifications` (long-poll 30 s, later MQTT/SSE) → ESP32-S3 shows text, vibrates/beeps (optional haptic, EVT-2) → button "COPY" → `POST /api/device/event` → Log tab entry visible to the operator at lot-systems.com. Sensors upload a compressed reading every 5 min (`POST /api/device/telemetry`); camera uploads only on explicit request. Everything the device does is written to the Log (audit-by-default, matches LOT-NODE-0 principle "record every act").

## 5. Non-goals (v1)
No cellular, no on-device LLM, no always-on video, no mic (privacy; add only with S-2 sign-off), no COSMO® behavioral-profile transfer (Soul Sync Protocol™ is a later gate).

## 6. Open questions for S-2
Q1 5 mm hard or goal? · Q2 glass back window acceptable (R2)? · Q3 screen: color IPS (baseline) vs e-paper (battery)? · Q4 haptic/buzzer wanted? · Q5 camera privacy shutter? · Q6 target market for 100 units (internal/beta/sale → certification scope)? · Q7 per-user or per-device account binding?
