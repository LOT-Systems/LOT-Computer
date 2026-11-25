/* CUBIQ(tm) — strict JSON decoder. See cubiq_json.h for the rules. C99, no libc allocation. */
#include "cubiq_json.h"

#include <stdlib.h>
#include <string.h>

typedef struct {
    cj_arena *a;
    const char *p, *end;
} cj_cur;

static void ws(cj_cur *c) {
    while (c->p < c->end && (*c->p == ' ' || *c->p == '\t' || *c->p == '\n' || *c->p == '\r')) c->p++;
}

static int32_t new_node(cj_cur *c, cj_type t) {
    cj_arena *a = c->a;
    if (a->node_len >= a->node_cap) { a->err = "node_pool_full"; return -1; }
    cj_node *n = &a->nodes[a->node_len];
    memset(n, 0, sizeof *n);
    n->type = (uint8_t)t;
    n->key = -1;
    n->next = -1;
    n->child = -1;
    return a->node_len++;
}

static int put_byte(cj_arena *a, unsigned ch) {
    if (a->pool_len >= a->pool_cap) { a->err = "string_pool_full"; return 0; }
    a->pool[a->pool_len++] = (char)ch;
    return 1;
}

static int put_utf8(cj_arena *a, uint32_t cp) {
    if (cp < 0x80) return put_byte(a, cp);
    if (cp < 0x800) return put_byte(a, 0xC0 | (cp >> 6)) && put_byte(a, 0x80 | (cp & 0x3F));
    if (cp < 0x10000)
        return put_byte(a, 0xE0 | (cp >> 12)) && put_byte(a, 0x80 | ((cp >> 6) & 0x3F)) &&
               put_byte(a, 0x80 | (cp & 0x3F));
    return put_byte(a, 0xF0 | (cp >> 18)) && put_byte(a, 0x80 | ((cp >> 12) & 0x3F)) &&
           put_byte(a, 0x80 | ((cp >> 6) & 0x3F)) && put_byte(a, 0x80 | (cp & 0x3F));
}

static int hex4(cj_cur *c, uint32_t *out) {
    if (c->end - c->p < 4) return 0;
    uint32_t v = 0;
    for (int i = 0; i < 4; i++) {
        char h = c->p[i];
        v <<= 4;
        if (h >= '0' && h <= '9') v |= (uint32_t)(h - '0');
        else if (h >= 'a' && h <= 'f') v |= (uint32_t)(h - 'a' + 10);
        else if (h >= 'A' && h <= 'F') v |= (uint32_t)(h - 'A' + 10);
        else return 0;
    }
    c->p += 4;
    *out = v;
    return 1;
}

/* Decodes a string body (c->p just past the opening quote) into the pool. */
static int parse_str(cj_cur *c, int32_t *off, int32_t *len) {
    cj_arena *a = c->a;
    *off = a->pool_len;
    while (c->p < c->end) {
        unsigned char ch = (unsigned char)*c->p++;
        if (ch == '"') { *len = a->pool_len - *off; return 1; }
        if (ch < 0x20) { a->err = "control_char_in_string"; return 0; }
        if (ch != '\\') { if (!put_byte(a, ch)) return 0; continue; }
        if (c->p >= c->end) break;
        char e = *c->p++;
        uint32_t cp;
        switch (e) {
            case '"': case '\\': case '/': if (!put_byte(a, (unsigned)e)) return 0; break;
            case 'b': if (!put_byte(a, '\b')) return 0; break;
            case 'f': if (!put_byte(a, '\f')) return 0; break;
            case 'n': if (!put_byte(a, '\n')) return 0; break;
            case 'r': if (!put_byte(a, '\r')) return 0; break;
            case 't': if (!put_byte(a, '\t')) return 0; break;
            case 'u':
                if (!hex4(c, &cp)) { a->err = "bad_unicode_escape"; return 0; }
                if (cp >= 0xD800 && cp <= 0xDBFF && c->end - c->p >= 6 && c->p[0] == '\\' && c->p[1] == 'u') {
                    const char *save = c->p;
                    uint32_t lo;
                    c->p += 2;
                    if (hex4(c, &lo) && lo >= 0xDC00 && lo <= 0xDFFF)
                        cp = 0x10000 + ((cp - 0xD800) << 10) + (lo - 0xDC00);
                    else
                        c->p = save; /* lone high surrogate: kept as-is, like Python */
                }
                if (!put_utf8(a, cp)) return 0;
                break;
            default: a->err = "bad_escape"; return 0;
        }
    }
    a->err = "unterminated_string";
    return 0;
}

static int32_t parse_value(cj_cur *c, int depth);

static int32_t parse_number(cj_cur *c) {
    const char *s = c->p;
    int is_float = 0;
    if (c->p < c->end && *c->p == '-') c->p++;
    if (c->p >= c->end) goto bad;
    if (*c->p == '0') c->p++;
    else if (*c->p >= '1' && *c->p <= '9') while (c->p < c->end && *c->p >= '0' && *c->p <= '9') c->p++;
    else goto bad;
    if (c->p < c->end && *c->p == '.') {
        is_float = 1;
        c->p++;
        if (c->p >= c->end || *c->p < '0' || *c->p > '9') goto bad;
        while (c->p < c->end && *c->p >= '0' && *c->p <= '9') c->p++;
    }
    if (c->p < c->end && (*c->p == 'e' || *c->p == 'E')) {
        is_float = 1;
        c->p++;
        if (c->p < c->end && (*c->p == '+' || *c->p == '-')) c->p++;
        if (c->p >= c->end || *c->p < '0' || *c->p > '9') goto bad;
        while (c->p < c->end && *c->p >= '0' && *c->p <= '9') c->p++;
    }
    {
        char buf[64];
        size_t n = (size_t)(c->p - s);
        int32_t idx = new_node(c, is_float ? CJ_FLT : CJ_INT);
        if (idx < 0) return -1;
        cj_node *nd = &c->a->nodes[idx];
        if (is_float) {
            if (n >= sizeof buf) n = sizeof buf - 1; /* precision beyond 63 chars is irrelevant here */
            memcpy(buf, s, n);
            buf[n] = 0;
            nd->u.f = strtod(buf, NULL);
        } else {
            /* saturating int64 accumulate; overflow is remembered, sign kept */
            const char *q = s;
            int neg = 0;
            uint64_t v = 0;
            if (*q == '-') { neg = 1; q++; }
            for (; q < c->p; q++) {
                unsigned d = (unsigned)(*q - '0');
                if (v > (UINT64_MAX - d) / 10) { nd->int_ovf = 1; v = UINT64_MAX; break; }
                v = v * 10 + d;
            }
            if (neg) nd->u.i = (v > (uint64_t)INT64_MAX) ? INT64_MIN : -(int64_t)v;
            else nd->u.i = (v > (uint64_t)INT64_MAX) ? INT64_MAX : (int64_t)v;
            if (v > (uint64_t)INT64_MAX) nd->int_ovf = 1;
        }
        return idx;
    }
bad:
    c->a->err = "bad_number";
    return -1;
}

static int lit(cj_cur *c, const char *w) {
    size_t n = strlen(w);
    if ((size_t)(c->end - c->p) < n || memcmp(c->p, w, n) != 0) return 0;
    c->p += n;
    return 1;
}

static int32_t parse_value(cj_cur *c, int depth) {
    cj_arena *a = c->a;
    if (depth > CJ_MAX_DEPTH) { a->err = "too_deep"; return -1; }
    ws(c);
    if (c->p >= c->end) { a->err = "unexpected_end"; return -1; }
    char ch = *c->p;
    if (ch == '{' || ch == '[') {
        int is_obj = ch == '{';
        int32_t idx = new_node(c, is_obj ? CJ_OBJ : CJ_ARR), last = -1;
        if (idx < 0) return -1;
        c->p++;
        ws(c);
        if (c->p < c->end && *c->p == (is_obj ? '}' : ']')) { c->p++; return idx; }
        for (;;) {
            int32_t koff = -1, klen = 0;
            if (is_obj) {
                ws(c);
                if (c->p >= c->end || *c->p != '"') { a->err = "expected_key"; return -1; }
                c->p++;
                if (!parse_str(c, &koff, &klen)) return -1;
                ws(c);
                if (c->p >= c->end || *c->p != ':') { a->err = "expected_colon"; return -1; }
                c->p++;
            }
            int32_t v = parse_value(c, depth + 1);
            if (v < 0) return -1;
            a->nodes[v].key = koff;
            a->nodes[v].key_len = klen;
            if (last < 0) a->nodes[idx].child = v;
            else a->nodes[last].next = v;
            last = v;
            a->nodes[idx].count++;
            ws(c);
            if (c->p < c->end && *c->p == ',') { c->p++; continue; }
            if (c->p < c->end && *c->p == (is_obj ? '}' : ']')) { c->p++; return idx; }
            a->err = "expected_comma_or_close";
            return -1;
        }
    }
    if (ch == '"') {
        int32_t idx = new_node(c, CJ_STR);
        if (idx < 0) return -1;
        c->p++;
        int32_t off, len;
        if (!parse_str(c, &off, &len)) return -1;
        a->nodes[idx].u.s.off = off;
        a->nodes[idx].u.s.len = len;
        return idx;
    }
    if (ch == 't' || ch == 'f') {
        int b = ch == 't';
        if (!lit(c, b ? "true" : "false")) { a->err = "bad_literal"; return -1; }
        int32_t idx = new_node(c, CJ_BOOL);
        if (idx >= 0) a->nodes[idx].u.b = b;
        return idx;
    }
    if (ch == 'n') {
        if (!lit(c, "null")) { a->err = "bad_literal"; return -1; }
        return new_node(c, CJ_NULL);
    }
    if (ch == '-' || (ch >= '0' && ch <= '9')) return parse_number(c);
    a->err = "unexpected_char";
    return -1;
}

int32_t cj_parse(cj_arena *a, const char *text, size_t len) {
    cj_cur c = {a, text, text + len};
    a->node_len = 0;
    a->pool_len = 0;
    a->err = NULL;
    int32_t root = parse_value(&c, 0);
    if (root < 0) return -1;
    ws(&c);
    if (c.p != c.end) { a->err = "trailing_data"; return -1; }
    return root;
}

const cj_node *cj_at(const cj_arena *a, int32_t idx) {
    return (idx >= 0 && idx < a->node_len) ? &a->nodes[idx] : NULL;
}

int32_t cj_get(const cj_arena *a, int32_t obj, const char *key) {
    const cj_node *o = cj_at(a, obj);
    if (!o || o->type != CJ_OBJ) return -1;
    size_t kl = strlen(key);
    int32_t found = -1;
    for (int32_t i = o->child; i >= 0; i = a->nodes[i].next) {
        const cj_node *m = &a->nodes[i];
        if ((size_t)m->key_len == kl && memcmp(a->pool + m->key, key, kl) == 0) found = i; /* last wins */
    }
    return found;
}

int cj_has(const cj_arena *a, int32_t obj, const char *key) { return cj_get(a, obj, key) >= 0; }

int cj_str_eq(const cj_arena *a, int32_t idx, const char *lit_) {
    const cj_node *n = cj_at(a, idx);
    if (!n || n->type != CJ_STR) return 0;
    size_t l = strlen(lit_);
    return (size_t)n->u.s.len == l && memcmp(a->pool + n->u.s.off, lit_, l) == 0;
}

int cj_truthy(const cj_arena *a, int32_t idx) {
    const cj_node *n = cj_at(a, idx);
    if (!n) return 0;
    switch (n->type) {
        case CJ_NULL: return 0;
        case CJ_BOOL: return n->u.b;
        case CJ_INT: return n->u.i != 0;
        case CJ_FLT: return n->u.f != 0.0;
        case CJ_STR: return n->u.s.len != 0;
        default: return n->count != 0;
    }
}
