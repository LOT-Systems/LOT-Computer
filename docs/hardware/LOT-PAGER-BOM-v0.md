# LOT PAGER — Components Buying List v0

**All prices are estimates at ~100-unit volume (USD), not quotes. Verify MPN, stock and price on the linked pages before ordering. Links to search/manufacturer pages are used where a stable deep link was not verified.**

| # | Function | Part (MPN) | Est. $/unit | Link |
|---|---|---|---|---|
| 1 | MCU + Wi-Fi/BLE | Espressif **ESP32-S3-MINI-1-N4R2** (2.4 mm tall, 2 MB PSRAM for camera frames) | 3.5–4.5 | [espressif.com](https://www.espressif.com/en/products/modules/esp32-s3) · [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3-MINI-1-N4R2) |
| 2 | Camera | **OV2640** 2 MP DVP module (8×8 mm class) | 3–4 | [DigiKey search](https://www.digikey.com/en/products/result?keywords=OV2640) |
| 3 | Display | 1.3" 240×240 IPS, ST7789 (≈ 23×23 mm active). v1 alt: Sharp LS013B7DH03 memory LCD (always-on, low power) | 3–5 | [search](https://www.digikey.com/en/products/result?keywords=ST7789%201.3%20inch) |
| 4 | Weather/air (AI-grade) | Bosch **BME688** (T/H/P/VOC, BSEC AI) | 8–10 | [bosch-sensortec.com](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/) |
| 5 | IMU (AI-grade) | Bosch **BMI270** (wake-on-motion, tap/gesture engine) | 2–3 | [bosch-sensortec.com](https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/) |
| 6 | UV / ambient light | Lite-On **LTR-390UV-01** | 1.5 | [DigiKey search](https://www.digikey.com/en/products/result?keywords=LTR-390UV-01) |
| 7 | Qi receiver IC | ST **STWLC38** (5 W, WLCSP) — check stock; fallback: NXP/Renesas P9222 class | 3–4 | [st.com](https://www.st.com/en/power-management/stwlc38.html) |
| 8 | Qi RX coil + ferrite | Würth **WE-WPCC** receiver coil (e.g. 760308101 family; pick a ≤ 0.6 mm thick RX coil, 5 W class — the 760308101221 variant seen is only 400 mA) | 2–4 | [Würth WPCC](https://www.we-online.com/en/components/products/WE-WPCC) |
| 9 | Battery charger/power path | TI **BQ25185** | 1.5 | [ti.com](https://www.ti.com/product/BQ25185) |
| 10 | Fuel gauge | Analog **MAX17048** | 1.5 | [DigiKey search](https://www.digikey.com/en/products/result?keywords=MAX17048) |
| 11 | 3.3 V buck | TI **TPS62840** (60 nA Iq) | 1 | [ti.com](https://www.ti.com/product/TPS62840) |
| 12 | Battery | 3.7 V LiPo ~353035 (≈ 3.5×30×35 mm, 250–300 mAh), with protection, **UN38.3 / IEC 62133 certified supplier** | 3–5 | vendor RFQ |
| 13 | Haptic | TI **DRV2605L** + 8–10 mm LRA coin motor | 3–4 | [ti.com](https://www.ti.com/product/DRV2605L) |
| 14 | Button | Ultra-low-profile tact switch (≤ 1.5 mm), IP-rated if on side | 0.5 | [search](https://www.digikey.com/en/products/result?keywords=ultra%20low%20profile%20tact%20switch) |
| 15 | Status LED (camera-on) | 0402 RGB/white LED | 0.2 | — |
| 16 | PCB | 4-layer, 1.0 mm, ENIG, ~36×36 mm | 3–5 | [pcbway.com](https://www.pcbway.com) |
| 17 | SMT assembly (turnkey) | PCBWay, both sides | 8–12 | [PCBWay quote](https://www.pcbway.com/quotesmt.aspx?f=fa) |
| 18 | Housing | 316L two-part, CNC + #8 mirror polish (back), satin front | 20–35 | [PCBWay CNC](https://www.pcbway.com/cnc-machining-quote.html) |
| 19 | Glass: front cover + back Qi insert + camera window | Chemically strengthened glass / sapphire window (camera) | 4–8 | RFQ |
| 20 | Gasket, screws M1.2, adhesive, ferrite | — | 1.5 | — |
| 21 | Wireless charger (accessory) | Off-the-shelf Qi 5 W pad for EVT; custom steel dock later | 6–10 | [search](https://www.digikey.com/en/products/result?keywords=Qi%20wireless%20charging%20transmitter%20pad) |
| 22 | Packaging + manual card | — | 2–4 | — |

## Totals (estimate)
- **Per unit:** ≈ **$80 – $125** (steel + glass are ~45% of cost).
- **100 units:** ≈ **$8.0 – 12.5 k**.
- **One-time NRE:** EMC/FCC 15B pre-scan + test ≈ $4–6 k; UN38.3 (if shipping cells ourselves) ≈ $2–4 k; fixtures/jigs ≈ $1–2 k; EVT/DVT prototype rounds ≈ $2–3 k. **≈ $9–15 k.**
- **P1 dev-kit shopping (≈ $120):** ESP32-S3 devkit w/ PSRAM, OV2640 module, ST7789 board, BME688 breakout, BMI270 breakout, LRA + DRV2605L breakout, Qi RX breakout + pad.

## Sourcing notes
- PCBWay sources turnkey parts from MPN; ask them to flag WLCSP/low-stock parts (STWLC38, BME688) in the quote response.
- Consigned (kitted) option is safer for BME688/STWLC38 if their stock is low.
- Substitutes if stock fails: BME688→BME280+SGP40; STWLC38→P9222; ST7789 panel→GC9A01 round (changes UI).
