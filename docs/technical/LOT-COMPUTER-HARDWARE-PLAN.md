# LOT COMPUTER — Hardware Plan, BOM, Roadmap

DOC: LOT-HW-001 · rev A · 2026-10-14 · S-2: VADIK MARMELADOV (Inventor, COSMO® CIA)
STATUS: PLAN (pre-EVT). Prices = ESTIMATE unless a source is linked. Links marked `unverified` were not opened this run.
SOURCES NOT REACHABLE THIS RUN: lot-systems.com/about, brand.lot-systems.com, institute.lot-systems.com/cqgs.html (sandbox DNS failure). Brand/CQGS alignment is therefore **deferred** — see Open Items.

## 1. Concept

A 40 × 40 mm stainless-steel pager-computer. Back: polished mirror steel. Front: screen, camera, one button ("Copy"). It shows autonomous notifications pushed from the LOT site ("Coffee time!"), reports weather, and sends button events back to the **Log tab** on lot-systems.com. Charges wirelessly.

## 2. Feasibility flags (read first)

| # | Requirement | Finding | Recommendation |
|---|-------------|---------|----------------|
| F1 | 5 mm height | Camera module alone is ~4–6 mm tall; plus 2×0.5–0.8 mm steel, glass, display, 3 mm min LiPo, Qi coil. 5 mm is not credible with camera + battery. | EVT target **40×40×9 mm**. Keep 5 mm as the visual ambition for a camera-less "LOT Pager" variant (thin LiPo ~2.5 mm + flex). Decide with S-2. |
| F2 | Stainless body + wireless charging | Steel shields Qi (eddy currents) and Wi-Fi/BLE. | Charging coil + antenna sit behind the **glass front** (non-metal window); ferrite sheet under coil; steel back plate is passive. Charge face-up/front-down on pad, or use a ceramic/PVD-free window in the back. Validate in EVT-1. |
| F3 | "2-part body" | Natural split: (A) polished back plate, (B) frame+bezel with front glass. | Two CNC/MIM parts, laser-weld or screw-seal. Mirror finish = #8 polish on 316L, post-machining. |
| F4 | PCBWay does everything | PCBWay documents turnkey PCBA and lists CNC as a separate service; stainless-enclosure specifics were **not found** ([PCBWay PCBA](https://www.pcbway.com/pcb-assembly.html)). | Quote PCBA + CNC separately; keep a second source for steel (Protolabs / JLCCNC / local). |
| F5 | "AI-grade sensors" | Not a standard term. | Interpreted as: sensors with onboard ML/IAQ algorithms (Bosch BME688 + BSEC) and IMU with motion engine. |
| F6 | Camera + pager on a small MCU | OK on ESP32-S3 (DVP camera, PSRAM). Frames are uploaded; no on-device vision v1. | Capture on demand only; privacy LED + shutter behaviour in firmware docs. |

## 3. Architecture

```
 lot-systems.com (Fastify API)  <--TLS/WSS-->  LOT-COMPUTER (ESP32-S3)
   /api/device/*  (new)                           screen · button · camera
   Log tab  <-- "copy" events                     BME688 · IMU · fuel gauge
   AI notifier --> inbox/push                     Qi RX -> charger -> LiPo
```

Proposed LOT API connector (new routes; **not implemented** in this run — repo has `/os/*` and public routes only):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/device/pair` | one-time claim with code shown on screen |
| GET | `/api/device/inbox` | long-poll / WSS for notifications `{id,text,ttl,priority}` |
| POST | `/api/device/event` | button → `{type:"copy",ts,payload}` → written to Log |
| POST | `/api/device/telemetry` | weather, battery, RSSI (batched) |
| POST | `/api/device/frame` | camera JPEG upload (on demand) |
| POST | `/api/device/session` | end-of-session compressed summary (item 8) |

Auth: per-device keypair generated at provisioning, public key registered to the user; signed requests; secure boot + flash encryption on in production.
"Compress each session": device batches events into one summary record per session (counts, last values, deltas); server stores summary, drops raw after N days. Reuses the existing widget→memory compression idea.

## 4. Components buying list (EVT, per 1 unit; 100-run in §6)

| Block | Candidate part | Why | Est. unit @100 | Link |
|-------|---------------|-----|---------------|------|
| MCU+radio | Espressif ESP32-S3-WROOM-1 N16R8 (or S3FN8 chip + chip antenna to save height) | Wi-Fi/BLE, DVP camera, PSRAM | $4–5 | [Espressif](https://www.espressif.com/en/products/modules) unverified |
| Dev proxy (EVT-0 only) | Waveshare ESP32-S3-LCD-1.28 (round, QMI8658 IMU, LiPo header) | Fast firmware bring-up; **not** the final form (round, no camera) | $15–20 | [Waveshare](https://www.waveshare.com/product/esp32-related/esp32-s3-lcd-1.28.htm) |
| Screen | 1.54" 240×240 IPS, ST7789 SPI (active ≈31×31 mm) | Fits 40 mm square | $3–5 | LCSC/AliExpress search `unverified` |
| Camera | OV2640 (2 MP) FPC module, or OV5640 if height allows | ESP32-S3 DVP supported | $2–4 | [Omnivision](https://www.ovt.com) unverified |
| Env sensor | Bosch BME688 (T/RH/P/gas + BSEC) | "AI-grade" weather/air | $8–10 | [Bosch](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/) unverified |
| Light/UV | LTR-390UV-01 | UV index/ambient light for weather | $1–2 | unverified |
| IMU | QMI8658C | tap/motion wake | $1 | (on Waveshare board) |
| Qi receiver | TI BQ51013B / BQ51050B class + 15–20 mm RX coil + ferrite | 5 V wireless in | $4–6 | [TI](https://www.ti.com/power-management/wireless-charging/overview.html) unverified |
| Charger / PMIC | BQ25895 or integrated alt. | LiPo charge path | $2–3 | unverified |
| Fuel gauge | MAX17048 | battery % to site | $1.5 | unverified |
| Battery | 3.7 V LiPo ~300–400 mAh, 3–4 mm, with protection | Fits F1 height | $3–5 | unverified |
| Button | Low-profile tact / metal dome, 1 | "Copy" | $0.3 | — |
| Haptic/LED (optional) | LRA + privacy LED | pager feel, camera indicator | $1–2 | — |
| Glass | 0.7 mm cover glass, AR/AF coating, camera hole | front | $4–8 | — |
| Body | 316L back plate + frame, CNC/MIM, #8 mirror polish | items 2,4,17 | $25–60 | PCBWay CNC / alt `unverified` |
| PCB | 4-layer HDI-lite, 0.8 mm, ≤38×38 mm | main board | $5–8 | [PCBWay](https://www.pcbway.com/pcb-assembly.html) |
| Wireless charger (user side) | Any Qi 5 W pad; later LOT-branded dock | item 19 | $5–10 | — |

Tooling/test: ESP-Prog, USB-C pogo test jig, Qi test pad, thermal camera.

## 5. Roadmap (gates, not dates — S-2 sets the calendar)

| Phase | Output | Exit gate |
|-------|--------|-----------|
| P0 Spec lock | Decide F1 (9 mm vs 5 mm), brand pass vs brand/CQGS pages, API contract | S-2 signs spec |
| P1 Software-first | `/api/device/*` in repo + Log-tab "copy" event + notification composer; simulator client | green build; sim shows "Coffee time!" end-to-end |
| P2 EVT-0 (dev boards) | ESP32-S3 + display + BME688 breadboard; firmware v0 (pair, inbox, button, telemetry) | notification → screen <3 s; button → Log <2 s |
| P3 EVT-1 (custom PCB, 5–10 pcs) | PCBWay PCBA, 3D-printed/CNC steel prototype | Qi charge through glass at ≥200 mA; Wi-Fi RSSI ≥ −70 dBm inside body |
| P4 DVT (20–30 pcs) | Final 2-part steel, polish, glass, camera | drop/seal/thermal checks; FCC/CE pre-scan plan |
| P5 Docs | PDF user manual, firmware docs, software (flasher/connector) docs, separate documents per audience | docs reviewed vs hardware |
| P6 PVT → 100-unit run | Golden sample, test jig, packaging, charger | ≥95% first-pass yield |

Document set (items 7, 9, 11): User Manual (PDF), Quick Start, Firmware Reference, API/Connector Reference, Provisioning Guide, Production Test Spec, Compliance file — each a separate file in this repo, built to PDF from Markdown.
Software (item 10): "LOT Flasher" (web-serial flashing + pairing) as a page in the site.

## 6. 100-unit run estimate (ESTIMATE, pre-quote)

| Item | Per unit | ×100 |
|------|----------|------|
| PCB + parts + assembly | $45–65 | $4.5–6.5k |
| Steel body (2 parts, polish) | $25–60 | $2.5–6k |
| Glass, battery, misc | $10–18 | $1–1.8k |
| Test, packaging, charger | $8–15 | $0.8–1.5k |
| **Landed** | **~$90–160** | **~$9–16k** |
Plus NRE: PCB/stencil/fixtures, steel programming, certification — ~$3–10k. Binding quotes required.

## 7. Risks

R1 steel vs RF/Qi (F2) · R2 height (F1) · R3 camera privacy & regulation · R4 certification (FCC/CE/RoHS, Qi marking) · R5 polish yield on mirror steel · R6 single-vendor dependence (F4) · R7 battery safety in a sealed steel case (UN38.3 shipping).

## 8. Open items for S-2

1. Approve 9 mm EVT or insist on 5 mm (and drop the camera?).
2. Provide/enable access to brand.lot-systems.com, /about and CQGS so the industrial design and tone follow the brand (unreachable this run).
3. "Copy": confirm meaning — copy-to-clipboard of the last notification, or a "log this moment" press.
4. Confirm target markets (drives certification).
