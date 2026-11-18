// LOT TILE P1: main state machine. See docs/05-FIRMWARE.md §3.
#include <time.h>
#include <string.h>
#include "esp_sleep.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "driver/gpio.h"
#include "driver/rtc_io.h"
#include "board.h"
#include "lot_api.h"
#include "ui.h"
#include "sensors.h"

static const char *TAG = "lot_tile";

// Survives deep sleep: COPY events are never lost before the server acks them.
RTC_DATA_ATTR static lot_event_t  r_ring[LOT_EVT_RING];
RTC_DATA_ATTR static int          r_count;
RTC_DATA_ATTR static uint32_t     r_seq;
RTC_DATA_ATTR static lot_notification_t r_current;
RTC_DATA_ATTR static int          r_backoff;

static void queue_event(lot_evt_type_t type) {
    if (r_count == LOT_EVT_RING) {               // drop oldest, keep newest
        memmove(r_ring, r_ring + 1, sizeof(lot_event_t) * (LOT_EVT_RING - 1));
        r_count--;
    }
    lot_event_t *e = &r_ring[r_count++];
    e->seq = ++r_seq;
    e->type = type;
    strlcpy(e->notification_id, r_current.id, sizeof e->notification_id);
    e->ts = time(NULL);
}

static void drop_acked(uint32_t acked) {
    int k = 0;
    for (int i = 0; i < r_count; i++) if (r_ring[i].seq > acked) r_ring[k++] = r_ring[i];
    r_count = k;
}

static int classify_press(void) {
    // Short (<600 ms) = COPY, double (2nd within 350 ms) = DISMISS, 2 s = SNAP, 10 s = RESET.
    // S2: implement with esp_timer + GPIO polling while awake.
    return LOT_EVT_COPY;
}

static void go_to_sleep(time_t next_wake_at) {
    time_t now = time(NULL);
    int64_t secs = next_wake_at > now ? (next_wake_at - now) : 60;
    if (secs > CONFIG_LOT_MAX_SLEEP_S) secs = CONFIG_LOT_MAX_SLEEP_S;
    esp_sleep_enable_timer_wakeup((uint64_t)secs * 1000000ULL);
    esp_sleep_enable_ext0_wakeup(PIN_BTN_COPY, 0);
    rtc_gpio_pullup_en(PIN_BTN_COPY);
    ESP_LOGI(TAG, "sleep %llds, pending=%d", secs, r_count);
    esp_deep_sleep_start();
}

void app_main(void) {
    nvs_flash_init();
    ui_init();
    sensors_init();

    esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
    if (cause == ESP_SLEEP_WAKEUP_EXT0) {
        int ev = classify_press();
        if (ev == LOT_EVT_COPY && r_current.id[0]) { queue_event(LOT_EVT_COPY); ui_show_copied(); }
        else if (ev == LOT_EVT_DISMISS)             { queue_event(LOT_EVT_DISMISS); }
    }

    if (!lot_api_has_token()) {
        char code[7] = {0};
        if (lot_api_pair_start(code)) ui_show_pair_code(code);
        go_to_sleep(time(NULL) + 5);
    }

    // S2: wifi_connect() with stored credentials, 4 s timeout.
    lot_telemetry_t tm;
    sensors_read(&tm);
    lot_sync_result_t res;
    uint32_t acked = 0;
    if (lot_api_sync(r_ring, r_count, &tm, &res, &acked)) {
        drop_acked(acked);
        r_backoff = 0;
        if (res.has_new && strcmp(res.latest.id, r_current.id) != 0) {
            r_current = res.latest;
            ui_show_notification(r_current.text, "--:--", tm.batt);
            // haptic_play(PAGER_SOFT);
        } else if (cause == ESP_SLEEP_WAKEUP_EXT0 && r_current.id[0]) {
            ui_show_notification(r_current.text, "--:--", tm.batt); // restore after "COPIED"
        }
        go_to_sleep(res.next_wake_at);
    } else {
        int wait = 60 << (r_backoff < 6 ? r_backoff++ : 6);  // 1 min … ~1 h
        go_to_sleep(time(NULL) + wait);
    }
}
