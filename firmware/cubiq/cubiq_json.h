/*
 * CUBIQ(tm) Quantum Cube — strict JSON decoder for the signal contract (firmware reference).
 * Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md §02 (F84).
 *
 * Design rules (MCU-shaped, even though the reference also builds on a host):
 *   - no malloc: every value lives in a caller-supplied arena of fixed size
 *   - bounded recursion: depth > CJ_MAX_DEPTH is a parse error, never a stack overflow
 *   - R09 F66 wire rule decided LEXICALLY: a number token is an integer only if it has no
 *     '.', 'e' or 'E'. "2.0" is a float, so an integer field written as 2.0 is a type error.
 *     (Python's json agrees; JavaScript cannot tell. The C port closes F66 on the cube side.)
 *   - duplicate keys: the LAST one wins (Python json.loads behaviour); cj_get() searches from
 *     the end of the member list.
 *   - NaN / Infinity literals are rejected (Python accepts them by default; the encoder never
 *     sends them, and a cube has no use for them).
 */
#ifndef CUBIQ_JSON_H
#define CUBIQ_JSON_H

#include <stddef.h>
#include <stdint.h>

#ifndef CJ_MAX_DEPTH
#define CJ_MAX_DEPTH 16
#endif

typedef enum { CJ_NULL, CJ_BOOL, CJ_INT, CJ_FLT, CJ_STR, CJ_ARR, CJ_OBJ } cj_type;

typedef struct {
    uint8_t type;      /* cj_type */
    uint8_t int_ovf;   /* CJ_INT only: 1 if the literal did not fit in int64 (value saturated) */
    int32_t key;       /* member of an object: offset of the key in the string pool, else -1 */
    int32_t key_len;
    int32_t next;      /* next sibling index, -1 at the end */
    int32_t child;     /* CJ_ARR / CJ_OBJ: first child, -1 if empty */
    int32_t count;     /* CJ_ARR / CJ_OBJ: number of children */
    union {
        int b;
        int64_t i;
        double f;
        struct { int32_t off, len; } s;
    } u;
} cj_node;

typedef struct {
    cj_node *nodes;
    int32_t node_cap, node_len;
    char *pool;        /* decoded string bytes (UTF-8, may contain NUL; always use lengths) */
    int32_t pool_cap, pool_len;
    const char *err;   /* set on failure */
} cj_arena;

/* Parse exactly one JSON value spanning [text, text+len) (surrounding whitespace allowed).
 * Returns the root node index, or -1 with arena->err set. The arena is reset first. */
int32_t cj_parse(cj_arena *a, const char *text, size_t len);

const cj_node *cj_at(const cj_arena *a, int32_t idx);           /* NULL if idx < 0 */
int32_t cj_get(const cj_arena *a, int32_t obj, const char *key); /* -1 if absent / not object */
int cj_has(const cj_arena *a, int32_t obj, const char *key);
int cj_str_eq(const cj_arena *a, int32_t idx, const char *lit);  /* 1 iff a string equal to lit */
int cj_truthy(const cj_arena *a, int32_t idx);                   /* Python truthiness; absent = 0 */

#endif
