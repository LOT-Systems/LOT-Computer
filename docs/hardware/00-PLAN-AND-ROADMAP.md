# LOT Computer (HW-001) — Plan, Analysis, Roadmap

Author: Vadik, Inventor, COSMO® CIA · Session: 2026-10-19 · Status: PLAN v0.1 (no hardware built yet)

## TL;DR (compressed)

- **Product:** a 40 × 40 mm stainless-steel "pager" that receives autonomous AI notifications from lot-systems.com ("Coffee time!"), shows them on a small screen, and sends a **Copy** button press back to the site's **Log** tab.
- **Buildable now:** ESP32-S3 + OV2640 camera + 1.54" IPS + BME280 weather sensor + Qi charging. All off-the-shelf.
- **Biggest risk #1 — 5 mm thickness.** Camera + screen + battery + Qi coil + PCB does not fit in 5 mm with standard modules. Realistic v1 is 9–10 mm; 5 mm needs a custom flex/bare-die design (v2).
- **Biggest risk #2 — metal blocks radio and Qi.** A sealed stainless body kills Wi-Fi/BLE and wireless charging. Both need a non-metal window (glass, ceramic, or PEEK). This changes the "one side polished stainless" idea: the polished face stays solid, and the charging and antenna window goes on the other side or in a slit.
- **Backend gap:** `POST /logs` exists but needs a browser session (`req.user`). Devices need token auth and a push channel. Spec in `02-API-CONTRACT.md`.
- **Cost (estimate, ±30%, replace with quotes):** about $95–125 per unit at 100 units, so about $10–13k for the run plus about $1–2k one-off costs.
- **Timeline:** about 22–26 weeks from today to 100 units shipped. Gate: the thickness decision (Phase 1).

## 1. Your 19 requirements mapped

| # | Requirement | Plan | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB fab + turnkey assembly; stainless parts via PCBWay CNC service (quote-based) | 05 |
| 2 | Pager-like AI notification | Server pushes `notify` events over WebSocket/MQTT; device beeps/vibrates and shows text | 02, 03 |
| 3 | 2-part stainless body | 316L top and bottom shells, laser-welded or 4× M1.2 screws, with gasket | 04 |
| 4 | 40×40×5 mm silver square | Target dimension; v1 = 40×40×9.5 mm, v2 = 5 mm (see 04) | 04 |
| 5 | Camera | OV2640 (2 MP) v1; OV5640 optional | 01 |
| 6 | LOT API connector | Device token + `/api/device/*` endpoints | 02 |
| 7 | PDF manuals | Markdown → PDF build (`docs/hardware/build-pdf.sh`) | all |
| 8 | Compress info per session | Every session ends with a TL;DR + decisions + open items (Section 8) | 00 |
| 9 | Firmware documents | `03-FIRMWARE-SPEC.md` | 03 |
| 10 | Software to connect with firmware | Web flasher (ESP Web Tools) + `/device` page on the site | 02, 03 |
| 11 | Separate documents | 00–05 split by audience | index |
| 12, 19 | Charger / wireless charger | Qi receiver (5 V, ~1 W) + Li-Po charger IC; Qi works only through a non-metal window | 01, 04 |
| 13 | 100-unit run | Pilot of 10, then EVT/DVT, then the 100 run | 05 |
| 14, 15 | Weather sensor, AI-grade off-the-shelf sensors | BME280 (T/RH/P) in v1; BME688 (gas/air quality, runs Bosch BSEC AI) as an upgrade; IMU optional | 01 |
| 16 | Button "Copy" → Log tab | Press sends `POST /api/device/event {type:"copy"}`; the server writes `Log{event:"device_copy"}` | 02 |
| 17, 18 | One side polished steel; other side camera + screen + button | Front = camera, screen, button. Back = mirror-polished solid steel, with a charging window (see risk #2) | 04 |
| — | Simple screen for autonomous notifications | 1.54" 240×240 IPS, text-only UI | 03 |

## 2. Architecture

```
lot-systems.com (Fastify + Postgres)
  ├─ AI engine decides "Coffee time!" ──► notification queue
  ├─ /api/device/* (token auth) ◄──────► WebSocket /device/ws
  └─ Log tab ◄── POST /logs-equivalent ◄── Copy button
                                              │ Wi-Fi (TLS)
                                    ┌─────────┴──────────┐
                                    │ HW-001: ESP32-S3   │
                                    │ screen · button    │
                                    │ camera · BME280    │
                                    │ Li-Po · Qi RX      │
                                    └────────────────────┘
```

## 3. Analysis (what the brief does not say yet)

1. **Thickness (5 mm).** Rough stack with standard parts: steel walls 2 × 0.6 mm, screen module 2.5 mm, PCB 0.8 mm, ESP32-S3 module 3.2 mm, OV2640 module about 4–5 mm, battery 3.2 mm, Qi coil 0.5 mm. That is about 14 mm if stacked naively. Side-by-side layout plus a custom PCB gets to about 9–10 mm. 5 mm requires bare ESP32-S3 on a flex PCB, a 2–3 mm camera module, and a 2 mm battery. That is a v2 effort.
2. **RF through metal.** Put the antenna under a non-metal inlay. A 40 mm body makes the antenna small; test early with a mock-up.
3. **Qi through metal.** Eddy currents block charging through 316L. Use a glass, ceramic or PEEK window over the coil, or pogo-pin charging as a fallback.
4. **Camera purpose is undefined.** Options: photo-to-Log, QR scanning, or pairing. Recommend QR pairing and photo-to-Log in v1 (shutter = long-press).
5. **Battery safety.** A Li-Po cell in a sealed steel case needs a protection circuit and UN38.3 testing before shipping; plan for it in the 100-unit run.
6. **Compliance.** Wi-Fi, Bluetooth and Qi mean FCC Part 15 testing (about $5–10k for a full lab). A pre-certified ESP32-S3 module reduces the scope. Needed before any sale; not needed for internal units.
7. **Security.** Per-device token, rotated by the server, TLS pinning, no secrets in firmware images.
8. **"Autonomous notifications".** The site needs a rules or AI trigger (scheduler → AI → notification), not just a manual send.

## 4. Roadmap

| Phase | Weeks | Output | Gate |
|---|---|---|---|
| 0. Plan (this doc) | now | Docs 00–05 | Approve BOM and risks |
| 1. Prototype on dev kits | 1–4 | Breadboard on ESP32-S3 dev kit plus screen, buttons, BME280, camera; firmware talks to a staging API | Notification shown; Copy appears in Log |
| 2. Backend | 2–6 (parallel) | Device auth, notification queue, WebSocket, Log event, `/device` page | E2E on the dev kit |
| 3. Industrial design | 3–8 | CAD for 2-part body, thickness decision (9.5 mm v1 vs 5 mm v2), RF/Qi window test | Signed-off drawings |
| 4. EVT PCB | 6–12 | KiCad design, 5–10 boards via PCBWay, first stainless samples | Boards boot, charge, connect |
| 5. DVT | 12–18 | 10–20 units, drop/seal/thermal tests, firmware OTA, PDF manuals | Pass criteria in 05 |
| 6. PVT / 100 run | 18–26 | 100 units, QC sheet, UN38.3 shipping docs | 100 units shipped |

## 5. Decisions needed from Vadik

1. v1 at 9–10 mm, or hold for 5 mm? (Recommend: v1 at about 9.5 mm.)
2. Charging window material: glass, ceramic, or PEEK? (Recommend PEEK for v1.)
3. Notification transport: WebSocket (recommended) or MQTT?
4. Camera role: QR pairing and photo-to-Log?
5. Will units be sold, or internal only? That decides FCC and UN38.3 scope.
6. Budget approval of about $13k for the 100 run.

## 6. Limits of this session

- lot-systems.com, brand.lot-systems.com and institute.lot-systems.com were **unreachable** from this environment (DNS failure), so brand rules, the About page and the CQGS page were **not read**. Brand tone in these docs follows only what is in the repo. Please re-run with network access or paste those pages.
- All prices and thickness figures are engineering estimates, not quotes. Component links are manufacturer or vendor pages; stock and price were not verified.

## 7. Sources

- [PCBWay quote page](https://www.pcbway.com/quotesmt.aspx?f=fa) (assembly is quote-based, BOM needs MPNs)
- [Adafruit MEMENTO camera board](https://learn.adafruit.com/adafruit-memento-camera-board.md?view=all) (ESP32-S3 + 1.54" 240×240 + camera reference)
- [DFRobot FireBeetle 2 ESP32-S3 + OV2640 on DigiKey](https://www.digikey.com/en/products/detail/dfrobot/DFR0975/20500154) (9-week lead time seen)
- [Waveshare ESP32-S3-LCD-2](https://www.waveshare.com/esp32-s3-lcd-2.htm) (ST7789 + camera interface)

## 8. Session log (append one block per session)

```
2026-10-19 S1  Plan v0.1 written. Docs 00–05 created. Sites unreachable.
               Decisions pending: Section 5. Next: approve BOM, start Phase 1 + 2.
```
