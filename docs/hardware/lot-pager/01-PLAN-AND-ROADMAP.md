# LOT® PAGER (HW-01) — Plan & Roadmap

Owner: Vadik Marmeladov, Inventor · COSMO® CIA · Version 0.1 · 2026-10-17
Status: PLAN — nothing ordered, nothing fabricated.

## 1. What it is

A 40 × 40 mm flat stainless-steel object that receives short autonomous
notifications from lot-systems.com ("Coffee time!") on a small screen, and
sends a signal back to the site's **Log** tab when its single button
("Copy") is pressed. Camera and weather sensing make it an input device for
the LOT® system, not only an output.

- Side A: polished stainless steel, blank.
- Side B: screen, camera, button.
- Charging: wireless (Qi). No port. Sealed.

Lineage: CUBIQ™ (docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md) is the haptic
notification body; COSMO® Cube (LOT-MANIFEST, brave-lamport-t9z5u8) is the
general-purpose computer. LOT® PAGER sits between them: screen + camera +
sensors, no actuated motion. It does not reuse the name CUBIQ™ or Cube.

## 2. Requirement trace (your 19 points)

| # | Requirement | Where addressed |
|---|---|---|
| 1 | PCBWay | 04-ELECTRONICS-PCBWAY, 07-PRODUCTION-100 |
| 2 | Pager-like notification from AI site | 06-API-CONNECTOR §3 |
| 3 | 2-part stainless body | 03-MECHANICAL |
| 4 | Flat silver square 4×4 cm × 5 mm | 03-MECHANICAL §2 (**5 mm not feasible in v0 — see §4**) |
| 5 | Camera | 02-BOM, 05-FIRMWARE §6 |
| 6 | LOT API connector | 06-API-CONNECTOR |
| 7 | PDF manuals | build.sh → /pdf (generated) |
| 8 | Compress info per session | 08-SESSION-PROTOCOL |
| 9 | Firmware documents | 05-FIRMWARE |
| 10 | Software to connect with firmware | tools/pager-sim.mjs, 06 |
| 11 | Separate documents | one file per discipline (this folder) |
| 12 | Charger | 02-BOM §Charging, 03 §5 |
| 13 | 100-unit run | 07-PRODUCTION-100 |
| 14 | Weather sensor | BME688 (T/RH/P/gas) |
| 15 | AI-grade off-the-shelf sensors | 02-BOM §Sensors |
| 16 | Copy button → Log tab | 06 §4 (uses existing POST /api/logs) |
| 17 | Polished stainless side | 03 §3 |
| 18 | Camera + screen + button side | 03 §2 |
| 19 | Wireless charger | 02-BOM, 03 §5 |

## 3. Phased roadmap

| Phase | Weeks | Output | Gate to next phase |
|---|---|---|---|
| P0 Dev kit | 0–3 | Off-the-shelf ESP32-S3 + 1.3" IPS + BME688 on a breadboard; pager-sim.mjs talks to a staging LOT server; Copy writes a Log entry | Notification → screen → button → Log works end-to-end |
| P1 Server | 2–5 | Device endpoints (06 §3) behind a feature flag; device tokens; AI notification generator | Staging green |
| P2 Board v0.1 | 4–10 | 4-layer PCB, 2 spin of 5 boards at PCBWay; sizes to 40×40 mm outline | Board boots, Wi-Fi, screen, BME688, Qi charge ok |
| P3 Enclosure EVT | 8–14 | 10 CNC 316L two-part shells at ~8–9 mm; polished | Fit check, RF check through steel, thermal check |
| P4 Camera/AI | 10–16 | Camera capture → upload → server-side AI; privacy shutter policy | Capture works inside enclosure |
| P5 DVT | 14–22 | 25 units, full firmware, OTA, drop/ingress tests, FCC/CE pre-scan | Pre-scan pass |
| P6 Pilot 100 | 22–34 | 100-unit build (07) | Yield ≥ 90 %, burn-in pass |
| P7 Slim v1 | 30+ | Chase the 5 mm target with flex PCB + custom camera | Only if P6 sells the idea |

Total to 100 units: **~8 months** from a funded start. Dominant risk is
enclosure + RF, not electronics.

## 4. Key finding: 4×4 cm × 5 mm is not achievable in v0

Stack inside a 5 mm body with 2 × ~0.5 mm steel walls leaves ~4 mm:

| Layer | Thickness |
|---|---|
| Screen module (IPS 1.3", incl. glass+FPC) | ~1.5–2.0 |
| PCB + tallest parts (ESP32-S3-MINI-1 is 2.4) | ~3.2 |
| Li-Po (thinnest practical, e.g. 301830-class) | ~3.0 |
| Qi coil (flex, w/ ferrite) | ~0.5–0.8 |
| Camera (smallest common DVP modules are 5–6 mm tall) | ~5+ |

Even before steel the sum is >10 mm if stacked. Realistic targets:

- **v0/P3: 40 × 40 × 9 mm** (what we can actually build).
- **v1: ~40 × 40 × 6.5 mm** with side-by-side layout, 1.54" e-paper or thinner
  screen, wafer camera, flex PCB — needs custom parts and a larger NRE.
- **5 mm** requires dropping the camera or the battery (tethered/charged-pad
  operation). Decision needed from Vadik — see 09-RISKS D1.

## 5. Decisions needed from Vadik

1. Accept 9 mm for v0, or drop camera/battery to chase 5 mm?
2. Screen: IPS colour (richer, ~60–80 mA) vs. e-paper (pager feel, days of battery, slow refresh)?
3. "Copy" copies what? (Assumed: marks the current notification as acknowledged and logs it; nothing goes to the clipboard of a host.)
4. Camera privacy: physical shutter vs. LED + log-everything policy.
5. Budget ceiling for the 100-unit run (07 estimates $12–20k).
