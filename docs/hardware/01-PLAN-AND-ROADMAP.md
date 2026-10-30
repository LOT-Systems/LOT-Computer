# 01 — Plan & Roadmap

## 1. Product in one paragraph
A 40 × 40 mm two-part stainless-steel pager. Back: polished mirror stainless. Front: small screen, camera, one button. Wi-Fi to lot-systems.com. The site pushes short notices ("Coffee time!") that the device shows; the button ("Copy") sends an acknowledgement event that appears in the site Log tab; onboard sensors report weather/air quality. Charges wirelessly.

## 2. Requirements trace (your 19 points)
| # | Requirement | Where addressed | Status |
|---|-------------|-----------------|--------|
| 1 | PCBWay | PCB + PCBA + CNC all via PCBWay (02) | Planned |
| 2 | Pager-like notification from AI-powered site | 03 `/device/inbox` + 04 notify state | Spec'd |
| 3 | 2-part stainless body | 05 | Spec'd, **see risk R1/R2** |
| 4 | Flat silver square 4×4 cm × 5 mm | 05 | **5 mm not feasible with everything inside; ~8–9 mm realistic** (R3) |
| 5 | Camera | OV2640 / GC2145 class module | BOM |
| 6 | LOT API connector | 03 | Spec'd; server endpoints not yet written |
| 7 | PDF manuals | 06 | Planned |
| 8 | Compress info each session | 06 §3 rule; session reports end with a 10-line digest | Active |
| 9 | Firmware documents | 04 | Spec'd |
| 10 | Software to connect with firmware | 04 §6 (provisioning/flash CLI + web serial page) | Spec'd |
| 11 | Separate documents | This folder, one doc per concern | Done |
| 12 | Charger | Qi puck (RX on device) + USB-C service port | BOM |
| 13 | 100-unit run | 02 §4 cost model, roadmap phase 5 | Estimated |
| 14 | Weather sensor | BME688 (T/RH/P/gas) + UV/light | BOM |
| 15 | AI-grade off-the-shelf sensors | BME688 + Bosch BSEC/AI Studio classes; ESP32-S3 vector instructions for camera inference | BOM |
| 16 | "Copy" button → Log tab | 03 event `hw_copy` | Spec'd |
| 17 | One side polished stainless | 05 | Spec'd |
| 18 | Other side camera + screen + button | 05 layout | Spec'd |
| 19 | Wireless charger | Qi RX, **needs non-metal window (R2)** | BOM |

## 3. Architecture
```
 lot-systems.com (Fastify API)
   POST /api/device/pair      ← one-time claim code
   GET  /api/device/inbox     → pending notices (device polls / long-poll)
   POST /api/device/event     ← hw_copy, sensor frames, ack
   Log tab (event types hw_copy, hw_ack, hw_weather)
        ▲ HTTPS + per-device bearer token
 LOT Node: ESP32-S3 · e-paper/OLED · BME688 · camera · button · Qi RX · LiPo
```
Polling (every 60 s awake window, deep-sleep between) is chosen over websockets: lower power, simpler server. Latency target < 90 s.

## 4. Roadmap (dates assume start Nov 2026; adjust)
| Phase | Weeks | Output | Gate |
|-------|-------|--------|------|
| 0 Spec freeze | 1–2 | These docs reviewed by Vadik; brand pass (brand.lot-systems.com) | Sign-off |
| 1 Server connector | 2–4 | `/api/device/*` endpoints + Log event types, token auth, tests | Green benchmark |
| 2 Dev-kit prototype | 3–6 | ESP32-S3 dev board + OLED + BME688 + button on breadboard talking to the site | Button press visible in Log tab |
| 3 Custom PCB rev A | 6–11 | 4–6 layer PCB, 5 units via PCBWay PCBA | Boots, charges via Qi, shows notice |
| 4 Enclosure EVT | 8–14 | 316L CNC 2-part body ×5 (PCBWay CNC), polish, RF/Qi test | Wi-Fi RSSI and Qi ≥ 70 % of open-air |
| 5 DVT/PVT | 14–20 | Rev B PCB + body tweaks, 20 units, 72 h soak, drop/ESD | Defect rate < 5 % |
| 6 Pilot run | 20–26 | **100 units**, QC, serials, manuals PDF | Ship |

## 5. Risks (ranked)
- **R1 Stainless blocks Wi-Fi/BLE.** A closed metal box is a Faraday cage. Mitigation: use the seam between the two body parts as a dielectric slot/window (plastic or PEEK ring) over the antenna, or ceramic/glass front lid. Test early (Phase 4 part 1).
- **R2 Stainless blocks Qi.** Coil must face a non-metal surface with ferrite backing. The polished steel back cannot be the charging face. Charge through the front window (puck cradles the device face-up/face-down) or a non-metal inset on the back. Decide before CAD.
- **R3 5 mm height.** Stack: screen ≈1.5, PCB+MCU module 2.4+, coil+ferrite ≈1, battery ≥2.5–3, body walls 2×0.8. Does not fit in 5 mm. Options: (a) 5 mm "plate" + 3–4 mm rear boss, (b) accept ~8.5 mm, (c) drop the battery (tethered/charge-only, no). Recommend (b) with 5 mm at the perimeter edge via chamfer to *look* 5 mm. Needs Vadik's call.
- **R4 Face crowding.** Camera + screen + button on 40×40: use ~0.96″ OLED (128×64, ideal for short text) rather than 1.54″ e-paper.
- **R5 Brand/product conflict.** `docs/corporate/LOT-AMBIENT-AI-VISION.md` states Ambient AI "does not send push notifications". A pager contradicts that. Suggest framing as "earned-moment display": site decides when; device is quiet otherwise (no sound by default, haptic only).
- **R6 Privacy.** A camera on an always-connected device: hardware shutter or off-by-default, no frames leave the device without a button gesture, on-device inference only for v1.
- **R7 Lead-time/price drift** of ESP32-S3, BME688 (verify stock).
- **R8 Compliance.** FCC/CE (radio, Qi), UN38.3 for shipping LiPo, "Made in the USA" claim conflicts with PCBWay (China) manufacturing — do not use that line on the device. Needs legal/compliance review.

## 6. Open questions for Vadik
1. Accept ~8.5 mm thickness (R3)?
2. Which face charges (R2)? 
3. Camera purpose in v1: photo capture, presence, or inference?
4. Final product name (placeholder "LOT® Node")?
5. Are brand.lot-systems.com / /about / institute CQGS pages inputs for the casing text/colours? They were unreachable from this session's network.
