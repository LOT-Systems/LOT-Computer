# LOT-HW-01 · TILE

```
================================================================================
LOT SYSTEMS CORPORATION · COSMO® CIA
HARDWARE PROGRAM  LOT-HW-01  "TILE"
A FLAT SILVER SQUARE THAT RECEIVES THE SITE AND WRITES BACK TO THE LOG
================================================================================
DOCUMENT    HW-INDEX
ISSUE       2026.11.25  (SESSION HW-01)
CLASS       INTERNAL / BUILD
OWNER       Vadik — Inventor
STATUS      PLAN + EVT DESIGN PACKAGE (no hardware built yet)
================================================================================
```

TILE is a 40 × 40 × 5 mm two-part stainless steel object. One face is
mirror-polished stainless steel. The other face carries a reflective
always-on screen, a camera and one button labelled **Copy**. It works like a
pager: lot-systems.com sends short autonomous notifications ("Coffee time.")
and the TILE shows them. Press **Copy** and the notification, along with a
weather snapshot from the on-board sensor, is written to the user's **Log** tab.

## Document set (separate documents, requirement 11)

| #  | Document                                              | Purpose                                   |
|----|-------------------------------------------------------|-------------------------------------------|
| 01 | [PLAN](docs/01-PLAN.md)                               | Product definition, architecture, traceability of the 19 requirements |
| 02 | [BOM — BUYING LIST](docs/02-BOM-BUYING-LIST.md)       | Components, sources, links, cost for 1 / 10 / 100 units |
| 03 | [MECHANICAL](docs/03-MECHANICAL-ENCLOSURE.md)         | Two-part stainless body, 5 mm stack-up, finishes |
| 04 | [ELECTRICAL + PCBWAY](docs/04-ELECTRICAL-PCBWAY.md)   | Block diagram, power, PCB spec, PCBWay order sheet |
| 05 | [FIRMWARE](docs/05-FIRMWARE.md)                       | Firmware architecture, states, power, OTA |
| 06 | [SOFTWARE CONNECTOR](docs/06-SOFTWARE-LOT-API-CONNECTOR.md) | LOT Device API, pairing, Copy → Log, compression |
| 07 | [CHARGER](docs/07-WIRELESS-CHARGER.md)                | Wireless charging dock |
| 08 | [ROADMAP + RISK ANALYSIS](docs/08-ROADMAP-RISK.md)    | Phases, gates, dates, risks |
| 09 | [100-UNIT RUN](docs/09-PRODUCTION-100-UNITS.md)       | Manufacturing, test jig, QA, logistics |
| 10 | [USER MANUAL](docs/10-USER-MANUAL.md)                 | What ships in the box |

PDF manuals (requirement 7) are in [`manuals/`](manuals/), one per document plus
a combined `LOT-HW-01-TILE-COMPLETE.pdf`. Rebuild them with
`scripts/build-pdfs.sh` (see below).

## Code

| Path                     | What                                                          |
|--------------------------|---------------------------------------------------------------|
| `firmware/`              | ESP32-S3 firmware skeleton (PlatformIO / Arduino). Not yet compiled against hardware. |
| `connector/`             | `lot-device.mjs` — reference client + mock LOT Device API. Runs with plain Node, no dependencies. |

```
node hardware/connector/lot-device.mjs selftest   # mock server + emulated TILE, end to end
```

## Rebuilding PDFs

```
bash hardware/scripts/build-pdfs.sh
```

Needs `pandoc` and the Playwright Chromium that ships in the build container.
