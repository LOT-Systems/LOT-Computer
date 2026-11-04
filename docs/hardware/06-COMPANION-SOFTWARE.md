# lot-link — Companion Software Spec

Purpose: connect to firmware for flashing, pairing, diagnostics, on the bench and for users.

- **Form:** web app using Web Serial (Chrome) + `esptool-js`; optional Node CLI (`lot-link flash|pair|monitor|test`).
- **Flash:** pogo-pad or USB-C jig (the sealed device has no port; 6-pad pogo footprint on PCB bottom accessible before closing / via test jig).
- **Pair:** enter 6-digit code from lot-systems.com Profile → device receives token over serial/BLE.
- **Diagnostics:** live sensor values, battery, RSSI, button test, camera test frame, haptic test, factory-QA pass/fail export (CSV) for the 100-run.
- **Security:** token never displayed; serial commands signed in production.
- **Repo location (proposed):** `tools/lot-link/`.
