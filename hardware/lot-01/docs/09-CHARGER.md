---
title: "LOT-01 SQUARE — Wireless Charger Puck"
subtitle: "Doc 09 · Rev A (2026-11-24)"
---

# LOT-01 — Wireless Charger Puck

## 1. Concept

A Ø50 × 8 mm puck with a soft silicone top pad and a shallow 40.4 mm square
recess. The SQUARE lies **face-down** (screen side) in the recess. This keeps the
polished mirror side facing up, and it is the only orientation that works,
because the charging antenna sits behind the front glass.

## 2. Electronics

| Block | Part | Notes |
|---|---|---|
| Poller | Renesas **PTX130W** | NFC-WLC poller, 13.56 MHz, pairs with the PTX30W in the device |
| Antenna | PCB coil ~Ø30 mm, 3–4 turns, with ferrite under it | Tuned on the PTX130W-30W eval kit at P2 |
| Input | USB-C (5 V, CC 5.1 kΩ pull-downs), TVS, 3.3 V LDO | No power-delivery negotiation needed (< 2.5 W) |
| Indicator | One white 0402 LED under a laser-drilled micro-hole | Breathing = charging, solid = full, blink = foreign object |
| FOD | Built into the NFC-WLC protocol (listener detection + power negotiation) | Stops when a coin or card is on the puck |

## 3. Charging profile (device side, BQ25120A)

* Pre-charge 9 mA to 3.0 V, then CC **45 mA (0.5 C)**, CV 4.20 V, terminate at 4.5 mA.
* 90 mAh from 10 % → 100 % in ≈ **2 h**. A 1 C option (≈ 70 min) is to be decided after the thermal test.
* NTC-guarded: no charging below 0 °C or above 45 °C.

## 4. Fallback (if R2 fails)

Qi receiver TI BQ51003 + a Ø20 mm coil behind an enlarged window, with any Qi pad.
Or as a last resort, two magnetic pogo pins on the bottom edge (then the charger
is not wireless, which contradicts brief item 19).

## 5. Certification

The puck is an intentional radiator at 13.56 MHz: FCC Part 15.225/18 (with the
lab's guidance), CE RED. Test it in the same lab session as the device.
