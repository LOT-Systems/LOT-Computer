# HW-01 — Components Buying List (Rev A, EVT)
Prices = rough USD planning estimates (qty 1 → qty 100), **unverified**; confirm on vendor pages. Links are vendor home/search pages; check live part numbers before ordering.

| Block | Part (proposed) | Why | Est. $ (1 / 100) | Source |
|---|---|---|---|---|
| MCU+radio | **ESP32-S3-MINI-1U / -1** (pre-certified, Wi-Fi+BLE, camera I/F) | Camera DVP, USB, small | 4 / 3 | [Espressif](https://www.espressif.com/en/products/modules) · [LCSC](https://www.lcsc.com) |
| Screen | 1.3" 240×240 IPS, ST7789 FPC (≈1.5 mm) | Fits 40 mm face | 6 / 4 | [AliExpress](https://www.aliexpress.com)/[LCSC](https://www.lcsc.com) |
| Camera | Thin FPC GC2145 or OV2640 (≤2.5 mm, DVP) | See R1 | 5 / 3 | [LCSC](https://www.lcsc.com) · [Arducam](https://www.arducam.com) |
| Weather / gas | **Bosch BME688** (T/RH/P/gas, AI via BSEC) | AI-grade COTS | 12 / 8 | [Digi-Key](https://www.digikey.com) · [Bosch](https://www.bosch-sensortec.com) |
| IMU | **ST LSM6DSO** (machine-learning core) | Tap/pick-up/orientation AI | 3 / 2 | [ST](https://www.st.com) |
| Battery | LiPo ~2 mm × ~20 × 25, 50–80 mAh w/ PCM | Thickness-limited | 4 / 3 | [LCSC](https://www.lcsc.com) |
| Charge IC | TI **BQ25100** (Li-ion linear, small) | Tiny | 1 / 0.8 | [TI](https://www.ti.com) |
| Qi RX | TI **BQ51003/BQ51013B** + thin RX coil (≈0.5 mm, ferrite) | Wireless charge | 6 / 4 | [TI](https://www.ti.com) · [Digi-Key](https://www.digikey.com) |
| Fuel gauge | Analog Devices/Maxim **MAX17048** | Battery % to site | 2 / 1.5 | [Digi-Key](https://www.digikey.com) |
| Alert | Thin piezo (≈0.5 mm) or micro LRA | Pager buzz | 1.5 / 1 | [LCSC](https://www.lcsc.com) |
| Button | Ultra-low-profile tact (≈0.6 mm) under steel flex pad | COPY | 0.3 / 0.2 | [LCSC](https://www.lcsc.com) |
| Passives, LDO, ESD, antenna keep-out, connector | misc | | 4 / 3 | [LCSC](https://www.lcsc.com) |
| PCB + SMT assembly | 4-layer 40×40, ENIG, turnkey | | 25 / 9 (prototype/100) | [PCBWay](https://www.pcbway.com) |
| Body | 316L back plate + frame, CNC + mirror polish, glass window | 2 parts | 80 / 28 | [PCBWay CNC](https://www.pcbway.com) or local shop |
| Cover glass / lens window | 0.4 mm AR glass, cut + adhesive | | 4 / 2 | custom |
| Charger | Any Qi pad (5 W) for EVT; branded pad later | | 12 / 6 | [Amazon/Digi-Key] |

**Indicative per-unit at 100:** parts ≈ $35–45, PCBA/assembly ≈ $10–15, body ≈ $28–40, test/pack ≈ $5 → **≈ $80–105 each → $8–10.5k for the run** (excl. NRE, certification, tooling).
