# LOT COMPUTER — HARDWARE PLAN (HW-0 "PAGER")

Owner: Vadik, Inventor — COSMO® CIA · Status: PLAN v0.1 · Date: 2026-11-10
Sources not reachable this session: lot-systems.com, brand.lot-systems.com, institute.lot-systems.com (host not on the session network allowlist). Brand/tone notes below come from the repo only. Re-run once the domains are allowed.

## 1. Product in one paragraph
A 40 × 40 mm stainless-steel pocket device that receives autonomous, AI-written pager notifications from lot-systems.com ("Coffee time!"), shows them on a simple screen, and sends a "Copy" button press back to the site's **Log** tab. It also carries a camera and a weather sensor, charges wirelessly, and ships with PDF manuals, firmware docs and a companion tool.

- Side A: polished stainless steel (mirror, no openings).
- Side B: camera, screen, one button.
- Two stainless parts: back shell + front bezel (laser-welded or screwed, 4× M1.2 hidden).

## 2. Requirements trace (your 19 points)
| # | Requirement | Where addressed |
|---|---|---|
| 1 | PCBWay | §6 fab, BOM §5 |
| 2 | Pager notification from AI site | §4 API, §3 flow |
| 3 | 2-part stainless body | §7 mechanical |
| 4 | Flat silver square 4×4 cm × 5 mm | §7 — **see feasibility risk R1** |
| 5 | Camera | BOM, §7 |
| 6 | LOT API connector | §4 |
| 7 | PDF manuals | §9 docs |
| 8 | Compress info each session | §9 (one .md report per session, `docs/hardware/sessions/`) |
| 9 | Firmware docs | §9 |
| 10 | Software to connect to firmware | §8 `lot-hw` CLI |
| 11 | Separate documents | §9 doc set |
| 12/19 | Charger / wireless charger | BOM, **risk R2** |
| 13 | 100-unit run | §10 |
| 14 | Weather sensor | BOM (BME280/BME688) |
| 15 | AI-grade off-the-shelf sensors | BOM (IMU, ALS, env, mic optional) |
| 16 | "Copy" button → Log tab | §4 `POST /api/device/event` |
| 17/18 | Polished side / camera+screen+button side | §7 |

## 3. System flow
```
LOT site (AI engine / QIE / scheduled jobs)
   └─ composes notification ──► device_inbox (DB)
                                   ▲  HTTPS poll every 60 s (or MQTT later)
Device (ESP32-S3, Wi-Fi) ──────────┘
   ├─ shows text on screen, buzz/LED blink
   ├─ BUTTON "Copy" ──► POST /api/device/event {type:"copy", notifId}
   │                       └─► Log row (event="device_copy") → Log tab
   └─ every 15 min: weather + battery ──► POST /api/device/telemetry
```

## 4. LOT API connector (proposed — not yet implemented)
Existing facts (repo): `Log` model has `userId, text, event, metadata(JSONB), context(JSONB)`. New endpoints should reuse it so the Log tab needs no change.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/device/register` | Pair device with user via 6-digit code shown on screen; returns per-device token |
| GET | `/api/device/inbox?since=` | Pending notifications `{id,text,ttl,priority}` (≤120 chars) |
| POST | `/api/device/ack` | Delivered/seen receipt |
| POST | `/api/device/event` | Button events → creates `Log` with `event:"device_copy"`, `text`, `metadata:{deviceId,notifId,fw}` |
| POST | `/api/device/telemetry` | temp/humidity/pressure/battery (stored in Log metadata or new table) |

Security: per-device bearer token (hashed server-side), TLS 1.2+, token in ESP32 NVS with flash encryption + secure boot v2, revocable from settings. No camera upload in v1 (see R5). Server side: new `src/server/routes/device-api.ts` + `DeviceNotification` Prisma/Sequelize model + scheduled job that turns QIE signals into pager text.

## 5. Component list & buying list
**Prices are rough 2026 estimates from training knowledge, NOT live quotes. Verify stock/price before ordering. Links go to vendor search/landing pages, not pinned SKUs, because live pages were not checked.**

| Block | Part (candidate) | Why | Est. unit @1 | Est. @100 | Where |
|---|---|---|---|---|---|
| MCU+Wi-Fi/BLE | ESP32-S3-MINI-1U / ESP32-S3FN8 | Camera interface (DVP), Wi-Fi, USB, huge ecosystem | $3.5 | $2.6 | https://www.digikey.com/en/products/search?keywords=ESP32-S3-MINI-1 · https://www.lcsc.com |
| Camera | OV2640 / GC2145 DVP sensor on 8-pin FPC (≤3 mm tall) | Cheap, supported by esp32-camera | $4 | $2.5 | https://www.aliexpress.com (module) · https://www.lcsc.com |
| Screen | 1.54" 200×200 e-paper (Good Display GDEH0154D67) *or* 1.3" 240×240 IPS | E-paper = days of battery + readable pager look; IPS = faster | $7 | $4.5 | https://www.good-display.com · https://www.buydisplay.com |
| Weather | Bosch BME280 (T/H/P) → BME688 for gas/VOC "AI grade" | Standard, drivers everywhere | $3 / $9 | $2 / $6 | https://www.digikey.com/en/products/search?keywords=BME280 |
| IMU/ALS | LSM6DSO (IMU), VEML7700 (light) | Wake-on-motion, auto-contrast | $2.5 / $1.5 | $1.8 / $1 | https://www.digikey.com |
| Battery | LiPo ~3.0 mm thick, 250–350 mAh (e.g. 303030-class) | Thinnest practical | $4 | $2.5 | https://www.digikey.com/en/products/search?keywords=lipo%20303030 |
| Charge mgmt | BQ25100 or MCP73831 + fuel gauge MAX17048 | Safe LiPo, gauge for % | $2.5 | $1.8 | https://www.ti.com · https://www.microchip.com |
| Qi RX | Qi receiver IC (e.g. BQ51003 / STWLC38) + 0.3 mm RX coil with ferrite | Wireless charging | $6 | $4 | https://www.ti.com · https://www.digikey.com/en/products/search?keywords=wireless%20charging%20receiver%20coil |
| Haptic/alert | 6 mm coin LRA or piezo buzzer | Pager buzz | $1.5 | $1 | https://www.digikey.com |
| Button | Ultra-low-profile tact (≤1.2 mm) | "Copy" | $0.4 | $0.2 | https://www.digikey.com |
| LDO / misc passives, ESD | TLV75533, TPD4E05U06 | | $2 | $1.3 | https://www.lcsc.com |
| PCB | 4-layer, 0.8 mm, ENIG, ~38×38 mm | | $30 proto/5 | $6/ea | https://www.pcbway.com |
| Body | 316L stainless, 2 parts, CNC + mirror polish | | $80–150 proto | $12–25/ea | https://www.pcbway.com/cnc-machining-quote.html · https://www.protolabs.com |
| Charger | Qi pad (5 W, certified, off the shelf) for dev; custom branded pad later | | $12 | $6 | https://www.digikey.com / Amazon |
| Programming | USB-C → pogo-pin jig (4-pin: 3V3, GND, D+, D−) + ESP-Prog | Steel body has no USB port | $20 | $20 total | https://www.digikey.com |

**BOM estimate:** ~$40–50 at qty 1; ~$26–32 at qty 100 (electronics only, excl. body). Body adds $12–25. **Unit landed cost @100 ≈ $45–65.** Prototype budget (3 spin-ups, jigs, steel samples): **$1,500–3,000**.

## 6. PCBWay workflow
1. Schematic/PCB in KiCad 8 (free). Export Gerbers, drill, pick-and-place, BOM.
2. PCBWay: PCB (4L, 0.8 mm, ENIG, 0.2/0.2 mm rules) + PCBA turnkey (they source from LCSC; consign the exotic parts: display, battery, coil).
3. Run 5 pcs proto → 20 pcs EVT → 100 pcs DVT/PVT.
4. Body via PCBWay CNC (316L) with mirror polish on face A; ask for DFM review on 0.8 mm walls.

## 7. Mechanical
- Envelope target 40 × 40 mm, corner radius 3 mm.
- **Stack-up (mm):** steel back 0.8 · Qi coil+ferrite 0.4 · battery 3.0 · PCB 0.8 · display 1.0 · front bezel/glass 0.6 → **≈ 6.6 + component height (camera ≥2.5 beside the battery area)**. 5 mm is not achievable with camera + battery + Qi.
- **R1 decision:** EVT target **40×40×8 mm**; DVT target **7 mm**; 5 mm only with a thinner (≈1.8 mm) battery and no camera in the same stack (camera in a raised corner "bump" is the usual compromise). Please choose.
- Camera: 1.2 mm bore, sapphire/AR glass 0.3 mm. Weather sensor: 0.6 mm vent hole + hydrophobic membrane on side B edge.

## 8. Software
- Firmware: ESP-IDF 5.x (C), components: `lot_net` (TLS poll), `lot_ui` (LVGL / e-paper), `lot_power`, `lot_cam`. OTA via signed images from lot-systems.com.
- Companion `lot-hw` CLI (Node, in `scripts/`): `pair`, `flash`, `logs`, `ota push`, `provision --serial`.
- Deep sleep with timer + button + IMU wake; poll window 3 s.

## 9. Documents (separate files, PDF-exported)
`docs/hardware/`: `LOT-HW-PLAN.md` (this) · `LOT-HW-BOM.csv` (to create) · `LOT-HW-ROADMAP.md` · `FIRMWARE.md` · `API.md` · `USER-MANUAL.md` · `SERVICE-MANUAL.md` · `sessions/YYYY-MM-DD.md`. PDF via pandoc in CI. Each session ends with a compressed report (≤1 page) pushed here.

## 10. 100-unit run
- Build gates: EVT (5–20) → DVT (30) → PVT (100). Test jig: pogo programming + functional (display, button, Wi-Fi, sensor, charge) ≤ 90 s/unit.
- Regulatory: FCC Part 15 (modular ESP32 cert reuse + unintentional radiator testing), CE-RED if sold in EU, Qi RX needs WPC listing only if branded "Qi" (avoid the logo or use certified module). LiPo: UN38.3 for shipping. Budget **$6–15k** for pre-compliance + testing if selling; internal/prototype use is far cheaper.

## 11. Risks
- **R1** 5 mm height infeasible (§7).
- **R2** **Steel blocks Qi.** A solid stainless back stops inductive charging. Fix: PEEK/ceramic/glass inlay (~25 mm disc) in the charging face, or charge through the front glass face-up. Decide before CAD.
- **R3** Steel also detunes the Wi-Fi antenna: use a non-metal window/ring or external IPEX antenna in a PEEK slot.
- **R4** Heat/battery in a sealed 5–8 mm body: cap charge at 0.5C, add NTC.
- **R5** Camera privacy: v1 camera is local/on-demand only, no streaming, physical LED when active.
- **R6** Polished steel scratches; spec 316L, 600→1500 grit + buff, or PVD-free to stay "silver".
