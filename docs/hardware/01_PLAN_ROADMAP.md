# 01 — Plan & Roadmap

## 1. Requirement trace (all 19 items)

| # | Requirement | Design response | Doc |
|---|---|---|---|
| 1 | PCBWay | PCB fab + SMT assembly + (optional) CNC stainless via PCBWay | 06 |
| 2 | Pager-like notification from AI site | Device polls/long-polls (or MQTT/WebSocket) `/api/device/inbox`; buzzer/LED/vibration + screen | 03 |
| 3 | 2-part stainless body | Front bezel + back plate, 316L/304, 0.5–0.8 mm, laser-welded or 4 micro screws | 06 |
| 4 | Flat silver square 4×4 cm × 5 mm | 40×40×5 mm outer envelope (see feasibility R1) | 01 |
| 5 | Camera | OV2640/OV5640-class module on ESP32-S3 | 02 |
| 6 | LOT API connector | HTTPS+JSON, per-device token | 03 |
| 7 | PDF manuals | Markdown → PDF pipeline | 07 |
| 8 | Compress info each session | One short `SESSIONS/` digest per session, linked from README | SESSIONS |
| 9 | Firmware documents | FIRMWARE.md | 04 |
| 10 | Software connecting to firmware | Flasher/provisioner CLI + USB serial protocol | 05 |
| 11 | Separate documents | This 01–07 split | README |
| 12/19 | Charger / wireless charger | Qi/Qi2-class RX coil + charger IC; Qi TX pad shipped | 02 |
| 13 | 100-unit run | Pilot batch plan, yield budget | 06 |
| 14 | Weather sensor | BME280/BME688 (T/H/P) + site weather cross-check | 02 |
| 15 | AI-grade off-the-shelf sensors | BME688 (gas/AI-ready), IMU (LIS2DW12 / BMI270) for motion | 02 |
| 16 | "Copy" button → Log tab | Press → `POST /api/device/event {type:"copy"}` → Log entry | 03 |
| 17 | One side polished stainless | Back plate, mirror (#8) finish | 06 |
| 18 | Other side camera + screen + button | Front: camera pinhole, 1.14"-class IPS, one tactile button | 01 |

## 2. Hard feasibility findings (read first)

**R1 — 5 mm total thickness is extremely tight.** Stack budget (est.):
steel back 0.5 + battery 2.5–3.0 (e.g. 40×20×2.5 pouch) + PCB 0.8 + ESP32-S3 module 2.4 /
LCD 1.5–2.0 + front steel 0.5 → ≈ 8–9 mm naive. Reaching 5 mm requires: bare ESP32-S3
chip (not module) on a 0.6 mm PCB, side-by-side layout (components not stacked on the
battery), ≤1.5 mm LCD, a tiny ≈100 mAh pouch cell, camera module ≤3 mm.
**Recommendation:** prototype at 40×40×8 mm (v0.1), target 6 mm (v0.2), 5 mm only if the
v0.2 stack proves out. Decide with the inventor; do not promise 5 mm to a manufacturer yet.

**R2 — Stainless steel blocks Wi-Fi and Qi charging.** A fully metal sealed case acts as a
Faraday cage and eddy-current shield. Required solution: front face uses a non-metal window
(glass/ceramic/PET lens) covering screen, antenna, and the Qi coil area; metal bezel is a
frame only. Polished steel back stays closed (it is the "mirror" side). Qi coil + ferrite
sit under the front window around the display perimeter; charging pad touches the *front*
side. Antenna: PCB/chip antenna at an edge with a plastic/ceramic gap in the bezel.

**R3 — Camera in 5 mm:** OV2640 bare module lenses are ≈3–4 mm tall. Use a pinhole/flat
lens variant or fixed-focus micro module; image quality is low (2 MP) but adequate for "AI
snapshot" use.

**R4 — Battery safety:** LiPo in a sealed steel case needs protection IC, NTC, certified
cell (UN38.3 for shipping). Wireless charging heat + sealed metal: derate charge to ≤0.5C.

**R5 — Regulatory:** radio (FCC Part 15 / CE-RED), battery (UN38.3, IEC 62133), Qi (WPC
registration if using the Qi logo). A 100-unit run for internal/pilot use still needs FCC
unintentional/intentional radiator rules respected; use a pre-certified module where possible
(ESP32-S3-MINI/WROOM) — conflicts with R1; trade-off to be decided.

**R6 — Lithium-free alternative:** none practical at this size; skip.

## 3. Reference architecture

```
 lot-systems.com (AI engine) ──HTTPS──► /api/device/*  ◄──HTTPS── LOT PAGER
   Log tab ◄── events (copy, boot, battery)           ESP32-S3 + LCD + cam + BME688 + IMU
   AI → notification ("Coffee time!")  ───────────►   buzzer/haptic + screen text
```

MCU recommendation: **ESP32-S3** (Wi-Fi/BLE, camera interface DVP, USB-native, OTA,
mature toolchains). Battery fuel gauge optional (MAX17048). Charger: BQ51013B-class Qi RX
+ BQ25100-class Li-ion charger, or single-chip NXP/IDT/Renesas Qi RX with charge path.

## 4. Roadmap

| Phase | Weeks | Deliverable | Exit criterion |
|---|---|---|---|
| P0 Spec lock | 0–2 | Decisions on R1/R2 thickness & window design; API contract agreed; site endpoints designed | Signed-off docs 01–03 |
| P1 Dev-kit proof | 2–6 | Off-the-shelf ESP32-S3 camera board + BME688 + LCD + button, firmware v0.1, site endpoints live | Notification shown ≤5 s; Copy appears in Log tab |
| P2 Custom PCB v1 | 6–12 | KiCad design, 5 PCBWay prototypes, wireless charge test on bench | Boots, charges, all sensors read |
| P3 Enclosure v1 | 8–14 | CNC 316L two-part shell (3–5 pcs) w/ non-metal window; fit check | RF/Qi range test passes |
| P4 EVT/DVT | 14–22 | 20 units, firmware 0.5, factory test jig, drop/thermal tests | ≥90% pass, pre-scan RF |
| P5 Pilot 100 | 22–30 | 100-unit run, PDF manuals, provisioning tool | ≥85% yield, units registered on site |
| P6 Field | 30+ | Feedback → v2 | — |

Budget envelope (est.): prototype phase $3–6k; 100-unit run $9–16k (≈$90–160/unit incl.
CNC steel, which dominates). See 02.

## 5. Decisions needed from Vadik
1. Accept 6–8 mm for v0.1/0.2 (R1)? 2. Glass/ceramic front window instead of full steel (R2)? 3. Camera: stills only on demand?
4. Notification modality: buzzer vs vibration motor (motor costs thickness; piezo is thin).
5. Site hosting for the device endpoints (new routes needed — see 03).
