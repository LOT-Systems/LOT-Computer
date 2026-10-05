# 01 — PLAN & ROADMAP

## 1. Product definition

| Item | Spec |
|------|------|
| Form | 40 × 40 mm square, 5 mm target thickness (see risk R1) |
| Body | Two-part 316L stainless steel (front bezel + back plate) |
| Back | Flat, polished stainless, no openings |
| Front | Small screen, camera, one button ("Copy") |
| Compute/radio | ESP32-S3 class SoC, Wi-Fi + BLE |
| Sensing | Weather: temperature / humidity / pressure (+ gas, AI-grade) |
| Power | Thin Li-Po, wireless (Qi) charging |
| Link | HTTPS to lot-systems.com via LOT API connector |
| Run | 100 units, PCB + assembly by PCBWay |

Behaviour:
1. Site's AI engine decides a nudge is due ("Coffee time!") and queues it for the device.
2. Device fetches it, shows it on screen, buzz/chirp (pager-like).
3. Button "Copy" acknowledges; device POSTs a log event; it appears in the Log tab.
4. Device periodically posts weather readings; camera captures on demand only.

## 2. Brief-to-plan traceability (all 19 items)

| # | Brief item | Where handled |
|---|-----------|---------------|
| 1 | PCBWay | 02 (PCB/assembly lines), 05 §4 |
| 2 | Pager-like AI notification | 04 §2 |
| 3 | 2-part stainless body | 05 §1 |
| 4 | 4×4 cm × 5 mm flat square | 01 R1, 05 §1 |
| 5 | Camera | 02, 03 §5, 05 §6 |
| 6 | LOT API connector | 04 |
| 7 | PDF manuals | manuals/, 03 §7 |
| 8 | Compress info each session | README digest, sessions/ |
| 9 | Firmware documents | 03 |
| 10 | Software to connect with firmware | 04 §4 |
| 11 | Separate documents | this set |
| 12 | Charger | 05 §3 |
| 13 | 100-unit run | 02 §3, 01 §5 |
| 14 | Weather sensor | 02, 03 |
| 15 | AI-grade off-the-shelf sensors | 02 (BME688 + BHI260AP optional) |
| 16 | "Copy" button → Log tab | 04 §3 |
| 17 | Polished stainless side | 05 §1 |
| 18 | Camera + screen + button side | 05 §1 |
| 19 | Wireless charger | 05 §3 |

## 3. Risk register

| ID | Risk | Severity | Mitigation |
|----|------|----------|-----------|
| R1 | 5 mm total thickness: shell walls (2×0.6) + PCB (0.8) + display (≥1.2) + cell (≥2.0) + camera (≥2.5 Z) cannot be stacked. | HIGH | Side-by-side layout (camera/button beside screen), flex PCB, 2 mm pouch cell (~60–80 mAh). EVT at 7–8 mm to prove function, squeeze to 5 mm in DVT. If it fails, ship 6.5 mm and say so. |
| R2 | Stainless steel attenuates Qi (eddy currents). | HIGH | Charge through the front (glass) face, or non-metal inlay in back plate. Test both in EVT. See 05 §3. |
| R3 | Metal case detunes the Wi-Fi/BLE antenna. | HIGH | Plastic/ceramic antenna window or gap between the two steel parts. Antenna keep-out; test in EVT. |
| R4 | Camera privacy (always-near-person device). | MED | No always-on capture. Capture only on button, hardware LED lit, no audio. Document in manual. |
| R5 | Tiny battery (~70 mAh) gives short runtime. | MED | Deep sleep + wake-on-timer polling (every 60–300 s); screen on only for notifications. Target ≥3 days. |
| R6 | Lithium cell shipping and certification (UN38.3, FCC, CE, Qi). | MED | Pre-certified radio module; budget for test lab; 05 §5. |
| R7 | Stainless machining cost at 100 units. | MED | Quote CNC vs MIM; polish as separate op. 05 §1. |
| R8 | Brand sites unreadable this session. | LOW | Re-run when egress allows, or Vadik pastes brand rules. |

## 4. Roadmap (calendar assumes start Oct 2026)

| Phase | Window | Exit gate |
|-------|--------|-----------|
| P0 Plan (this doc) | Oct 2026 | Vadik approves BOM direction + decisions §6 |
| P1 Software first | Oct–Nov 2026 | `/api/device/*` endpoints live; simulator device passes round trip (notify → show → Copy → Log tab) |
| P2 EVT dev boards | Nov–Dec 2026 | ESP32-S3 dev kit + display + BME688 + camera on breadboard, talking to staging |
| P3 EVT PCB v1 (PCBWay proto, 5–10 pcs) | Dec 2026–Jan 2027 | Board boots, Wi-Fi OK, Copy → Log works, charging works on a bare coil |
| P4 Enclosure prototypes (3D-printed steel / CNC 3–5 pcs) | Jan–Feb 2027 | RF + Qi measured inside steel; thickness verdict |
| P5 DVT (20 units) | Mar–Apr 2027 | Pre-compliance pass, battery life measured, manuals v1 |
| P6 Compliance | Apr–Jun 2027 | FCC/CE/Qi/UN38.3 reports |
| P7 PVT / 100-unit run | Jun–Aug 2027 | 100 units shipped, yield >90% |

Dates are planning estimates, not commitments.

## 5. 100-unit run plan
- Buy parts for 120 (20% attrition for rework, steel scrap, DOA).
- PCBWay: PCBA turnkey, 100 + 5 spares; request X-ray on any BGA/QFN with thermal pad.
- Steel: 110 shells (2 parts each) to allow polishing rejects.
- Per-unit flash + provisioning: device ID + token via the host tool (04 §4); log in a CSV.
- Test fixture: pogo-pin jig, runs the self-test (03 §6), prints pass/fail.
- Estimated unit cost at 100 qty: see 02 §3 (roughly $95–$170/unit, dominated by steel + assembly).

## 6. Decisions needed from Vadik
1. Accept EVT at 7–8 mm, with 5 mm as the DVT goal? (Recommended: yes.)
2. Charging from the front/screen side vs. a non-metal inlay on the polished back? (Recommended: test both; front first.)
3. Camera: still image on button, or also a periodic image to the site? (Recommended: on-demand only.)
4. Screen: 1.14" colour IPS (recommended) vs 0.96" OLED vs 1.54" e-paper.
5. Provide brand colours/logo if different from LOT-STYLE-GUIDE (brand site was unreachable).
