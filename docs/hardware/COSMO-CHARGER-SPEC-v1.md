<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA Hardware Division
  Document: COSMO-CHARGER-SPEC-v1.md
  Wireless Charger Specification
  Date: 2026-06-12
-->

# COSMO® Cube — Wireless Charger Specification v1.0

**Document:** COSMO-CHARGER-SPEC-v1.md  
**Date:** 2026-06-12  

---

## 1. Overview

The COSMO® Cube charges exclusively via wireless Qi induction. There is no USB port on the device (by design — for aesthetic and IP54 integrity). The charging pad ships in the box with every unit.

---

## 2. Receiver (In-Device)

| Parameter | Value |
|-----------|-------|
| Standard | Qi WPC 1.3 |
| Receiver IC | TI BQ51013B |
| Coil diameter | 30mm |
| Coil inductance | 15µH ± 20% |
| Ferrite sheet | 35×35×0.3mm between coil and battery |
| Max input power | 5W |
| Charge voltage output | 5V (regulated by BQ25892) |
| Alignment indicator | LED breathing white when charging |
| Misalignment behavior | No charge, LED off |
| Foreign object detection | Via BQ51013B FOD |
| Thermal protection | BQ25892 OTP at 80°C |

### 2.1 Coil Placement (Cross-section)

```
┌──────────────────────────────┐  ← Back plate (SS, 0.5mm, mirror polished)
│   [COSMO® engraving]         │
└──────────────────────────────┘
 ────────────────────────────────  ← Ferrite sheet (0.3mm)
 ╔══════════════════════════════╗  ← Qi receiver coil (0.4mm)
 ╚══════════════════════════════╝
 ────────────────────────────────  ← Thermal pad (0.2mm)
┌──────────────────────────────┐
│  [LiPo 280mAh — 2.5mm]       │   Battery
└──────────────────────────────┘
┌──────────────────────────────┐
│  [PCB — 0.8mm] [Components]  │   PCB assembly
└──────────────────────────────┘
┌──────────────────────────────┐  ← Front bezel bottom edge (SS)
│  [OLED] [Camera] [Button]    │
└──────────────────────────────┘
```

---

## 3. Transmitter (Desktop Charging Pad)

### 3.1 Technical Specification

| Parameter | Value |
|-----------|-------|
| Standard | Qi 5W (WPC 1.3 certified) |
| Form factor | 80mm × 80mm × 6mm square pad |
| Top material | Matte black TPU (non-slip) |
| Bottom | Weighted SS base plate (non-slip) |
| Transmitter IC | TI BQ500215 or STMicro STWBC-EP |
| Input | USB-C, 5V / 2A (10W input max) |
| Output efficiency | ~85% at optimal alignment |
| Coil | 40mm diameter Qi Tx coil |
| LED indicator | Breathing white (charging), solid green (complete) |
| Foreign object detection | Yes (built-in) |
| Operating temperature | 0°C to +40°C |
| Cable included | 1.5m USB-C to USB-A, braided nylon |
| Certifications | CE, FCC (pre-certified OEM module) |

### 3.2 LOT Branding on Pad

| Element | Specification |
|---------|---------------|
| Logo position | Top center, 20mm wide |
| Logo art | "LOT®" wordmark in silver metallic ink |
| Print method | Silkscreen or pad print |
| Bottom label | "COSMO® Cube Wireless Charger" + safety info |

### 3.3 Sourcing

| Detail | Value |
|--------|-------|
| Supplier | OEM Qi pad manufacturer (Alibaba/Shenzhen) |
| Search terms | "5W Qi wireless charging pad square OEM custom logo" |
| Quantity | 100 units |
| Unit price (100+) | ~$7–$12 |
| Lead time | 3–4 weeks (with custom branding) |
| Certification | Request CE + FCC pre-certified module |

---

## 4. Charging Performance

| Condition | Charge Time |
|-----------|------------|
| 0% → 80% (fast phase) | ~1.5 hours |
| 80% → 100% (trickle phase) | ~1.0 hour |
| 0% → 100% (full) | ~2.5 hours |
| Maintenance (pad always on) | Safe — BQ25892 manages trickle |

---

## 5. Charging Setup Instructions (for Quick Start Card)

```
1. Place the LOT® charging pad on your desk.
2. Connect via USB-C (5V / 2A minimum — use included cable or any USB-C charger).
3. Place your COSMO® Cube face-up on the pad, centered.
4. LED breathes white = charging. LED solid green = full.
5. Remove when done, or leave on pad — device manages charging automatically.

Note: Mirror-polished side faces up when charging
      (the polished side is the back — the pad charges through it).
```

---

*Document v1.0 — COSMO® CIA — LOT Systems, Inc.*  
*Inventor: Vadim Marmeladov — 2026-06-12*
