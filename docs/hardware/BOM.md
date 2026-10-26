# BOM — LOT P0 (per unit, 100-unit estimates)

Prices are **order-of-magnitude estimates, not quotes**; verify at purchase. Links are distributor search pages (stable) — pick exact in-stock variants at order time.

| Block | Part (proposed) | Why | Est. USD @100 | Link |
|---|---|---|---|---|
| MCU + radio | Espressif ESP32-S3 module (e.g. ESP32-S3-MINI-1 / WROOM-1, pre-certified) | Wi-Fi/BLE, camera + LCD interfaces, OTA | 3–5 | [Mouser](https://www.mouser.com/c/?q=ESP32-S3-MINI-1) |
| Display | 1.3" 240×240 IPS TFT, ST7789, bare panel with FPC | "Simple screen", pager text | 3–6 | [LCSC](https://www.lcsc.com/search?q=ST7789+1.3) |
| Camera | OV2640 or GC2145 small-module (2 MP, DVP) | Cheap, ESP32 driver support | 3–6 | [LCSC](https://www.lcsc.com/search?q=OV2640) |
| Weather/AI sensor | Bosch BME688 (T/RH/pressure/gas, AI-ready) | Weather + air-quality, Bosch BSEC | 6–9 | [Mouser](https://www.mouser.com/c/?q=BME688) |
| Humidity backup | Sensirion SHT45 | Accurate RH/T (optional) | 2–4 | [Mouser](https://www.mouser.com/c/?q=SHT45) |
| Ambient light | Vishay VEML7700 | Auto screen brightness | 1–2 | [Mouser](https://www.mouser.com/c/?q=VEML7700) |
| IMU | Bosch BMI270 or ST LSM6DSO | Motion/tap/wake | 2–4 | [Mouser](https://www.mouser.com/c/?q=BMI270) |
| Qi receiver | TI BQ51013B or BQ51050B | Wireless charge + Li-Po charging | 2–4 | [Mouser](https://www.mouser.com/c/?q=BQ51050B) |
| Qi coil | Wurth 760308101xxx-class RX coil (≤30 mm) | Receiver coil w/ ferrite | 2–4 | [Mouser](https://www.mouser.com/c/?q=Wurth+Qi+receiver+coil) |
| Fuel gauge | Maxim MAX17048 | Battery %, sleep | 1–2 | [Mouser](https://www.mouser.com/c/?q=MAX17048) |
| LDO/Buck | TI TPS62xxx 3.3 V buck | Efficiency | 0.5–1 | [Mouser](https://www.mouser.com/c/?q=TPS62743) |
| Battery | 3.7 V Li-Po ~300 mAh, ≤3 mm thick, with PCM | Fits 8 mm stack | 3–5 | [Search](https://www.google.com/search?q=300mAh+lipo+30x30x3mm+PCM) |
| Haptic | LRA coin motor 8–10 mm + DRV2605L | Pager buzz | 2–4 | [Mouser](https://www.mouser.com/c/?q=DRV2605L) |
| Button | Low-profile tactile switch (e.g. Alps/C&K, ~1.5–2 mm) or hall-sensor in steel | The "Copy" button | 0.3–1 | [Mouser](https://www.mouser.com/c/?q=low+profile+tactile+switch) |
| Status LED | RGB 0402 + camera-active red LED | Privacy indicator | 0.2 | — |
| PCB | 4-layer, ~36×36 mm, ENIG, PCBWay | Stack height | 3–6 | [PCBWay](https://www.pcbway.com) |
| Body | 316L stainless, 2 CNC parts, polished + bead-blast | Spec | 25–60 | [PCBWay CNC](https://www.pcbway.com/cnc-machining-quote.html) |
| Window | Sapphire/ceramic insert (antenna+coil) | Resolves R2 | 3–10 | quote |
| Charger (accessory) | Qi 5 W pad | Req. 12/19 | 5–8 | [Search](https://www.google.com/search?q=Qi+5W+wireless+charging+pad+OEM) |
| Passives/misc | | | 3–5 | — |
| **Unit total (est.)** | | | **~75–150** | |
| Assembly (PCBA) | PCBWay turnkey, ~100 pcs | | 8–15 | |
| 100-unit total (est.) | incl. tooling/fixtures, excl. certification | | **~$10–20k** | |

Unverified: stock, MOQ, footprint heights. Check every part's max height against the stack in README §R1 before PCB layout.

Dev kit for M1 (~$100–150): ESP32-S3 devkit, 1.3" ST7789 breakout, BME688 breakout, tactile button, LRA breakout.
