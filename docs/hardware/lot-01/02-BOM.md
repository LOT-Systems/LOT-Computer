# LOT·01 — Components Buying List (BOM rev A)

Prices are **estimates in USD per unit at 100–250 qty**, taken from distributor listings or typical quotes and checked on 2026-11-22 where noted. Confirm in a live PCBWay turnkey quote before ordering. Build **110 sets** (100 + 10% yield / test spares). Order **15 EVT sets** first.

## A. Electronics (PCBWay turnkey can source items marked ✔)

| # | Function | Part | Qty | ≈ $/unit | Link | Notes |
|---|---|---|---|---|---|---|
| E1 | MCU + Wi-Fi/BLE | Espressif **ESP32-S3FH4R2** (QFN56 7×7, 4 MB flash + 2 MB PSRAM in package) ✔ | 1 | 4.40 | [LCSC C3013940](https://www.lcsc.com/product-detail/C3013940.html) · [DigiKey](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-S3FH4R2/17887524) | Has DVP camera interface; PSRAM needed for VGA frames |
| E2 | 40 MHz crystal | 2016 size, ±10 ppm ✔ | 1 | 0.15 | [LCSC search](https://www.lcsc.com/search?q=40MHz%202016) | Per Espressif HW design guide |
| E3 | 2.4 GHz antenna | Chip antenna, e.g. Johanson 2450AT18A100 + π-match ✔ | 1 | 0.35 | [DigiKey search](https://www.digikey.com/en/products/result?keywords=2450AT18A100) | Sits under the front glass edge, ≥3 mm from steel |
| E4 | Display | **Sharp LS013B7DH03** 1.28" memory LCD, 128×128, ~26.6×30.3×0.74 mm | 1 | 14.00 | [DigiKey](https://www.digikey.com/en/products/detail/sharp-microelectronics/LS013B7DH03/425-2903-ND/5300387) · [Datasheet](https://cdn.sparkfun.com/assets/d/e/8/9/7/LS013B7DH03_datasheet.pdf) | Always-on at µW; readable in sun; thickness varies by glass lot — confirm |
| E5 | Display FPC connector | 0.5 mm 10-pin, 0.9 mm height ✔ | 1 | 0.30 | [LCSC search](https://www.lcsc.com/search?q=FPC%200.5mm%2010P%200.9mm) | Or hot-bar the FPC straight to the board in PVT |
| E6 | Camera | **GC0308** VGA (or OV2640 2 MP) slim FPC module, **≤ 3.4 mm** body, 24-pin DVP | 1 | 4–7 | [Arducam OV2640 mini CCM](https://www.arducam.com/product/arducam-ov2640-camera-module-2mp-mini-ccm-compact-camera-modules-compatible-with-arduino_m0031esp32-esp8266-development-board-with-dvp-24-pin-interface_/) · [esp32-camera driver](https://components.espressif.com/components/espressif/esp32-camera/versions/2.0.8/readme) | **Long-lead risk.** Ask a module house for a custom short-lens build; I found no published sub-3 mm height. Supported by the Espressif driver |
| E7 | Weather + AI gas | **Bosch BME688** (T/RH/P/gas, BSEC AI) 3×3×0.93 mm ✔ | 1 | 9.00 | [Bosch BME688](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/) | Needs a vent hole + ePTFE membrane; keep away from the ESP32 hot spot |
| E8 | IMU with ML core | **ST LSM6DSOX** 2.5×3×0.83 mm ✔ | 1 | 3.00 | [ST LSM6DSOX](https://www.st.com/en/mems-and-sensors/lsm6dsox.html) | Tap / double-tap / pick-up wake, runs while the MCU sleeps |
| E9 | Qi RX + Li-ion charger | **TI BQ51050B** (DSBGA 1.9×3.0 or VQFN 4.5×3.5) ✔ | 1 | 3.50 | [TI BQ51050B](https://www.ti.com/product/BQ51050B) | Qi v1.2 single chip, 4.2 V charging |
| E10 | Qi RX coil | FPC/wire coil ≈ Ø28–32 mm, ≤ 0.3 mm + ferrite sheet ≤ 0.15 mm | 1 | 1.80 | [Würth WE-WPCC](https://www.we-online.com/en/components/products/WE-WPCC) · [TDK WR](https://product.tdk.com/en/search/wireless/wireless/coil/list) | Prefer a custom FPC coil made with the PCB order to save Z |
| E11 | Battery | LiPo 3.7 V, **≈100 mAh, 2.2 × 25 × 25 mm** with PCM + NTC | 1 | 2.50 | [Grepow custom](https://www.grepow.com/) · [PKCELL](https://www.pkcell.com/) | UN38.3 + MSDS needed for shipping; custom cell MOQ often 500 |
| E12 | Fuel gauge | **MAX17048** (ModelGauge, no sense resistor) ✔ | 1 | 1.80 | [ADI MAX17048](https://www.analog.com/en/products/max17048.html) | Battery % on screen + in telemetry |
| E13 | 3.3 V buck | **TI TPS62840** (60 nA Iq) ✔ | 1 | 1.20 | [TI TPS62840](https://www.ti.com/product/TPS62840) | Main rail |
| E14 | Load switches | TI TPS22916 ×2 (camera, sensors) ✔ | 2 | 0.40 | [TI TPS22916](https://www.ti.com/product/TPS22916) | Hard-off for the camera in sleep |
| E15 | Haptic | 8 mm coin LRA (≤ 2.0 mm) + TI **DRV2603** driver ✔ | 1 | 2.20 | [TI DRV2603](https://www.ti.com/product/DRV2603) · [LRA search](https://www.digikey.com/en/products/result?keywords=coin%20LRA%208mm) | The "pager" buzz |
| E16 | Copy key switch | 4 mm metal dome (Snaptron F-series) on PCB pad | 1 | 0.15 | [Snaptron domes](https://www.snaptron.com/) | 0.3 mm travel, ~250 gf |
| E17 | ESD/TVS | On key, antenna and test pads ✔ | 3 | 0.30 | — | |
| E18 | Passives | 0201/0402 R/C/L ≈ 60 pcs ✔ | 1 set | 1.50 | — | |
| E19 | PCB | 4-layer, 0.4 mm, ENIG, 1 oz/0.5 oz, 0.1 mm via, ~36×36 mm with camera cut-out | 1 | 3.00 | [PCBWay capabilities](https://www.pcbway.com/capabilities.html) | Panelised 4-up |
| E20 | SMT assembly | PCBWay turnkey, two-sided avoided (single-sided back) | 1 | 8.00 | [PCBWay assembly](https://www.pcbway.com/assembly-capabilities.html) | Includes AOI + X-ray (QFN/DSBGA) |
| | **Electronics subtotal** | | | **≈ 62–66** | | |

## B. Enclosure & mechanics

| # | Part | Spec | ≈ $/unit @100 | Link |
|---|---|---|---|---|
| M1 | **Part A — back shell** | 316L CNC cup, 40×40, 0.4 mm floor, R0.8 edges, **mirror polish #8** (Ra ≤ 0.05 µm) | 22–35 | [PCBWay CNC stainless](https://www.pcbway.com/rapid-prototyping/cnc-machining/metal/stainless-steel/) |
| M2 | **Part B — front bezel** | 316L CNC frame, 2.0 mm rim, key slot 6×3, vent Ø0.3 laser hole, bead-blast or polished | 14–22 | same |
| M3 | Copy key cap | 316L, 6×3×0.8 mm, polished | 1.50 | same |
| M4 | Cover glass | 0.4 mm aluminosilicate, chem-strengthened, black ink mask, clear camera window, AR + AF coat | 3–5 (+ ~$600 tooling) | glass house via PCBWay "OEM" or direct (e.g. Shenzhen cover-glass vendors) |
| M5 | Vent membrane | ePTFE die-cut Ø2 mm, IP54-class | 0.40 | [Gore vents](https://www.gore.com/products/categories/venting) |
| M6 | Adhesives / foam | 3M 300LSE die-cuts (glass→bezel, A→B), PORON foam | 0.80 | — |
| M7 | Joining A↔B | Option 1: 4× M1.0 torx screws from the side. Option 2: press-fit + adhesive (sealed, not serviceable) | 0.40 | — |
| | **Mechanics subtotal** | | **≈ 42–65** | |

**Finish note:** PCBWay lists stainless CNC and electropolishing. I found no page that confirms mirror (#8) polishing, so ask for it in the quote or send Part A to a polishing sub-vendor.

## C. Charger, packaging, documents

| # | Item | ≈ $/unit | Note |
|---|---|---|---|
| C1 | Qi 5 W pad (v1, off-the-shelf, Qi-certified, soft silicone top) | 8–12 | Device charges face-down |
| C2 | USB-C cable 1 m | 1.50 | |
| C3 | Box (rigid, foam insert, sleeve) | 3.00 | |
| C4 | Printed quick-start card + QR → PDF manuals | 0.30 | |
| | **Subtotal** | **≈ 13–17** | |

## D. One-time costs (NRE) for the 100-unit program

| Item | ≈ $ |
|---|---|
| EVT: 15 PCBA + 15 CNC sets + glass samples | 2,500 |
| DVT: 30 sets + fixture v1 | 4,000 |
| Cover glass tooling (print screens, CNC jig) | 600 |
| Camera module custom build NRE | 500–1,500 |
| Test fixture (pogo bed + Qi coupon + RF shield box) | 1,200 |
| FCC Part 15 B/C + ISED + CE RED + Qi tests (bare-chip path) | 12,000–20,000 |
| Battery UN38.3 (if custom cell) | 2,000–3,000 |
| **NRE total** | **≈ 23k – 33k** |

## E. Roll-up

| | Low | High |
|---|---|---|
| BOM + assembly + mechanics + charger/box per unit | $117 | $148 |
| × 110 built | $12.9k | $16.3k |
| NRE | $23k | $33k |
| **Program total for 100 sellable units** | **≈ $36k** | **≈ $49k** |
| **Effective cost per unit (incl. NRE)** | **≈ $360** | **≈ $490** |

Certification is the largest single line. For a 100-unit run it costs more than all the parts. See D-1 and D-5 in `01-PLAN.md`.
