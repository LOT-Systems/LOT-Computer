================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — USER MANUAL (DRAFT)
PRINT/PDF-READY SOURCE — see note below
================================================================================

STATUS: DRAFT — written against the planned v1 device (ROADMAP Phase 5/6).
No physical unit has shipped yet; instructions below describe intended
behavior, not verified behavior. Update this file, do not write a second
one, once Phase 2 hardware exists to test against.

PDF NOTE: this session's build environment has no PDF renderer installed
(no pandoc/weasyprint/reportlab). This file is written print-ready —
fixed short lines, no dependency on live hyperlinks or color — so that
`pandoc LOT-COMPUTER-MANUAL-DRAFT.md -o LOT-COMPUTER-MANUAL.pdf` (or the
repo's own PDF pipeline once one exists) is a one-command mechanical step
for the next session. Recorded as PROVISIONAL per protocol rather than
claiming a PDF that was not actually produced.

================================================================================

## IN THE BOX

- 1x LOT Computer (40mm x 40mm, stainless steel)
- 1x Wireless charging dock (Qi-compatible)
- 1x Quick-start card

================================================================================

## FIRST SETUP

1. Place the device on the charging dock, FACE A (polished side) down.
2. Wait for FACE B's screen to show a 6-digit pairing code.
3. On lot-systems.com, log in, open Settings, choose "Pair a device,"
   and enter the code shown on screen.
4. Follow the on-screen prompt to select your WiFi network and enter
   its password — sent to the device over a short-range Bluetooth
   link, not typed on the device itself (it has no keyboard).
5. The device reboots and shows a checkmark when paired successfully.

================================================================================

## USING IT

**The screen.** Shows one short line from LOT when there is something
worth telling you — a self-care nudge, a weather note, a streak
reminder. It is blank the rest of the time. It does not show a clock,
a feed, or anything to scroll.

**The button ("Copy").** Press it any time. It logs a moment — press it
when something notable just happened and you want it marked, the same
way you'd jot a note. It shows up in your Log tab on lot-systems.com
within moments of pressing it, as an entry with no text of its own; it
is a marker, not a note — add detail on the Log tab afterward if you
want to.

**Charging.** Set it on the dock, FACE A down. No cable to plug in.

================================================================================

## THE TWO SIDES

FACE A (polished): faces up when idle or charging. No screen, no
button — the quiet side.

FACE B (matte): camera, screen, and the Copy button. Faces you when
you pick the device up or set it on a shelf.

================================================================================

## CARE

- Wipe FACE A with a soft cloth; avoid abrasive cleaners on the polish.
- The small vent on FACE B is for the weather sensor — do not cover it
  or seal it with tape or a sticker.
- The device is splash-resistant, not waterproof — do not submerge it.

================================================================================

## TROUBLESHOOTING (anticipated — confirm once real units exist)

```
SYMPTOM                          LIKELY CAUSE / ACTION
───────                          ──────────────────────
Screen never lights up           Check charge; place squarely on dock
Pairing code never appears       Hold device off any metal surface —
                                  charging dock alignment can suppress
                                  the BLE advertise step
Button press doesn't appear      Device was offline at press time — v1
in Log tab                       has no retry; the press is not queued
```

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END LOT-COMPUTER-MANUAL-DRAFT                                        2026.09.22
================================================================================
