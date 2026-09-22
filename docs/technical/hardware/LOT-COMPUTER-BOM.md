================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — BILL OF MATERIALS
COMPONENTS, SUPPLIERS, LINKS, COST
================================================================================

DOCUMENT    LOT-COMPUTER-BOM
ISSUE DATE  2026.09.22
CLASS       INTERNAL / BUILD
STATUS      REFERENCE PARTS — confirm stock + exact P/N before ordering

================================================================================

## 00  HOW TO READ THIS

Each line names a component CLASS (what it must do) and a REFERENCE PART
(a real, currently-listed product that satisfies it) with a link and a
per-unit street price. Reference parts are proof the class is buildable
today, not a locked purchase order — Phase 1 (see ROADMAP 04) will confirm
exact P/Ns against live stock before the 100-unit order in Phase 5.

================================================================================

## 01  ELECTRICAL STACK

```
CLASS                REFERENCE PART                                    EST $   LINK
─────                ───────────────                                   ─────   ────
MCU + WIFI/BLE +      Seeed XIAO ESP32S3 Sense (dev-board reference;     $14     https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html
CAMERA (dev-stage)    ESP32-S3, 8MB PSRAM/Flash, OV2640, WiFi+BLE5)
                      Production stack: bare ESP32-S3-WROOM-1 module
                      + separate flex camera, once flex-PCB layout
                      replaces the dev board (see MECHANICAL-SPEC 02).

CAMERA (thin path)    OV2640 module, board-to-board FPC variant          $6      https://www.amazon.com/dp/B0DCK1K1MN
                      (LewanSoul ESP32-S3 cam module listing, camera
                      sub-assembly used as sourcing reference)

DISPLAY               0.42" OLED, I2C, FPC tail, round or square         $5      https://esp32s.com/product/esp32-s3-development-board-type-c-2-4-ghz-wi-fibtle-optional-with-0-42-inch-oled-display-for-arduino-esp32/
                      window trim — thinnest common off-the-shelf OLED
                      class; stretch option below for rev B.
DISPLAY (stretch,     1.32"-1.75" round AMOLED touch, 466x466, QSPI      $25-35  https://esp32s.com/product/esp32-s3-1-32inch-amoled-round-touch-display-development-board-466x466-pixels-qspi-interface-supports-wi-fi-and-bluetooth-5/
rev B — round face)   — matches the round "pager face" aesthetic but
                      adds thickness; holds for the 6-8mm buildable-now
                      path, not the strict 5mm target.

WEATHER SENSOR         Bosch BME680 breakout (temp/humidity/pressure/    $18     https://www.dfrobot.com/product-1697.html
(point 14, 15)         VOC gas, I2C) — "AI-grade" per point 15: BME680
                        ships with Bosch BSEC, a closed-form air-quality
                        inference library, the closest off-the-shelf
                        sensor to an actual on-chip AI grading claim.
                        Cheaper fallback: BME280 (temp/humidity/           $15     https://www.dfrobot.com/product-1697.html
                        pressure only, no gas/VOC, no BSEC) if VOC
                        sensing is dropped from v1 scope.

WIRELESS CHARGE        Qi receiver module, 5V/1A output, coil + PMIC     $6      https://www.amazon.com/dp/B09WVMWSXJ
RECEIVER (point 12,19) on one small PCB (DAOKAI Qi receiver, used as
                        the sourcing reference for the coil+PMIC class)
WIRELESS CHARGE         Adafruit/Pi Hut universal Qi receiver (5V/       $10-13  https://www.adafruit.com/product/1901
RECEIVER (alt, better   500mA, better-documented reference design —
documented)              safer bring-up part even if swapped for the
                         cheaper module in production)

BATTERY                 LiPo pouch cell, thinnest available (target      $4-6    (source at order time — pouch cells are
                         <2mm, 100-150mAh; a notification-only duty       sold by exact mm dimensions, not by a
                         cycle with an e-ink or low-refresh OLED does     stable catalog link; spec, not a link, is
                         not need a large cell)                          the durable reference here)

HAPTIC (pager buzz)      Vybronics VC0720B coin ERM motor — 7mm dia,     $2      https://www.digikey.com/en/product-highlight/j/jinlong/c0720b001f-coin-vibration-motor
                          2.1mm thick, smallest coin ERM on the market;
                          fits the 5mm height budget better than any
                          larger coin motor.

BUTTON ("Copy",          Low-profile SMD tactile switch, metal dome,     $0.50   (generic SMD tactile part; McMaster/
point 16)                 IP-rated cap bonded through the stainless       Digi-Key catalog part, not a single
                           shell face — exact part depends on shell        canonical link)
                           thickness at the button boss, confirmed in
                           Phase 2 fit-check.

ANTENNA                   PCB trace antenna on the ESP32-S3 module         $0      (built into WROOM-1 module)
                           (no external antenna — keeps the metal shell
                           from needing an RF window; WiFi/BLE range
                           through 0.3-0.5mm stainless is a Phase 1/2
                           test item, not assumed — steel attenuates RF
                           and this is the single biggest open technical
                           risk in the whole BOM).
```

================================================================================

## 02  MECHANICAL / MANUFACTURING (point 1, 3, 4, 17, 18)

```
CLASS                  PARTNER / SERVICE                                LINK
─────                  ─────────────────                                ────
PCB FAB                 PCBWay standard PCB fab                          https://www.pcbway.com/
                         (point 1 — named partner)

CNC STAINLESS SHELLS    PCBWay CNC machining, stainless steel 304        https://www.pcbway.com/rapid-prototyping/cnc-machining/metal/stainless-steel/
(FACE A polished,       (304 for the polished face — takes a mirror
FACE B functional)      finish and resists fingerprint corrosion
                         better than 201/430); quote via PCBWay's
                         mechanical/enclosure quote form.               https://www.pcbway.com/pcbdesign/quoteenclosure

PCBA (board assembly)   PCBWay SMT/turnkey PCB assembly                  https://www.pcbway.com/pcb-assembly.html
                         (Kitted or Turnkey — Turnkey recommended for
                         the 100-unit run so PCBWay sources common
                         passives directly; see quote path)             https://www.pcbway.com/quotesmt.aspx
```

Face-finish note: PCBWay's stainless-steel CNC page lists 304, 316/316L,
303, 430, 201 as available grades. 304 is specified for FACE A (point 17,
"polished stainless steel") because it is non-magnetic, corrosion-resistant,
and the standard consumer-electronics polish grade (same class as most
smartphone camera trim rings). FACE B (point 18, camera/screen/button side)
can use the same 304 in a bead-blasted or brushed finish, which also hides
fingerprints better around a touch surface than a mirror polish would.

================================================================================

## 03  PER-UNIT COST — SINGLE PROTOTYPE (buildable-now / 6-8mm path)

```
MCU/camera dev stack      $14
Display (0.42" OLED)      $5
Weather sensor (BME680)   $18
Qi receiver               $10
Battery (LiPo pouch)      $5
Haptic motor              $2
Button + misc hardware    $2
CNC shell pair (proto,    ~$60-90   (single-unit CNC carries full
1-off pricing)                       machine setup cost — this is
                                      the line that collapses hardest
                                      at 100-unit volume, see 04)
                          ────────
PROTO UNIT TOTAL          ~$116-146  ESTIMATE — confirm against live
                                      PCBWay quotes in Phase 1/2
```

================================================================================

## 04  100-UNIT PILOT RUN (point 13) — COST ROLLUP

```
LINE                       UNIT @1        UNIT @100      100-UNIT TOTAL
────                       ───────        ────────       ──────────────
Electrical BOM (01)        ~$56           ~$35-40 est.    ~$3,500-4,000
  (bulk pricing on MCU/camera/display/sensor/Qi/battery —
   ESTIMATE: expect 30-40% unit-cost reduction at 100pc from
   distributor price breaks; confirm per-line at order time,
   not assumed here)
CNC shell pair              $60-90         $8-15 est.      ~$800-1,500
  (CNC per-unit cost drops fastest with volume once the
   one-time setup/programming cost is amortized — PCBWay's own
   CNC project cost reference shows this pattern; ESTIMATE
   pending an actual 100-unit quote)                       https://hackaday.io/project/190831/log/224322-a-pcbway-cnc-fabrication-costs-usd257-334
PCBA (SMT assembly)         n/a (proto)    ~$5-8 est.      ~$500-800
  (turnkey SMT setup cost also amortizes at volume)
Button/haptic/misc          ~$3            ~$2             ~$200
                                                            ──────────────
ESTIMATED 100-UNIT HARDWARE COST                            ~$5,000-6,500
```

Every number in section 04 is marked ESTIMATE because it depends on a real
PCBWay quote against a finished shell CAD file and a finished PCB layout,
neither of which exists yet (ROADMAP Phase 2/4). This section exists to
size the pilot run for planning, not to commit a budget — do not treat it
as a purchase order.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END LOT-COMPUTER-BOM                                                 2026.09.22
================================================================================
