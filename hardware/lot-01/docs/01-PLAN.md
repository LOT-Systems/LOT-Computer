---
title: "LOT-01 SQUARE — Product Plan"
subtitle: "Doc 01 · Hardware companion for lot-systems.com · Rev A (2026-11-24)"
---

# LOT-01 SQUARE — Product Plan

> A flat stainless-steel square that lives in your pocket or on your desk, shows
> short autonomous notes from LOT ("Coffee time!"), and has one button — **COPY** —
> that sends the current moment (note + local weather + optional photo) back to
> your **Log** tab on lot-systems.com.

| Field | Value |
|---|---|
| Codename | **SQUARE** · LOT-01 |
| Owner | Vadik — Inventor, COSMO® CIA |
| Form | 40 × 40 × 5.0 mm, two-part stainless steel (316L) |
| Faces | **Back:** mirror-polished stainless, no openings · **Front:** screen + camera + COPY button |
| Run | 100 units (pilot) |
| Fab partner | PCBWay (PCB + PCBA + CNC stainless + finishing) |
| Link | LOT API Connector over Wi-Fi (HTTPS), BLE for setup |
| Power | ~90 mAh thin LiPo, NFC wireless charging (charger puck included) |
| Status | Rev A plan. Nothing ordered yet. |

---

## 1. Requirements trace (the brief → this design)

| # | Brief item | How LOT-01 meets it | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB (4-layer HDI, 0.6 mm), PCBA, CNC 316L body and mirror polish all quoted through PCBWay | 05, 04 |
| 2 | Pager-like notification from the AI site | Server "Pager Composer" turns LOT contextual prompts into ≤ 42-char notes; device polls, buzzes, shows them | 07, 06 |
| 3 | 2-part stainless steel body | Front tray (frame + front face) + mirror back plate, 316L, laser-welded or screwed with 4× M1.0 screws | 04 |
| 4 | Flat silver square 4 × 4 cm × 5 mm | 40.0 × 40.0 × 5.0 mm envelope, split-level stack-up (§4 of doc 04) | 04 |
| 5 | Camera | VGA low-profile camera (GC032A class) behind the front glass | 02, 06 |
| 6 | LOT API connector | `/api/public/device/*`: claim, inbox, copy, telemetry, OTA | 07 |
| 7 | Result in PDF manuals | Every doc in this folder is built to PDF (`tools/build-pdf.mjs`) → `pdf/` | 10 |
| 8 | Compress the information in each session | Device sessions: ≤ 512 B payloads + rolling 280-char digest per device. Work sessions: each report ends with a compressed digest | 07, sessions/ |
| 9 | Firmware documents | Doc 06 | 06 |
| 10 | Software to connect with firmware | Doc 08 + runnable connector simulator `tools/lot01-sim.mjs` | 08 |
| 11 | Separate documents | One file per subject (01–10) | — |
| 12 | Charger | Charger puck (NFC wireless charging, USB-C in) | 09 |
| 13 | 100-unit run | BOM costed at 100 units; pilot roadmap | 02, 03 |
| 14 | Weather sensor | Bosch BME688 (temperature, humidity, pressure, gas) with a vented side port | 02, 04 |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC2 / AI-Studio gas classification) + ST LSM6DSV16X (on-chip machine-learning core) | 02 |
| 16 | COPY button → Log tab | Short press = `device_copy` Log entry; long press = add a photo | 06, 07 |
| 17 | One side polished stainless | Back plate: 316L, mirror polish Ra ≤ 0.05 µm, no openings | 04 |
| 18 | Other side: camera, screen, button | Front: 1.28″ memory LCD + camera behind glass, steel COPY button below | 04 |
| 19 | Wireless charger | NFC WLC (PTX30W receiver / PTX130W puck). Qi is the fallback (see doc 03 risk R2) | 09 |

## 2. System architecture

```
 ┌───────────────────────── lot-systems.com ─────────────────────────┐
 │  Memory Engine / contextual prompts / circadian / weather          │
 │            │                                                       │
 │   Pager Composer (scheduled job, AI)  ──►  device_messages queue    │
 │            ▲                                     │                 │
 │   Log tab ◄┴── device_copy / device_photo  ◄──┐  │                 │
 │                                               │  ▼                 │
 │            /api/public/device/{claim,inbox,copy,telemetry,ota}     │
 └───────────────────────────────▲───────────────┼───────────────────┘
                                 │ HTTPS (TLS 1.2+, device token)
                         Wi-Fi 2.4 GHz           │
 ┌───────────────────────────────┴───────────────▼───────────────────┐
 │ LOT-01 SQUARE                                                      │
 │  ESP32-S3 ── SPI ── Sharp 1.28″ memory LCD (always-on, ~µW)        │
 │     │  └── DVP ─── VGA camera                                      │
 │     │  └── I²C ─── BME688 (weather + gas AI)  · LSM6DSV16X (MLC)   │
 │     │  └── GPIO ── COPY button (deep-sleep wake) · coin haptic     │
 │     └── I²C ─── BQ25120A PMIC ── 90 mAh LiPo ── PTX30W NFC-WLC RX  │
 └────────────────────────────────────────────────────────────────────┘
                 ▲ 13.56 MHz wireless power (face-down)
          ┌──────┴──────┐
          │ Charger puck │  PTX130W poller · USB-C 5 V
          └─────────────┘
```

## 3. Interaction model (the whole UX)

| Input | Action | Feedback |
|---|---|---|
| New note arrives | Wakes, 2× short buzz, note shown full-screen | Note stays visible at ~0 power (memory LCD) |
| **COPY** short press | Sends note + BME688 reading + time to the Log | "COPIED ✓" for 2 s, 1 buzz |
| **COPY** long press (≥ 1 s) | Takes a photo (QVGA JPEG) and attaches it to the copy | Viewfinder dot, "PHOTO ✓" |
| **COPY** double press | Dismisses the note, shows the clock/weather face | — |
| Pick up (IMU wrist-raise/tap) | Refresh and show the latest note | — |
| Face-down on charger | Charges. Shows battery % | Ring animation |

Idle face: time, local temperature/humidity, a one-word LOT state (e.g. `CALM`, `FOCUS`).

## 4. Key decisions (Rev A)

1. **Bare ESP32-S3FH4R2 chip, not a module.** Modules are ≥ 2.4 mm tall, which breaks the 5 mm stack. Cost: the product needs its own FCC/CE intentional-radiator certification (budgeted in doc 03).
2. **Memory LCD, not e-paper or OLED.** Sunlight-readable, always-on at microwatts, 1-bit like a pager, about 0.75 mm thick.
3. **NFC wireless charging, not Qi.** A stainless body blocks and heats up under Qi's 100–200 kHz field. NFC-WLC at 13.56 MHz with a small flex antenna behind the front glass is designed for this size (smart rings, earbuds). Qi remains the fallback.
4. **Antennas behind the front glass.** The back is solid polished steel. Wi-Fi/BLE and charging all go through the glass window. The seam between the two body parts is kept as a backup RF slot.
5. **Polling with a server-set interval, not a persistent socket.** A sync every 10 min (adaptive 2–30 min) gives about 7–10 days per charge. A persistent socket would give about 2 days.
6. **No USB port.** The body stays sealed. Factory flashing uses pogo pads under the battery. Field updates are over the air (signed).

## 5. Out of scope for Rev A

Microphone or voice, cellular/LoRa, a colour screen, waterproofing beyond splash resistance (IP54 target), and retail certifications beyond FCC/CE/UKCA.

## 6. Document set

01 Plan · 02 BOM & buying list · 03 Roadmap & risk analysis · 04 Mechanical (body) · 05 Electrical & PCBWay fab pack · 06 Firmware · 07 LOT API Connector · 08 Companion software · 09 Charger · 10 User manual. Session reports are in `sessions/`.
