# SQ-1 SESSION-STATE (compressed carry-over; read first, rewrite last, ≤60 lines)

LAST: HW-01 · 2026-11-15 · phase P0 CONCEPT ✅ → next P1 BREADBOARD + P2 CONNECTOR
DEVICE: 40×40×5.0mm (5.5 EVT) · 316L 2-part (frame bead-blast + back mirror #8) · ~20 g
CORE: ESP32-S3R8 + 8MB flash · 1.54" e-paper 200×200 SSD1681 · thin VGA DVP cam (GC0308 class)
SENSE: BME688 (weather+gas AI/BSEC2) · LSM6DSOX (MLC dbl-tap wake) · MAX17048 gauge
POWER: Li-Po 80–120mAh 1.5–2mm · BQ51050B Qi Rx+charger · TPS62840 · ≈9.4 mAh/day @15-min sync ≈ 8 d
CHARGE: LOT Dock, Qi FACE-DOWN through the glass (steel blocks Qi). Option B = the steel halves as contacts (DNP)
RF: antenna at the glass edge + insulated seam as a slot. Must be VNA-tuned in the steel case at EVT-2
UX: e-paper msg ≤48 chars · 2 buzzes · COPY short = Log `device_copy` · long 1.5 s = photo `device_photo`
API: /api/device/v1 {pair, sync, copy, photo} · bearer `lotd_` token (SHA-256 stored) · reply ≤512 B
SYNC: server sets next_sync_s 60–7200 (600 morning / 900 day / 3600 night, ×2 if bat<20)
NOTIF SOURCE: queue table → BME688 trigger → circadian fallback ("Coffee time!" 07–10)
COST: unit $117–183 @100 · pilot total ≈ $19–42k incl. NRE + certification
PILOT: 115 PCBA / 118 backs / 120 glass · ~15 units/day final assembly · UN38.3 needed

VERIFIED THIS SESSION
- device-sim contract test 14/14 PASS against the mock server
- 8 PDFs generated in manuals/

NOT VERIFIED / OPEN
- firmware never compiled (no ESP32 toolchain in the cloud session)
- device-api.ts not type-checked (no node_modules) and NOT registered in prod routes
- prices and part availability unverified (distributor sites blocked by the network policy); BOM links are search URLs
- brand/about/institute pages unreachable (403); design follows the repo docs (Ambient AI, CUBIQ v0, Terminal Vision)
- part heights marked VERIFY: camera module, Qi coil, coin ERM, battery
- manual describes the SoftAP portal (hold COPY 10 s); firmware v0.1 only has USB-serial provisioning

DECISIONS PENDING (Inventor)
D1 5.0 hard vs 5.5 mm · D2 Qi face-down vs contact Dock · D3 camera → Log only or Mirror too
D4 US only vs US+EU · D5 pilot price point · D6 OK to wire device-api into prod behind DEVICE_API_ENABLED

NEXT SESSION HW-02 (in order)
1 split main.cpp → lot_api/display/sensors/provision; add the SoftAP portal; GC0308 YUV→JPEG
2 KiCad schematic, EVT-1 (module version) + pin map from docs/05 §4
3 if D6 = yes: migration + register the plugin + Settings→Devices UI + Log badge for device_* events
4 Dock + case STEP drafts → PCBWay CNC quote
5 rebuild PDFs, rewrite this file, push the report docs/LOT-SR-<date>-HW02.md
