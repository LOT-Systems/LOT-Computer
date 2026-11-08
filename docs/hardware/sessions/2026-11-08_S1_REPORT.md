# LOT PAGER — Hardware Computer Connected to lot-systems.com
**Doc:** LOT-HW-01 · **Session:** 2026-11-08 (S1) · **Owner:** Vadik, Inventor, COSMO® CIA
**Status:** PLAN + BOM + ROADMAP. No hardware ordered. All prices are planning estimates (see §9).

## 0. TL;DR
- Device: 40 × 40 × ~6 mm stainless-steel pager. Back = polished mirror steel. Front = small screen, camera, one button ("Copy").
- Brain: ESP32-S3 (Wi-Fi/BLE, camera + display capable). Sensors: BME688 (weather + gas), IMU, ambient light.
- Link to site: new `/api/device/*` endpoints on LOT API. Site pushes short notices ("Coffee time!") to the screen. Button press writes a `device_copy` event into the Log tab.
- Build: PCBWay (PCB + SMT + CNC steel), pilot 10 units, then 100.
- Estimated landed cost: **~$95–130/unit, ~$10–13k for 100** (estimate).
- **Three physics risks need a decision before PCB layout** (§3): 5 mm thickness, steel blocking Qi charging, steel blocking Wi-Fi.

## 1. Requirement map (your 19 points)
| # | Requirement | Where addressed |
|---|---|---|
| 1 | PCBWay | §5 supplier plan |
| 2 | Pager-like notification from AI site | §4 architecture, LOT-HW-03 |
| 3 | 2-part stainless body | §3, §5 |
| 4 | Flat silver square 4×4 cm × 5 mm | §3 (risk R1: 5 mm is very tight; fallback 6.5 mm) |
| 5 | Camera | §2 BOM, §3 |
| 6 | LOT API connector | LOT-HW-03 |
| 7 | PDF manuals | LOT-HW-06 + PDF in this folder |
| 8 | Compress info each session | §8 session protocol (≤1 page digest, ≤80-char payloads) |
| 9 | Firmware documents | LOT-HW-04 |
| 10 | Software to connect to firmware | LOT-HW-05 (pairing/flash tool) |
| 11 | Separate documents | LOT-HW-01…06 + BOM CSV |
| 12 | Charger | §2 (Qi puck, see R2) |
| 13 | 100-unit run | §6 roadmap, §7 cost |
| 14 | Weather sensor | BME688 |
| 15 | AI-grade off-the-shelf sensors | BME688 (on-chip gas AI/BSEC), BMI270 IMU (gesture), LTR-559 light |
| 16 | Button "Copy" → Log tab | LOT-HW-03 (`device_copy` event) |
| 17 | One side polished stainless | back plate, mirror polish #8 |
| 18 | Other side camera + screen + button | front plate |
| 19 | Wireless charger | Qi, see R2 |

## 2. Component buying list
Links go to vendor/search pages, not verified live listings (the routine's network could not reach vendors). Verify part numbers at purchase. Full table: `LOT-HW-02-BOM.csv`.

| Block | Part | Why | Source |
|---|---|---|---|
| MCU | ESP32-S3FH4R2 (or module ESP32-S3-MINI-1U w/ external antenna) | Wi-Fi/BLE, DVP camera, SPI display, deep sleep | https://www.lcsc.com/search?q=ESP32-S3FH4R2 |
| Camera | OV2640 FPC module (small 8×8 mm, 2MP) | cheap, ESP32 supported | https://www.aliexpress.com/wholesale?SearchText=OV2640+fpc |
| Screen | 0.96" 160×80 IPS SPI (ST7735/ST7160) or 0.91" 128×32 OLED | simple text notices, thin | https://www.lcsc.com/search?q=0.96+inch+IPS+SPI |
| Weather | Bosch BME688 | temp/humidity/pressure/gas, on-chip AI (BSEC) | https://www.digikey.com/en/products/result?keywords=BME688 |
| IMU | Bosch BMI270 | tap/gesture/step, low power | https://www.digikey.com/en/products/result?keywords=BMI270 |
| Light | LTR-559 / VEML7700 | auto-dim screen | https://www.lcsc.com/search?q=VEML7700 |
| Haptic | 6 mm LRA + DRV2605L driver | pager buzz (silent) | https://www.digikey.com/en/products/result?keywords=DRV2605L |
| Button | Ultra-low-profile tact switch, ≤1.5 mm | "Copy" | https://www.lcsc.com/search?q=SMD+tact+switch+1.5mm |
| Battery | LiPo ~3×20×25 mm, 120–150 mAh w/ protection | fits thin stack | https://www.digikey.com/en/products/result?keywords=lipo+301525 |
| PMIC | BQ25100 or MCP73831 + 3.3 V LDO/buck (TPS62740) | charge + power | https://www.digikey.com/en/products/result?keywords=BQ25100 |
| Wireless RX | Qi receiver IC (e.g. SGM-/CPS4041 class) + 0.3 mm thin RX coil with ferrite | wireless charge | https://www.lcsc.com/search?q=qi+receiver+coil |
| Charger (dock) | 5 W Qi puck, off-the-shelf, ×10 pilot / ×100 | item 12 / 19 | https://www.aliexpress.com/wholesale?SearchText=qi+wireless+charger+5w |
| USB-C pogo/ test | 4-pin pogo pads on PCB | flashing + fallback charge | on PCB |
| Body | 316L stainless, 2 CNC parts, mirror-polished back | items 3,4,17 | https://www.pcbway.com/cnc-machining-quote.html |
| PCB + SMT | 4-layer, 0.8 mm, ENIG | item 1 | https://www.pcbway.com/ |

## 3. Physics risks (decide before layout)
**R1 — 5 mm thickness.** Stack: front steel 0.8 + display 1.6 + PCB 0.8 + battery 3.0 + back steel 0.8 = 7.0 mm before coil/camera. 5 mm is not achievable with camera + display + battery + Qi. Options: (A) 6.5–7 mm body (recommended); (B) 5 mm "shell" with no camera/Qi.
**R2 — Steel blocks Qi.** Eddy currents in stainless kill wireless charging. Fix: non-metal window behind the coil (ceramic/glass/PEEK insert in the back or a ceramic ring), which breaks the "fully polished" back. Alternative: charge through the front via a plastic-glass window and keep the back pure mirror. Fallback: pogo-pin dock.
**R3 — Steel blocks RF.** Wi-Fi/BLE antenna needs a non-metal slot: a plastic/ceramic gasket in the seam between the two parts (the gasket doubles as waterproof seal). Use u.FL/ceramic antenna at the gasket edge.
**R4 — Camera/screen windows.** Sapphire or glass 0.5 mm inlays in front plate; adhesive-sealed.
**R5 — Privacy.** Camera must have a hardware shutter or LED + off-by-default; log capture events.

## 4. Architecture
```
 lot-systems.com (Fastify API) ──SSE/WebSocket──▶ LOT PAGER (ESP32-S3)
   AI engine → notice (≤80 chars)        ◀──HTTPS POST── button "Copy", sensor, photo
   Log tab  ◀── event: device_copy
```
Existing repo hooks: `src/server/routes/api.ts` has `/sync` SSE, `/weather`, `/logs`, `/live-message`; `Log` model has `event`, `text`, `metadata`. Auth today is a cookie JWT, so the device needs its own token (LOT-HW-03).

## 5. Supplier plan (PCBWay)
1. PCB fab + SMT assembly (turnkey): Gerbers, BOM, pick&place.
2. CNC 316L, 2 parts, polish #8 mirror on back; ask for DFM review + sample.
3. Housing gasket (silicone/PEEK) via PCBWay 3D print/CNC.
4. Pilot 5–10 → EVT, then 100 → DVT/PVT. Request quote at each stage; PCBWay lead times are quote-dependent.

## 6. Roadmap (est. 22–26 weeks)
| Phase | Weeks | Output | Gate |
|---|---|---|---|
| P0 Decide | 0–1 | Resolve R1–R3, lock thickness | Vadik sign-off |
| P1 Proto on dev kit | 1–5 | ESP32-S3 devkit + screen + BME688 talks to API; server endpoints live | Notice shown on screen, Copy → Log |
| P2 Schematic/PCB | 4–9 | v0.1 schematic, layout, DFM | PCBWay DFM pass |
| P3 Body CAD | 6–11 | 2-part steel, gasket, windows | CNC sample quote |
| P4 EVT (10 units) | 10–16 | Assembled units, charging proven through window | Qi ≥ 70 % eff., RF range ≥ 10 m |
| P5 Firmware/Software | 8–18 | OTA, pairing, flasher tool, manuals | All HW docs v1.0 |
| P6 DVT/PVT | 16–22 | 20-unit run, drop/seal/thermal tests | Pass criteria |
| P7 Production 100 | 22–26 | 100 units, QA, packaging | Ship |

## 7. Cost estimate (100 units, USD, planning only)
| Item | /unit | ×100 |
|---|---|---|
| PCB + SMT | 14–20 | 1.4–2.0k |
| Components (MCU, camera, display, sensors, battery, Qi) | 22–32 | 2.2–3.2k |
| CNC stainless pair + polish + gasket + windows | 45–65 | 4.5–6.5k |
| Qi dock | 5–8 | 0.5–0.8k |
| Pack, test jig, QA, shipping | 6–10 | 0.6–1.0k |
| **Total** | **~92–135** | **~9.2–13.5k** |
Plus one-off: stencils/fixtures, EVT/DVT iterations (~$1.5–3k), certification FCC/CE if sold (~$5–15k, not included).

## 8. Session protocol (item 8)
Each working session ends with one MD report in `docs/hardware/sessions/`: ≤1 page — decisions, open risks, next 3 actions. Device-bound text: ≤80 chars, one idea, no emoji (MILITARY PURITY).

## 9. Honest limits of this session
- No network access to lot-systems.com / brand / institute pages (blocked), so brand tone was taken from repo docs (military purity, no emoji). Re-run with those domains allowed to align the design language.
- Prices, lead times and part availability are estimates, not quotes.
- No PDF manuals for end users can be final until R1–R3 are decided; a draft PDF is included.

## 10. Next 3 actions
1. Decide thickness (6.5–7 mm) and charging window approach (R1/R2).
2. Implement `/api/device/*` (LOT-HW-03) and test with an ESP32-S3 devkit.
3. Request PCBWay CNC + PCB quotes using LOT-HW-02.
