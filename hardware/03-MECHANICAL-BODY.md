# 03 · Mechanical Design — Stainless Body

## 1. Target
Silver flat square **40 × 40 mm**, nominal **5 mm** height, two stainless-steel parts:
- **Part A — Back (mirror):** polished 316L plate, #8 mirror finish, outside face unmarked except laser-etched serial on inside.
- **Part B — Front (bezel/tray):** machined 316L tray holding PCB, battery; openings for screen, camera lens, button.
Joined by 4 micro-screws (M1.0, hidden under bezel lip) or laser-weld (production, DVT+).

## 2. Thickness stack — the honest numbers
| Layer | mm (typ.) |
|---|---|
| Back plate | 0.6 |
| Battery (LiPo 3.0) | 3.0 |
| PCB (4-layer) | 0.8 |
| Screen + cover glass (front) | 1.6 + 0.5 |
| Front bezel wall | 0.5 |
| Clearances | 0.3 |
| **Stack, battery under PCB** | **≈ 7.3–7.5 mm** |

- Tallest items: camera OV2640 module (≈ 4 mm), ESP32-S3-WROOM (3.2 mm), battery.
- **EVT target: 7.5 mm.** Not 5.
- **DVT path to ~6 mm:** bare-die ESP32-S3 (0.9 mm), camera CSP on rigid-flex beside (not under) the battery, 2.5 mm cell, 0.4 mm back plate, 0.3 mm glass, side-by-side layout (battery next to PCB).
- **5 mm is achievable only without camera** (screen + 2.5 mm cell + thin PCB) — recommend offering as "LOT Pager Slim" variant.
- Decision for Vadik: keep camera at ~6–7.5 mm, or ship 5 mm without camera?

## 3. RF and wireless-charging windows (critical, R2)
Stainless steel is a conductor: Wi-Fi/BLE antenna and Qi coil inside a closed steel box will not work.
- **Antenna:** keep the ESP32 antenna at a PCB edge facing a **1.0–1.5 mm dielectric seam** (PEEK/PC gasket) running along one side of the case between Part A and Part B. Alternative: ceramic chip antenna + front glass window area. Verify with VNA/range test.
- **Qi coil:** place ⌀ 25–28 mm coil behind a **ceramic or sapphire disc** inset in the back mirror (circular, flush-polished, looks like a deliberate jewel). Cost ≈ $2–6. Mirror remains "polished stainless" around it.
- **Fallback if Qi fails:** two gold pogo pads on the seam for a magnetic dock — still "wireless" to the user (no cable), but not Qi.
- Test plan (P3): aluminium shell with 3 window variants; measure RX power at 5 mm coil spacing, RSSI at 3 m.

## 4. Front face layout (40 × 40)
```
+----------------------------+
|  o cam   o LED    ( ambient)|   camera lens 4 mm, top-left
|                             |
|   +--------------------+   |
|   |  1.54" screen      |   |   active ≈ 31×31, glass
|   |  "Coffee time!"    |   |
|   +--------------------+   |
|                      [ ● ] |   Copy button, bottom-right (≥ 6 mm dia, 0.3 mm travel)
+----------------------------+
```
Button: flush metal dome over tact switch **or** side-mounted tact; waterproofing via silicone membrane (IP54 goal).

## 5. Materials & finish
- **316L** (corrosion-resistant, skin-safe, polishes well). 304 acceptable for EVT.
- Back: grind → polish → #8 mirror; optional PVD anti-fingerprint.
- Front: bead-blast satin vs back mirror (contrast), or mirror both (brand decision, see brand.lot-systems.com).
- PCBWay CNC supports stainless + polishing; request DFM review for 0.5 mm walls (thin; consider 0.6 min).

## 6. Drawings to produce (HW-02/03)
STEP model (Fusion/FreeCAD), 2D drawings with tolerances ±0.05, window insert cut-outs, gasket profile, assembly exploded view.
