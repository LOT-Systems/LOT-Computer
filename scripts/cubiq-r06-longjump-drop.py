#!/usr/bin/env python3
"""CUBIQ(tm) v.0 R06: v.1 long-jump first numbers, launch friction cone, runway sensing
geometry, landing impact, drop survival (750 mm / 1 m), cock-on-intent exposure.
Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md. Stdlib only.
All inputs marked EST are placeholders for bench measurement, not datasheet values."""
import math

G = 9.81
A = 0.045                 # cube edge, m
M_V0 = 0.1125             # v.0 with battery-as-reaction-mass (R05 F28), kg
M_V1 = 0.090              # v.1 target (R01/R02), kg
M_R = 0.040               # moving reaction mass (R03), kg
M_CELL = 0.007            # LiPo cell (R03 budget), kg
E_REST = 0.2              # landing restitution EST (R04 F19)
MU_FEET = 0.5             # elastomer feet on dry wood EST
TRANSFER = (0.6, 0.7, 0.8)  # spring -> body KE (R03, EST)
RANGE_SIG = 0.10          # per-jump range sigma (R04)
P98_Z = 2.054             # one-sided 98th percentile of a normal
EDGE_MARGIN = 0.020       # R02 edge-ladder margin, m
GRAZE_MIN_DEG = 5.0       # EST: lowest reliable ToF grazing angle on matte wood


def ballistic(m, rng, elev_deg):
    th = math.radians(elev_deg)
    v2 = G * rng / math.sin(2 * th)
    v = math.sqrt(v2)
    vx, vy = v * math.cos(th), v * math.sin(th)
    return dict(ke=0.5 * m * v2, v=v, vx=vx, vy=vy,
                rise=vy ** 2 / (2 * G), t=2 * vy / G)


def slide(vx, vy, mu=MU_FEET, e=E_REST):
    """R04 F19: friction during impact removes up to mu(1+e)vy of vx; the rest slides."""
    rest = max(0.0, vx - mu * (1 + e) * vy)
    return rest ** 2 / (2 * mu * G)


# ---------------------------------------------------------------------------
print("== F31: v.1 LONG JUMP — body energy, spring, landing (feet mu 0.5, e 0.2) ==")
print("  mass    range  elev   body KE  v0     rise    flight  spring@70%  peak F 6mm/10mm  "
      "touchdown vy  slide   p98 scatter")
for m in (M_V0, M_V1):
    for rng in (0.150, 0.200, 0.250):
        for el in (45, 60):
            b = ballistic(m, rng, el)
            es = b["ke"] / 0.7
            f6, f10 = 2 * es / 0.006, 2 * es / 0.010
            print(f"  {m*1e3:5.1f} g {rng*1e3:4.0f} mm {el:3d}°  {b['ke']*1e3:6.1f} mJ "
                  f"{b['v']:4.2f} m/s {b['rise']*1e3:5.1f} mm {b['t']*1e3:4.0f} ms "
                  f"{es*1e3:7.1f} mJ   {f6:5.1f} / {f10:4.1f} N      "
                  f"{b['vy']:4.2f} m/s   {slide(b['vx'], b['vy'])*1e3:4.1f} mm  "
                  f"±{P98_Z*RANGE_SIG*rng*1e3:4.1f} mm")
print("  (spring stored range at 80/60 % transfer = x0.875 / x1.167 of the 70 % column)")
b = ballistic(M_V0, 0.040, 45)
print(f"  ref: v.0 LEAP 40 mm @45° at 112.5 g = {b['ke']*1e3:.1f} mJ body KE, "
      f"spring {b['ke']/0.8*1e3:.0f}-{b['ke']/0.6*1e3:.0f} mJ")

# ---------------------------------------------------------------------------
print("== F32: LAUNCH FRICTION CONE at the plunger tip ==")
# A plunger whose axis is phi from vertical needs mu_tip >= tan(phi) or the tip slides and the
# horizontal impulse is capped at mu_tip * normal impulse -> steeper launch than designed.
print("  axis off vertical  mu_tip   effective elevation   range factor at same KE (no slip loss)")
for phi in (45, 30):
    for mu in (0.3, 0.5, 0.7, 1.0):
        phi_eff = min(phi, math.degrees(math.atan(mu)))
        el = 90 - phi_eff
        rf = math.sin(math.radians(2 * el)) / math.sin(math.radians(2 * (90 - phi)))
        print(f"  {phi:3d}°              {mu:4.1f}     {el:5.1f}°               x{rf:4.2f}"
              f"{'   (designed)' if phi_eff == phi else '   SLIPS'}")
print(f"  required mu_tip: 45° axis -> {math.tan(math.radians(45)):.2f}, "
      f"30° axis -> {math.tan(math.radians(30)):.2f}")

# ---------------------------------------------------------------------------
print("== F33: RUNWAY SENSING — how high must the forward ToF sit? ==")
# Edge is found as 'table stops returning'. A zone that returns table only guarantees table up to
# the NEAR end of its footprint: d = h / tan(depression). Returns below GRAZE_MIN are unreliable.
tg = math.tan(math.radians(GRAZE_MIN_DEG))
print(f"  reliable grazing >= {GRAZE_MIN_DEG:.0f}° (EST)")
print(f"  base band h = 4.5 mm (R05 L2): reliable clear-table reach {0.0045/tg*1e3:.0f} mm")
print("  gesture               free table needed   ToF height needed   slant range")
cases = [("v.0 LEAP 40 mm (R02)", 0.125)]
for rng, el in ((0.150, 60), (0.200, 60), (0.250, 60)):
    b = ballistic(M_V0, rng, el)
    need = rng + P98_Z * RANGE_SIG * rng + slide(b["vx"], b["vy"]) + EDGE_MARGIN
    cases.append((f"v.1 JUMP {rng*1e3:.0f} mm @60°", need))
for name, need in cases:
    h = need * tg
    sl = math.hypot(need, h)
    print(f"  {name:22s} {need*1e3:5.0f} mm            {h*1e3:5.1f} mm           {sl*1e3:4.0f} mm"
          f"{'   > 45 mm face' if h > A else ''}")

# ---------------------------------------------------------------------------
print("== F34: LANDING IMPACT (linear-spring contact, peak a = v^2 / s) ==")
for label, vy in (("v.0 LEAP 40 mm @45°", ballistic(M_V0, 0.040, 45)["vy"]),
                  ("v.1 150 mm @60°", ballistic(M_V0, 0.150, 60)["vy"]),
                  ("v.1 250 mm @60°", ballistic(M_V0, 0.250, 60)["vy"])):
    row = "   ".join(f"s {s*1e3:.0f} mm: {vy**2/s/G:5.0f} g" for s in (0.001, 0.002, 0.004))
    print(f"  {label:20s} vy {vy:4.2f} m/s  = drop {vy**2/(2*G)*1e3:4.0f} mm   {row}")

# ---------------------------------------------------------------------------
print("== F35: DROP SURVIVAL ==")
for hdrop in (0.75, 1.00):
    v = math.sqrt(2 * G * hdrop)
    tf = math.sqrt(2 * hdrop / G)
    print(f"  drop {hdrop*1e3:.0f} mm: impact {v:.2f} m/s, fall {tf*1e3:.0f} ms, "
          f"KE cube {0.5*M_V0*v*v:.2f} J, KE reaction mass {0.5*M_R*v*v:.3f} J")
    for s in (0.0005, 0.001, 0.002):
        a = v * v / s
        print(f"     shell stop {s*1e3:3.1f} mm: {a/G:5.0f} g")
    for s in (0.001, 0.0015, 0.003):
        a = v * v / s
        print(f"     mass end-stop {s*1e3:3.1f} mm: {a/G:5.0f} g -> {M_R*a:5.0f} N on stop, "
              f"cell alone {M_CELL*a:4.0f} N, cell under slug {M_R*a:5.0f} N")
v = math.sqrt(2 * G * 0.75)
print("  shorted-coil damping c = km^2, over the 4 mm half-stroke at 3.84 m/s:")
for km in (1.0, 1.5, 2.0):
    e_d = km ** 2 * v * 0.004
    print(f"     km {km:.1f} N/sqrt(W): ~{e_d*1e3:4.0f} mJ of {0.5*M_R*v*v*1e3:.0f} mJ "
          f"({e_d/(0.5*M_R*v*v)*100:3.0f} %)")
print(f"  free-fall detect at 60 ms leaves {(math.sqrt(1.5/G)-0.060)*1e3:.0f} ms before impact")

# ---------------------------------------------------------------------------
print("== F36: LATCH UNDER SHOCK and COCK-ON-INTENT ==")
m_pawl = 0.0003   # EST
es_v1 = ballistic(M_V0, 0.150, 60)["ke"] / 0.7
for gs in (500, 1500):
    print(f"  pawl 0.3 g at {gs} g: inertial load {m_pawl*gs*G:.1f} N "
          f"(vs. latched spring force ~13 N v.0, {2*es_v1/0.010:.0f} N v.1 150 mm @10 mm)")
print(f"  v.1 150 mm @60° spring store {es_v1*1e3:.0f} mJ; peak force at 10 mm {2*es_v1/0.010:.0f} N")
for per_day, hold_s in ((1, 10), (12, 10)):
    print(f"  {per_day:2d} LEAP/day x {hold_s} s armed = {per_day*hold_s/86400*100:.3f} % "
          f"of the day with stored energy (vs. 100 % if cocked-and-waiting)")
