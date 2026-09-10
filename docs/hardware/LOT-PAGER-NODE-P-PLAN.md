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
PHYSICAL SIGNAL LAYER FOR THE LOT OPERATING SYSTEM
CONCEPT / ROADMAP / MASTER PLAN
================================================================================

DOCUMENT    PLAN / NODE-P
ISSUE DATE  2026.09.10
CLASS       INTERNAL / CONCEPT — PRE-SPEND, PRE-FAB
STYLE       TERMINAL GRID
STATUS      PLANNING ONLY — no PCB order, no enclosure order, no production
            run is authorized by this document. See §06 GATE.

================================================================================

## 00  WHAT THIS IS

A small stainless-steel object that sits on a desk, does one job well, and
says almost nothing. lot-systems.com already knows when the user should take
a break, drink water, or step outside — today that knowledge dead-ends in a
browser tab. NODE-P carries it into the room: one line of text on a screen
("Coffee time!"), one button to acknowledge it, one camera for context capture,
nothing else competing for attention. It is a pager, not a phone.

This document is the master plan. It maps the 19-point brief to five
companion documents, each scoped narrowly on purpose (§11 of the brief:
"separate documents" — a pager spec, a BOM, a firmware spec, a software/API
spec, and a manufacturing spec, rather than one sprawling file).

    docs/hardware/LOT-PAGER-NODE-P-PLAN.md          <- this file
    docs/hardware/LOT-PAGER-BOM.md                  <- components + buying list
    docs/hardware/LOT-PAGER-FIRMWARE.md              <- on-device firmware spec
    docs/hardware/LOT-PAGER-SOFTWARE-INTEGRATION.md  <- LOT API connector
    docs/hardware/LOT-PAGER-MANUFACTURING.md         <- PCB / enclosure / run
    docs/hardware/LOT-PAGER-USER-MANUAL.md           <- manual source -> PDF

================================================================================

## 01  BRIEF -> DOCUMENT MAP

Each numbered line from the founder's brief, mapped to where it is spec'd.

```
#   BRIEF LINE                                    SPEC LOCATION
─   ──────────                                    ─────────────
1   PCBWay                                         MANUFACTURING §01, §04
2   Pager-like notification from AI-powered site   SOFTWARE-INTEGRATION §02
3   2-part stainless steel body                    MANUFACTURING §02
4   Flat silver square 4x4cm x 5mm height           MANUFACTURING §02, PLAN §04
5   Camera                                          BOM §02, FIRMWARE §03
6   Use LOT API connector                           SOFTWARE-INTEGRATION §01
7   Result in PDF manuals                           LOT-PAGER-USER-MANUAL.md
8   Compress the information in each session        FIRMWARE §04
9   Firmware documents                              LOT-PAGER-FIRMWARE.md
10  Software to connect with firmware                SOFTWARE-INTEGRATION.md
11  Separate documents                              this doc set (6 files)
12  Charger                                          BOM §04, MANUFACTURING §02
13  100 units run                                    MANUFACTURING §05
14  Weather sensor                                   BOM §03
15  AI-grade off-the-shelf sensors                   BOM §03
16  "Copy" button -> signal to Log tab                FIRMWARE §05, SOFTWARE-INTEGRATION §03
17  One side polished stainless steel                 MANUFACTURING §02
18  Other side: camera, screen, button                MANUFACTURING §02
19  Wireless charger                                  BOM §04
-   Screen shows autonomous notifications              FIRMWARE §02, §05
```

================================================================================

## 02  ONE-LINE SPEC

A 40mm x 40mm x 5mm two-piece stainless-steel puck. Polished face down or
propped; working face up carries a round display, a micro camera, and one
button labeled COPY. It Qi-charges on a small stand. It shows one line at a
time, pushed by lot-systems.com over the existing LOT API. Pressing COPY logs
"acknowledged" back to the site's Log tab. That is the entire product.

    NOT A PHONE. NOT A WEARABLE. NOT ALWAYS-ON VIDEO. ONE LINE. ONE BUTTON.

================================================================================

## 03  WHY THIS FORM FACTOR (AND WHERE IT FIGHTS PHYSICS)

The brief specifies 4x4cm x 5mm — a genuinely tight envelope once a display,
a camera, a battery, a Qi coil, an MCU, and a stainless shell all have to
fit inside it. Being honest about the fight up front is cheaper than
discovering it after a PCBWay order ships:

```
COMPONENT           TYPICAL THICKNESS        FITS IN 5mm STACK?
─────────           ─────────────────        ──────────────────
Round LCD module      ~2.0–2.4mm               yes, tight
Camera module (OV2640) ~2.5–3.5mm (incl. lens) marginal — see below
Flat LiPo cell         ~2.0mm @ 250mAh          yes if area-matched
Qi receiver coil       ~0.5mm                   yes
MCU + PCB + shell wall ~1.0–1.5mm combined       yes
```

Stacking screen + camera + battery + coil on ONE 5mm-thick board is the
actual constraint — not any single part. Two honest paths:

    PATH A — 5mm HELD, SCREEN-ONLY WORKING FACE
    Camera moves to the puck's edge as a small side-facing module (like a
    laptop webcam bezel), screen and button stay face-up flat. Keeps the
    brief's 5mm dimension exactly.

    PATH B — 7–8mm, EVERYTHING FACE-UP AS DRAWN
    Camera, screen, and button all sit flush on one face as the brief
    describes in #18. Adds 2–3mm of body height — visually still reads as
    "a flat silver square," just not exactly 5mm.

RECOMMENDATION: prototype Path B first (it matches the brief literally and
de-risks faster on a breadboard), decide after the first PCBWay proto run
in hand whether the 2–3mm is worth shaving for Path A. This is a decision
for the founder after §04 PROTO-0, not before.

================================================================================

## 04  ROADMAP

```
PHASE   NAME                          GATE OUT                              TARGET
─────   ────                          ────────                              ──────
P0      Concept + doc set (this)      Founder reads & approves scope        done today
P1      PROTO-0 — dev-kit rig         Firmware talks to /api/logs live,     2–3 weeks
        (off-shelf ESP32-S3 +          notification round-trips end to end
        camera + round LCD, no        on a breadboard — zero custom PCB,
        custom PCB, no enclosure)     zero enclosure spend
P2      PROTO-1 — first custom PCB    5–10 bare boards from PCBWay,          +3–4 weeks
        (PCBWay proto run)            bring-up + firmware ported to it
P3      Enclosure prototype           3D-printed stand-in shell first;       +2–3 weeks
                                       CNC/MIM stainless sample only after
                                       the 3D-printed shell fits the PCB
P4      Firmware freeze + manuals     FIRMWARE.md locked v1.0, user manual   +2 weeks
                                       PDF generated, FCC/CE pre-check done
P5      100-unit pilot run            MANUFACTURING §05 — requires explicit  after P4,
                                       founder sign-off, see §06 GATE         gated
```

Nothing after P1 requires spend beyond a handful of dev boards (~$40–80
total). P2 (PCBWay proto) and P5 (100-unit run) are the two points where
real money and lead time enter — both are named gates below.

================================================================================

## 05  WHAT EXISTS ALREADY (REUSE, DON'T REBUILD)

NODE-P is a peripheral of the LOT stack that already runs in this repo —
it does not need its own backend:

- `POST /api/logs` (`src/client/queries.ts`) already accepts
  `{ text, event?, metadata? }` and writes to the same Log the site's Log
  tab reads — this is exactly the endpoint brief #16's COPY button needs.
  See SOFTWARE-INTEGRATION.md §03.
- `/api/sync` (`src/server/routes/api.ts`) already serves Server-Sent
  Events to the browser — the same channel the site uses for live signals
  is the natural transport for pushing a notification line to the device.
  See SOFTWARE-INTEGRATION.md §02.
- `docs/technical/OS_API.md` documents the existing user-state API; NODE-P
  is a *consumer* of that state (it reads what the site already knows),
  not a new source of truth.
- `docs/technical/LOT-NODE-0-RIG-SPEC.md` set the house style for a
  hardware spec in this repo (TERMINAL GRID, explicit HUMAN GATE section)
  — this doc set follows the same convention on purpose.

================================================================================

## 06  GATE — BEFORE ANY MONEY MOVES

Carried forward from NODE-0's own transparency principle: autonomy on the
drafting/planning layer, human sign-off on anything irreversible.

    THIS DOCUMENT SET AUTHORIZES: research, planning, a $40–80 breadboard
    dev-kit (P1), and documentation.

    THIS DOCUMENT SET DOES NOT AUTHORIZE: submitting a PCBWay order (P2),
    ordering a CNC/MIM stainless enclosure sample (P3), or committing to
    the 100-unit run (P5). Each of those needs an explicit go from the
    founder against a priced quote at the time — component prices, PCBWay
    tooling costs, and stainless machining quotes all move week to week,
    same as NODE-0's GPU pricing did.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF PLAN                                                          2026.09.10
================================================================================
