# 08 · Manufacturing — 100-Unit Run via PCBWay

## 1. Build plan

| Lot | Units | Purpose | Gate to the next lot |
|---|---|---|---|
| EVT | 10 PCBA + 10 bodies (6.0 mm) | Prove electronics, RF, Qi, sensors | All functions work on ≥ 8/10; RF loss ≤ 8 dB |
| DVT | 20 PCBA + 20 bodies (5.0 or 6.0 mm per D2) | Final form, drop/sweat/thermal, cert pre-scan | Pass §3 reliability; pre-scan margin ≥ 3 dB |
| PVT / Production | **110 built → 100 shipped** | Production run | Yield ≥ 90%; end-of-line 100% pass |

## 2. PCBWay order flow

1. **PCB + PCBA (turnkey):** upload Gerbers, BOM (`MPN, qty, ref`), centroid (pick-and-place) file and assembly drawing. Choose: 4L, 0.4 mm, ENIG, via-in-pad, X-ray inspection on the module and BGAs, **conformal coat: none** (sensor vents).
   - Consign the parts that PCBWay may not stock: Sharp LCD, HM0360 module, BHI260AP, LiPo (the LiPo is fitted at our final assembly, not by PCBWay).
2. **CNC (316L):** STEP + PDF; lid and tub as separate part numbers; mirror polish on the tub, bead-blast on the lid; laser mark; protective film; CMM first article.
3. **Window:** sapphire through PCBWay's sourcing partner or a direct optical vendor (34×24×0.4 mm, AR, black mask).
4. **Final assembly:** PCBWay box-build (ask for a quote) **or** in-house in the USA ("Made in the USA" requires final assembly in the US; check FTC rules before printing that claim).

**Lead times (typical):** PCB 5–7 days, PCBA 10–15 days, CNC with polish 12–20 days, custom LiPo 30–45 days, sapphire 15–25 days.
**Critical path:** the battery. Order the cell RFQ on day 1 of EVT.

## 3. Reliability tests (DVT)

| Test | Condition | Pass |
|---|---|---|
| Drop | 1.2 m onto concrete, 6 faces × 2 | Works; window not cracked |
| Sweat / salt | Artificial sweat 48 h; salt fog 24 h | No corrosion, button works |
| Water | IPX4 spray | No ingress |
| Thermal | −10 °C … 45 °C operation; charge 0–40 °C | Works; charging cut-off works |
| Button life | 100k presses | Still actuates; force within spec |
| Battery | 300 cycles | ≥ 80% capacity |
| Wi-Fi range | In pocket, 10 m through 1 wall | Sync succeeds ≥ 95% |

## 4. End-of-line test (every unit)

A fixture with pogo-pin and USB-JTAG contacts, plus a Qi pad, runs `factory_test` firmware:
1. Current draw in sleep < 30 µA.
2. Display checkerboard (camera fixture photo compare).
3. Button press detected; haptic current spike detected.
4. BME688/BHI260AP/LTR-390/MAX17048 respond on I²C with plausible values.
5. Camera captures a target, and the QR decodes.
6. Wi-Fi associates with the test AP, RSSI ≥ −55 dBm at 1 m.
7. Charging: Qi and dock both raise CHG_STAT.
8. Burn eFuses (Secure Boot, flash encryption), write serial `P1-0001…0110`, register the factory secret with the LOT server.
9. Laser serial must match the database; print the box label.

## 5. Certification and shipping

| Item | Path | Est. |
|---|---|---|
| FCC | ESP32-S3-MINI-1 modular grant (FCC ID 2AC7Z-ESPS3MINI1 — verify on fccid.io) + **SDoC** Part 15B for the host; host label "Contains FCC ID: …" | $2–5k |
| CE / UKCA | RED (radio) using the module reports + EMC + LVD/62368-1 | $2–6k |
| Qi logo | Optional (WPC membership costs extra). Plan: skip the logo, say "charges on Qi pads" | $0 |
| Battery | UN38.3 test summary + IEC 62133-2 from the cell vendor; MSDS | vendor |
| Shipping | Lithium-ion in equipment: UN3481, Section II (< 100 Wh) | — |
| Materials | RoHS/REACH declarations from PCBWay; 316L nickel release EN 1811 (skin contact) | $0.5k |
