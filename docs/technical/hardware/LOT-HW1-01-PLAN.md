# LOT-HW1 — Plan (Document 01 of 06)

**Product:** LOT Pager / LOT Computer, hardware unit 1 (`LOT-HW1`)
**Owner:** S-2 Vadik Marmeladov · COSMO® CIA
**Status:** PLAN — nothing is built or ordered. Dated 2026-10-04.
**Set:** 01 Plan · 02 BOM · 03 Roadmap · 04 Firmware · 05 API connector · 06 Manufacturing & manuals

> Evidence labels used throughout: **VERIFIED** (read in this repo or a cited source), **ESTIMATE** (engineering judgement, needs a quote or a bench test), **DECISION** (S-2 must choose). Prices are ESTIMATES, not quotes.
> Sandbox limit: `lot-systems.com`, `brand.lot-systems.com`, `institute.lot-systems.com` and most vendor sites were blocked in this session, so brand/CQGS pages were **not read**. Brand tokens below come from `tailwind.config.js` in this repo.

## 1. What it is

A 40 × 40 mm flat stainless-steel object that receives autonomous notifications from lot-systems.com ("Coffee time!"), shows them on a small screen, and lets the wearer press one button, **Copy**, which sends a signal back to the site's **Log** tab.

| Face | Content |
|---|---|
| Side A | Polished stainless steel, plain mirror. Nothing on it. |
| Side B | Screen, camera, one button. |

Body: two stainless parts (back plate + frame/bezel). Charging: wireless (Qi). Sensors: weather + off-the-shelf "AI-grade" parts. Run: 100 units.

## 2. Requirement map (your 19 points → where handled)

| # | Your line | Handled in |
|---|---|---|
| 1 | PCBWay | Doc 02 (BOM), Doc 06 (order package) |
| 2 | Pager-like notification from AI site | Doc 05 §3 (notification flow) |
| 3 | 2-part stainless body | §4 below, Doc 06 |
| 4 | 4×4 cm × 5 mm silver square | §4 — **5 mm is high-risk, see §5** |
| 5 | Camera | Doc 02, Doc 04 §6 |
| 6 | LOT API connector | Doc 05 |
| 7 | PDF manuals | Doc 06 §4 (PDFs generated from these .md files) |
| 8 | Compress info each session | Session report + benchmark ledger/lexicon (`docs/benchmark/`) |
| 9 | Firmware documents | Doc 04 |
| 10 | Software to connect with firmware | Doc 04 §8 (web flasher + provisioning) |
| 11 | Separate documents | This 6-document set |
| 12, 19 | Charger / wireless charger | §6, Doc 02 |
| 13 | 100-unit run | Doc 03 phase P4, Doc 06 |
| 14, 15 | Weather + AI-grade sensors | §7, Doc 02 |
| 16 | Button "Copy" → Log tab | Doc 05 §4 |
| 17, 18 | Side A polished / Side B screen+camera+button | §1, §4 |

## 3. Architecture

```
 lot-systems.com (Fastify + Postgres, existing)
   scheduled job / AI  ──►  device_notification (NEW)  ──►  GET /api/device/notifications
                                                                   │  HTTPS, Bearer device token
 Log tab  ◄── POST /api/device/events {copy} ◄── LOT-HW1 (ESP32-S3, Wi-Fi) ◄─┘
 (Log row event='device_copy', shown in GET /logs)       screen · button · camera · BME688 · IMU
```

## 4. Mechanical concept

- **Body:** 316L austenitic stainless (non-magnetic, corrosion-resistant) ESTIMATE-choice; 304 acceptable. Two parts: (1) back plate, mirror-polished; (2) frame + front bezel with window for screen, camera aperture, button hole. Joined by laser weld or 4 micro-screws + gasket (DECISION: weld is cleaner, screws are serviceable).
- **Footprint:** 40 × 40 mm, corner radius ~3 mm (DECISION).
- **Front:** thin cover glass over screen; small separate lens window for camera; one tactile button (side-mounted tact, or a pressed bezel region).
- **Brand colours for the screen UI** (from this repo's `tailwind.config.js`, VERIFIED): background `#1a1a1a` / `#050505`, accent blue `#43aff3`, yellow `#fef17b`, text white; font Arial/Helvetica. Re-check against brand.lot-systems.com before design freeze (not readable in this session).

## 5. The three physics problems (read these first)

These are the reasons a naive build fails. Each has a mitigation and a bench test in the roadmap.

### 5.1 Thickness: 5 mm is very hard
Stack budget (ESTIMATE, mm):

| Layer | Track A "5.0 target" | Track B "realistic Gen-1" |
|---|---|---|
| Steel back plate | 0.5 | 0.8 |
| Qi coil + ferrite | 0.3 | 0.5 |
| Battery (ultra-thin LiPo) | 1.2 | 2.0 |
| PCB + tallest part (BME688 0.9 mm, bare QFN 0.85 mm) | 1.4 | 1.8 |
| Display module (glass) | 1.2 | 1.5 |
| Cover glass / bezel lip | 0.4 | 0.6 |
| **Total** | **5.0** | **7.2** |

- ESP32-S3-MINI-1 module is 15.4 × 20.5 × **2.4** mm (VERIFIED, [Espressif datasheet](https://www.espressif.com/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf)) — too tall for Track A. Track A needs a **chip-down** ESP32-S3 design (own RF layout) which loses the module's pre-certification (see 5.4).
- Camera modules are typically 3–5 mm tall (ESTIMATE) and are the real thickness limiter; a 5 mm body forces a very thin fixed-focus module or a sensor-on-flex design.
- **Recommendation (DECISION for S-2):** build Gen-1 (EVT/DVT) at **≈7 mm using the module**, prove everything works, then chase 5 mm in a Gen-2 respin. Do not promise 5 mm to anyone for the first 100 units unless a thin camera + thin cell are confirmed in P1.

### 5.2 Wireless charging through steel
Qi power does not pass through a continuous stainless plate efficiently (eddy-current loss; ESTIMATE: large loss, must be measured). Options:
- **A (recommended to test first): charge face-down through the front.** Coil sits behind the cover-glass side, so the polished back faces up. Needs the coil to avoid the display's metal; test coil-under-display vs coil-in-border.
- **B:** small non-metal (ceramic/PEEK) disc inset in the back plate — breaks the "pure mirror" (DECISION).
- **C:** very thin (≈0.3 mm) 316L over a ferrite-backed coil — marginal; only if bench test shows acceptable efficiency.
- Receiver: TI BQ51013B-class Qi receiver (see [TI product page](https://www.ti.com/product/BQ51013B); Adafruit-style modules use it per search results) → Li-ion charger IC. Qi **logo** certification is out of scope for 100 units; interoperability test with 3 common pads instead.
- Expected output is 5 V class, ≤ 1 A, which is plenty for a ~100 mAh cell.

### 5.3 Radio and sensors inside a steel box
- **Wi-Fi/BLE antenna** cannot sit inside a sealed metal can. Put the antenna at the front/glass side, ≥ 5 mm from steel (ESTIMATE keep-out), or cut a plastic-filled slot in the frame. Needs an over-the-air range test on a steel mock-up in P1. This is the biggest functional risk after thickness.
- **Weather sensor** needs airflow. A sealed body reads its own heat. Add a ~0.8 mm vent with hydrophobic membrane near the sensor (DECISION: breaks water-sealing claim; fine for splash only). Also expect self-heating offset; calibrate in firmware, and use the site's server-side `/api/weather` (VERIFIED route exists in `src/server/routes/api.ts`) as fallback.

### 5.4 Regulatory
- An unlicensed 2.4 GHz radio sold or distributed needs FCC (US, "Made in the USA" per `docs/README.md`) and CE-RED if shipped to EU. Using a pre-certified module (ESP32-S3-MINI-1) can reduce cost; chip-down means full intentional-radiator testing. Budget ESTIMATE $5k–15k (Doc 03). Lithium cell needs UN38.3 for shipping. Confirm with a test lab before P4.
- Camera on a worn device: privacy by design — see Doc 04 §6 (capture only on button, visible indicator, no always-on stream).

## 6. Power

- Cell: ~50–120 mAh thin LiPo with protection (thickness drives capacity; see Doc 02 note).
- Charge path: Qi RX → charger/power-path IC → 3.3 V buck/LDO. Fuel gauge optional.
- Duty cycle (ESTIMATE): ESP32-S3 deep sleep ~10–20 µA; wake every 1–5 min to poll over Wi-Fi (~100–300 mA for ~1–3 s); screen on only after a new notification or button press. Rough battery life ESTIMATE 1–3 days at 100 mAh with 2-min polling; to be measured in P2. A latch-style e-paper alternative is noted in Doc 03 as a Gen-2 option.

## 7. Sensors (weather + AI-grade, all off-the-shelf)

- **Bosch BME688**: gas + humidity + pressure + temperature, 3.0 × 3.0 × 0.9 mm, on-sensor AI gas scanning (VERIFIED: [Bosch product page](https://bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/), [datasheet](https://cdn.sparkfun.com/assets/0/a/b/6/7/BME688_Datasheet.pdf)). Covers weather (14) and an AI-grade sensor (15) in one part.
- **Bosch BMI270** 6-axis IMU (tap/wrist/motion; on-chip gesture features) — ESTIMATE-choice, part number to confirm in P1.
- **Ambient light sensor** (auto brightness; sunrise/sunset tie-in with LOT time palette) — part TBD in P1.
- Microphone: **excluded in Gen-1** (privacy, thickness).

## 8. Open decisions for S-2

1. Accept ≈7 mm Gen-1 (recommended) or hold 5 mm?
2. Charging face: back-through-glass (A) vs ceramic inset (B)?
3. Weld vs screws? Vent allowed?
4. What does the camera *do* for the user (snap-to-Log? scan?). Plan assumes **snap → upload → Log entry**; confirm.
5. Screen type: colour IPS (cheap, ~1.3") vs AMOLED (thin, pricey) vs e-paper (low power, slow).
6. Target regions for certification (US only / US+EU).
7. Who is the first-100 audience (staff, Usership/Onyx tags per `docs/` — not verified)?

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
