<!--
  LOT SYSTEMS CORPORATION · COSMO® CIA
  Hardware Program · LOT TILE (codename P1)
  Made in the USA | brand.lot-systems.com
-->

# LOT TILE — Hardware Program (codename P1)

A 40 × 40 × 5 mm stainless-steel pager for **lot-systems.com**.
One face is mirror-polished steel. The other face holds a small always-on screen, a camera and one button.
The site's AI sends calm, autonomous notifications ("Coffee time!"). The button is **COPY**: one press writes the current notification into the user's **Log** tab on lot-systems.com.

| # | Document | What it covers |
|---|----------|----------------|
| 01 | [Program Plan](docs/01-PROGRAM-PLAN.md) | Goals, the 19 requirements and where each is covered, open decisions |
| 02 | [Buying List (BOM)](docs/02-BOM-BUYING-LIST.md) | Every part, how many to buy, links, costs for 100 units |
| 03 | [Mechanical](docs/03-MECHANICAL.md) | Two-part 316L body, layer stack, PCBWay CNC + polish |
| 04 | [Electrical](docs/04-ELECTRICAL.md) | Block diagram, pin map, power budget, PCB spec for PCBWay |
| 05 | [Firmware](docs/05-FIRMWARE.md) | ESP-IDF design, state machine, button grammar, OTA, compression |
| 06 | [LOT API Connector](docs/06-LOT-API-CONNECTOR.md) | Device ↔ lot-systems.com API, the COPY → Log path, pairing |
| 07 | [Charger](docs/07-CHARGER.md) | Wireless (Qi) and dock charging, and the metal-back problem |
| 08 | [Manufacturing · 100 units](docs/08-MANUFACTURING-100.md) | PCBWay order flow, QA, certification, shipping |
| 09 | [Roadmap & Risk](docs/09-ROADMAP.md) | Phases, dates, risk analysis |
| 10 | [User Manual](docs/10-USER-MANUAL.md) | End-user guide (ships as a PDF) |
| 11 | [Session Compression Protocol](docs/11-SESSION-COMPRESSION.md) | How each session is compressed and carried forward |

**Code**
- `firmware/` — reference ESP-IDF firmware (C). Not compiled yet: ESP-IDF is not installed in the build sandbox.
- `connector/` — server connector for lot-systems.com (a Fastify plugin, not yet registered), the SQL migration draft, and `device-sim.mjs`, a runnable device + server simulator.
- `tools/build-pdfs.mjs` — turns `docs/*.md` into the PDF manuals in `pdf/`.

**PDF manuals:** `pdf/` (rebuild with `node hardware/lot-tile/tools/build-pdfs.mjs`).

---

## COMPRESSED STATE (carried between sessions)

```
PROGRAM   LOT TILE P1 · 40x40x5mm · 316L 2-part · 100-unit run · PCBWay
STAGE     S1 PLAN COMPLETE (2026-11-18) → next: S2 Proto-0 on dev kits
CORE      ESP32-S3-MINI-1-N4R2 · Sharp LS013B7DH03 1.28" memory LCD · 1 snap-dome button
SENSE     BME688 (T/RH/P/gas, BSEC AI) · BHI260AP (AI IMU) · LTR-390UV (UV/ALS)
CAMERA    HM0360 0.1MP low-power (primary) · OVM7692 CameraCube (alt)
POWER     ~110mAh 1.8mm LiPo · TPS63900 · MAX17048 · BQ51050B Qi RX
LINK      Wi-Fi HTTPS → /api/device/v1 · server-scheduled wake (next_wake_at) · CBOR
COPY      short press → POST /events {type:copy} → Log row event=device_copy
BUDGET    ~$147–216/unit landed · program ~$25–52k to 100 shipped
DECIDE    D1 back: solid steel+dock vs ceramic Qi window · D2 5.0 vs 6.0mm · D3 module vs chip-down
RISKS     R1 metal blocks Qi · R2 metal blocks Wi-Fi · R3 5mm Z-stack · R4 battery MOQ
```
