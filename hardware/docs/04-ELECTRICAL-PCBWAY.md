# 04 · ELECTRICAL + PCBWAY ORDER

```
DOCUMENT  HW-04-ELEC      ISSUE 2026.11.25      CLASS INTERNAL / BUILD
```

## 01 · Block diagram

```
          NFC-WLC coil ──► PTX30W ──(charger)──► Li-Po 100 mAh ──► MAX17048 (I²C)
                             │ NFC data (pairing tap)             │
                             ▼                                    ▼
                          I²C bus                           VBAT 3.0–4.2 V
                                                                  │
                                         TPS62840 ──► 3V3_MAIN ───┼──► ESP32-S3-PICO-1
                                                                  │      ├─SPI──► LS013B7DH03
                                         TPS22916 ──► 3V3_CAM ────┼──────┤ DVP──► HM01B0
                                         TPS22916 ──► 3V3_SNS ────┘      ├─I²C──► BME688, LSM6DSV16X, MAX17048, PTX30W
                                                                         ├─GPIO─► Copy dome (RTC wake)
                                                                         ├─GPIO◄─ LSM6DSV16X INT1 (RTC wake)
                                                                         └─RF───► 2450AT18A100 chip antenna
```

## 02 · Pin map (ESP32-S3-PICO-1, draft)

| Signal            | GPIO        | Notes                                                   |
|-------------------|-------------|---------------------------------------------------------|
| COPY_BTN          | GPIO4       | RTC-capable, active low, 100 k pull-up, TVS to GND (GPIO0 stays a strap pin for factory boot) |
| IMU_INT1          | GPIO5       | RTC wake on pick-up / tap                               |
| I2C_SDA / SCL     | GPIO8 / GPIO9 | 4.7 k pull-ups to 3V3_SNS                             |
| LCD_SCK / MOSI / CS | GPIO12 / 11 / 10 | SPI2, CS active-high for Sharp memory LCD          |
| LCD_EXTCOMIN      | GPIO13      | 1 Hz VCOM toggle (LEDC, keeps running in light sleep; in deep sleep use the ULP or LCD's software VCOM) |
| LCD_DISP          | GPIO14      | Display on/off                                          |
| CAM_D0…D7         | GPIO15–18, 38–41 | 8-bit DVP (HM01B0 also supports 1-bit or 4-bit mode: use 4-bit to save pins) |
| CAM_PCLK / VSYNC / HSYNC / MCLK | GPIO42 / 47 / 48 / 21 |                         |
| CAM_EN            | GPIO1       | TPS22916 enable                                         |
| SNS_EN            | GPIO2       | TPS22916 enable (BME688 heater is the big sensor load)  |
| WLC_INT           | GPIO6       | PTX30W status / field detect                            |
| USB D− / D+       | GPIO19 / 20 | Test pads only (factory flash, no connector)            |
| UART TX / RX      | GPIO43 / 44 | Test pads only                                          |

Confirm every pin against the ESP32-S3-PICO-1 datasheet and the strapping
table before layout. GPIO26–32 are used by in-package flash/PSRAM.

## 03 · Power budget

| State                          | Current         | Time per day | mAh/day |
|--------------------------------|-----------------|--------------|---------|
| Deep sleep: RTC + LCD static + IMU ML core + gauge | ≈ 15 µA | ~23.5 h | 0.35 |
| Wi-Fi sync (connect + TLS + 1 request), 96/day | ≈ 110 mA avg × 1.8 s | 173 s | 5.3 |
| LCD refresh, 100/day           | 1 mA × 50 ms    | 5 s          | ~0 |
| BME688 forced-mode reading, 96/day | 12 mA × 0.2 s | 19 s       | 0.06 |
| Copy press (wake + Wi-Fi POST), 5/day | 110 mA × 2.0 s | 10 s    | 0.3 |
| Photo + upload, 1/day          | 140 mA × 4 s    | 4 s          | 0.16 |
| **Total**                      |                 |              | **≈ 6.2 mAh/day** |

At a 95 mAh usable cell this gives **≈ 15 days** at 15-minute sync, ≈ 28 days
at 30-minute sync. Always-on Wi-Fi (DTIM-3 modem sleep, ≈ 1.5 mA average)
would give ~2.5 days, which is why the design does not use it.

Peak current: Wi-Fi TX bursts reach ~350 mA. The Li-Po must be rated ≥ 3C
pulse (a 100 mAh cell at 3C = 300 mA, marginal). Add 2 × 22 µF + 100 µF
low-ESR bulk on 3V3_MAIN and set Wi-Fi TX power to ≤ 15 dBm. This is risk R4.

## 04 · PCB specification

| Parameter            | Value                                                  |
|----------------------|--------------------------------------------------------|
| Outline              | 38.0 × 38.0 mm, R3 corners, camera cut-out 6 × 6 mm top-left |
| Layers               | 4 (1-2-1 HDI): signal / GND / power / signal           |
| Thickness            | 0.6 mm                                                 |
| Min trace / space    | 0.075 / 0.075 mm                                       |
| Vias                 | 0.1 mm laser micro-via (L1-L2, L3-L4), 0.2 mm mechanical |
| Finish               | ENIG                                                   |
| Solder mask          | Matte black                                            |
| Impedance            | 50 Ω coplanar line to the antenna, controlled          |
| Components           | Top: display FPC, coil pads. Bottom: SiP, sensors, PMIC, battery pads |
| Test pads            | USB D±, UART, EN, GPIO0, VBAT, 3V3, GND: pogo grid at 1.27 mm for the test jig |

EDA: **KiCad 8**. Project goes in `hardware/pcb/` (next session).

## 05 · Antenna note

Follow the Johanson layout note for 2450AT18A100 exactly (ground clearance,
matching pi-network footprint, 0402). Leave the matching network populated
with 0 Ω / DNP and tune it with a VNA on the **assembled TILE in its steel
body**. The steel detunes the antenna, so tuning on a bare board does not hold.

## 06 · PCBWay order sheet

**PCB — "Advanced PCB / HDI" quote**

```
Board type        Single pieces (panelised by PCBWay, V-cut NOT allowed with cut-out → tab-route)
Size              38 × 38 mm
Qty               10 (EVT-1), 20 (EVT-2/DVT), 110 (PVT/production)
Layers            4, HDI 1+2+1
Material          FR-4 TG170
Thickness         0.6 mm
Min track/space   3/3 mil
Min hole          0.1 mm laser / 0.2 mm mechanical
Surface finish    ENIG 2 µ"
Solder mask       Matte black, white silkscreen
Impedance control Yes (50 Ω, provide stack-up)
Via process       Via-in-pad filled and capped under SiP
Electrical test   Flying probe, 100 %
```

**PCBA — "Turnkey assembly"**

```
Sides             Double-sided
Unique parts      ~22 ; placements ~60
Smallest package  0201 ; LGA 7×7 SiP ; WLCSP (MAX17048 / TPS22916)
Inspection        AOI + X-ray on SiP and WLCSP
Programming       Flash factory test firmware via pogo jig (provide .bin)
Consigned parts   LS013B7DH03, HM01B0 module, battery (hand-fitted at final assembly, not reflowed)
Files             Gerbers, drill, IPC-356 netlist, BOM (MPN), centroid (XY), assembly PDF
```

**Flex coil — "Flexible PCB" quote**: 2-layer polyimide 0.11 mm, 1 oz Cu,
24 × 24 mm coil with 10 mm tail, stiffener at the tail, ENIG pads.

## 07 · Design review checklist (before sending Gerbers)

- [ ] Every RTC wake source is on an RTC-capable GPIO
- [ ] Strap pins (GPIO0, 3, 45, 46) at safe defaults
- [ ] Antenna keep-out matches the steel relief in Part B
- [ ] BME688 placed away from the SiP and buck (self-heating error)
- [ ] BME688 under the vent channel, thermally isolated with slots
- [ ] Coil ferrite overlaps the battery footprint
- [ ] Battery protection (PCM) on cell + PTX30W thermal limit set
- [ ] Test pads reachable through the open Part B with display not fitted
