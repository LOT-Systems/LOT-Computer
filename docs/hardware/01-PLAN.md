<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager (LOT-HW-01) — Product Plan

**Document:** LOT-HW-01 / PLAN · **Rev:** A (2026-11-13) · **Owner:** Vadik, Inventor — COSMO® CIA
**Status:** Concept → EVT planning

## 1. One-line definition

A 40 × 40 × 5 mm stainless-steel square that sits on a desk or in a pocket. It receives short,
autonomous notices from lot-systems.com ("Coffee time!"), shows them on a small silver screen,
and has one button — **Copy** — which sends the current notice (and optionally a photo and the
local weather reading) back to the user's **Log** tab on lot-systems.com.

## 2. Requirements trace (from the brief)

| # | Brief item | How the plan meets it | Doc |
|---|------------|----------------------|-----|
| 1 | PCBWay | PCB fab, PCBA (100 units), CNC 316L steel and mirror polish all quoted at PCBWay as one vendor | 08 |
| 2 | Pager-like notification from AI site | Server pushes AI notices to a device inbox; device wakes, buzzes (LRA), shows text | 05, 04 |
| 3 | 2-part stainless body | Part A: polished back shell. Part B: front frame with glass window. Joined by 4 × M1.2 screws or press-fit + adhesive | 03 |
| 4 | Flat silver square 40 × 40 × 5 mm | Target envelope. 5.0 mm is a stretch goal; EVT built at 6.0 mm (see §6) | 03 |
| 5 | Camera | Low-power AI-vision camera (Himax HM0360 class) behind the front glass | 02 |
| 6 | LOT API connector | New `/api/device/*` routes with per-device token; spec in doc 05 | 05 |
| 7 | PDF manuals | Every doc in this folder builds to PDF via `scripts/hardware/build-manuals.sh` | pdf/ |
| 8 | Compress info each session | Device side: CBOR + deflate batched payloads. Docs side: each session report ends with a compressed state block | 04, sessions/ |
| 9 | Firmware documents | Firmware spec | 04 |
| 10 | Software to connect with firmware | Companion provisioning tool (Web Serial + BLE) + server routes | 06, 05 |
| 11 | Separate documents | This folder: one file per discipline | 00 |
| 12 | Charger | Qi receiver on device + off-the-shelf Qi pad in box | 02, 03 |
| 13 | 100-unit run | Manufacturing plan, test jig, QA, costing for 100 | 08 |
| 14 | Weather sensor | Bosch BME688 (T / RH / pressure / gas, AI-trainable) behind a vent membrane | 02 |
| 15 | AI-grade off-the-shelf sensors | BME688 (BME AI-Studio), BHI260AP self-learning IMU, HM0360 AI camera | 02 |
| 16 | Copy button → Log tab | Button press → `POST /api/device/copy` → Log entry, event `device_copy` | 05 |
| 17 | One side polished steel | Part A back shell, #8 mirror polish | 03 |
| 18 | Other side: camera, screen, button | Front face: glass window over memory LCD + camera; steel key with snap dome | 03 |
| 19 | Wireless charger | Qi (BPP 5 W) receiver, TI BQ51050B; coil behind the **front glass** | 02, 03 |

## 3. System architecture

```
 lot-systems.com (Fastify + Postgres)                 LOT Pager
 ┌──────────────────────────────────┐   HTTPS/TLS   ┌──────────────────────────────┐
 │ contextual-prompts / AI engine   │──── inbox ───▶│ ESP32-S3  ── memory LCD      │
 │ /api/device/inbox  (poll, ETag)  │               │   │  ├─ LRA haptic (pager buzz)│
 │ /api/device/copy   ──▶ Log tab   │◀── copy ──────│   │  ├─ Copy button (snap dome)│
 │ /api/device/telemetry ─▶ weather │◀── env ───────│   │  ├─ HM0360 camera          │
 │ /api/device/pair                 │               │   │  ├─ BME688 weather/gas     │
 └──────────────────────────────────┘               │   │  ├─ BHI260AP motion/AI     │
                                                    │   │  └─ ATECC608B identity     │
 Companion tool (browser, Web Serial/BLE)           │  Qi RX (BQ51050B) → LiPo     │
   pairs device ↔ user account, sets Wi-Fi           └──────────────────────────────┘
```

**Connectivity choice:** Wi-Fi direct to lot-systems.com (no phone app needed — matches the
"pager" idea). BLE is used only for first-time setup. Device polls the inbox on a schedule
(default every 10 min, plus on button press and on motion wake). True push (persistent socket)
is a later option; polling keeps battery life predictable.

## 4. Interaction model

| Action | Result |
|--------|--------|
| New notice arrives | 2 short buzzes, text on screen, LED-less (screen only) |
| Short press **Copy** | Current notice + weather snapshot copied to Log tab. Screen shows `COPIED ✓` |
| Long press (1.5 s) | Take photo → attached to Log entry |
| Double press | Show local weather (BME688) |
| Pick up (motion wake) | Screen shows last notice + time |
| Placed on charger | Screen shows battery %, syncs, then sleeps |

## 5. Key engineering risks (summary — full list in doc 07)

1. **Steel blocks RF and Qi.** A full stainless shell is a Faraday cage and heats in a Qi field.
   The Wi-Fi/BLE antenna and the Qi coil must both sit behind the non-metal front glass.
   So the device charges **face-down** (glass side on the pad) — or the back gets a ceramic
   insert. Decision needed (doc 07, D-1).
2. **5 mm thickness.** Z-stack totals ~5.9 mm with a 1.5 mm battery (~80 mAh). 5.0 mm needs a
   custom 1.0 mm cell and a ≤ 2.2 mm camera. EVT at 6.0 mm, DVT tries 5.0.
3. **Radio certification.** Selling 100 units needs FCC/CE. A pre-certified module saves
   US$10–20 k of testing but is thicker. See doc 07, D-3.
4. **Weather sensor in a sealed steel box** reads the device, not the room. Needs a vent with
   ePTFE membrane and firmware self-heat compensation.

## 6. Feasibility verdict

Buildable with off-the-shelf parts. The look (silver square, one button, one screen) is
achievable. The **5 mm** spec and **wireless charging through steel** are the two items that
need a design decision before PCB layout starts. Neither blocks EVT.

## 7. Estimated cost (100 units)

| Bucket | Per unit | ×100 |
|--------|---------:|-----:|
| Electronics BOM | ~$72 | ~$7,200 |
| PCB + PCBA (PCBWay, 4-layer HDI 0.6 mm) | ~$18 | ~$1,800 + ~$350 setup |
| Stainless enclosure, 2 parts, CNC + mirror polish | ~$38 | ~$3,800 |
| Cover glass (printed, AR) | ~$6 | ~$600 |
| Qi pad + USB-C cable + box + printed manual | ~$14 | ~$1,400 |
| **Unit total** | **~$148** | **~$14,800** |
| NRE: EVT/DVT prototypes, stencils, test jig, CNC fixtures | | ~$4,000–6,000 |
| Certification (FCC + CE/RED), if not modular | | ~$12,000–20,000 |

All prices are planning estimates (Nov 2026), not quotes. Doc 02 has per-part numbers and links.
