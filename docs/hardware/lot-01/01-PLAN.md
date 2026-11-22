# LOT·01 — Product Plan

> **Hardware pager for LOT-systems.com.** A 40 × 40 × 5 mm stainless-steel square that shows short AI notifications from the site ("Coffee time!") and has one **Copy** button that sends the current message back to the user's **Log** tab.
> Status: **PLAN / pre-EVT** · Owner: Vadik, Inventor (COSMO® CIA) · Doc rev A · 2026-11-22

---

## 1. Requirements (from the brief → spec)

| # | Brief item | Engineering requirement | Where it lives |
|---|---|---|---|
| 1 | PCBWay | PCB fab + turnkey SMT + CNC enclosure quoted at PCBWay; one vendor for EVT/DVT | `05-PCB-PCBWAY.md` |
| 2 | Pager-like notification from AI site | Server AI writes ≤ 64-char messages to a per-device inbox; device wakes, buzzes, shows | `07-LOT-API-CONNECTOR.md` |
| 3 | 2-part stainless body | Part A: polished back shell · Part B: front bezel frame holding cover glass. 316L | `04-ENCLOSURE.md` |
| 4 | Flat silver square 40 × 40 × 5 mm | Outline 40.0 × 40.0 mm, **Z ≤ 5.0 mm target, 5.5 mm hard ceiling** (see §4) | `04-ENCLOSURE.md` |
| 5 | Camera | VGA/2 MP DVP sensor, slim FPC module ≤ 3.4 mm, front-facing | `02-BOM.md` |
| 6 | LOT API connector | New `/device-api/v1` route group, bearer-token device auth, pairing by code | `07-…`, `connector/` |
| 7 | PDF manuals | User, Firmware, Connector, Manufacturing manuals generated from these MD files | `pdf/` |
| 8 | Compress info each session | `SESSION-STATE.md` ≤ 40 lines rewritten each run; device protocol also compact (short JSON, 64-char text cap) | `SESSION-STATE.md` |
| 9 | Firmware documents | Architecture, state machine, power, OTA, flashing | `06-FIRMWARE.md`, `firmware/` |
| 10 | Software to connect with firmware | Server plugin draft + Node device simulator that speaks the same protocol | `connector/` |
| 11 | Separate documents | One file per discipline, numbered | this folder |
| 12 | Charger | Qi 5 W pad bundled (v1 off-the-shelf, v2 LOT puck) | `08-CHARGER.md` |
| 13 | 100-unit run | PVT lot of 100, with test fixture, QA, yield allowance (110 built) | `10-MANUFACTURING-100.md` |
| 14 | Weather sensor | Bosch **BME688** temp / humidity / pressure / gas, vented | `02-BOM.md` |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC AI gas classifier) + ST **LSM6DSOX** (on-chip machine-learning core: tap, pick-up, flip) | `02-BOM.md` |
| 16 | Copy button → Log tab | Press = `POST /device-api/v1/copy` → server creates `Log{event:'note'}` with `metadata.source='lot-01'` | `07-…` |
| 17 | One side polished stainless | Part A back shell, mirror polish (#8), no openings | `04-…` |
| 18 | Other side: camera, screen, button | Front: glass over memory LCD, camera window, stainless Copy key | `04-…` |
| 19 | Wireless charger | Qi receiver coil **behind the front glass** (see §3 — steel blocks Qi) | `08-CHARGER.md` |

## 2. System architecture

```
 lot-systems.com (Fastify + Postgres)                    LOT·01 device
 ┌──────────────────────────────────────┐               ┌───────────────────────────────┐
 │ AI engine (ai-engines.ts)            │               │ ESP32-S3 (Wi-Fi 2.4 GHz, BLE) │
 │   └─ scheduled job: compose message  │               │  ├─ Sharp memory LCD 1.28"    │
 │        "Coffee time!"  (≤64 chars)   │               │  ├─ Camera (DVP)              │
 │ device_notifications table           │  HTTPS/JSON   │  ├─ BME688 weather + AI gas   │
 │ /device-api/v1/inbox   ◄─────────────┼───── poll ────┤  ├─ LSM6DSOX IMU (ML core)    │
 │ /device-api/v1/copy    ◄─────────────┼── Copy press ─┤  ├─ Copy key (metal dome)     │
 │   └─ Log.create({event:'note'})      │               │  ├─ LRA haptic (pager buzz)   │
 │        → appears in Log tab          │               │  └─ Qi RX + charger + LiPo    │
 └──────────────────────────────────────┘               └───────────────────────────────┘
```

**Why polling, not push:** a sealed 80–100 mAh device can't hold a socket open. The device sleeps, wakes on a server-chosen interval (`next_poll_s`, 5–60 min, tighter around scheduled messages), polls, buzzes if new, sleeps again. Feels like a pager; costs ~4 mAh/day.

## 3. The three physics problems (read these first)

1. **Stainless steel blocks Qi charging.** A conductive back plate in the field heats up and couples nothing. Fix: put the receiver coil **behind the front glass** (between display and PCB, ferrite sheet facing the PCB). The device charges **face-down** on a soft Qi pad. The polished back stays solid metal. *Fallback (decided at EVT):* back becomes polished-steel rim + NCVM mirror-silver glass insert, which looks like steel but lets Qi through.
2. **Stainless steel blocks Wi-Fi/BLE.** Same fix, same window: the chip antenna sits at the front-glass edge with ≥ 3 mm clearance from the bezel. EVT must measure range in the real case.
3. **5 mm is a very tight Z budget.** It works only if the battery, camera and parts sit **side by side** in one layer, not stacked:

| Layer (front → back) | mm |
|---|---|
| Cover glass (aluminosilicate, chem-strengthened) | 0.40 |
| Memory LCD (LS013B7DH03, verify lot) | 0.74 |
| Qi coil (FPC) + ferrite sheet | 0.45 |
| PCB, 4-layer, 0.4 mm | 0.40 |
| Parts / battery / LRA layer (battery 2.2 mm is the tallest part; camera goes through a PCB cut-out) | 2.20 |
| Back shell wall (316L) | 0.40 |
| Adhesives, foam, tolerance stack | 0.30 |
| **Total** | **4.89** |

Margin is 0.11 mm. If a 2.2 mm cell or a ≤ 3.4 mm camera can't be sourced, **Z goes to 5.5 mm**. Decision gate **G1** (see roadmap).

## 4. Front layout (side B)

```
 ┌──────────── 40.0 ────────────┐
 │ ┌───────────────────┐  (●)   │
 │ │                   │        │
 │ │   1.28" memory    │        │
 │ │   LCD 128×128     │        │
 │ │  "Coffee time!"   │        │
 │ │                   │  ┌──┐  │
 │ └───────────────────┘  │▭ │  │
 │  ·vent (BME688)        └──┘  │
 └──────────────────────────────┘
   2.0 mm bezel frame (Part B), glass inset flush
```
(●) camera window Ø2.0 mm in the glass ink mask · ▭ COPY key, 316L, 6 × 3 mm, over a metal dome

Back (side A): solid mirror-polished 316L, optional laser-etched serial `LOT·01 · 001/100` only.

## 5. Power budget (100 mAh cell, ~85 mAh usable)

| State | Current | Time/day | mAh/day |
|---|---|---|---|
| Deep sleep (ESP32-S3 + RTC + LCD static + IMU low-power) | ~25 µA | 24 h | 0.60 |
| Wi-Fi poll (connect + TLS resume + GET) | ~110 mA avg | 96 × 1.2 s | 3.52 |
| Haptic buzz + LCD update | ~60 mA | 10 × 0.4 s | 0.07 |
| Copy press (Wi-Fi POST) | ~110 mA | 10 × 1.5 s | 0.46 |
| BME688 reading (low-power mode, per poll) | ~1 mA | 96 × 2 s | 0.05 |
| Camera capture (VGA, upload) | ~180 mA | 2 × 4 s | 0.40 |
| **Total** | | | **≈ 5.1 mAh/day → ~16 days** |

Adaptive polling (hourly at night) pushes this toward 3 weeks.

## 6. Decisions open for Vadik

| ID | Decision | Recommendation |
|---|---|---|
| D-1 | Bare ESP32-S3 chip (fits 5 mm, needs full FCC/CE test ≈ $12–20k) **vs** pre-certified ESP32-S3-MINI-1 module (2.4 mm tall, Z → ~6.3 mm) | **Bare chip.** The 5 mm square is the product. |
| D-2 | Qi through front glass (face-down charging) **vs** NCVM mirror-glass back insert | **Front-glass Qi** for EVT; keep the insert as fallback |
| D-3 | Camera role in v1: what does the photo do? | v1: long-press Copy = photo attached to the Log entry. Needs image storage on the server (Phase 2) |
| D-4 | Haptic (pager buzz) – not in the brief, but "pager-like" needs it | **Include** 8 mm coin LRA |
| D-5 | Who is the 100-unit audience (members, gifts, sale)? | Drives certification path: a sale needs FCC/CE; gifts to staff under FCC §2.803 exemptions are limited |
