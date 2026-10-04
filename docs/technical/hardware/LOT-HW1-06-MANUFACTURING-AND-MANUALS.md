# LOT-HW1 — Manufacturing and PDF Manuals (Document 06 of 06)

## 1. PCBWay order package (for EVT, repeated for 100-run)

PCBWay assembly is quoted manually after file review (typically 1–2 business days, per research; vendor page itself could not be opened from the sandbox — confirm at [pcbway.com/pcb-assembly](https://www.pcbway.com/pcb-assembly.html)).

| Deliverable | Content |
|---|---|
| Gerber + drill | 4-layer, 40×40 mm outline, 0.6–0.8 mm, ENIG |
| BOM | `LOT-HW1-BOM.csv` extended with manufacturer part numbers and approved alternates |
| Pick-and-place | centroid file from the EDA tool |
| Assembly drawing | polarity, keep-outs (antenna, Qi coil), no-fill areas |
| Stack-up note | impedance for RF trace, thickness |
| Test notes | 5 test points: 3V3, GND, BAT, VQI, UART |
| Quantity plan | EVT 10, DVT 30, PVT/run 100 (+10 % spares ESTIMATE) |

Decision: **turnkey** (PCBWay sources parts) for production; **consigned** for scarce parts (BME688, display) if lead time bites.

## 2. Steel body package

- 3D STEP files for both parts; drawing with tolerance ±0.05 mm on mating faces (ESTIMATE; confirm with shop).
- Material 316L, finish: back plate mirror polish (target spec to confirm), frame bead-blast or satin (DECISION).
- Ask for: sample set of 3 finishes, per-unit price at 10/30/100, lead time, inspection report.
- Candidate source: PCBWay CNC machining ([example project](https://www.pcbway.com/project/share/CNC_Machining_2ede75bd.html) shows 316L work); get at least one local alternate quote.

## 3. Assembly and test flow (100-run)

1. PCB assembled by PCBWay → incoming inspection (visual + continuity on 10 %).
2. Flash firmware + write serial number via jig (Doc 04 §8).
3. Functional test: display colours, button, camera capture, BME688/BMI270 read, charge-in via Qi, Wi-Fi + site round trip.
4. Cell attach, glue, seal, final assembly, leak/vent check.
5. Burn-in 24 h on charger, then PASS/FAIL label and QR (serial → device record).
6. Pack with Qi pad, quick-start card, safety sheet (lithium cell).

## 4. PDF manuals set (item 7)

These are generated **from the Markdown sources in this folder** so the PDFs never drift from the docs.

| PDF | Audience | Source |
|---|---|---|
| LOT-HW1 Engineering Pack | internal | Docs 01–06 |
| LOT-HW1 Firmware Manual | firmware engineers | Doc 04 |
| LOT-HW1 API Connector Guide | site/backend | Doc 05 |
| LOT-HW1 Quick Start (1 page) | end users | written in P4 |
| LOT-HW1 Safety & Compliance sheet | end users / lab | written in P3–P4 |

Build command (this session produced the engineering pack): `docs/technical/hardware/build-pdf.py` renders the Markdown files to `LOT-HW1-ENGINEERING-PACK.pdf` with headless Chromium.

## 5. Compression of information each session (item 8)

Each working session ends with one session report (`docs/benchmark/LOT-SR-YYYYMMDD-NN.md`), one ledger line, and lexicon/doctrine updates, per the LOT benchmark protocol. Hardware status lives in this folder; the report only records what changed.

## 6. Compliance checklist (start in P3)

- FCC Part 15 (US), CE-RED (EU) if shipped there — module-based Gen-1 reduces scope; lab confirmation required.
- UN38.3 for the lithium cell; battery protection circuit documented.
- Qi: interoperability tests on ≥ 3 pads; no Qi logo claim.
- Camera: privacy statement in the Quick Start; capture indicator documented.
- Marking: "Made in the USA" claim (used on `docs/README.md`) must match the actual build location/content — confirm before printing on the product.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
