#!/usr/bin/env python3
"""CUBIQ(tm) — R10 differential check for contract v0.6-draft. Stdlib + `node` on PATH.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md §02.

  A. Python v0.6-draft (scripts/cubiq-r10-contract-v06.py, standalone) against the TypeScript
     decideV06Draft (src/shared/cubiq/signal-contract.ts) on N seeded random cases. The R09
     generators are reused; R10 adds edge_seen (true / false / missing / junk) to pads, and
     surface_motion (missing / still / gentle / rough / junk) to states.
  B. Regression: the standalone v0.6 Python against the v0.5 Python chain (R07 -> R08 -> R09
     imports) on the same cases reshaped to v0.5 meaning (edge_seen true, surface still). The two
     Python files share no code, so this checks the rewrite, not a copy.
The integer-as-float pool keeps its KNOWN divergence (R09 F66, encoder rule). Every other
disagreement, and any crash, is a failure. Exit 0 only if there are none."""
import importlib.util
import json
import os
import random
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


r09 = load("r09fuzz", "cubiq-r09-diff-fuzz.py")      # generators + v0.5 chain (r09.v05)
v06 = load("v06", "cubiq-r10-contract-v06.py")
N = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
r09.rng.seed(20261123)
rng = r09.rng


def state_v06():
    st = r09.state()
    if "pad" in st:
        k = rng.random()
        if k < 0.55:
            st["pad"]["edge_seen"] = True
        elif k < 0.80:
            st["pad"]["edge_seen"] = False
        elif k < 0.95:
            pass                                      # missing
        else:
            st["pad"]["edge_seen"] = rng.choice(["yes", 1, None])
    k = rng.random()
    if k < 0.15:
        st["surface_motion"] = "gentle"
    elif k < 0.22:
        st["surface_motion"] = "rough"
    elif k < 0.32:
        st["surface_motion"] = "still"
    elif k < 0.34:
        st["surface_motion"] = rng.choice(["banana", "", "GENTLE"])
    return st


def as_v05(st):
    """The v0.5 meaning of a v0.6 state: evidence present, surface still."""
    st = json.loads(json.dumps(st))
    st.pop("surface_motion", None)
    if "pad" in st:
        st["pad"]["edge_seen"] = True
    return st


def safe(fn, sig, st):
    try:
        return list(fn(sig, st))
    except Exception as e:
        return ["crash", type(e).__name__, str(e)[:40]]


def main():
    kinds = ["plain"] * 90 + ["float"] * 5 + ["odd_ts"] * 5
    cases, tags = [], []
    for _ in range(N):
        k = rng.choice(kinds)
        cases.append({"signal": r09.signal(k), "state": state_v06()})
        tags.append(k)
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "cases.json")
        json.dump(cases, open(p, "w"))
        out = subprocess.run(["node", os.path.join(HERE, "cubiq-r10-contract-check.ts"), "--cases", p, "v06"],
                             capture_output=True, text=True, check=True).stdout
    ts_res = json.loads(out)

    outcomes, diff_a, diff_b, ex = {}, {}, {}, {}
    crashes = 0
    g11 = 0
    for c, k, t in zip(cases, tags, ts_res):
        p = safe(v06.decide, c["signal"], c["state"])
        crashes += p[0] == "crash"
        outcomes[p[0]] = outcomes.get(p[0], 0) + 1
        g11 += p[2] == "G11_moving_surface"
        if p != t:
            diff_a[k] = diff_a.get(k, 0) + 1
            ex.setdefault(("A", k), (c, p, t))
        st5 = as_v05(c["state"])
        q = safe(v06.decide, c["signal"], st5)
        r = safe(r09.v05.decide, c["signal"], {kk: vv for kk, vv in st5.items()})
        # v0.5 pads use truthiness, v0.6 needs literal true: only compare boolean-valued pads
        pad = st5.get("pad", {})
        if all(isinstance(pad.get(x), bool) for x in ("model_ok", "home_spot")) or not pad:
            if q != r and k != "float":
                diff_b[k] = diff_b.get(k, 0) + 1
                ex.setdefault(("B", k), (c, q, r))

    print(f"  {N} random cases · outcome mix (Python v0.6-draft): "
          + ", ".join(f"{k} {v}" for k, v in sorted(outcomes.items(), key=lambda x: -x[1])))
    print(f"  G11_moving_surface decided {g11} of them · crashes {crashes}")
    print("  A. Python v0.6-draft vs TypeScript decideV06Draft")
    for k in ("plain", "float", "odd_ts"):
        n = tags.count(k)
        print(f"     {k:7s} {n:6d} cases   disagreements {diff_a.get(k, 0):5d}"
              + ("   (KNOWN, R09 F66: encoder rule)" if k == "float" and diff_a.get(k) else ""))
    print("  B. v0.6-draft (edge_seen true, still) vs the v0.5 Python chain")
    for k in ("plain", "odd_ts"):
        print(f"     {k:7s} disagreements {diff_b.get(k, 0):5d}")
    for key, (c, p, t) in ex.items():
        if key[1] != "float":
            print(f"     e.g. {key}: {json.dumps(c)[:200]} -> {p} vs {t}")
    bad = diff_a.get("plain", 0) + diff_a.get("odd_ts", 0) + sum(diff_b.values()) + crashes
    print("  PASS: no disagreement outside the known divergence" if not bad else f"  FAIL: {bad} unexplained")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
