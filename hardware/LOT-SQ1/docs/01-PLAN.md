# LOT SQ-1 — Product Plan & System Specification

**Document:** LOT-SQ1-01 · **Version:** 0.1 (Session HW-01) · **Date:** 2026-11-15
**Owner:** Vadik Marmeladov, Inventor · COSMO® / LOT Systems
**Status:** CONCEPT → EVT PLANNING

---

## 1. What SQ-1 is

SQ-1 is a pager for LOT. It's a flat, silver square, 40 × 40 × 5 mm, that sits on a desk or in a pocket. It shows one short notification at a time from lot-systems.com, such as **"Coffee time!"** or **"Breathe — 3 minutes"** or **"Rain at 16:00 — take the umbrella"**. It has one button, **COPY**. Pressing it sends the notification back to the user's **Log** tab on lot-systems.com, so the moment is kept.

It follows the Ambient AI™ idea: *always present, never loud.* It has no apps and no feed. There is one line of text, one button and one vibration.

```
          FRONT (face A)                    BACK (face B)
   ┌────────────────────────┐        ┌────────────────────────┐
   │ ┌────────────────────┐ │        │                        │
   │ │                    │ │        │                        │
   │ │    Coffee time!    │ │        │    polished 316L        │
   │ │                    │ │        │    stainless mirror     │
   │ │  1.54" e-paper     │ │        │    (laser-etched LOT®   │
   │ │  200×200 mono      │ │        │     mark + serial)      │
   │ └────────────────────┘ │        │                        │
   │   (◉) cam      [COPY]  │        │                        │
   └────────────────────────┘        └────────────────────────┘
          40 × 40 mm                        40 × 40 mm
```

## 2. Requirements traceability (from the brief)

| # | Requirement | How SQ-1 meets it | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB fab, assembly (PCBA), stainless CNC and polish all through PCBWay | 08 |
| 2 | Pager notification from the AI site | The device polls `/api/device/v1/sync`. The LOT AI picks and times the message, and the device shows it and vibrates | 05, 06 |
| 3 | 2-part stainless body | Front frame + back plate in 316L, joined by an insulating seam gasket and 4× M1.2 screws | 04 |
| 4 | Flat silver square 40×40×5 mm | 5.0 mm target, 5.5 mm EVT allowance (see §6, risk R1) | 04 |
| 5 | Camera | Thin VGA DVP module on the front. Long-press COPY sends a photo to Log / Mirror | 02, 05 |
| 6 | LOT API connector | Device token auth, REST v1 contract, reference Fastify plugin | 06 |
| 7 | PDF manuals | `manuals/*.pdf` is generated from these docs every session | manuals/ |
| 8 | Compress info each session | `SESSION-STATE.md`: a short compressed state file that carries over to the next session | root |
| 9 | Firmware documents | Firmware architecture + source skeleton | 05, firmware/ |
| 10 | Software connecting to the firmware | Server plugin + mock server + device simulator | 06, software/ |
| 11 | Separate documents | One topic per file, one PDF per file | docs/ |
| 12 | Charger | LOT Dock: a Qi transmitter puck in a CNC cradle | 04, 02 |
| 13 | 100-unit run | Pilot run plan, costing and yield allowance | 08 |
| 14 | Weather sensor | Bosch BME688 (temp / humidity / pressure / gas) through a sintered micro-vent | 02 |
| 15 | AI-grade off-the-shelf sensors | BME688 (on-chip AI gas classes) + ST LSM6DSOX (Machine-Learning Core) | 02 |
| 16 | COPY button → site Log tab | `POST /api/device/v1/copy` creates a `device_copy` Log entry | 06 |
| 17 | One side polished stainless | Face B: 316L with a mirror polish (#8 finish) | 04 |
| 18 | Other side: camera, screen, button | Face A layout, see §1 | 04 |
| 19 | Wireless charger | Qi receiver (TI BQ51050B) charges through the front glass window | 04 |

## 3. System architecture

```
 lot-systems.com (Fastify + Postgres + AI engines)
   │  AI decides WHAT + WHEN  ("Coffee time!")
   │
   ▼  HTTPS  /api/device/v1/*   (Bearer device token)
 ┌─────────────────────────── SQ-1 ───────────────────────────┐
 │ ESP32-S3R8 (Wi-Fi 4 / BLE 5, 8 MB PSRAM) + 8 MB QSPI flash │
 │   ├─ SPI ── 1.54" e-paper (SSD1681)        "the pager"     │
 │   ├─ DVP ── VGA camera module               "the eye"      │
 │   ├─ I²C ── BME688  weather + gas AI        "the air"      │
 │   ├─ I²C ── LSM6DSOX IMU + ML core          "the touch"    │
 │   ├─ I²C ── MAX17048 fuel gauge                            │
 │   ├─ GPIO ─ COPY button (RTC wake)                         │
 │   └─ GPIO ─ coin ERM vibration (pager buzz)                │
 │ Power: Li-Po ~80–120 mAh ← BQ51050B Qi Rx+charger          │
 │        → TPS62840 buck 3.3 V (60 nA Iq)                    │
 └────────────────────────────────────────────────────────────┘
   ▲ Qi 5 W pad
 LOT Dock (charger puck)
```

### 3.1 Interaction model

| Action | Result | Site effect |
|---|---|---|
| New notification arrives | E-paper refresh + 2 short buzzes | `device_delivered` (metadata) |
| **COPY** short press | ✓ glyph on screen | Log entry `device_copy` with the text |
| **COPY** long press (1.5 s) | Camera capture, privacy dot shows | Log entry `device_photo` + image |
| Double-tap the case (IMU) | Shows weather card | none |
| Placed on the Dock | Charging glyph | `device_telemetry` battery |

### 3.2 Power budget (estimate)

| State | Current | Time / day | mAh / day |
|---|---|---|---|
| Deep sleep (RTC + IMU wake) | ~15 µA | ~23.9 h | 0.36 |
| Wi-Fi sync (connect + TLS + POST) | ~110 mA avg | 96 × 3 s | 8.8 |
| E-paper refresh | ~5 mA | 10 × 2 s | 0.03 |
| Vibration | ~60 mA | 10 × 0.3 s | 0.05 |
| Camera (rare) | ~150 mA | 2 × 2 s | 0.17 |
| **Total (15-min sync)** | | | **≈ 9.4** |

With an 80 mAh cell, that is about **8 days** at a 15-minute sync interval, or about **15 days** at 30 minutes with quiet hours. Wi-Fi sync is about 94% of the budget, so the sync interval is the main battery lever. The server can change it (`next_sync_s` in every reply), so the AI can sync more often around expected moments and less often at night.

## 4. Naming

* **SQ-1:** the device (Square, generation 1)
* **LOT Dock:** the wireless charger
* **LOT Device API v1:** the connector contract
* Log events: `device_copy`, `device_photo`, `device_telemetry`, `device_delivered`

## 5. What SQ-1 is NOT (v1 scope guard)

* No microphone, no speaker, no touchscreen.
* No cellular. It needs Wi-Fi (a phone hotspot works).
* No app store and no on-device LLM. The intelligence stays on lot-systems.com.
* No continuous camera. Capture happens only on an explicit long press, and a hardware privacy indicator shows whenever the camera is powered.

## 6. Top risks (detail in 03-ROADMAP)

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | 5.0 mm Z-height with camera + battery + Qi coil | HIGH | 5.5 mm EVT, a camera pocket through the PCB, a 1.5–2.0 mm cell |
| R2 | Stainless steel blocks Qi and Wi-Fi | HIGH | Qi and antenna both work through the front glass. The seam acts as a slot antenna |
| R3 | Thin Li-Po custom cell MOQ (500–1000) | MED | Use an off-the-shelf ultra-thin cell for the pilot |
| R4 | FCC/CE certification of a chip-down radio | MED | Certified module in EVT; chip-down + certification budget for PVT |
| R5 | Stainless mirror polish yield at 100 units | MED | 15% spare backs, PVD as a fallback |
