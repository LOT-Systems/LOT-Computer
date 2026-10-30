# 06 — PDF Manuals & Session Compression

## 1. Manual set (separate PDFs)
1. Quick Start (1 page) · 2. User Manual · 3. Pairing & Site Setup · 4. Safety & Regulatory · 5. Firmware Developer Guide · 6. Factory Test & QC Procedure · 7. Service/Repair Guide.
Sources are Markdown in `docs/hardware/manuals/`; build to PDF with pandoc/Chromium in CI; version stamped with firmware + hardware rev.

## 2. Brand
Apply brand.lot-systems.com guidance (colours, type) — not yet read (site unreachable from this session).

## 3. Compression rule (point 8)
Each session report ends with a **≤10-line digest** (decisions, open items, next step). A running `docs/hardware/STATE.md` holds the latest digest only; older detail stays in `sessions/`.

## 4. Per-session report (point "push full MD report")
Path: `docs/hardware/sessions/LOT-HW-SR-YYYYMMDD-NN.md`, committed and pushed to the session branch.
