# LOT-01 SQUARE — LOT hardware companion

A 40 × 40 × 5 mm two-part stainless-steel pager for lot-systems.com. It shows short
autonomous notes ("Coffee time!") and has one **COPY** button that sends the moment
back to the Log tab.

| # | Document | PDF |
|---|---|---|
| 01 | [Product plan & requirements trace](docs/01-PLAN.md) | [pdf](pdf/01-PLAN.pdf) |
| 02 | [BOM & buying list (100 units)](docs/02-BOM.md) | [pdf](pdf/02-BOM.pdf) |
| 03 | [Roadmap & risk analysis](docs/03-ROADMAP.md) | [pdf](pdf/03-ROADMAP.pdf) |
| 04 | [Mechanical: 2-part 316L body](docs/04-MECHANICAL.md) | [pdf](pdf/04-MECHANICAL.pdf) |
| 05 | [Electrical & PCBWay fab pack](docs/05-ELECTRICAL-PCB.md) | [pdf](pdf/05-ELECTRICAL-PCB.pdf) |
| 06 | [Firmware design](docs/06-FIRMWARE.md) | [pdf](pdf/06-FIRMWARE.pdf) |
| 07 | [LOT API Connector (protocol v1)](docs/07-LOT-API-CONNECTOR.md) | [pdf](pdf/07-LOT-API-CONNECTOR.pdf) |
| 08 | [Companion software](docs/08-COMPANION-SOFTWARE.md) | [pdf](pdf/08-COMPANION-SOFTWARE.pdf) |
| 09 | [Wireless charger puck](docs/09-CHARGER.md) | [pdf](pdf/09-CHARGER.pdf) |
| 10 | [User manual](docs/10-USER-MANUAL.md) | [pdf](pdf/10-USER-MANUAL.pdf) |

Session reports: [`sessions/`](sessions/)

## Tools

```bash
node hardware/lot-01/tools/lot01-sim.mjs     # connector contract test (13 checks)
node hardware/lot-01/tools/build-pdf.mjs     # rebuild PDFs (needs pandoc + Playwright)
```
