# LOT Pager · L-01 — Hardware Program

A small steel object that sits on your desk and connects to **lot-systems.com**.
It shows short AI notifications from the site, like *"Coffee time."*, and has one
button. Pressing it sends **"Copy"** back to the site's **Log** tab.

| | |
|---|---|
| Codename | L-01 "LOT Pager" |
| Owner | Vadik — Inventor, COSMO® CIA |
| Form | 40 × 40 mm square, 5 mm target height (see stack-up risk in the plan) |
| Body | Two-part stainless steel (316L). Back: mirror-polished. Front: screen + camera + button |
| Link | Wi-Fi to the LOT API (`/api/device/v1/*`, proposed) |
| Run | 100 units. PCB + PCBA + CNC at PCBWay |
| Status | **Session 01: plan and spec.** Nothing ordered yet |

## Documents (each one is separate and has its own PDF in `manuals/`)

| # | Document | What it covers |
|---|---|---|
| 01 | [Plan](docs/01-PLAN.md) | All 19 requirements mapped to a solution, architecture, stack-up, risks |
| 02 | [Buying list (BOM)](docs/02-BOM.md) · [CSV](bom/lot-pager-bom.csv) | Parts, links, 100-unit cost |
| 03 | [Roadmap & analysis](docs/03-ROADMAP.md) | Phases, gates, timeline, budget, open decisions |
| 04 | [Mechanical: steel body](docs/04-MECHANICAL.md) | Two-part 316L body, finishes, window, vents |
| 05 | [PCB at PCBWay](docs/05-PCB-PCBWAY.md) | Board spec, PCBA order pack, ordering steps |
| 06 | [Firmware](docs/06-FIRMWARE.md) | ESP32-S3 firmware design; code in `firmware/` |
| 07 | [Software connector (LOT API)](docs/07-SOFTWARE-CONNECTOR.md) | Device protocol, pairing, Copy → Log; code in `software/` |
| 08 | [Charger](docs/08-CHARGER.md) | Wireless (Qi) charging, magnetic dock fallback |
| 09 | [Test, QA & certification](docs/09-TEST-QA.md) | Factory test, 100-unit acceptance, FCC/CE |
| 10 | [User manual](docs/10-USER-MANUAL.md) | What owners get in the box |
| 11 | [Session compression](docs/11-SESSION-COMPRESSION.md) | How each session is compressed: device, site and report |

Session reports: `docs/LOT-SR-*-HW-*.md` at the repo root `docs/` folder.

## Rebuild the PDFs

```bash
node hardware/scripts/build-pdfs.mjs      # needs pandoc + playwright (Chromium)
```

## Try the connector without hardware

```bash
node hardware/software/connector/lot-device-sim.mjs --mock
```

This starts a local mock of the proposed device API, then runs the full device
flow: pair, fetch the inbox, show a notification, press Copy, and send telemetry.
