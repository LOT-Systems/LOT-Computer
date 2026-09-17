<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# COSMO® SIGNAL
## PHYSICAL PRESENCE DEVICE — HARDWARE SPECIFICATION
### A pocket-size companion that puts LOT Systems on your desk

```
================================================================================
LOT SYSTEMS CORPORATION / COSMO® HARDWARE DIVISION
DOCUMENT    COSMO-SIGNAL / HARDWARE-SPEC
ISSUE DATE  2026.09.17
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
INVENTOR    VADIK MARMELADOV — COSMO® CIA (CHIEF INVENTOR & ARCHITECT)
SIBLING DOC LOT-NODE-0-RIG-SPEC.md (the server this device talks to)
================================================================================
```

---

## 00 — PRINCIPLE: WHAT THIS DEVICE IS FOR

LOT Systems already runs the loop `INPUT → CLASSIFY → ACTION → RECORD` on
glass — a phone screen, a browser tab. SIGNAL takes one slice of that loop
off the screen entirely: **notification** and **acknowledgment**. It is not
a second computer. It is a single honest surface — one light, one line of
text, one button — that proves the system is alive without asking you to
open an app.

    ONE SCREEN, ONE MESSAGE    ONE BUTTON, ONE SIGNAL BACK    NOTHING ELSE TO OPEN

A pager only ever told you two things: something happened, and here is
enough context to act. SIGNAL keeps that discipline. "Coffee time!" is the
whole notification. Pressing **Copy** is the whole reply. Everything else —
the reasoning, the pattern that triggered it, the history — stays where it
belongs, in the LOT web app, referenced by the Log entry the button just
created.

---

## 01 — CONCEPT: TWO SIDES, ONE OBJECT

SIGNAL is a flat silver square, **40mm × 40mm × 5mm**, finished as a
**two-part stainless steel shell** that splits front/back at the parting
line running through the mid-height of the 5mm edge.

```
                         40mm
        ┌──────────────────────────────────┐
        │                                    │
        │         FRONT — POLISHED           │   5mm
        │      mirror-polished stainless      │   total
        │        (brand face, blank)          │
        │                                    │
        └──────────────────────────────────┘
                    2-PART SHELL
        ┌──────────────────────────────────┐
        │  ●cam     ▢▢▢▢▢▢▢▢▢▢    [COPY]   │
        │           display screen          │
        │        BACK — FUNCTIONAL FACE     │
        └──────────────────────────────────┘
```

- **FRONT (side A) — polished stainless steel.** No screen, no seams
  visible from this face. A brand plate, mirror-finish. This is the face
  that sits toward the room — an object, not a device.
- **BACK (side B) — the working face.** A camera, the notification screen,
  and one button, physically labeled **COPY**.

The two halves are machined separately and join with 4× M1.6 countersunk
screws through the stainless shell into a recessed aluminum internal
chassis that carries the PCB, battery, and antenna keep-out. Split-shell
construction (vs. one-piece) is what makes a 100-unit CNC run tractable —
PCBWay quotes per-part, and two simple flat parts machine and polish far
cheaper than one part with an internal cavity.

---

## 02 — INDUSTRIAL DESIGN — DIMENSIONS & MATERIALS

| PARAMETER          | SPEC                                                    |
|---------------------|----------------------------------------------------------|
| Footprint           | 40mm × 40mm (flat silver square)                         |
| Height              | 5mm total (2.2mm front shell + 2.2mm back shell + 0.6mm gasket/seam) |
| Material            | 304 stainless steel, 2 parts                              |
| Front finish        | Mirror polish (Ra ≤ 0.1μm), side A                        |
| Back finish         | Bead-blasted matte + laser-etched COPY glyph, side B      |
| Internal chassis    | 6061 aluminum, CNC, carries PCB + battery + coil          |
| Ingress             | IP54 target (splash, dust) — desk object, not submersible |
| Weight              | ≈48g (target, stainless-heavy for desk presence/heft)     |
| Mounting            | Flat-sit; silicone feet ring bonded to back shell rim     |

**Manufacturing route — PCBWay (item 1 in the build order):**
PCBWay covers PCB fabrication, PCBA (assembly), AND CNC metal machining +
polishing under one account, which is why the whole shell + board run
routes through them rather than splitting vendors.

- CNC machining (stainless steel, 2 parts): PCBWay CNC Machining service —
  https://www.pcbway.com/rapid-prototyping/CNC_Machining.html
- PCB fabrication + SMT assembly (PCBA): https://www.pcbway.com/orderonline.aspx
  and https://www.pcbway.com/smt.html
- Mirror polish + bead-blast are standard PCBWay CNC finish options,
  selected at quote time per part.

---

## 03 — ELECTRONICS — BILL OF MATERIALS

Design goal: every active component is an **AI-graded, off-the-shelf
module** — nothing custom-fabbed except the PCB and the shell. Grading
criterion (documented per line): lowest idle current draw that still
meets the function, widest hobbyist support (so firmware risk is low),
and a real supplier link that ships in 100-unit quantity.

| REF | PART                              | FUNCTION                         | WHY THIS PART (AI-GRADE NOTE)                         | UNIT @ QTY100 | SOURCE |
|-----|-----------------------------------|-----------------------------------|--------------------------------------------------------|---------------|--------|
| U1  | ESP32-S3-WROOM-1-N8R8             | MCU — WiFi/BLE, camera DVP i/f    | Only sub-$5 module with native camera interface + WiFi; graded over nRF52 (no WiFi) and RP2040 (no radio) | ≈$3.80 | https://www.espressif.com/en/products/modules/esp32-s3 |
| U2  | OV2640 2MP camera module          | Camera (back face)                | Cheapest DVP camera with mature ESP32 driver support; graded over OV5640 (higher power, unneeded res for a pager-class device) | ≈$3.50 | https://www.arducam.com/product/arducam-2mp-spi-camera-b0067-arduino/ |
| U3  | Waveshare 2.13" e-Paper (SPI)     | Screen (back face)                | E-ink holds "Coffee time!" with **zero power** between updates — a pager should not need daily charging; graded over OLED/LCD on that basis alone | ≈$9.90 | https://www.waveshare.com/2.13inch-e-paper-hat.htm |
| U4  | Bosch BME280                      | Weather sensor (temp/humidity/pressure) | Industry-standard 3-in-1 environmental sensor, I²C, 3.6μA sleep current | ≈$1.90 | https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/ |
| U5  | Qi receiver coil + IC (5V/1A)     | Wireless charger receiver         | Standard Qi (BPP) receiver, drop-in with any Qi transmitter pad; graded over proprietary pogo-pin charging for shelf compatibility | ≈$2.40 | https://www.adafruit.com/product/1901 |
| U6  | LiPo 3.7V 500mAh                  | Battery                           | Fits the 40×40×5mm envelope alongside the coil; sized against e-ink's near-zero idle draw, not against the screen | ≈$3.20 | https://www.adafruit.com/product/1578 |
| U7  | Tactile momentary switch          | COPY button                       | Panel-mount, laser-etched stainless cap; single input, single function | ≈$0.60 | https://www.digikey.com/en/products/detail/e-switch/TL1105SPF160Q/1938701 |
| U8  | TP4056 + protection               | Battery charge/protection IC      | Standard, well-understood LiPo charge path, pairs with Qi receiver output | ≈$0.35 | https://www.digikey.com/en/products/detail/nanjing-top-power-asic-corp/TP4056/7439488 |
| PCB | 4-layer rigid, 34mm×34mm          | Main board                        | Fabricated + assembled by PCBWay as one PCBA order      | ≈$4.50 | https://www.pcbway.com/orderonline.aspx |

**Electronics subtotal (per unit, qty 100): ≈ $30.15**
**Shell (CNC stainless, 2-part, polish+etch, qty 100): ≈ $22–$34** (PCBWay
quote-dependent — see §04)

**Per-unit landed estimate: ≈ $52–$64** before assembly labor and
packaging. See §08 for the full 100-unit run cost table.

---

## 04 — PCBWay — THE MANUFACTURING SPINE (build item 1)

Everything physical in this device — board, assembly, and shell — is
quoted and ordered through PCBWay so there is one vendor relationship and
one shipment consolidation point for the 100-unit run.

```
STAGE                    PCBWAY SERVICE                          LEAD TIME (qty 100)
─────                    ───────────────                          ────────────────────
PCB fab (4-layer)         Standard PCB                             ~3-5 days
SMT assembly (PCBA)       Assembly service, turnkey parts           ~5-7 days
Stencil + BOM upload      PCBWay Assembly Order Portal              same order
CNC shell (2 parts)       CNC Machining — 304 stainless             ~7-10 days
Polish (front) / blast+etch (back)  CNC finish options              included in CNC lead time
Final integration         Hand assembly (LOT / contract) — screws, battery, coil, gasket   ~1-2 days
```

Order sequencing: PCB fab+PCBA and CNC shells are independent PCBWay
orders and should be placed **in parallel** — they do not depend on each
other, so running them serially would waste 7-10 days for nothing.

---

## 05 — THE LOT API CONNECTOR

SIGNAL is a client of the same backend the web app already uses
(`src/server/routes/api.ts`, `public-api.ts`) — it does not get a parallel
system. Two things do not exist yet in the current API surface and are the
actual new engineering work behind this hardware project (tracked, not
built, in this session — see §07 roadmap):

1. **A device-scoped auth token.** Today, `/logs` and friends are
   cookie/session-authenticated for a browser. A pager has no login
   screen, so it needs a long-lived, revocable **device pairing token**
   (issued once from the user's account settings, stored in the ESP32's
   NVS flash, sent as `Authorization: Bearer <device-token>`).
2. **A push channel the device can hold open on battery.** The web app
   uses SSE for real-time events; an always-listening SSE connection is
   too power-hungry for a coin-cell-adjacent budget. SIGNAL instead
   **polls a lightweight endpoint on wake** (e-ink only redraws when
   content changes, so polling cost is a few bytes, not a socket).

Proposed connector surface (new, additive — does not touch existing
routes):

```
POST /api/device/pair            { pairing_code }      -> { device_token, user_id }
GET  /api/device/notify           Bearer device_token   -> { message, ttl, id } | 204 no content
POST /api/device/log              Bearer device_token   -> creates a Log row, same shape as
                                   { type: "device_copy",   an in-app Log entry (src/server/routes/api.ts
                                     device_id, ts }         fastify.get('/logs') / Log model)
POST /api/device/telemetry        Bearer device_token   -> { battery_mv, rssi, last_seen } (fleet health)
```

`GET /api/device/notify` is what turns "Coffee time!" (or any autonomous
QIE-triggered nudge — see `docs/technical/MEMORY-AND-QUANTUM-INTENT-ENGINES.md`)
into a physical screen update. The **COPY** button is the reverse path:
pressing it fires `POST /api/device/log`, which lands as a normal entry in
the same Log store `Logs.tsx` reads — so pressing COPY on the desk object
shows up in the **Log tab** on lot-systems.com exactly like a note typed
in-app, timestamped and attributed to the paired device.

Full endpoint contracts, auth flow, and firmware-side polling schedule are
specified separately in `docs/technical/COSMO-SIGNAL-SOFTWARE.md` — kept
apart from this hardware spec per the project's own documentation rule
(§09, item 11: firmware, software, and manuals stay in separate files so
each can version independently of the physical design).

---

## 06 — NOTIFICATION & COPY FLOW (what it feels like to own one)

```
LOT web app / QIE pattern fires  ──►  /api/device/notify queues message
                                              │
                                    SIGNAL wakes on its poll interval
                                              │
                                    e-ink redraws: "Coffee time!"
                                              │
                          user reads it — no app opened, no phone touched
                                              │
                              (optional) user presses COPY
                                              │
                          POST /api/device/log  ──►  new Log row
                                              │
                          Log tab on lot-systems.com shows the entry,
                          tagged with the device id and timestamp
```

The camera (side B) is not wired into the notify/copy loop in v1 — it is
reserved hardware for a v2 capability (ambient presence detection: is
someone at the desk before pushing a notification, per the "gate the
irreversible / respect the human" transparency posture already documented
in `LOT-NODE-0-RIG-SPEC.md` §04). Shipping the sensor now and the feature
later is cheaper than re-spinning the shell for a v2 camera cutout.

---

## 07 — ROADMAP

```
PHASE 0  DEV BOARD           1 unit, ESP32-S3 dev kit + breakout sensors, no shell.
                              Goal: prove the poll/notify/copy loop against
                              a real LOT account. (2-3 weeks)

PHASE 1  PROTOTYPE SHELL     3 units, PCBWay CNC stainless, hand-assembled.
                              Goal: validate the 40x40x5mm envelope actually
                              fits coil + battery + board + camera stack-up.
                              (adds 2-3 weeks, gated on Phase 0 firmware GREEN)

PHASE 2  PILOT RUN           10 units, full BOM, real PCBA from PCBWay.
                              Goal: burn-in test battery life on e-ink polling
                              interval; confirm Qi charging through the
                              stainless shell (steel + wireless charging
                              need a keep-out zone — verify in this phase).

PHASE 3  PRODUCTION RUN      100 units (see §08 for full cost breakdown).
                              PCBWay CNC + PCBA in parallel orders (§04).

PHASE 4  DOCS + SHIP         PDF manuals generated, firmware/software docs
                              finalized as of this session's routing (§09),
                              units boxed with wireless charger accessory.
```

Gate between every phase: firmware and connector code green on Phase 0-1
hardware before committing to the Phase 3 100-unit CNC order — stainless
shells are not cheap to scrap on a design mistake caught late.

---

## 08 — COST — 100-UNIT RUN

```
LINE ITEM                              PER UNIT      x100 TOTAL
─────────                              ────────      ──────────
Electronics BOM (§03)                   $30.15         $3,015
Stainless shell, CNC (2-part, polish)  $22–$34       $2,200–$3,400
PCB fab + PCBA (PCBWay)                  incl. in BOM  (rolled into §03 PCB line)
Wireless charger accessory (bundled)     $6.50           $650
  Qi transmitter puck, generic 5W        (per-unit, in-box accessory)
Packaging (box, foam insert, manual)     $2.00           $200
Hand assembly / QC labor                 $4.00           $400
─────────                              ────────      ──────────
TOTAL (low-high)                       $64.65–$76.65   $6,465–$7,665
```

At 100 units this is a pilot-scale run, not a consumer SKU — cost is
dominated by CNC shell machining (stainless is slow to cut and polish at
this volume) and will drop materially past 500-1,000 units where PCBWay's
CNC pricing curve flattens.

---

## 09 — DOCUMENTATION SET (kept as separate files, per project rule)

```
THIS FILE                          COSMO-SIGNAL-HARDWARE-SPEC.md   — plan, BOM, roadmap (you are here)
docs/technical/COSMO-SIGNAL-FIRMWARE.md    — on-device firmware spec
docs/technical/COSMO-SIGNAL-SOFTWARE.md    — backend connector + companion software spec
docs/technical/COSMO-SIGNAL-MANUAL.md      — end-user manual (PDF-manual source)
```

Rationale for the split: the hardware BOM changes on a manufacturing
timescale (quotes, part availability), firmware changes on a sprint
timescale, the API connector changes with the main LOT backend, and the
manual changes only when user-facing behavior changes. Merging them would
mean every firmware tweak touches a document that also has to be reprinted
as a physical manual — keeping them apart is the same "separate concerns"
discipline the rest of the LOT stack already uses (see `docs/technical/
REPOSITORY-ORGANIZATION.md`).

================================================================================
LOT SYSTEMS CORPORATION · COSMO® HARDWARE DIVISION            LOS ANGELES, CA
END OF SPECIFICATION                                               2026.09.17
================================================================================
