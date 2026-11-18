# 01 · Program Plan — LOT TILE (P1)

**Owner:** Vadik, Inventor · COSMO® CIA
**Document status:** S1 plan, 2026-11-18
**Scope:** hardware, firmware, server connector, manuals, and a first production run of 100 units

---

## 1. What the product is

LOT TILE is a quiet pager for people who use lot-systems.com.

- **Front face (the "working" face):** a 1.28" always-on memory-LCD, a small camera, a privacy LED and one button.
- **Back face:** solid, mirror-polished 316L stainless steel. There are no markings except an optional laser-etched serial number.
- **Size:** 40 × 40 mm, 5.0 mm thick. Two machined steel parts.
- **What it does:** the LOT site's AI (the Memory / Quantum Intent engines that already run in `src/server/utils`) decides when to nudge the user, for example "Coffee time!", "Walk outside, it's 18°C", or "Evening check-in". The TILE wakes up, shows the message and gives one soft buzz.
- **The one button is COPY:** one press sends the message back to the site, where it appears as a row in the user's **Log** tab. That makes the device a two-way tool rather than a display only.
- **Sensors:** temperature, humidity, pressure, air quality (VOC) and UV are measured where the user actually is, and that data feeds the site's weather and self-care logic.

## 2. Requirements and where each one is covered

| # | Requirement (as given) | How it is met | Where |
|---|---|---|---|
| 1 | PCBWay | PCB fabrication, PCBA, stainless CNC and polishing all ordered through PCBWay, so one vendor handles everything | 08, 02 |
| 2 | Pager-like notification from an AI-powered site | The server queues AI notifications; the device wakes at a `next_wake_at` the server chooses, then shows the message and buzzes | 06, 05 |
| 3 | Two-part stainless body | 316L front lid plus a polished back tub, joined by 4 × M1.0 Torx screws and an FIP gasket | 03 |
| 4 | Flat square, 4 × 4 cm, 5 mm high | 40.0 × 40.0 × 5.0 mm with 0.3 mm edge chamfers. The Z-stack budget is in doc 03 §3 | 03 |
| 5 | Camera | HM0360 low-power camera on the front face. Used for QR pairing and "Snap to Log" | 04, 05 |
| 6 | LOT API connector | `/api/device/v1/*` with device tokens, JSON or CBOR | 06, `connector/` |
| 7 | Results as PDF manuals | Every document here is rendered to PDF in `pdf/` | `tools/` |
| 8 | Compress the information in each session | (a) on the device: CBOR payloads and delta sync; (b) in the program: a COMPRESSED STATE block in each session report | 11, 06 |
| 9 | Firmware documents | Doc 05 plus the reference source in `firmware/` | 05 |
| 10 | Software to connect with the firmware | Server plugin, SQL migration, and a device simulator for testing | 06, `connector/` |
| 11 | Separate documents | 11 standalone documents, each with its own PDF | this folder |
| 12 | Charger | A magnetic pogo dock (USB-C), included in the box | 07 |
| 13 | 100-unit run | PCBWay batch plan, QA and yield buffer: build 110, ship 100 | 08 |
| 14 | Weather sensor | Bosch BME688 (T / RH / P / gas) plus LTR-390UV (UV index) | 04 |
| 15 | AI-grade off-the-shelf sensors | BME688 with Bosch BSEC2 AI; BHI260AP self-learning IMU | 04, 02 |
| 16 | Button as "Copy", with a signal back to the Log tab | Short press → `POST /events {type:"copy"}` → `Log.create({event:"device_copy"})` | 06 §5 |
| 17 | One side polished stainless | Back tub, mirror polish to Ra ≤ 0.05 µm (#8 finish) | 03 |
| 18 | Other side: camera, screen, button | Front lid holds a sapphire window (screen + camera) and a stainless button cap | 03 |
| 19 | Wireless charger | Qi 5 W receiver (BQ51050B). **This conflicts with #17.** See decision D1 | 07 |

## 3. Decisions needed from Vadik

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| **D1** | Back face vs. wireless charging | **A.** Solid polished steel back with a magnetic pogo dock, no Qi. **B.** Polished steel back with a Ø22 mm mirror-polished black zirconia disc and real Qi through it. **C.** Make both SKUs | **B** for the 100-unit run. Steel blocks Qi: a solid steel back heats up and does not charge. The zirconia disc keeps a mirror look. Also ship the dock (A) as the "Charger" (#12) |
| **D2** | Thickness | 5.0 mm (≈ 90–110 mAh, very tight) vs. 6.0 mm (≈ 180 mAh, easier to build) | Build EVT at 6.0 mm and DVT at 5.0 mm. Freeze the thickness after the DVT battery-life test |
| **D3** | Radio | Certified module ESP32-S3-MINI-1 vs. chip-down ESP32-S3 | **Module** for 100 units. It reuses Espressif's FCC/CE modular grant and saves about $10–15k in certification |
| **D4** | Front window | Sapphire 0.4 mm vs. Gorilla Glass 0.4 mm | Sapphire: it resists scratches, which suits a pocket object |
| **D5** | Delivery latency | "Calm" mode (server-scheduled wake, ~10–14 days battery) vs. "Live" mode (Wi-Fi always connected, ~1.5 days) | Calm by default, Live as a user setting |

## 4. Out of scope for P1

- Cellular or LoRa: Wi-Fi only. On the go, the device uses the phone's hotspot.
- A phone app. Pairing happens on lot-systems.com using a QR code read by the camera, or a 6-digit code.
- Microphone and speaker.

## 5. Team and vendors

| Role | Who | Notes |
|---|---|---|
| Product / brand | Vadik (S-2) | Final say on D1–D5 |
| EE + layout | Contract EE (Upwork / PCBWay design service) | 4-layer, 0.6 mm board, rigid-flex optional |
| Mechanical | Contract ME | 316L DFM with PCBWay CNC |
| Firmware | Claude Code sessions plus a human reviewer | ESP-IDF v5.3+ |
| Server connector | Claude Code sessions in this repo | Fastify + Sequelize, same stack as `src/server` |
| Fab / PCBA / CNC | PCBWay | One vendor |
| Battery | Grepow or a PowerStream-class custom LiPo | Requires UN38.3 + IEC 62133 |
| Certification | Third-party lab (pre-scan at DVT) | FCC SDoC + modular grant reuse; CE RED |
