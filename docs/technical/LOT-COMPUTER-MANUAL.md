# LOT Computer — Setup & Operation Manual

**LOT Systems Corporation** · brand.lot-systems.com
Inventor: Vadik Marmeladov · LOT® / COSMO® CIA
Manual version 0.1 · 2026-09-12 · Pre-production draft (v0.1 hardware track)

---

## What it is

LOT Computer is a small stainless-steel notification device that sits on
your desk. It shows one message at a time from your LOT account — things
like "Coffee time!" — and has a single button, **Copy**, that saves the
moment to your Log on lot-systems.com.

One side is polished stainless steel. The other holds a camera, a round
screen, and the Copy button. It charges wirelessly.

This manual covers first setup, daily use, and care. It describes the
planned v1.0 device — see LOT-COMPUTER-HARDWARE-SPEC.md if you are building
or sourcing the unit rather than using one.

---

## In the box (planned)

- LOT Computer unit
- Wireless charging pad (Qi)
- USB-C cable (charging pad power + firmware recovery)
- Quick-start card with a pairing QR code

---

## First setup

1. Place LOT Computer on the charging pad. The screen lights up with the
   LOT wordmark once there is enough charge to boot.
2. The screen shows **PAIR ME** and a 6-digit code.
3. On lot-systems.com, sign in and open **Settings → Devices → Add Device**.
4. Enter the 6-digit code shown on the unit.
5. The screen changes to your account's idle view. Setup is done.

If the unit does not show a pairing code, hold the Copy button for 5
seconds to reset it into pairing mode.

---

## Daily use

**Notifications.** When lot-systems.com has something short and timely to
tell you, it appears on the screen — for example "Coffee time!" — and
stays for up to 10 minutes or until you press Copy, whichever comes first.

**The Copy button.** Press it once to:
- Save the message currently on screen to your Log, with a timestamp.
- Take a quick photo through the built-in camera, attached to that Log
  entry (best effort — if the shot fails, the text still saves).
- Flash the screen border green to confirm — this happens even if your
  WiFi is briefly down; the save is queued and sent as soon as you're
  back online.

**Weather.** A small temperature and air-quality glyph sits at the edge of
the idle screen, read from the unit's onboard sensor. This also feeds a
summary into your Log roughly every 15 minutes.

---

## Charging

Set the unit on its pad any time; it charges wirelessly through a window
in the underside designed for that purpose (the polished top face is not
the charging side). A full charge from empty takes a few hours; the unit
is designed to live on the pad continuously rather than run untethered for
long stretches — treat it like a desk object that's always docked, not a
device you carry around.

---

## Care

- Wipe the polished stainless face with a soft cloth; avoid abrasive
  cleaners, which will dull the finish.
- Keep the camera lens window clear of dust for reliable Copy-button
  photos.
- The unit is a desk object, not a rated water-resistant device in v1 —
  keep it away from spills.

---

## Troubleshooting

| Symptom | What to do |
|---|---|
| Blank screen on the pad | Check the pad is powered (USB-C into a wall adapter, not just a laptop port in sleep). |
| No pairing code appears | Hold Copy for 5 seconds to force pairing mode. |
| Copy press doesn't reach the Log | Check WiFi at the pairing location; presses queue locally and retry automatically once reconnected. |
| Notifications stop arriving | Re-check pairing under Settings → Devices; a revoked or expired device token will stop delivery silently by design (no false green light). |

---

## What this device is not

- It is not a general-purpose display — it shows one short line at a time.
- It does not run apps or a browser.
- It is not the LOT Quantum Cube (CUBIQ™), which moves; this device is
  stationary.
- It is not the COSMO® companion robot; it has no locomotion or voice.

---

*This manual describes a pre-production design (v0.1 hardware track,
2026-09-12). Specifications — dimensions, battery life, exact sensor part
numbers — may change before the 100-unit production run. See
docs/technical/LOT-COMPUTER-HARDWARE-SPEC.md for the current engineering
detail behind every claim in this manual.*

---

**LOT Systems Corporation** — Los Angeles, CA
Made in the USA · brand.lot-systems.com
