/* LOT-01 firmware — shared definitions (skeleton rev A) */
#pragma once
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

#define LOT_FW_VERSION       "0.1.0"
#define LOT_API_BASE         "https://lot-systems.com/api/device"
#define LOT_DEFAULT_POLL_S   300
#define LOT_MAX_MSG          64
#define LOT_LONG_PRESS_MS    800
#define LOT_NET_TIMEOUT_MS   6000

/* Pin map rev A (HW-04 §2) */
#define LOT_PIN_COPY         14
#define LOT_PIN_IMU_INT      21
#define LOT_PIN_I2C_SDA      1
#define LOT_PIN_I2C_SCL      2
#define LOT_PIN_LCD_SCLK     36
#define LOT_PIN_LCD_MOSI     35
#define LOT_PIN_LCD_CS       34
#define LOT_PIN_LCD_EXTCOM   33
#define LOT_PIN_LCD_DISP     37
#define LOT_PIN_MOTOR        40
#define LOT_PIN_CHG          41
#define LOT_PIN_GAUGE_ALRT   42
#define LOT_PIN_CAM_PWDN     39

typedef enum { WAKE_BOOT, WAKE_POLL, WAKE_COPY, WAKE_LIFT } lot_wake_t;
typedef enum { LOT_BUZZ_PAGER, LOT_BUZZ_TICK, LOT_BUZZ_ERROR } lot_buzz_t;

typedef struct { char id[40]; char text[LOT_MAX_MSG + 4]; char kind[16]; bool buzz; } lot_msg_t;
typedef struct { float t_c, rh, p_hpa, iaq; char gas_class[24]; uint8_t battery_pct; int8_t rssi; } lot_readings_t;

/* hardware (lot_hw.c) */
void lot_hw_init_minimal(void);
void lot_hw_display_message(const char *text);
void lot_hw_display_status(const char *text);
void lot_hw_display_clock_weather(void);
void lot_hw_buzz(lot_buzz_t pattern);
bool lot_hw_button_held_ms(int ms);
void lot_hw_read_sensors(lot_readings_t *out);
void lot_hw_prepare_sleep(void);

/* network + API (lot_api.c) — HTTPS, Bearer token from NVS, TLS session resumption */
bool lot_net_up(int timeout_ms);
void lot_net_down(void);
int  lot_api_inbox(const char *since, lot_msg_t *out, int max, uint32_t *next_poll_s, char *cursor_out);
bool lot_api_ack(const char **ids, int n);
bool lot_api_copy(const char *message_id, const char *text, const char *frame_id, const lot_readings_t *r);
bool lot_api_telemetry(const lot_readings_t *r);
bool lot_api_frame_capture_and_upload(char *frame_id_out, size_t len);

/* config, provisioning, offline queue, OTA */
bool lot_cfg_is_paired(void);
void lot_provision_run(void);
void lot_queue_push_copy(const char *id, const char *text, const char *frame_id, const lot_readings_t *r);
void lot_queue_flush(void);
bool lot_should_send_telemetry(void);
void lot_ota_check_if_due(void);
