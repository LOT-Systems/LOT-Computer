# LOT-HW rolling digest (overwritten each session)
- S1 2026-11-06: plan, BOM (hardware/BOM.csv), roadmap in docs/LOT-SR-20261106-01.md.
- Key risks: Qi cannot pass steel (use ceramic/PEEK inlay), antenna window, 5mm height (fallback 7mm).
- Existing API: GET /api/live-message, GET /api/weather, POST /api/logs. Missing: device token auth, /api/device/*.
- Brand sites unreachable from cloud session; allow domains.
- Est: ~$75/unit, ~$8-10k run + ~$12-20k NRE/cert. Unverified.
- Next: S2 API connector + pairing, brand import, STEP stack-up.
