# 07 · Charger — Wireless and Dock

## 1. The physics problem (read first)

Qi charging uses a magnetic field at about 110–205 kHz. **Solid stainless steel at 0.5 mm blocks it.** Eddy currents in the plate:
- turn the charging power into heat (the plate can pass 45 °C within minutes, which exceeds skin-contact limits);
- trigger Qi foreign-object detection, so a certified pad stops charging.

So "fully polished steel back" (#17) and "wireless charger" (#19) cannot both be met as stated. Options:

| Option | Back face | Charging | Feel | Risk |
|---|---|---|---|---|
| **A** | 100% polished steel | Magnetic **pogo dock** (2 gold contacts on the lower chamfer, USB-C puck) | Snaps on like a watch | Low |
| **B (recommended)** | Polished steel with a **Ø22 mm mirror black zirconia disc** in the centre | **Real Qi 5 W** on any pad; the dock still works | A black "lens" in the mirror, an intentional detail | Medium (zirconia bonding, alignment) |
| C | Polished steel with a laser-cut slot pattern | Weak Qi (~30–40% efficiency) | Visible lines | High: heat |
| D | PVD "steel-look" coating on a ceramic back | Qi works | Not real steel | Medium; brand concern |

**Recommendation:** B. The box includes the **LOT Dock** (option A hardware) as the "Charger" (#12), and the device also charges on any Qi pad (#19).

## 2. Qi receiver design (option B)

- **BQ51050B**: Qi v1.2 receiver and Li-ion charger in one part; charge current set to 0.5C ≈ 55 mA (110 mAh cell); JEITA thermal limits from an NTC on the cell.
- Coil Ø20–22 mm with a 0.2 mm ferrite sheet, centred under the zirconia disc. The steel around it is at least 1 mm from the coil's outer turn.
- Alignment: a 6 × 1 mm N52 ring magnet is **optional**. It helps MagSafe-style pads but can trigger foreign-object detection on some basic pads, so test both at EVT.
- Full charge time ≈ 2.5 h (wireless is slow at small currents, which is fine for a pager).

## 3. LOT Dock (option A, ships in the box)

```
   ┌──────────────────────────┐
   │   ▪ ▪   (2 pogo receptacles, 5 V / GND)  │  CNC aluminium puck Ø50×8 mm, anodized
   │  magnets × 2 (align)     │  USB-C input, 5 V 500 mA, polyfuse + TVS
   └──────────────────────────┘  silicone foot ring
```
- The device side has 2 Mill-Max-style flush gold contacts on the lower edge chamfer, wired into the BQ51050B AD (wired) input. Wired input has priority over wireless.
- Reverse-polarity protection uses an ideal-diode FET, and the contacts are dead (no voltage) unless the dock senses the device (ID resistor).

## 4. Test plan (EVT)

| Test | Pass |
|---|---|
| Qi through zirconia on 3 pads (generic, Apple-MagSafe-compatible, Samsung) | Charges, case ≤ 41 °C (IEC 62368 touch limit) |
| Qi on solid steel (control) | Expected to fail: confirms why option B is needed |
| Dock, 1,000 insertions | Contact resistance < 100 mΩ |
| Charge with the screen updating | No display artifacts |
