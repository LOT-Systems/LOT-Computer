# LOT·01 — Charger

## Why the device charges face-down
Stainless steel shields and heats in a Qi field, so the receiver coil sits **behind the front glass and display**, with a ferrite sheet between the coil and the PCB. You charge LOT·01 by laying it **screen-down** on the pad. The polished back faces up, like a mirror tile on the desk.

## v1 (100-unit run): bundled off-the-shelf pad
| Requirement | Value |
|---|---|
| Standard | Qi (WPC) certified, BPP 5 W |
| Surface | Soft silicone or fabric top (protects the glass), ≥ 50 mm Ø |
| Input | USB-C, 5 V / 2 A adapter **not** bundled (or bundle a 10 W one, +$4) |
| Foreign-object detection | Required (the steel back must not trigger FOD → test at EVT!) |
| Finish | Silver/white or matte black, unbranded OEM pad with a LOT sticker or laser logo |

**EVT test:** check 5 popular Qi pads. Measure charge current, coil temperature and whether FOD trips because of the steel Part A sitting behind the coil and ferrite. Only pads that pass go on the approved list.

## v2: LOT Puck (post-100)
- 316L stainless puck, 45 × 45 × 6 mm, with a recessed 40.4 × 40.4 mm pocket so the device self-aligns.
- TX: NXP MWCT1013 or ST STWBC86 5 W reference design, with a USB-C input.
- Status: one small white LED, or none, with a slow "breath" on the device's memory LCD while charging.

## Charging in firmware
- CHG_STAT low → state **CHARGING**: screen shows `◐ 63%`, polling every 5 min, OTA allowed.
- BQ51050B ends the charge at 4.20 V. The NTC on the cell stops charging outside 0–45 °C.
- Full charge from empty at ~2.5 W effective is about **45–60 min** for 100 mAh.
