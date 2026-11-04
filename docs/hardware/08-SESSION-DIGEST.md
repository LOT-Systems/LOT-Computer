# Session Digest (compressed; overwrite each session)

**Last session:** 2026-11-04 · S1 · Plan.
**State:** Doc set written (00–08), BOM v0.1, roadmap P0–P7. No code, no server changes.
**Key facts:** ESP32-S3 + BME688 + LSM6DSOX + OV2640 + 1.14" IPS + Qi + 70 mAh LiPo; 316L two-shell; PEEK seam = antenna slot; charge front-down.
**Key risks:** steel vs RF/Qi; 5 mm infeasible (9→7→5 staged); vendor links/prices unverified; brand/CQGS sites unreachable.
**Blocking Qs:** accept 9 mm v0? camera privacy? what COPY copies? device↔account model? budget?
**Next (S2):** build `/api/device/*` + `device_*` log events + Profile pairing UI behind a feature flag; add tests; verify BOM links when network allows.
