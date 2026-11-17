---
title: "LOT PAGER — 01 · Plan, Feasibility & Roadmap"
subtitle: "Hardware programme HW-01 · COSMO® CIA · Rev 0.1 · 2026-11-17"
---

# LOT PAGER — 01 · PLAN, FEASIBILITY & ROADMAP

```
DOCUMENT   HW-01 / 01-PLAN
ISSUE      2026-11-17 · Session 1
OWNER      Vadik — Inventor, COSMO® CIA
CLASS      INTERNAL / BUILD
STATUS     PLAN LOCKED FOR EVT · OPEN RISKS LISTED IN §5
```

## 0 · What we are building

A **4 × 4 cm, 5 mm thin, two-part stainless steel pager** that sits quietly on a
desk and receives calm, autonomous notifications from **lot-systems.com**:
*"Coffee time!"*, *"Stretch. Two minutes. Now."*, *"Dry air. Drink some water."*

- **Back (Side A)** — polished 316L stainless steel, mirror finish, no openings.
- **Front (Side B)** — stainless frame with a glass window carrying the **screen**,
  the **camera**, and one **button: COPY**.
- **COPY** sends the message on screen back to the user's **Log tab** on lot-systems.com.
- **Sensors** — off-the-shelf AI-grade parts: Bosch **BME688** (temperature,
  humidity, pressure, gas, AI gas classification via BSEC2), Bosch **BMI270**
  (motion, flip/tap with on-chip feature engine), ambient light.
- **Power** — Qi **wireless charging**, face-down on the pad. No ports. Sealed.
- **Run** — **100 units**, PCB + assembly at **PCBWay**.

## 1 · Requirement trace (all 19 items)

| #  | Requirement                                   | Where it is resolved                                         | Status S1 |
|----|-----------------------------------------------|--------------------------------------------------------------|-----------|
| 1  | PCBWay                                        | 04-PCB-PCBWAY (board spec, order params, PCBA, CNC)          | Spec'd    |
| 2  | Pager-like notification from AI-powered site  | 06-API · `GET /api/device/v1/frame`, AI rephrase opt-in      | **Built** |
| 3  | 2-part stainless steel body                   | 03-MECHANICAL · front frame + back plate, 316L               | Spec'd    |
| 4  | Flat silver square 40 × 40 × 5 mm             | 03-MECHANICAL · z-stack budget 4.55 mm / 5.00 mm             | Spec'd · risk R2 |
| 5  | Camera                                        | 02-BOM GC0308-class DVP module, firmware pins; pipeline S2   | Partial   |
| 6  | LOT API connector                             | `src/server/routes/device-api.ts`, `utils/device.ts`         | **Built** |
| 7  | Result in PDF manuals                         | `docs/hardware/lot-pager/pdf/*.pdf`                          | **Built** |
| 8  | Compress information in each session          | 81-byte frame per wake, 52-char pager text (06-API §4)       | **Built** |
| 9  | Firmware documents                            | 05-FIRMWARE                                                  | **Built** |
| 10 | Software to connect with firmware             | `firmware/lot-pager/tools/lot-pager-cli.mjs`                 | **Built** |
| 11 | Separate documents                            | 01…09, one MD + one PDF each                                 | **Built** |
| 12 | Charger                                       | 08-CHARGER · BQ51050B Qi RX + pad                            | Spec'd    |
| 13 | 100-unit run                                  | 09-MANUFACTURING · cost, yield, test jig                     | Spec'd    |
| 14 | Weather sensor                                | BME688 + server-side Open-Meteo already in LOT               | Spec'd · fw read built |
| 15 | AI-grade off-the-shelf sensors                | BME688 (BSEC2 AI), BMI270 (feature engine)                   | Spec'd    |
| 16 | COPY button → Log tab                         | `POST /api/device/v1/copy` → Log event `device_copy`         | **Built** |
| 17 | One side polished stainless                   | Back plate, mirror #8 polish                                 | Spec'd    |
| 18 | Other side: camera, screen, button            | Front layout 03-MECHANICAL §3                                | Spec'd    |
| 19 | Wireless charger                              | Coil under front glass (metal back blocks Qi — see R1)       | Spec'd · risk R1 |

## 2 · System architecture

```
 ┌──────────── lot-systems.com ────────────┐
 │  AI engines (Claude/Together/…, opt-in)  │
 │  rule engine: time + device sensors      │
 │  pager queue (user.metadata.pager)       │       user writes on site
 │  /api/devices/*        (cookie)          │◄──── pair / notify / revoke
 │  /api/device/v1/*      (Bearer lotd.*)   │
 │  Log tab ← event "device_copy"           │
 └─────────────▲──────────────┬─────────────┘
               │ HTTPS, 1 call per wake (≈81 B frame)
               │              ▼
 ┌──────────── LOT PAGER (40×40×5) ──────────────────────────────┐
 │ ESP32-S3 ─SPI─ Sharp 160×68 memory LCD (holds image at µW)    │
 │    │ I²C: BME688 · BMI270 · LTR-303 · MAX17048 · RV-3028      │
 │    │ DVP: GC0308 camera                                       │
 │ COPY button (RTC wake) · BQ51050B Qi RX + Li-ion charger      │
 │ 100 mAh LiPo · TPS62840 buck (60 nA Iq)                       │
 └───────────────────────────────────────────────────────────────┘
```

## 3 · Power budget (why it lasts ~2 weeks per charge)

| State                     | Current      | Duration / day     | mAh / day |
|---------------------------|--------------|--------------------|-----------|
| Deep sleep (MCU + sensors + RTC + LCD hold) | ≈ 15 µA | 24 h  | 0.36 |
| Wake + Wi-Fi + TLS + 1 call | ≈ 100 mA avg | 75 wakes × 2.5 s | 5.2 |
| COPY presses              | ≈ 100 mA     | 10 × 3 s           | 0.8 |
| **Total**                 |              |                    | **≈ 6.4** |

100 mAh cell → **≈ 15 days**. Poll policy (server-controlled): 15 min by day,
60 min at night, 60 s while the queue has more messages, 60 min below 10 % battery.
*Estimates; measured on EVT with a Nordic PPK2.*

## 4 · Roadmap

| Phase | Window (from kickoff) | Units | Goal | Exit criteria |
|-------|------------------------|-------|------|---------------|
| **S1 · Plan + connector** | Week 0 (this session) | 0 | Plan, BOM, API live in code, firmware v0.1, manuals | Server tests green, docs + PDFs pushed |
| **P0 · Breadboard** | Weeks 1–3 | 3 | ESP32-S3 devkit + breakouts (LCD, BME688, Qi RX EVM) talking to staging API | 7-day soak, COPY → Log works end-to-end |
| **EVT · "Fat" Rev A** | Weeks 4–9 | 10 | PCBWay 4-layer board with **ESP32-S3-MINI-1 module** (pre-certified) in a 7 mm CNC body | RF range ≥ 8 m through front glass; Qi charge < 3 h; power ≤ 8 mAh/day |
| **DVT · Rev B 5 mm** | Weeks 10–17 | 20 | Chip-down ESP32-S3FH4R2, 0.6 mm board, final 316L 2-part body, cover glass | z ≤ 5.00 mm, drop 1 m × 6 faces, IP54, thermal on pad ≤ 41 °C |
| **Cert** | Weeks 14–20 | 5 | FCC Part 15 + CE RED (chip-down radio = full intentional-radiator test), Qi interoperability | Grants issued |
| **PVT · 100-unit run** | Weeks 18–24 | 100 | PCBWay PCBA + CNC, in-house final assembly + test jig | ≥ 95 % first-pass yield, every unit passes jig |
| **S2+ firmware** | parallel | — | camera snapshot → Log, BSEC2 IAQ, OTA, BLE provisioning | — |

**Critical path:** enclosure + cover glass + RF/Qi validation (R1, R2) — not the electronics.

## 5 · Top risks (honest analysis)

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| **R1** | **Stainless steel blocks Qi and Wi-Fi.** A metal back plate absorbs the charging field as eddy-current heat and shields the 2.4 GHz antenna. | **High** | Coil and antenna live under the **front glass**; device charges **face-down**, polished back up. Validate on EVT. Fallback: 2-pin magnetic pogo puck. |
| **R2** | **5.0 mm total thickness.** Camera modules are typically 2.5–4 mm tall. | **High** | PCB cut-out so the camera passes through the board; battery placed beside, not under, the camera. EVT measures real module z-heights from 3 suppliers. |
| R3 | Chip-down radio triggers full FCC/CE intentional-radiator certification (est. $10–20 k). | Med | EVT uses pre-certified module; decide at DVT whether 5 mm justifies cert cost. |
| R4 | Memory LCD needs a 1 Hz VCOM toggle even while MCU sleeps. | Med | RV-3028 RTC CLKOUT = 1 Hz drives EXTCOMIN (45 nA). Built into fw v0.1. |
| R5 | BME688 needs airflow; a sealed steel body reads its own heat. | Med | 0.5 mm laser-drilled vent + ePTFE membrane on the side wall; read sensors **before** Wi-Fi heats the board. |
| R6 | 100 mAh is small; a bad Wi-Fi AP can drain it. | Low | Wi-Fi timeout 8 s, server-paced polling, battery-aware intervals. |
| R7 | Cover-glass breakage on drops. | Low | 0.4 mm chemically strengthened glass, 0.2 mm steel lip proud of glass. |

## 6 · Decisions taken this session

1. **Pull, not push.** The pager polls; the site never needs to reach a sleeping device. Simpler, battery-safe, firewall-proof.
2. **No DB migration.** Devices and pager queue live in `user.metadata` (devices ≤ 5, queue ≤ 20).
3. **AI is opt-in** (`LOT_PAGER_AI=1`). The rule engine works with zero AI cost; AI only rephrases to ≤ 7 words.
4. **Token shown once**, only `sha256(secret)` stored, constant-time compare.
5. **No ports** on the device. Programming via Tag-Connect pads under the back plate; charging via Qi only.

## 7 · Next session (S2) — planned

- Camera pipeline: long-press → JPEG (QVGA) → `POST /api/device/v1/photo` → Log.
- Site UI: a "Devices" section in Settings (pair / revoke / send).
- BSEC2 IAQ on BME688; OTA update channel.
- KiCad schematic + first layout for PCBWay quote.
