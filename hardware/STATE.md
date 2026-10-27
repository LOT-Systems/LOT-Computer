# LOT HARDWARE — COMPRESSED STATE (read this first each session)

Updated: 2026-10-27 · Session HW-01 · Owner: Vadik (Inventor, COSMO® CIA)

## Product
**LOT Pager** — 40×40 mm stainless square. Front: screen + camera + 1 button ("Copy"). Back: polished stainless mirror. Receives AI notifications from lot-systems.com ("Coffee time!"), sends button press back to the site's **Log** tab. Wireless charging. Weather + AI-grade sensors.

## Decisions locked (HW-01)
- MCU: ESP32-S3 (Wi-Fi/BLE, camera DVP, vector AI instructions, native USB)
- Transport: HTTPS poll + WebSocket (MQTT optional later); device auth by per-unit token
- New log event type: `device_copy` (must be added to `displayableEvents` in `src/server/routes/api.ts`)
- Fab: PCBWay (PCB + SMT assembly + CNC stainless + polish); 100-unit run after EVT/DVT
- Docs split into separate files in `hardware/` (see README); PDFs built into `hardware/pdf/`

## Top risks (open)
1. **5 mm thickness is not achievable with camera + screen + battery.** EVT target 7.5 mm; 5 mm = stretch (see 03).
2. **Stainless steel blocks Qi charging and Wi-Fi/BLE.** Needs dielectric windows (ceramic/glass/PEEK). Must prototype before tooling 100 units.
3. Camera privacy (LED + firmware gate) and FCC/CE/UN38.3 compliance before shipping.
4. brand/about/CQGS sites were unreachable from the sandbox (proxy 403) — brand tokens NOT yet applied.

## Next session (HW-02) backlog
- [ ] Read brand.lot-systems.com tokens (colors/fonts) → splash screen + manuals styling
- [ ] Implement `/api/device/*` endpoints + `device_copy` log event (spec: 05)
- [ ] Order EVT parts (02, tier A) ; quote PCBWay CNC + Qi window options
- [ ] KiCad schematic skeleton; firmware repo skeleton (PlatformIO / ESP-IDF)
- [ ] Verify all vendor links & live prices
