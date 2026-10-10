# SESSION-STATE (compressed, read this first next session)
- Goal: LOT Computer — 40mm 2-part 316L steel pager, ESP32-S3, WiFi to lot-systems.com, "Copy" button -> Log tab, Qi charge, camera, BME688 etc., 100 units via PCBWay.
- S01 (10-09): plan, 19-req traceability, BOM v0.1, API + firmware specs, PDFs (branch mctw4d).
- S02 (10-10): HW-DESIGN-v0.2 (pin map, power, 8.5mm stack-up, RF test plan), BOM v0.2 (~$166/unit incl NRE), battery-life correction, report LOT-HW-20261010-02. Branch ynnx5q (on top of mctw4d).
- WARNING: 5+ parallel "session 01" branches exist (wkex12,u8336a,jnosg2,a3wjjz,mctw4d) because runs start from master. Merge mctw4d+ynnx5q to master.
- Pending Vadik: ~9mm v1; screen-down Qi; camera in v1?; 2nd button?
- Blockers: no network to site/vendors -> no brand read, no quotes.
- Server gaps: no device auth; `device_copy` not in displayableEvents (api.ts:1082).
- Next: /api/device/* behind flag + tests, KiCad skeleton, quotes.
