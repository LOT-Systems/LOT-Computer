# 09 · 100-UNIT PRODUCTION RUN

```
DOCUMENT  HW-09-PROD      ISSUE 2026.11.25      CLASS INTERNAL / MANUFACTURING
```

## 01 · Build quantities

| Item                  | Order | Reason                                 |
|-----------------------|-------|----------------------------------------|
| PCBA                  | 115   | 100 + 10 spares + 5 for test-jig golden units |
| Steel body sets       | 112   | Cosmetic rejects on Side A             |
| Cover glass           | 130   | Breakage in assembly                   |
| Batteries             | 120   | Incoming-inspection rejects            |
| Docks                 | 105   |                                        |

## 02 · Flow

```
PCBWay PCBA ──► flash factory FW (pogo jig) ──► board test T1
                                                   │
Steel sets ──► incoming cosmetic + CMM sample      │
Glass      ──► incoming                            │
Battery    ──► incoming (OCV, IR, thickness)       │
                                                   ▼
             Final assembly (LOT bench or PCBWay box-build):
             battery → PCBA → coil flex → display → glass into Part B → close J1 screws
                                                   │
                                                   ▼
             Final test T2 ──► 24 h burn-in (sync every 5 min on test Wi-Fi) ──► T3
                                                   │
                                                   ▼
             Serialise, pair-code label, film on Side A, box, ship
```

## 03 · Tests

**T1, board (pogo jig, ≤ 60 s):** rails 3V3 ± 3 %; sleep current ≤ 20 µA;
I²C scan finds BME688, LSM6DSV16X, MAX17048, PTX30W; display test pattern;
camera frame CRC; Wi-Fi RSSI to a reference AP at 1 m; write serial + keys.

**T2, assembled (≤ 3 min):** boots in the case; Copy dome force and click;
screen through glass, no dust; Wi-Fi RSSI in steel within 10 dB of T1; charge
on a golden dock ≥ 40 mA; BME688 reads within ± 1.5 °C / ± 5 % RH of a
reference; IMU flip detected; photo capture.

**T3, after burn-in:** no resets in 24 h; battery drop within the expected
budget; final cosmetic check of Side A under a 1000 lux light box at 30 cm,
AQL 1.0.

The test jig firmware is the same codebase with `-DLOT_FACTORY=1` (F-8).
T1–T3 results are POSTed to an internal `/api/factory/results` endpoint,
keyed by serial, so every shipped unit has a record.

## 04 · Box contents

- TILE (Side A under protective film)
- Dock + 1 m USB-C cable (no power adapter)
- Quick-start card (from doc 10) with a pairing QR code
- Serial + proof-of-possession code label inside the lid

## 05 · Compliance checklist

| Item                         | Needed for                    |
|------------------------------|-------------------------------|
| FCC Part 15B + 15C (radio)   | US sale                       |
| CE RED, EMC, LVD, RoHS, REACH| EU sale                       |
| UN38.3 + MSDS for the cell   | Shipping lithium batteries    |
| WEEE / battery-directive marks | EU                          |
| Skin-contact: 316L nickel release (EN 1811) | Worn or handheld steel |
| FCC ID / CE mark laser-etched on the inner wall or the e-label screen | Labelling |

## 06 · Logistics

- PCBWay ships PCBA DHL in 3–5 days. Batteries go separately by sea or as
  UN3481 (packed with equipment) once installed.
- Final assembly at the LOT bench is recommended for the first 100 units:
  the steel finish and glass need careful hands, and every unit gets paired
  and tested against lot-systems.com before it ships.
