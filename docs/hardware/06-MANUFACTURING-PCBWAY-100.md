<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · Manufacturing: PCBWay, 100-Unit Run

**Document:** LD-01-DOC-06 · Rev A · 2026-11-21

## 1. What PCBWay builds

| Service | Order page | Qty | Notes |
|---------|-----------|-----|-------|
| PCB fabrication | https://www.pcbway.com/orderonline.aspx | 120 (panel 2 × 3) | 4L, 0.6 mm, ENIG, min 4/4 mil, impedance control on the antenna feed is not needed because the module has its own antenna |
| Turnkey PCBA | https://www.pcbway.com/pcb-assembly.html | 110 | PCBWay buys parts from your BOM. Consign the BME688, BHI260AP, HM0360 and LS013B7DH03 if their stock is short |
| CNC machining, 316L | https://www.pcbway.com/rapid-prototyping/cnc-machining/ | 120 A + 115 B | Mirror polish #8 on A, bead-blast + brush on B |
| Assembly / box-build | quote by email | 100 | Optional. Final assembly can also be done in the USA (glass bonding, screws, flash, test) |

## 2. Files to send

1. Gerbers + drill (RS-274X), `LD01-PCB-RevA.zip`
2. BOM, `LD01-BOM-RevA.xlsx` (columns: Ref, Qty, MPN, Manufacturer, Package, Substitutes allowed Y/N)
3. Pick-and-place / centroid CSV
4. Assembly drawing PDF: polarity, LGA X-ray request for the BME688/BHI260AP
5. STEP + 2D PDF for Part A and Part B, with the finish callouts in doc 03 §2
6. Test spec: flash via pogo pads, run `factory_test` (I²C scan, LCD pattern, camera frame, Qi detect)

## 3. Run plan

| Stage | Qty | Purpose | Gate |
|-------|-----|---------|------|
| Proto-A | 3 dev kits | Software loop on a desk | Copy round-trip works end to end |
| **EVT** | 10 PCBA + 10 enclosures | Fit, RF, Qi thermal, 6.0 mm | T-01…T-08 pass |
| **DVT** | 20 | 5.0 mm stretch, drop, battery life, emissions pre-scan | ≥ 7 days battery, Part 15B pre-scan pass |
| **PVT / run** | 110 built → 100 shipped | Production | ≥ 95 % first-pass yield |

## 4. Lead times (typical, not quoted)

PCB 5–7 days · PCBA 2–4 weeks (parts sourcing dominates) · CNC + mirror polish 2–3 weeks ·
Shipping to the US 5–10 days. **EVT → 100 units: about 14–18 weeks.**

## 5. Compliance checklist (USA first)

- FCC Part 15C: covered by the **ESP32-S3-MINI-1 modular grant** (the label must say "Contains FCC ID: …"). Do not modify the module's antenna area.
- FCC Part 15B: unintentional-radiator test of the whole product.
- Qi: building a Qi receiver does not require certification. Using the Qi logo does (WPC membership). Do not print the logo.
- Battery: UN38.3 + MSDS from the cell supplier for air freight.
- Skin contact: 316L (nickel release under EN 1811 is typically acceptable for 316L, but verify if selling in the EU).
- Labelling: serial, FCC ID, laser-etched inside Part A.
