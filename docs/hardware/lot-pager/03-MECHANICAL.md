# LOT® PAGER — Mechanical Design

## 1. Body
Two stainless parts, **316L** (non-magnetic, skin-safe, takes mirror polish):

- **Back plate** — flat, 40 × 40 mm, 0.8 mm. Polished (Ra ≤ 0.05 µm, #8 mirror). Nothing on it but laser-etched LOT® mark (optional, outside polished area).
- **Front shell** — 40 × 40 mm, tray form, corner radius R3, wall 0.6 mm, with cut-outs: display window, camera window, button.

Joint: laser-welded seam (sealed, IP54 target) **or** 4 × M1.2 hidden screws + silicone gasket (serviceable; recommended for P3/P5). Decide at EVT.

## 2. Dimensions
| | v0 (build this) | v1 (stretch) | Original brief |
|---|---|---|---|
| X × Y | 40 × 40 mm | 40 × 40 | 40 × 40 |
| Z | **9 mm** | 6.5 mm | 5 mm |

Why 5 mm fails: see 01 §4. Camera module height alone is ≥5 mm.

Front layout (looking at side B, 40 × 40):
- Display: 1.3" window ~ 25 × 25 mm, upper-centre.
- Camera: Ø3.5 mm window, top-right corner, 4 mm from edges, sapphire or Gorilla-type glass.
- Button: lower-centre, 8 mm round, 0.3 mm travel dome through a thin steel membrane (or plastic insert).
- Ambient-light pinhole next to camera.

## 3. Polishing
CNC → bead blast → mechanical polish → electro-polish. Spec Ra on the drawing. Polish is the most expensive and the most variable step: order a few extra back plates. Fingerprints show; this is the product look.

## 4. Manufacturing route
| Route | 1–10 | 100 | Notes |
|---|---|---|---|
| CNC 316L (PCBWay CNC, or any shop) | ✓ | ~$25–45 / set | Best for EVT/DVT |
| MIM 316L + polish | ✗ | ✓ (tooling $3–8k) | Consider only for 1000+ |
| Sheet metal + deep draw | ✗ | ✗ | Wall too thin for mirror finish |

## 5. Wireless charging through steel
Qi does not work through ≥0.3 mm of stainless. Options (pick at EVT):
1. **Non-metal charging window** on side B (plastic/ceramic ring around the screen) with the coil behind it — device charges screen‑down on the pad. *Recommended for v0.*
2. Ferrite-backed coil under an ultra-thin (≤0.2 mm) titanium/non-magnetic face — poor efficiency and heating.
3. Magnetic pogo pins (loses "wireless").

The brief says one side is polished steel; with option 1 that side (A) stays steel and the device charges face-down on the pad with side B against it. Note this in 06 as the "charging orientation".

## 6. RF through steel
A fully metal body is a Faraday cage. Plan: antenna on a plastic or ceramic window strip along one edge (≥ 8 × 3 mm) with u.FL → FPC antenna; tune on the real enclosure. Do not rely on the PCB antenna.

## 7. Thermal
ESP32‑S3 + display + radio ≈ 0.5–0.9 W peak. Steel body is a good spreader; keep Wi‑Fi duty < 5 % and ≤ 40 °C case.
