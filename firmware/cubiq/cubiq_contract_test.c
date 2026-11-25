/*
 * CUBIQ(tm) — host test driver for the C firmware reference (R11 F84).
 *
 *   cubiq_contract_test vectors <v05|v06> <vectors.json>   run a vector file, exit 0 iff all pass
 *   cubiq_contract_test cases   <v05|v06>                  JSON lines on stdin, one
 *                                                          {"signal":…,"state":…} per line;
 *                                                          prints ["event","gesture",reason|null]
 *
 * Host-only: uses stdio. The decoder and decide() themselves use neither stdio nor malloc.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "cubiq_contract.h"

#define NODES 200000
#define POOL (8 * 1024 * 1024)

static cj_node g_nodes[NODES];
static char g_pool[POOL];

static void print_json_str(const char *s) {
    if (!s) { fputs("null", stdout); return; }
    printf("\"%s\"", s); /* reasons are static identifiers: no escaping needed */
}

static int str_is(const cj_arena *a, int32_t idx, const char *s) {
    if (s == NULL) { const cj_node *n = cj_at(a, idx); return n && n->type == CJ_NULL; }
    return cj_str_eq(a, idx, s);
}

static char *slurp(const char *path, size_t *len) {
    FILE *f = fopen(path, "rb");
    if (!f) return NULL;
    fseek(f, 0, SEEK_END);
    long n = ftell(f);
    fseek(f, 0, SEEK_SET);
    char *buf = malloc((size_t)n + 1);
    if (!buf || fread(buf, 1, (size_t)n, f) != (size_t)n) { fclose(f); free(buf); return NULL; }
    fclose(f);
    *len = (size_t)n;
    return buf;
}

int main(int argc, char **argv) {
    if (argc < 3) {
        fprintf(stderr, "usage: %s vectors <v05|v06> FILE | cases <v05|v06>\n", argv[0]);
        return 2;
    }
    cubiq_version ver = strcmp(argv[2], "v06") == 0 ? CUBIQ_V06_DRAFT : CUBIQ_V05;
    cj_arena a = {g_nodes, NODES, 0, g_pool, POOL, 0, NULL};

    if (strcmp(argv[1], "vectors") == 0 && argc >= 4) {
        size_t len;
        char *text = slurp(argv[3], &len);
        if (!text) { fprintf(stderr, "cannot read %s\n", argv[3]); return 2; }
        int32_t root = cj_parse(&a, text, len);
        if (root < 0) { fprintf(stderr, "parse error: %s\n", a.err); return 2; }
        int32_t vs = cj_get(&a, root, "vectors");
        int total = 0, pass = 0;
        for (int32_t i = cj_at(&a, vs)->child; i >= 0; i = a.nodes[i].next) {
            int32_t exp = cj_get(&a, i, "expect");
            cubiq_decision d = cubiq_decide(ver, &a, cj_get(&a, i, "signal"), cj_get(&a, i, "state"));
            int ok = str_is(&a, cj_get(&a, exp, "event"), cubiq_event_name(d.event)) &&
                     str_is(&a, cj_get(&a, exp, "performed"), cubiq_gesture_name(d.gesture)) &&
                     str_is(&a, cj_get(&a, exp, "downgrade_reason"), d.reason);
            total++;
            pass += ok;
            if (!ok) {
                int32_t nm = cj_get(&a, i, "name");
                printf("  FAIL  %.*s  got %s %s %s\n", cj_at(&a, nm)->u.s.len, a.pool + cj_at(&a, nm)->u.s.off,
                       cubiq_event_name(d.event), cubiq_gesture_name(d.gesture), d.reason ? d.reason : "null");
            }
        }
        printf("  C %s: %d/%d vectors pass (%s)\n", ver == CUBIQ_V06_DRAFT ? "v0.6-draft" : "v0.5", pass, total,
               argv[3]);
        free(text);
        return pass == total ? 0 : 1;
    }

    if (strcmp(argv[1], "cases") == 0) {
        static char line[1 << 16];
        while (fgets(line, sizeof line, stdin)) {
            size_t n = strlen(line);
            int32_t root = cj_parse(&a, line, n);
            if (root < 0) { printf("[\"decode_error\",\"none\",\"%s\"]\n", a.err); continue; }
            cubiq_decision d = cubiq_decide(ver, &a, cj_get(&a, root, "signal"), cj_get(&a, root, "state"));
            printf("[\"%s\",\"%s\",", cubiq_event_name(d.event), cubiq_gesture_name(d.gesture));
            print_json_str(d.reason);
            puts("]");
        }
        return 0;
    }
    fprintf(stderr, "unknown mode\n");
    return 2;
}
