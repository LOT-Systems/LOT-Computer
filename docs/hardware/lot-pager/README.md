<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — hardware program

A flat silver square that receives short autonomous lines from lot-systems.com.
It has a mirror-polished stainless back, a memory-LCD screen, a camera, and one
**COPY** button that sends the line back to your Log. It charges wirelessly on the LOT puck.

| # | Document | PDF |
|---|----------|-----|
| 00 | [State capsule — read first](00-STATE-CAPSULE.md) | [pdf](pdf/00-STATE-CAPSULE.pdf) |
| 01 | [Plan, roadmap, risks](01-PLAN-AND-ROADMAP.md) | [pdf](pdf/01-PLAN-AND-ROADMAP.pdf) |
| 02 | [BOM and buying list](02-BOM-BUYING-LIST.md) | [pdf](pdf/02-BOM-BUYING-LIST.pdf) |
| 03 | [Mechanical and enclosure](03-MECHANICAL-ENCLOSURE.md) | [pdf](pdf/03-MECHANICAL-ENCLOSURE.pdf) |
| 04 | [PCB and PCBWay ordering](04-PCB-PCBWAY.md) | [pdf](pdf/04-PCB-PCBWAY.pdf) |
| 05 | [Firmware](05-FIRMWARE.md) | [pdf](pdf/05-FIRMWARE.pdf) |
| 06 | [Software connector and LOT API](06-SOFTWARE-CONNECTOR-LOT-API.md) | [pdf](pdf/06-SOFTWARE-CONNECTOR-LOT-API.pdf) |
| 07 | [User manual](07-USER-MANUAL.md) | [pdf](pdf/07-USER-MANUAL.pdf) |
| 08 | [Production run, 100 units](08-PRODUCTION-100-UNITS.md) | [pdf](pdf/08-PRODUCTION-100-UNITS.pdf) |

**Code:**

- [`hardware/lot-pager/firmware`](../../../hardware/lot-pager/firmware): PlatformIO firmware for the ESP32-S3.
- [`hardware/lot-pager/connector`](../../../hardware/lot-pager/connector): host connector, device simulator and provisioning tool.

**Session reports:** `docs/LOT-SR-YYYYMMDD-HW-NN.md`, one per session.

**PDFs:** regenerate them with `node scripts/hardware/build-pdfs.mjs`.
