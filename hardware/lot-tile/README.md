# LOT TILE — hardware computer for LOT-systems.com

**Codename:** LOT TILE · **Part number:** LOT-HW-01 · **Owner:** Vadik, Inventor — COSMO® CIA
**Status:** Session 1, plan and EVT design package (2026-11-14). Nothing has been fabricated yet.

A flat, silver, 40 × 40 mm square that acts as a pager for LOT. LOT-systems.com sends
short autonomous notifications ("Coffee time!"). The device vibrates once and shows the line on a
low-power reflective screen. Pressing the single button (**Copy**) writes that line back to the
user's **Log** tab on lot-systems.com. A camera on the same face can attach a photo to the entry.
It also carries an AI-grade environmental sensor that reports local weather to the site.

```
 FRONT (brushed steel bezel)            BACK (mirror-polished stainless)
 ┌────────────────────────────┐         ┌────────────────────────────┐
 │ ┌────────────────────────┐ │         │                            │
 │ │  Coffee time!          │ │         │        ◯  (NCVM glass      │
 │ │  ·· 09:41 · 12°C       │ │         │           Qi window,       │
 │ └────────────────────────┘ │         │           mirror-silver)   │
 │                            │         │                            │
 │   ( o )          [ COPY ]  │         │          LOT®              │
 │   camera          button   │         │      laser-etched          │
 └────────────────────────────┘         └────────────────────────────┘
          40 × 40 mm · target 5.0 mm Z (EVT build 6.5 mm)
```

## Document set (one subject per document)

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Plan](docs/01-PLAN.md) | Product definition, the 19 requirements traced to design decisions |
| 02 | [Components buying list](docs/02-BOM.md) · [bom.csv](docs/bom.csv) | Every part, with quantity for 100 units, estimated price, and a buy link |
| 03 | [Mechanical](docs/03-MECHANICAL.md) | Two-part stainless body, Z-stack budget, finishes, sealing |
| 04 | [Electrical](docs/04-ELECTRICAL.md) | Block diagram, power tree, pin map, power budget |
| 05 | [Firmware](docs/05-FIRMWARE.md) | Architecture, state machine, OTA, security |
| 06 | [LOT API connector](docs/06-LOT-API-CONNECTOR.md) | Device ↔ lot-systems.com protocol, pairing, Copy → Log |
| 07 | [Manufacturing: 100 units with PCBWay](docs/07-MANUFACTURING-PCBWAY.md) | PCB, PCBA, CNC steel, assembly, test, certification |
| 08 | [Roadmap and analysis](docs/08-ROADMAP.md) | Phases, gates, risks, open decisions, budget |
| 09 | [User manual](docs/09-USER-MANUAL.md) | End-user guide (also shipped as PDF) |

Code:

- [`firmware/`](firmware/) — ESP32-S3 PlatformIO project (Arduino framework), EVT skeleton
- [`software/lotctl.py`](software/lotctl.py) — host software: USB provisioning, pairing, and a device simulator that exercises the LOT API
- [`tools/build_pdfs.py`](tools/build_pdfs.py) — renders `docs/*.md` into the PDF manuals in [`manuals/`](manuals/)

Session reports: [`docs/hardware/`](../../docs/hardware/).
