# LOT PAGER — Session Digest (rolling, compressed)

Rule: after every session, rewrite this file to ≤ 40 lines. Keep decisions, open questions, next step. Drop narrative.

## State @ 2026-10-25 (session 01)
- Phase: **0 — spec freeze**. No hardware ordered. No server code written yet.
- Decisions (proposed, awaiting Vadik OK): MCU ESP32-S3-MINI-1-N4R2 · OV2640 camera · 1.3" 240×240 IPS · BME688 env sensor · BMI270 IMU · STWLC38 Qi RX + BQ25185 charger · LRA haptic · 316L two-part steel, glass insert on back for Qi/RF · ESP-IDF + LVGL firmware.
- Reality check: **5 mm total height is not achievable** with camera + screen + battery + Qi coil. EVT target 8–9 mm; 5 mm only as a no-camera/no-Qi variant or after custom flex/CSP parts.
- Reality check: **solid stainless blocks Wi-Fi and Qi** → needs non-metal window(s).
- Repo facts: `POST /api/logs {text,event,metadata}` exists (session-auth only); Log tab filters by an `displayableEvents` allowlist in `src/server/routes/api.ts` (`/logs` GET) → new events `device_copy`, `device_notification` must be added there. No device-token auth exists yet. `docs/corporate/LOT-TERMINAL-M2M.md` + `LOT-TERMINAL-SYNC.md` already define M2M JSON formats and `wss://sync.lot-systems.com/m2m/intake`.
- Unverified: all prices are estimates; brand.lot-systems.com / institute.lot-systems.com were unreachable from the sandbox (DNS), so brand colours/CQGS were not read.

## Open questions for Vadik
1. Accept 8–9 mm EVT thickness (vs 5 mm no-camera variant)?
2. Which side charges on the pad — polished back (glass insert) or screen face?
3. Regulatory: US-only first? (FCC/UN38.3 budget ≈ $8–12k est.)
4. Brand assets: paste hex colours/fonts from brand.lot-systems.com for the UI.

## Next session
Implement server side: device pairing token, `/api/device/*` routes, `device_*` log events (+tests); draft KiCad project skeleton; send BOM to PCBWay for a real quote.
