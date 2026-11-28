# LOT DEVICE-01 · "SQUARE" — Hardware Program Index

A 40 × 40 × 5 mm stainless steel pager for LOT. It shows the AI's own notifications from lot-systems.com, and its **Copy** button sends the notice back to the user's Log tab.

| # | Document | PDF |
|---|---|---|
| 01 | [Product plan + requirements trace](01-PLAN.md) | [pdf](pdf/01-PLAN.pdf) |
| 02 | [Components buying list (BOM) + 100-unit cost](02-BOM.md) | [pdf](pdf/02-BOM.pdf) |
| 03 | [Mechanical: 2-part stainless body](03-MECHANICAL.md) | [pdf](pdf/03-MECHANICAL.pdf) |
| 04 | [PCB + PCBWay production](04-PCB-PCBWAY.md) | [pdf](pdf/04-PCB-PCBWAY.pdf) |
| 05 | [Firmware specification](05-FIRMWARE.md) | [pdf](pdf/05-FIRMWARE.pdf) |
| 06 | [LOT API connector (software ↔ firmware)](06-SOFTWARE-CONNECTOR.md) | [pdf](pdf/06-SOFTWARE-CONNECTOR.pdf) |
| 07 | [Wireless charger](07-CHARGER.md) | [pdf](pdf/07-CHARGER.pdf) |
| 08 | [Roadmap + analysis + risks](08-ROADMAP.md) | [pdf](pdf/08-ROADMAP.pdf) |
| 09 | [User manual](09-USER-MANUAL.md) | [pdf](pdf/09-USER-MANUAL.pdf) |
| — | [Protocol simulator](software/device-sim.mjs) | `node docs/hardware/lot-device-01/software/device-sim.mjs` |
| — | Full manual (all of the above) | [pdf](pdf/LOT-DEVICE-01-FULL-MANUAL.pdf) |

PDFs are rebuilt with `bash docs/hardware/lot-device-01/build-pdf.sh` (needs pandoc and Playwright Chromium).

---

## Compressed session ledger (brief item 8)

Each scheduled session adds one line. Read this first. It is the whole program state, compressed.

```
S01 2026-11-28  PHASE 0 DONE. 9 docs + 10 PDFs + sim (CONTRACT OK).
                Arch: ESP32-S3 · Sharp MemLCD 1.26" · BME688 · HM0360 · BQ51050B Qi · 110 mAh.
                Findings: F-1 steel blocks Qi+RF → charge/antenna through front glass;
                F-2 5.0 mm needs chip-down (+$10–25k cert) vs 6.0 mm module; F-3 MOQs; F-5 no device API on server.
                Est. $126/unit · program $20–45k. Next: Phase 2 server connector + Phase 1 dev-kit parts.
```
