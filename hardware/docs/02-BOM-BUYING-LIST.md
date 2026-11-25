# 02 · BOM — BUYING LIST

```
DOCUMENT  HW-02-BOM       ISSUE 2026.11.25      CLASS INTERNAL / PROCUREMENT
```

Prices are **planning estimates in USD as of late 2026**, not quotes. They
were not checked live in this session. Confirm each line on the distributor
page before you place an order. Links go to distributor search pages, which
stay valid when a product page moves. Quantity-100 prices assume PCBWay
turnkey assembly sources the parts, or you consign them.

## A · Electronics (per TILE)

| #  | Part                          | Part number            | Function                         | Qty | ≈ @1    | ≈ @100  | Link |
|----|-------------------------------|------------------------|----------------------------------|-----|---------|---------|------|
| E1 | SoC module (SiP)              | ESP32-S3-PICO-1-N8R2   | MCU, Wi-Fi, BLE, 8 MB flash, 2 MB PSRAM, 7 × 7 mm | 1 | 6.50 | 4.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3-PICO-1-N8R2) · [Espressif](https://www.espressif.com/en/products/socs/esp32-s3) |
| E2 | Display                       | Sharp LS013B7DH03      | 1.28" 128 × 128 memory LCD, reflective, 0.74 mm | 1 | 21.00 | 15.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LS013B7DH03) |
| E3 | Camera                        | Himax HM01B0 module (e.g. HM01B0-MNA or Arducam HM01B0) | 320 × 320 mono, < 2 mW, TinyML | 1 | 14.00 | 9.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=HM01B0) · [Arducam](https://www.arducam.com/?s=HM01B0) |
| E4 | Environmental / weather       | Bosch BME688           | T, RH, P, VOC gas + AI gas classification, 3 × 3 × 0.93 mm | 1 | 11.50 | 8.20 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688) · [Bosch](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/) |
| E5 | IMU with ML core              | ST LSM6DSV16X          | Tap / pick-up / flip detection in-sensor, wakes MCU | 1 | 5.20 | 3.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LSM6DSV16X) |
| E6 | Wireless charging receiver    | Renesas (Panthronics) PTX30W | NFC-WLC listener, ≤ 250 mW, integrated Li-ion charger | 1 | 3.80 | 2.60 | [Mouser](https://www.mouser.com/c/?q=PTX30W) |
| E7 | Fuel gauge                    | Analog MAX17048G+T10   | Battery %, 3 µA                  | 1 | 2.40 | 1.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048G%2BT10) |
| E8 | Buck regulator                | TI TPS62840DLC         | 3.3 V, 60 nA Iq, 750 mA          | 1 | 1.60 | 1.05 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS62840DLCR) |
| E9 | Load switch (camera / sensor rail) | TI TPS22916C      | Hard-off rail for camera         | 2 | 0.60 | 0.35 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS22916CYFPR) |
| E10| 2.4 GHz chip antenna          | Johanson 2450AT18A100  | Antenna under glass border       | 1 | 0.70 | 0.45 | [DigiKey](https://www.digikey.com/en/products/result?keywords=2450AT18A100) |
| E11| NFC-WLC coil                  | Custom flex coil + 0.1 mm ferrite sheet, ~24 × 24 mm | Charging + NFC pairing | 1 | 6.00 | 1.80 | Custom (PCBWay flex + Würth/TDK ferrite sheet) |
| E12| Metal dome                    | Snaptron F04-series, 4 mm, ~200 gf | Copy button contact | 1 | 0.40 | 0.12 | [Snaptron](https://www.snaptron.com/) |
| E13| Li-Po cell                    | Thin cell ~1.6 × 25 × 30 mm, 90–110 mAh, with PCM and flex tabs | Energy | 1 | 8.00 | 3.50 | Custom: Grepow / PowerStream / GMB via Alibaba ("ultra thin lipo 152530") |
| E14| Passives, ESD, crystal        | 0201/0402 R/C, TVS on button, 40 MHz is inside the SiP | — | 1 set | 3.00 | 1.20 | PCBWay parts library |
| E15| Display FPC connector / ZIF   | Per LS013B7DH03 datasheet (10-pin 0.5 mm) or hot-bar | — | 1 | 0.80 | 0.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=FH12-10S-0.5SH) |
| E16| Camera FPC connector          | Per module (or direct hot-bar) | — | 1 | 0.80 | 0.40 | — |
|    | **Electronics subtotal**      |                        |                                  |     | **≈ 87** | **≈ 54** | |

## B · PCB and assembly (PCBWay)

| #  | Item                               | Spec                                           | ≈ @10 (each) | ≈ @100 (each) |
|----|------------------------------------|------------------------------------------------|--------------|---------------|
| P1 | Main PCB                           | 4-layer HDI, 0.6 mm, 38 × 38 mm with camera cut-out, ENIG, 0.1 mm laser vias | 18.00 | 4.50 |
| P2 | PCBA (turnkey)                     | ~60 placements, 0201, one QFN SiP, X-ray on SiP | 35.00 | 9.00 |
| P3 | NFC coil flex                      | 2-layer polyimide, 0.11 mm                     | 8.00 | 1.50 |
| P4 | Stencil + set-up (one-off)         |                                                | 80 total | 80 total |
| P5 | Dock PCB + PCBA (doc 07)           | 2-layer, PTX130W, USB-C                        | 25.00 | 6.00 |

Order at <https://www.pcbway.com/> → "PCB Instant Quote" (HDI) and "PCB Assembly".

## C · Enclosure (CNC at PCBWay or a dedicated watch-case shop)

| #  | Item                        | Spec                                          | ≈ @10 | ≈ @100 |
|----|-----------------------------|-----------------------------------------------|-------|--------|
| M1 | Side A back shell           | 316L, CNC, #8 mirror polish outside, 0.6 mm floor | 55.00 | 18.00 |
| M2 | Side B front frame          | 316L, CNC, bead-blast, glass ledge, button bore, sensor vent | 55.00 | 18.00 |
| M3 | Copy button cap             | 316L turned, Ø 4 mm, laser-etched "Copy"      | 12.00 | 2.50 |
| M4 | Cover glass                 | 0.55 mm aluminosilicate (Gorilla-class), black print border, AR coat, camera window | 20.00 | 4.00 (+ ~600 tooling) |
| M5 | Sealing                     | PSA gasket ring (3M VHB 0.2 mm die-cut), ePTFE vent membrane over BME688 port (Gore / Saati) | 4.00 | 1.20 |
| M6 | Fasteners                   | 4 × M1.0 stainless screws, or press-fit + adhesive | 2.00 | 0.40 |
|    | **Enclosure subtotal**      |                                               | **≈ 148** | **≈ 44** |

Links: [PCBWay CNC machining](https://www.pcbway.com/rapid-prototyping/) ·
[Gore protective vents](https://www.gore.com/products/categories/venting) ·
custom glass via Alibaba "custom cover glass 0.55mm silk print" (Lens
Technology class suppliers for scale).

## D · Charger dock (per unit)

| #  | Item                     | ≈ @100 |
|----|--------------------------|--------|
| D1 | PTX130W NFC-WLC poller + matching + coil | 6.00 |
| D2 | Dock PCB + PCBA          | 6.00 |
| D3 | Dock body (aluminium CNC or stainless, felt or silicone top) | 9.00 |
| D4 | USB-C cable              | 1.50 |
|    | **Dock subtotal**        | **≈ 22.50** |

## E · Packaging and print

| Item                                    | ≈ @100 |
|-----------------------------------------|--------|
| Rigid box with foam insert              | 5.00   |
| Printed quick-start card (from doc 10)  | 0.60   |
| Serial label + QR for pairing           | 0.20   |

## F · Totals for the 100-unit run

| Bucket                                   | Per unit  | × 100       |
|------------------------------------------|-----------|-------------|
| Electronics (A)                          | 54        | 5,400       |
| PCB + PCBA (B, ex. one-offs)             | 15        | 1,500       |
| Enclosure (C)                            | 44        | 4,400       |
| Dock (D)                                 | 22.50     | 2,250       |
| Packaging (E)                            | 5.80      | 580         |
| **Unit cost**                            | **≈ 141** | **≈ 14,130**|
| NRE: glass tooling, stencils, test jig, battery sample, 2 EVT + 1 DVT spins | — | ≈ 6,500 |
| Certification pre-scan (FCC Part 15 / CE RED). The SiP carries modular approval only if you use the certified module variant (see R6) | — | ≈ 3,000–12,000 |
| Shipping, duties, 10 % spares            | —         | ≈ 2,000     |
| **Programme budget**                     |           | **≈ 26k – 35k** |

## G · Prototype kit (buy this week, before any custom PCB)

Builds the full feature set on a bench so firmware and the LOT API can begin
now, in parallel with mechanical work.

| Item                                             | ≈ USD | Link |
|--------------------------------------------------|-------|------|
| Seeed XIAO ESP32-S3 Sense (ships with an OV2640 camera: use it for early firmware; the HM01B0 is wired separately) | 14    | [Seeed](https://www.seeedstudio.com/catalogsearch/result/?q=XIAO%20ESP32S3%20Sense) |
| Adafruit SHARP Memory Display breakout 1.3" 168 × 144 (closest breakout to the LS013B7DH03) | 25 | [Adafruit](https://www.adafruit.com/?q=sharp+memory+display) |
| Adafruit / Pimoroni BME688 breakout              | 20    | [Adafruit](https://www.adafruit.com/?q=BME688) |
| LSM6DSV16X breakout (STEVAL-MKI227KA or SparkFun) | 15    | [DigiKey](https://www.digikey.com/en/products/result?keywords=STEVAL-MKI227KA) |
| HM01B0 camera module (Arducam / SparkFun)        | 15    | [Arducam](https://www.arducam.com/?s=HM01B0) |
| PTX30W / PTX130W NFC-WLC evaluation kit          | 150–250 | [Renesas](https://www.renesas.com/en/search?keywords=PTX30W) |
| MAX17048 breakout                                | 7     | [Adafruit](https://www.adafruit.com/?q=MAX17048) |
| Thin Li-Po 100 mAh                               | 8     | — |
| Tactile button, wires, Qwiic/STEMMA cables       | 10    | — |
| **Kit total**                                    | **≈ 265–365** | |
