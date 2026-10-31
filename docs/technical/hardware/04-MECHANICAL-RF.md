# LOT PLATE — Mechanical & RF (HW-04)

REV A · 2026-10-31 · ESTIMATE throughout; needs CAD + bench validation (P1/P3).

## Body
- 2 parts, 316L stainless: **FRONT** (bezel: screen window, camera hole ⌀3, button) and **BACK** (mirror-polished plate).
- 40.0 x 40.0 mm, corner R3. Seam: 4 x M1.0 torx (EVT/DVT); laser-weld not used (blocks service + would defeat isolator).
- One edge carries a 2 x 12 mm **PEEK/zirconia isolator** — the RF slot aperture for the antenna.
- Back: ⌀26 mm pocket 0.5 mm deep, glass disc bonded flush = Qi window. Polished steel around it.

## Front layout (top view, mm)
```
+--------------------------------------+ 40
|  [ camera ⌀3 ]               (LED)   |
|   +------------------------+         |
|   |   SCREEN 1.3" ~24x24   |         |
|   |   "COFFEE TIME!"       |         |
|   +------------------------+         |
|        (  COPY button ⌀6  )          |
|=== isolator slot (antenna edge) =====|
+--------------------------------------+
```
Camera, screen and button are side-by-side, not stacked, so only the tallest single item sets thickness.

## Stack budget (Z, mm) — ESTIMATE
| Layer | EVT (module) | DVT (bare die) |
|---|---|---|
| Back plate steel | 0.8 | 0.5 |
| Glass window region (same Z) | — | — |
| Battery | 3.0 | 1.6 |
| PCB | 1.0 | 0.8 |
| Tallest component (module 2.4 / QFN 0.9) | 2.4 | 0.9 |
| Display + FPC | 1.8 | 1.05 (e-paper) |
| Front cover glass | 0.5 | 0.4 |
| Gaps/adhesive | 0.3 | 0.2 |
| **Stack if all stacked** | **~9.8** | **~5.5** |
Battery under PCB, display over PCB; camera/button in the side strip (not additive). Realistic EVT ≈ 7.5–8 mm, DVT ≈ 5.5–6 mm. **5.0 mm is a stretch goal, not a promise.**

## RF
- Stainless 316L is conductive; sealed → near-zero Wi-Fi. Antenna must radiate through the isolator slot / glass.
- Use module with PCB antenna at the isolator edge, ≥6 mm keep-out of copper/steel inside; or u.FL → flex antenna on the slot (preferred for steel).
- Test (P1 coupon, P3 real): RSSI @ 1 m vs open-air; accept ≥ −10 dB loss; BLE pairing range ≥3 m.

## Qi
- Coil ⌀~25 under the glass window; ferrite sheet behind coil (between coil and PCB). Coil-to-steel gap ≥1 mm, otherwise efficiency collapses.
- Test: 5 W pad, charge current ≥100 mA at 1 mm air gap; thermal <40 °C.
- Dock magnet ring aligns plate; magnet ≠ near compass/IMU (calibrate offset).

## Finish / ingress
Back: mirror polish, optional clear PVD. Front: bead-blast bezel. IPX1 target (drip), not waterproof. 
