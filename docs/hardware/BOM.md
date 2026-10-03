# LOT-P1 Bill of Materials & Buying List

**Prices are planning estimates (USD, Oct 2026), not quotes.** Links go to vendor/manufacturer pages, were *not* verified live this session (egress limited) and must be re-checked at order time. Qty shown = prototype (5 units) / production per unit.

## A. Prototype kit (order in P1, ~US$250–350 total)

| Item | Part | Qty | Est. | Link |
|---|---|---|---|---|
| MCU devkit w/ camera | ESP32-S3-EYE or Freenove ESP32-S3 CAM | 2 | $45 ea | https://www.espressif.com/en/products/devkits |
| Display module | 1.3" 240×240 ST7789 IPS | 3 | $8 | https://www.adafruit.com/product/4313 |
| Round display alt. | 1.28" GC9A01 | 2 | $9 | https://www.waveshare.com/1.28inch-lcd-module.htm |
| Weather/gas sensor | Bosch BME688 breakout | 2 | $20 | https://www.adafruit.com/product/5046 |
| Humidity (precision) | Sensirion SHT45 breakout | 1 | $12 | https://www.adafruit.com/product/5665 |
| IMU | BMI270 breakout | 1 | $15 | https://www.sparkfun.com/search/results?term=BMI270 |
| Ambient light | VEML7700 breakout | 1 | $5 | https://www.adafruit.com/product/4162 |
| Haptic | DRV2605L + LRA | 2 | $8 | https://www.adafruit.com/product/2305 |
| Qi RX + TX test | Qi receiver coil module + 5 W TX pad | 3 | $15 | https://www.sparkfun.com/products/15286 |
| LiPo 3.7 V ~100 mAh thin | 301230/401230 class | 5 | $5 | https://www.adafruit.com/product/1317 |
| Tactile switch, 2.0 mm tall | e.g. Alps SKRPACE010 | 10 | $0.4 | https://www.digikey.com/en/products/result?keywords=SKRPACE010 |
| Debug | USB-C cable, ESP-Prog | 1 | $20 | https://docs.espressif.com/projects/esp-iot-solution/en/latest/hw-reference/ESP-Prog_guide.html |
| Charger (bench) | USB-C 5 V/2 A supply + Qi TX | 2 | $25 | (any certified supply) |

## B. Production per-unit BOM (100 units, 4-layer PCB ~36×36 mm)

| Ref | Function | Part | Est. @100 | Link |
|---|---|---|---|---|
| U1 | MCU/Wi-Fi/BLE | ESP32-S3-MINI-1-N8R2 | $4.50 | https://www.espressif.com/en/products/modules |
| U2 | Fuel gauge | MAX17048 / LC709203F | $1.80 | https://www.analog.com/en/products/max17048.html |
| U3 | Charger/PMIC | BQ25120A (nano-power) | $2.20 | https://www.ti.com/product/BQ25120A |
| U4 | Qi receiver | BQ51013B | $2.50 | https://www.ti.com/product/BQ51013B |
| U5 | Weather+gas AI sensor | BME688 | $9.00 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| U6 | IMU | BMI270 | $2.00 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ |
| U7 | Ambient light | VEML7700 | $1.20 | https://www.vishay.com/en/product/84286/ |
| U8 | Haptic driver | DRV2605L | $1.60 | https://www.ti.com/product/DRV2605L |
| LRA | Haptic actuator | 6 mm LRA ≤2.5 mm | $1.50 | https://www.digikey.com/en/products/result?keywords=LRA%20haptic |
| CAM | Camera FPC module | OV2640-class (proto) / thin VGA-2 MP (prod) | $4–9 | https://www.ovt.com/products/ov2640/ |
| LCD | 1.3" IPS FPC, ST7789 | custom/standard | $5–8 | via PCBWay/Shenzhen supplier |
| BAT | LiPo with PCM, UN38.3 | 301230-class ≥60 mAh | $2.50 | vendor RFQ |
| L1 | Qi coil + ferrite | ≤0.6 mm, 20 mm | $1.50 | https://www.we-online.com/en/components/products/WPCC |
| SW1 | "Copy" switch | tactile 2 mm | $0.40 | see A |
| ANT | RF window / ceramic | see MANUFACTURING | incl. | — |
| Passives/LED/ESD | misc. | — | $2.50 | — |
| PCB | 4-layer ENIG, 100 pcs | PCBWay | $4–6 | https://www.pcbway.com |
| SMT assembly | PCBWay PCBA | per board | $10–14 | https://www.pcbway.com/pcb-assembly.html |

**Electronics subtotal ≈ $55–70/unit.**

## C. Body & finishing (PCBWay CNC / partner)

| Item | Est. @100 |
|---|---|
| 316L back plate, CNC + mirror polish | $12–20 |
| 316L front frame, CNC + bead/satin | $14–22 |
| Cover glass 0.5 mm + AR, cut-out | $2–4 |
| Gaskets/screws or laser weld | $1–3 |
| Packaging, LOT® box, insert | $3–5 |
Source: https://www.pcbway.com/cnc-machining-quote.html

**Body subtotal ≈ $32–54/unit.**

## D. 100-unit run budget (planning)

| Line | Est. (USD) |
|---|---|
| Electronics 100 × ~$62 | 6,200 |
| Body 100 × ~$43 | 4,300 |
| Stencil, fixtures, NRE (PCBWay setup, test jig) | 1,200 |
| Prototype rounds (EVT/DVT, 25 units) | 3,500 |
| Charging docks 100 × ~$6 (Qi TX pad, USB-C) | 600 |
| Certification/testing allowance (FCC unintentional, UN38.3 report, drop) | 3,500 |
| Shipping/duties/contingency (15%) | 2,700 |
| **Total** | **≈ $22,000 → ~$220/unit** |

Range: $17k–$30k depending on stainless finish and camera module. Re-quote at P4.

## E. Notes
- AI-grade sensors chosen because the vendor ships on-sensor ML/AI (Bosch BSEC gas classifier, BMI270 gesture features); data is edge-processed then compressed upstream.
- Keep a 2nd source for every IC; ESP32-S3 and BME688 lead times have been volatile.
