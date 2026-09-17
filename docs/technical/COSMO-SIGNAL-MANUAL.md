<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# COSMO® SIGNAL — USER MANUAL

```
================================================================================
DOCUMENT    COSMO-SIGNAL / USER-MANUAL
ISSUE DATE  2026.09.17
CLASS       PUBLIC — ships in-box (PDF export of this file)
FORMAT      Source of truth for the printed/PDF manual, one per unit
================================================================================
```

This file is the source for the PDF manual shipped in every SIGNAL box
(build order item 7 — "result in PDF manuals"). It is kept as its own
document, separate from the hardware, firmware, and software specs, so
this file — and only this file — needs to change when user-facing
behavior changes, without touching engineering documents that a customer
never sees. Render to PDF with the repo's existing PDF pipeline (see
`docs/technical` badge-codex PDF exports for the established tool) at
release time.

---

## WHAT'S IN THE BOX

- 1× COSMO® SIGNAL (40mm × 40mm × 5mm, polished stainless steel)
- 1× Qi wireless charging puck
- 1× USB-C cable (for the charging puck)
- This manual

---

## MEET SIGNAL

SIGNAL has two sides.

- The **polished side** is the front. Set it facing out — it's just
  stainless steel, nothing to press.
- The **working side** is the back: a small screen, a camera, and one
  button labeled **COPY**.

SIGNAL is not a screen you check. It's a light that comes on when LOT has
something to tell you.

---

## SETUP

1. Place SIGNAL on the included charging puck, working side up, until the
   screen shows a charging glyph.
2. Open LOT Systems (lot-systems.com) → Account → **Devices** → **Pair a
   SIGNAL**.
3. Find the pairing code laser-etched on the back of your unit, next to
   the COPY button.
4. Enter the code on the Devices page. Your phone or computer will hand
   SIGNAL your WiFi over a short Bluetooth handshake — SIGNAL never asks
   you to type a WiFi password on the device itself, because it has no
   keyboard.
5. Once paired, the screen will show a short confirmation message. Setup
   is done — you will not need to open the app again to use it.

---

## USING SIGNAL

**Notifications.** When LOT has something worth surfacing — a nudge from
your own patterns, or a message you send yourself from the Devices page —
SIGNAL's screen updates. That's the whole interaction. No sound, no
vibration. Glance, or don't.

**The COPY button.** Press it any time. It does one thing: it writes an
entry to your **Log** tab on lot-systems.com, timestamped, labeled with
which SIGNAL sent it (useful if you pair more than one). Think of it as a
single physical "note to self" button — press it when something is worth
marking, and go read what you meant later, in the app.

**Battery.** SIGNAL's screen holds its last message with no power draw —
it is not counting down a battery like a phone. Expect several weeks
between charges under normal use. Set it back on the puck any time; there
is no way to overcharge it.

---

## CARE

- The polished face is mirror-finish stainless steel and will show
  fingerprints — a soft cloth restores it. Avoid abrasive cleaners.
- SIGNAL is splash-resistant, not waterproof. Keep it off a wet counter.
- The etched pairing code on the back is permanent — you will need it
  again if you ever re-pair (e.g., after moving to a new WiFi network
  more than a factory reset away, see below).

---

## FACTORY RESET

Hold **COPY** for 10 seconds. The screen will clear. SIGNAL forgets its
WiFi and its pairing — repeat **SETUP** above to use it again, including
on a different LOT account.

---

## TROUBLESHOOTING

| SYMPTOM                              | TRY THIS                                                    |
|----------------------------------------|--------------------------------------------------------------|
| Screen never updates                   | Confirm it's paired: Account → Devices should list it as "seen" recently. Move it closer to your WiFi router. |
| COPY press doesn't appear in Log tab   | Check Devices page for a "needs re-pair" flag — a changed WiFi password will disconnect it silently until re-paired. |
| Screen looks smudged / ghosted         | Normal for e-ink after many updates; the next full refresh clears it. |
| Won't charge                           | Confirm the puck itself is powered (USB-C plugged into power, not just a computer that's asleep). |

---

## SUPPORT

lot-systems.com → Account → Devices → **Report an issue**, or reach LOT
Systems support through the existing in-app channel. Include the pairing
code etched on your unit — it identifies the exact hardware revision.

================================================================================
LOT SYSTEMS CORPORATION · COSMO® HARDWARE DIVISION            LOS ANGELES, CA
END OF USER MANUAL                                                   2026.09.17
================================================================================
