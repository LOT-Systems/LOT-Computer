# 07 — PDF manuals

Set: **User Quick Start** (1 p), **User Manual**, **Service & Disassembly**, **Firmware
Reference** (from 04), **API Reference** (from 03), **Factory Test SOP**.
Pipeline: Markdown in `docs/hardware/manuals/*.md` → `pandoc --pdf-engine=xelatex` (or
the repo's existing PDF tooling in `scripts/`) → `docs/hardware/pdf/`. Branding per
brand.lot-systems.com (not accessible this session — apply colours/fonts when fetched).
Not generated this session: manuals depend on decisions R1/R2 in 01.
