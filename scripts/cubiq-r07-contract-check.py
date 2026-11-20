#!/usr/bin/env python3
"""CUBIQ(tm) signal contract v0.3 — reference decision function + test-vector runner.
Reads docs/corporate/cubiq/signal-contract-v0.3-vectors.json (44 vectors: the 30 v0.2 vectors
unchanged + 14 new). Stdlib only. Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md §06.
v0.3 over v0.2 (R06):
  * operator_ceilings implemented (R06 D25): operator may raise a class ceiling by exactly one
    rung, never above leap; may lower it to anything; unknown gesture names are ignored.
  * G10 hush: operator-set quiet venue caps every signal at nudge.
  * tof_window_dirty is treated as an unplaced / unknown surface (G7) -> settle.
  * G6 extended: no ballistic gesture (hop/leap/jump) on a resonant or unknown surface (R07 F46);
    the nudge-only G6 rule of R03 then applies as before."""
import json
import os
import sys
from datetime import datetime, timedelta

RANK = {"none": 0, "settle": 1, "nudge": 2, "hop": 3, "leap": 4, "jump": 5}
NAME = {v: k for k, v in RANK.items()}
CLASS_CEILING = {"memory_ready": "nudge", "badge_common": "hop", "badge_rare": "leap",
                 "assembly_phase": "settle", "cohort_ping": "settle"}
OPERATOR_MAX = "leap"                     # no class can be raised above leap (R06 F39)
DEVICE_CAP = {"v0": "leap", "v1": "jump"}
REQUIRED = {"v": int, "id": str, "class": str, "intent": str, "priority": int,
            "ttl_s": int, "not_before": str}
HINTS = {None, "call_live"}
FREE_AHEAD_MM = {"leap": 125, "hop": 85, "jump": 201}


def ts(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def validate(sig):
    for k, t in REQUIRED.items():
        if k not in sig:
            return f"missing_{k}"
        if not isinstance(sig[k], t) or isinstance(sig[k], bool):
            return f"type_{k}"
    if sig["v"] not in (1, 2):
        return "bad_version"
    if sig["intent"] not in RANK or sig["intent"] == "none":
        return "bad_intent"
    if not 0 <= sig["priority"] <= 3:
        return "bad_priority"
    if not 1 <= sig["ttl_s"] <= 86400:
        return "bad_ttl"
    if sig.get("ceiling_hint") not in HINTS:
        return "bad_ceiling_hint"
    if sig["v"] == 1 and "ceiling_hint" in sig:
        return "hint_requires_v2"
    try:
        ts(sig["not_before"])
    except ValueError:
        return "bad_not_before"
    return None


def class_ceiling(cls, op):
    """(ceiling, reason_if_it_lowers). Operator can raise one rung (max leap) or lower freely."""
    default = CLASS_CEILING.get(cls, "settle")
    want = (op or {}).get(cls)
    if want not in RANK or want == "none":
        return default, "class_ceiling"
    if RANK[want] < RANK[default]:
        return want, "operator_ceiling"
    allowed = min(RANK[default] + 1, RANK[OPERATOR_MAX], RANK[want])
    return NAME[max(allowed, RANK[default])], "class_ceiling"


def decide(sig, st):
    err = validate(sig)
    if err:
        return "rejected", "none", err
    now, nb = ts(st["now"]), ts(sig["not_before"])
    if now > nb + timedelta(seconds=sig["ttl_s"]):
        return "expired", "none", None
    if now < nb:
        return "held", "none", None
    if st.get("fall_recent"):
        return "safe_hold", "none", "G8_fall_recent"
    if st.get("machine_vibration"):
        return "deferred", "none", "G9_machine_vibration"

    reason = None
    r = RANK[sig["intent"]]

    def cap(limit, why):
        nonlocal r, reason
        if RANK[limit] < r:
            r = RANK[limit]
            reason = reason or why

    cap(DEVICE_CAP[st.get("device", "v0")], "device_capability")
    cap(*class_ceiling(sig["class"], st.get("operator_ceilings")))
    if sig.get("ceiling_hint") == "call_live" and st.get("call_live_opt_in", True):
        cap("settle", "call_live")
    if st.get("quiet_hours"):
        cap("nudge", "quiet_hours")
    if st.get("hush"):
        cap("nudge", "G10_hush")
    if st.get("unplaced") or st.get("tof_window_dirty"):
        cap("settle", "G7_unknown_surface")
    if not st.get("cadence_ok", True) and r >= RANK["hop"]:
        cap("nudge", "G4b_cadence")
    free = st.get("free_ahead_mm", 1000)
    for g in ("jump", "leap", "hop"):
        if r == RANK[g] and (free < FREE_AHEAD_MM[g] or (g != "hop" and st.get("level_deg", 0) > 3)):
            cap(NAME[RANK[g] - 1], "G1_edge_or_level")
    surface_ok = st.get("surface", "damped") == "damped"
    if not surface_ok and r >= RANK["hop"]:
        cap("nudge", "G6_resonant_surface")          # R07 F46: no ballistic on resonant/unknown
    if not surface_ok and r == RANK["nudge"]:
        cap("settle", "G6_resonant_surface")          # R03 G6, unchanged
    return "performed", NAME[r], reason


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, "..", "docs", "corporate", "cubiq", "signal-contract-v0.3-vectors.json")
    vectors = json.load(open(path))["vectors"]
    fails = 0
    for v in vectors:
        got = decide(v["signal"], v["state"])
        want = (v["expect"]["event"], v["expect"]["performed"], v["expect"]["downgrade_reason"])
        ok = got == want
        fails += not ok
        print(f"  {'PASS' if ok else 'FAIL'}  {v['name']:40s} -> {got[0]:9s} {got[1]:6s} {got[2]}"
              + ("" if ok else f"   expected {want}"))
    print(f"  {len(vectors) - fails}/{len(vectors)} vectors pass")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
