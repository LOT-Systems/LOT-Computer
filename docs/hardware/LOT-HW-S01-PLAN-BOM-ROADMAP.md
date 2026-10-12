# LOT® COMPUTER — HARDWARE PLAN / BOM / ROADMAP
SESSION HW-S01 · 2026-10-12 · Author: Vadik Marmeladov, Inventor, COSMO® CIA
Status: PLAN. Nothing is ordered, nothing is quoted. All prices are ESTIMATES (see §9).

## 0 LIMITS OF THIS SESSION
- brand.lot-systems.com, lot-systems.com/about and institute.lot-systems.com/cqgs.html were NOT reachable from the sandbox (DNS failure). Brand rules below come from `docs/technical/LOT-STYLE-GUIDE.md` and `docs/technical/LOT-NODE-0-RIG-SPEC.md` only. Re-check the brand site before CMF (color/finish) sign-off. CQGS is not summarized here.
- No live PCBWay quote or stainless-enclosure quote was found. 100-unit costs need a file submission (PCBWay quotes in ~1-2 business days).
- No hardware, firmware or PCB files were produced this session. Deliverable = plan + analysis.

## 1 PRODUCT DEFINITION
A flat 40 x 40 x 5 mm (checked in §4) stainless-steel "pager" that receives autonomous notifications from lot-systems.com (e.g. "Coffee time!"), shows them on a small screen, and sends a COPY press back to the site's Log tab. Existing repo concept: QIoT™ (physical extension of LOT signal capture; wiki v82 §QIoT).

Two-part body:
- BACK: polished stainless steel plate (mirror). Wireless-charge face.
- FRONT: stainless shell with camera window, screen, one button ("Copy").
- Silver, square, 4 x 4 cm, 5 mm height (as specified).

## 2 SYSTEM LOGIC (maps to your 19 points)
| # | Requirement | Plan |
|---|---|---|
| 1 | PCBWay | PCB fab + turnkey SMT assembly; prototype 5-10 then 100 |
| 2 | Pager notification from AI site | Server pushes message to device (§5) |
| 3 | 2-part stainless body | 316L, front shell + back plate, laser-welded or screw-sealed |
| 4 | 4x4 cm x 5 mm | Feasibility §4: HARD. Needs thin parts |
| 5, 18 | Camera | Front, 2MP-class module with ~2.5 mm Z |
| 6 | LOT API connector | Device endpoints + token (§5) |
| 7, 9, 10, 11 | Manuals, firmware docs, software, separate docs | Doc set §7 |
| 8 | Compress info each session | One report per session, `docs/hardware/`, plus rolling LEDGER |
| 12, 19 | Charger / wireless | Qi/Qi2-class receiver coil + simple pad |
| 13 | 100-unit run | Pilot 10 -> EVT 25 -> 100 |
| 14, 15 | Weather sensor, off-the-shelf AI-grade sensors | BME280-class + (optional) IMU/light; cloud-side AI |
| 16 | Button "Copy" -> Log tab | POST event `device_copy` (§5) |
| 17 | Polished stainless back | 316L, #8 mirror finish |

## 3 BILL OF MATERIALS (candidate, per unit, estimates)
Parts picked for size first. Verify every part number and stock before ordering; none were price-checked live.

| Block | Candidate | Why | Est. @100 |
|---|---|---|---|
| MCU + Wi-Fi/BLE | Espressif ESP32-S3 (bare module, e.g. ESP32-S3-MINI-1 or chip-down) | Camera (DVP) + Wi-Fi + BLE, huge community, OTA | $4-6 |
| Camera | OV2640 or OV5640 DVP module with small flex (OV2640 found in Seeed XIAO ESP32S3 Sense and LILYGO T-Camera-S3; OV5640 in Waveshare ESP32-S3 AIoT Camera) | proven with S3 | $3-8 |
| Screen | 0.96-1.3" IPS/OLED, SPI/I2C (a 0.96" OLED is used on LILYGO T-Camera-S3) | simple text notifications | $3-6 |
| Button | 3x3 mm low-profile tact, or capacitive/pressure-sealed dome | "Copy" | $0.3 |
| Weather | Bosch BME280 / BME688 (temp, humidity, pressure; 688 adds gas) | off-the-shelf, tiny | $3-8 |
| Motion/light (opt.) | IMU (e.g. LIS2DW12) + ambient light | wake on pick-up, auto-dim | $1-3 |
| Battery | 3.7 V LiPo, ~200-300 mAh, <=3 mm thick | thickness-limited | $2-4 |
| Charge/PMIC | Li-ion charger + 3V3 regulator + fuel gauge | | $1.5-3 |
| Wireless charging | Qi receiver IC + thin ~Ø25-30 mm receiver coil w/ ferrite | | $3-6 |
| Haptic/buzzer (rec.) | Piezo or LRA, for pager feel | pager = alert | $0.5-1.5 |
| PCB | 4-6 layer, ~0.8 mm, 38 x 38 mm, ENIG | | $3-6 |
| Enclosure | 316L, 2 parts, CNC/MIM + polish | cost driver | $15-45 |
| Misc | gaskets, screws, glass/sapphire window, adhesives | | $2-5 |
| **Total (rough)** | | | **~$45-100/unit** |

Note: stainless blocks wireless charging. Metal on the charging side shields the coil. Options: (a) plastic/ceramic/glass charging window in the back plate, (b) coil under a non-metal inlay, (c) contact pogo charging instead. This conflicts with a fully polished stainless back; see §6 risk R1.

Links (starting points; confirm before use):
- PCBWay: https://www.pcbway.com (PCB + assembly + CNC)
- Espressif ESP32-S3: https://www.espressif.com/en/products/socs/esp32-s3
- Seeed XIAO ESP32S3 Sense (reference design): https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html
- LILYGO T-Camera-S3: https://wiki.lilygo.cc/products/t-camera-series/t-camera-s3/
- Waveshare ESP32-S3-CAM: https://docs.waveshare.com/ESP32-S3-CAM-OVxxxx
- Bosch BME280: https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/
(Links from search results or manufacturer homepages; deep product URLs not verified.)

## 4 FEASIBILITY: 40 x 40 x 5 mm
Stack-up (mm): back plate 0.8 + coil/ferrite 0.5 + battery 2.8 + PCB 0.8 + screen 1.0 + front shell 0.6 = ~6.5 mm. Target is 5.
- Shortfall ~1.5 mm. Fixes: thinner battery (2.0 mm, ~120 mAh), integrate walls into plates, use FPC-mounted camera, skip battery thickness via lower capacity, or allow 6-7 mm for EVT.
- Camera Z (typical 2.5-4 mm w/ lens) likely exceeds 5 mm locally. Expect a small bump or 6 mm in v1.
- Recommendation: EVT at 40 x 40 x 7 mm. Squeeze to 5 mm only in DVT after measuring real parts.

## 5 SOFTWARE / API CONNECTOR
Existing repo facts: Fastify routes in `src/server/routes/api.ts`; `Log` model (`userId`, `text`, `event`, `metadata`, `context`) in `src/server/models/log.ts`; weather model exists. No device endpoints exist yet.

Proposed (NOT implemented):
- `POST /api/device/pair` (user session -> returns per-device token)
- `GET /api/device/inbox` (device polls, long-poll or MQTT/WebSocket later) -> notification `{id, text, ts}`
- `POST /api/device/event` (token auth) -> writes `Log` row `event='device_copy'`, `metadata={deviceId, notifId, fw}`; shows in Log tab
- `POST /api/device/telemetry` (temp/humidity/pressure, battery) -> weather context
- Server job: AI decides notification (e.g. "Coffee time!") using existing engines; rate-limited; every send logged (matches NODE-0 "record every act" doctrine).
Security: per-device revocable token, TLS, signed OTA, no camera upload without explicit on-device action + visible LED/screen indicator.

## 6 RISKS
- R1 Stainless vs wireless charging (high). Needs non-metal window or pogo pins.
- R2 Thickness 5 mm (high). See §4.
- R3 Wi-Fi/BLE antenna inside a metal case (high). Needs a plastic/ceramic window or slot antenna; certification (FCC Part 15 + battery UN38.3) required before selling. Not budgeted below.
- R4 Camera privacy (med).
- R5 Heat from camera + charging in a sealed case (med).
- R6 Enclosure cost/lead time (med). Get quotes from PCBWay CNC and 1-2 other metal shops.
- R7 AI sensors on a small MCU (low): do inference in the cloud; device only sends data.

## 7 DOCUMENT SET (point 7, 9, 10, 11)
Separate files, each with PDF export (build with pandoc or the repo's PDF tooling): 
1. User Manual  2. Quick-start  3. Charging & safety  4. Firmware architecture  5. Firmware release/OTA  6. Pairing & API reference  7. Companion software (flasher/config)  8. Factory test procedure (100-unit run)  9. BOM & supplier list.
Only this plan exists today.

## 8 ROADMAP
| Phase | Weeks | Output | Gate |
|---|---|---|---|
| P0 Spec freeze | 0-2 | CMF, thickness decision, charging decision | S-2 sign-off |
| P1 Dev kit proof | 2-6 | ESP32-S3 + camera + OLED on breadboard; pairing + notification + Copy -> Log working | Demo on lot-systems.com |
| P2 Server API | 3-7 | `/api/device/*`, Log tab "device" rows, tests | Green build |
| P3 EVT PCB | 6-12 | PCBWay 5-10 boards, 3D-printed/CNC case | Boots, charges, all sensors read |
| P4 Metal prototypes | 10-16 | 5-10 stainless units | Fit + wireless test |
| P5 DVT + docs | 14-22 | Final PCB, firmware v1.0, manuals | Pilot 25 |
| P6 Certification | 18-30 | FCC/CE pre-scan, battery UN38.3 | Pass |
| P7 Run of 100 | 28-38 | Turnkey SMT + metal + assembly + QA | 100 shipped |
Timeline is a rough guess; certification and metal sourcing dominate.

## 9 BUDGET (very rough, order of magnitude)
- Per-unit @100: $45-100 -> $4.5k-10k
- NRE: PCB spins, fixtures, tooling, prototypes: $5k-15k
- Certification: $5k-20k
- Charger pads x100: ~$3-8 each
Treat as placeholders until PCBWay and metal quotes return.

## 10 NEXT SESSION (HW-S02)
1. S-2 decisions: charging window vs pogo; accept 6-7 mm EVT?
2. Re-fetch brand sites if reachable; write CMF page.
3. Implement `/api/device/*` stubs + Log event `device_copy` on a feature branch.
4. Draft schematic block diagram + pin map for ESP32-S3.
5. Request quotes: PCBWay (PCB+SMT, 100), metal enclosure.
