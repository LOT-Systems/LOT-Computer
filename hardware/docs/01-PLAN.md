# 01 · Plan: LOT Pager L-01

*Session 01 · 2026-11-19 · Status: spec draft, not yet reviewed by an engineer.*

## 1. What it is

A 40 × 40 mm stainless steel square, like a pager. It does three things:

1. **Receive.** It shows short notifications that LOT's AI sends on its own, e.g. *"Coffee time."*, *"Rain at 4 pm. Take the coat."*
2. **Copy.** One button. Pressing it sends the message on screen back to the user's **Log** tab on lot-systems.com as a `device_copy` entry.
3. **Sense.** A weather and air sensor and a camera feed context back to the site. The site's AI uses it to decide what to say and when.

The back is plain mirror-polished steel with nothing on it. The front has the screen, the camera and the button.

## 2. Requirements matrix (all 19 items)

| # | Requirement | Solution | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB fab, PCBA (turnkey parts) and CNC steel body all through PCBWay, so there's one vendor and one shipment | 05, 04 |
| 2 | Pager-like notification from an AI site | The server creates notifications with the existing `aiEngineManager`. The device fetches them from `/api/device/v1/inbox`, buzzes once and shows the text | 07, 06 |
| 3 | 2-part stainless steel body | 316L front frame + 316L back shell, held by 4 × M1.2 screws hidden under the front glass edge (or snap fit + adhesive in DVT) | 04 |
| 4 | Flat silver square 40 × 40 × 5 mm | 5.0 mm is the target. The stack-up adds up to 5.6–6.5 mm with off-the-shelf parts (§5). Plan: EVT at 6.5 mm, DVT at 5.5 mm, 5.0 mm only with a custom cell + flex PCB | 04 |
| 5 | Camera | Himax HM0360 ultra-low-power AI vision sensor (VGA, motion detect on the sensor). OV2640 is the colour fallback | 02 |
| 6 | LOT API connector | New authenticated device API: pair with a code, then use a bearer device token. Draft in `software/server-draft/` | 07 |
| 7 | Results as PDF manuals | Every doc is built to PDF in `hardware/manuals/` by `scripts/build-pdfs.mjs` | — |
| 8 | Compress information each session | Device: batched CBOR telemetry. Site: daily AI "digest" of ≤ 120 characters. Report: a "Session Capsule" at the top of every report | 11 |
| 9 | Firmware documents | Doc 06 + commented source in `firmware/` | 06 |
| 10 | Software that connects to firmware | Device protocol spec + Node simulator/mock + server route draft | 07 |
| 11 | Separate documents | 11 separate docs, each with its own PDF | README |
| 12 | Charger | Qi receiver inside + desk pad. Magnetic pogo dock as fallback | 08 |
| 13 | 100-unit run | Costed at 100 units. Panelised PCBA, CNC batch, factory test jig | 02, 09 |
| 14 | Weather sensor | Bosch BME688: temperature, humidity, pressure, gas/IAQ. Behind a Gore-type membrane vent | 02, 04 |
| 15 | AI-grade off-the-shelf sensors | BME688 (Bosch AI Studio gas classes), BMI270 IMU (on-chip gesture/wrist AI), HM0360 (on-sensor motion/ROI for TinyML) | 02 |
| 16 | "Copy" button → Log tab | Short press = `POST /api/device/v1/copy`, which creates a `Log` row with `event: "device_copy"`. It shows up in the Log tab like any other entry | 07 |
| 17 | One side polished stainless | Back shell: 316L, mirror polish (#8), laser-etched serial on the inside only | 04 |
| 18 | Other side: camera, screen, button | Front: 0.55 mm glass window over a 1.28" memory LCD, camera hole, steel button cap | 04 |
| 19 | Wireless charger | Qi (BQ51050B receiver). **Steel blocks Qi**, so the coil has to sit under the front glass. See risk R-02 | 08 |

## 3. System architecture

```
                    lot-systems.com (Fastify + Postgres)
   ┌──────────────────────────────────────────────────────────────────┐
   │ scheduled-jobs ──► AI notifier (aiEngineManager, circadian phase,│
   │                    weather, logs) ──► device_messages queue       │
   │ /api/device/v1/pair · inbox · copy · telemetry · capture          │
   │ Log tab ◄── Log{event:"device_copy"} ◄── /copy                    │
   └───────────────▲──────────────────────────────┬───────────────────┘
          HTTPS/TLS│ bearer device token          │ JSON (≤ 1 KB)
                   │                              ▼
   ┌───────────────┴──────────────────────────────────────────────────┐
   │ L-01 device                                                      │
   │ ESP32-S3 (Wi-Fi/BLE) ── SPI ── Sharp 1.28" memory LCD (always on) │
   │      │ DVP ── HM0360 camera     I²C ── BME688 · BMI270 · MAX17048 │
   │      │ GPIO ── Copy button      PWM ── coin haptic motor          │
   │ LiPo 150 mAh ── BQ51050B Qi Rx/charger ── Rx coil (under glass)   │
   └──────────────────────────────────────────────────────────────────┘
```

**Power model.** The ESP32-S3 sleeps deeply (about 15 µA). It wakes every 15 min (configurable 5–60) or when the button is pressed, joins Wi-Fi, fetches the inbox, posts telemetry, and goes back to sleep. The memory LCD keeps its image with almost no power, so the screen always shows the last message.

Budget: about 0.05 mAh per wake × 96 wakes/day ≈ 4.8 mAh, plus 0.4 mAh of sleep current, ≈ **5–6 mAh/day**. On a 150 mAh cell that's **about 3–4 weeks**. Camera use cuts this.

## 4. Front-face layout (40 × 40)

```
 ┌────────────────────────────────────────┐
 │  ○ cam                                  │  ← 2.0 mm camera hole, top-left
 │     ┌──────────────────────────┐        │
 │     │                          │        │
 │     │   Coffee time.           │        │  ← 1.28" 128×128 memory LCD
 │     │                          │        │     (active ~23 × 23 mm)
 │     │   09:41 · 12°C · IAQ 41  │        │
 │     └──────────────────────────┘        │
 │                                  ( ● )  │  ← Copy button, Ø6 mm steel cap
 └────────────────────────────────────────┘
   Qi coil (Ø ~22 mm) sits behind the LCD under the glass, ferrite on the PCB side
```

## 5. Stack-up (Z axis), honest numbers

| Layer | EVT (off-the-shelf) | DVT target | 5.0 mm path |
|---|---|---|---|
| Front glass window (chem. strengthened) | 0.55 | 0.55 | 0.40 |
| Memory LCD module | 0.90 | 0.90 | 0.80 |
| Qi coil + ferrite | 0.50 | 0.40 | 0.30 |
| PCB (6L HDI) | 0.80 | 0.60 | 0.40 (rigid-flex) |
| Tallest parts, one side only | 1.00 | 0.70 | 0.60 |
| LiPo cell | 2.00 | 1.60 | 1.50 (custom) |
| Back shell 316L | 0.80 | 0.70 | 0.60 |
| Air / adhesive / tolerances | 0.45 | 0.05 | 0.40 → 0.00 |
| **Total** | **≈ 7.0** | **≈ 5.5** | **≈ 5.0** |

The camera sits in a cut-out pocket in the PCB, so its 2.5–3 mm height overlaps the PCB and battery layers instead of adding to them.

## 6. Top risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-01 | 5 mm height not reachable with stock parts | High | Accept 5.5 mm for DVT. Custom 1.5 mm cell + rigid-flex PCB for PVT. Decision D-02 |
| R-02 | **Stainless steel blocks Qi and Wi-Fi** | High | Coil and chip antenna go under the front glass, never under steel. Magnetic pogo dock as fallback charger |
| R-03 | FCC/CE for a custom radio design | High | Use a pre-certified ESP32-S3 module (taller) or budget $10–20k for intentional-radiator testing. Decision D-01 |
| R-04 | Sealed steel can traps heat and humidity, so weather readings drift | Med | Membrane vent + BME688 on a thermally isolated PCB tongue + software heat compensation |
| R-05 | Mirror-polish yield on CNC 316L | Med | Order 120 back shells for 100 good. Final polish after machining. PVD clear coat optional |
| R-06 | Camera privacy | Med | Camera is off by default. Hardware LED in the hole when capturing. Images stay on the device unless the user turns uploads on |
| R-07 | LOT API has no device auth today (cookie sessions only) | Med | Add device tokens (hashed, revocable). See doc 07 |

## 7. What happens next

See [03 · Roadmap](03-ROADMAP.md). Next session: settle decisions D-01…D-04, draw the KiCad schematic, and order 5 EVT boards.
