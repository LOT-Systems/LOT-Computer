# PDF Manuals Plan (item 7)

| Manual | Audience | Contents |
|---|---|---|
| Quick-Start Card (1 page) | Operator | Charge, pair, notifications, Copy button |
| User Manual | Operator | Setup, gestures, sensors, privacy/camera, care of stainless, safety |
| Service & Assembly Manual | Technician | Disassembly, screws, gasket, battery handling |
| Firmware Reference | Engineer | From FIRMWARE.md |
| API Reference | Developer | From CONNECTOR_API.md |
| Compliance Pack | Internal | FCC, UN38.3, RoHS |

**Pipeline:** Markdown (this dir) → HTML (brand CSS) → PDF; `libreoffice --headless --convert-to pdf` is available in the dev container; Pandoc/WeasyPrint are not. Output to `docs/hardware/pdf/` with version + date; one PDF set per release tag. Build script to be added in P6.
