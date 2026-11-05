<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT® | Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  brand.lot-systems.com
-->

# LOT® Pager (working name) — Hardware Computer v0.1: Plan, BOM, Roadmap

**Author:** Vadik Marmeladov, Inventor, COSMO® CIA  
**Session:** 2026-11-05 · HW-S01  
**Status:** PLAN — design not yet locked. No hardware ordered. No prices are quotes.

> **Source limits.** lot-systems.com, brand.lot-systems.com and institute.lot-systems.com
> could not be reached from this sandbox (DNS blocked). The CQGS page, brand page and
> About page were **not read**. This plan uses only repo docs (`docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md`,
> `docs/technical/LOT-STYLE-GUIDE.md`, `src/server/routes/api.ts`). Re-run the brand and CQGS pass
> once those hosts are allowed. All prices below are **planning estimates**, to be replaced by quotes.

---

## 1. Product in one paragraph

A 40 × 40 mm stainless-steel slab. One face is polished mirror steel. The other carries a small
screen, a camera and one button. The AI on lot-systems.com decides when to notify; the device shows
it ("Coffee time!") and buzzes like a pager. Pressing the button sends **"Copy"** back to the site and
it appears in the **Log tab**. It charges wirelessly, carries weather sensors, and ships with PDF manuals.

## 2. Your 19 requirements → design decisions

| # | Requirement | Decision | Risk |
|---|---|---|---|
| 1 | PCBWay | PCB + PCBA + CNC steel + 3D-print prototypes, all via PCBWay | Low |
| 2 | Pager-like AI notification | Device holds an outbound TLS connection (MQTT/WebSocket); site pushes; LRA haptic + screen | Low |
| 3 | 2-part stainless body | 316L top shell + bottom shell, laser-welded or 4 × M1.2 screws w/ gasket | Med |
| 4 | Flat silver square 4×4 cm × 5 mm | **Not achievable with camera + screen + Qi + battery.** See §3. v1 = 40×40×8 mm; 5 mm = v2 on flex PCB | **High** |
| 5 | Camera | 2 MP FPC module (OV2640 class), through a sapphire/glass window | High (thickness) |
| 6 | LOT API connector | `/api/device/*` endpoints, per-device token (spec in `LOT-DEVICE-API-v0.1.md`) | Low |
| 7 | PDF manuals | Generated from the Markdown in this folder (pandoc → PDF) | Low |
| 8 | Compress info each session | One `SESSION-REPORT` + rolling `STATE.md` (≤1 page) | Low |
| 9 | Firmware documents | `LOT-FIRMWARE-SPEC-v0.1.md` | Low |
| 10 | Software to connect with firmware | Web flasher (ESP Web Tools) + pairing page on the site | Low |
| 11 | Separate documents | One doc per concern, see §10 | Low |
| 12 | Charger | Qi-style 5 V desk pad, custom 15 mm coil on device | Med (steel) |
| 13 | 100 units | EVT 5 → DVT 20 → PVT 100 | Med |
| 14 | Weather sensor | BME688 (temp / humidity / pressure / gas) | Low |
| 15 | "AI-grade" off-the-shelf sensors | BME688 (on-chip gas AI), BMI270 IMU, VEML7700 light | Low |
| 16 | Button = "Copy" → Log tab | `POST /api/device/events {type:"copy"}` → log row | Low |
| 17 | One side polished steel | 316L, Ra ≤ 0.05 µm mirror finish, no openings except charge window | Med |
| 18 | Other side: camera, screen, button | Front face layout in §4 | Med |
| 19 | Wireless charger | Same as 12 | Med |

## 3. Hard engineering problems (read before ordering anything)

1. **5 mm thickness.** Stack: two steel walls (2 × 0.8 = 1.6) + OLED (1.4) + PCB (0.8) + battery (≥3.0) = 6.8 mm *before* the camera (≈4–6 mm module) and coil. v1 therefore targets **40×40×8 mm**. A true 5 mm needs a flex-PCB, a sub-2 mm camera, a 2 mm cell and thinner walls: treat as v2 research.
2. **Steel blocks radio and Qi.** A sealed steel box is a Faraday cage: no Wi-Fi/BLE, no wireless charging. Fix: a non-metal **window** (zirconia ceramic or sapphire disc, ~18 mm) flush with the polished face for the coil, and the antenna sits under a non-metal strip or the glass of the front face. This puts one visible disc on the "polished" side — decide whether that is acceptable. Alternative: magnetic pogo-pin charging (no window, loses "wireless").
3. **"Made in the USA".** The LOT headers say Made in the USA. PCBWay manufactures in China. Do **not** label units Made in USA. Use "Designed in USA" unless final assembly moves to the US.
4. **Camera privacy.** A camera on an AI-connected device needs a hardware indicator LED tied to the sensor power rail, and capture only on explicit button/command. Write it into the manual.
5. **Compliance for selling 100 units.** FCC Part 15 (use a pre-certified ESP32 module to avoid intentional-radiator testing; still need unintentional-radiator test), Li-ion cell UN38.3 + IEC 62133 for shipping. Budget for it.

## 4. Architecture

```
 lot-systems.com (AI decides) ──TLS/MQTT──►  LOT Pager
   /api/device/inbox  ◄──────────────────  ESP32-S3
   /api/device/events (Copy → Log tab)      ├ 0.96" OLED  (notification text)
                                            ├ OV2640 FPC camera (window, LED)
                                            ├ 1 tactile button ("Copy")
                                            ├ LRA haptic + (optional) piezo
                                            ├ BME688 · BMI270 · VEML7700 (I²C)
                                            ├ Qi RX (BQ51013B) → charger (BQ25120A) → LiPo
                                            └ fuel gauge MAX17048
```

Front face (40×40, polished-steel back is opposite): screen top 2/3, camera lower left, button lower right.

## 5. Bill of materials (per unit, planning estimates, USD, qty 100)

Links go to manufacturer / distributor search pages; confirm stock and exact part before ordering.

| Block | Part (class) | Link | Est. $ |
|---|---|---|---|
| MCU + Wi-Fi/BLE | ESP32-S3-MINI-1U-N8 (pre-certified) | https://www.espressif.com/en/products/modules/esp32-s3 | 4 |
| Camera | OV2640 2 MP FPC module | https://www.digikey.com/en/products/result?keywords=OV2640 | 5 |
| Display | 0.96" SSD1306 OLED 128×64 (alt 1.14" ST7789 IPS color) | https://www.digikey.com/en/products/result?keywords=SSD1306%20OLED | 3 |
| Weather | Bosch BME688 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ | 8 |
| IMU | Bosch BMI270 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ | 3 |
| Light | Vishay VEML7700 | https://www.vishay.com/en/product/84286/ | 1.5 |
| Qi receiver | TI BQ51013B | https://www.ti.com/product/BQ51013B | 3 |
| Charger/PMIC | TI BQ25120A | https://www.ti.com/product/BQ25120A | 2.5 |
| Fuel gauge | MAX17048 | https://www.analog.com/en/products/max17048.html | 1.5 |
| Rx coil | Würth WE-WPCC 760308101104 (verify; custom 15 mm coil likely) | https://www.we-online.com/en/components/products/WPCC | 3 |
| Battery | LiPo ~3.0 mm thick, 150–250 mAh, w/ PCM, UN38.3 report | https://www.digikey.com/en/products/result?keywords=lipo%203.7v%20300mah | 4 |
| Haptic | LRA 8 mm × ≤2.7 mm | https://www.digikey.com/en/products/result?keywords=LRA%20haptic%208mm | 2 |
| Button | Tactile switch 3×3 mm, sealed | https://www.digikey.com/en/products/result?keywords=tactile%20switch%203x3 | 0.3 |
| Passives, LDO, LED, FPC conns | misc | — | 3 |
| PCB + PCBA (4-layer, 0.8 mm) | PCBWay assembly, qty 100 | https://www.pcbway.com/pcb-assembly.html | 14 |
| Steel shells ×2 | 316L CNC + mirror polish | https://www.pcbway.com/cnc-machining-quote.html | 45 |
| Window disc(s) | Zirconia/sapphire (charge + camera) | https://www.pcbway.com/cnc-machining-quote.html | 8 |
| Gasket, screws, adhesive | — | — | 1.5 |
| Desk charger (Qi TX) | Off-the-shelf 5 V/1 A pad for EVT; custom for PVT | https://www.digikey.com/en/products/result?keywords=Qi%20transmitter%20module | 8 |
| Packaging + printed quick-start | — | — | 4 |
| **Total** | | | **≈ $126 / unit** |

**100-unit run: ≈ $12.6k parts + ≈ $8–15k NRE** (tooling, fixtures, test jig, FCC/UN38.3, 3 prototype rounds). Expect a 20–40% swing until quoted. Steel (≈ 35% of cost) is the dominant lever.

## 6. Roadmap

| Phase | Window | Output | Gate to next |
|---|---|---|---|
| P0 Spec | Nov 2026 | This doc, API spec, firmware spec; allow brand/CQGS hosts and re-read | S-2 approves thickness (8 mm) and charge-window decision |
| P1 Breadboard | Dec 2026 | ESP32-S3 devkit + OLED + BME688 + button talking to a staging `/api/device/*`; "Coffee time!" end-to-end | Notification latency < 3 s; Copy appears in Log tab |
| P2 EVT | Jan–Mar 2027 | 5 PCBA via PCBWay, 3D-printed shells, Qi coil tuning, camera bring-up | Charges through window at ≥ 70% efficiency; battery ≥ 3 days |
| P3 DVT | Mar–May 2027 | 20 units with real 316L shells, polish finish, firmware OTA, pre-compliance scan | Passes drop/seam/water-splash checks; FCC pre-scan clean |
| P4 PVT | May–Jul 2027 | 100-unit pilot, test jig, PDFs, UN38.3 + FCC | Yield ≥ 90% |
| P5 Ship | Q3 2027 | Pairing flow live on site, onboarding to cohorts | — |
| v2 | 2028 | 5 mm flex-PCB slab | — |

Timeline is a plan, not a commitment: the camera and charge window are the schedule drivers.

## 7. Session-compression rule (req. 8)

After every session: update `STATE.md` (≤ 1 page: decisions, open risks, next 3 actions) and push a full `SESSION-REPORT-YYYY-MM-DD-NN.md` in this folder.

## 8. Open questions for S-2

1. Accept 8 mm for v1, with 5 mm as v2?
2. Accept a visible ceramic disc on the polished face, or switch to magnetic pogo charging?
3. What is the camera for (photo to the Log? vision for the AI?) — this sets resolution and privacy design.
4. Wi-Fi only (needs known network setup) or BLE-to-phone relay? Recommend Wi-Fi + BLE provisioning.
5. Brand claim: "Designed in USA" instead of "Made in USA" for PCBWay-built units?

## 9. Brand note

Per the repo style guide: minimalist, regular weight, no decorative color, no emojis, periods over symbols ("Done."). Screen UI follows that: white on black, one line of text, one period.

## 10. Document set (req. 11)

- `LOT-PAGER-HW-PLAN-v0.1.md` — this file
- `LOT-DEVICE-API-v0.1.md` — LOT API connector
- `LOT-FIRMWARE-SPEC-v0.1.md` — firmware + host software
- `BOM-v0.1.csv` — machine-readable BOM
- `STATE.md` — one-page compressed state
- `SESSION-REPORT-2026-11-05-01.md` — this session
