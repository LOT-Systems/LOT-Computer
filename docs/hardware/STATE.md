# LOT-P1 STATE (compressed — update every session)

**Last session:** 2026-10-03 · S1 · PLAN
**Goal:** 40×40×(5→7) mm 316L pager, ESP32-S3, screen+camera+Copy button, Qi, BME688/BMI270/VEML7700, talks to lot-systems.com via `/api/device/*`; 100-unit PCBWay run.
**Budget est.:** ≈$22k / 100 units (≈$220/unit), range $17–30k.
**Decisions pending (S-2):** G2 height (5 vs 6.5–7 mm) · charging side (glass-front coil recommended) · camera privacy · final-assembly country.
**Facts:** steel blocks RF/Qi → glass-side antenna/coil; 5 mm stack unrealistic for v1; links in BOM unverified (egress blocked); brand/about/CQGS pages unreachable.
**Done:** doc set (README, BOM, MANUFACTURING, CONNECTOR_API, FIRMWARE, MANUALS), session report.
**Next (S2):** S-2 decisions → stack-up drawing → backend `/api/device/*` + `device_copy` log event on staging → breadboard prototype order.
**OPEN:** read brand.lot-systems.com / about / cqgs when network allows; generate PDFs; verify links; confirm "Pager" naming vs COSMO® naming.
