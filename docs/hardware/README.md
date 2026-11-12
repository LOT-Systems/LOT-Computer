# LOT-01 · Hardware program

A 40 × 40 mm stainless-steel pager for lot-systems.com: screen, camera, weather
sensor, one COPY button that writes to the Log tab, Qi wireless charging.

| ID    | Document | PDF |
|-------|----------|-----|
| HW-00 | [Plan and roadmap](LOT-01-00-PLAN-AND-ROADMAP.md) | [pdf](pdf/LOT-01-00-PLAN-AND-ROADMAP.pdf) |
| HW-02 | [BOM / buying list](LOT-01-02-BOM-BUYING-LIST.md) · [CSV](../../hardware/bom/LOT-01-BOM-revA.csv) | [pdf](pdf/LOT-01-02-BOM-BUYING-LIST.pdf) |
| HW-03 | [Mechanical enclosure](LOT-01-03-MECHANICAL-ENCLOSURE.md) | [pdf](pdf/LOT-01-03-MECHANICAL-ENCLOSURE.pdf) |
| HW-04 | [Electrical design](LOT-01-04-ELECTRICAL-DESIGN.md) | [pdf](pdf/LOT-01-04-ELECTRICAL-DESIGN.pdf) |
| HW-05 | [Firmware](LOT-01-05-FIRMWARE.md) | [pdf](pdf/LOT-01-05-FIRMWARE.pdf) |
| HW-06 | [LOT API connector](LOT-01-06-LOT-API-CONNECTOR.md) | [pdf](pdf/LOT-01-06-LOT-API-CONNECTOR.pdf) |
| HW-07 | [Manufacturing, 100 units](LOT-01-07-MANUFACTURING-100-UNITS.md) | [pdf](pdf/LOT-01-07-MANUFACTURING-100-UNITS.pdf) |
| HW-08 | [Owner's manual](LOT-01-08-USER-MANUAL.md) | [pdf](pdf/LOT-01-08-USER-MANUAL.pdf) |

Session reports: [sessions/](sessions/) · Code: [`hardware/`](../../hardware/)

Rebuild PDFs: `node hardware/tools/render-pdfs.mjs` (needs pandoc + Playwright Chromium).
Protocol test: `node hardware/software/simulator/lot01-sim.mjs`.
