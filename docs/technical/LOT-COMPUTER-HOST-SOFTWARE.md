# LOT COMPUTER — Host Software (`lotctl`)

```
DOCUMENT   LOT-COMPUTER / 05 HOST SOFTWARE   REV A   2026-10-11
S-2        VADIK MARMELADOV
STATUS     SPEC — not written
```

## Purpose
One cross-platform command line tool (Node/TypeScript, matches the repo, or
Python) to connect a computer to the firmware.

## Commands
| Command | Does |
|---|---|
| `lotctl flash <fw.bin>` | flash via `esptool` over USB |
| `lotctl provision --wifi SSID --pair CODE` | writes Wi-Fi + pairing code, device exchanges for token |
| `lotctl monitor` | serial console, secrets redacted |
| `lotctl ota <fw.bin>` | push signed image |
| `lotctl test` | end-of-line test: sensors, display, button, Qi, camera LED |
| `lotctl label` | prints serial / QR for the 100-unit run |
| `lotctl export-log` | dumps offline queue |

## Factory flow (100 units)
flash → EOL test → provision serial → record result CSV → label → pack.
Test results kept per serial so a return maps to a build.

## Notes
Depends on firmware serial protocol (JSON lines) defined at M1. Signing keys
are held off-device and never committed.
