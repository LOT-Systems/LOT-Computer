<!--
  LOT SYSTEMS CORPORATION
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT-01 — HARDWARE PAGER FOR LOT-SYSTEMS.COM
PLAN · ARCHITECTURE · ROADMAP ANALYSIS
================================================================================
DOCUMENT    HW-00 / PLAN
ISSUE       2026.11.12 · REV A (session 01)
OWNER       Vadik — Inventor, COSMO® CIA
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
STATUS      CONCEPT → EVT PLANNING
================================================================================
```

## 00 · WHAT IT IS

LOT-01 is a 40 × 40 mm stainless-steel square. It does three things:

1. **Receives.** LOT-systems.com sends short notifications to it, the way a
   pager does: *"Coffee time."*, *"Rain at 16:00. Take the coat."*,
   *"Evening check-in."*
2. **Senses.** It has a weather sensor (temperature, humidity, pressure, air
   quality) and a small camera. These readings go back to the user's LOT account.
3. **Copies.** One button, **COPY**. Pressing it sends what is on the screen
   (and optionally a camera frame) to the user's **Log** tab on lot-systems.com.

Working name: **LOT-01**. The final product name is the inventor's call.

```
   FRONT (face)                         BACK (mirror)
  ┌──────────────────────┐            ┌──────────────────────┐
  │ ○ cam                │            │                      │
  │  ┌────────────────┐  │            │                      │
  │  │ Coffee time.   │  │            │   POLISHED 316L      │
  │  │                │  │            │   STAINLESS STEEL    │
  │  │ 09:41   12°C   │  │            │   (mirror, #8)       │
  │  └────────────────┘  │            │                      │
  │              [COPY]  │            │                      │
  └──────────────────────┘            └──────────────────────┘
        40 × 40 mm, 5 mm target (6 mm EVT fallback)
```

## 01 · THE 19 REQUIREMENTS, MAPPED

| #  | Requirement                                   | How it is met                                                         | Doc   |
|----|-----------------------------------------------|-----------------------------------------------------------------------|-------|
| 1  | PCBWay                                        | PCB fab, PCBA, stainless CNC and polish all ordered from PCBWay       | HW-07 |
| 2  | Pager-like notifications from AI site         | LOT server writes ≤ 64-char messages; device pulls/gets pushed, buzzes | HW-05, HW-06 |
| 3  | 2-part stainless body                          | 316L CNC: back cup (mirror) + front bezel frame, 4 × M1.2 screws       | HW-03 |
| 4  | Flat square 4 × 4 cm × 5 mm                    | 40.0 × 40.0 mm; Z-stack budget in HW-03 §3 (5.0 target, 6.0 fallback)   | HW-03 |
| 5  | Camera                                         | GC0308 VGA FPC module behind the cover glass (ESP32-S3 DVP)             | HW-04 |
| 6  | LOT API connector                              | `/api/device/*` connector, device tokens, spec + reference code        | HW-06 |
| 7  | PDF manuals                                    | Every HW doc rendered to PDF in `docs/hardware/pdf/`                    | all   |
| 8  | Compress info each session                     | Each session report ends with a COMPRESSION block (≤ 12 lines); device messages are compressed server-side to pager length | SR, HW-06 |
| 9  | Firmware documents                             | HW-05 + source skeleton `hardware/firmware/lot01/` (main/main.c)                      | HW-05 |
| 10 | Software to connect with firmware              | Server connector `hardware/software/server/` + simulator                | HW-06 |
| 11 | Separate documents                             | One file per topic, HW-00 … HW-08                                       | index |
| 12 | Charger                                        | LOT Dock: Qi transmitter puck, USB-C powered                            | HW-04, HW-02 |
| 13 | 100 units run                                  | Costing, PCBWay order plan, test jig, QA for 100 (+10 spares)           | HW-02, HW-07 |
| 14 | Weather sensor                                 | Bosch BME688 (T / RH / P / gas) behind a vented membrane                | HW-04 |
| 15 | AI-grade off-the-shelf sensors                 | BME688 (on-sensor AI gas classes via BME AI-Studio), BMI270 IMU (gesture/wake), ESP32-S3 vector instructions for on-device ML | HW-04 |
| 16 | COPY button → Log tab on lot-systems.com       | `POST /api/device/copy` → new Log entry `event: device_copy`            | HW-06 |
| 17 | One side polished stainless                    | Back cup: 316L, mirror polish (#8), no openings                         | HW-03 |
| 18 | Other side: camera, screen, button             | Front: cover glass over screen + camera, steel COPY button in bezel     | HW-03 |
| 19 | Wireless charger                               | Qi receiver (TI BQ51050B) with coil **under the glass face**            | HW-04 |

## 02 · THE THREE HARD PROBLEMS (read these first)

**P1 — Steel blocks wireless charging.** A Qi coil behind stainless steel
does not charge; the steel heats up instead. *Decision:* the coil sits under
the **front glass**, not the mirror back. The device charges **face-down** on
the LOT Dock. The mirror back stays a clean, unbroken surface.

**P2 — Steel blocks the radio.** A closed steel box is a Faraday cage. Wi-Fi
and Bluetooth must leave through the front glass and through a 0.3 mm
non-conductive seam gasket between the two steel parts. *Decision:* chip
antenna on the PCB edge, directly under the glass, with a keep-out zone.
RF must be measured on the first EVT bodies, not assumed.

**P3 — 5 mm is very thin.** Glass + display + PCB + parts + battery + steel
adds up to about 5.3–5.8 mm with real parts (HW-03 §3). *Decision:* EVT
builds at **6.0 mm** to prove function. DVT pushes to **5.0 mm** using a 1.6 mm
battery, a 0.4 mm PCB and a camera cut-out through the PCB.

## 03 · SYSTEM ARCHITECTURE

```
 lot-systems.com (AI)                          LOT-01 device
 ┌───────────────────────────┐   HTTPS/Wi-Fi   ┌────────────────────────────┐
 │ Memory Engine / scheduler │◄───────────────►│ ESP32-S3 (Wi-Fi + BLE)     │
 │  └─ writes notification    │  GET  /inbox    │  ├─ Sharp memory LCD 1.28" │
 │     (compressed ≤ 64 ch)   │  POST /copy     │  ├─ GC0308 camera          │
 │ /api/device/* connector    │  POST /telemetry│  ├─ BME688 weather/air     │
 │ Log tab  ◄── device_copy   │  POST /frame    │  ├─ BMI270 motion/wake     │
 └───────────────────────────┘                 │  ├─ COPY button + haptic   │
                                               │  └─ BQ51050B Qi + LiPo     │
             LOT Dock (Qi TX, USB-C) ─────────►└────────────────────────────┘
```

Data the device sends: COPY events, weather/air readings, optional camera
frames. Data the device gets: notifications, time, config. Nothing else.

## 04 · ROADMAP

| Phase | What                                                     | Exit gate                                         | Weeks | Units |
|-------|----------------------------------------------------------|---------------------------------------------------|-------|-------|
| P0    | Plan, BOM, docs (this session)                           | Docs signed off by inventor                        | 1     | 0     |
| P1    | Dev-kit proto: ESP32-S3 dev board + breakout modules      | COPY reaches Log tab; notification shows on LCD    | 2–3   | 3     |
| P2    | Server connector live on staging                          | Device token pairing works; simulator passes       | 1–2 (parallel to P1) | — |
| EVT   | Custom PCB rev A (PCBWay) in 6 mm CNC body                 | Charges face-down; RF ≥ −70 dBm at 5 m; 3-day battery | 4–6 | 10 |
| DVT   | PCB rev B, 5 mm body, polish finish, Dock                  | Drop 1 m ×10; 48 h soak; thermal on Qi ≤ 42 °C      | 4–6   | 20    |
| PVT   | 100-unit run (+10 spares), test jig, packaging, manuals   | 100 % jig pass; yield ≥ 95 %                        | 6–8   | 110   |
| CERT  | FCC/CE intentional radiator (pre-certified module helps)  | Reports in hand before any sale                     | 6–10 (overlaps PVT) | 3–5 |

Total realistic calendar: **5–7 months** from today to 100 units in hand.
Fastest path to a working object on a desk: **P1 in ~3 weeks**.

## 05 · ROADMAP ANALYSIS — RISKS AND CALLS

| Risk                                      | Prob. | Impact | Mitigation                                                        |
|-------------------------------------------|-------|--------|-------------------------------------------------------------------|
| RF through steel body too weak            | High  | High   | Pre-certified module footprint as plan B (ESP32-S3-MINI-1 if Z allows); seam slot antenna; measure at EVT |
| 5.0 mm not reachable with camera          | High  | Med    | Ship at 5.5–6.0 mm, or make camera a DVT-optional feature           |
| Qi heat on small coil (2.5 W into 90 mAh)| Med   | Med    | Cap charge at 0.5 C (≈ 45 mA); BQ51050B ILIM resistor; thermistor  |
| Battery life with Wi-Fi                   | Med   | High   | Poll every 5 min in light sleep, memory LCD draws ~µW; target 3 days |
| Polished steel scratches during assembly  | High  | Low    | Protective film from CNC shop to final pack; polish last           |
| FCC/CE cost and time                      | Med   | High   | Use ESP32-S3 module with existing modular grant if thickness allows; budget US$ 8–15 k |
| BME688 reads hot (self-heating, ESP32)    | High  | Med    | Isolate with PCB slot; vent membrane on bezel edge; software compensation |
| Camera privacy perception                 | Med   | Med    | Camera only fires on long-press COPY; LED/screen shows "CAM" when active |

**Recommendation:** Start P1 (dev-kit prototype) and P2 (server connector)
now, in parallel. Do not order EVT boards before P1 proves the COPY → Log
loop end-to-end. Lock the 5 mm vs 6 mm decision at the end of EVT using
measured parts, not datasheets.

## 06 · DOCUMENT SET

| ID    | File                                       | Contents                              |
|-------|--------------------------------------------|---------------------------------------|
| HW-00 | LOT-01-00-PLAN-AND-ROADMAP.md              | This plan                             |
| HW-02 | LOT-01-02-BOM-BUYING-LIST.md               | Buying list, links, 100-unit costing  |
| HW-03 | LOT-01-03-MECHANICAL-ENCLOSURE.md          | 2-part steel body, Z-stack, CNC spec  |
| HW-04 | LOT-01-04-ELECTRICAL-DESIGN.md             | Block diagram, pin map, power, Qi     |
| HW-05 | LOT-01-05-FIRMWARE.md                      | Firmware architecture and states      |
| HW-06 | LOT-01-06-LOT-API-CONNECTOR.md             | Device ↔ lot-systems.com protocol     |
| HW-07 | LOT-01-07-MANUFACTURING-100-UNITS.md       | PCBWay order, test jig, QA            |
| HW-08 | LOT-01-08-USER-MANUAL.md                   | Owner's manual                        |
| SR    | sessions/LOT-HW-SR-YYYYMMDD-NN.md          | Session report + compression block    |

PDF copies of every document: `docs/hardware/pdf/`.

## 07 · SOURCES AND LIMITS OF THIS REVISION

- brand.lot-systems.com, lot-systems.com/about and institute.lot-systems.com/cqgs.html
  **could not be read** in this session: the network policy blocks them.
  Brand language was taken from the repository (`docs/technical/LOT-STYLE-GUIDE.md`,
  LOT Wiki, which lists *"LOT® Station, LOT® Brush, COSMO® node"* as planned
  QIoT™ devices). Re-read those pages next session and align naming.
- Supplier sites were also blocked, so **prices are planning estimates** and
  links are manufacturer pages or distributor search links. Confirm price and
  stock before ordering.
