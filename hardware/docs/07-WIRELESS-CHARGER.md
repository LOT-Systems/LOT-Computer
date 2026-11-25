# 07 · CHARGER — WIRELESS DOCK

```
DOCUMENT  HW-07-CHG       ISSUE 2026.11.25      CLASS INTERNAL / BUILD
```

## 01 · The problem

The body is stainless steel on both sides. Qi (100–205 kHz inductive) through
steel does not work. The steel takes the energy as eddy-current heat, and the
Qi transmitter's foreign-object detection shuts down. So the charger has to
couple through the **glass face**, with the TILE lying face-down, mirror up.

## 02 · Options

| Option | How | Power | Fits 40 × 40 × 5? | Verdict |
|--------|-----|-------|-------------------|---------|
| **A. NFC Wireless Charging (NFC-WLC)** | 13.56 MHz, PTX130W poller in dock, PTX30W listener in TILE, ~24 mm flex coil under display | ≤ 250 mW (≈ 2.5 C-rate on 100 mAh: ~45 min to 80 %) | Yes, made for wearables / rings / earbuds. Coil is 0.25 mm | **Primary** |
| B. Qi (WPC) low-power | Small Rx coil (e.g. 20 mm wearable coil) + Qi receiver IC + charger | ≤ 1 W usable at this coil size | Coil + ferrite ~0.5 mm; would cost the 5 mm target | Fallback if PTX30W supply fails |
| C. Magnetic pogo puck | 2 hidden pins + magnet on side wall | 500 mA | Yes, but breaks the sealed look and is not "wireless" | Rejected |
| D. Ceramic window in Side A for Qi | Zirconia insert in mirror back | 1–2 W | Yes, but the mirror face is no longer pure steel | Rejected (violates req. 17) |

**Decision: A, NFC-WLC.** It is also an NFC link, so the dock can pass
pairing data and serial number at the factory and, later, at the user's desk.

## 03 · Dock design

```
           ┌──────────────── 60 × 60 × 9 mm ────────────────┐
           │   recessed 40.4 × 40.4 × 1.0 pocket (felt)      │
           │   ┌───────────────────────────────┐             │
           │   │   TILE face-down, mirror up    │            │
           │   └───────────────────────────────┘             │
           │   PTX130W + matching + 30 mm coil below pocket  │
           └──────────────────── USB-C ──────────────────────┘
```

| Item          | Spec                                                       |
|---------------|------------------------------------------------------------|
| Input         | USB-C 5 V, 500 mA, CC resistors for 5 V default            |
| Transmitter   | Renesas/Panthronics PTX130W NFC-WLC poller                 |
| Coil          | 30 mm PCB coil, ferrite sheet below                        |
| Indicator     | None on the dock. The TILE shows `Charging. 64%` on its screen, then `Charged.` |
| Body          | CNC aluminium, bead-blast, felt or silicone pocket (protects glass) |
| Alignment     | Pocket edges + two small magnets (TILE side: steel back is magnetic only if 400-series. 316L is barely magnetic, so use pocket alignment) |
| Safety        | PTX130W FOD, NTC in TILE, charge cut at 42 °C cell temperature |

## 04 · Charging profile (TILE side, PTX30W)

| Phase        | Setting                        |
|--------------|--------------------------------|
| Pre-charge   | < 3.0 V: 10 mA                 |
| CC           | 50 mA (0.5 C), limited by NFC-WLC power |
| CV           | 4.20 V, terminate at 5 mA      |
| Thermal      | Stop above 42 °C, resume below 38 °C |

Expect about 2.5 h from empty to full. Battery life is ~15 days, so this is
an overnight-once-a-fortnight object.

## 05 · Bring-up order

1. Buy the PTX30W + PTX130W evaluation kit (doc 02 §G) and charge a bare 100 mAh
   cell through 0.55 mm glass + the LS013B7DH03 stacked on the coil.
2. Repeat inside a dummy 316L frame to measure detuning and heat.
3. Only then freeze the coil size on the flex.
4. If transferred power through the stack is < 100 mW, switch to Option B
   and accept 6.0 mm height (risk R2).
