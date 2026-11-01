# LOT PAGER (working name: LOT-HW-01) — Plan, BOM & Roadmap
Status: DRAFT v0.1 · 2026-11-01 · Owner: Vadik (Inventor, COSMO® CIA)
All prices are **order-of-magnitude estimates, not quotes**. Product links go to vendor home/search pages — verify part numbers and stock before ordering. brand.lot-systems.com, lot-systems.com/about and institute.lot-systems.com/cqgs.html were **not reachable from this session** (network allow-list), so brand rules below are placeholders to reconcile.

## 1. Product in one paragraph
A 40 × 40 × 5 mm two-part stainless-steel "pager" tied to lot-systems.com. Front: small screen, camera, one button ("Copy"). Back: polished stainless mirror. It shows autonomous notifications from the site ("Coffee time!"), reports ambient weather, and the button sends a "Copy" signal back to the site's **Log** tab. Charges wirelessly. Manuals, firmware docs and session reports are separate PDFs/MDs.

## 2. Requirement map (your 19 points)
| # | Requirement | Where addressed |
|---|---|---|
|1|PCBWay|§5 manufacturing (PCB + assembly + 3D/CNC quote)|
|2|Pager-like notification from AI site|API-CONNECTOR-SPEC.md, FIRMWARE-SPEC.md|
|3,17,18|2-part stainless body, polished side, front side w/ camera+screen+button|§4 mechanics|
|4|4×4 cm × 5 mm silver square|§4 — **tight, see risks R1–R3**|
|5,15,14|Camera, AI-grade off-the-shelf sensors, weather|BOM-v0.1.csv|
|6,16|LOT API connector, button→Log|API-CONNECTOR-SPEC.md|
|7,9,10,11|PDF manuals, firmware docs, host software, separate docs|§7 documentation set|
|8|Compress info per session|§6|
|12,19|Charger / wireless charger|§4 R2, BOM|
|13|100-unit run|§8 cost, §9 roadmap|

## 3. Architecture
```
 lot-systems.com (AI engine, QIE)
   │  HTTPS+WSS, device token
   ▼
 /api/device/*  ◄── NEW routes (spec in API-CONNECTOR-SPEC.md)
   │
 Wi‑Fi ▼
 ESP32‑S3 (Wi‑Fi/BLE, camera DVP, SPI display) ── sensors on I²C
   button → POST /api/device/button → Log (event "device_copy")
```
Why ESP32‑S3: Wi‑Fi+BLE in one module, native camera interface, huge community, OTA, cheap, PCBWay-assemblable. Alternative nRF5340/nRF54 if battery life matters more than camera.

## 4. Mechanics & power — critical analysis
- **R1 – 5 mm total height.** Stack: screen module (~1.5–2 mm) + PCB (0.8 mm) + battery + two steel walls (~0.5 mm each). A 4×25×30 mm LiPo (~150–250 mAh) already uses 4 mm. Camera modules are 2.5–4 mm. **A 5 mm total is only realistic if the camera sits beside, not under, the screen and the battery is ≤3 mm.** Recommendation: build rev A at 40×40×**7–8 mm** to prove function; shrink to 5 mm in rev B with a custom flex-PCB and 3 mm cell. Needs your sign-off.
- **R2 – Steel blocks wireless charging and radio.** Qi (≈110–205 kHz) will not pass through stainless; Wi‑Fi antenna will be detuned. Fix: charge through the **front window** (glass/sapphire/ceramic or plastic bezel) with a thin Qi receiver coil + ferrite sheet, and put the antenna under a non-metal window or use a slot/gap between the two steel parts. The polished back stays solid steel. Alternative: pogo/magnetic contacts (also satisfies "charger").
- **R3 – Ambient sensor in sealed steel.** Temperature/humidity/pressure need airflow: a 0.8 mm vent with ePTFE membrane (IP54-ish). Self-heating from the MCU will bias temperature — place sensor away, apply firmware offset.
- **R4 – Camera privacy.** Camera on a device wired to an AI site needs a hardware indicator LED/shutter and explicit capture-on-press only. Recommended default: **camera off; capture only on long-press**.
- Body: 316L stainless, 2 CNC (or MIM for 100+) parts, mirror-polished back, bead-blasted or polished front frame; laser-welded or 4 micro-screws. PCBWay offers CNC and sheet/3D services; get a quote for both CNC and MIM at 100 pcs.

## 5. Manufacturing path (PCBWay)
1. Gerbers + BOM + pick-and-place → PCBWay PCB Assembly (4-layer, 0.8 mm, ENIG, small panel; turnkey parts sourcing).
2. Enclosure: PCBWay CNC machining (316L), prototype ×5, then ×100.
3. Flex/FPC for screen & camera via PCBWay FPC.
4. Order 5 prototypes first; do not commit to 100 until rev A passes the checklist in §9.

## 6. "Compress the information in each session"
Per device session (wake → sleep): log a record of {notification IDs, button events, sensor min/max/mean, battery, RSSI}. Encode as CBOR, zstd/heatshrink compress, upload as one batch (<1 KB typical). Server decompresses and writes **one summary Log entry** per session rather than one per sample. Repo side: one Markdown report per working session in `docs/hardware/` and an index line in `docs/assembly/LOT-LEDGER.md`.

## 7. Documentation set (separate documents)
| Doc | Status |
|---|---|
|PLAN-LOT-PAGER-v0.1.md (this)|written|
|BOM-v0.1.csv|written|
|FIRMWARE-SPEC.md|written (v0.1)|
|API-CONNECTOR-SPEC.md|written (v0.1)|
|Host software (flash/provision CLI)|spec in FIRMWARE-SPEC §6, not built|
|User manual PDF, Service manual PDF|pending hardware rev A; build with pandoc from MD|
|Compliance file (FCC/CE/UN38.3)|pending|

## 8. Cost estimate — 100 units (rough)
| Item | Per unit | 100 units |
|---|---|---|
|Electronics (BOM-v0.1 subtotal)|$45–65|$4.5–6.5k|
|PCB + assembly (PCBWay)|$12–20|$1.2–2k|
|316L body, 2 parts, polish|$30–60|$3–6k|
|Battery, charger, packaging|$10–15|$1–1.5k|
|**Run subtotal**|**≈$100–160**|**≈$10–16k**|
|NRE: prototypes, fixtures, test jig|||$2–4k|
|Compliance (FCC/CE, battery UN38.3), pre-scan|||$5–15k|
Pre-compliance is the biggest unknown; selling units needs it, internal/gifted units less so (still check local rules).

## 9. Roadmap
| Phase | Weeks | Deliverable | Gate |
|---|---|---|---|
|0 Spec freeze|0–1|Decide thickness (R1), charging method (R2), screen type|Vadik approves|
|1 Software first|1–3|`/api/device/*` routes, `device_copy` Log event, device simulator|Simulated button appears in Log tab|
|2 Dev-kit proof|2–5|ESP32‑S3 dev board + screen + camera + BME688 on breadboard running firmware|Notification shown, button logged|
|3 Rev A PCB + body|5–10|Schematic/layout, 5 PCBWay PCBs, 5 CNC bodies|Fit check, RF range, charge test|
|4 Rev B (5 mm)|10–16|Flex PCB, thin cell, final polish|Drop/thermal/ingress tests|
|5 Pre-compliance|14–20|Scan, fix|Pass|
|6 Pilot ×100|20–26|Production run, test jig, PDF manuals|≥95% pass at EOL test|

## 10. Next-session task list
1. Vadik: confirm R1 (7–8 mm rev A?) and R2 (charge through front window vs. contacts).
2. Allow brand.lot-systems.com / lot-systems.com in session network to import brand rules.
3. Implement `/api/device/*` routes + add `device_copy` to `displayableEvents` in `src/server/routes/api.ts` (`GET /logs`) — otherwise the Log tab will hide the event.
4. Write device simulator script in `scripts/`.
5. Get PCBWay quotes (PCBA, CNC 316L ×5 and ×100).
