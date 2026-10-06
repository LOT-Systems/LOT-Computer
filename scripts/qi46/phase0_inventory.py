#!/usr/bin/env python3
"""QI·46 Phase 0 — Step 0.1/0.2: source inventory + tagging (metadata only, no content copied).
Usage: python3 -I scripts/qi46/phase0_inventory.py [repo_root] > manifest.json
"""
import json, os, sys, re

root = sys.argv[1] if len(sys.argv) > 1 else "."
SOURCES = [  # (source tag, path prefix, type)
    ("institute", "docs/corporate/CQGS", "philosophy"),
    ("institute", "docs/corporate/LOT-CUBIQ", "technical"),
    ("bioelectric", "docs/technical", "technical"),
    ("brand", "docs/corporate", "voice"),
    ("brand", "docs/wiki", "voice"),
    ("platform", "docs/assembly", "example"),
    ("platform", "docs/benchmark", "example"),
    ("platform", "docs/badges", "example"),
    ("platform", "docs/LOT-SR", "example"),
    ("platform", "docs/SESSION_REPORT", "example"),
    ("cosmo", "docs/security", "technical"),
]
def tag(rel):
    for s, p, t in SOURCES:
        if rel.startswith(p):
            return s, t
    return None, None

docs, counts, toks = [], {}, {}
for d, _, fs in os.walk(os.path.join(root, "docs")):
    for f in fs:
        if not f.endswith(".md"):
            continue
        p = os.path.join(d, f); rel = os.path.relpath(p, root)
        s, t = tag(rel)
        if not s:
            continue
        txt = open(p, encoding="utf-8", errors="replace").read()
        n = len(txt) // 4  # rough token estimate
        docs.append({"path": rel, "source": s, "type": t, "est_tokens": n,
                     "arc_position": None, "body_state": None, "cosmo_cleared": False})
        counts[s] = counts.get(s, 0) + 1; toks[s] = toks.get(s, 0) + n
json.dump({"docs": docs, "counts": counts, "est_tokens": toks, "total": len(docs)}, sys.stdout, indent=1)
