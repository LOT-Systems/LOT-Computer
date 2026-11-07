#!/usr/bin/env python3
"""CUBIQ(TM) v.0.2 ballistic + energy budget. Idealised: point mass, no drag,
launch from rest on flat surface. Run: python3 cubiq_budget.py"""
import math
g = 9.81

def hop(m, rise):                 # vertical hop to given apex
    v = math.sqrt(2*g*rise); return v, 0.5*m*v*v

def jump(m, rng, alpha_deg):      # ballistic range at launch angle alpha (from horizontal)
    a = math.radians(alpha_deg)
    v = math.sqrt(rng*g/math.sin(2*a))
    return v, 0.5*m*v*v, v*v*math.sin(a)**2/(2*g)

def mu_min(alpha_deg):            # no-slip launch needs mu >= cot(alpha)
    return 1/math.tan(math.radians(alpha_deg))

EFF = 0.20                        # assumed electrical->kinetic efficiency
print("== v.0 (m=0.120 kg)")
v,E = hop(.120,.010);             print(f"HOP   10mm rise      v={v:.2f} m/s  E={E*1e3:.1f} mJ  elec@20%={E/EFF*1e3:.0f} mJ")
v,E,h = jump(.120,.040,75);       print(f"LEAP  40mm @75deg    v={v:.2f} m/s  E={E*1e3:.1f} mJ  apex={h*1e3:.0f} mm  mu>={mu_min(75):.2f}  elec={E/EFF*1e3:.0f} mJ")
print("== v.1 (m=0.090 kg)")
for a in (45,51,55,60):
    v,E,h = jump(.090,.150,a);    print(f"JUMP 150mm @{a}deg    v={v:.2f} m/s  E={E*1e3:.1f} mJ  apex={h*1e3:.0f} mm  mu>={mu_min(a):.2f}")
print("== energy storage / battery")
Ee = jump(.120,.040,75)[1]/EFF
V = 5.0; C = 2*Ee/V**2;           print(f"cap bank for one LEAP @5V: C>={C*1e3:.1f} mF (use 22 mF => {0.5*.022*V*V*1e3:.0f} mJ)")
t = 0.005;                        print(f"peak elec power over 5 ms: {Ee/t:.0f} W  (~{Ee/t/3.7:.1f} A at 3.7 V => must be cap-buffered)")
batt = 0.150*3.7*3600;            print(f"150 mAh cell = {batt:.0f} J => ~{batt/Ee:,.0f} LEAPs (ignoring idle draw)")
print("== edge safety (2 hops overshoot)")
print("hop displacement 40 mm, bounce/slide allowance ~ 2x => 80 mm; ToF trigger must be >= 100 mm from edge, not 20 mm")
