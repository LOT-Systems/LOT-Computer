#pragma once
void ui_init(void);
void ui_show_notification(const char *text, const char *time_hhmm, int batt_pct);
void ui_show_copied(void);
void ui_show_pair_code(const char *code);
void ui_show_weather(float t, float rh, float uv, float iaq, float p);
