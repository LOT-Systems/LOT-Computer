# 02 — COMPONENTS BUYING LIST

IMPORTANT: Prices are order-of-magnitude estimates from general knowledge.
Links go to vendor sites/search pages; none were opened or price-checked this
session (no live parts lookup available). Verify part number, stock,
thickness, and datasheet before ordering. Parts marked VERIFY are the most
uncertain.

## 1. EVT prototype buy (dev stage, ~$150–300)

| Qty | Item | Why | Where |
|-----|------|-----|-------|
| 2 | ESP32-S3 dev board with PSRAM (e.g. Seeed XIAO ESP32S3 Sense, includes OV2640 camera) | Fastest path to Wi-Fi + camera + firmware work | https://www.seeedstudio.com/ |
| 2 | 1.14" 240×135 IPS (ST7789) | Screen trial | https://www.adafruit.com/ , https://www.aliexpress.com/ |
| 2 | BME688 breakout | Weather + gas | https://www.adafruit.com/ , https://www.sparkfun.com/ |
| 2 | Qi receiver coil + RX board (5 V, thin) | Charging-through-steel test | https://www.sparkfun.com/ , https://www.digikey.com/ |
| 1 | Qi transmitter pad | Test source | any WPC-certified pad |
| 5 | 302025-class Li-Po (3 mm, ~120 mAh) and 2 mm pouch cells | Battery thickness study | https://www.digikey.com/ , https://www.adafruit.com/ |
| 1 | 316L stainless sheet samples 0.5 / 0.8 mm | RF + Qi attenuation test | https://www.mcmaster.com/ |
| 1 | Coin-size piezo buzzer / LRA haptic | Pager alert | https://www.digikey.com/ |

## 2. Production BOM (per unit, target)

| Block | Part (candidate) | Notes | Est. $ @100 | Link |
|-------|------------------|-------|-------------|------|
| MCU+radio | Espressif ESP32-S3-MINI-1 (pick variant with PSRAM; VERIFY) | Pre-certified module; 2.4 GHz Wi-Fi/BLE | 4 | https://www.espressif.com/en/products/modules |
| Camera | Ultra-thin 2 MP FPC module, Z ≤ 3 mm (OV2640 or GC2145 class; VERIFY thickness) | Biggest height risk | 6–10 | https://www.alibaba.com/ (search "ultra thin camera module DVP") |
| Display | 1.14" IPS 240×135 ST7789, FPC, ≤1.5 mm | Alt: 0.96" OLED | 4–7 | https://www.alibaba.com/ |
| Weather/gas | Bosch BME688 (2.5×2.5×0.93 mm) | "AI-grade" gas sensor w/ BSEC | 9–12 | https://www.digikey.com/ |
| Motion (opt.) | Bosch BHI260AP smart IMU w/ on-chip AI | Tap/wake gestures | 8 | https://www.digikey.com/ |
| Qi RX | TI BQ51003-class Qi receiver IC (VERIFY) | 5 V out | 3 | https://www.ti.com/ |
| Charger/PMIC | TI BQ25100-class Li-Ion charger + 3.3 V buck/LDO | | 2 | https://www.ti.com/ |
| Fuel gauge (opt.) | MAX17048 | % battery | 2 | https://www.analog.com/ |
| Qi coil | Thin RX coil + ferrite, ~Ø20 mm, ≤0.6 mm | | 2–3 | https://www.digikey.com/ |
| Battery | Li-Po 2–3 mm thick, 60–120 mAh, with PCM | Custom size likely | 3–5 | https://www.alibaba.com/ |
| Button | Ultra-low-profile tact (≤0.6 mm) or capacitive/domed | | 0.5 | https://www.digikey.com/ |
| Haptic/buzzer | Thin piezo or LRA | Pager alert | 1–2 | https://www.digikey.com/ |
| Status LED | Camera-active LED | Privacy | 0.1 | https://www.digikey.com/ |
| PCB | 4-layer, 0.6–0.8 mm, rigid-flex or flex-rigid (VERIFY need) | PCBWay | 8–15 | https://www.pcbway.com/ |
| Assembly | PCBWay turnkey PCBA | | 10–20 | https://www.pcbway.com/pcb-assembly.html |
| Steel body | 2-part 316L CNC/MIM, polished back | | 30–70 | https://www.pcbway.com/cnc-machining.html (also Xometry, JLCCNC) |
| Window/inlay | Glass cover + antenna window | | 3–8 | custom |
| Misc | adhesive, gasket, screws, label, packaging | | 5–10 | — |

## 3. 100-unit run estimate

| Line | Est. total |
|------|-----------|
| Parts + PCB + assembly (120 sets) | $2,500–$4,500 |
| Steel bodies (110 sets, incl. polish) | $4,000–$8,000 |
| NRE: enclosure tooling/fixtures, test jig | $1,500–$4,000 |
| Compliance pre-scan (FCC/CE/Qi/UN38.3) | $5,000–$15,000 (not per-unit; may be deferred) |
| Packaging + charger pads (100 pcs, ~$6 each) | $1,000–$1,500 |
| **Total (excl. compliance)** | **~$9,000–$18,000 → ~$95–$170/unit** |

Add compliance if the units will be sold; skip for internal/prototype-only run.

## 4. Chargers
- Wireless: WPC Qi 5 W transmitter pad, flat, ~$5–10 in 100 qty; or a custom LOT-branded stainless puck with a Qi TX module (later).
- Wired fallback: 4 pogo pads on the edge or USB-C is impossible at 5 mm, so use pogo pads on the front bezel for the factory flash/test jig only.

## 5. Where the order happens
1. PCBWay account → quote PCBA with this BOM (upload Gerbers + BOM + pick-and-place at P3).
2. Steel: request quotes from 3 shops (PCBWay CNC, Xometry, a local polisher).
3. Dev parts: Adafruit / Seeed / DigiKey carts (list in §1).
