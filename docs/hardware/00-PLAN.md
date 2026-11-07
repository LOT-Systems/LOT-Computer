# 00 — PLAN

## Concept
A silent object on a desk. It receives **autonomous, AI-written notifications** from lot-systems.com
("Coffee time!"), shows them on a tiny screen, and returns one signal: press the button ("Copy") and the
site's **Log tab** records it. It also measures weather/air and reports it. Two faces:

- **Face A — mirror:** polished stainless steel, nothing else.
- **Face B — interface:** camera, screen, button (behind a non-metal window; see conflict C1).

Form: flat silver square **40 × 40 × 5 mm**, two stainless parts (back plate + front frame), wireless charging.

## Requirement traceability (your 19 points)
| # | Requirement | Where addressed | Status |
|---|-------------|-----------------|--------|
| 1 | PCBWay | 05 — PCB, SMT assembly, CNC steel all quotable at PCBWay | Planned |
| 2 | Pager-like notification from AI site | 04 — scheduled job → Claude writes text → device poll/push | Designed |
| 3 | 2-part stainless body | 02 — 316L back plate + frame | Designed |
| 4 | Flat silver square 4×4 cm × 5 mm | 02 — stack budget | **Tight, feasible** |
| 5 | Camera | 01/03 — Himax HM0360-class ultra-thin module | Selected |
| 6 | LOT API connector | 04 — `/api/device/*` | Designed (not built) |
| 7 | PDF manuals | `pdf/`, `build-pdf.sh` | Done (this session) |
| 8 | Compress info each session | `SESSION-DIGEST.md` | Done |
| 9 | Firmware documents | 03 | Done |
| 10 | Software to connect with firmware | 04 (provisioning CLI + web pairing) | Designed |
| 11 | Separate documents | one file per topic | Done |
| 12 | Charger | 01 — Qi puck, 5 V/1 A | Selected |
| 13 | 100-unit run | 05 | Planned |
| 14 | Weather sensor | 01 — SHT45 (T/RH) + BMP390 (pressure) | Selected |
| 15 | AI-grade off-the-shelf sensors | 01 — BME688 (AI gas), BHI260AP (on-chip AI IMU) | Selected |
| 16 | "Copy" button → Log tab | 04 — `POST /api/device/event {type:"copy"}` | Designed |
| 17 | One side polished steel | 02 — #8 mirror, ~Ra 0.05 µm | Designed |
| 18 | Other side camera+screen+button | 02 | Designed |
| 19 | Wireless charging | 02/01 — coil behind glass window | **Conflict C1** |

## Engineering verdict & conflicts (read these)
- **C1 — Steel blocks Qi and Wi-Fi.** A fully steel shell cannot be wirelessly charged or have a working antenna.
  Resolution: Face B carries a **glass/sapphire-ceramic window** covering screen + coil + antenna keep-out; charger sits on Face B.
  Face A stays pure polished steel. Alternative: ceramic (zirconia) back = no metal on Face B at all.
- **C2 — 5 mm is extremely thin** with camera + screen + battery + Wi-Fi MCU. Budget closes only at ~3.4 mm internal
  height with a ~90–120 mAh battery (≈ days of standby, not weeks, with camera idle). Camera is event-triggered only.
- **C3 — Privacy:** a camera on a notification object needs a hardware shutter/LED or "off unless asked" policy. Default: camera disabled in firmware, enabled per-user opt-in.
- **C4 — Radio compliance:** a 100-unit run with Wi-Fi/Qi needs FCC/CE pre-scan; use a **pre-certified module** (ESP32-C3-MINI-1).
- **C5 — Cameras at "AI grade":** 320×320 low-power sensor supports presence/QR/gesture, not photography. Set expectations.

## Design principles (brand-neutral until brand.lot-systems.com is read)
Monolithic, quiet, one gesture, one signal back. No logo on Face A except optional laser micro-mark on edge.
