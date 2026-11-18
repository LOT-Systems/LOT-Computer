idf_component_register(
  SRCS "main.c" "lot_api.c" "ui.c" "sensors.c"
  INCLUDE_DIRS "."
  REQUIRES esp_http_client esp-tls nvs_flash esp_wifi esp_event driver esp_timer json
)
