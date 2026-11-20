# LOT-DEVICE-01 · "Pager" · Product Plan

**Owner:** Vadik, Inventor · COSMO® / LOT Systems
**Doc:** LOT-HW-PLAN · Rev A · 2026-11-20
**Status:** Concept → EVT planning
**Related docs:** [BOM](LOT-DEVICE-01-BOM.md) · [Roadmap](LOT-DEVICE-01-ROADMAP.md) · [Enclosure](LOT-DEVICE-01-ENCLOSURE.md) · [Firmware](LOT-DEVICE-01-FIRMWARE.md) · [API connector](LOT-DEVICE-01-API.md) · [User manual](LOT-DEVICE-01-USER-MANUAL.md) · [STATE (compressed)](STATE.md)

---

## 1. What it is

A palm-sized, 40 × 40 mm, 5 mm thick stainless-steel object that receives short, pager-style notifications from lot-systems.com. Examples: "Coffee time." or "Walk outside.". It has a single **Copy** button. Pressing it sends the message on screen back to the user's **Log** tab on the site. It also carries a weather/environment sensor and a small camera.

- **Front face:** cover glass, a small always-on screen, a camera and one button.
- **Back face:** plain polished stainless steel (mirror finish).
- **Charging:** wireless, on a matching charger puck.

## 2. Requirement traceability (the 19 inputs)

| # | Requirement | How it is met | Doc |
|---|---|---|---|
| 1 | PCBWay | PCBWay for PCB fab + PCBA (turnkey parts sourcing) and CNC stainless enclosure, all on one PO | BOM §4, Roadmap |
| 2 | Pager-like notification from the AI site | `GET /api/device/v1/inbox` poll every 15 min; the site, AI jobs (`queueDeviceNotification`) or autonomous circadian nudges fill the queue | API |
| 3 | 2-part stainless body | Front frame (316L, CNC) + back cover (316L, CNC, mirror polished). Joined with 4 × M1.2 screws or a press fit with gasket | Enclosure |
| 4 | Flat silver square 40 × 40 × 5 mm | Height budget in Enclosure §3. **5.0 mm is tight. EVT targets 5.5 mm and DVT 5.0 mm** | Enclosure |
| 5 | Camera | Himax HM0360 ultra-low-power VGA sensor (made for AI vision), or OV2640 for the dev kit | BOM, Firmware |
| 6 | LOT API connector | `src/server/routes/device-api.ts` is **implemented in this session** | API |
| 7 | PDF manuals | `hardware/lot-device-01/tools/build-pdf.sh` renders every doc to `hardware/lot-device-01/pdf/` | — |
| 8 | Compress info each session | Radio: compact JSON keys, 64-char messages, and one HTTPS session per wake. Docs: [STATE.md](STATE.md) holds the compressed project memory and is rewritten every routine session | API §Compression, STATE |
| 9 | Firmware documents | [LOT-DEVICE-01-FIRMWARE.md](LOT-DEVICE-01-FIRMWARE.md) + `hardware/lot-device-01/firmware/` (PlatformIO skeleton) | Firmware |
| 10 | Software to connect with firmware | Server connector (done), pairing endpoints, and `tools/lot-device.mjs` CLI (pair, notify, simulate device) | API |
| 11 | Separate documents | One doc per concern (this folder) | — |
| 12 | Charger | Qi-compatible charger puck: OEM 5 W Qi transmitter in a stainless/aluminium shell, USB-C in | BOM §3 |
| 13 | 100-unit run | Pilot batch of 100 units. Costing in BOM §5 | BOM |
| 14 | Weather sensor | Bosch BME688 (temperature, humidity, pressure, gas/IAQ) behind a vented membrane | BOM |
| 15 | AI-grade off-the-shelf sensors | BME688 (Bosch AI-Studio gas classification), HM0360 (AI-vision sensor), BMI270 IMU (on-chip gesture/wake engine) | BOM |
| 16 | Copy button → Log tab | `POST /api/device/v1/copy` creates a `device_copy` log, rendered as **DEVICE [COPY]:** in Logs.tsx | API |
| 17 | One side polished stainless | Back cover, #8 mirror finish | Enclosure |
| 18 | Other side: camera + screen + button | Front: 1.28" Sharp Memory LCD, camera aperture, button | Enclosure |
| 19 | Wireless charger | Qi receiver (TI BQ51050B) + thin Rx coil. **The coil cannot sit behind steel** (see §4) | Enclosure §4 |

## 3. System architecture

```
 ┌──────────────── LOT-DEVICE-01 (40×40×5 mm) ─────────────────┐
 │  Front glass ─ Sharp Memory LCD 128×128 (SPI, ~µW static)    │
 │             ─ HM0360 camera (DVP/MIPI)  ─ Copy button (GPIO) │
 │  ESP32-S3 (Wi-Fi 2.4 GHz + BLE 5) ── 8 MB flash / 2 MB PSRAM │
 │     I²C: BME688 (weather/IAQ) · BMI270 (IMU, tap/wake)       │
 │  Power: 80–120 mAh LiPo ─ BQ51050B Qi Rx + charger ─ LDO     │
 │  Haptic: LRA/ERM coin motor (pager buzz)                     │
 └───────────────┬──────────────────────────────────────────────┘
                 │ HTTPS (TLS 1.2+, bearer device token)
                 ▼
  lot-systems.com  /api/device/v1/{hello,inbox,ack,copy,telemetry}
                 │
     ┌───────────┴────────────┐
     │ user.metadata.devices  │  pairing via /api/device/pair (site session)
     │ user.metadata.deviceInbox ← site /api/device/notify, AI jobs, circadian nudges
     │ logs (event=device_copy) → Log tab "DEVICE [COPY]:"
     └────────────────────────┘
```

**Why ESP32-S3:** one chip covers Wi-Fi (talks to the site directly, no phone app needed), BLE (setup from the browser via Web Bluetooth), a camera interface, low-power deep sleep (~10 µA with RTC) and a mature toolchain. A bare QFN56 (7 × 7 × 0.9 mm) on the main PCB beats a module for height.

## 4. Critical engineering conflicts (decide before EVT)

1. **Steel blocks RF and wireless charging.** A closed stainless shell is a Faraday cage. A Qi coil behind steel will not charge, and the back gets hot from eddy currents. Wi-Fi/BLE also need an opening.
   - **Recommendation:** put the Qi Rx coil and the 2.4 GHz antenna under the **front glass**, around the display. The user charges the device **face-down** on the puck. The polished back stays solid steel.
   - Fallback A: a 2-pin magnetic pogo charger on the edge (simplest and most reliable, but not wireless).
   - Fallback B: a zirconia or sapphire disc inlaid in the back. This breaks the "plain polished" look.
2. **5.0 mm height.** The stack (Enclosure §3) totals 5.0–5.6 mm. Any thickness spent on the battery costs capacity. EVT at 5.5 mm is realistic. Getting to 5.0 mm needs a 1.8 mm cell (~60–80 mAh) and a 0.5 mm back wall.
3. **Camera z-height.** Typical camera modules are 3–4.5 mm tall. The camera needs a cut-out in the PCB and battery area ("camera island") and a low-profile module (HM0360 bare module ≈ 2.5–3 mm, to verify).
4. **Weather sensor inside steel.** Reads the device's own heat. It needs a vent hole with an ePTFE membrane on the edge and a duty-cycled reading (measure before any Wi-Fi burst).
5. **Battery vs. always-on.** Use a Memory LCD (static image ≈ µW). Wi-Fi bursts dominate the budget, so the 15-minute poll plus deep sleep gives about 7–10 days per charge (Firmware §5).

## 5. User flow

1. Unbox and place face-down on the charger. The screen shows `LOT.`
2. On lot-systems.com, open Settings → Device → **Pair**. The browser sends Wi-Fi credentials and the device token to the device over Web Bluetooth.
3. The device calls `/hello` and the screen shows `Ready.`
4. Every 15 min (or on wrist-tap through the IMU) the device polls `/inbox`. New message → buzz → message on screen (e.g. "Coffee time.").
5. Short-press **Copy** to send the shown message to the Log tab (`DEVICE [COPY]: Coffee time.`).
6. Long-press **Copy** to take a photo with the camera and attach it to the Log entry (phase 2, see Roadmap).

## 6. Scope per phase

- **v0.1 (this session):** server connector live on the dev branch, docs, BOM, firmware skeleton.
- **v0.2:** dev-kit prototype on an off-the-shelf ESP32-S3 board + Memory LCD + BME688 breakout.
- **EVT / DVT / PVT / 100-unit pilot:** see [Roadmap](LOT-DEVICE-01-ROADMAP.md).
