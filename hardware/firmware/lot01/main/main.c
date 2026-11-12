/*
 * LOT SYSTEMS CORPORATION — LOT-01 firmware (ESP-IDF v5.x) — SKELETON rev A
 * Made in the USA | brand.lot-systems.com
 *
 * State machine and protocol flow only. Drivers are stubbed (lot_hw_*),
 * to be filled during P1 on the XIAO ESP32S3 Sense prototype.
 * Not compiled in this session (no ESP-IDF toolchain in the build container).
 * See docs/hardware/LOT-01-05-FIRMWARE.md
 */
#include <stdio.h>
#include <string.h>
#include "esp_sleep.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "lot01.h"

static const char *TAG = "lot01";

RTC_DATA_ATTR static uint32_t next_poll_s = LOT_DEFAULT_POLL_S;
RTC_DATA_ATTR static char inbox_cursor[40];
RTC_DATA_ATTR static char shown_id[40];      /* message on screen (for COPY) */
RTC_DATA_ATTR static char shown_text[LOT_MAX_MSG + 4];

static lot_wake_t wake_reason(void) {
    switch (esp_sleep_get_wakeup_cause()) {
    case ESP_SLEEP_WAKEUP_TIMER: return WAKE_POLL;
    case ESP_SLEEP_WAKEUP_EXT1: {
        uint64_t m = esp_sleep_get_ext1_wakeup_status();
        if (m & (1ULL << LOT_PIN_COPY)) return WAKE_COPY;
        if (m & (1ULL << LOT_PIN_IMU_INT)) return WAKE_LIFT;
        return WAKE_POLL;
    }
    default: return WAKE_BOOT;
    }
}

static void do_poll(void) {
    lot_msg_t msgs[5];
    int n = lot_api_inbox(inbox_cursor, msgs, 5, &next_poll_s, inbox_cursor);
    if (n <= 0) return;
    lot_msg_t *m = &msgs[n - 1];                   /* newest wins the screen */
    strlcpy(shown_id, m->id, sizeof shown_id);
    strlcpy(shown_text, m->text, sizeof shown_text);
    lot_hw_display_message(m->text);
    if (m->buzz) lot_hw_buzz(LOT_BUZZ_PAGER);       /* two short pulses */
    const char *ids[5]; for (int i = 0; i < n; i++) ids[i] = msgs[i].id;
    lot_api_ack(ids, n);
}

static void do_copy(bool long_press) {
    lot_readings_t r = {0};
    lot_hw_read_sensors(&r);
    char frame_id[40] = {0};
    if (long_press) {                                /* camera only on long press */
        lot_hw_display_status("CAM");
        lot_api_frame_capture_and_upload(frame_id, sizeof frame_id);
    }
    lot_hw_display_status("Copying.");
    bool ok = lot_api_copy(shown_id[0] ? shown_id : NULL, shown_text, frame_id[0] ? frame_id : NULL, &r);
    lot_hw_display_status(ok ? "Copied to Log." : "Saved. Will retry.");
    if (!ok) lot_queue_push_copy(shown_id, shown_text, frame_id, &r);   /* NVS retry queue */
    lot_hw_buzz(ok ? LOT_BUZZ_TICK : LOT_BUZZ_ERROR);
}

void app_main(void) {
    nvs_flash_init();
    lot_hw_init_minimal();                          /* I2C, LCD, button, motor */
    lot_wake_t why = wake_reason();
    ESP_LOGI(TAG, "wake=%d", why);

    if (!lot_cfg_is_paired()) {
        lot_provision_run();                        /* BLE provisioning: Wi-Fi + 6-digit pairing code */
        esp_restart();
    }

    if (why == WAKE_COPY) {
        bool long_press = lot_hw_button_held_ms(LOT_LONG_PRESS_MS);
        if (lot_net_up(LOT_NET_TIMEOUT_MS)) { lot_queue_flush(); do_copy(long_press); do_poll(); }
        else { lot_hw_display_status("No network. Saved."); /* queued in do_copy path on next wake */ }
    } else if (why == WAKE_LIFT) {
        lot_hw_display_clock_weather();             /* local only, no radio */
    } else {
        lot_readings_t r = {0};
        lot_hw_read_sensors(&r);
        if (lot_net_up(LOT_NET_TIMEOUT_MS)) {
            lot_queue_flush();
            do_poll();
            if (lot_should_send_telemetry()) lot_api_telemetry(&r);
            lot_ota_check_if_due();
        }
    }

    lot_net_down();
    lot_hw_prepare_sleep();                         /* LCD keeps image (memory-in-pixel) */
    esp_sleep_enable_timer_wakeup((uint64_t)next_poll_s * 1000000ULL);
    esp_sleep_enable_ext1_wakeup((1ULL << LOT_PIN_COPY) | (1ULL << LOT_PIN_IMU_INT), ESP_EXT1_WAKEUP_ANY_LOW);
    esp_deep_sleep_start();
}
