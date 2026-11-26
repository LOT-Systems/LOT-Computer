<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 01 · PLAN AND ROADMAP

```
DOCUMENT   HW-01 / PLAN + ROADMAP
DEVICE     LOT PAGER · codename TILE-40
ISSUE      2026-11-26 · rev 0.1 (session 1)
CLASS      INTERNAL / BUILD
OWNER      S-2 // Vadik Marmeladov, Inventor · COSMO® CIA
```

## 00 · WHAT IT IS

A flat silver square, 40 × 40 × 5 mm. Two parts of 316L stainless steel.

- **Back side:** mirror-polished stainless. Nothing else is on it.
- **Front side:** a reflective memory-LCD screen, a camera, and one button.

The tile shows short autonomous lines from lot-systems.com, such as "Coffee time!" or
"It's 14C. How are you now?". It works like a pager: it buzzes once and the line stays
on the screen.

The single button is **Copy**. Pressing it sends the line on the screen back to the
user's **Log** tab, together with the weather the device measured at that moment.

The tile charges wirelessly on a matching LOT puck.

```
          FRONT (frame, bead-blast)               BACK (mirror #8)
   ┌──────────────────────────────┐       ┌──────────────────────────────┐
   │ ┌────────────────────┐   ◉   │       │                              │
   │ │                    │  cam  │       │                              │
   │ │   MEMORY LCD       │       │       │          ( ceramic )         │
   │ │   128 × 128        │       │       │          (  inlay  )  Ø18    │
   │ │   "Coffee time!"   │       │       │                              │
   │ └────────────────────┘  [■]  │       │                              │
   │                         COPY │       │                       LOT    │
   └──────────────────────────────┘       └──────────────────────────────┘
               40 mm                                 40 mm   ·  5.0 mm Z
```

## 01 · REQUIREMENT TRACE (the 19 inputs → where they are answered)

| #  | Input                                        | Answered in                       | Status |
|----|----------------------------------------------|-----------------------------------|--------|
| 1  | PCBWay                                       | 04-PCB-PCBWAY, 08-PRODUCTION      | PLANNED |
| 2  | Pager-like notification from AI site         | 05-FIRMWARE, 06-CONNECTOR         | CODED (EVT-0) |
| 3  | Two-part stainless steel body                | 03-MECHANICAL                     | SPEC'D |
| 4  | Flat silver square 40 × 40 × 5 mm            | 03-MECHANICAL §Z-stack            | AT RISK, see R-01 |
| 5  | Camera                                       | 02-BOM, 05-FIRMWARE               | SPEC'D, firmware stub |
| 6  | LOT API connector                            | 06-CONNECTOR + `hardware/lot-pager/` | CODED (EVT-0) |
| 7  | Results as PDF manuals                       | `pdf/` (all docs)                 | DONE |
| 8  | Compress the information in each session     | 00-STATE-CAPSULE + `lot::compress()` | DONE |
| 9  | Firmware documents                           | 05-FIRMWARE                       | DONE |
| 10 | Software that connects to the firmware       | 06-CONNECTOR, `connector/lot-pager.mjs` | CODED |
| 11 | Separate documents                           | 01–08, each its own file and PDF  | DONE |
| 12 | Charger                                      | 02-BOM §Charger, 03 §Puck         | SPEC'D |
| 13 | 100-unit run                                 | 08-PRODUCTION                     | PLANNED |
| 14 | Weather sensor                               | BME688, see 02 and 05             | CODED (EVT-0) |
| 15 | AI-grade off-the-shelf sensors               | BME688 (BSEC2 AI), BHI260AP, camera | SPEC'D |
| 16 | Copy button → Log tab on lot-systems.com     | `POST /api/logs`, see 06          | CODED (EVT-0) |
| 17 | One side polished stainless steel            | 03 §Back plate                    | SPEC'D |
| 18 | Other side: camera, screen, button           | 03 §Front frame                   | SPEC'D |
| 19 | Wireless charger                             | 03 §Qi window, 02 §Charger        | AT RISK, see R-02 |

## 02 · ARCHITECTURE

```
 lot-systems.com (Fastify + Postgres)                  TILE-40
 ┌────────────────────────────────────┐   HTTPS   ┌──────────────────────────────┐
 │ /api/contextual-prompts  (AI/QIE)  │◀──────────│ ESP32-S3 (Wi-Fi/BLE)         │
 │ /api/live-message        (global)  │◀──────────│  ├─ Memory LCD 128×128 (SPI) │
 │ /api/logs  POST  ← COPY            │◀──────────│  ├─ BME688 weather+gas (I2C) │
 │ /api/sync  SSE   (instant mode)    │◀ ─ ─ ─ ─ ─│  ├─ BHI260AP AI IMU (I2C)    │
 │ /api/device/*    (EVT-1, new)      │◀ ─ ─ ─ ─ ─│  ├─ Camera (DVP)             │
 └────────────────────────────────────┘           │  ├─ Metal-dome key = COPY    │
                                                  │  ├─ ERM/piezo = pager buzz   │
   LOT puck (Qi TX, 5 V USB-C) ──── 2–3 W ───────▶│  └─ BQ51050B Qi RX+charger   │
                                                  │      → LiPo 85 mAh           │
                                                  └──────────────────────────────┘
```

**EVT-0 needs no server change.** The firmware uses routes that already exist:
`/api/contextual-prompts`, `/api/live-message` and `POST /api/logs`, and it
authenticates with the same `auth_token` cookie the web app uses.

EVT-1 adds a scoped device-token API. The proposal is in 06.

## 03 · ROADMAP

| Phase | Name | Window (2026–27) | Exit gate | Budget (est.) |
|-------|------|------------------|-----------|---------------|
| P0 | CONCEPT LOCK | W48 · Nov 26 | Docs 01–08, firmware v0.1, connector v0.1 | $0 · **DONE** |
| P1 | EVT-0 BENCH | W49–W51 | The dev-kit tile shows a prompt, and Copy reaches the Log | ~$150 |
| P2 | EVT-1 REV-A | Jan–Feb | 5 PCBA (PCBWay) and 3 CNC sets fit at ≤ 6.0 mm | ~$3–5k |
| P3 | DVT | Mar–Apr | 20 units, Qi puck, OTA, pairing API, FCC pre-scan, 2-week battery soak | ~$6–10k |
| P4 | PVT / RUN-100 | May–Jun | 100 units, EOL test on 100 %, manuals in the box | ~$17–25k |
| P5 | FIELD | Jul → | R&D-tier users, telemetry through the Log | — |

### P1 · EVT-0 BENCH, the next session's work
1. Order the dev kit (02-BOM §A). Total is about $150.
2. Flash `hardware/lot-pager/firmware` and fill in `config.h` with `connector/lot-pager.mjs provision`.
3. Pass criteria:
   - The screen shows a prompt.
   - A short press makes a `note` entry with `metadata.source = lot-pager` in the Log tab within 5 s.
   - Deep-sleep current is ≤ 50 µA on the bench.
4. Measure: Wi-Fi wake energy (mAh per sync), and BME688 self-heating offset inside a closed steel mock-up.

### P2 · EVT-1 REV-A
- Schematic and layout for the 4-layer, 0.6 mm HDI board, designed in KiCad 8.
- Order from PCBWay: 5 boards, turnkey PCBA.
- CNC 3 sets of the 316L enclosure: front frame + back plate.
- Order cover-glass samples and ceramic inlay samples.
- Gate: Z-stack measured ≤ 6.0 mm, and Wi-Fi RSSI inside the closed can within 10 dB of open air.

### P3 · DVT
- 20 units.
- Server: `POST /api/device/pair`, `GET /api/device/notice`, `POST /api/device/copy`, `POST /api/device/snap`.
- Firmware: OTA updates (esp_https_ota), BSEC2 IAQ, camera → AI caption.
- A puck made from a pre-certified Qi TX module.
- FCC Part 15B pre-scan.

### P4 · RUN-100
- See 08-PRODUCTION for lot-sizing, end-of-line (EOL) test, packaging and serialisation.

## 04 · RISK REGISTER (analysis)

| ID   | Risk                                                                 | Sev | Mitigation                                                                   |
|------|----------------------------------------------------------------------|-----|------------------------------------------------------------------------------|
| R-01 | **5.0 mm is at the physical limit.** The Z-stack in 03 adds up to 5.10 mm with zero tolerance. | HIGH | Target 5.0 mm as a stretch goal and accept 5.5–6.0 mm for EVT-1. Use a 2.0 mm cell and put the camera and module beside the cell, never stacked. |
| R-02 | **Qi cannot pass through solid steel.** Eddy currents heat the back and trip the charger's foreign-object detection. | HIGH | Use a Ø18 mm mirror-polished zirconia inlay in the back as an RF/Qi window (option A), with a matched LOT puck. Fallback (option B): magnetic 2-pin pogo charging on the edge. See 03 §D-01. |
| R-02b| **Wi-Fi/BLE is shielded by the steel can.**                           | HIGH | The antenna sits under the front glass at the top edge, with ≥ 3 mm keep-out from metal. The ceramic inlay adds a second aperture. |
| R-03 | Chip-down ESP32 needs full FCC intentional-radiator certification ($10–20k). | MED | Use the pre-certified **ESP32-S3-MINI-1** module for 100 units. Chip-down is only worth it at 1k+ units. |
| R-04 | An 85 mAh cell runs Wi-Fi polling for about 8–16 days. Instant SSE mode lasts about 2–3 days. | MED | Make pager mode (15–30 min poll) the default. Instant mode is used only on the puck. |
| R-05 | BME688 reads 2–6 °C high when sealed in the can.                      | MED | Add an ePTFE vent membrane, keep the sensor away from the LDO and battery, and calibrate a per-unit offset at EOL. |
| R-06 | The EVT-0 auth uses the full-account JWT, with a 30-day expiry.       | MED | Use test accounts only. EVT-1 adds scoped device tokens (06 §EVT-1 API). |
| R-07 | Camera privacy.                                                       | MED | A hardware indicator is required: a screen inverse frame plus an LED in the glass mask. Images never stay on the device, and each upload is written to the Log. |
| R-08 | CNC mirror polish on 316L is labour-heavy, with a 10–20 % reject rate. | LOW | Order 115 back plates to get 100. Do the PVD-free finish in-house or through PCBWay CNC + a polishing vendor. |
| R-09 | Battery shipping (UN38.3, IATA PI967).                                | LOW | Buy cells that come with a UN38.3 report, and ship by ground or as cells contained in equipment. |

## 05 · LIMITS OF THIS SESSION

- The brand.lot-systems.com, lot-systems.com/about and institute.lot-systems.com/cqgs.html
  pages could not be reached from the build sandbox because those domains are outside the
  session network allowlist. The brand language was taken from the in-repo
  `docs/technical/LOT-STYLE-GUIDE.md` instead: monochrome, no emoji, and "Done." in place of symbols.
- Supplier links were not checked live. Every link is a distributor search by part number,
  so it stays valid even when product pages move.
- The firmware was written but **not compiled**, because no PlatformIO toolchain or network
  was available. Compiling it is the first task of P1.
