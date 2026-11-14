# 02 · Components Buying List (BOM)

**Doc:** LOT-HW-01-BOM · **Rev:** A (2026-11-14) · Machine-readable copy: [`bom.csv`](bom.csv)

> **Prices are estimates** at a 100-unit run (with about 10 % overage for SMT attrition and test spares) and were not
> live-quoted in this session. Before ordering, confirm every line with a PCBWay turnkey quote or a
> DigiKey/LCSC cart. Links go to the vendor search for the exact manufacturer part number, so they
> do not break when a product page moves.

## EVT / PVT build (6.5 mm, pre-certified module)

| Ref | Part | MPN | Qty/unit | Order (100 run) | Est. $/unit | Est. line $ | Buy |
|-----|------|-----|---------:|-----:|------:|------:|-----|
| U1 | ESP32-S3 module 4MB flash 2MB PSRAM (EVT) | `ESP32-S3-MINI-1-N4R2` | 1 | 110 | $3.20 | $352.00 | [LCSC/DigiKey](https://www.lcsc.com/search?q=ESP32-S3-MINI-1-N4R2) |
| DS1 | Sharp Memory LCD 1.08in 160x68 | `LS011B7DH03` | 1 | 105 | $9.50 | $997.50 | [Mouser/DigiKey](https://www.mouser.com/c/?q=LS011B7DH03) |
| J1 | 0.5mm FPC connector 10-pin back-flip | `Hirose FH34SRJ-10S-0.5SH` | 1 | 110 | $0.60 | $66.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=FH34SRJ-10S-0.5SH) |
| CAM1 | Ultra-thin VGA camera module DVP FPC (<=2.5mm Z) | `GC032A / GC0308 FPC module` | 1 | 110 | $3.00 | $330.00 | [LCSC/Alibaba module houses](https://www.lcsc.com/search?q=GC032A) |
| J2 | 0.5mm FPC connector 24-pin | `Hirose FH34SRJ-24S-0.5SH` | 1 | 110 | $0.80 | $88.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=FH34SRJ-24S-0.5SH) |
| U2 | Environmental sensor T/RH/P/gas with AI-Studio | `Bosch BME688` | 1 | 110 | $7.80 | $858.00 | [DigiKey/Mouser](https://www.digikey.com/en/products/result?keywords=BME688) |
| U3 | 6-axis IMU with on-chip gesture/wrist-wake AI | `Bosch BMI270` | 1 | 110 | $2.60 | $286.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BMI270) |
| U4 | Ambient light sensor | `Lite-On LTR-303ALS-01` | 1 | 110 | $0.70 | $77.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LTR-303ALS-01) |
| U5 | Qi receiver + Li-ion charger single chip | `TI BQ51050BRHLR` | 1 | 110 | $3.10 | $341.00 | [DigiKey/TI](https://www.ti.com/product/BQ51050B) |
| L1 | Qi receiver coil ~20x20mm thin with ferrite | `TDK WR202010-18M8-G (or Wurth WE-WPCC equiv)` | 1 | 110 | $2.50 | $275.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=WR202010) |
| U6 | Ultra-low-Iq buck 3.3V 750mA | `TI TPS62840DLCR` | 1 | 110 | $0.95 | $104.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS62840) |
| U7 | Fuel gauge ModelGauge | `Analog MAX17048G+T10` | 1 | 110 | $1.40 | $154.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048G) |
| U8 | Battery protection IC | `ABLIC S-82D1AAA-A8T2U7 (or DW01 equiv)` | 1 | 110 | $0.35 | $38.50 | [LCSC](https://www.lcsc.com/search?q=S-82D1) |
| BT1 | LiPo cell EVT 3.0x30x30mm ~150mAh with PCM | `303030 class` | 1 | 110 | $2.20 | $242.00 | [Alibaba (Grepow/PKCELL/EEMB)](https://www.alibaba.com/trade/search?SearchText=303030+lipo+150mAh) |
| U9 | Haptic driver (LRA/ERM licensed library) | `TI DRV2605LDGSR` | 1 | 110 | $1.60 | $176.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=DRV2605L) |
| M1 | Z-axis LRA 8mm dia x 2.5mm | `Jinlong G0825001 / Vybronics VG0825001` | 1 | 110 | $1.80 | $198.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=VG0825001) |
| SW1 | Low-profile tact switch (Copy) | `C&K KMR211NG LFS (or Alps SKRPABE010)` | 1 | 110 | $0.45 | $49.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=KMR211NG) |
| J3 | Tag-Connect TC2030 footprint (no part) | `TC2030-IDC-NL footprint` | 1 | 0 | $0.00 | $0.00 | [Tag-Connect](https://www.tag-connect.com/) |
| PASS | Caps/resistors/ferrites 0201-0402 kit | `various` | 1 | 110 | $0.80 | $88.00 | [PCBWay turnkey](https://www.pcbway.com/pcb-assembly.html) |
| PCB | Main PCB 4-layer 0.6mm 36x36mm HDI ENIG | `custom` | 1 | 110 | $4.00 | $440.00 | [PCBWay](https://www.pcbway.com/orderonline.aspx) |
| FPC | Flex for camera/antenna/LRA (optional) | `custom` | 1 | 110 | $1.50 | $165.00 | [PCBWay](https://www.pcbway.com/flexible-pcb-manufacturer.html) |
| ENC-A | Back tray 316L CNC + #8 mirror polish + laser LOT mark | `custom` | 1 | 110 | $18.00 | $1,980.00 | [PCBWay CNC](https://www.pcbway.com/rapid-prototyping/cnc-machining/) |
| ENC-B | Front bezel 316L CNC + bead-blast/brush | `custom` | 1 | 110 | $12.00 | $1,320.00 | [PCBWay CNC](https://www.pcbway.com/rapid-prototyping/cnc-machining/) |
| GL1 | Front cover glass 0.4mm chemically strengthened + black mask print | `custom` | 1 | 110 | $2.50 | $275.00 | [Alibaba cover-glass vendors](https://www.alibaba.com/trade/search?SearchText=custom+cover+glass+0.4mm) |
| GL2 | Back Qi window 26mm dia 0.5mm glass + NCVM mirror-silver | `custom` | 1 | 110 | $3.00 | $330.00 | [NCVM cover-glass vendors](https://www.alibaba.com/trade/search?SearchText=NCVM+glass+cover) |
| VENT | ePTFE adhesive vent membrane 3mm | `Gore PolyVent / Donaldson Tetratex equiv` | 1 | 110 | $0.60 | $66.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=protective+vent+adhesive) |
| GSK | Die-cut gasket + PSA (3M 300LSE / VHB) | `custom die-cut` | 1 | 110 | $0.50 | $55.00 | [PCBWay / local die-cut](https://www.pcbway.com/) |
| SCR | M1.0 x 2.5 Torx T3 stainless screws | `custom/standard` | 4 | 450 | $0.06 | $27.00 | [McMaster/Alibaba](https://www.mcmaster.com/) |
| KEY | Steel Copy key cap + silicone plunger | `custom` | 1 | 110 | $1.20 | $132.00 | [PCBWay CNC + silicone vendor](https://www.pcbway.com/rapid-prototyping/cnc-machining/) |
| CHG | Qi 5W charging pad (EVT off-the-shelf) | `any WPC-certified 5W pad` | 1 | 105 | $4.00 | $420.00 | [Alibaba/Amazon](https://www.alibaba.com/trade/search?SearchText=qi+5w+wireless+charger+pad) |
| CBL | USB-C cable 1m braided | `generic` | 1 | 105 | $1.20 | $126.00 | [Alibaba](https://www.alibaba.com/) |
| PKG | Box + insert + printed quick-start card | `custom` | 1 | 105 | $3.50 | $367.50 | [PCBWay / print vendor](https://www.pcbway.com/) |

**Estimated material cost per unit: $95.59** · **Estimated material for the 100-unit run: $10,424.50**

Not included above: PCBA labour and stencil (07 §3), CNC set-up/NRE, fixtures, certification and freight. See the full run budget in [08 · Roadmap §5](08-ROADMAP.md).

## DVT substitutions for the 5.0 mm target

| Ref | Part | MPN | Est. $/unit | Buy | Notes |
|-----|------|-----|------:|-----|-------|
| U1-DVT | ESP32-S3 SoC QFN56 4MB flash 2MB PSRAM (DVT 5mm) | `ESP32-S3FH4R2` | $2.40 | [LCSC](https://www.lcsc.com/search?q=ESP32-S3FH4R2) | needs 40MHz XTAL + chip antenna + own FCC grant |
| Y1 | 40MHz crystal 2016 (DVT only) | `TXC 8Y40000013` | $0.15 | [LCSC](https://www.lcsc.com/search?q=8Y40000013) | DVT only |
| BT1-DVT | Custom ultra-thin LiPo 1.6x30x30mm ~70mAh | `custom (Grepow / EEMB)` | $4.50 | [Grepow](https://www.grepow.com/) | custom MOQ often 500-1000; quote at 100 with NRE |
| ANT1 | 2.4GHz chip antenna (DVT only) | `Johanson 2450AT18B100` | $0.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=2450AT18B100) | EVT module has PCB antenna -> needs non-metal window too |

## Ordering sequence

1. **Long lead and custom first (week 0):** cover glass (GL1), NCVM window (GL2), LiPo cell (BT1, needs UN38.3 docs), camera module (CAM1, request a Z-height drawing from 3 vendors).
2. **Dev kits now (week 0, about $150):** ESP32-S3-DevKitC-1-N8R8, Adafruit Sharp Memory display breakout (LS011B7DH03-based, product 3502 class), Pimoroni/Adafruit BME688 breakout, Adafruit DRV2605L breakout with LRA, TI BQ51050BEVM-764 Qi receiver EVM, any Qi 5 W pad.
3. **PCBA turnkey (week 4):** upload Gerbers, the centroid file and this BOM to PCBWay. Let PCBWay source the passives and commodity ICs. Consign the display, camera and cell.
4. **CNC (week 4, in parallel):** 5 sample enclosures first (finish check), then 110.

## Dev-kit breadboard list (EVT-0, no custom PCB)

| Item | Why | Link |
|------|-----|------|
| ESP32-S3-DevKitC-1-N8R8 | MCU, Wi-Fi, PSRAM, camera pins | https://www.digikey.com/en/products/result?keywords=ESP32-S3-DEVKITC-1-N8R8 |
| Sharp Memory LCD breakout | Screen and driver code | https://www.adafruit.com/search?q=sharp+memory+display |
| BME688 breakout | Weather and AI gas | https://www.digikey.com/en/products/result?keywords=BME688+breakout |
| DRV2605L haptic breakout and LRA | Pager buzz | https://www.adafruit.com/search?q=DRV2605L |
| BMI270 breakout | Pickup-to-wake | https://www.digikey.com/en/products/result?keywords=BMI270+shuttle |
| OV2640/GC032A camera on FPC | Capture path | https://www.lcsc.com/search?q=GC032A |
| TI BQ51050BEVM-764 | Qi receive and charge | https://www.ti.com/tool/BQ51050BEVM-764 |
| 150 mAh 303030 LiPo | Battery | https://www.adafruit.com/search?q=lipo+150mAh |
