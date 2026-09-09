<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Computer — Hardware Documentation

Planning documents for LOT's first physical product: a stainless steel
notification companion to the LOT Memory Engine and Quantum Operating
System. Status: **concept / pre-prototype** — see
[`LOT-COMPUTER-SPEC.md`](./LOT-COMPUTER-SPEC.md) §04 for the one open
engineering decision (display/sensor height vs. camera) that gates moving
into Phase 1 of the roadmap.

## Documents

| Document | Covers |
|---|---|
| [`LOT-COMPUTER-SPEC.md`](./LOT-COMPUTER-SPEC.md) | Industrial design, electronics stack, manufacturing partner, the height-vs-camera risk |
| [`LOT-COMPUTER-BOM.md`](./LOT-COMPUTER-BOM.md) | Full components buying list, supplier links, per-unit and 100-unit costs |
| [`LOT-COMPUTER-ROADMAP.md`](./LOT-COMPUTER-ROADMAP.md) | Phased plan from open decisions through the 100-unit production run |
| [`LOT-COMPUTER-FIRMWARE.md`](./LOT-COMPUTER-FIRMWARE.md) | On-device firmware architecture (ESP32-S3) |
| [`LOT-COMPUTER-API.md`](./LOT-COMPUTER-API.md) | Proposed `/api/device/*` server routes connecting firmware to lot-systems.com |
| [`LOT-COMPUTER-MANUAL.md`](./LOT-COMPUTER-MANUAL.md) | Source for the printed/PDF user manuals (setup, care, privacy, specs) |
| `LOT-Computer-User-Manual.pdf` | Full manual, generated from the source above |
| `LOT-Computer-Quick-Start.pdf` | One-page setup card, generated from the same source |

## Reading Order

1. `LOT-COMPUTER-SPEC.md` — what the object is and the physical/electronics
   design.
2. `LOT-COMPUTER-BOM.md` — what it costs to build, and from whom.
3. `LOT-COMPUTER-ROADMAP.md` — the order to build it in.
4. `LOT-COMPUTER-FIRMWARE.md` + `LOT-COMPUTER-API.md` — the two halves of
   the software that make the object do anything, kept as separate
   documents by design.
5. `LOT-COMPUTER-MANUAL.md` — what ships in the box.
