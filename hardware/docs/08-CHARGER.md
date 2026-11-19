# 08 · Charger: wireless (Qi) + magnetic dock fallback

*Session 01 · 2026-11-19*

## 1. The problem

Requirements 12 and 19 ask for a wireless charger. The body is stainless steel, and **steel blocks inductive charging**: the field makes eddy currents in the metal, which heat it, and charging fails or stops. A Qi coil behind the polished steel back **will not work**.

## 2. Primary solution: Qi through the front glass

| Item | Choice |
|---|---|
| Receiver IC | TI **BQ51050B**: Qi (WPC) receiver with a built-in Li-ion charger, so no separate charger chip is needed |
| Coil | Ø20–22 mm receiver coil with ferrite (Würth WE-WPCC family), behind the memory LCD under the glass |
| Pad | Any Qi 5 W pad. Ship a rebranded 5 W pad in the box |
| How you charge | Lay it **face down** on the pad. A thin microfiber top on the pad protects the glass |
| Charge current | ~150 mA (1C) for a 150 mAh cell. About 1.5 h to full |
| Protection | NTC on the cell to stop charging above 45 °C. FOD (foreign-object detection) handled by the pad |

Check in EVT: the coil–LCD stack must leave the Sharp LCD's glass undisturbed, and no steel can sit within about 2 mm of the coil edge (the frame lip). If coupling is too weak, enlarge the glass to the full 40 × 40 face with the steel only as a side band. That still reads as a "flat silver square" from the polished back.

## 3. Fallback: magnetic pogo dock (both footprints on EVT)

- Two flush gold-plated contacts (VIN, GND) on the bottom edge of the frame, in insulated inserts, plus two 3 × 1 mm N52 magnets.
- A small steel puck dock with a USB-C input and a 5 V → 4.2 V charge path. The BQ51050B's AD input or a small linear charger handles it.
- It works no matter how much steel there is. It's sturdier, but shows two dots on the edge.

## 4. Decision D-03

Keep both on the EVT board. Choose for DVT after the 72-hour test (coupling efficiency, temperature rise ≤ 10 °C, charge time).

## 5. Custom LOT charger (later, optional)

A 316L puck with a soft top and a Qi 5 W transmitter inside (e.g. a standard WPC A11-type transmitter module) and a laser-etched LOT mark. It's a PCBWay CNC + PCBA job that can reuse the same vendor flow. About $25–35 per unit at 100.
