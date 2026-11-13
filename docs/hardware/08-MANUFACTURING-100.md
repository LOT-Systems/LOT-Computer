<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager — Manufacturing Plan: Run of 100 (PCBWay)

**Document:** LOT-HW-01 / MFG · **Rev:** A (2026-11-13)

## 1. What to order from PCBWay

| Order | Spec | Qty | Est. |
|-------|------|----:|-----:|
| PCB | 4-layer HDI, 0.6 mm, 1 blind via pair (L1–L2), ENIG, 40 × 40 mm with cut-out, panelised 4-up | 120 | ~$450 |
| PCBA (turnkey) | Both sides, 0201 passives, WLP/BGA parts, X-ray on U1/U5/U6 | 110 | ~$1,700 + ~$350 setup/stencil |
| Consigned parts | Sharp LCD, HM0360 module, Qi coil, battery (hand-assembled after SMT) | 110 | per BOM |
| CNC Part A | 316L tub, #8 mirror outside | 110 | ~$2,420 |
| CNC Part B + key | 316L bezel + Ø 5 mm key | 110 | ~$1,760 |

Order 10 % spare. Ask for a **first-article** (3 units) photo + dimension report before the full run.

## 2. Files PCBWay needs

- Gerbers (RS-274X), drill, IPC-356 netlist, stack-up drawing
- BOM (CSV: ref, MPN, manufacturer, qty, DNP) and centroid / pick-and-place file
- Assembly drawing PDF (polarity, X-ray notes)
- STEP + 2D PDF for both steel parts, finish callouts, tolerances (doc 03 §5)

## 3. Assembly flow (final assembly can be done in-house for 100 units)

1. PCBWay ships PCBA, programmed with **factory** firmware via pogo pins.
2. In-house: attach coil + ferrite, connect LCD and camera FPCs, fit battery.
3. **Test 1 (bare board on jig):** factory self-test JSON must be all-pass.
4. Bond glass into Part B; press button key + O-ring.
5. Close Part A + Part B, 4 screws.
6. **Test 2 (sealed):** Qi charge on pad ≥ 300 mA, Wi-Fi RSSI ≥ −65 dBm at 1 m from test AP, button, haptic, display pattern, BME688 reading sane.
7. Flash production app firmware, enable Secure Boot + flash encryption (irreversible — last step).
8. Register serial + ATECC public key with lot-systems.com (`lot-flash provision`).
9. 24 h burn-in on charger, then charge to 60 % for shipping.
10. Film, box with Qi pad + cable + printed quick-start (from doc 09 PDF).

## 4. Test jig

- 3D-printed nest + 6 pogo pins (VBAT, GND, TX, RX, EN, BOOT) + USB-UART (CP2102) + Qi pad + reference Wi-Fi AP.
- Laptop runs `lot-flash test`; writes `mfg-log.csv` (serial, MAC, ATECC pubkey hash, test results, fw version, timestamp).
- Cost ~$250 to build.

## 5. Quality targets

| Metric | Target |
|--------|--------|
| SMT first-pass yield | ≥ 95 % |
| Final yield | ≥ 97 % after rework |
| Cosmetic reject (polish) | ≤ 5 % |
| Battery life (measured, 10 % sample) | ≥ 7 days at default settings |

## 6. Shipping

Lithium battery inside equipment: UN3481, Section II. Cell vendor must provide UN38.3 test
summary. Under 100 Wh, ground/air with proper labels.
