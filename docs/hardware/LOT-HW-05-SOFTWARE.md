# LOT-HW-05 — Companion Software (flash + pair + factory) v0.2
Web tool under lot-systems.com (Web Serial + esptool-js), Chromium only.

## Screens
1. Connect (pogo/USB-C) → detect chip, read MAC.
2. Flash signed firmware (version picker, hash shown).
3. Provision: Wi-Fi SSID/pass → NVS.
4. Pair: device shows 6-digit code → user enters on site Settings → token minted (LOT-HW-03).
5. Self-test: screen, button (press prompt), BME688, BMI270, light, haptic, charge, camera (shutter LED).
6. Report: PASS/FAIL JSON.

## Factory mode (100-unit run)
Scan serial label → assign `device_id` (LOT-P1-0001…0100) → flash → self-test → append row to `qa_log.csv` (id, mac, fw, tests, battery mV, tester, ts). Units with any FAIL go to a quarantine bin. Export CSV to the session report.

## Dev simulator (planned S3)
Node script posting `copy`/`sensor` events to `/api/device/event` with a dev token, to test the Log tab before hardware exists.
