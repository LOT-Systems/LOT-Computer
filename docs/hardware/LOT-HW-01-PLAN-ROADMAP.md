# LOT-HW-01 — Plan & Roadmap (v0.3)

## 1. Product
- **Form:** flat silver square, 40 × 40 mm, 2-part 316L stainless body. Target 5 mm; see R1, recommended 5.4 mm max.
- **Side A:** polished mirror stainless, no openings.
- **Side B:** screen, camera (with shutter LED), one button ("Copy").
- **Inside:** ESP32-S3 (Wi-Fi/BLE), 1.54″ e-paper or 0.96″ OLED, BME280/BME688 weather sensor, IMU, light sensor, LiPo, Qi receiver, haptic.
- **Job:** receive AI-written pager notices from LOT; Copy → Log tab; weather → site; charge wirelessly.

## 2. Your 19 points → where they are handled
| # | Requirement | Answer | Status |
|---|---|---|---|
| 1 | PCBWay | PCB + PCBA + CNC steel quotes, doc 06 | Plan |
| 2 | Pager notice from AI site | `queueDeviceNotice()` + `/api/device/inbox` | **Built** |
| 3 | 2-part stainless body | Back shell + front bezel, 316L, doc 06 | Plan |
| 4 | 4×4 cm × 5 mm | 40×40 OK; 5.0 mm only without camera/Qi → R1 | Decision |
| 5 | Camera | OV2640/GC2145, must be ≤ 3.5 mm tall for slim build | Sourcing |
| 6 | LOT API connector | doc 03, `device-api.ts` | **Built** |
| 7 | PDF manuals | `pdf/` regenerated each session | **Built** |
| 8 | Compress each session | `sessions/` one-page reports | Ongoing |
| 9 | Firmware docs | doc 04 | v0.1 |
| 10 | Software ↔ firmware | simulator/CLI, doc 05 | **Built** |
| 11 | Separate documents | 8 docs + reports | Done |
| 12 | Charger | Off-the-shelf certified 5 W Qi pad | Plan |
| 13 | 100-unit run | doc 06 | Plan |
| 14 | Weather sensor | BME280 (EVT) → BME688 (DVT) | **Built in API + FW** |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC AI gas), LSM6DSO, VEML7700 | BOM |
| 16 | Copy → Log tab | `device_copy` event, `PAGER:` row | **Built** |
| 17 | One polished side | Side A | Plan |
| 18 | Camera + screen + button side | Side B | Plan |
| 19 | Wireless charger | Qi RX through a glass window (R2) | Decision |

## 3. System flow
```
LOT site AI / scheduled job ── queueDeviceNotice(userId,"Coffee time!") ──► logs(event=device_notice, pending)
                                                                              │
Pager ── GET /api/device/inbox (every 60 s) ◄────────────────────────────────┘
  ├─ screen + buzz ── POST /api/device/ack ──► notice marked delivered
  ├─ button "Copy"  ── POST /api/device/event {type:copy} ──► logs(event=device_copy) ──► Log tab "PAGER:"
  └─ every 15 min   ── POST /api/device/event {type:sensor} ──► logs(event=device_sensor, hidden)
```

## 4. Mechanical stack (planning values, not datasheet-checked)
| Layer | Full | Slim (rec.) |
|---|---|---|
| Steel back (A) | 0.8 | 0.6 |
| Battery | 3.0 (≈250 mAh) | 2.0 (≈130 mAh) |
| PCB + parts | 1.6 | 1.2 |
| Display | 1.0 | 0.9 |
| Front glass/bezel (B) | 1.0 | 0.7 |
| **Total** | **7.4** | **5.4** |
Qi coil sits beside the battery under the front glass, so it adds no height. The camera must be ≤ 3.5 mm or sit in a lens pocket.

## 5. Roadmap (analysis)
| Phase | Weeks | Window | Exit | Cash (est.) |
|---|---|---|---|---|
| P0 Decisions | 1–2 | Nov 11–24 | R1/R2/R3 signed | $0 |
| P1 Breadboard | 3 | Nov 18–Dec 9 | Devkit + e-paper + BME280 runs firmware v0.1 against site | $150–300 |
| P2 Site API | — | **done S3** | Deploy migration + routes; pair real token | dev time |
| P3 EVT (5 boards) | 8 | Dec 9–Feb 3 | KiCad schematic/PCB, PCBWay PCBA, 1 CNC steel shell | $1.5–2.5k |
| P4 DVT (20–30) | 8 | Feb 3–Mar 31 | Final body, Qi through glass ≥ 60 % eff., 72 h soak, drop test | $5–8k |
| P5 Compliance pre-scan | 4 | Mar 31–Apr 28 | FCC/CE pre-scan, UN38.3 path | $3–10k |
| P6 PVT 100 units | 8 | Apr 28–Jun 23 | 100 pass jig, signed OTA, PDF manuals in box | $5–7k |

- **Critical path:** R1/R2 sign-off → steel CNC + polish spins (3–5 weeks each) → Qi through glass → compliance.
- **Realistic:** first 100 units **Jun–Aug 2027**. Expect a 30–40 % slip at DVT.
- **Budget:** about $15–30k all-in (about $150–300 per unit amortised); marginal cost about $63 per unit (BOM sum at qty 100, doc 02).
- **Change since S2:** P2 (site API) is done, about 3 weeks early. The calendar is unchanged because P0 is still open.

## 6. Risks
R1 thickness · R2 steel blocks Qi · R3 steel detunes Wi-Fi · R4 heat in a sealed body (charge at 0.5C, NTC) · R5 camera privacy (off by default, LED, no upload in v1) · R6 mirror polish scratches · R7 0.6 mm walls may not stay flat (needs PCBWay DFM) · R8 prices and links are estimates, not live quotes.
