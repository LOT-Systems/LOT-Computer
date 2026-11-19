# 05 · PCB and assembly at PCBWay

*Session 01 · 2026-11-19*

## 1. Board specification

| Parameter | Value |
|---|---|
| Outline | 38.0 × 38.0 mm, R1.5 corners, camera pocket cut-out ~7 × 7 mm |
| Layers | 6 (HDI 1+4+1), laser microvias, via-in-pad filled and capped |
| Thickness | 0.8 mm EVT → 0.6 mm DVT |
| Min trace/space | 0.075 / 0.075 mm |
| Finish | ENIG |
| Mask / silk | Matte black / white |
| Impedance | 50 Ω on the antenna feed (coplanar waveguide, ground below) |
| Panel | 2 × 2, mouse-bites + fiducials, 5 mm rails |
| Sides | Components on top. The bottom (battery side) gets only flat parts ≤ 0.6 mm |

## 2. Block schematic (to be drawn in KiCad, session 02)

```
USB-less design. Programming via Tag-Connect TC2030 pads (UART0 + EN + IO0 + 3V3 + GND).

LiPo ─┬─ DW01A/FS8205 ─┬─ BQ51050B (Qi Rx + charger) ─ L1 coil
      │                └─ (pogo pads: VIN, GND)  ← dock fallback
      ├─ MAX17048 (I²C 0x36)
      └─ TPS62840 ─ 3V3 ─┬─ ESP32-S3-PICO-1 ─ 2450AT18A100 antenna (π-match)
                          ├─ LS013B7DH03  SPI: SCK IO12, MOSI IO11, CS IO10, EXTCOMIN IO9, DISP IO8
                          ├─ HM0360       DVP: D0–D7 IO15–IO18, IO38–IO41; PCLK IO13; VSYNC IO14; HREF IO21; MCLK IO47; I²C shared
                          │               load switch on 3V3/1V8 rails (camera fully off when unused)
                          ├─ BME688  I²C 0x77   ┐
                          ├─ BMI270  I²C 0x68   ├─ I²C SDA IO1, SCL IO2 (4.7 k pull-ups)
                          ├─ SHT45   I²C 0x44   ┘
                          ├─ BMI270 INT1 → IO3 (RTC GPIO, wake on pick-up)
                          ├─ SW1 Copy → IO4 (RTC GPIO, wake), 100 nF debounce
                          ├─ M1 coin motor ← IO5 via N-MOSFET + flyback diode
                          └─ LED1 camera-on ← IO6 (hard-wired to camera power-enable too)
```

Pin map is a starting point. Check it against the ESP32-S3-PICO-1 datasheet strapping pins (IO0, IO3, IO45, IO46) before layout.

## 3. Layout rules that matter

1. Antenna at a board corner under the glass mask, with copper keep-out on all layers per the antenna datasheet, ≥ 3 mm from the steel frame.
2. The Qi coil sits on the LCD side. The coil's ferrite faces the PCB. No copper pour directly under the coil on L1.
3. The BME688 on a slotted tongue, far from the ESP32 and the charger IC.
4. Test points for 3V3, VBAT, VCHG, and the I²C bus on the bottom, reachable by the pogo jig.
5. One 0402 0 Ω on each power rail so sleep current can be measured during EVT.

## 4. PCBWay order pack (what to upload)

| File | Content |
|---|---|
| `L01_gerbers.zip` | Gerbers RS-274X + Excellon drill + outline + panel drawing |
| `L01_bom_pcbway.xlsx` | Ref, qty, MPN, manufacturer, package, *consigned?* column |
| `L01_cpl.csv` | Pick-and-place: Designator, Mid X, Mid Y, Layer, Rotation |
| `L01_assembly.pdf` | Top/bottom drawings, polarity, X-ray note for LGA |
| `L01_stackup.pdf` | 6-layer HDI stack-up + impedance request |

Ordering steps:

1. **PCB** → "Advanced/HDI PCB" quote. Enter the spec from §1, upload the gerbers.
2. **PCBA** → "Turnkey assembly" on the same order. Upload the BOM + CPL. Mark the LCD and camera as *consigned* if PCBWay can't buy them, and ship those to PCBWay.
3. Ask for **X-ray** (LGA SiP + DSBGA) and **first-article photos** before the full batch.
4. EVT: 5 assembled + 5 bare. PVT: 120 assembled (2 × 2 panels, 30 panels).
5. Ship DDP with flashed test firmware if PCBWay offers programming. Otherwise program at the jig.

## 5. KiCad plan

- Repo path: `hardware/pcb/` (created in session 02).
- Libraries: Espressif KiCad lib (ESP32-S3-PICO-1), SnapEDA footprints for LS013B7DH03 FPC, BQ51050B, BME688.
- Output with the KiCad → PCBWay plugin so the CPL and BOM formats match.
