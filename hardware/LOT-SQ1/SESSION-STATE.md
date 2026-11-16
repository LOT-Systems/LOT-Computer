# SQ-1 SESSION-STATE (compressed carry-over; read first, rewrite last, ≤60 lines)

LAST: HW-02 · 2026-11-16 · P0 CONCEPT ✅ · firmware core verified · next P1 BREADBOARD + P2 CONNECTOR
!! BLOCKER: 15 earlier runs sit on 15 unmerged branches (docs/09). MERGE claude/brave-lamport-qa9enn → master
!! or every run starts from scratch again. Next run: if hardware/LOT-SQ1 is missing on master, cherry-pick it
!! from the newest claude/brave-lamport-* branch that has it (git checkout <branch> -- hardware/LOT-SQ1).
DEVICE: 40×40×5.0mm (frame-board layout, tools/zstack.py = 4.6 mm w/ 2.0 mm cell) · 316L 2-part · ~20 g
CORE: ESP32-S3R8 + 8MB flash · 1.54" e-paper 200×200 SSD1681 · thin VGA DVP cam (GC0308 class)
SENSE: BME688 (weather+gas AI/BSEC2) · LSM6DSOX (MLC dbl-tap wake) · MAX17048 gauge
POWER: Li-Po 29×31×2.0 ≈107 mAh · BQ51050B Qi Rx · TPS62840 · 9.4 mAh/day @15-min ≈ 11 d
CHARGE: LOT Dock, Qi FACE-DOWN through the glass. Option B = steel halves as contacts (DNP)
RF: antenna at the glass edge + insulated seam as a slot; VNA-tune in the steel case at EVT-2
UX: e-paper ≤48 code points · 2 buzzes · COPY short=Log `device_copy` · 1.5 s (buzz)=photo · 10 s=pairing
API: /api/device/v1 {pair, sync, copy, photo} · bearer `lotd_` token (SHA-256) · reply ≤512 B
SYNC: server next_sync_s 60–7200; device clamps, floors 30 min if bat<10, backs off 2×..2h on failure
COST: unit $117–183 @100 · pilot ≈ $19–42k incl. NRE + certification

VERIFIED
- HW-02: firmware/test/run.sh → 43/43 (g++ -Wall -Wextra -Werror, ASan+UBSan) for lot_core
- HW-02: device-sim contract test 14/14 against the mock server (re-run)
- HW-02: 9 PDFs rebuilt in manuals/

NOT VERIFIED / OPEN
- main.cpp (Arduino glue) never compiled: PlatformIO registry + dl.espressif.com blocked by network policy
  (pip install platformio works; `pio run` fails at "Installing espressif32")
- device-api.ts not wired into prod; prices/stock unverified (distributors blocked); BOM links = search URLs
- lot-systems.com, brand., institute. all refused by the egress proxy (3rd session in a row)
- VERIFY heights: Qi coil+ferrite, Li-Po pouch, camera module; Li-Po density 0.06 mAh/mm³ is a guess
- EPD backplane vs Qi coupling untested

DECISIONS PENDING (Inventor)
D0 merge this branch (see docs/09) · D1 5.0 mm (recommended now) vs 5.5 · D2 Qi face-down vs contact Dock
D3 camera → Log only or Mirror too · D4 US vs US+EU · D5 pilot price · D6 wire device-api into prod (flagged)
D7 confirm the name "SQ-1"

NEXT SESSION HW-03 (in order)
1 KiCad EVT-1 schematic + netlist from docs/05 §4
2 provision.* SoftAP portal (replace serial); GC0308 YUV→JPEG
3 if D6: port c0sqik server code (migration, model, routes, Logs.tsx) behind DEVICE_API_ENABLED
4 frame + back STEP drafts → PCBWay CNC quote
5 rebuild PDFs, rewrite this file, push docs/LOT-SR-<date>-HW03.md
