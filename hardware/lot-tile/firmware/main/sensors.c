#include "sensors.h"
#include "board.h"
// S2: BME688 via BSEC2 (ULP mode, 5-min cadence, state saved to RTC memory),
//     LTR-390UV UVS mode, MAX17048 SOC register 0x04, BHI260AP gesture firmware upload.
void sensors_init(void) {}
void sensors_read(lot_telemetry_t *o) {
    *o = (lot_telemetry_t){ .t = 0, .rh = 0, .p = 0, .iaq = 0, .uv = 0, .batt = 100, .rssi = 0 };
}
