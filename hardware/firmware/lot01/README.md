# LOT-01 firmware (skeleton rev A)

ESP-IDF v5.x project for the LOT-01 pager. State machine and protocol flow are
in `main/main.c`; drivers are stubbed. Full design: `docs/hardware/LOT-01-05-FIRMWARE.md`.

    idf.py set-target esp32s3 && idf.py build flash monitor

Not compiled yet: the session that wrote it had no ESP-IDF toolchain.
