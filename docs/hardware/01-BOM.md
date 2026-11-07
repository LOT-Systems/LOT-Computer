# 01 — BILL OF MATERIALS & BUYING LIST

Prices: USD planning estimates (qty 1 → qty 100 per unit). **Verify stock/price/footprint before ordering.**
Links go to manufacturer/distributor search pages (stable) rather than deep links.

| Block | Part | Why | Link | ~1 / ~100 |
|-------|------|-----|------|-----------|
| MCU+Wi-Fi/BLE | Espressif **ESP32-C3-MINI-1** (13.2×16.6×2.4 mm, pre-certified) | Low power, OTA, TLS, RISC-V | https://www.espressif.com/en/products/modules | 3.0 / 2.2 |
| Screen | **Sharp Memory LCD LS013B7DH03** 1.28″ 128×128 mono (≈1 mm) | µW static, readable, thin, pager look | https://www.digikey.com/en/products/result?keywords=LS013B7DH03 | 14 / 10 |
| Screen alt | 1.3″ OLED 128×64 SH1106 (dev) | cheap prototype | https://www.aliexpress.com/w/wholesale-1.3-oled.html | 4 / 3 |
| Camera | **Himax HM0360** (VGA, AoN) or **HM01B0** (QVGA) module | Ultra-low-power, tiny | https://www.himax.com.tw/products/cmos-image-sensors/always-on-vision-sensors/ | 12 / 8 |
| Weather | **Sensirion SHT45** (T/RH) | Accurate humidity | https://www.sensirion.com/products/catalog/SHT45 | 4 / 2.5 |
| Pressure | **Bosch BMP390** | Barometer/altitude | https://www.bosch-sensortec.com/products/environmental-sensors/pressure-sensors/bmp390/ | 3 / 1.8 |
| AI gas/air | **Bosch BME688** (BSEC AI, 3×3 mm) | Trainable gas classification | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ | 9 / 6 |
| AI motion | **Bosch BHI260AP** (smart IMU, on-chip ML) | Pick-up / tap / flip, "AI-grade" | https://www.bosch-sensortec.com/products/smart-sensor-systems/bhi260ap/ | 8 / 5.5 |
| Ambient light | **Vishay VEML7700** | Auto screen contrast | https://www.vishay.com/en/product/84286/ | 2 / 1.2 |
| Button | Low-profile tact ≤1.5 mm side/edge (e.g. **Alps SKRPACE010**, Omron B3U-1000P) | "Copy" | https://www.digikey.com/en/products/result?keywords=B3U-1000P | 0.5 / 0.3 |
| Battery | LiPo **301020–302020** 3.7 V 60–90 mAh, ≤3.0 mm, w/ protection | Fits stack | https://www.digikey.com/en/products/result?keywords=lipo%20302020 | 6 / 4 |
| Charger IC | **TI BQ25100** (battery charger, 1×1.6 mm) | Safe Li-ion charge | https://www.ti.com/product/BQ25100 | 1.2 / 0.8 |
| Qi RX | **ST STWLC38** or Renesas P9025AC-class receiver + 20 mm FPC coil + ferrite 0.1 mm | Wireless charge | https://www.st.com/en/power-management/stwlc38.html | 5 / 3.5 |
| Coil | RX coil FPC (Würth 760308101 family / custom FPC) | | https://www.we-online.com/en/components/products/WCCT | 3 / 2 |
| Haptic (opt.) | Piezo haptic driver **DRV2667** + disc, or buzzer | Pager buzz | https://www.ti.com/product/DRV2667 | 5 / 3.5 |
| LDO/PMIC | TLV75533 3.3 V LDO | Rail | https://www.ti.com/product/TLV75533P | 0.4 / 0.2 |
| Window | 0.5 mm chemically-strengthened glass or sapphire, AR + bezel print | Qi/Wi-Fi/camera/screen | https://www.pcbway.com (custom) | 6 / 3 |
| Body | 316L back plate + frame, CNC + mirror polish | Req. 3/17 | https://www.pcbway.com/cnc-machining-quote.html | 90 / 22 |
| PCB | 4-layer rigid-flex or 0.8 mm rigid 38×38 mm, ENIG | Main board | https://www.pcbway.com/rigid-flex-pcb.html | (proto 5 pcs ≈ 60) / 4 |
| SMT assembly | PCBWay turnkey | | https://www.pcbway.com/pcb-assembly.html | — / 6 |
| Charger (user) | Qi 5 W puck, sized 40 mm, with 316L-matched ring | | https://www.digikey.com/en/products/result?keywords=qi%20transmitter%20module | 12 / 6 |

## Cost summary (estimate)
| | Prototype (5) | 100-unit run |
|---|---|---|
| Electronics BOM | ~$75 ea | ~$45 ea |
| Body + window | ~$95 ea | ~$25 ea |
| PCB + SMT + test | ~$120 ea | ~$14 ea |
| Charger puck | ~$12 | ~$6 |
| **Per unit** | **~$300** | **~$90–130** |
| **Batch total (+ NRE tooling/fixtures ~$1.5–2.5k, certs pre-scan ~$1–3k)** | ~$1.5k | **~$13–18k** |

Dev boards for week-1 firmware (buy now): ESP32-C3-DevKitM-1, Sharp memory-LCD breakout (Adafruit 1.3″ 128×128), BME688 + SHT45 + BMP390 breakouts, HM01B0 Arducam module.
