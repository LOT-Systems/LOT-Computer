================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: COSMO-SIGNAL-MANUFACTURING-ROADMAP
TITLE:    COSMO® Signal — PCBWay Production Path to a 100-Unit Pilot Run
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-07
VERSION:  1.0 — PLANNING
COMPANION: COSMO-SIGNAL-v1-HARDWARE-PLAN.md, COSMO-SIGNAL-BOM.md
================================================================================

--------------------------------------------------------------------------------
01 // PHASES
--------------------------------------------------------------------------------

  PHASE 0 — BENCH PROTOTYPE (v.0, 1-3 units)
    - Order: ESP32-S3-EYE reference board + Adafruit BME688 breakout +
      AliExpress Qi receiver module + Waveshare 1.3" display (if the
      EYE board's built-in 1.3" LCD is not reused directly).
      All hobbyist-quantity, ship in days, no PCBWay order needed yet.
    - Build: 3D-printed stand-in shell (not stainless — this phase tests
      electronics and firmware only, per hardware plan Section 08 gate).
    - Exit gate: 72h continuous bench run, COPY → /api/logs round trip
      verified against a real lot-systems.com account, presence-gate
      false-positive rate <10%.

  PHASE 1 — SCHEMATIC + PCB LAYOUT
    - Design a 4-layer custom PCB integrating ESP32-S3-WROOM-1-N16R8,
      BME688 (I2C), IMU (I2C/SPI), OV2640 camera connector, ST7789
      display connector, Qi receiver + charge management, button, and a
      JST battery connector — footprint constrained to fit inside the
      40x40mm front shell with clearance for the 5mm back plate stack
      (hardware plan Section 02).
    - Tooling: KiCad (open, no license cost) recommended for a first
      pilot; PCBWay accepts KiCad/Gerber/Eagle exports directly through
      their online order tool (pcbway.com/HighQualityOrderOnline.aspx).
    - Exit gate: DRC-clean Gerbers, BOM in PCBWay's part-library format
      for turnkey sourcing (see COSMO-SIGNAL-BOM.md Section 04).

  PHASE 2 — ENCLOSURE CAD
    - Model FRONT SHELL and BACK PLATE (hardware plan Section 02) in a
      CAD tool PCBWay's CNC/sheet-metal quote tool accepts (STEP/IGES
      for CNC, DXF for sheet metal).
    - Confirm camera aperture, display window, and button cutout
      tolerances against the PCB's actual component placement from
      Phase 1 — this is the step that turns "4x4cm x 5mm" from a spec
      number into a manufacturable part.
    - Exit gate: CAD files submitted to PCBWay's CNC-machining
      (pcbway.com/rapid-prototyping/cnc-machining/metal/stainless-steel/)
      and sheet-metal (pcbway.com/rapid-prototyping/sheet-metal/metal/
      stainless-steel/) quote tools, first-article prototype quote in
      hand (expect ~$250-350 per prototype set of parts, per public
      sample pricing — see COSMO-SIGNAL-BOM.md Section 04).

  PHASE 3 — FIRST ARTICLE (5-10 UNITS)
    - Order a small pre-production batch: 5-10 PCBAs (turnkey through
      PCBWay) + 5-10 CNC stainless steel shell/plate sets.
    - Hand-assemble and functionally test each unit against the QC
      checklist in Section 03 below.
    - Exit gate: 5/5 or 10/10 units pass QC with zero rework; confirms
      tolerances (screw bosses, gasket fit, window seating) before
      committing to volume tooling.

  PHASE 4 — PILOT RUN (100 UNITS, S-2 BRIEF ITEM 13)
    - Submit the same Gerbers/CAD from Phases 1-2, now validated by
      Phase 3, as a 100-unit turnkey order: PCBWay PCBA (100x) + PCBWay
      CNC/sheet-metal stainless steel (100x front shells + 100x back
      plates).
    - Final assembly: either PCBWay's box-build/assembly add-on, or
      in-house — screw the two shells together over the tested PCB,
      fit gasket, run QC checklist per unit.
    - Exit gate: matches hardware plan Section 08 v.1 gate — 100/100
      units pass QC, <5% return/defect rate in the first 30 days of
      real operator use.

  PHASE 5 — FIELD PILOT
    - Distribute the 100 units to Usership-tier operators (or an
      internal test cohort first, S-2's call) per the existing Usership
      hardware-kit precedent set by LOT® Station / LOT® Brush
      (LOT-AMBIENT-AI-VISION.md).
    - Collect Log-tab COPY-event data as the success telemetry — no
      separate survey infrastructure needed, since every COPY press is
      already a structured Log entry.

--------------------------------------------------------------------------------
02 // PCBWAY QUOTE-REQUEST CHECKLIST (WHAT TO HAVE READY BEFORE ASKING)
--------------------------------------------------------------------------------

  For PCB + PCBA quote:
    [ ] Gerber files (RS-274X) + drill file
    [ ] BOM in PCBWay's accepted format (part number, designator,
        quantity, package) — see pcbway.com/components/ for their
        parts-library lookup before finalizing designators
    [ ] Pick-and-place (centroid) file
    [ ] Turnkey vs kitted decision (BOM Section 04)
    [ ] Quantity: 100 (plus 5-10 spares recommended for QC attrition)

  For CNC/sheet-metal stainless steel quote:
    [ ] STEP/IGES (CNC) or DXF (sheet metal) for front shell and back
        plate, separately
    [ ] Material spec: 316L stainless steel, explicit alloy callout
        (BOM Section 06 open question — confirm 316L vs 304 first)
    [ ] Finish spec per surface: front = satin/bead-blast, back = mirror
        polish (hardware plan Section 02)
    [ ] Tolerance callouts on camera aperture, display window, and
        button cutout (these mate to the PCB — get them from the Phase
        1 PCB layout, not guessed independently)
    [ ] Quantity: 100 of each (plus spares)

--------------------------------------------------------------------------------
03 // PER-UNIT QC CHECKLIST (PHASE 3 AND PHASE 4)
--------------------------------------------------------------------------------

  [ ] Power-on: display lights within 2s of wireless-charge contact
  [ ] Wi-Fi: unit joins test network and completes one poll cycle
      (hardware plan Section 05, READ path)
  [ ] Camera: presence-check returns a non-null reading (no image
      verification needed or wanted — Section 04 of the hardware plan)
  [ ] BME688: returns plausible temp/humidity/pressure reading
  [ ] IMU: registers a bump/orientation change
  [ ] COPY button: press produces a real POST /api/logs entry visible
      in a test operator's Log tab within 5s
  [ ] Wireless charge: unit draws charge current when seated on the
      companion Qi puck
  [ ] Enclosure: seam gap within tolerance, no light leak, screws torque
      to spec, back plate polish free of visible CNC tooling marks
  [ ] Serial/QR laser etch legible and matches the unit's registered
      device_id

--------------------------------------------------------------------------------
04 // TIMELINE (PLANNING-GRADE, NOT COMMITTED)
--------------------------------------------------------------------------------

  Phase 0  (bench prototype)         2-3 weeks — parts ship in days,
                                      firmware bring-up is the long pole
  Phase 1  (PCB layout)              2-4 weeks, can overlap Phase 0
  Phase 2  (enclosure CAD)           2-3 weeks, can overlap Phase 1
  Phase 3  (first article, 5-10)     3-4 weeks (PCBWay standard PCBA +
                                      CNC lead time, typically 1-2 weeks
                                      manufacturing + shipping, plus
                                      assembly/QC time)
  Phase 4  (pilot run, 100 units)    4-6 weeks (volume PCBA + CNC lead
                                      time is longer than prototype lead
                                      time; confirm exact lead time in
                                      the Phase 4 quote)
  Phase 5  (field pilot)             ongoing, 30-day defect-rate window
                                      starts at first unit in operator
                                      hands (hardware plan Section 08)

  ROUGH TOTAL, BENCH TO SHIPPED PILOT: ~4-5 months, sequential; ~3-3.5
  months if Phases 0-2 overlap as noted above. This is a planning
  estimate — actual PCBWay lead times must be confirmed at quote time
  (Section 02 checklist) before this timeline is treated as a
  commitment.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END COSMO-SIGNAL-MANUFACTURING-ROADMAP
================================================================================
