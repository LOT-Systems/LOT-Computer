<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA — Vadik, Inventor
  Made in the USA | brand.lot-systems.com
-->

# 01 — Plan, Requirement Trace, Roadmap

## 1. Product in one paragraph
LOT PAGER is a 40 × 40 mm stainless-steel object. **Back:** solid polished stainless. **Face:** small screen, camera, one button. The LOT site (AI) pushes short notifications to the screen; pressing the button ("Copy") posts an event back to the site's Log tab. It carries a weather/environment sensor, charges wirelessly, and ships with PDF manuals and firmware docs. First run: **100 units**.

## 2. Requirement trace (your 19 points)
| # | Requirement | Plan | Status |
|---|---|---|---|
| 1 | PCBWay | PCB fab + PCBA (assembly) + CNC/sheet-metal quote at PCBWay; see 05 | planned |
| 2 | Pager-like notification from AI site | Server generates text via existing AI engines; device polls/receives; see 04 | planned, site endpoint missing |
| 3 | 2-part stainless body | 316L front frame + back plate, screws or laser weld, gasket | **risk R1/R2** |
| 4 | Flat silver square 4×4 cm × 5 mm | Target spec; honest stack-up says ≈7–8 mm with camera+Qi+battery (§4) | **decision D1** |
| 5 | Camera | OV2640-class module (2 MP) on ESP32-S3 DVP; or smaller sensor in v2 | planned |
| 6 | LOT API connector | Device token + 2 routes + admin UI; see 04 | planned |
| 7 | PDF manuals | Markdown -> PDF via pandoc in CI; user + service manual; see 05 | planned |
| 8 | Compress info each session | `SESSION-DIGEST.md` rewritten each session | done |
| 9 | Firmware documents | 03-FIRMWARE-SPEC.md | draft |
| 10 | Software connecting to firmware | Web serial flasher + provisioning page + OTA; see 04 | planned |
| 11 | Separate documents | docs/hardware/ split by concern | done |
| 12 | Charger | Qi pad (off-the-shelf 5 W, later branded) + USB-C service cable | planned |
| 13 | 100-unit run | EVT 20 -> DVT -> PVT 100; see 05 | planned |
| 14 | Weather sensor | Bosch BME688 (T/H/P/gas) + VEML7700 light | planned |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC AI gas), BMI270 IMU (on-chip motion AI), ESP32-S3 vector TinyML | planned |
| 16 | Copy button -> Log tab | POST device log event; shows in Log tab with `event: "device_copy"` | planned |
| 17 | Polished stainless side | #8 mirror polish, 316L | planned |
| 18 | Camera + screen + button side | Face layout §3 | planned |
| 19 | Wireless charger | Qi receiver coil + IC; see R2 | **risk R2** |

## 3. Architecture
```
 lot-systems.com (Fastify, Postgres, AI engines)
   |  AI/scheduler writes DeviceNotification(text)
   |  GET /api/device/poll  <-- HTTPS (long-poll 30 s, or MQTT later)
   v
 LOT PAGER (ESP32-S3, Wi-Fi 2.4 GHz)
   screen: shows text, button: Copy -> POST /api/device/log
   sensors: BME688, VEML7700, BMI270 -> POST /api/device/telemetry (batched, optional)
   camera: on-demand snapshot (opt-in) -> POST /api/device/snapshot (v2)
```
Face layout (40 mm square): screen top ~30 × 20 mm, camera lens bottom-left (Ø~5 mm), button bottom-right (≈6 mm, side-mounted tact or capacitive/metal-dome through window).

## 4. Honest engineering analysis
**R1 — 5 mm thickness.** Stack: back plate 0.6 + Qi ferrite+coil ≈0.8 + battery (smallest practical LiPo ≈3.0) + PCB 0.8 + screen/glass ≈1.5 + front plate/window 0.6 ≈ 7.3 mm; camera modules are ~4–5 mm tall and need a bump or a thinner sensor. **5 mm is achievable only without camera + with a ≤1.8 mm cell (≈40 mAh) or with a flex/stacked redesign.** Recommendation: v1 = 7.5 mm (EVT/100 run), 5 mm = v2 target using a wafer-level camera and thin cell.

**R2 — Metal blocks radio and Qi.** Stainless shields Wi-Fi/BLE and induction charging. The face needs a non-metal window (glass/sapphire) over the antenna and the coil; the polished steel back cannot sit over the coil. v1 approach: coil behind the face glass, device charges **screen-down on the pad**; antenna at a corner under the window, with a 316L frame keep-out ≥5 mm. Alternative: pogo/magnetic charging contacts on the back (not wireless).

**R3 — Battery safety/shipping.** Li-ion cell: UN38.3 test report required to ship; use certified cells; protection IC mandatory.

**R4 — Radio compliance.** Use a pre-certified ESP32-S3 module (FCC/CE modular approval) to avoid intentional-radiator testing; still need unintentional-radiator (FCC Part 15B) + Qi receiver testing. Budget below.

**R5 — Camera privacy.** Camera on a device tied to an AI site: ship with a hardware shutter or LED + firmware opt-in; no silent capture.

**R6 — Brand rules unapplied.** brand.lot-systems.com, /about, and the CQGS page could not be fetched (DNS failure from the sandbox). Finish/colors/logo/engraving rules must be pulled in next session.

## 5. Roadmap (from 2026-10-23)
| Phase | Weeks | Output | Gate |
|---|---|---|---|
| P0 Spec freeze | 0–2 (to 2026-11-06) | decisions D1–D4, brand rules, enclosure sketch | S-2 signs |
| P1 Dev-kit proof | 1–6 | ESP32-S3 dev board + screen + sensors on breadboard; site endpoints live; button -> Log works | demo "Coffee time!" end-to-end |
| P2 PCB v0.1 | 4–10 | 4-layer board, 5 pcs, PCBWay fab+assembly | boots, Wi-Fi, screen, sensors |
| P3 Enclosure proto | 6–12 | 5 CNC 316L sets, polish test, window fit | fits, charges, RF ok |
| P4 EVT | 12–18 | 20 units, firmware 0.5, manual draft | checklist pass |
| P5 Pre-compliance | 16–22 | Part 15B, Qi, battery tests | reports |
| P6 DVT/PVT | 20–30 | 100-unit pilot build, fixtures, final PDF manuals | yield ≥ 90 % |
| P7 Ship | 30–34 | 100 units, serial + device tokens provisioned | — |
Target 100 units ≈ **Q2 2027**, if D1/D2 are decided by early November.

## 6. Decisions needed from S-2
- **D1** Accept 7.5 mm for v1 (5 mm as v2)?  Recommended: yes.
- **D2** Screen-down Qi docking with glass face window? Recommended: yes.
- **D3** Screen: OLED 1.3" mono (thin, readable) vs e-paper 1.54" (low power, thicker, slow). Recommended: OLED v1.
- **D4** Camera function: QR/scan to site, "capture to Log", or ambient AI? Recommended: capture-to-Log, opt-in.
