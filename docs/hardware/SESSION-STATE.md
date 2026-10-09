# SESSION-STATE (compressed, read this first next session)
- Goal: LOT Computer — 40mm steel pager, ESP32-S3, WiFi to lot-systems.com, "Copy" button -> Log tab, Qi charge, 100 units via PCBWay.
- Done S01 (2026-10-09): plan, 19-req traceability, BOM v0.1 (~$96/unit est.), API + firmware specs, PDFs.
- Decisions pending Vadik: v1 thickness 8-10mm vs 5mm; screen-down Qi; RF window material.
- Blockers: sandbox cannot reach lot-systems.com/brand/institute sites or vendors -> no brand read, no real quotes.
- Server gaps: no device auth; `device_copy` not in `displayableEvents` (api.ts:1082).
- Next: quotes, implement /api/device/* behind flag, KiCad skeleton.
