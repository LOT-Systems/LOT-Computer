# LOT PLATE — Components Buying List (HW-02)

REV A · 2026-10-31 · **Sandbox had no access to vendor sites: no live prices, stock, or SKU pages were checked.**
Links are manufacturer / distributor entry points. Prices are ESTIMATE (USD, qty-100 per unit). A human must verify
stock + exact MPN on DigiKey / Mouser / LCSC before ordering. Mark each line VERIFIED in this file when done.

## A. EVT electronics (per unit)
| Ref | Part (MPN class) | Function | Est $ | Link |
|---|---|---|---|---|
| U1 | Espressif ESP32-S3-MINI-1-N8 (pre-certified module; DVT may go bare ESP32-S3FN8) | MCU, Wi-Fi, BLE, DVP camera | 3.5 | https://www.espressif.com/en/products/modules |
| U2 | Bosch BME688 | Weather + AI gas (T/RH/P/VOC) | 8.0 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| U3 | Bosch BMI270 (or BHI260AP for on-chip AI) | IMU, tap/gesture, step | 3.0 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ |
| U4 | Vishay VEML7700 | Ambient light (auto-brightness) | 1.5 | https://www.vishay.com/en/optical-sensors/ |
| U5 | TI BQ51050B (Qi RX + Li-ion charger, CSP) | Wireless charging | 3.0 | https://www.ti.com/product/BQ51050B |
| U6 | Analog Devices MAX17048 | Fuel gauge | 1.5 | https://www.analog.com/en/products/max17048.html |
| U7 | 3.3 V buck-boost/LDO (e.g. TI TPS62840 / TPS7A02) | Rail | 1.0 | https://www.ti.com/power-management/overview.html |
| L1 | Qi RX coil, thin ≤0.6 mm, ⌀~25 mm, with ferrite (Würth Elektronik WE-WPCC thin series class) | Wireless power | 2.5 | https://www.we-online.com/en/components/products/WE-WPCC |
| BT1 | Thin LiPo, target ≤1.6 mm, 50–100 mAh, with protection IC (custom-spec from cell house; quote at PCBWay-adjacent vendors / Grepow / Great Power) | Power | 4.0 | https://www.digikey.com/en/products/filter/batteries-rechargeable-secondary |
| DS1 | 1.3" IPS 240x240 ST7789 FPC panel (baseline) — ALT: 1.54" e-paper GDEY0154D67 | Screen | 4.0 | https://www.buydisplay.com (IPS) · https://www.good-display.com (e-paper) |
| CAM1 | OmniVision OV2640-class 2 MP FPC module, thinnest available (need ≤2.5 mm; DVT: OV2640 CSP bare) | Camera | 4.5 | https://www.ovt.com/products/ |
| SW1 | Low-profile tactile / metal dome ≤0.6 mm travel (e.g. Alps SKRP / C&K PTS) | COPY button | 0.5 | https://tech.alpsalpine.com/e/products/category/tactile-switches/ |
| LS1 | (optional) 0603 piezo / LRA coin ≤2.0 mm | Pager alert | 1.5 | https://www.digikey.com/en/products/filter/haptic-actuators |
| PCB | 4-layer, 0.8 mm, ENIG, 38x38 mm, antenna keep-out | Board | see 08 | https://www.pcbway.com/ |
| misc | Passives, ESD (USBLC6), pogo test pads, FPC conn., flex ant. | — | 4.0 | https://www.lcsc.com/ |
| | **Electronics subtotal (excl. PCB/SMT)** | | **≈ 42.5** | |

## B. Mechanical
| Item | Spec | Est $ /unit @100 | Link |
|---|---|---|---|
| Front bezel | 316L, CNC, camera + screen + button apertures | 20–35 | https://www.pcbway.com/cnc-machining-quote.html |
| Back plate | 316L, CNC, mirror polish, glass-window pocket | 20–35 | same |
| Back window | Glass/sapphire disc ⌀26 x 0.5, AR-free, black-backed | 3–8 | https://www.pcbway.com/cnc-machining-quote.html (or specialty glass cutter) |
| Seam isolator | PEEK / zirconia ring-segment (RF aperture) | 2–4 | PCBWay CNC / 3D |
| Screws | M1.0 x 2.5 torx, 316 | 0.4 | https://www.mcmaster.com |
| Gasket / adhesive | thin PSA, IPX1 target | 0.5 | — |
| Cover glass | 0.5 mm chem-strengthened, front | 2–4 | — |

## C. Charger / tools
| Item | Spec | Est $ | Link |
|---|---|---|---|
| EVT dock | Any 5 W Qi pad, thin (test only) | 10 | https://www.digikey.com/en/products/filter/wireless-charging-transmitters |
| PVT dock | Custom puck: Qi TX IC (e.g. TI BQ500212A class) + magnet ring, USB-C | 12–18 | https://www.ti.com/product/BQ500212A |
| Programmer | ESP-Prog or USB-C native (S3 has USB) | 0 (pads) | — |
| Test | Pogo-pin jig (PCBWay) | 150 once | https://www.pcbway.com/ |
| Dev kit (P1) | ESP32-S3-EYE or XIAO ESP32S3 Sense (cam) + BME688 breakout + e-paper breakout | ~90 once | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html |

## D. Roll-up per unit @100 (ESTIMATE)
Electronics 42.5 + PCB/SMT 14–20 + steel/glass/isolator 46–86 + battery incl. above + dock 12–18 + packaging/QA 8 ≈ **$125–175 landed, before certification/NRE**. See 08.
