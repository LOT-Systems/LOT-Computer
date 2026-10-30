# 05 — Mechanical

## Envelope
40 × 40 mm square, corner radius 3–4 mm, two parts: **Front shell** (screen/camera/button) and **Back plate** (mirror polish). Material 316L (corrosion, skin contact). Back: mirror polish; front: bead blast/satin for contrast with mirror.

## Stack-up (mm, typical)
Back plate wall 0.8 · battery 3.0 · PCB with MCU module 2.4–3.0 · ferrite+coil 1.0 · OLED 1.5 · front window/wall 0.8 ⇒ **≈ 8.5–9.5 mm**. 5 mm is not reachable (R3).

## Face layout (front, 40×40)
Screen top-centre (≈26×19 panel, 22×11 active); camera lower-left Ø6; button lower-right Ø8; seam around perimeter.

## RF and Qi
- Steel shields RF: antenna zone gets a non-metal ring or window (PEEK/ceramic).
- Steel kills Qi: coil faces a non-metal window with ferrite shield; decide face (R2).
- BME688 needs a vent (0.5 mm hole + membrane) away from the heat of the MCU; apply temperature offset.

## Joining
4 × M1.2 screws or laser-weld + gasket (IP54 target). Serviceable for EVT/DVT (screws).

## Deliverables
STEP model, 2D drawings with tolerances (±0.05), polish spec (Ra), PCBWay CNC RFQ pack.
