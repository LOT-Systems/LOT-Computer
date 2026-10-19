# HW-001 Mechanical Design Notes

## Target form

40 × 40 mm square, rounded corners R3, two parts, silver stainless steel.
Thickness: **v1 = 9.5 mm**, **v2 target = 5 mm** (your spec).

## The two parts

- **Back shell (polished):** solid 316L, mirror-polished outside face. No openings on the polished face. Holds the Li-Po. Pocket on the inside edge for the PCB.
- **Front shell (functional):** 316L frame with a window for the screen (glass or sapphire), a hole for the camera lens, and a button cut-out with a flexible cap. Joined to the back by 4× M1.2 screws or laser weld. Silicone gasket for splash resistance.

## Why not a fully metal sealed body

| Problem | Effect | Fix |
|---|---|---|
| Faraday cage | Wi-Fi/BLE range falls to near zero | Non-metal window over the antenna, or a plastic edge slit; place the ESP32-S3 antenna at the edge |
| Eddy currents | Qi charging fails through stainless | Glass, ceramic or PEEK inlay over the coil on one face, or pogo-pin contacts |

Both windows can share one inlay on the front-shell side, around the screen bezel, keeping the polished back unbroken.

## Stack (v1, 9.5 mm)

| Layer | mm |
|---|---|
| Back wall (polished) | 1.0 |
| Battery (side-by-side with Qi coil) | 3.2 |
| PCB | 0.8 |
| Components top (ESP32-S3 module 3.2, screen module below) | 3.2 |
| Front wall + window | 1.3 |
| **Total** | **9.5** |

Camera and screen are placed side by side on the front, so their heights do not add.

## Path to 5 mm (v2)

Flex PCB, bare ESP32-S3 die module, 2 mm battery, ultra-thin camera, 0.5 mm walls, laser-welded seam. Higher cost and fragility; needs a design partner and about 3 more months.

## Verification

Mock-up with 3D-printed parts and steel plates first (Phase 3): measure Wi-Fi RSSI at 3 m and Qi charge current through the inlay before ordering any production bodies.
