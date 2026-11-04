# LOT Pager — Mechanical & Industrial Design

## Form
- 40 × 40 mm square, corner radius 4 mm. Two **316L stainless** shells.
- **Back shell: mirror polished** (the "flat silver" face). **Front shell: satin**, with glass window carrying screen, camera pinhole and the COPY button.
- Seam: 0.8 mm PEEK/epoxy band = Wi-Fi antenna slot + water seal.

## Height stack-up (mm)
| Layer | v0 | v1 | Stretch (5 mm) |
|---|---|---|---|
| Back shell floor | 1.0 | 0.8 | 0.5 |
| Battery | 3.0 | 2.5 | 1.2 |
| PCB (0.8) + tallest part | 1.4 | 1.2 | 1.0 |
| Qi coil + ferrite (face-glass side) | 0.7 | 0.5 | 0.4 |
| Display module | 1.8 | 1.6 | 1.0 |
| Camera (Z) | 3.5 *(beside screen, not stacked)* | 3.0 | 1.5 |
| Glass | 0.5 | 0.5 | 0.4 |
| **Total** | **≈ 9.0** | **≈ 7.0** | **≈ 5.0 (≈15 mAh)** |

Camera sits beside the screen in X–Y, so it doesn't add to stacked height beyond its own Z.

## Face layout (front, 40×40)
Screen 27×15 mm top; camera 4 mm lower-left; COPY button lower-right (3×3 actuator under 0.3 mm flexure or small domed key); privacy LED beside lens.

## Wireless charging
Qi coil at front-glass side with ferrite toward PCB. Device charges **front-down**. Charger pad has a 40×40×1 mm pocket + magnets (N52 ⌀3×1 ×4) for alignment. Keep steel ≥ 2 mm outside the coil radius or expect large loss.

## Finishing
Back: 316L, electropolish + mirror (target Ra < 0.05 µm). Front: bead-blast satin. Optional anti-fingerprint PVD on the back.

## Files to create next
STEP model, DXF outlines for PCB (PCBWay), PCBWay CNC drawing PDF with tolerances (±0.05 mm).
