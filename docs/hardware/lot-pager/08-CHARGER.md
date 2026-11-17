---
title: "LOT PAGER — 08 · Wireless Charger"
subtitle: "Hardware programme HW-01 · Rev 0.1 · 2026-11-17"
---

# LOT PAGER — 08 · WIRELESS CHARGER

```
DOCUMENT   HW-01 / 08-CHG
RX         TI BQ51050B — Qi (WPC 1.2) receiver + Li-ion charger in one IC, 4.20 V
COIL       Ø 20 mm thin receiver coil + ferrite sheet, under the front glass
CELL       ≈ 100 mAh LiPo, ≤ 2.0 mm, PCM + 10 k NTC
```

## 1 · Receive side (in the pager)

| Item | Setting |
|------|---------|
| Charge current | ≈ 0.5 C = 50 mA (set by ILIM resistor) — gentle, cool, long cell life |
| Termination | 10 % of charge current |
| Temperature | NTC on cell; charge only 0–45 °C |
| Status | CHG_N (open-drain) → GPIO4; firmware may show a charge glyph |
| Full charge | ≈ 2–3 h from empty |

Charge face-down: the coil is under the front glass because the polished stainless back
cannot pass a Qi field (see 03-MECH §4, risk R1).

## 2 · Transmit side (the pad)

| Option | When | Cost @100 |
|--------|------|-----------|
| **A · Off-the-shelf certified Qi pad** (5–15 W, any brand) | S1 baseline — P0, EVT, PVT | ≈ $10 |
| **B · LOT puck** — 50 mm stainless puck with matte top, certified Qi TX module inside, USB-C in | Later brand upgrade | ≈ $22 |

A pager draws only ≈ 0.25 W, so any certified pad works. The small Ø 20 mm coil requires
**centring**: the LOT puck (option B) adds a shallow 40 × 40 recess so placement is always right.

## 3 · Tests (EVT/DVT)

1. Charge from 3.5 V on three different pads; time to CHG_N high.
2. Thermal: coil and steel frame ≤ 41 °C (skin-contact limit) after 30 min.
3. Foreign-object detection: coin on pad → pad must stop.
4. Misalignment: 0, 3, 5 mm offset — charging must still start at 3 mm.
5. Fallback trigger: if any test fails at DVT, switch to 2-pin magnetic pogo on the back plate.
