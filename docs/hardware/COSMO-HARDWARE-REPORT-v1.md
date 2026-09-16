<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Inventor
  COSMO® CIA Hardware Division
  Session Report — Hardware Computer Design
  Original Date: 2026-06-12 | Landed on master: 2026-09-16
-->

# COSMO® Cube — Hardware Computer Design Report

**Session Report:** COSMO-HARDWARE-REPORT-v1.md
**Classification:** Internal — Engineering + Strategic
**Author:** Vadim Marmeladov, Inventor, COSMO® CIA
**Original Design Session:** 2026-06-12
**This Revision:** 2026-09-16
**Status:** v1.1 — First complete hardware design landed on master

---

## Continuity

This is not a new design. On 2026-06-12, a complete 7-document hardware
specification for a LOT hardware computer was produced on branch
`claude/brave-lamport-t9z5u8` (manifest entry "COSMO Hardware", 14/14
iterations, marked **BEST**). It was never merged — `docs/hardware/` does
not exist on master as of this session's preflight, and the branch itself
is now three months stale relative to master (322 files diverged, mostly
unrelated churn from other feature lines landing in between).

Rather than cherry-pick a stale branch and risk reverting unrelated work,
this session re-derived the same design directly onto current master —
carrying every dimension, part number, and interface decision forward
unchanged — and lands it in `docs/hardware/` for the first time. The
source branch is preserved as provenance (never deleted per the ship-mode
rule) and the manifest entry is updated to `SHIPPED` in this session.

**Sources read this session:**
- `docs/benchmark/LOT-MANIFEST.md` — located the unshipped BEST branch
- `docs/hardware/*.md` on `origin/claude/brave-lamport-t9z5u8` (via `git show`) — the original 7 documents, read in full
- `docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md` — confirms CUBIQ™ (LOT®'s actuated notification body) and COSMO® Cube (this document, a general-purpose hardware computer) are deliberately distinct sibling objects, same father/son lineage
- `docs/corporate/LOT_ROBOTICS_COSMO.md` — COSMO® brand naming, Benchmark Arbitrage gate, ethical framework
- `docs/technical/LOT-NODE-0-RIG-SPEC.md` — Terminal Grid documentation register, INPUT→CLASSIFY→ACTION→RECORD transparency pattern
- `docs/corporate/LOT-TERMINAL-M2M.md` — hardware-to-LOT data intake protocol precedent
- Live fetch of `brand.lot-systems.com`, `lot-systems.com/about`, and
  `institute.lot-systems.com/cqgs.html` was attempted per S-2 instruction and
  returned `EGRESS_BLOCKED` (network policy for this session does not permit
  those hosts). Fell back to the local mirrors: `docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md`
  and `docs/technical/LOT-STYLE-GUIDE.md`.

---

## Executive Summary

This report documents the complete design for the COSMO® Cube — a hardware computer physically connected to the LOT Systems platform at lot-systems.com. The device is a flat, 40×40×5mm stainless steel ambient intelligence node: it receives pager-style notifications from the LOT AI engine, logs behavioral snapshots via a single Copy button, and captures environmental data through weather and AI-grade sensors.

**The device is:**
- A physical extension of the LOT operating system
- A behavioral signal collector (every button press is a data point)
- A hardware milestone for the COSMO® product line
- Designed for a 100-unit production run via PCBWay

**7 markdown documents + 2 PDF manuals in `docs/hardware/`.**

---

## Device Identity

| Field | Value |
|-------|-------|
| Product name | COSMO® Cube |
| Form factor | 40mm × 40mm × 5mm flat square |
| Body | 316L stainless steel, CNC machined, 2 parts |
| Side A (Back) | Mirror-polished #8 finish — LOT® engraved |
| Side B (Front) | Satin SS — display, camera, button |
| Weight | ~28g |
| Connectivity | WiFi 802.11n, BLE 5.0 |
| Charging | Qi wireless (5W, included pad) |
| Platform | LOT Systems — lot-systems.com |
| Production run | 100 units |
| Target unit cost | ~$110 (cost) / $349 (retail) |
| Manufacturer | PCBWay (PCB + SMT + CNC) |

---

## Design Decisions Log

### 1. Form Factor (4×4cm, 5mm)

**Decision:** Flat square, credit-card-like footprint.
**Rationale:** Minimal desk presence. Sits flat or pockets like a money clip. The 5mm height is aggressive — requires custom thin LiPo (2.5mm), 0.8mm PCB, flush camera module. Achievable with careful stack-up (see COSMO-DEVICE-SPEC-v1.md §2, §5).
**Challenge:** Camera lens height is the critical constraint. HM01B0 + M7 macro lens stacks to ~3.5mm — within budget with 0.3mm SS plates.

### 2. Main MCU: ESP32-S3

**Decision:** ESP32-S3-MINI-1U (Espressif).
**Rationale:** Native 2.4GHz WiFi for LOT API polling. Built-in BLE 5.0. Hardware vector acceleration for on-device AI inference (notification filtering). Proven ecosystem. PCBWay stocks for turnkey assembly. 8MB flash sufficient for firmware + OTA slots.
**Considered:** nRF5340 (lower power, BLE-only — would need separate WiFi chip), Raspberry Pi RP2350 (no native WiFi).

### 3. Display: SSD1327 1.0" Grayscale OLED

**Decision:** 128×128 grayscale OLED.
**Rationale:** Perfect square format matches device footprint. 16-level grayscale enables elegant typography (LOT brand: no decorative colors, system-default aesthetic). Lower power than color LCD. 1.6mm module thickness fits 5mm budget.
**Why not e-ink:** Too slow for real-time notification rendering and button feedback animations.

### 4. Camera: Himax HM01B0

**Decision:** Ultra-low-power CMOS imager, 320×320.
**Rationale:** 1.1mW at 30fps — critical for battery life. CSP package (2.45×2.45mm) fits tight board. Used in Arduino Nano 33 BLE Sense — proven embedded ecosystem. Face detection on-device (ESP32-S3 vector instructions) for Soul Sync gate.
**Fallback:** OV2640 2MP for prototyping (thicker, more proven).

### 5. Wireless Charging Only (No USB)

**Decision:** Qi wireless charging, no USB port.
**Rationale:** Aesthetic purity (no port breaks SS surface). IP54 integrity (no port to seal). Behavioral signal: charging with intention, not plugging in.
**Engineering note:** BQ51013B + 30mm coil + ferrite fits in 5mm stack. Full charge in 2.5 hours.

### 6. Copy Button → LOT Log Tab

**Decision:** Single physical button = single behavioral gesture.
**Rationale:** The Copy button is the hardware equivalent of a LOT journal entry. Press it, and your environmental context (temp, humidity, light, orientation) is logged to lot-systems.com/log with tag [COSMO® Cube]. Intentional. Deliberate. Logged.
**Signal value:** Every button press timestamps a moment. Over time, press patterns become a behavioral signal (when do you reach for the device? What were conditions?).

### 7. Weather + AI-Grade Sensors

**Decision:** BME280 (weather) + ICM-42688-P (IMU) + APDS-9960 (gesture/light).
**Rationale:** BME280 is industry-standard for temp/humidity/pressure — direct weather data. ICM-42688-P is TDK's highest-grade consumer IMU — detects motion, orientation, tap-to-wake, sleep posture. APDS-9960 enables gesture dismiss (wave to clear notification) and auto-sleep in dark/ambient conditions.
**"AI-grade":** All three sensors have on-device signal processing, FIFO buffers, and hardware motion classification — no MCU cycles needed for basic event detection.

### 8. 2-Part 316L Stainless Steel Body

**Decision:** 316L (marine grade) SS, CNC machined, PCBWay.
**Rationale:** 316L is the gold standard for portable electronics (Apple Watch Series 2+ uses 316L). Superior corrosion resistance vs 304. CNC machining from PCBWay delivers ±0.05mm tolerance — sufficient for flush camera, button, display cutouts.
**Why 2 parts:** Back plate is flat (simple mirror polish). Front bezel has all cutouts (complex machining). Separation enables different finish per side.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────┐
│             COSMO® Cube (Hardware)             │
│                                                │
│  ┌──────────┐  I2C  ┌──────────┐              │
│  │ BME280   │──────►│          │              │
│  │ Weather  │       │          │  SPI ┌──────┐│
│  └──────────┘  I2C  │ ESP32-S3 │─────►│OLED  ││
│  ┌──────────┐──────►│ MINI-1U  │      │DSPLY ││
│  │ APDS9960 │       │          │      └──────┘│
│  │ Light+   │  SPI  │  240MHz  │              │
│  │ Gesture  │◄──────│  8MB     │  DVP  ┌─────┐│
│  └──────────┘       │  WiFi    │──────►│Cam  ││
│  ┌──────────┐  SPI  │  BLE 5   │       │HM01B││
│  │ICM-42688 │──────►│          │       └─────┘│
│  │ IMU      │       └────┬─────┘              │
│  └──────────┘       I2C  │                    │
│  ┌──────────┐ ◄──────────┘ GPIO               │
│  │ BQ25892  │                    ┌──────────┐ │
│  │ PMIC     │◄───────────────────│ BQ51013B │ │
│  └─────┬────┘      5V Qi         │ Qi Rx IC │ │
│        │                         └─────┬────┘ │
│   3.3V │ 1.8V             Qi coil  ────┘      │
│        ▼                                       │
│  ┌──────────┐                                  │
│  │ LiPo     │ 280mAh, 3.7V                     │
│  │ Battery  │                                  │
│  └──────────┘                                  │
│                        [Copy Button] [LED]     │
└────────────────────────────────────────────────┘
              │ WiFi 802.11n
              ▼
┌──────────────────────────────────┐
│         lot-systems.com          │
│                                  │
│  GET /api/hardware/notifications │ ← AI sends: "Coffee time!"
│  POST /api/hardware/log          │ → Button press + sensor data
│  GET /api/hardware/firmware      │ ← OTA update check
│                                  │
│  Log Tab ← displays [COSMO® Cube]│
│           entries with sensor    │
│           snapshot data          │
└──────────────────────────────────┘
```

---

## Documents in `docs/hardware/`

| Document | Description |
|----------|-------------|
| **COSMO-HARDWARE-REPORT-v1.md** | This report |
| **COSMO-DEVICE-SPEC-v1.md** | Complete device specification |
| **COSMO-BOM-v1.md** | Bill of Materials — 100 unit run, with supplier links |
| **COSMO-FIRMWARE-v1.md** | Firmware architecture + code |
| **COSMO-SOFTWARE-API-v1.md** | LOT API connector + backend |
| **COSMO-MANUFACTURING-v1.md** | PCBWay manufacturing guide |
| **COSMO-CHARGER-SPEC-v1.md** | Wireless charger spec |
| **COSMO-CUBE-QUICK-START-v1.pdf** | 4-page printable quick start (PDF manual) |
| **COSMO-CUBE-HARDWARE-MANUAL-v1.pdf** | Consolidated engineering reference (PDF manual) |

---

## Components Buying List — Summary

| # | Component | MPN | Supplier | Unit Cost | Total (110) |
|---|-----------|-----|----------|-----------|-------------|
| 1 | ESP32-S3-MINI-1U | ESP32-S3-MINI-1U-N8 | Mouser | $3.80 | $418 |
| 2 | SSD1327 OLED 1.0" | ER-OLED013-1W | BuyDisplay | $5.50 | $605 |
| 3 | Camera HM01B0 | HM01B0-AAA | ArduCam | $4.20 | $462 |
| 4 | Weather BME280 | BME280 | Mouser 828-BME280 | $2.80 | $308 |
| 5 | IMU ICM-42688-P | ICM-42688-P | Mouser | $3.50 | $385 |
| 6 | Light APDS-9960 | APDS-9960 | Mouser 630-APDS-9960 | $2.10 | $231 |
| 7 | Qi Rx IC BQ51013B | BQ51013BRHLR | Mouser 595-BQ51013BRHLR | $2.80 | $308 |
| 8 | Qi Rx Coil 30mm | WE 760308101 | Mouser / Alibaba | $1.50 | $165 |
| 9 | PMIC BQ25892 | BQ25892RTWR | Mouser | $2.60 | $286 |
| 10 | LiPo 280mAh 35×35×2.5mm | Custom | Grepow | $6.50 | $715 |
| 11 | Copy Button | EVQ-Q2C03W | Mouser | $0.25 | $28 |
| 12 | RGB LED | APTR3216ZGCK | Mouser | $0.20 | $22 |
| 13 | LDO 1.8V AP2112K | AP2112K-1.8TRG1 | DigiKey | $0.30 | $33 |
| 14 | Passives (caps, res) | Various | Mouser | $3.00 | $330 |
| 15 | PCB (4-layer, PCBWay) | Custom | PCBWay | $3.50 | $385 |
| 16 | SMT Assembly | Turnkey | PCBWay | $12.00 | $1,320 |
| 17 | SS Enclosure (2-part) | Custom CNC | PCBWay CNC | $40.00 | $4,400 |
| 18 | Qi Tx Pad (charger) | OEM custom | Alibaba | $9.00 | $900 |
| 19 | Packaging (box + foam) | Custom | Alibaba | $4.00 | $400 |
| | **Grand Total (incl. 15% contingency)** | | | | **~$12,340** |

Full detail, MPNs, datasheet links, and buy links: `COSMO-BOM-v1.md`.

---

## Roadmap

### Phase 0 — Design (Complete)
- [x] Device specification
- [x] Bill of materials
- [x] Firmware architecture
- [x] LOT API integration design
- [x] Manufacturing guide
- [x] Charger specification
- [x] Session report
- [x] Landed on master (this session, 2026-09-16 — was stuck unshipped on `claude/brave-lamport-t9z5u8` since 2026-06-12)
- [x] PDF manuals generated (Quick Start + Hardware Reference)

### Phase 1 — Engineering (Not started)
- [ ] PCB schematic capture (KiCad 8.0)
- [ ] PCB layout (35×35mm, 4-layer)
- [ ] Enclosure CAD (Fusion 360 or FreeCAD)
- [ ] Gerbers + DXF/STEP generated
- [ ] LOT backend: hardware API endpoints coded (`hardware_devices`, `hardware_logs`, `hardware_notifications` tables + 4 routes — not yet in `src/server/routes/api.ts`)

### Phase 2 — Prototype (Not started)
- [ ] 10-unit prototype order (PCBWay)
- [ ] Firmware v0.1: boot + WiFi + display
- [ ] Firmware v0.2: API polling + notification display
- [ ] Firmware v0.3: Copy button + sensor logging
- [ ] Hardware validation: all sensors, charging, camera

### Phase 3 — Production (Not started)
- [ ] 100-unit production order (PCBWay)
- [ ] Factory firmware flash + provisioning
- [ ] QA: all 100 units (checklist in COSMO-MANUFACTURING-v1.md)
- [ ] Packaging + shipping

### Phase 4 — Launch (Not started)
- [ ] LOT web app: My Devices page
- [ ] LOT Log tab: hardware entry display
- [ ] Notification push: QI-46 Engine → device
- [ ] OTA infrastructure for firmware updates
- [ ] FCC/CE certification (pre-commercial, budget ~$20K)
- [ ] Retail listing at $349 (Purple+ Benchmark tier required)

**No PO has been placed. No engineering files (Gerbers, STEP, schematic) exist
yet.** Phase 0 is a specification, not a built device — the next real-world
action is Phase 1: schematic capture in KiCad.

---

## PDF Manuals

Two manuals were rendered as actual PDFs this session (not just planned, per
S-2's explicit ask):

| Manual | Audience | File |
|--------|----------|------|
| COSMO® Cube Quick Start Guide | End user | `COSMO-CUBE-QUICK-START-v1.pdf` |
| COSMO® Cube Hardware Reference Manual | Engineers | `COSMO-CUBE-HARDWARE-MANUAL-v1.pdf` |

Remaining planned manuals (firmware developer guide, full API integration
guide, manufacturing & QA manual) are covered in markdown form by
`COSMO-FIRMWARE-v1.md`, `COSMO-SOFTWARE-API-v1.md`, and
`COSMO-MANUFACTURING-v1.md` respectively — render to PDF at the point they
are needed for external (non-LOT-repo) distribution, e.g. handing files to
PCBWay or a contract firmware engineer.

**Tool used:** ReportLab (Python), matching the toolchain already in
`scripts/generate_badge_pdf.py`. **Format:** Letter, LOT® design language
(black/white, monospace headers).

---

## Strategic Notes

**Why this device first:**
The COSMO® Cube is the simplest hardware node in the COSMO® product line. It is not a robot. It is not a companion AI. It is an ambient sensor + notification terminal + behavioral logger. It validates the hardware pipeline (PCBWay, firmware, LOT API integration) at low risk before COSMO® robotics.

**Why 100 units:**
100 units is the minimum for meaningful market feedback and the minimum for PCBWay CNC pricing to be reasonable on SS enclosures. It is below MOQ risk for all components. Under $15K total. Fundable from current revenue.

**The Copy button is the signal:**
Every time a LOT user presses the Copy button, they are making a behavioral gesture — "I am here, this is my context, log it." Over months, these presses form a pattern: when do they reach for the device? What light levels? What temperature? What time of day? This is Soul Sync data. It is the hardware's contribution to the Quantum Intent Engine.

**"Coffee time!" is the interface:**
The LOT AI sends "Coffee time!" to the device. The user sees it on the mirror-finished square on their desk. They pause. They get coffee. The AI learned this pattern from their behavior. The hardware closes the loop — knowledge becomes action, action becomes habit, habit becomes identity.

---

## Session Compression Summary

**Session:** Hardware Computer Design — COSMO® Cube — landed on master
**Original design date:** 2026-06-12
**This session:** 2026-09-16
**Output:** 7 markdown documents + 2 PDF manuals, full hardware specification to production-ready
**Key decisions:** ESP32-S3 MCU, HM01B0 camera, SSD1327 OLED, 316L SS enclosure, PCBWay manufacturing, Qi wireless charging, BME280 + ICM-42688-P + APDS-9960 sensors
**Next action:** PCB schematic in KiCad 8.0, LOT API hardware endpoints
**Branch:** `claude/brave-lamport-xyzm59` (this session); provenance: `claude/brave-lamport-t9z5u8`

---

*COSMO® CIA — LOT Systems, Inc.*
*Inventor: Vadim Marmeladov*
*Named for Kuzya Cosmo Marmeladov*
*Made in the USA.*

---

*"A flat square of polished steel that says 'Coffee time!' is not a gadget.*
*It is proof that the machine learned something true about you."*
*— Vadim Marmeladov*
