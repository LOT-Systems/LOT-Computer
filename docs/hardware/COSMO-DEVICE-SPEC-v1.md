<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Inventor
  COSMO® CIA Hardware Division
  Document: COSMO-DEVICE-SPEC-v1.md
  Classification: Internal Engineering — Confidential
  Date: 2026-06-12
-->

# COSMO® Cube — Device Specification v1.0

**Document:** COSMO-DEVICE-SPEC-v1.md  
**Product:** COSMO® Cube  
**Classification:** Engineering Specification — Internal  
**Author:** Vadim Marmeladov, Inventor, COSMO® CIA  
**Date:** 2026-06-12  
**Status:** Draft for PCBWay Submission  

---

## 1. Product Overview

The COSMO® Cube is a personal ambient intelligence device — a hardware node connected to the LOT Systems platform at lot-systems.com. It sits on a desk or pocket, receives autonomous notifications from the AI-powered LOT site, captures environmental data, and sends behavioral signals back via a single physical button.

This is not a smartphone. It is a dedicated companion device for LOT Users with a Benchmark score of Purple or higher — an ambient window into their LOT operating system.

---

## 2. Physical Specifications

| Parameter | Value |
|-----------|-------|
| Form Factor | Flat square tablet |
| Dimensions | 40mm × 40mm × 5mm |
| Weight | ~28g (target, including battery) |
| Body Material | 316L Stainless Steel, CNC Machined |
| Body Parts | 2 (Base plate + Front bezel, snap/screw join) |
| Side A (Back) | Mirror-polished stainless steel — #8 finish |
| Side B (Front) | Satin/bead-blasted surface, functional face |
| Color | Natural silver stainless |
| Engraving | LOT® wordmark, laser engraved, Side A center |
| COSMO® mark | Laser engraved, Side A bottom-right, 4pt |
| Water Resistance | IP54 (splash resistant) |
| Operating Temp | 0°C to +45°C |
| Storage Temp | -20°C to +60°C |

---

## 3. Front Face Layout (Side B — 40mm × 40mm)

```
┌────────────────────────────────────────┐
│                                        │  ← SS Bezel, satin finish
│   ┌──────────────────────────────┐     │
│   │                              │     │
│   │        OLED DISPLAY          │     │
│   │      26mm × 26mm active      │     │
│   │    (1" square, 128×128)      │     │
│   │                              │     │
│   └──────────────────────────────┘     │
│                                        │
│     [●]          [◉]          [■]     │
│  Camera        Button        LED       │
│  5mm dia       8mm dia      2mm dia    │
│  cutout        recess       diffuser   │
│                                        │
└────────────────────────────────────────┘
         ↑ weather mesh (0.5mm holes)
```

### Front Face Elements

| Element | Spec | Position |
|---------|------|----------|
| OLED Display | 1.0" square, 128×128 px, SSD1327 controller | Top-center, 7mm from top edge |
| Camera | 2MP, f/2.2, fixed focus, flush-mounted | Bottom-left, 8mm from left, 5mm from bottom |
| Copy Button | Stainless tactile dome, 8mm diameter | Bottom-center |
| Status LED | RGB LED behind frosted SS diffuser | Bottom-right |
| Weather Mesh | Micro-perforated SS, 5×5mm area | Right edge, center height |
| Charging Contact | Hidden flush pogo pins (2×) for dock alt. | Bottom edge |

---

## 4. Back Face (Side A — Mirror Polished)

- Mirror polished to #8 finish (reflective, no grain)
- LOT® wordmark engraved center (0.3mm deep laser etch, filled black)
- COSMO® CIA engraved lower-right (0.2mm deep)
- Serial number engraved lower-left (format: CQ-[UNIT]-[YEAR], e.g. CQ-001-26)
- No cutouts, ports, or protrusions
- Wireless charging coil embedded behind this surface

---

## 5. Electronics Architecture

### 5.1 System-on-Module: ESP32-S3-MINI-1U

| Parameter | Value |
|-----------|-------|
| MCU | ESP32-S3, Xtensa LX7 dual-core, 240MHz |
| AI Acceleration | 512KB vector instructions (on-device inference) |
| RAM | 512KB SRAM + 2MB PSRAM (external) |
| Flash | 8MB NOR SPI Flash |
| WiFi | 802.11b/g/n 2.4GHz, WPA3 |
| Bluetooth | BLE 5.0 |
| Module Size | 15.4mm × 20.5mm × 3.1mm |
| GPIO Count | 36 usable |
| ADC | 12-bit, 20 channels |
| Temperature Range | -40°C to +85°C |

**Why ESP32-S3:** Native WiFi for real-time LOT API polling, built-in vector acceleration for local inference (notification filtering), proven ecosystem, PCBWay-certified module.

### 5.2 Display: SSD1327 OLED 1.0" Monochrome

| Parameter | Value |
|-----------|-------|
| Controller | Solomon Systech SSD1327 |
| Resolution | 128×128 pixels |
| Color | 16-level grayscale (4-bit) |
| Interface | SPI (4-wire, up to 10MHz) |
| Active Area | 26mm × 26mm |
| Module Dimensions | 32mm × 32mm × 1.6mm |
| Viewing Angle | >160° |
| Contrast Ratio | >2000:1 |
| Supply Voltage | 3.3V (logic), internal DC-DC for OLED |
| Power (active) | ~20mA |
| Power (idle) | <1mA |

### 5.3 Camera: Himax HM01B0

| Parameter | Value |
|-----------|-------|
| Sensor | Himax HM01B0 (ultra-low power CMOS) |
| Resolution | QVGA 320×320 / QCIF 176×144 |
| Interface | DVP (8-bit parallel) or MIPI |
| Frame Rate | 60fps (QVGA) |
| Power | 1.1mW at 30fps QVGA |
| Package | CSP 2.45mm × 2.45mm × 1.6mm |
| Lens | M7 fixed-focus, f/2.2, HFOV 66° |
| AI Features | On-chip AE, AWB, histogram |

**Primary use:** Face detection for owner recognition (COSMO® Soul Sync gate), QR code capture for pairing, activity logging image snapshot.

### 5.4 Weather & Environmental Sensors

#### Primary Weather: Bosch BME280

| Parameter | Spec |
|-----------|------|
| Part | Bosch BME280 |
| Measures | Temperature, Humidity, Barometric Pressure |
| Temperature Range | -40°C to +85°C, ±0.5°C |
| Humidity Range | 0–100% RH, ±3% RH |
| Pressure Range | 300–1100 hPa, ±1 hPa |
| Interface | I2C (up to 3.4MHz) or SPI |
| Package | LGA 2.5×2.5×0.93mm |
| Current | 3.6µA at 1Hz sampling |

#### AI-Grade IMU: TDK InvenSense ICM-42688-P

| Parameter | Spec |
|-----------|------|
| Part | TDK ICM-42688-P |
| Type | 6-Axis IMU (3-axis accel + 3-axis gyro) |
| Accel Range | ±2g to ±16g, 0.004mg/LSB noise |
| Gyro Range | ±15.625 dps to ±2000 dps |
| Interface | SPI (up to 24MHz) or I2C |
| Package | QFN 2.5×2.5×0.91mm |
| Current | 680µA (full operation) |
| Use Case | Motion detection, orientation, gesture, tap-to-wake |

#### Ambient Light + Gesture: Broadcom APDS-9960

| Parameter | Spec |
|-----------|------|
| Part | Broadcom APDS-9960 |
| Measures | Gesture, Proximity, ALS, RGBC color |
| Gesture Range | Up/Down/Left/Right, 10–20cm |
| Interface | I2C |
| Package | LCC 3.94×2.36×1.35mm |
| Current | 0.001µA (sleep) |
| Use Case | Wake on hand approach, notification dismiss gesture |

### 5.5 Power Architecture

#### Battery

| Parameter | Value |
|-----------|-------|
| Chemistry | Lithium Polymer (LiPo) |
| Capacity | 280mAh (custom cell) |
| Dimensions | 35mm × 35mm × 2.5mm |
| Nominal Voltage | 3.7V |
| Max Charge | 4.2V |
| Discharge Cutoff | 3.0V |
| Connector | JST 1.25mm 2-pin |
| Estimated Life | ~18 hours active, ~4 days standby |

#### Wireless Charging

| Parameter | Value |
|-----------|-------|
| Standard | Qi (WPC 1.3) |
| Max Power | 5W receiver |
| Coil | Round, 30mm diameter, 0.4mm thick |
| Receiver IC | Texas Instruments BQ51013B |
| Charge Voltage | 5V → regulated to 4.2V |
| Efficiency | ~85% at alignment |
| Indicator | LED pulse during charging |

#### Power Management IC: Texas Instruments BQ25892

| Parameter | Value |
|-----------|-------|
| Part | TI BQ25892 (or BQ25895) |
| Input | 5V via Qi, up to 9V |
| Charge Current | 100mA–3A programmable |
| Regulation | 4.2V (LiPo), ±1% |
| System Output | 3.3V @ 500mA (for MCU, sensors) |
| I2C | Configuration via ESP32-S3 |
| Protection | OVP, OCP, OTP, short circuit |

#### Regulated Rails

| Rail | Voltage | Source | Consumers |
|------|---------|--------|-----------|
| VSYS | 3.7V (battery) | LiPo | BQ25892 input |
| VCC | 3.3V | BQ25892 SYS | ESP32-S3, sensors |
| VOLED | 7-9V | OLED internal boost | Display |
| VCAM | 1.8V | LDO (AP2112K) | Camera |

---

## 6. Connectivity

| Protocol | Use |
|----------|-----|
| WiFi 802.11n 2.4GHz | LOT API polling, OTA firmware updates |
| BLE 5.0 | Companion app pairing, local config |
| I2C Bus (400kHz) | BME280, APDS-9960, OLED |
| SPI Bus (10MHz) | ICM-42688-P, additional flash |
| DVP / MIPI | Camera |
| 2× Pogo Pins (bottom edge) | Optional dock charging contact + UART debug |

---

## 7. LOT Platform Integration

### 7.1 Copy Button Function

Pressing the physical Copy button:
1. Captures current environmental snapshot (temp, humidity, pressure, light, orientation)
2. Captures camera frame (optional, user-configurable)  
3. Packages as JSON payload
4. POSTs to `https://lot-systems.com/api/hardware/log`
5. Includes device serial, timestamp (UTC), sensor data, user token
6. Site displays entry in **Log tab** with tag `[COSMO® Cube]`
7. Device LED pulses green (success) or red (failed, retries 3×)

### 7.2 Notification Display

- Device polls `https://lot-systems.com/api/hardware/notifications` every 60 seconds via WiFi
- Alternatively: maintains persistent WebSocket/SSE connection to lot-systems.com
- Received notification JSON → rendered on OLED display
- Display format: notification text (e.g., "Coffee time!"), source, timestamp
- Max display duration: 30 seconds, then returns to clock/status screen
- Notification queue: up to 10 pending, FIFO

### 7.3 Authentication

- Device provisioned with unique API key at manufacture time
- API key stored in ESP32-S3 NVS (encrypted flash partition)
- TLS 1.3 for all API calls, certificate pinned to lot-systems.com CA
- Key rotation: OTA update via secure firmware channel

---

## 8. Display Content States

| State | Screen Content |
|-------|---------------|
| **Clock** (default) | Time HH:MM, date, weather temp |
| **Notification** | Message text, LOT logo small, source label |
| **Charging** | Battery percentage + Qi indicator animation |
| **Log Sent** | "Logged." confirmation, 3 seconds |
| **Pairing** | QR code for app pairing |
| **Sleep** | Display off (ambient light < threshold) |
| **Low Battery** | Battery icon, percentage, charge reminder |
| **Error** | Error code + short descriptor |

---

## 9. Firmware Summary

See COSMO-FIRMWARE-v1.md for full specification.

| Layer | Technology |
|-------|-----------|
| RTOS | FreeRTOS (via ESP-IDF 5.2) |
| Language | C / C++17 |
| WiFi Stack | ESP-IDF lwIP + mbedTLS |
| Display Driver | Custom SSD1327 SPI driver |
| Camera Driver | ESP32-S3 Camera (esp32-camera component) |
| Sensor Drivers | I2C/SPI HAL layer |
| OTA | ESP-IDF OTA (HTTPS signed) |
| Secure Boot | RSA-3072 signed bootchain |
| Flash Encryption | AES-256 XTS |

---

## 10. Regulatory Targets

| Certification | Region | Status |
|--------------|--------|--------|
| FCC Part 15 | USA | Required before US sale |
| CE Mark | EU | Required before EU sale |
| IC | Canada | Required before Canada sale |
| RoHS | Global | PCBWay ensures compliance |
| REACH | EU | Material compliance via SS 316L |
| Qi Certification | Global | WPC certification required |

**Note for 100-unit production run:** Pre-certification development units only. FCC/CE required before commercial sale. Budget ~$15,000–$25,000 for full certification.

---

## 11. Power Budget

| Condition | Current Draw | Battery Life |
|-----------|-------------|-------------|
| Active WiFi, display on | ~180mA | ~1.5 hours |
| WiFi polling (60s interval), display on | ~45mA | ~6 hours |
| Deep sleep, wakeup every 60s | ~2mA | ~5.8 days |
| Charging (Qi, 5W) | N/A | ~2.5 hours full charge |

**Target real-world:** 18 hours with WiFi polling every 60s, display active 20% of time.

---

*Document v1.0 — COSMO® CIA — LOT Systems, Inc.*  
*Inventor: Vadim Marmeladov*
