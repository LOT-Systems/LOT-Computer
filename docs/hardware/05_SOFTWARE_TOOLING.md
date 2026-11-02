# 05 — Software to connect with firmware

Host tool `lotpager` (Node/TS to fit the existing repo, or Python + esptool):

- `lotpager flash <image>` — wraps esptool/`@espressif` flasher.
- `lotpager provision --wifi SSID --code ABCD-1234` — sends Wi-Fi + one-time claim code
  over USB CDC (JSON lines, 115200 8N1 framing, CRC16); firmware calls `/register`.
- `lotpager test` — runs factory self-test (04), writes pass/fail + serial to CSV.
- `lotpager label` — prints device ID/QR for the box.
- Web option: Web Serial page on lot-systems.com for end-user Wi-Fi setup (Chrome).

Serial protocol: `{"cmd":"set_wifi","ssid":"..","psk":".."}` → `{"ok":true}`; commands:
`info`, `set_wifi`, `claim`, `selftest`, `factory_reset`, `reboot`.
Suggested repo location: `scripts/lotpager/` (not created this session).
