<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Computer — Bill of Materials

Companion to [`LOT-COMPUTER-SPEC.md`](./LOT-COMPUTER-SPEC.md). Prices below
are approximate street/distributor pricing at typical hobbyist and
100-unit-order breakpoints — treat every number as "confirm at quote time,"
the same caveat the existing `LOT-NODE-0-RIG-SPEC.md` uses for the AI server
rig. Links go to vendor storefronts and search, not to specific product
pages, since exact SKUs and stock shift constantly — search the part number
listed on the vendor site linked.

## Electronics

| # | Part | Function | Vendor (search here) | Unit (1x) | Unit (100x, est.) |
|---|------|----------|------------------------|-----------|--------------------|
| 1 | ESP32-S3-WROOM-1 module | MCU + Wi-Fi/BLE radio, camera interface | [Digi-Key](https://www.digikey.com), [Mouser](https://www.mouser.com), [LCSC](https://www.lcsc.com) | ~$3.50 | ~$2.20 |
| 2 | OV2640 2MP camera module (DVP, FPC) | Camera | [LCSC](https://www.lcsc.com), [Alibaba](https://www.alibaba.com) (module assemblies) | ~$4.00 | ~$2.50 |
| 3 | Sharp Memory LCD, 1.3"–1.6" mono (LS013B7DH series or equiv.) | Display | [Digi-Key](https://www.digikey.com), [Mouser](https://www.mouser.com) | ~$14.00 | ~$9.00 |
| 4 | Bosch BME280 (or breakout die) | Weather/env sensor | [Digi-Key](https://www.digikey.com), [Mouser](https://www.mouser.com) | ~$3.00 | ~$1.60 |
| 5 | Qi wireless-charge receiver IC + coil (BQ51013B-class) | Wireless charging | [Digi-Key](https://www.digikey.com), [Mouser](https://www.mouser.com) | ~$3.50 | ~$2.30 |
| 6 | LiPo pouch cell, thin profile, 3.7V (capacity set once §04 height decision is made) | Battery | [LCSC](https://www.lcsc.com), [Adafruit](https://www.adafruit.com) (prototype qty only) | ~$4.00 | ~$2.80 |
| 7 | Tactile SMD switch ("Copy" button) | Input | [Digi-Key](https://www.digikey.com), [Mouser](https://www.mouser.com) | ~$0.30 | ~$0.12 |
| 8 | Passives (decoupling caps, resistors, LED indicator, antenna matching) | Support | [LCSC](https://www.lcsc.com) | ~$1.50 | ~$0.70 |
| 9 | Sapphire/hardened glass camera lens cover | Optical window | [PCBWay](https://www.pcbway.com) (custom shop), [Alibaba](https://www.alibaba.com) | ~$2.00 | ~$1.20 |
| 10 | Display cover glass/acrylic window | Optical window | [PCBWay](https://www.pcbway.com), [Alibaba](https://www.alibaba.com) | ~$1.00 | ~$0.60 |

**Electronics subtotal (100x):** ≈ **$23/unit**

## PCB and Assembly

| # | Item | Vendor | Notes |
|---|------|--------|-------|
| 11 | 4-layer rigid PCB fab, ENIG, ≤32×32mm | [PCBWay](https://www.pcbway.com) | Small-outline board, tight tolerance for shell fit |
| 12 | PCBA (turnkey SMT assembly of items 1–8) | [PCBWay](https://www.pcbway.com) | Order PCB fab + assembly together; PCBWay sources common parts, you supply the camera/display/battery as consigned parts if not in their catalog |

**PCB + PCBA (100x):** ≈ **$8–14/unit** (bare board ≈ $1–2, assembly labor + SMT ≈ $7–12, quote-dependent)

## Enclosure — Stainless Steel Body

| # | Item | Vendor | Notes |
|---|------|--------|-------|
| 13 | Front shell — 316L stainless, CNC-machined, mirror-polished, laser-etched logo | [PCBWay](https://www.pcbway.com) (CNC machining service) | Same order pipeline as the PCB — one vendor relationship |
| 14 | Back shell — 316L stainless, CNC-machined, bead-blasted, lens + window cutouts | [PCBWay](https://www.pcbway.com) (CNC machining service) | |
| 15 | Gasket / seal (adhesive-backed IP gasket, cut to shell perimeter) | [PCBWay](https://www.pcbway.com), [McMaster-Carr](https://www.mcmaster.com) | |

**Enclosure (100x):** ≈ **$18–28/unit** for two CNC 316L shells at this size — small-part CNC in steel does not get cheap at 100 units the way sheet metal stamping would at 10,000+; this is the correct order of magnitude for a first run, not a target to beat.

## Wireless Charging Dock (accessory, sold or bundled per unit)

| # | Item | Vendor | Notes |
|---|------|--------|-------|
| 16 | Qi charging puck/dock, stainless or matching finish | [PCBWay](https://www.pcbway.com) (CNC shell) + off-the-shelf Qi transmitter module ([Digi-Key](https://www.digikey.com)) | Matches product aesthetic — a second small stainless disc, not a generic plastic puck |

**Dock (100x):** ≈ **$10–15/unit**

## Packaging + Manual

| # | Item | Vendor | Notes |
|---|------|--------|-------|
| 17 | Rigid box, foam or felt insert | [PCBWay](https://www.pcbway.com) (packaging add-on) or local packaging vendor | |
| 18 | Printed Quick Start card + full manual (see [`LOT-COMPUTER-MANUAL.md`](./LOT-COMPUTER-MANUAL.md)) | Local print shop or PCBWay packaging service | PDF sources committed alongside this BOM |

**Packaging (100x):** ≈ **$4–6/unit**

## Per-Unit Roll-Up (100-unit run)

```
CATEGORY                    COST/UNIT (est.)
────────                    ────────────────
Electronics (BOM)           $23
PCB + PCBA                  $11
Enclosure (2× 316L CNC)     $23
Charging dock               $12
Packaging + manual          $5
─────────────────────────── ────────────────
UNIT COST                   ≈ $74
100-UNIT RUN TOTAL           ≈ $7,400
```

This excludes NRE (CNC tooling/fixture setup, PCBA stencil, firmware and
software engineering time) and excludes margin. Treat $74/unit as the
manufacturing floor to price above, not the retail price.

## Open Sourcing Decision (from SPEC §04)

If v1 drops the camera (recommended), remove line items 2 and 9 — subtract
≈ $6.50/unit ($4.00 module + $2.00 lens + associated assembly labor),
bringing unit cost to ≈ $67–68. Re-add both once the v2 camera module and
lens are validated separately.
