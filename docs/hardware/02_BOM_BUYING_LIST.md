# 02 — Components & Buying List

Prices are **(est.)** USD, qty-1 / qty-100 where known. Links are vendor homepages or
search URLs; confirm exact part, stock and price before purchase.

## A. Phase P1 dev-kit (buy now, ~$150)

| Item | Part | Buy | Est. |
|---|---|---|---|
| MCU + camera board | Seeed XIAO ESP32S3 Sense (OV2640 + mic) | https://www.seeedstudio.com/ | $14 |
| Alt MCU+cam | Freenove/AI-Thinker ESP32-S3-CAM | https://www.aliexpress.com/ | $12 |
| Display | 1.14" 240×135 ST7789 IPS (or 1.3" 240×240) | https://www.adafruit.com/ / https://www.waveshare.com/ | $10 |
| Weather/gas | BME688 breakout (T/H/P/VOC, AI-capable) | https://www.adafruit.com/ , https://www.sparkfun.com/ | $20 |
| IMU | BMI270 or LIS2DW12 breakout | https://www.sparkfun.com/ | $10 |
| Button | 6×6 mm tactile | https://www.digikey.com/ | $0.2 |
| Buzzer | Piezo 12 mm (thin) / LRA haptic | https://www.digikey.com/ | $2 |
| Battery | LiPo 3.7 V 100–200 mAh, thin | https://www.adafruit.com/ | $6 |
| Qi receiver | Qi RX coil module (5 V, 5 W-class) | https://www.adafruit.com/ , https://www.seeedstudio.com/ | $8 |
| Qi transmitter pad | Any Qi/Qi2 pad | https://www.amazon.com/ | $15 |
| Fuel gauge | MAX17048 breakout | https://www.adafruit.com/ | $8 |

## B. Custom PCB BOM (v1, per unit, est. @100)

| Block | Part (candidate) | Notes | Est. |
|---|---|---|---|
| SoC/module | ESP32-S3-MINI-1 (pre-certified) or ESP32-S3FN8 bare | MINI = 2.4 mm tall, easier RF | $3.5–4.5 |
| Camera | OV2640 DVP FPC module, 8×8 mm class | pinhole lens | $4–6 |
| Display | 1.14" ST7789 IPS FPC panel, ≤1.6 mm | | $4–6 |
| Env sensor | Bosch BME688 (LGA 3×3 mm) | | $9–12 |
| IMU | Bosch BMI270 / ST LIS2DW12 | tap/orientation | $1.5–2.5 |
| Wireless RX | TI BQ51013B or Renesas P9222 + coil (WPC type A) | ferrite shield 0.2 mm | $4–6 |
| Charger/protection | BQ25101 / MCP73831 + DW01 | NTC | $1.5 |
| Fuel gauge | MAX17048 | | $1.5 |
| Regulator | 3.3 V LDO/buck, low-IQ | | $0.5 |
| Haptic/audio | Piezo sounder 7 mm thin | | $0.5 |
| Button | Ultra-low-profile tactile (≤1.2 mm) | "Copy" | $0.3 |
| RGB LED | 0603/0402 | | $0.2 |
| Battery | LiPo ~100 mAh, UN38.3 cert, ≤2.5 mm | | $3–4 |
| Passives/connectors | | | $1.5 |
| PCB + SMT | PCBWay 4-layer 0.6 mm + assembly | | $12–18 |
| Front window | glass/ceramic/PET window w/ AR | | $3–6 |
| Body | 316L two-part CNC + mirror polish | **dominant** | $40–90 |
| Packaging/charger | gift box + Qi pad (bulk) | | $6–10 |
| **Total (est.)** | | | **$95–165 / unit** |

Sourcing: PCBWay assembly/components https://www.pcbway.com/ ; backup LCSC https://www.lcsc.com/ ,
Mouser https://www.mouser.com/ , DigiKey https://www.digikey.com/ . Steel body: PCBWay CNC
service or Xometry https://www.xometry.com/ , Protolabs https://www.protolabs.com/ .

## C. Tools
Soldering station, USB-C cable, multimeter, USB power meter, Qi test pad, calipers,
hot-air station; software: KiCad 8, ESP-IDF 5.x / PlatformIO, Fusion/FreeCAD.
