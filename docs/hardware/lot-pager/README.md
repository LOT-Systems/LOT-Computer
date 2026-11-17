# LOT PAGER — Hardware Programme HW-01

A 40 × 40 × 5 mm two-part stainless steel pager connected to **lot-systems.com**.
It shows calm, autonomous notifications ("Coffee time!"), and its **COPY** button signals back to the site's **Log** tab.

| # | Document | PDF |
|---|----------|-----|
| 01 | [Plan, feasibility & roadmap](01-PLAN-AND-ROADMAP.md) | [pdf](pdf/01-PLAN-AND-ROADMAP.pdf) |
| 02 | [Components buying list (BOM) with links](02-BOM-BUYING-LIST.md) | [pdf](pdf/02-BOM-BUYING-LIST.pdf) |
| 03 | [Mechanical — two-part stainless body](03-MECHANICAL-ENCLOSURE.md) | [pdf](pdf/03-MECHANICAL-ENCLOSURE.pdf) |
| 04 | [PCB & PCBWay order spec](04-PCB-PCBWAY.md) | [pdf](pdf/04-PCB-PCBWAY.pdf) |
| 05 | [Firmware](05-FIRMWARE.md) | [pdf](pdf/05-FIRMWARE.pdf) |
| 06 | [LOT API connector](06-LOT-API-CONNECTOR.md) | [pdf](pdf/06-LOT-API-CONNECTOR.pdf) |
| 07 | [User manual](07-USER-MANUAL.md) | [pdf](pdf/07-USER-MANUAL.pdf) |
| 08 | [Wireless charger](08-CHARGER.md) | [pdf](pdf/08-CHARGER.pdf) |
| 09 | [Manufacturing — 100-unit run](09-MANUFACTURING-100-UNITS.md) | [pdf](pdf/09-MANUFACTURING-100-UNITS.pdf) |

Session reports: [`reports/`](reports/) — one full `.md` report per session.

Code:
- Server connector: `src/server/routes/device-api.ts`, `src/server/utils/device.ts`
- Log tab renderer: `src/client/components/Logs.tsx` (`device_copy`)
- Firmware: `firmware/lot-pager/`
- Host software: `firmware/lot-pager/tools/lot-pager-cli.mjs`

Rebuild PDFs: `bash docs/hardware/lot-pager/build-pdf.sh`
