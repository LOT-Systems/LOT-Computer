#!/usr/bin/env python3
"""CUBIQ(tm) v.0 R03 budget: reaction-mass hop efficiency, shell mass, mass budget, NUDGE coupling.
Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md. Stdlib only.
Point-mass, rigid, no losses: every figure is a floor on required force/energy."""
import math
G = 9.81
M = 0.120                                  # v.0 total mass, kg
E_HOP = 0.5 * M * (2 * G * 0.010)          # 10 mm rise -> body KE, J

print("== F7: internal reaction-mass HOP (mass stroked UP, stopped by end-stop) ==")
print(f"  body KE needed for 10 mm HOP: {E_HOP*1e3:.1f} mJ, body v {math.sqrt(2*G*0.010):.2f} m/s")
for mr_g in (20, 30, 40, 60):
    mr = mr_g / 1000
    p = M * math.sqrt(2 * G * 0.010)       # momentum conserved through the inelastic stop
    v_r = p / mr
    E_r = 0.5 * mr * v_r ** 2              # = E_HOP * M / mr
    for stroke_mm in (5, 8):
        F = E_r / (stroke_mm / 1000)
        print(f"  m_r={mr_g:>2} g  eff={mr/M:>4.0%}  mass KE={E_r*1e3:>5.1f} mJ  v_r={v_r:.2f} m/s  "
              f"stroke {stroke_mm} mm -> mean F {F:>4.1f} N")
print("  (R02 B1 assumed 2.4 N over 5 mm, i.e. 100 % transfer. Real transfer is m_r/M.)")

print("== F8: shell mass, 45 mm cube, six faces ==")
area_cm2 = 6 * 4.5 ** 2
for name, rho in (("alumina-class ceramic", 3.9), ("zirconia-toughened comp.", 3.0),
                  ("ceramic-filled polymer", 1.9), ("PC core + 0.1 mm ceramic coat", 1.35)):
    for t_mm in (1.0, 1.5):
        print(f"  {name:<30} t={t_mm} mm  -> {area_cm2*t_mm/10*rho:>5.1f} g")

print("== mass budget v0.1 (estimates, grams) ==")
budget = [("shell (ceramic-filled polymer, 1.0 mm)", 23), ("internal frame + fasteners", 8),
          ("voice coil stator (magnet + coil)", 14), ("reaction mass (moving, incl. coil former)", 40),
          ("spring-latch foot-plunger module", 9), ("LiPo cell 300 mAh", 7),
          ("PCB: MCU + BLE + drivers + boost", 5), ("Qi receiver coil + ferrite", 4),
          ("IMU + ToF + temp sensor", 1), ("piezo bimorph trim", 2), ("elastomer feet x4", 2),
          ("v.3 magnet-volume reserve (empty in v.0)", 0)]
tot = 0
for n, g in budget:
    tot += g
    print(f"  {n:<44} {g:>3}")
print(f"  {'TOTAL':<44} {tot:>3}   (target <120; margin {120-tot} g)")

print("== F9: LEAP via foot plunger (external push on table) ==")
for ang in (45,):
    rng = 0.040
    v = math.sqrt(rng * G / math.sin(math.radians(2 * ang)))
    E = 0.5 * M * v * v
    for eta in (0.6, 0.8):
        print(f"  LEAP 40 mm @ {ang} deg: body KE {E*1e3:.1f} mJ; spring store at {eta:.0%} transfer "
              f"{E/eta*1e3:.1f} mJ; 6 mm plunger -> spring k ~{2*(E/eta)/0.006**2/1000:.2f} N/mm")

print("== F10: NUDGE band vs. resonant furniture ==")
for name, f0 in (("upright piano soundboard (lowest modes)", 90), ("hollow-core door desk", 140),
                 ("solid oak tabletop 30 mm", 260), ("glass desk 10 mm", 330)):
    inband = 80 <= f0 <= 250
    print(f"  {name:<40} ~{f0:>3} Hz  {'IN NUDGE BAND -> probe required' if inband else 'outside band'}")
