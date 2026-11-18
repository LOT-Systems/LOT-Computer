// LOT API connector: device side. Spec: docs/06-LOT-API-CONNECTOR.md
// Reference skeleton. Uses JSON for readability; CBOR encoder is an S2 task.
#include <string.h>
#include <stdio.h>
#include "lot_api.h"
#include "esp_http_client.h"
#include "esp_crt_bundle.h"
#include "nvs.h"
#include "cJSON.h"
#include "esp_log.h"

static const char *TAG = "lot_api";
static char s_token[72];

static bool load_token(void) {
    nvs_handle_t h;
    if (nvs_open("lot", NVS_READONLY, &h) != ESP_OK) return false;
    size_t len = sizeof(s_token);
    esp_err_t err = nvs_get_str(h, "token", s_token, &len);
    nvs_close(h);
    return err == ESP_OK;
}

bool lot_api_has_token(void) { return s_token[0] || load_token(); }

static char *http_post_json(const char *path, const char *body, int *status) {
    char url[160];
    snprintf(url, sizeof url, "%s%s", CONFIG_LOT_API_HOST, path);
    esp_http_client_config_t cfg = {
        .url = url, .method = HTTP_METHOD_POST, .timeout_ms = 8000,
        .crt_bundle_attach = esp_crt_bundle_attach, .keep_alive_enable = true,
    };
    esp_http_client_handle_t c = esp_http_client_init(&cfg);
    char auth[96];
    snprintf(auth, sizeof auth, "Bearer %s", s_token);
    esp_http_client_set_header(c, "Authorization", auth);
    esp_http_client_set_header(c, "Content-Type", "application/json");
    char *resp = NULL;
    if (esp_http_client_open(c, strlen(body)) == ESP_OK) {
        esp_http_client_write(c, body, strlen(body));
        int len = esp_http_client_fetch_headers(c);
        *status = esp_http_client_get_status_code(c);
        if (len <= 0 || len > 8192) len = 4096;
        resp = calloc(1, len + 1);
        esp_http_client_read_response(c, resp, len);
    }
    esp_http_client_cleanup(c);
    return resp;
}

bool lot_api_sync(const lot_event_t *ev, int n, const lot_telemetry_t *tm,
                  lot_sync_result_t *out, uint32_t *acked_seq) {
    cJSON *root = cJSON_CreateObject();
    cJSON *events = cJSON_AddArrayToObject(root, "events");
    for (int i = 0; i < n; i++) {
        cJSON *e = cJSON_CreateObject();
        cJSON_AddStringToObject(e, "type", ev[i].type == LOT_EVT_COPY ? "copy"
                                         : ev[i].type == LOT_EVT_SNAP ? "snap" : "dismiss");
        cJSON_AddStringToObject(e, "notification_id", ev[i].notification_id);
        cJSON_AddNumberToObject(e, "seq", ev[i].seq);
        cJSON_AddNumberToObject(e, "ts", (double)ev[i].ts);
        cJSON_AddItemToArray(events, e);
    }
    if (tm) {
        cJSON *t = cJSON_AddObjectToObject(root, "telemetry");
        cJSON_AddNumberToObject(t, "t", tm->t);
        cJSON_AddNumberToObject(t, "rh", tm->rh);
        cJSON_AddNumberToObject(t, "p", tm->p);
        cJSON_AddNumberToObject(t, "iaq", tm->iaq);
        cJSON_AddNumberToObject(t, "uv", tm->uv);
        cJSON_AddNumberToObject(t, "batt", tm->batt);
        cJSON_AddNumberToObject(t, "rssi", tm->rssi);
    }
    char *body = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    int status = 0;
    char *resp = http_post_json("/sync", body, &status);
    free(body);
    if (!resp || status != 200) { ESP_LOGW(TAG, "sync failed %d", status); free(resp); return false; }

    cJSON *r = cJSON_Parse(resp);
    free(resp);
    if (!r) return false;
    memset(out, 0, sizeof *out);
    cJSON *acked = cJSON_GetObjectItem(r, "acked_seq");
    if (cJSON_IsNumber(acked)) *acked_seq = (uint32_t)acked->valuedouble;
    cJSON *nw = cJSON_GetObjectItem(r, "next_wake_epoch");
    if (cJSON_IsNumber(nw)) out->next_wake_at = (time_t)nw->valuedouble;
    cJSON *list = cJSON_GetObjectItem(r, "notifications");
    int count = cJSON_GetArraySize(list);
    if (count > 0) {
        cJSON *last = cJSON_GetArrayItem(list, count - 1);
        strlcpy(out->latest.id, cJSON_GetStringValue(cJSON_GetObjectItem(last, "id")), sizeof out->latest.id);
        strlcpy(out->latest.text, cJSON_GetStringValue(cJSON_GetObjectItem(last, "text")), sizeof out->latest.text);
        out->has_new = true;
    }
    cJSON *cfg = cJSON_GetObjectItem(r, "cfg");
    out->live_mode = cJSON_IsTrue(cJSON_GetObjectItem(cfg, "live"));
    out->camera_enabled = cJSON_IsTrue(cJSON_GetObjectItem(cfg, "camera"));
    cJSON_Delete(r);
    return true;
}

// Pairing (pair/start, pair/poll) is an S2 task: HMAC(serial, factory_secret) request signing.
bool lot_api_pair_start(char code_out[7]) { (void)code_out; return false; }
bool lot_api_pair_poll(void) { return false; }
