# LOT-DEVICE-01 · Roadmap & Analysis

**Doc:** LOT-HW-ROADMAP · Rev A · 2026-11-20

## 1. Phases

| Phase | Weeks | Output | Gate |
|---|---|---|---|
| **S1: Plan + connector** *(done 2026-11-20)* | 0 | Plan, BOM, enclosure stack-up, firmware skeleton, **server API live on dev branch** | Build green |
| **S2: Dev-kit loop** | 1–3 | Buy the Stage A kit (~$175). Flash firmware. BLE provisioning. Site Settings → Device UI. TLS pinning | Copy from device appears in Log tab on staging |
| **S3: AI notifications** | 2–4 | QIE / memory engine → `queueDeviceNotification(…,'ai')` (weather + archetype + self-care). BSEC2 IAQ | ≥ 5 useful nudges/day, no repeats |
| **S4: EVT** | 4–10 | Schematic + 4-layer layout (KiCad). PCBWay 10 PCBA + 10 CNC bodies (stacked, 6.0 mm). OTA | Test plan (Firmware §8) passes on 8/10 |
| **S5: DVT** | 10–16 | Side-by-side layout → **5.0 mm**. Mirror-polish QA. Antenna tuning. Pre-scan for FCC | 20 units, height ≤ 5.1 mm, RF pre-scan pass |
| **S6: Certification** | 14–20 | FCC 15B/15C (+ CE/UKCA if shipping to EU/UK). UN38.3 on cell | Grants issued |
| **S7: PVT + 100-unit pilot** | 18–24 | 100 units via PCBWay. Charger pucks. Packaging. PDF manuals | 100 units shipped, < 3 % RMA |

Critical path: **custom LiPo + cover glass lead time → DVT → FCC**. Earliest realistic pilot ship date is about **24 weeks from S2 start (mid-2027)**.

## 2. Decisions needed from Vadik

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Where wireless charging enters a steel body | (a) face-down through front glass · (b) ceramic/sapphire inlay in back · (c) magnetic pogo pins (not wireless) | **(a)** keeps the back pure mirror steel |
| D2 | Radio: bare chip vs. pre-certified module | Bare ESP32-S3 (thin, needs full FCC 15C ≈ $8–15k) · ESP32-S3-MINI-1 module (+1.5 mm, mostly reuses module grant) | Module for EVT. **Bare chip for DVT+ only if 5.0 mm is non-negotiable** |
| D3 | Height | 5.0 mm (~80 mAh, ~9 days) · 5.5 mm (~120 mAh, ~14 days) | Hold 5.0 as the target. Accept 5.5 if D2 = module |
| D4 | Camera purpose | Photo-to-Log (long-press) · on-device AI presence detection (HM0360) · both | Photo-to-Log first, presence later |
| D5 | Screen | Sharp Memory LCD (silver reflective, always-on, µW) · OLED (black, brighter, more power) | **Memory LCD**: matches "flat silver" |
| D6 | Sale vs. gift | Selling needs FCC + consumer labelling. A 100-unit internal / dev-kit run has lighter paths (verify with a test lab) | Talk to a lab before S4 |

## 3. Risk register

| Risk | L | I | Mitigation |
|---|---|---|---|
| Steel kills Wi-Fi / Qi | High | High | Glass-side antenna + coil. Steel-plate test in S2 (Stage A BOM line) |
| 5 mm stack not reachable | Med | High | Side-by-side layout. D3 fallback |
| Battery swelling in a rigid steel shell | Low | High | 0.3 mm swell gap, quality cell, charge to 4.2 V max at ≤ 0.5 C |
| Mirror polish yield | Med | Med | First-article 5 sets. Protective film until unboxing |
| BME688 self-heating | High | Low | Read before radio. Slot isolation. Firmware offset |
| Notification fatigue | Med | Med | One nudge per slot per day. User controls in Settings (S3) |
| Price | Med | Med | Landed $94–163/unit at 100. Volume (1k) would roughly halve enclosure + PCBA |

## 4. What the software side already gives us

- The API connector exists (`/api/device/v1/*`). No migration is needed.
- The Log tab renders `device_copy`.
- Autonomous nudges ("Coffee time.") work today from user time zone. S3 upgrades them to AI-generated text.
