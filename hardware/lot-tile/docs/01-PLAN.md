# 01 · LOT TILE: Product Plan

**Doc:** LOT-HW-01-PLAN · **Rev:** A (2026-11-14) · **Author:** Vadik, Inventor, COSMO® CIA (with Claude Code)

## 1. What it is

LOT TILE is a pocket or desk object. It is the physical end of LOT-systems.com.

- The site's AI (Memory Engine, Quantum Intent Engine, contextual prompts) decides when the user
  should get a nudge and writes it as one short line, for example *"Coffee time!"*, *"Walk. 12°C, clear."* or *"Evening check-in."*
- The tile vibrates once, like a pager, and shows the line.
- **Copy** button, short press: the line is written to the user's **Log** tab on lot-systems.com as a
  `device_copy` entry. The screen then confirms with "Copied."
- **Copy** button, long press: the camera takes one frame, and the same Log entry gets a photo.
- Every 15 minutes the BME688 sensor reports local temperature, humidity, pressure and air quality. The site
  uses this in place of, or alongside, the city weather it fetches today (`/api/weather`).

The design follows the LOT style guide: no decorative colour, no emoji, "Done." instead of a check mark,
and one primary action.

## 2. Requirements traceability (the 19 points of the brief)

| # | Brief | Design decision | Doc |
|---|-------|-----------------|-----|
| 1 | PCBWay | PCBWay for PCB fabrication, PCBA (turnkey parts), CNC stainless enclosure and mirror polish, from one vendor | 07 |
| 2 | Pager-like notification from the AI site | Server pushes a ≤ 48-character line. Device: LRA haptic pulse, then the line on the Memory LCD | 04, 06 |
| 3 | Two-part stainless body | Part A: back tray (floor and walls, 316L). Part B: front bezel plate (316L) holding the cover glass. Joined with 4 × M1.0 Torx screws and a gasket | 03 |
| 4 | Flat silver square 40 × 40 mm, 5 mm high | 40.0 × 40.0 mm footprint. **5.0 mm is achievable only with a chip-down MCU and a custom 1.6 mm cell** (DVT). EVT build is 6.5 mm | 03 §3 |
| 5 | Camera | Ultra-thin FPC VGA module (GC032A / GC0308 class, ≤ 2.5 mm Z), DVP to ESP32-S3 | 04 |
| 6 | LOT API connector | New `/api/device/*` namespace with device-token auth and pairing by short code | 06 |
| 7 | Result in PDF manuals | `tools/build_pdfs.py` renders every doc into `manuals/*.pdf` | manuals/ |
| 8 | Compress the information in each session | (a) Wire format: compact JSON lines ≤ 512 B, with deltas only. (b) Server condenses AI context into one pager line. (c) Each work session ends with a compressed ledger block in the session report | 06 §7, report |
| 9 | Firmware documents | Firmware architecture, state machine and OTA doc, plus source in `firmware/` | 05 |
| 10 | Software to connect with firmware | `software/lotctl.py`: USB-serial provisioning (Wi-Fi and pairing), log tail, and a device simulator | 05 §8 |
| 11 | Separate documents | One subject per file, 01–09, each also built as its own PDF | README |
| 12 | Charger | Qi 5 W charging pad (off-the-shelf in EVT, LOT-branded stainless puck in PVT). USB-C on the pad only | 04 §4, 07 |
| 13 | 100-unit run | BOM costed at 100 units. PCBWay PCBA plus CNC lot. FCC path for a pre-certified module | 02, 07 |
| 14 | Weather sensor | Bosch BME688 (T, RH, P, VOC gas) behind a sintered vent with an ePTFE membrane | 04 |
| 15 | AI-grade off-the-shelf sensors | BME688 (on-sensor gas AI via BME AI-Studio), BMI270 IMU (on-chip gesture/wrist-wake AI), LTR-303 ambient light | 02, 04 |
| 16 | Copy button signals the Log tab | `POST /api/device/copy` creates Log `event: 'device_copy'`, which must be added to the Log tab's `displayableEvents` | 06 §5 |
| 17 | One side polished stainless steel | Back: mirror-polished 316L (#8 finish), with the Qi window in NCVM mirror-silver glass so the side still reads as uniform silver | 03 §4 |
| 18 | Other side: camera, screen, button | Front: 1.08" Memory LCD (top), camera (bottom left), Copy key (bottom right) | 03 §2 |
| 19 | Wireless charger | Qi RX, TI BQ51050B (receiver and Li-ion charger in one chip), with a 20 × 20 mm receiver coil behind the back window | 04 §4 |

## 3. The one physics conflict to resolve

**Solid stainless steel blocks wireless charging.** A Qi field induces eddy currents in a steel back,
which heats the steel and stops charging. Points 17 and 19 conflict if the back is one solid steel plate.

Proposed resolution (default, **decision D-1**): cut a Ø 26 mm window in the back plate and fill it with
a flush cover of chemically strengthened glass with **NCVM coating** (non-conductive vacuum metallization). This is the
finish phones use to look metallic while staying RF and induction transparent. The back still reads as one
mirror-silver face, and the window shows only as a thin seam ring.

Alternatives, if Vadik prefers an all-steel back:

| Option | Look | Charging | Cost / risk |
|--------|------|----------|-------------|
| **A. NCVM glass window (default)** | Silver, faint seam ring | Qi 5 W (practical 1–2 W) | Low |
| B. All-steel back, magnetic pogo pins | Pure polished steel, 2 pads visible | Wired via dock, fast | Low, but it is not "wireless" |
| C. All-steel back, charge face-down through the front glass | Pure back | Coil must sit under the display, which needs custom flex coil and display stack | High |
| D. Titanium or ceramic back | Different material | Qi works through zirconia | Changes brand material |

## 4. Product decisions taken in this plan

1. **MCU: ESP32-S3.** Wi-Fi and BLE, camera DVP interface, PSRAM for frames, mature Arduino/IDF, low cost.
   EVT uses the pre-certified `ESP32-S3-MINI-1U`/`-1-N4R2` module (FCC modular grant, 2.4 mm Z).
   The 5.0 mm DVT moves to chip-down `ESP32-S3FH4R2` (QFN56 7 × 7 × 0.9 mm). That needs our own RF layout and a full FCC Part 15C grant.
2. **Screen: Sharp Memory LCD, 1.08", 160 × 68 (LS011B7DH03).** Reflective silver-grey look, readable in sun,
   ~µW static draw (holds the last notification with power off the MCU) and about 1 mm thick. It fits the LOT monochrome aesthetic.
3. **Pager haptic:** 8 mm Z-axis LRA and TI DRV2605L (licensed haptic library, one-line "pager" waveform).
4. **Connectivity:** standalone Wi-Fi with BLE provisioning. No phone app is required in v1. Pairing uses a 6-character code entered on lot-systems.com.
5. **Delivery model:** the device wakes on a timer (default every 5 min, adaptive) and fetches pending
   notifications. Opening a socket for true push is a v2 option (power cost below).

## 5. Out of scope for v1

Microphone and speaker, GPS, cellular, colour display, water resistance above IP54, any on-device generative AI (all AI runs on lot-systems.com).

## 6. Success criteria for the 100-unit run

- ≥ 95 % first-pass yield at final functional test
- ≥ 3 days battery at the default 5-minute cadence (EVT cell) and ≥ 2 days (DVT 5 mm cell)
- Notification latency ≤ cadence + 10 s. Copy-to-Log round trip ≤ 3 s on good Wi-Fi
- Back face passes cosmetic spec: #8 mirror, no visible tool marks at 30 cm under D65 light
