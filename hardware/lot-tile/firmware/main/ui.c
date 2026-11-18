// Sharp LS013B7DH03 memory-LCD driver + screens. Framebuffer is 1-bit, 128x128 = 2 KB.
// Memory LCD keeps its image during deep sleep (EXTCOMIN toggled by the ULP/RTC timer).
#include <string.h>
#include "ui.h"
#include "board.h"
#include "driver/spi_master.h"

static uint8_t fb[LCD_H][LCD_W / 8];
static spi_device_handle_t s_lcd;

static void lcd_flush(void) {
    // Sharp write: [0x01 mode][line addr][16 bytes][0x00] ... [0x00 0x00]; line addr is LSB-first.
    static uint8_t buf[2 + LCD_H * (LCD_W / 8 + 2)];
    size_t k = 0;
    buf[k++] = 0x01;
    for (int y = 0; y < LCD_H; y++) {
        uint8_t a = y + 1, r = 0;
        for (int b = 0; b < 8; b++) r |= ((a >> b) & 1) << (7 - b);
        buf[k++] = r;
        memcpy(&buf[k], fb[y], LCD_W / 8); k += LCD_W / 8;
        buf[k++] = 0x00;
    }
    buf[k++] = 0x00;
    spi_transaction_t t = { .length = k * 8, .tx_buffer = buf };
    spi_device_transmit(s_lcd, &t);
}

void ui_init(void) {
    spi_bus_config_t bus = { .sclk_io_num = PIN_LCD_SCLK, .mosi_io_num = PIN_LCD_MOSI,
                             .miso_io_num = -1, .quadwp_io_num = -1, .quadhd_io_num = -1 };
    spi_bus_initialize(SPI2_HOST, &bus, SPI_DMA_CH_AUTO);
    spi_device_interface_config_t dev = { .clock_speed_hz = 1000000, .mode = 0,
        .spics_io_num = PIN_LCD_CS, .flags = SPI_DEVICE_POSITIVE_CS | SPI_DEVICE_BIT_LSBFIRST,
        .queue_size = 1 };
    spi_bus_add_device(SPI2_HOST, &dev, &s_lcd);
}

// Text rendering uses an 8x12 LOT bitmap font (font.h, S2 task). Placeholder clears fb.
static void draw_text(int x, int y, const char *s) { (void)x; (void)y; (void)s; }

void ui_show_notification(const char *text, const char *hhmm, int batt) {
    memset(fb, 0xFF, sizeof fb);            // white
    draw_text(4, 4, "LOT");
    draw_text(8, 52, text);                 // word-wrapped, max 4 lines
    draw_text(4, 112, hhmm);
    draw_text(72, 112, "\xE2\xA7\x89 COPY");
    (void)batt;
    lcd_flush();
}
void ui_show_copied(void)               { memset(fb, 0xFF, sizeof fb); draw_text(28, 58, "COPIED"); lcd_flush(); }
void ui_show_pair_code(const char *c)   { memset(fb, 0xFF, sizeof fb); draw_text(28, 58, c); lcd_flush(); }
void ui_show_weather(float t, float rh, float uv, float iaq, float p) {
    (void)t; (void)rh; (void)uv; (void)iaq; (void)p;
    memset(fb, 0xFF, sizeof fb); lcd_flush();
}
