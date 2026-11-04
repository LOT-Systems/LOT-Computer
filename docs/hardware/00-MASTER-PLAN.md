# LOT Pager — Master Plan (Hardware v0 "LOT-P1")

**Owner:** Vadik Marmeladov (S-2, Inventor, COSMO® CIA) · **Status:** PLAN · **Date:** 2026-11-04 · **Doc set:** `docs/hardware/`

## 1. One-line product
A 40 × 40 mm stainless-steel pocket device ("LOT Pager") that receives autonomous, AI-written notifications from lot-systems.com ("Coffee time!"), shows them on a small screen, senses local weather/air, sees through a camera, and sends a **COPY** button press back to the site's **Log** tab.

## 2. Requirement trace (your 19 points → where handled)
| # | Requirement | Decision | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB + PCBA + CNC stainless all quoted at PCBWay (single vendor for the 100 run) | 07 |
| 2 | Pager-like notification from AI site | Server writes `device_notification` rows; device polls/long-polls and buzzes + shows text | 05 |
| 3 | 2-part stainless body | 316L top shell + bottom shell, laser-welded or M1.2 screws + gasket | 03 |
| 4 | Flat silver square 4×4 cm × 5 mm | **Not achievable in full spec at 5 mm** (see §4). v0 = 40×40×9, v1 ≤ 7, 5 mm = stretch | 03 |
| 5 | Camera | 2 MP DVP camera on ESP32-S3, stills only (QVGA/UXGA on demand) | 01, 04 |
| 6 | LOT API connector | Device token + `/api/device/*` endpoints (proposed, not yet built) | 05 |
| 7 | PDF manuals | Every doc here is rendered to `pdf/` | all |
| 8 | Compress info per session | `08-SESSION-DIGEST.md`, ≤1 page, rewritten each session | 08 |
| 9 | Firmware documents | Architecture, power states, OTA, boot flow | 04 |
| 10 | Software to connect with firmware | `lot-link` CLI/web-serial tool: flash, pair, test | 06 |
| 11 | Separate documents | 8 standalone files, no cross-dependency to read one | — |
| 12 | Charger | Qi desk pad (off-the-shelf v0, custom TX v1) | 01, 03 |
| 13 | 100 units | Pilot run plan, cost, yield, test | 07 |
| 14 | Weather sensor | Bosch BME688 (T/RH/P/gas) | 01 |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC AI gas classes), LSM6DSOX (on-chip ML core), VEML7700 light | 01 |
| 16 | Button "Copy" → Log tab | `POST /api/device/event {type:"copy"}` → `Log` event `device_copy` | 05 |
| 17 | Polished stainless side | Back shell, mirror (Ra < 0.05 µm) | 03 |
| 18 | Other side: camera + screen + button | Front shell with glass window, camera hole, button | 03 |
| 19 | Wireless charger | Qi RX coil + ferrite behind a **non-metal** window | 03 |

## 3. Two hard physics problems (decide before ordering anything)
1. **Stainless blocks Qi charging and Wi-Fi/BLE.** A fully metal sealed case = no wireless anything. Fix: (a) the seam between the two steel halves is a 0.8 mm PEEK/epoxy band that doubles as the antenna slot; (b) the Qi coil sits behind the glass/ceramic face, not behind steel. The device charges **face-down** on the pad.
2. **5 mm height.** Stack-up in `03-MECHANICAL.md` totals ≈ 8.7 mm for a rechargeable device with a real camera. 5 mm only works with a ≤1.2 mm battery (≈ 15 mAh = days→hours of life) and a wafer camera. Treat 5 mm as v2 research.

## 4. Architecture
```
 lot-systems.com (AI notif. generator, Log tab)
        │  HTTPS/JSON, device token
        ▼
 /api/device/*  ──►  Log (event: device_copy, device_ack, device_status)
        ▲
        │ Wi-Fi 2.4 GHz (poll 30–60 s, light-sleep between)
   ┌────┴─────────────────────────┐
   │ ESP32-S3 (8 MB PSRAM, 16 MB) │── 1.14" IPS 240×135 (SPI)
   │                              │── DVP camera (2 MP)
   │                              │── BME688 + LSM6DSOX + VEML7700 (I²C)
   │                              │── COPY button (GPIO, wake source)
   │                              │── haptic motor / piezo (the "pager" buzz)
   └── PMIC + Qi RX + LiPo ───────┘
```

## 5. Decisions needing the Inventor (blocking)
1. Accept 40×40×9 mm for v0? (Y/N)
2. Camera privacy: physical shutter/LED, or software-only? (Recommend LED + stills only.)
3. What does COPY copy? Recommend: the currently shown notification text → logged to the Log tab with timestamp.
4. Which LOT account owns a device — one device per user, token pairing from Profile page?
5. Budget cap for the 100 run (est. ≈ $16.5–23.5k excl. NRE/cert, ≈ $23–36k all-in, see 07).

## 6. Caveats on this document set
- vendor sites and lot-systems.com were **unreachable** from the build sandbox; part links are manufacturer/distributor search URLs and **prices are estimates — verify before ordering**.
- brand.lot-systems.com / institute CQGS pages were not readable; brand tokens were taken from `tailwind.config.js` (blue `#43aff3`, yellow `#fef17b`, black `#333`/`#050505`). Re-check against the brand guide.
