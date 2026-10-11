# LOT COMPUTER — Hardware Plan, Feasibility & Roadmap

```
DOCUMENT   LOT-COMPUTER / 01 PLAN
ISSUE      2026-10-11            REV A
CLASS      INTERNAL / ENGINEERING
S-2        VADIK MARMELADOV
STATUS     PLAN — nothing built, nothing ordered
SIBLINGS   02 BOM · 03 FIRMWARE · 04 API CONNECTOR · 05 HOST SOFTWARE · 06 MANUAL
```

## 00 PRINCIPLE

A pocket object that receives **pager-style autonomous notifications** from
lot-systems.com ("Coffee time!"), lets the holder press one button ("Copy") to
write that moment into the site **Log tab**, and reports weather / air data
back. Same LOT rule as NODE-0: input → classify → action → record. The device
never acts silently; every press and every reading leaves a Log entry.

## 01 REQUIREMENT TRACE (the 19 items)

| # | Requirement | Where it lands | Status |
|---|-------------|----------------|--------|
| 1 | PCBWay | PCB fab + assembly + CNC steel (BOM §A, §F) | PLANNED — quote needed |
| 2 | Pager-like notification from AI site | API doc §3 `GET /device/notifications`, firmware notify state | SPEC'D |
| 3 | 2-part stainless body | Back plate + front bezel, 316L (BOM §F) | SPEC'D — see D-1 |
| 4 | Flat silver square 40×40×5 mm | v1 = 40×40×9 mm; 5 mm = v2 gate | **RISK R-1** |
| 5 | Camera | OV2640 (v1) → thinner module (v2) (BOM §D) | OPEN — purpose undefined, Q-1 |
| 6 | LOT API connector | API doc | SPEC'D — server not built |
| 7 | PDF manuals | Doc 06 + `pdf/` build | DONE (draft PDFs) |
| 8 | Compress info per session | API doc §5 session digest | SPEC'D |
| 9 | Firmware documents | Doc 03 | DONE (draft) |
| 10 | Software to connect to firmware | Doc 05 `lotctl` | SPEC'D |
| 11 | Separate documents | docs 01–06 are separate files | DONE |
| 12 | Charger | Qi pad (BOM §E) | SPEC'D |
| 13 | 100-unit run | Roadmap P6, BOM totals | PLANNED |
| 14 | Weather sensor | BME688 + SHT45 (BOM §C) | SPEC'D |
| 15 | AI-grade off-the-shelf sensors | BME688 gas scanner (trainable) + ESP32-S3 TinyML | SPEC'D |
| 16 | "Copy" button → Log tab | API doc §4, uses existing `POST /api/logs` | SPEC'D |
| 17 | One side polished stainless | Back plate, mirror polish | SPEC'D — see D-1 |
| 18 | Other side camera + screen + button | Front bezel + glass | SPEC'D |
| 19 | Wireless charging | Qi receiver (BOM §E) | SPEC'D — see D-1 |

## 02 BLOCK DIAGRAM

```
 lot-systems.com (Fastify, /api)
   │  HTTPS (TLS) · device token
   ▼
 [Wi-Fi] ESP32-S3 ──I2C── BME688 (T/RH/P/gas) · SHT45 (T/RH) · VEML7700 (light)
   │  │  └─DVP── camera
   │  └─SPI─── display (square, ~1.3")
   │  └─GPIO── button "Copy" · status LED (camera-active)
   └─I2C── fuel gauge ── charger IC ── LiPo ◄── Qi receiver IC ◄── Rx coil
```

## 03 FEASIBILITY ANALYSIS (read this before buying anything)

**R-1 — 5 mm thickness is the hardest requirement.** Rough stack, ESTIMATE:

| Layer | mm |
|---|---|
| Steel back plate floor | 0.6 |
| Battery (thin LiPo) | 2.0 (≈100–150 mAh) |
| PCB (1.0 incl. parts) | 1.0 |
| Display + cover glass | 1.2 |
| Steel front bezel lip | 0.4 |
| **Total** | **≈5.2** |

That is before the camera, whose module alone is typically thicker than 4 mm
(off-the-shelf OV2640 modules). A packaged ESP32-S3 module is 3.2 mm tall, so a
5 mm build also needs the bare ESP32-S3 chip. Conclusion: **v1 (EVT/DVT) is
40×40×9 mm** with dev-friendly parts; **5 mm is a v2 gate** requiring a
chip-down design, a micro camera (candidates: OmniVision OVM-series cube
sensors; not verified), and a ≤100 mAh battery. Battery life at 5 mm will be
days, not weeks, with Wi-Fi polling.

**R-2 — Stainless steel blocks radio and Qi.** Steel is a conductor: Wi-Fi/BLE
antennas and a Qi coil cannot sit behind it. Decision **D-1** (needs S-2):

- **Option B (recommended):** polished back plate with a ~16 mm non-metal inlay
  (zirconia ceramic or glass) over the Qi coil; antenna under the front glass
  edge, in a non-metal slot of the bezel. Preserves "one side polished steel"
  visually; the inlay can carry the LOT mark.
- Option A: coil + antenna under front glass only; device must be charged
  face-down on the pad (screen covered). Simplest, worst UX.
- Option C: full-steel back, contact (pogo) charging. Rejects req. 19.

**R-3 — Certification.** A pre-certified ESP32-S3 module keeps FCC/CE effort
low; a chip-down board needs its own radio testing (ESTIMATE $8–20k). Lithium
cells need UN38.3 transport documentation. A 100-unit *sale* needs both; 100
units given to staff/testers less so (verify with a compliance lab).

**R-4 — Camera privacy.** A camera on a notification device needs a hardware
indicator LED tied to the sensor power rail, capture only on explicit press,
and clear opt-in on the site. Camera *purpose* is undefined (Q-1).

**R-5 — Third-party licenses.** BME688 on-chip AI (Bosch BSEC2 / BME AI-Studio)
uses Bosch's proprietary library; licence terms for a commercial product must
be read before the 100-unit run (not verified in research).

**R-6 — Supply.** DigiKey listed 8–12 week lead times for BME688 and ESP32-S3
modules, one regional listing showed zero stock. Order samples now.

## 04 DECISIONS & OPEN QUESTIONS FOR S-2

- **D-1** Back-side inlay for Qi + antenna (Option B recommended).
- **D-2** v1 at 9 mm, 5 mm as v2 — accept? (recommended: yes).
- **Q-1** What does the camera do? Assumed: still photo on double-press, uploaded
  as a Log attachment. Needs confirmation.
- **Q-2** Is the 100-unit run for sale (needs certification) or internal?
- **Q-3** Notification delivery: device polls (assumed, battery-cheap) vs. keeps
  an SSE/WebSocket open (instant, costs battery).
- **Q-4** The brand sites (brand.lot-systems.com, lot-systems.com/about,
  institute.lot-systems.com/cqgs.html) were **not reachable** from this
  environment (DNS failure). Brand colour/type rules were taken from
  `docs/technical/LOT-STYLE-GUIDE.md` and `LOT-NODE-0-RIG-SPEC.md` only; CQGS
  was not read. Re-check on a networked session.

## 05 ROADMAP

```
PHASE                         WEEKS   EXIT GATE
P0 Spec lock (D-1,D-2,Q-1..3)  0–2    S-2 signs decisions
P1 Dev-kit prototype           2–7    DFR1221 + sensors: notify→Copy→Log works end-to-end
P1b Server: device API         2–7    endpoints + migration live on staging (parallel)
P2 EVT PCB (PCBWay)            6–14   board boots, all sensors read, Qi charges
P3 Enclosure samples (PCBWay)  8–14   2-part steel fit check, polish approved
P4 DVT, 10–20 units            14–24  soak test, drop test, battery life, thickness verdict
P5 Certification               20–30  FCC/CE/UN38.3 reports (if for sale)
P6 PVT → 100-unit run          30–38  100 units pass end-of-line test
```

Total ≈ 9 months; critical path = P3→P4→P5 (steel finishing, thickness, labs).
Roadmap is ESTIMATE — dominated by component lead times (8–12 wk) and lab queues.

## 06 BUDGET (ESTIMATE)

See BOM doc: ≈ **$120–220 per unit** → **$12–22k** for 100 units, plus NRE
(fixtures, prototype rounds, certification) ≈ **$15–35k**. All figures are
ESTIMATE ranges, not quotes.

## 07 NEXT ACTIONS

1. S-2 answers D-1, D-2, Q-1..Q-4.
2. Order dev kit + samples (BOM §Prototype).
3. Request PCBWay quotes: PCB+assembly (4-layer, ~40×40 mm) and CNC 316L ×2 parts, mirror polish, qty 5 and 100.
4. Build server device endpoints (API doc), staging first.
5. Firmware milestone M1 on dev kit.
