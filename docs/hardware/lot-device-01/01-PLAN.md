# LOT DEVICE-01 · "SQUARE" — Product Plan

**Doc:** HW-01-PLAN · **Rev:** A (EVT planning) · **Date:** 2026-11-28
**Owner:** S-2 // Vadik Marmeladov — Inventor, COSMO® CIA
**Status:** Plan. No hardware ordered yet. Every part number and price here must be checked against a current datasheet and quote before ordering.

---

## 1. What it is

A flat silver square, 40 × 40 mm and 5 mm thick, that works like a pager for LOT.

- **Polished side:** solid mirror-polished stainless steel. Nothing on it.
- **Working side:** a small monochrome screen, a camera and one button, all under one glass window set into a stainless bezel.
- **What it does:** shows short notifications that LOT's AI sends on its own ("Coffee time!", "Rain at 16:00. Take the umbrella."). It vibrates once when one arrives.
- **The button ("Copy"):** a short press copies the notification on screen back to the user's **Log** tab on lot-systems.com. The Log entry is stamped with the device's own temperature, humidity, pressure and air-quality readings.
- **Charging:** wireless, by placing the working side down on the LOT charging puck. No connector, so the case stays sealed.

## 2. Requirements trace (brief items 1–19)

| # | Brief item | Where it is handled | Status |
|---|---|---|---|
| 1 | PCBWay | 04-PCB-PCBWAY.md: PCB fab, assembly and CNC body all quoted at PCBWay | Planned |
| 2 | Pager-like notification from the AI site | 06-SOFTWARE-CONNECTOR.md §3, 05-FIRMWARE.md §4 | Spec written |
| 3 | 2-part stainless steel body | 03-MECHANICAL.md §2 | Spec written |
| 4 | Flat silver square, 40 × 40 × 5 mm | 03-MECHANICAL.md §3: stack-up shows 4.8 mm is possible but tight | **Risk: high** |
| 5 | Camera | 02-BOM.md, 05-FIRMWARE.md §6 (long press = photo to Log) | Planned |
| 6 | LOT API connector | 06-SOFTWARE-CONNECTOR.md: `/api/device/*` routes, device pairing | Spec written |
| 7 | PDF manuals | `pdf/`: one PDF per document | Done this session |
| 8 | Compress the information in each session | Device: 05-FIRMWARE.md §7. Docs: compressed ledger in 00-README.md | Done / spec |
| 9 | Firmware documents | 05-FIRMWARE.md | Spec written |
| 10 | Software to connect with firmware | 06-SOFTWARE-CONNECTOR.md plus `software/device-sim.mjs` (working simulator) | Spec + sim |
| 11 | Separate documents | Files 01–09, each with its own PDF | Done |
| 12 | Charger | 07-CHARGER.md | Spec written |
| 13 | 100-unit run | 02-BOM.md §3 (cost at 100), 08-ROADMAP.md | Costed (estimate) |
| 14 | Weather sensor | Bosch BME688 (temperature, humidity, pressure, gas) | Planned |
| 15 | AI-grade off-the-shelf sensors | BME688 (Bosch BME AI-Studio), Himax HM0360 (low-power AI vision) | Planned |
| 16 | "Copy" button with a signal back to the Log tab | 06-SOFTWARE-CONNECTOR.md §4: `device_copy` Log event | Spec written |
| 17 | One side polished stainless steel | Part A (back shell), mirror #8 finish | Planned |
| 18 | Other side: camera, screen, button | Part B (front bezel and glass) | Planned |
| 19 | Wireless charger | Qi-compatible receiver **through the front glass** (see §4, finding F-1) | **Design change needed** |

## 3. System architecture

```
 lot-systems.com (Fastify + Postgres)                    LOT DEVICE-01
 ┌───────────────────────────────┐   HTTPS (Wi-Fi)  ┌──────────────────────────────┐
 │ AI notification composer      │ ───────────────▶ │ ESP32-S3 (Wi-Fi/BLE)          │
 │  (memory engine + weather +   │  GET /notifs     │  ├ Sharp Memory LCD 1.26"     │
 │   time + user patterns)       │                  │  ├ Himax HM0360 camera        │
 │ /api/device/* connector       │ ◀─────────────── │  ├ Bosch BME688 weather/air   │
 │ Log tab  ← device_copy event  │  POST /copy      │  ├ Copy button + haptic       │
 └───────────────────────────────┘  POST /telemetry │  ├ BQ51050B Qi RX + charger   │
                                                    │  └ 100–120 mAh LiPo           │
                                                    └──────────────────────────────┘
```

**Choices and why:**

- **SoC: ESP32-S3FH4R2.** It has Wi-Fi and BLE, a camera interface, native USB for the factory jig, and 4 MB flash plus 2 MB PSRAM inside the chip. That leaves fewer parts and less height on the board.
- **Screen: Sharp Memory LCD.** It is reflective, monochrome and silvery, which fits the LOT style of no decorative colour. It holds an image while using microwatts, so the last notification stays visible without draining the battery. That matters on a ~110 mAh cell.
- **Weather and air sensor: BME688.** It covers temperature, humidity, pressure and gas (VOC/IAQ). It is Bosch's AI-trainable gas sensor, which fits item 15. It also puts real micro-climate data into each Log entry, which the Log `context` already models (`temperature`, `humidity`).
- **Camera: Himax HM0360.** It is an ultra-low-power VGA sensor made for always-on AI vision. The fallback is an OV2640 module if a thin enough HM0360 module cannot be sourced.

## 4. Critical findings (read before ordering)

**F-1. Stainless steel blocks wireless charging and Wi-Fi.** A metal back stops a Qi coil from charging, because the steel absorbs the field and heats up. A sealed steel box also blocks the 2.4 GHz antenna.
→ **Fix:** the front Part B is a thin steel bezel (≈2.5 mm wide) holding a single glass window of ≈35 × 35 mm. The Qi coil, the chip antenna and the screen all sit under that glass. The device charges **face-down** on the puck. The polished back stays solid steel, as the brief asks.

**F-2. 5.0 mm is achievable only with a chip-down board.** The pre-certified ESP32-S3-MINI-1 module is 2.4 mm tall, which pushes the total to about 6.0 mm. A chip-down ESP32-S3 makes 4.8 mm possible, but then the device needs its own FCC/CE radio certification: roughly USD 10–25k and 6–10 weeks, from a test-lab quote.
→ **Decision gate G-1 (08-ROADMAP.md):** build EVT in both versions, then choose.

**F-3. A 100-unit run is below many vendors' minimum orders.** Custom thin LiPo cells usually have a minimum of 500–1000. Sharp Memory LCDs and HM0360 modules may need a distributor rather than the factory.
→ Use an off-the-shelf 2.0–2.5 mm cell for EVT, and get a custom-cell quote in parallel.

**F-4. The BME688 needs open air.** It needs a vent to the outside: a 0.6 mm hole in the bezel edge with a waterproof ePTFE membrane. Heat from the ESP32 will push temperature readings up, so firmware applies an offset based on the duty cycle (05-FIRMWARE.md §5).

**F-5. The LOT server has no device or push system yet.** The `/api/device/*` routes, a `devices` table, and the new Log events (`device_copy`, `device_photo`, `device_weather`) still have to be built. The current Log tab only shows events listed in `src/server/routes/api.ts:1084` (`displayableEvents`). `device_copy` must be added there or it will not appear.

## 5. Interaction model

| Input | Action | Site effect |
|---|---|---|
| Notification arrives | One haptic pulse; screen shows the text and the time | — |
| Short press (<0.6 s) | "Copied." on screen for 2 s | `device_copy` Log entry with the text and sensor context |
| Long press (≥1.5 s) | Countdown 3-2-1, then one photo | `device_photo` Log entry with the JPEG (≤80 KB) |
| Double press | Dismiss; show the clock and the weather | `notification_dismiss` (analytics only, not shown in Log) |
| Placed face-down on the puck | Charge icon; sync and OTA check | — |

## 6. Success criteria for the 100-unit run

1. A notification reaches the screen within 60 s on average (polling) or within 5 s (MQTT, v1.1).
2. A Copy press shows up on the Log tab within 10 s.
3. The battery lasts at least 5 days at 20 notifications a day.
4. The body is 40.0 ± 0.1 mm square and ≤ 5.2 mm thick (the gate allows 6.0 mm for the module version).
5. The polished back has no visible tool marks at arm's length.
6. At least 97 of the 100 units pass the factory test on the first try.
