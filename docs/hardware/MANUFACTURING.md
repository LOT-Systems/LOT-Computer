# Manufacturing Plan — LOT-P1, 100-unit run

## 1. PCBWay flow (item 1)
1. Capture schematic + 4-layer layout in KiCad (36×36 mm, 0.8 mm FR-4, ENIG, impedance-controlled antenna keep-out).
2. Export Gerbers, BOM (LCSC/Digi-Key part numbers), centroid (pick-and-place).
3. PCBWay **PCB + Assembly** quote (turnkey: they source parts). Order 5-unit EVT first, then 25 DVT, then 100 PVT.
4. DFM check from PCBWay before payment; confirm fine-pitch parts (BME688 LGA, BMI270, ESP32-S3-MINI) and X-ray for LGA.
5. Order stainless parts via PCBWay CNC (316L) or an approved partner; send STEP files + polish spec.

## 2. Design-for-test
- Test pads for USB-C D+/D−/VBUS/GND, SWD-style boot pins, UART; pogo jig for flash + functional test.
- Factory test firmware: sensors ID, display pattern, camera frame, haptic pulse, Qi charge current, button.

## 3. Stainless body (items 3, 4, 17, 18)
- Material: 316L (skin-safe, corrosion-resistant). Back plate: mirror polish Ra ≤0.05 µm. Front frame: fine bead-blast to contrast.
- 40.0×40.0 mm, R2 corners; wall ≥0.5 mm; target 5.0 mm (see README risks, fallback 6.5–7 mm).
- Join: M1.2 screws hidden under the front bezel (serviceable in DVT) → laser weld for PVT if no service needed.
- RF/Qi: the antenna and coil sit behind the glass side; no steel in their field. Verify with S11 and charge-efficiency coupons in P4 (Gate G1).
- Waterproofing: IP54 target (gasket); no IP rating claimed in v1.

## 4. Charging (items 12, 19)
- Inductive Qi (5 W TX pad, ≤1 W RX) + USB-C pads on service side for development.
- Dock: 3D-printed cradle holding the unit glass-up on a Qi pad; polished back down is **not** recommended unless the back is non-metal.
- Safety: battery protection, NTC, thermal limit 45 °C, UN38.3 for cell.

## 5. 100-unit run plan (item 13)
| Step | Detail |
|---|---|
| Serials | `LOTP1-YYMM-0001…0100`, laser-engraved + QR to provisioning page |
| Provisioning | Flash via jig, burn per-device ID + token request key (never ship a shared secret) |
| QA | 100% functional test, 10% burn-in (24 h cycle), 5% drop/vibration |
| Yield target | ≥ 90% first pass; 10 spare boards in the lot |
| Docs per unit | Quick-start card + QR to PDF manual |
| Labelling | Do not print "Made in USA" unless final assembly occurs in the USA |

## 6. Compliance
- ESP32-S3-MINI is pre-certified (module). Final product still needs FCC Part 15 evaluation; ship PVT units as evaluation units until done.
- Li-ion: UN38.3 test summary, shipping by air under UN3481 section II rules; consult the carrier.
- RoHS/REACH declarations from PCBWay.
