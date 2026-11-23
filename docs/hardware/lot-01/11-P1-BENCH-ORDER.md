# LOT·01 — P1 Bench Order & PCBWay Quote Request

> Phase P1 (W1–W3) proves the whole loop on the bench before any custom board exists: "Coffee time!" → buzz → Copy → Log tab.
> Rev A · 2026-11-23 · S02. Prices are approximate. Check stock on the day you order.

## 1. Bench kit: order ×2 (one kit for firmware, one for the Qi and RF tests)

| # | Part | Why | Where (link) | ≈ USD each | Notes |
|---|---|---|---|---|---|
| B1 | **Espressif ESP32-S3-DevKitC-1-N8R2** | Same S3 core as EVT, with 8 MB flash and 2 MB PSRAM | [DigiKey 15199627](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-S3-DEVKITC-1-N8R2/15199627) | 15–21 | DigiKey SG showed ~$20.90 and an 8-week standard lead time. Do **not** buy the `-1U` variant: DigiKey CA lists it as obsolete |
| B2 | **Sharp LS013B7DH03 breakout** (128×128, 1.28″) | The exact EVT panel, for firmware fonts and the Qi-through-LCD test | [Tindie: Questwise Ventures](https://www.tindie.com/products/questwise-ventures/sharp-128-ultralow-power-10ua-128x128-memory-lcd/) | ~14–17 + ship | **Long lead risk:** the bare panel on [DigiKey](https://www.digikey.com/en/products/detail/sharp-microelectronics/LS013B7DH03/425-2903-ND/5300387) showed 0 stock and a 28-week lead. Order EVT panels **now** (see §3) |
| B3 | **BME688 breakout** (weather + AI gas) | BSEC2 tuning, case-heat compensation | [Adafruit BME688](https://www.adafruit.com/product/5046) · [Pimoroni](https://shop.pimoroni.com/en-us/products/bme688-breakout) · [SparkFun Qwiic](https://www.mouser.in/new/sparkfun/sparkfun-environmental-sensor-breakout-bme688/) | ~20 | Any of the three works; all are I²C |
| B4 | **LSM6DSOX breakout** (IMU with ML core) | Double-tap and pick-up wake on INT1 | [Adafruit 4438](https://www.adafruit.com/product/4438) | ~12 | Product number not re-verified this session |
| B5 | **MAX17048 fuel-gauge breakout** | Battery % on screen and in telemetry | [Adafruit 5580](https://www.adafruit.com/product/5580) | ~6 | Product number not re-verified this session |
| B6 | **TI BQ51050BEVM-764** Qi RX eval kit | The EVT Qi receiver IC. Test coupling through glass + LCD | [DigiKey 3881826](https://www.digikey.co.uk/en/products/detail/texas-instruments/BQ51050BEVM-764/3881826) | ~50–70 | RS lists it as **discontinued**. Buy 2 while DigiKey still has them. TI guide: [SLUUA25](https://ti.com/lit/pdf/sluua25) |
| B7 | Qi 5 W transmitter pad (any WPC-certified) | Charger side of the B6 test | Consumer pad from a known brand | ~15 | Becomes the v1 bundled charger if it passes the ΔT test |
| B8 | 8 mm coin LRA + DRV2603/DRV2605L breakout | Pager buzz feel | [Adafruit DRV2605L](https://www.adafruit.com/product/2305) plus any 8 mm LRA | ~10 | EVT uses the DRV2603 (smaller). This breakout is only for tuning the feel. Product number not re-verified |
| B9 | **Seeed XIAO ESP32S3 Sense** | Fastest camera bring-up on an S3 (OV2640/OV3660 + PSRAM) | [Seeed](https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html) | ~14 | Camera only, until D-3 is decided. Link not re-verified |
| B10 | 100 mAh 2.2 mm LiPo (e.g. 402020 class) with PCM | Real Z-stack cell, for the power soak | Shenzhen cell vendor via PCBWay sourcing or AliExpress | ~3 | Ask for the UN38.3 report up front: it is needed for shipping in P6 |
| B11 | Glass coupons: 40×40×0.4 mm aluminosilicate, chem-strengthened, 2 ink-mask samples | Qi and RF through-glass tests | PCBWay / glass vendor (§2 Q3) | ~5 | |
| B12 | Bench: Nordic PPK2 (µA power profiler) | Validates the ~25 µA sleep / 16-day claim | [Nordic PPK2](https://www.nordicsemi.com/Products/Development-hardware/Power-Profiler-Kit-2) | ~100 | One for the team |

**Kit total ≈ $160–200 each → ~$400 for two kits + $100 PPK2 ≈ $500.**

### P1 test plan (exit = gate G0)
1. Flash the firmware with `LOT_API_BASE` pointed at staging and `LOT_DEVICES_ENABLED=true` set on staging.
2. Pair: the device shows `LOT-XXXX`, and the user calls `POST /api/devices/claim` (the Settings UI lands in S03).
3. Settings "Send test" (`POST /api/devices/test`) → buzz + "Coffee time!" within one poll.
4. Press Copy → the Log tab shows a note with `metadata.source = 'lot-01'`.
5. Stack glass coupon + LCD + coil on B6/B7: record charge current, coil ΔT after 30 min, and Wi-Fi RSSI at 10 m inside a stainless dummy shell.

## 2. PCBWay quote request (copy into the PCBWay quote/chat form)

> **Project:** LOT·01 — 40 × 40 mm two-part 316L stainless enclosure + 4-layer PCB. Prototype qty 15, then production 110.
>
> **Q1 — CNC Part A (back shell), qty 15:** 316L stainless, 40.0 × 40.0 mm, overall height 2.6 mm, wall/floor 0.40 mm, internal pocket 38.0 × 38.0 × 2.2 mm, outside corner R4.0. **Mirror polish #8** on the outer face and edges, no openings. Optional laser serial on the inside floor. Please quote polish separately and state the flatness you can hold on the 0.40 mm floor.
>
> **Q2 — CNC Part B (front bezel frame), qty 15:** 316L, 40.0 × 40.0 mm, height 2.4 mm, 2.0 mm bezel, glass ledge 0.40 mm deep, Copy-key slot 6.2 × 3.2 mm, Ø0.8 mm vent hole, M1.2 or press-fit joint to Part A. Bead-blast inside, brushed or polished outside (quote both).
>
> **Q3 — Cover glass, qty 30:** aluminosilicate, 0.40 mm, chemically strengthened, 36.0 × 36.0 mm, black ink mask with a Ø2.0 mm clear camera window and a clear 25 × 25 mm display window, AF coating.
>
> **Q4 — PCB, qty 15 (assembly) + 110 later:** 4-layer, **0.40 mm** total thickness, FR-4 TG170, 3/3 mil, via-in-pad for QFN56, ENIG, a 9 × 9 mm routed cut-out for the camera, castellated test pads. Turnkey SMT with LCSC/PCBWay sourcing for ESP32-S3FH4R2, BQ51050B, MAX17048, TPS62840, DRV2603, BME688, LSM6DSOX.
>
> **Please also state:** lead time for each item, the minimum stainless wall you will guarantee, and whether you can supply an FPC Qi receiver coil (≈ 25 mm, 0.3 mm) with a ferrite sheet.

Send-from address and NDA: Vadik's call. Nothing has been sent from this session.

## 3. Long-lead items to start now (before EVT)
| Item | Lead seen | Action |
|---|---|---|
| LS013B7DH03 bare panels ×20 | 28 weeks at DigiKey (0 stock) | Ask Sharp distributors (Future Electronics lists the part as active) and Data Modul for stock. **This is now the #1 schedule risk for EVT (W3)** |
| BQ51050BEVM-764 | Discontinued at RS | Buy 2 now |
| ESP32-S3FH4R2 bare chips | LCSC stocked (S01) | No action until EVT |
