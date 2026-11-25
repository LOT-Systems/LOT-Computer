/* CUBIQ(tm) — signal contract decide(), firmware reference. See cubiq_contract.h. */
#include "cubiq_contract.h"

#include <string.h>

static const char *const GESTURE_NAME[] = {"none", "settle", "nudge", "hop", "leap", "jump"};
static const char *const EVENT_NAME[] = {"performed", "rejected", "expired", "held",
                                         "safe_hold", "deferred", "fault"};

const char *cubiq_event_name(cubiq_event e) { return EVENT_NAME[e]; }
const char *cubiq_gesture_name(cubiq_gesture g) { return GESTURE_NAME[g]; }

/* Exact string → gesture rank; -1 if not a gesture name. Wire names such as "constructor" or
 * "__proto__" simply do not match (there is no prototype chain to leak through in C). */
static int rank_of(const cj_arena *a, int32_t idx) {
    for (int g = G_NONE; g <= G_JUMP; g++)
        if (cj_str_eq(a, idx, GESTURE_NAME[g])) return g;
    return -1;
}

static const struct { const char *cls; cubiq_gesture ceiling; } CLASS_CEILING[] = {
    {"memory_ready", G_NUDGE}, {"badge_common", G_HOP}, {"badge_rare", G_LEAP},
    {"assembly_phase", G_SETTLE}, {"cohort_ping", G_SETTLE},
};
#define OPERATOR_MAX G_LEAP /* no class can be raised above leap (R06 F39) */

/* Runway needed ahead, mm (R02 / R06), and the deck-certified runway on a credited pad (R08 §04). */
static const int FREE_AHEAD_MM[6] = {0, 0, 0, 85, 125, 201};
static const int PAD_FREE_AHEAD_MM[6] = {0, 0, 0, 20, 60, 201};

/* ------------------------------------------------------------------------- timestamps */

static int digits(const char *s, int n, int *out) {
    int v = 0;
    for (int i = 0; i < n; i++) {
        if (s[i] < '0' || s[i] > '9') return 0;
        v = v * 10 + (s[i] - '0');
    }
    *out = v;
    return 1;
}

static int64_t days_from_civil(int y, int m, int d) { /* H. Hinnant's algorithm */
    y -= m <= 2;
    const int64_t era = (y >= 0 ? y : y - 399) / 400;
    const int64_t yoe = y - era * 400;
    const int64_t doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
    const int64_t doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + doe - 719468;
}

static int days_in_month(int y, int m) {
    static const int dm[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    int leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    return (m == 2 && leap) ? 29 : dm[m - 1];
}

int cubiq_parse_ts(const char *s, int32_t len, int64_t *us_out) {
    int Y, M, D, h, mi, sec = 0, frac_us = 0, i;
    if (len < 17) return 0; /* YYYY-MM-DDTHH:MMZ */
    if (!digits(s, 4, &Y) || s[4] != '-' || !digits(s + 5, 2, &M) || s[7] != '-' ||
        !digits(s + 8, 2, &D) || s[10] != 'T' || !digits(s + 11, 2, &h) || s[13] != ':' ||
        !digits(s + 14, 2, &mi))
        return 0;
    i = 16;
    if (i < len && s[i] == ':') {
        if (i + 3 > len || !digits(s + i + 1, 2, &sec)) return 0;
        i += 3;
        if (i < len && s[i] == '.') {
            int n = 0;
            i++;
            while (i + n < len && s[i + n] >= '0' && s[i + n] <= '9') n++;
            if (n < 1 || n > 6) return 0;
            digits(s + i, n, &frac_us);
            for (int k = n; k < 6; k++) frac_us *= 10;
            i += n;
        }
    }
    int off_min;
    if (i + 1 == len && s[i] == 'Z') {
        off_min = 0;
    } else if (i + 6 == len && (s[i] == '+' || s[i] == '-') && s[i + 3] == ':') {
        int oh, om;
        if (!digits(s + i + 1, 2, &oh) || !digits(s + i + 4, 2, &om)) return 0;
        if (oh > 23 || om > 59) return 0;
        off_min = (s[i] == '-' ? -1 : 1) * (oh * 60 + om);
    } else {
        return 0;
    }
    /* calendar checks (Python datetime semantics; the profile regex alone lets 2026-13-40 through) */
    if (Y < 1 || M < 1 || M > 12 || D < 1 || D > days_in_month(Y, M)) return 0;
    if (h > 23 || mi > 59 || sec > 59) return 0;
    int64_t t = days_from_civil(Y, M, D) * 86400 + (int64_t)h * 3600 + mi * 60 + sec - (int64_t)off_min * 60;
    *us_out = t * 1000000 + frac_us;
    return 1;
}

/* ------------------------------------------------------------------------- validation */

static int is_int(const cj_arena *a, int32_t idx) {
    const cj_node *n = cj_at(a, idx);
    return n && n->type == CJ_INT; /* bool is not an int; 2.0 is not an int (R09 F66) */
}

static int64_t ival(const cj_arena *a, int32_t idx) { return cj_at(a, idx)->u.i; }

static const char *validate(const cj_arena *a, int32_t sig) {
    static const struct { const char *k, *missing, *type; int want_int; } REQ[] = {
        {"v", "missing_v", "type_v", 1},
        {"id", "missing_id", "type_id", 0},
        {"class", "missing_class", "type_class", 0},
        {"intent", "missing_intent", "type_intent", 0},
        {"priority", "missing_priority", "type_priority", 1},
        {"ttl_s", "missing_ttl_s", "type_ttl_s", 1},
        {"not_before", "missing_not_before", "type_not_before", 0},
    };
    const cj_node *root = cj_at(a, sig);
    if (!root || root->type != CJ_OBJ) return "missing_v"; /* a non-object has no fields */
    for (size_t k = 0; k < sizeof REQ / sizeof REQ[0]; k++) {
        int32_t f = cj_get(a, sig, REQ[k].k);
        if (f < 0) return REQ[k].missing;
        if (REQ[k].want_int ? !is_int(a, f) : cj_at(a, f)->type != CJ_STR) return REQ[k].type;
    }
    int64_t v = ival(a, cj_get(a, sig, "v"));
    if (v != 1 && v != 2) return "bad_version";
    int ir = rank_of(a, cj_get(a, sig, "intent"));
    if (ir < 0 || ir == G_NONE) return "bad_intent";
    int64_t pr = ival(a, cj_get(a, sig, "priority"));
    if (pr < 0 || pr > 3) return "bad_priority";
    int64_t ttl = ival(a, cj_get(a, sig, "ttl_s"));
    if (ttl < 1 || ttl > 86400) return "bad_ttl";
    int32_t hint = cj_get(a, sig, "ceiling_hint");
    if (hint >= 0 && cj_at(a, hint)->type != CJ_NULL && !cj_str_eq(a, hint, "call_live"))
        return "bad_ceiling_hint";
    if (v == 1 && hint >= 0) return "hint_requires_v2";
    int32_t nb = cj_get(a, sig, "not_before");
    int64_t t;
    if (!cubiq_parse_ts(a->pool + cj_at(a, nb)->u.s.off, cj_at(a, nb)->u.s.len, &t)) return "bad_not_before";
    return NULL;
}

/* ------------------------------------------------------------------------- decision */

typedef struct {
    int r;
    const char *reason;
} capper;

static void cap(capper *c, int limit, const char *why) {
    if (limit < c->r) {
        c->r = limit;
        if (!c->reason) c->reason = why;
    }
}

/* Python-style numeric reading of a state field: int, float or bool. 0 if absent → def. */
static int num(const cj_arena *a, int32_t idx, double def, double *out) {
    const cj_node *n = cj_at(a, idx);
    if (!n) { *out = def; return 1; }
    switch (n->type) {
        case CJ_INT: *out = (double)n->u.i; return 1;
        case CJ_FLT: *out = n->u.f; return 1;
        case CJ_BOOL: *out = n->u.b; return 1;
        default: return 0;
    }
}

static int flag_default_true(const cj_arena *a, int32_t st, const char *k) {
    int32_t f = cj_get(a, st, k);
    return f < 0 ? 1 : cj_truthy(a, f);
}

static cubiq_decision D(cubiq_event e, cubiq_gesture g, const char *why) {
    cubiq_decision d = {e, g, why};
    return d;
}

static int literal_true(const cj_arena *a, int32_t obj, const char *k) {
    const cj_node *n = cj_at(a, cj_get(a, obj, k));
    return n && n->type == CJ_BOOL && n->u.b;
}

cubiq_decision cubiq_decide(cubiq_version ver, const cj_arena *a, int32_t sig, int32_t st) {
    const int v06 = ver == CUBIQ_V06_DRAFT;
    const char *err = validate(a, sig);
    if (err) return D(EV_REJECTED, G_NONE, err);

    const cj_node *stn = cj_at(a, st);
    if (!stn || stn->type != CJ_OBJ) return D(EV_FAULT, G_NONE, "state_not_object");
    int32_t nowf = cj_get(a, st, "now");
    int64_t now, nb;
    if (nowf < 0 || cj_at(a, nowf)->type != CJ_STR ||
        !cubiq_parse_ts(a->pool + cj_at(a, nowf)->u.s.off, cj_at(a, nowf)->u.s.len, &now))
        return D(EV_FAULT, G_NONE, "state_now");
    int32_t nbf = cj_get(a, sig, "not_before");
    cubiq_parse_ts(a->pool + cj_at(a, nbf)->u.s.off, cj_at(a, nbf)->u.s.len, &nb);
    int64_t ttl = ival(a, cj_get(a, sig, "ttl_s"));

    if (now > nb + ttl * 1000000) return D(EV_EXPIRED, G_NONE, NULL);
    if (now < nb) return D(EV_HELD, G_NONE, NULL);
    if (cj_truthy(a, cj_get(a, st, "fall_recent"))) return D(EV_SAFE_HOLD, G_NONE, "G8_fall_recent");
    if (cj_truthy(a, cj_get(a, st, "machine_vibration")))
        return D(EV_DEFERRED, G_NONE, "G9_machine_vibration");

    int32_t motion = cj_get(a, st, "surface_motion"); /* v0.6 only; absent = still */
    int gentle = 0;
    if (v06 && motion >= 0) {
        if (cj_str_eq(a, motion, "gentle")) gentle = 1;
        else if (!cj_str_eq(a, motion, "still")) return D(EV_DEFERRED, G_NONE, "G11_moving_surface");
    }

    /* pad credit: the pad certifies the SURFACE and the deck runway, never the AIRSPACE */
    int32_t pad = cj_get(a, st, "pad");
    int credit;
    if (v06) {
        credit = pad >= 0 && cj_at(a, pad)->type == CJ_OBJ && literal_true(a, pad, "model_ok") &&
                 literal_true(a, pad, "home_spot") && literal_true(a, pad, "edge_seen");
    } else {
        if (pad >= 0 && cj_truthy(a, pad) && cj_at(a, pad)->type != CJ_OBJ)
            return D(EV_FAULT, G_NONE, "state_pad"); /* v0.5 Python: AttributeError */
        credit = pad >= 0 && cj_at(a, pad)->type == CJ_OBJ && cj_truthy(a, cj_get(a, pad, "model_ok")) &&
                 cj_truthy(a, cj_get(a, pad, "home_spot"));
    }
    int dirty = cj_truthy(a, cj_get(a, st, "tof_window_dirty"));
    int32_t surf = cj_get(a, st, "surface");
    int surface_damped = (credit && !dirty) ? 1 : (surf < 0 || cj_str_eq(a, surf, "damped"));
    const int *runway = credit ? PAD_FREE_AHEAD_MM : FREE_AHEAD_MM;

    capper c = {rank_of(a, cj_get(a, sig, "intent")), NULL};

    int32_t dev = cj_get(a, st, "device");
    int device_cap;
    if (dev < 0 || cj_str_eq(a, dev, "v0")) device_cap = G_LEAP;
    else if (cj_str_eq(a, dev, "v1")) device_cap = G_JUMP;
    else return v06 ? D(EV_REJECTED, G_NONE, "bad_device") : D(EV_FAULT, G_NONE, "state_device");
    cap(&c, device_cap, "device_capability");

    /* class ceiling, then the operator's raise (one rung, max leap) or lower (free) */
    int32_t cls = cj_get(a, sig, "class");
    int def = G_SETTLE;
    const char *cls_s = a->pool + cj_at(a, cls)->u.s.off;
    int32_t cls_l = cj_at(a, cls)->u.s.len;
    for (size_t k = 0; k < sizeof CLASS_CEILING / sizeof CLASS_CEILING[0]; k++)
        if (cj_str_eq(a, cls, CLASS_CEILING[k].cls)) def = CLASS_CEILING[k].ceiling;
    int32_t op = cj_get(a, st, "operator_ceilings");
    int want = -1;
    if (op >= 0 && cj_at(a, op)->type == CJ_OBJ) {
        /* look the class up by its exact bytes (it may contain NUL), last duplicate wins */
        for (int32_t i = cj_at(a, op)->child; i >= 0; i = a->nodes[i].next)
            if (a->nodes[i].key_len == cls_l && memcmp(a->pool + a->nodes[i].key, cls_s, (size_t)cls_l) == 0)
                want = rank_of(a, i);
    } else if (!v06 && op >= 0 && cj_truthy(a, op)) {
        return D(EV_FAULT, G_NONE, "state_operator_ceilings"); /* v0.5 Python: AttributeError */
    }
    if (want < 0 || want == G_NONE) {
        cap(&c, def, "class_ceiling");
    } else if (want < def) {
        cap(&c, want, "operator_ceiling");
    } else {
        int allowed = def + 1;
        if (allowed > OPERATOR_MAX) allowed = OPERATOR_MAX;
        if (allowed > want) allowed = want;
        cap(&c, allowed > def ? allowed : def, "class_ceiling");
    }

    if (cj_str_eq(a, cj_get(a, sig, "ceiling_hint"), "call_live") && flag_default_true(a, st, "call_live_opt_in"))
        cap(&c, G_SETTLE, "call_live");
    if (cj_truthy(a, cj_get(a, st, "quiet_hours"))) cap(&c, G_NUDGE, "quiet_hours");
    if (cj_truthy(a, cj_get(a, st, "hush"))) cap(&c, G_NUDGE, "G10_hush");
    if (cj_truthy(a, cj_get(a, st, "unplaced")) || dirty) cap(&c, G_SETTLE, "G7_unknown_surface");
    if (gentle) cap(&c, G_LEAP, "G11_moving_surface"); /* R10 §05: binds on JUMP only */
    if (!flag_default_true(a, st, "cadence_ok") && c.r >= G_HOP) cap(&c, G_NUDGE, "G4b_cadence");

    double free_mm, level;
    if (!num(a, cj_get(a, st, "free_ahead_mm"), 1000, &free_mm)) return D(EV_FAULT, G_NONE, "state_free_ahead");
    if (!num(a, cj_get(a, st, "level_deg"), 0, &level)) return D(EV_FAULT, G_NONE, "state_level");
    static const int ORDER[] = {G_JUMP, G_LEAP, G_HOP};
    for (int k = 0; k < 3; k++) {
        int g = ORDER[k];
        if (c.r == g && (free_mm < runway[g] || (g != G_HOP && level > 3))) cap(&c, g - 1, "G1_edge_or_level");
    }
    if (!surface_damped && c.r >= G_HOP) cap(&c, G_NUDGE, "G6_resonant_surface"); /* R07 F46 */
    if (!surface_damped && c.r == G_NUDGE) cap(&c, G_SETTLE, "G6_resonant_surface"); /* R03 G6 */
    return D(EV_PERFORMED, (cubiq_gesture)c.r, c.reason);
}
