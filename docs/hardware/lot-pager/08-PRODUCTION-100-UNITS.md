<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 08 · PRODUCTION RUN: 100 UNITS

```
DOCUMENT   HW-08 / PRODUCTION
ISSUE      2026-11-26 · rev 0.1
LOT SIZE   100 shippable units (build 110 PCBA, 115 mechanical sets)
```

## 00 · WHO BUILDS WHAT

| Step | Who | Output |
|------|-----|--------|
| PCB + PCBA (turnkey) | **PCBWay** | 110 tested-for-shorts boards, X-ray sample report |
| CNC front frames + back plates | PCBWay CNC (316L) | 115 + 115 parts, first-article report |
| Mirror polish + laser mark | PCBWay finishing partner, or a local polisher | 115 back plates, inspected to the D65 30 cm rule |
| Cover glass | Custom glass vendor | 120 printed and coated lenses |
| Zirconia inlay | Ceramic vendor | 120 discs |
| Batteries | Cell vendor, UN38.3 | 110 cells with PCM + NTC |
| Puck | Qi TX OEM + CNC body | 105 pucks |
| **Final assembly, flash, test, pack** | **LOT (in-house bench)** | 100 boxed units |

Final assembly stays in-house. At 100 units this gives the best quality control, and it keeps
device keys and pairing secrets out of third-party hands.

## 01 · ASSEMBLY SEQUENCE

1. Bond the inlay into the back plate (UV-cure adhesive). Bond the cover glass into the front frame.
2. Fit the display into the frame pocket and connect its FPC. Fit the camera and the key cap with its dome.
3. Fit the PCBA and the 2× M1.2 screws. Connect the battery (with foam and Kapton). Place the Qi coil centred under the inlay.
4. **Flash and test** before closing: see §02.
5. Fit the VHB ring, close the back, and press at 2 bar for 30 s. Rest 24 h before the final test.
6. Run the final test and pack.

## 02 · END-OF-LINE (EOL) TEST: every unit

The jig has pogo pins on the test pads and a USB-UART connection. The host runs `connector/lot-pager.mjs`, extended in P3 with an `eol` command.

| # | Test | Pass |
|---|------|------|
| 1 | Flash firmware with secure boot and flash encryption, and write the serial into NVS | OK |
| 2 | Wi-Fi RSSI to the reference AP at 1 m, **case closed** | ≥ −60 dBm |
| 3 | Display checkerboard plus a full white and full black frame | Visual OK |
| 4 | COPY dome: 5 presses registered | 5/5 |
| 5 | BME688 temperature against the reference, after 10 min powered | Store the per-unit offset |
| 6 | BHI260AP self-test | OK |
| 7 | Camera capture of the test chart | JPEG decodes, focus metric above the threshold |
| 8 | Qi: on the puck, current into the battery | 40–60 mA |
| 9 | Deep-sleep current | ≤ 40 µA |
| 10 | Live API: `POST /api/logs` to the factory test account | 200 + Log visible |
| 11 | Put into ship mode | < 10 µA |

Results are written per serial to `docs/hardware/lot-pager/eol/<serial>.json`, which is created in P4.

## 03 · SCHEDULE (from the P3 exit)

```
Wk 1–2   PO: PCBA, CNC, glass, inlay, cells, pucks (parallel)
Wk 3–5   Vendor production; first-article approval on 3 mech sets + 5 PCBA
Wk 6     Kits arrive; incoming inspection (AQL 1.0 cosmetic on back plates)
Wk 7     Assembly 20/day × 5 days; EOL
Wk 8     24 h soak, final test, pack, ship
```

## 04 · BUDGET (estimate, USD)

| Line | Low | High |
|------|-----|------|
| PCBA × 110 | 2,000 | 3,100 |
| Electronics parts (turnkey + consigned) × 110 | 6,300 | 6,600 |
| Mechanical × 115 | 6,300 | 10,300 |
| Pucks × 105 | 1,500 | 2,400 |
| Box + print × 100 | 400 | 600 |
| Shipping, duties, DDP | 800 | 1,500 |
| **RUN-100 subtotal** | **17,300** | **24,500** |
| Certification (FCC 15B + modular integration, lab) | 3,000 | 8,000 |
| **Total including certification** | **20,300** | **32,500** |

The roll-up in 02 is an estimate. These lines add a 10–15 % spares and scrap allowance on top.

## 05 · QUALITY GATES

- **FAI:** check 3 sets dimensionally, especially the glass pocket, the inlay bore, and Z overall.
- **Cosmetic:** back plates go through a D65 booth at 30 cm for 10 s. Any visible scratch, orange peel or pit is a reject.
- **Reliability sample (5 units):**
  - Drop from 1.2 m onto wood, ×6 faces.
  - 85 °C / 85 % RH for 48 h.
  - 500 Qi cycles.
  - 10,000 COPY presses.
