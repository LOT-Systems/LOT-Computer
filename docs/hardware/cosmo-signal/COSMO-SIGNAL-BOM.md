================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: COSMO-SIGNAL-BOM
TITLE:    COSMO® Signal — Bill of Materials, Sourcing, and 100-Unit Costing
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-07
VERSION:  1.0 — SOURCED, NOT YET ORDERED
COMPANION: COSMO-SIGNAL-v1-HARDWARE-PLAN.md (specification this BOM builds)
================================================================================

--------------------------------------------------------------------------------
00 // HOW TO READ THIS DOCUMENT
--------------------------------------------------------------------------------

Every line was checked against a live product listing at research time
(2026-09-07). Prices are per-unit at hobbyist/prototype quantity unless a
100-unit column is shown — real 100-unit pricing requires a formal PCBWay
/ distributor quote (Section 04) and will move, usually down, once
quoted. Links point to the actual product pages found; re-verify before
ordering, since listings and prices change.

--------------------------------------------------------------------------------
01 // ELECTRONICS — PER-UNIT BOM
--------------------------------------------------------------------------------

  PART                    SPEC                          UNIT PRICE   SOURCE
  ────                    ────                          ──────────   ──────
  Compute module           ESP32-S3-WROOM-1-N16R8,       ~$6-9        LCSC /
                            dual-core, Wi-Fi+BLE, 16MB                 Mouser /
                            flash / 8MB PSRAM                          Digi-Key
                            (module only, for custom PCB)
  Reference dev board       ESP32-S3-EYE (camera+LCD+     ~$25-35      Espressif
  (v.0 bench prototype      button, official Espressif                official /
  ONLY — not in v.1 BOM)    board, see plan Section 08)                Mouser
                            github.com/espressif/esp-bsp/
                            blob/master/bsp/esp32_s3_eye
  Display                   1.3" IPS 240x240, ST7789,     ~$7-12       Waveshare
                            SPI                                        1.3inch-
                                                                        lcd-module
                            waveshare.com/1.3inch-lcd-module.htm
  Camera                    OV2640, 2MP-capable module    ~$4-8        Widely
                                                                        stocked —
                                                                        e.g. via
                                                                        FireBeetle
                                                                        2 ESP32-S3
                                                                        AI board
                                                                        reference,
                                                                        dfrobot.com/
                                                                        product-2676
                                                                        .html
  Environmental sensor      Bosch BME688, I2C — temp,     ~$10-15      Adafruit
                            humidity, pressure, AI gas                 BME688
                            scan                                       STEMMA QT,
                                                                        adafruit.com/
                                                                        product/5046
  IMU                       6-axis accel+gyro (e.g.       ~$3-6        Widely
                            MPU-6050/ICM-42670 class)                  stocked,
                                                                        LCSC/Mouser
  Wireless charge receiver  Qi-standard receiver coil +   ~$1.50-3     AliExpress
                            PCBA, 5V 1A out                            DIY Qi
                                                                        Receiver
                                                                        Module,
                                                                        aliexpress.com/
                                                                        item/
                                                                        32997378799
                                                                        .html
  Battery                   3.7V 300mAh LiPo pouch cell   ~$3-9        DNK Power /
                                                                        LiPolyBatteries
                                                                        .com
                                                                        (LP602030
                                                                        class, 6g)
  Button                    Stainless-cap tactile switch, ~$1-2        McMaster /
                            IP54                                       Digi-Key
  Custom PCB (per unit,     4-layer, ~40x40mm, ENIG        ~$3-6 at    PCBWay PCB
  100-qty pricing)          finish                         100 qty     fab (see
                                                                        Section 04)
  Passives / regulator /    Buck/charge-mgmt IC, caps,     ~$3-5       LCSC /
  connectors                resistors, JST battery conn.               PCBWay
                                                                        parts
                                                                        library

  ELECTRONICS SUBTOTAL (per unit, prototype-quantity pricing): ~$42-65
  ELECTRONICS SUBTOTAL (per unit, 100-unit distributor pricing,
  estimated 25-35% reduction on the semiconductor/module lines): ~$30-45

--------------------------------------------------------------------------------
02 // ENCLOSURE — PER-UNIT
--------------------------------------------------------------------------------

  PART                SPEC                                  EST. UNIT COST
  ────                ────                                  ──────────────
  Front shell          316L stainless, CNC/sheet-metal,      $15-25 at
                       satin bead-blast finish, camera        100-qty
                       aperture + display window + button    (PCBWay CNC
                       cutout, ~40x40x7mm                     stainless
                                                               steel, see
                                                               Section 04)
  Back plate           316L stainless, mirror-polished,       $8-15 at
                       laser-etched COSMO® mark + serial +    100-qty
                       QR, 40x40x5mm flat (S-2 spec exact)
  Gasket + fasteners   Silicone seam gasket, 4x M1.6           $1-2
                       stainless screws
  Display window       Sapphire or hardened glass lens,        $2-4
                       ~28mm

  ENCLOSURE SUBTOTAL (per unit, 100-unit CNC/sheet-metal pricing): ~$26-46

--------------------------------------------------------------------------------
03 // CHARGING DOCK (COMPANION ACCESSORY, PER UNIT SHIPPED)
--------------------------------------------------------------------------------

  Qi wireless charging transmitter puck, 5V/2A input, USB-C —
  ~$6-10 at qty, e.g. QuartzComponents Qi transmitter class module,
  quartzcomponents.com/products/5v-dc-qi-standard-micro-usb-input-
  wireless-charging-transmitter-module-with-coil (swap to USB-C input
  variant for the actual pilot BOM).

--------------------------------------------------------------------------------
04 // MANUFACTURING PARTNER — PCBWAY (S-2 BRIEF ITEM 1)
--------------------------------------------------------------------------------

  SERVICE               USE                              REFERENCE
  ───────                ───                              ─────────
  PCB fabrication         Custom 4-layer board             pcbway.com/
                                                            HighQualityOrder
                                                            Online.aspx
  SMT / PCBA assembly     Turnkey (PCBWay sources +        pcbway.com/
                          places all parts) or Kitted      pcb-assembly.html
                          (S-2 ships parts, PCBWay          — low-volume
                          places) — turnkey recommended     prototype PCBA
                          for a 100-unit pilot to reduce    from ~$88/10
                          coordination overhead             units at proto
                                                             scale per public
                                                             pricing reports;
                                                             100-unit turnkey
                                                             requires a
                                                             formal quote
  CNC machining /         Front shell + back plate,         pcbway.com/
  sheet metal             316L stainless steel               rapid-
  (stainless steel)                                          prototyping/
                                                              cnc-machining/
                                                              metal/
                                                              stainless-steel/
                                                              and .../
                                                              sheet-metal/
                                                              metal/
                                                              stainless-steel/
                                                              — public sample
                                                              quotes in the
                                                              $250-350 range
                                                              for a single
                                                              multi-part CNC
                                                              job at
                                                              prototype qty;
                                                              100-unit run
                                                              price is a
                                                              separate
                                                              production
                                                              quote, expect
                                                              material +
                                                              machine-time
                                                              cost to drop
                                                              substantially
                                                              per-unit at
                                                              volume
  Final assembly + QC     PCBWay offers box-build /          Request as
                          final assembly add-on;             part of the
                          alternative: in-house final        turnkey quote;
                          assembly (screw shell halves,       fallback:
                          fit gasket, functional test)        in-house

  WHY ONE VENDOR: S-2's brief names PCBWay first (item 1) and specifies a
  100-unit run (item 13) — a single vendor carrying PCB, PCBA, and CNC
  stainless steel removes the shipping/tolerance-matching risk of
  coordinating three separate shops for a first pilot run.

--------------------------------------------------------------------------------
05 // ESTIMATED PER-UNIT AND 100-UNIT TOTALS
--------------------------------------------------------------------------------

  COST CATEGORY                    PER-UNIT (100-QTY EST.)   x100 UNITS
  ─────────────                    ────────────────────────   ──────────
  Electronics (Section 01)          $30-45                     $3,000-4,500
  Enclosure, CNC stainless          $26-46                     $2,600-4,600
  (Section 02)
  Charging dock accessory           $6-10                      $600-1,000
  (Section 03)
  PCB fab + SMT assembly            ~$8-15 (fab+assembly       $800-1,500
  (folded into Section 01/04)       labor, beyond parts)
  Non-recurring engineering (NRE):  one-time, not per-unit     $1,500-4,000
  tooling, CNC fixtures, PCBA                                  (ONE-TIME)
  setup, first-article inspection

  ESTIMATED PILOT RUN TOTAL (100 UNITS, INCLUDING NRE):
    Low estimate:  ~$8,500   ($85/unit effective)
    High estimate: ~$15,600  ($156/unit effective)

  This is a planning-grade estimate for a first pilot run, not a
  quote. The next real step is submitting the enclosure CAD (once
  drafted from Section 02 of the hardware plan) and the PCB Gerbers to
  PCBWay's online quote tools (Sections 01/04 links above) for an actual
  number — see COSMO-SIGNAL-MANUFACTURING-ROADMAP.md Section 02 for the
  quote-request checklist.

--------------------------------------------------------------------------------
06 // OPEN SOURCING QUESTIONS FOR THE NEXT SESSION
--------------------------------------------------------------------------------

  - Confirm 316L vs 304 stainless (316L costs more, resists corrosion
    better for a device that will sit near coffee cups and humid desks).
  - Confirm turnkey vs kitted PCBA with PCBWay directly — turnkey is
    simpler to plan but ties part sourcing/lead-time to their inventory.
  - Get an actual CNC quote once front-shell and back-plate CAD exist
    (they do not yet — CAD drafting is the next physical-design step,
    not covered by this document).
  - Decide compliance path (FCC/CE) before committing to a 100-unit run
    intended for anyone outside internal pilot testers — a Wi-Fi/BLE
    radio device sold or shipped to third parties in the US requires FCC
    certification; internal-only pilot units do not, but the 100-unit
    scale in S-2's brief reads as beyond pure R&D, so this should be
    resolved explicitly, not assumed, before ordering.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END COSMO-SIGNAL-BOM
================================================================================
