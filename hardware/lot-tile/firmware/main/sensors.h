#pragma once
#include "lot_api.h"
void sensors_init(void);
// Fills telemetry. BME688 values come from Bosch BSEC2 (IAQ, accuracy); requires the BSEC2 blob (licensed, S2 task).
void sensors_read(lot_telemetry_t *out);
