# LOT DEVICE-01 — Wireless Charger

**Doc:** HW-07-CHG · **Rev:** A · **Date:** 2026-11-28

## 1. Principle

The device charges **face-down**, because the Qi receiver coil sits under the front glass (finding F-1). The polished back is solid steel and **must never face a charger**. It would heat up and not charge. Firmware detects "metal heating without charge current" and shows `FLIP ME.` on the screen.

## 2. Receiver (in the device)

- BQ51050B: a Qi receiver plus Li-ion charger in one chip. Set the charge current to **0.5 C ≈ 55 mA** for a 110 mAh cell, which is about 2.5 h from empty to full.
- A flat coil around the screen opening, with a 0.1–0.2 mm ferrite sheet behind it.
- Temperature: an NTC on the BQ51050B TS pin. Charging stops above 45 °C.

## 3. Charger options

| | Option 1: off-the-shelf pad | Option 2: LOT puck (recommended for the 100-unit run) |
|---|---|---|
| What | Any Qi-certified 5 W pad, with a LOT sleeve or sticker | A 45 × 45 × 8 mm 6061 aluminium puck, bead-blasted, with a 0.6 mm recess the device drops into |
| Electronics | Included | Off-the-shelf certified Qi TX module (5 V, ≥ 5 W class) + USB-C input |
| Alignment | Manual | Mechanical recess, plus an optional small magnet under the recess edge (316L is non-magnetic, so a thin steel target disc inside the device would be needed: an option for DVT) |
| Cost @100 | ~$6 | ~$14 |
| Risk | Poor alignment with a small coil | The aluminium top must have a non-metal window over the coil (POM/glass insert). **Same eddy-current rule as the device.** |

Puck top: a 0.5 mm glass or POM insert Ø32 mm over the TX coil. Only the aluminium rim and base are metal.

## 4. Cable and power

- USB-C (5 V/1 A) in. Include a 1 m braided USB-C to USB-C cable. A power brick is optional and not included, to avoid regional plug variants.

## 5. Tests

1. Charge current is ≥ 50 mA with the device centred, and ≥ 30 mA at 3 mm offset.
2. Steel bezel temperature stays ≤ 40 °C after a 2 h charge at 25 °C ambient.
3. Foreign object detection: a coin on the pad → the TX stops. This comes from the certified Qi TX module.
