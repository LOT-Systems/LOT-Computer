# 05 — MECHANICAL, CHARGING, MANUFACTURING

## 1. Enclosure
- Two parts, 316L: **front bezel** (window for screen, camera hole, button) and **back plate** (flat, mirror-polished, no holes).
- 40 × 40 mm, corner radius ~3 mm, total thickness target 5.0 mm (see R1). Wall 0.5–0.6 mm.
- Join: laser-weld is permanent; use a recessed snap + adhesive gasket (serviceable) for EVT/DVT.
- Finish: back plate mirror polish (Ra < 0.05 µm), front bezel brushed or polished (pick one).
- Camera: sapphire or glass lens window flush with bezel, LED beside it.
- Antenna: non-metal window or insulating split between the two steel parts, tuned in EVT.

## 2. Stack (thickness budget, mm)
| Layer | Target |
|-------|--------|
| Back plate | 0.5 |
| Qi coil + ferrite | 0.5 |
| Battery (pouch) | 2.0 |
| Flex PCB | 0.4 |
| Display + glass | 1.4 (side-by-side with battery) |
| Front bezel | 0.5 |
Total with side-by-side layout ≈ 4.9–5.5. Camera (≥2.5) must sit beside the battery, not above it.

## 3. Wireless charging
Metal blocks Qi. Options, ranked:
1. **Front-face charging**: coil behind the glass/display area, device placed screen-down on a pad. Keeps the polished back untouched; weakest for daily use.
2. **Non-metal inlay in the back plate** (ceramic/sapphire disc) over the coil: efficient, breaks the all-steel look.
3. **Thin slotted steel** (≤0.3 mm) + ferrite: lossy, heats; test only.
Plan: EVT bench test of 316L 0.3/0.5/0.8 mm over a Qi coil, measure received power and temperature. Charge target ≥ 200 mA at 5 V in. Cell protection and 4.2 V charge termination in hardware.

## 4. PCBWay
- PCB: 4-layer, 0.6–0.8 mm, ENIG, impedance-controlled for the camera/display lines; consider flex-rigid for height.
- Turnkey PCBA with the BOM in 02. Gerber + BOM + CPL; ask for DFM review before the first order.
- Steel: PCBWay CNC machining service or Xometry; polish quote separate.

## 5. Compliance (if sold or distributed)
FCC Part 15 (module-pre-certified helps but metal case + antenna change requires re-test), CE-RED, WPC Qi, UN38.3 battery, RoHS/REACH. Budget and time are in 01 §4.

## 6. Privacy & safety
Camera LED on during capture, no always-on capture, no microphone. Manual documents these. Battery protection circuit mandatory.
