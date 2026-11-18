#pragma once
#include <stdbool.h>
#include <stdint.h>
#include <time.h>

#define LOT_NOTIF_MAX_TEXT 96
#define LOT_EVT_RING       16

typedef struct {
    char id[24];
    char text[LOT_NOTIF_MAX_TEXT + 1];
    char kind[12];
} lot_notification_t;

typedef enum { LOT_EVT_COPY = 1, LOT_EVT_DISMISS = 2, LOT_EVT_SNAP = 3 } lot_evt_type_t;

typedef struct {
    uint32_t seq;
    lot_evt_type_t type;
    char notification_id[24];
    time_t ts;
} lot_event_t;

typedef struct {
    float t, rh, p, iaq, uv;
    int batt, rssi;
} lot_telemetry_t;

typedef struct {
    lot_notification_t latest;
    bool has_new;
    time_t next_wake_at;
    bool live_mode;
    bool camera_enabled;
} lot_sync_result_t;

bool lot_api_has_token(void);
// One batched request per wake: pending events + telemetry go up, notifications come down.
bool lot_api_sync(const lot_event_t *events, int n_events, const lot_telemetry_t *tm,
                  lot_sync_result_t *out, uint32_t *acked_seq);
bool lot_api_pair_start(char code_out[7]);
bool lot_api_pair_poll(void); // stores token in encrypted NVS when claimed
