---
title: "LOT-01 SQUARE — Electrical Design & PCBWay Fab Pack"
subtitle: "Doc 05 · Rev A (2026-11-24)"
---

# LOT-01 — Electrical Design & PCBWay Fab Pack

## 1. Block diagram and nets

| Block | Part | Bus / pins (ESP32-S3) | Notes |
|---|---|---|---|
| Power | BQ25120A | I²C0 (SDA GPIO8, SCL GPIO9), /INT → GPIO10, MR (button) | SYS rail 3.3 V buck (300 mA) for the MCU. LDO 1.8 V not used. VBAT monitor over I²C |
| Wireless RX | PTX30W | Stand-alone; VOUT → BQ25120A IN; status → GPIO17 | Runs without the MCU, so a dead battery still charges |
| Display | LS013B7DH03 | SPI2 (SCLK GPIO12, MOSI GPIO13, CS GPIO14), EXTCOMIN GPIO15 (RTC IO), DISP GPIO16 | 3.0 V. EXTCOMIN toggled at 1 Hz by the ULP-RISC-V in deep sleep |
| Camera | GC032A | DVP 8-bit D0–D7 GPIO 39–42/1–4 *(final map in schematic)*, PCLK, VSYNC, HREF, XCLK (LEDC 20 MHz), SCCB on I²C1, PWDN via load switch | Power gated by TPS22916 load switch, so 0 µA when off |
| Weather | BME688 | I²C0 addr 0x76 | Thermal slot in the PCB around U2 |
| Motion | LSM6DSV16X | I²C0 addr 0x6A, INT1 → GPIO7 (RTC wake) | MLC: pick-up / double-tap |
| Button | Tact SW1 | GPIO6 (RTC, ext1 wake), plus the BQ25120A MR for a 10 s hard reset | GPIO0 stays a strap pin, on a test pad only |
| Haptic | Ø8 coin ERM | GPIO5 → AO3400-class N-MOSFET, flyback diode | 70 mA for 60–120 ms |
| USB (factory) | ESP32-S3 USB-Serial/JTAG | GPIO19/20 to pogo pads | Flash and log without a connector |
| RF | Chip antenna + pi-match | LNA_IN | Follow Espressif hardware design guidelines. 50 Ω CPWG on L1 |

## 2. Power budget (target)

| State | Current | Duty | Average |
|---|---|---|---|
| Deep sleep (RTC + ULP VCOM toggle) | 12 µA | ~99.4 % | 12 µA |
| Memory LCD static | 5 µA | 100 % | 5 µA |
| IMU MLC | 25 µA | 100 % | 25 µA |
| BME688 (ULP mode, 1 reading / 5 min) | ~0.1 mA · 1 % | | ~10 µA (BSEC ULP mode ~0.09 mA avg, est.) |
| Wi-Fi sync (connect + TLS + poll) ~2.5 s @ 95 mA every 10 min | | 0.42 % | 400 µA |
| Buzz / screen update / button | | | ~20 µA |
| **Total** | | | **≈ 0.47 mA → 90 mAh ≈ 190 h ≈ 8 days** |

Wi-Fi is >80 % of the budget. Ways to bring it down: TLS session resumption (cuts
~1 s), a stored BSSID/channel (fast reconnect), and a server-adaptive interval
(longer at night).

## 3. PCB spec for PCBWay (main board)

| Parameter | Value |
|---|---|
| Size | 37.0 × 37.0 mm outline with cut-outs (battery bay 26 × 31 mm in Zone A, camera notch) |
| Layers | 4 (Sig / GND / PWR+Sig / Sig), HDI 1+2+1 if BGA fan-out needs it |
| Thickness | 0.6 mm FR-4 TG170 |
| Copper | 1 oz outer / 0.5 oz inner |
| Min track/space | 0.075/0.075 mm (3/3 mil) |
| Vias | 0.2/0.4 mm mechanical; 0.1 mm laser microvia, via-in-pad filled and capped for the WCSP (BQ25120A, PTX30W) |
| Finish | ENIG 2 µin |
| Impedance | 50 Ω single-ended (RF), 90 Ω differential (USB pads). Impedance coupon |
| Solder mask | Matte black, white silkscreen (internal, no branding needed) |
| Panel | 2 × 3 with rails and fiducials, V-score not allowed (use tab routing) |
| Testing | Flying-probe E-test 100 % |

## 4. PCBA notes (turnkey)

* Double-sided: top side has the LCD FPC connector, camera connector and button. The back side has all ICs under 1.0 mm.
* X-ray on the QFN-56 thermal pad and on the WLCSP parts.
* Program the factory test image over the USB pogo pads at PCBWay (they offer programming) or in-house with the jig.
* Conformal coat: none (sealed case). Apply a nano-coating on the BME688 area **only if it is masked**, because coating kills the gas sensor.

## 5. Files to deliver to PCBWay (S2+)

`LOT01_MAIN_RevA_gerber.zip`, `_drill.zip`, `_BOM.xlsx` (with LCSC part numbers),
`_CPL.csv` (pick and place), `_assembly_top/bottom.pdf`, `_stackup.pdf`,
`LOT01_NFCANT_RevA_gerber.zip` (flex), `README_fab.txt` (this section).
