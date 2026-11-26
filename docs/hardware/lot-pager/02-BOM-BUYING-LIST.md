<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 02 · BILL OF MATERIALS AND BUYING LIST

```
DOCUMENT   HW-02 / BOM
ISSUE      2026-11-26 · rev 0.1
PRICES     Estimates in USD from distributor list-price knowledge, not quoted live.
           Re-quote before every PO.
LINKS      Distributor search by part number (DK = Digi-Key, MO = Mouser, LC = LCSC).
           Not opened live this session (sandbox has no internet).
```

Link pattern used below:

- DK = `https://www.digikey.com/en/products/result?keywords=<PN>`
- MO = `https://www.mouser.com/c/?q=<PN>`
- LC = `https://www.lcsc.com/search?q=<PN>`

## A · EVT-0 BENCH KIT (buy now, 1 set, about $150)

| # | Item | Part | Qty | Est. $ | Where |
|---|------|------|-----|--------|-------|
| A1 | MCU + camera dev board | Seeed **XIAO ESP32S3 Sense** (ESP32-S3, 8 MB PSRAM, OV2640, mic, LiPo charger) | 2 | 14 ea | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html |
| A2 | Memory LCD breakout | Adafruit **SHARP Memory Display 1.3" 168×144** (#3502) | 1 | 25 | https://www.adafruit.com/product/3502 |
| A3 | Weather + gas (AI) sensor | Adafruit **BME688** breakout (#5046) | 1 | 20 | https://www.adafruit.com/product/5046 |
| A4 | AI IMU (optional at EVT-0) | Bosch **BHI260AP** shuttle board or eval | 1 | 30 | DK: `BHI260AP` |
| A5 | LiPo cell, bench | 3.7 V 100–150 mAh with JST-SH lead | 2 | 6 ea | Adafruit #1570 or equivalent |
| A6 | Qi RX test | **BQ51050B** EVM *or* a generic 5 V Qi receiver pad | 1 | 15–50 | DK: `BQ51050BEVM` |
| A7 | Qi TX test | Any 5 W Qi pad, used only for coupling tests | 1 | 15 | — |
| A8 | Button | 4 mm metal dome + test PCB, or a 6 mm tact switch | 10 | 3 | Snaptron sampler or a generic tact switch |
| A9 | Current meter | Nordic PPK2 (needed to prove the µA sleep target) | 1 | 100 | DK: `NRF-PPK2` (skip if one is already on hand) |
| A10 | Steel mock-up | 2× 40×40×0.5 mm 316L plates (for RF and thermal tests) | 2 | 10 | Amazon / McMaster `316 stainless sheet 0.5mm` |

## B · PRODUCTION BOM, per unit (EVT-1 → RUN-100)

### B1 · Electronics

| Ref | Function | Part number (primary) | Pkg / size | Alt | Est. $ @100 | Links |
|-----|----------|-----------------------|------------|-----|-------------|-------|
| U1 | MCU + Wi-Fi/BLE, **pre-certified** | Espressif **ESP32-S3-MINI-1-N4R2** | 15.4×20.5×2.4 mm | ESP32-S3FH4R2 chip-down (≥1k units) | 3.50 | DK/MO/LC `ESP32-S3-MINI-1-N4R2` |
| DS1 | Display, always-on, reflective silver | Sharp **LS013B7DH03** 1.28" 128×128 memory LCD | ~0.8 mm (verify) | LS013B7DH05 1.26" 144×168 | 13.00 | DK `LS013B7DH03` |
| J1 | Display FPC connector | 10-pin 0.5 mm, ≤1.0 mm height | — | Hirose FH12 / Molex 503480 family | 0.60 | DK `FH12-10S-0.5SH` |
| CAM | Camera, thin module | **GC2145** or **OV2640** DVP module, ≤3.5 mm Z, 24-pin FPC | 8.5×8.5 mm | OV5640 (AF, thicker) | 6.00 | Alibaba / LC `GC2145 module` |
| U2 | Weather + gas, AI (BSEC2 / BME AI-Studio) | Bosch **BME688** | 3×3×0.93 mm | BME680 | 9.00 | DK/MO `BME688` |
| U3 | AI IMU, raise-to-wake, self-learning | Bosch **BHI260AP** | 2.5×2.5 mm LGA | BMI270 (non-AI, cheaper) | 6.50 | DK `BHI260AP` |
| U4 | Ambient light (screen contrast, "night") | Lite-On **LTR-303ALS-01** | 2×2×0.7 mm | VEML6030 | 0.80 | DK `LTR-303ALS-01` |
| U5 | Qi receiver **+** Li-ion charger, single chip | TI **BQ51050B** | DSBGA / QFN | BQ51003 + BQ25120A | 3.20 | DK `BQ51050BRHLR` |
| L1 | Qi RX coil, thin, with ferrite | ~Ø18–20 mm, ≤0.6 mm, ~10–13 µH | — | Würth WE-WPCC series | 2.50 | DK `WE-WPCC receiver coil` |
| U6 | Fuel gauge | Analog **MAX17048G+T10** | 0.9×1.7 mm WLP | MAX17260 | 1.60 | DK `MAX17048G+T10` |
| U7 | 3.3 V buck, 60 nA Iq | TI **TPS62840DLCR** | 1.5×2 mm | TPS62802 | 1.10 | DK `TPS62840DLCR` |
| U8 | Haptic driver (pager buzz) | TI **DRV2603** or **DRV2605L** | 2×2 mm | Direct MOSFET drive | 1.40 | DK `DRV2605LDGSR` |
| M1 | Haptic, coin ERM 8×2 mm *or* piezo disk bonded to back | ERM Ø8×2.0 mm, 3 V | — | Murata 7BB-12 piezo | 1.20 | DK `vibration motor 8mm coin` |
| SW1 | **COPY** key | Snaptron metal dome Ø4 mm, 250–350 gf | 0.3 mm | — | 0.15 | snaptron.com, search `F04` series |
| BT1 | Battery, LiPo pouch | **202030** (2.0×20×30 mm) ~85 mAh, with PCM + NTC, UN38.3 | — | 202530 ~110 mAh | 3.50 | Alibaba `202030 lipo UN38.3` or Grepow custom |
| ANT | (inside U1) PCB antenna | — | — | MINI-1U + FPC antenna | — | — |
| LED1 | Camera-active indicator | 0402 white/amber, behind the glass mask | — | — | 0.05 | LC `0402 LED` |
| ESD | USB-less design; ESD on key and pogo pads | TI **TPD1E10B06** ×3 | 0402 | — | 0.40 | DK `TPD1E10B06DPYR` |
| — | Passives, crystal (inside U1), test pads | — | — | — | 2.00 | PCBWay parts sourcing |
| | | | | | **≈ 57** | |

### B2 · Mechanical

| Ref | Part | Spec | Est. $ @100 | Source |
|-----|------|------|-------------|--------|
| ME1 | Front frame | 316L CNC, bead-blast or brushed, window pocket, key bore, camera bore | 25–40 | PCBWay CNC (stainless) |
| ME2 | Back plate | 316L CNC, **#8 mirror polish**, Ø18 inlay bore, laser-etched "LOT" + serial | 20–35 | PCBWay CNC + polishing vendor |
| ME3 | Back inlay (Qi + RF window) | Zirconia ceramic Ø18×0.5 mm, mirror-polished, silver-grey or black | 3–8 | Alibaba `zirconia ceramic disc custom` |
| ME4 | Cover glass | 0.55 mm aluminosilicate (Gorilla-class) or 0.4 mm sapphire, black mask print, display + camera + LED windows, AR + AF coating | 3–6 (+$300 tooling) | Alibaba custom cover glass |
| ME5 | COPY key cap | 316L, Ø5 mm, polished top, flange | 1.50 | PCBWay CNC |
| ME6 | Gasket / adhesive | 3M VHB 5952 die-cut 0.25 mm *or* FIP silicone | 0.50 | Die-cut vendor |
| ME7 | Fasteners | 2× M1.2×2.0 Torx T2, A2 stainless, PCB to internal frame bosses (none visible) | 0.20 | McMaster / Alibaba |
| ME8 | Vent | ePTFE membrane Ø3 mm, IP67-grade (for the BME688) | 0.40 | Gore PolyVent equivalent |
| ME9 | Battery foam + Kapton | 0.1 mm PI tape, 0.2 mm PORON | 0.20 | — |
| | | | **≈ 55–90** | |

### B3 · Charger: the LOT PUCK

| Ref | Part | Spec | Est. $ @100 | Source |
|-----|------|------|-------------|--------|
| CH1 | Qi TX module, **pre-certified**, 5 V, 5 W, single coil | Must expose FOD tuning or allow it to be relaxed for the small receiver | 5–8 | Alibaba `Qi transmitter module 5W FCC` |
| CH2 | Alignment magnet | N52 ring under the coil + 1 thin steel or magnet disc in the tile, outside the coil | 0.60 | — |
| CH3 | Puck body | Ø50×8 mm 6061 aluminium, bead-blast, silver, *or* 316L to match the tile | 6–12 | PCBWay CNC |
| CH4 | USB-C cable, 1 m, braided, white or silver | USB 2.0 C–C 3 A | 2.00 | OEM |
| CH5 | Silicone foot pad | 0.5 mm, anti-slip | 0.20 | — |
| | | | **≈ 14–23** | |

### B4 · Box and print

| Item | Spec | Est. $ @100 |
|------|------|-------------|
| Rigid box 70×70×25 mm, white, foil "LOT" | 2-piece, foam insert for tile + puck | 3–5 |
| Printed quick-start card (from 07-USER-MANUAL) | 1 card 60×60 mm, duplex | 0.40 |
| Serial / FCC label, inside lid | — | 0.10 |

## C · PER-UNIT ROLL-UP AT 100 UNITS (estimate)

```
Electronics BOM ........................  ~$57
PCB fab + PCBA (PCBWay turnkey, 4L HDI)  ~$18–28   (setup/stencil amortised over 100)
Mechanical (CNC 316L, polish, glass) ...  ~$55–90
Charger puck ...........................  ~$14–23
Box + print ............................  ~$4–6
Assembly, test, pack (own labour) ......  ~$10
──────────────────────────────────────────────────
PER UNIT ...............................  ~$158–214
RUN-100 VARIABLE .......................  ~$16k–21k
NRE: certification $3–8k · glass tooling $0.3k · EVT/DVT prototypes $6–12k
```

## D · BUYING ORDER (lead-time driven)

1. **Now (P1):** section A. This is the only spend needed for the next session.
2. **EVT-1 start (long lead, 4–8 wk):**
   - Memory LCD × 10.
   - BHI260AP × 10.
   - Battery samples (3 sizes).
   - Ceramic inlay samples.
   - Cover-glass samples.
3. **DVT:** Qi TX modules × 25, then puck CNC × 25.
4. **RUN-100:** order 115 % of anything mechanical, to allow for polish and glass rejects. Order 105 % of electronics.
