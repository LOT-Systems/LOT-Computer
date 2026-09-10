<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER — NODE-P
MANUFACTURING SPECIFICATION — PCB / ENCLOSURE / PRODUCTION RUN
================================================================================

DOCUMENT    MANUFACTURING / NODE-P
ISSUE DATE  2026.09.10
CLASS       INTERNAL / CONCEPT
STATUS      PLANNING ONLY. No PCBWay order, no enclosure sample order, no
            production PO is authorized by this document — see
            LOT-PAGER-NODE-P-PLAN.md §06 GATE before placing any of them.

================================================================================

## 01  PCB — WHY PCBWAY (brief #1)

PCBWay covers three of this project's needs under one vendor relationship,
which matters at 100-unit scale where coordinating separate PCB, assembly,
and even light CNC vendors adds real lead-time risk:

```
NEED                          PCBWAY SERVICE
────                          ───────────────
Bare PCB (2-layer, proto)      Standard PCB fab, 5-10 pc proto pricing
SMT assembly (ESP32-S3,        PCBA (assembly) service — send BOM + pick-
camera connector, PMIC, etc)   place file, get populated boards back
Small-batch CNC metal parts     PCBWay also runs a CNC machining service —
                               relevant if the stainless shell (§02) is
                               sourced from the same vendor rather than a
                               separate metal shop, worth quoting both ways
                               at P3.
```

Order: bare PCB proto (P2) -> hand-populate or PCBA-assemble first 5-10
boards -> firmware bring-up -> THEN commit to the 100-unit PCBA order
alongside the enclosure order (P5), once P2/P3 have both been validated.

================================================================================

## 02  ENCLOSURE — 2-PIECE STAINLESS BODY (brief #3, #4, #17, #18)

```
              TOP FACE (brief #18)              BOTTOM FACE (brief #17)
              ───────────────────                ───────────────────────
              - round LCD window (BOM §05)        - fully polished stainless,
              - camera aperture (BOM §02)           mirror or brushed finish
              - one COPY button (BOM §05)          - no openings — this is the
              - Qi charging passes through           "silver square" face brief
                this face when puck sits face-        #4 describes lying flat
                up on a charging stand                on a desk
```

**Dimensions (brief #4):** 40mm x 40mm x 5mm target. See
LOT-PAGER-NODE-P-PLAN.md §03 for the honest stack-height analysis — 5mm is
achievable with a side-mounted camera (Path A) or the working face grows
to 7-8mm with everything face-up as drawn in brief #18 (Path B). Decide
after P1/P2 hardware is in hand, not on paper.

**Two-piece split:** top and bottom shells meet at the puck's mid-line,
sandwiching the PCB, battery, and Qi coil between them. Suggested joining
method for a 100-unit pilot: a shallow lip + adhesive gasket (also gives
light water/dust resistance) rather than visible screws, keeping both
faces clean per brief #17/#18's "polished" and "camera, screen, button"
descriptions — no fasteners breaking up either face.

**Material + finish:** 304 or 316L stainless (316L costs more, resists
corrosion better — worth it at this size since the whole shell is a wear
surface handled daily). Bottom face polished to a mirror or brushed
finish per brief #17; top face has a fine bead-blast or brushed finish
around the openings so screen glare and fingerprints are less visible than
on a full mirror finish.

**Process at 100 units:** CNC-machined from bar stock is the realistic
choice at pilot volume — MIM (metal injection molding) only pays back its
higher tooling cost at volumes well above 100 units, so it's not worth
quoting until/unless a production run beyond the pilot is being planned.

================================================================================

## 03  CNC vs. tolerancing note

A 5-8mm-thick shell with a round display cutout, a camera aperture, and a
button hole is a straightforward 3-axis CNC job per face — no 5-axis
machining needed. The tolerancing that actually matters is the *fit*
between the two shell halves and the PCB/display stack inside — get this
validated on the 3D-printed proxy shell (PLAN §04, P3) before cutting a
single stainless sample, since a CNC re-cut costs real money and lead time
that a reprinted PLA shell does not.

================================================================================

## 04  WIRELESS CHARGER (brief #19)

Device side: Qi receiver IC + flat PCB coil, already specified in BOM §04
— this is the puck's job, already covered.

Charging stand side: rather than developing a custom transmitter, spec a
small desk stand that holds an off-the-shelf Qi transmitter puck at the
right orientation for NODE-P to sit on face-down (polished side up,
resting) or propped at an angle (working face visible while charging,
useful if it should keep showing notifications while charging). This is
an industrial-design question for P3, not an electronics one — the Qi
standard handles the actual power transfer regardless of stand shape.

================================================================================

## 05  100-UNIT PILOT RUN (brief #13)

```
STEP                                          GATE
────                                          ────
1. Confirm P2 PCB + P3 enclosure both          Requires: working PROTO-1
   validated against real firmware              units in hand, firmware
   (FIRMWARE.md frozen v1.0)                     frozen per PLAN §04 P4
2. Get firm quotes: PCBWay PCBA @ qty 100,      Requires: BOM finalized,
   stainless CNC shop @ qty 100 (both           step 1 complete
   halves), Qi receiver + battery @ qty 100
3. FCC/CE pre-check — ESP32-S3 modules          Can start in parallel
   often carry pre-certification for the         with step 2; final
   radio itself, but the finished product        product still needs its
   (with the enclosure/antenna placement)         own test/filing
   needs its own compliance pass
4. Founder sign-off against the real quotes      REQUIRED — see PLAN §06
   from step 2 (not the rough estimates in        GATE. This step does not
   BOM.md §07)                                    happen automatically.
5. Place PCBA order (PCBWay) + enclosure         Only after step 4
   order (CNC shop or PCBWay CNC) concurrently,
   ~4-6 week combined lead time is typical
   for this class of order
6. Final assembly (board + battery + Qi coil     In-house or via a
   + shell + firmware flash + pairing QC)         contract assembler —
                                                   TBD at step 4
7. Per-unit pairing token generation             See SOFTWARE-INTEGRATION
   (SOFTWARE-INTEGRATION §01) at final QC,         §01 — tokens are NOT
   not at board fab                               baked in at fab time
```

Lead time, rough order of magnitude: 6-10 weeks from step 4 sign-off to
100 assembled, paired units in hand — dominated by PCBA + stainless CNC
lead times running in parallel, plus final assembly/QC.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF MANUFACTURING SPEC                                            2026.09.10
================================================================================
