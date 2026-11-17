---
title: "LOT PAGER — 09 · Manufacturing: 100-Unit Run"
subtitle: "Hardware programme HW-01 · Rev 0.1 · 2026-11-17"
---

# LOT PAGER — 09 · MANUFACTURING · 100-UNIT RUN

```
DOCUMENT   HW-01 / 09-MFG
BUILD QTY  110 PCBA (100 + 10 spares) · 105 enclosure sets · 100 packed units
SERIALS    LP-0001 … LP-0100 (laser-etched inside the back plate, stored in NVS)
```

## 1 · Flow

```
PCBWay PCBA (panel 3×3) ──► depanel ──► FLASH + TEST jig ──► battery attach
     ──► front frame + glass bonded ──► PCBA + coil + camera fitted ──► back plate closed
     ──► FINAL TEST (Qi, Wi-Fi, COPY → staging Log) ──► 24 h soak ──► pack
```

## 2 · Test jig (pogo, bottom-side test points)

| Step | Check | Pass |
|------|-------|------|
| 1 | Power-on current | < 5 mA before flash |
| 2 | Flash factory firmware via USB pads | verify OK |
| 3 | I²C scan | 0x77 0x68 0x29 0x36 0x52 present |
| 4 | LCD checkerboard | operator OK |
| 5 | Camera frame grab | non-black, focus target readable |
| 6 | Wi-Fi join to jig AP, RSSI | ≥ −60 dBm at 0.5 m |
| 7 | Deep-sleep current | ≤ 20 µA |
| 8 | Write serial + pair with factory account | `GET /frame` 200 |

The same `lot-pager-cli simulate` path is used to verify the staging server during the run.

## 3 · Final test (assembled unit)

1. Place on Qi pad → CHG_N low within 5 s.
2. Press COPY → a `device_copy` row appears in the factory account's Log within 10 s.
3. Visual: polished back free of scratches under a 1000-lux light box; glass free of dust.
4. Thickness gauge: 5.00 mm max at 5 points.

## 4 · Yield & spares

- Target first-pass yield ≥ 95 %. Rework station for QFN (hot air + X-ray at PCBWay).
- 10 spare PCBAs and 5 spare enclosure sets cover yield loss and cosmetic rejects.

## 5 · Schedule (PVT window, weeks 18–24)

| Week | Activity |
|------|----------|
| 18 | Release Gerbers/BOM/STEP rev C; PCBWay quote + order; glass order |
| 19–21 | PCBWay PCBA + CNC + polishing (≈ 15 working days) |
| 22 | Incoming inspection, jig test 110 boards |
| 23 | Final assembly, final test, soak |
| 24 | Pack, ship; units appear in each user's Settings → Devices after pairing |

## 6 · Logistics notes

- Lithium cells: ship as UN3481 (battery in equipment); cells must have UN38.3 report.
- Keep PCBWay order numbers, X-ray reports and test logs per serial in `docs/hardware/lot-pager/reports/`.
