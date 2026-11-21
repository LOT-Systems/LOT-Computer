<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · Plan & System Architecture

**Document:** LD-01-DOC-01 · Rev A · 2026-11-21
**Status:** Planning (Phase 0). Nothing ordered and no units built.
**Owner:** S-2 // Vadik Marmeladov, Inventor, COSMO® CIA

---

## 1. Product in one sentence

LD-01 is a flat, silver, 40 × 40 × 5 mm stainless-steel tile that works like a pager for
lot-systems.com. It shows short notifications the LOT AI writes on its own (for example,
"Coffee time."). Its one button, **Copy**, writes the current moment back into the user's
**Log** tab.

## 2. Requirement trace

Every numbered item in the brief maps to a design decision and the document that covers it.

| # | Requirement | Decision | Doc |
|---|-------------|----------|-----|
| 1 | PCBWay | PCB fab + turnkey PCBA + CNC 316L + finishing are all ordered from PCBWay | 06 |
| 2 | Pager-like notification from AI site | LOT server queues device notifications. The device fetches them over Wi-Fi with HTTPS long-poll and gives a haptic tick | 04, 05 |
| 3 | 2-part stainless body | Part A: polished 316L back shell (cup). Part B: brushed 316L front bezel ring that holds a glass window | 03 |
| 4 | Flat silver square 40 × 40 × 5 mm | 40.0 × 40.0 mm outline. **5.0 mm is a stretch target, 6.0 mm is the EVT target** (see §6) | 03 |
| 5 | Camera | Himax HM0360 low-power VGA AI sensor (Proto-A uses OV2640) | 02 |
| 6 | LOT API connector | New `/api/device/v1/*` namespace, device-token auth, pairing code | 05 |
| 7 | PDF manuals | Every doc is rendered to `docs/hardware/pdf/*.pdf` | pdf/ |
| 8 | Compress info each session | Device: sensor batches are delta-encoded and packed as CBOR before upload. Docs: each session ends with a **Session Capsule** | 04, SR |
| 9 | Firmware documents | Firmware architecture, state machine, power budget, OTA | 04 |
| 10 | Software that talks to firmware | Server route spec + reference implementation; firmware skeleton in `hardware/firmware/lot-ld01` | 05 |
| 11 | Separate documents | One file per discipline (01–08) | README |
| 12 | Charger | Qi receiver + Li-ion charger in one IC (TI BQ51050B). Retail kit includes a Qi pad | 02 |
| 13 | 100-unit run | PCBWay turnkey, panelized, 110 built (10 % yield buffer) | 06 |
| 14 | Weather sensor | Bosch BME688 (temperature, humidity, pressure, gas/IAQ) | 02 |
| 15 | AI-grade off-the-shelf sensors | BME688 + BSEC AI-Studio, Bosch BHI260AP self-learning IMU, Himax HM0360 | 02 |
| 16 | Copy button → Log tab | Short press sends `POST /api/device/v1/copy`, which creates a Log entry `event: "device_copy"` | 05 |
| 17 | One side polished steel | Back shell is mirror-polished (#8, Ra ≤ 0.05 µm) | 03 |
| 18 | Other side: camera + screen + button | Front: glass window over a 1.28" memory LCD, a camera aperture, and a steel button cap | 03 |
| 19 | Wireless charger | Qi 5 W receive coil behind the front glass (**not** behind the steel, see §5) | 03 |

## 3. Block diagram

```
                    ┌──────────────────────── LD-01 ────────────────────────┐
 Qi pad ~~~~~~~~~~► │ Rx coil ─► BQ51050B (Qi Rx + Li-ion charger) ─► LiPo   │
                    │                                   │   (~100 mAh)       │
                    │                                   ▼                    │
                    │                   TPS62840 buck 1.8 V / LDO 3.3 V      │
                    │                                   │                    │
                    │   ┌───────────────────────────────┴────────────────┐   │
                    │   │  ESP32-S3-MINI-1-N4R2  (Wi-Fi 4 + BLE 5, AI    │   │
                    │   │  vector ext., 4 MB flash, 2 MB PSRAM)          │   │
                    │   └──┬─────┬──────┬───────┬───────┬───────┬────────┘   │
                    │   SPI│  DVP│   I²C│    I²C│   GPIO│    I²C│            │
                    │      ▼     ▼      ▼       ▼       ▼       ▼            │
                    │  Sharp   HM0360  BME688  BHI260AP  Copy   DRV2605L     │
                    │  memory  camera  weather IMU       button ─► LRA       │
                    │  LCD                              (steel   haptic      │
                    │  1.28"                             cap)                │
                    └────────────────────────────────────────────────────────┘
                                         │ Wi-Fi (HTTPS, TLS 1.2)
                                         ▼
                          lot-systems.com  /api/device/v1/*
                          ├─ inbox   (AI notifications: "Coffee time.")
                          ├─ copy    (→ Log tab, event device_copy)
                          ├─ telemetry (weather batches, CBOR)
                          └─ capture (camera frame → AI caption → Log)
```

## 4. User interaction model

| Input | Action | Result on site |
|-------|--------|----------------|
| Notification arrives | One haptic tick. Text appears on the memory LCD and stays with no backlight and no power draw | Notification marked `delivered` |
| **Copy**, short press | Copies the notification on screen into the Log tab | Log entry: `"Coffee time." · copied from LD-01 · 21.3 °C · 41 % RH` |
| **Copy**, long press (≥ 1.5 s) | Takes one camera frame. The server writes an AI caption | Log entry with caption text. The image is stored only if the user has opted in |
| Double tap on the case (IMU) | Shows the next queued notification | — |
| Lift the device (IMU) | Wakes it and refreshes the weather line | — |
| Place on Qi pad | Charges. The screen shows the battery level | — |

The UI follows the LOT style guide. It uses periods instead of symbols ("Copied." not "Copied ✓"),
no emoji, monochrome only, and system-style type.

## 5. Two physics constraints that shape the design

1. **RF and inductive power cannot pass through a closed stainless box.**
   Steel shields the 2.4 GHz Wi-Fi/BLE signal and absorbs a Qi field (the eddy currents heat the
   shell). So the **front window is the RF and power aperture**. The antenna keep-out and the Qi
   coil both sit behind the glass, not behind the polished back. The device charges face-down on
   a soft-top Qi pad. The retail kit pad has a microfiber top.
   *Alternative (Rev B option):* a short pogo-pin magnetic dock on one edge. This is not wireless.
   Keep it as a fallback if Qi through the glass fails thermal test T-04.
2. **5.0 mm total height is at the limit of what can be built.** See the Z-stack in doc 03. EVT targets
   6.0 mm. DVT tries 5.0 mm with a flex PCB and a 1.6 mm cell.

## 6. Key risks (top 5)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|------------|
| R1 | Z-stack > 5 mm | High | Medium | EVT at 6 mm. Flex-rigid PCB. Custom 1.6 mm cell. Camera beside the display, not stacked |
| R2 | Qi coupling through glass + display stack | Medium | High | Ferrite shield, 0.55 mm glass, thermal test T-04. Pogo-dock fallback |
| R3 | Battery life too short (~100 mAh) | Medium | High | Memory LCD (µW), Wi-Fi only on wake windows, 15 min default poll. Target ≥ 3 days |
| R4 | FCC / CE for 100 units | Medium | High | Use the **pre-certified** ESP32-S3-MINI-1 module (modular grant). Part 15B scan only |
| R5 | Mirror polish yield on 316L | Medium | Medium | Order 20 % spare back shells. Laser-etch logo after polishing |

## 7. Document map

See `README.md` in this folder.
