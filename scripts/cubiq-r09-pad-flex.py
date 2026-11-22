#!/usr/bin/env python3
"""CUBIQ(tm) Quantum Cube v.0 — R09: pad ID timing, isolator selection, pad recoil/slip,
moving-part leads (rolling loop), ToF flex tabs. Stdlib only.
Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md §04-§06. Every input marked EST is a
placeholder for a bench number (B30, B31, B33-B35)."""
import math

G = 9.81
print("=" * 78)
print("A. QI IN-BAND PAD ID — HOW LONG DOES 'PLACED ON A LOT PAD' TAKE?  (R09 F67)")
print("=" * 78)
# TX->RX (pad to cube) is FSK: one bit per 512 cycles of the power carrier (EST, Qi-class).
# Bytes framed as start + 8 data + parity + stop = 11 bits (as Qi ASK framing; EST for FSK).
# RX->TX (cube to pad) is ASK at ~2 kbit/s.
F_OP = {"110 kHz (slow end)": 110e3, "128 kHz (typical)": 128e3, "148 kHz (fast end)": 148e3}
ASK_BPS = 2000.0
BITS_PER_BYTE = 11
STARTUP_S = {          # power-up to power transfer, EST
    "analog + digital ping": 0.070,
    "signal-strength packet (3 B ASK)": 3 * BITS_PER_BYTE / ASK_BPS,
    "identification packet (9 B ASK)": 9 * BITS_PER_BYTE / ASK_BPS,
    "configuration packet (7 B ASK)": 7 * BITS_PER_BYTE / ASK_BPS,
    "inter-packet gaps (3 x 7 ms)": 0.021,
}
REQUEST_S = 3 * BITS_PER_BYTE / ASK_BPS        # cube asks the pad for its LOT ID
startup = sum(STARTUP_S.values())
for k, v in STARTUP_S.items():
    print(f"  {k:36s} {v * 1000:6.1f} ms")
print(f"  {'startup total':36s} {startup * 1000:6.1f} ms     + LOT ID request (3 B ASK) {REQUEST_S * 1000:.1f} ms")
PAYLOADS = {
    "R08 sketch: model + full deck geometry (11 B)": 11,
    "R09: model + geometry INDEX + flags (3 B)": 3,
}
print(f"\n  {'payload':48s} " + "  ".join(f"{k.split()[0]:>9s}" for k in F_OP))
placement = {}
for name, n in PAYLOADS.items():
    bits = (1 + n + 1) * BITS_PER_BYTE          # header + payload + checksum
    row = []
    for fk, f in F_OP.items():
        t = startup + REQUEST_S + bits * 512 / f
        row.append(t)
    placement[name] = row
    print(f"  {name:48s} " + "  ".join(f"{t:7.2f} s" for t in row))
idx = placement["R09: model + geometry INDEX + flags (3 B)"]
print(f"\n  R08 F56 said ~0.1 s on the pad. The static look (0.1 s) runs in parallel, so placement")
print(f"  is set by the Qi handshake: {min(idx):.2f}-{max(idx):.2f} s with the 3-byte ID. Off-pad placement")
print(f"  is ~1.0 s (R05 G7 v0.2). The pad still saves ~{1.0 - max(idx):.1f} s and the 0.5 s probe tap; not ~0.9 s.")

print()
print("=" * 78)
print("B. PAD ISOLATORS — 4 VISCOELASTIC FEET FOR f_n = 20 Hz  (R09 F68)")
print("=" * 78)
M_PAD, M_CUBE = 0.590, 0.1135
M = M_PAD + M_CUBE
FN = 20.0
DYN_RATIO = 1.5            # dynamic / static stiffness of a soft viscoelastic PU (EST)
k_dyn_total = M * (2 * math.pi * FN) ** 2
k_dyn_foot = k_dyn_total / 4
k_st_foot = k_dyn_foot / DYN_RATIO
sag = (M * G / 4) / k_st_foot
print(f"  loaded mass {M * 1000:.1f} g · k_dyn {k_dyn_foot / 1000:.2f} N/mm per foot · "
      f"k_static {k_st_foot / 1000:.2f} N/mm per foot")
print(f"  static sag {sag * 1000:.2f} mm (R08 used g/w^2 = {G / (2 * math.pi * FN) ** 2 * 1000:.2f} mm, "
      f"which ignores the dynamic stiffening)")
# load split: cube on the home spot, 5 mm from the rear edge of a 160 mm deck; feet 10 mm in
DECK_L, FOOT_IN, HOME_GAP, CUBE = 0.160, 0.010, 0.005, 0.045
x_cube = DECK_L / 2 - HOME_GAP - CUBE / 2
x_cg = M_CUBE * x_cube / M
pitch = DECK_L - 2 * FOOT_IN
rear = (pitch / 2 + x_cg) / pitch / 2
front = 0.5 - rear
tilt = math.degrees(math.atan((rear - front) * 2 * sag / pitch))
print(f"  cube at home spot: CoG {x_cg * 1000:.1f} mm to the rear · rear feet {rear * 100:.1f} % each, "
      f"front {front * 100:.1f} % · deck tilt {tilt:.3f} deg (G1 limit 3 deg)")
print(f"\n  cylinder foot sizing, k = E(1 + 2S^2) A / t, S = d / 4t   (E = static Young's modulus, EST)")
print(f"  {'E MPa':>6s} {'t mm':>5s} {'d mm':>6s} {'t/d':>5s} {'strain':>7s}  verdict")
choice = None
for E in (0.25, 0.50):
    for t in (5.0, 6.0, 8.0):
        lo, hi = 0.5, 30.0
        for _ in range(60):                 # bisection on d
            d = (lo + hi) / 2
            S = d / (4 * t)
            k = E * 1e6 * (1 + 2 * S * S) * (math.pi * (d / 1000) ** 2 / 4) / (t / 1000)
            lo, hi = (d, hi) if k < k_st_foot else (lo, d)
        strain = sag * 1000 / t
        ok_slender = t / d <= 1.0
        ok_strain = 0.10 <= strain <= 0.20
        verdict = "OK" if ok_slender and ok_strain else ("slender (buckles)" if not ok_slender else "strain out of 10-20 %")
        print(f"  {E:6.2f} {t:5.1f} {d:6.2f} {t / d:5.2f} {strain * 100:6.1f} %  {verdict}")
        if verdict == "OK" and (choice is None or abs(strain - 0.15) < abs(choice[3] - 0.15)):
            choice = (E, t, d, strain)
E_C, T_C, D_C, _ = choice
print(f"  -> v0 FOOT: E {E_C} MPa class, {D_C:.1f} mm dia x {T_C:.0f} mm, 4 feet (passing row nearest 15 % strain)")

print()
print("=" * 78)
print("C. PAD RECOIL + SLIP ON THE TABLE DURING A LEAP  (R09 F69)")
print("=" * 78)
K_SPRING, STROKE = 2.39e3, 0.006            # plunger spring (R08 §02)
F_peak = K_SPRING * STROKE
AXIS = math.radians(30)                     # thrust 30 deg off vertical (R06 D20)
Fh, Fv = F_peak * math.sin(AXIS), F_peak * math.cos(AXIS)
N_push = M * G + Fv
mu_push = Fh / N_push
print(f"  during the push: peak plunger force {F_peak:.1f} N -> horizontal {Fh:.1f} N, vertical {Fv:.1f} N")
print(f"  normal on the pad feet {N_push:.1f} N -> needs mu >= {mu_push:.2f} to stay put")
RANGE, LAUNCH = 0.034, math.radians(60)     # LEAP on the pad (R08 §04), 60 deg launch
v = math.sqrt(RANGE * G / math.sin(2 * LAUNCH))
p = M_CUBE * v * math.cos(LAUNCH)
G_SHEAR = E_C * 1e6 / 3                     # incompressible elastomer
k_lat = 4 * DYN_RATIO * G_SHEAR * (math.pi * (D_C / 1000) ** 2 / 4) / (T_C / 1000)
w_lat = math.sqrt(k_lat / M_PAD)
v_pad = p / M_PAD
x_lat = v_pad / w_lat
F_lat = k_lat * x_lat
mu_after = F_lat / (M_PAD * G)
print(f"  launch {v:.2f} m/s at 60 deg -> horizontal momentum {p * 1000:.1f} mN*s into the pad")
print(f"  pad lateral mode {w_lat / 2 / math.pi:.1f} Hz on the feet -> sway {x_lat * 1000:.2f} mm, "
      f"foot shear {F_lat:.2f} N")
print(f"  after lift-off (cube in the air, pad alone): needs mu >= {mu_after:.2f}")
mu_need = max(mu_push, mu_after)
print(f"  BINDING: mu >= {mu_need:.2f}. Viscoelastic PU on clean glass or lacquer: >1 (EST). On dusty")
print(f"  glass it can fall toward 0.4 (EST). Spec: foot mu >= 0.6 on 6 surfaces incl. dusty glass (B30).")

print()
print("=" * 78)
print("D. LEADS TO THE MOVING MASS — ROLLING LOOP UNDER THE STATOR  (R09 F70-F71)")
print("=" * 78)
# IPC-2223-style minimum bend radius, single-sided flex: R = (c/2)(100/E_B - 1) - D
c, D_DIEL = 0.018, 0.050                    # 1/2 oz RA copper; polyimide + adhesive + cover (EST)
for label, EB in (("static (bend to install)", 16.0), ("dynamic (>1e6 cycles)", 0.3)):
    R = (c / 2) * (100 / EB - 1) - D_DIEL
    note = "" if R > 0.1 else "   (copper never limits; handling rule 6x thickness = 0.6 mm)"
    print(f"  {label:26s} E_B {EB:5.1f} %  -> R_min {max(R, 0):.2f} mm{note}")
R_LOOP = 3.0
S = 8.0                                     # reaction-mass stroke (R03)
Z_PCB_TOP, CLEAR = 5.6, 0.5
Z_ANCHOR = 14.4                             # stator bottom cap (R08 L7)
Z_MASS_MIN = 15.4                           # moving-mass bottom at the low end of travel (EST)
lo = Z_PCB_TOP + CLEAR
hi = Z_ANCHOR - R_LOOP - S / 2
print(f"  loop R {R_LOOP} mm, stroke {S} mm (loop bottom travels S/2 = {S / 2} mm)")
print(f"  loop bottom at the low end must sit in [{lo:.1f}, {hi:.1f}] mm  -> window {hi - lo:.1f} mm "
      f"{'FEASIBLE' if hi > lo else 'INFEASIBLE'}")
z0 = (lo + hi) / 2
L = (Z_ANCHOR - z0 - R_LOOP) + (Z_MASS_MIN - z0 - R_LOOP) + math.pi * R_LOOP
print(f"  at mid-window ({z0:.2f} mm) the loop is {L:.1f} mm of flex, 2R = {2 * R_LOOP:.0f} mm wide, placed at "
      f"x +2..+8 mm (sleeve at x <= +0.4 mm at z 14.4)")
# what the loop must carry, by actuator topology
CELL_A, COIL_A = 1.0, 1.5                   # cell charge/precharge peak; HOP coil pulse (EST)
RHO = 1.72e-8
for topo, amps, lines in (("moving MAGNET (coil fixed)", CELL_A, "cell +, cell -, NTC"),
                          ("moving COIL (magnet fixed)", COIL_A, "cell +, cell -, NTC, coil +, coil -")):
    w = 1.0e-3
    r_trace = RHO * (L / 1000 + 0.010) / (c / 1000 * w)
    print(f"  {topo:28s} carries {lines:36s} peak {amps:.1f} A, {amps ** 2 * 2 * r_trace * 1000:.0f} mW in the loop")
print(f"  -> moving-magnet: only the cell rides the loop; coil leads stay static (F70)")

print()
print("=" * 78)
print("E. ToF FLEX TABS — BENDS, EDGES, THE REAR TAB  (R09 F72)")
print("=" * 78)
T_FLEX2 = 0.20                              # 2-layer flex, total (EST)
R_TAB = 10 * T_FLEX2                        # static rule of thumb, 2-layer: 10x thickness
WALL_IN = 21.5
STATOR_R = 13.0
print(f"  2-layer flex {T_FLEX2} mm -> static bend R >= {R_TAB:.1f} mm; radial room stator to wall "
      f"{WALL_IN - STATOR_R:.1f} mm -> fits")
pcb_edge_max = WALL_IN - R_TAB - 0.2 - 0.5
print(f"  front (+x) tab folds off the PCB edge: edge at x <= {pcb_edge_max:.1f} mm; IMU ends at x +17.0 -> "
      f"{pcb_edge_max - 17.0:.1f} mm clear")
print(f"  side (+-y) tabs fold off the PCB side edges (PCB spans the cam and supercap pockets' floor)")
# rear: PCB starts at x -4 (R08 L10), the sleeve passes behind it; no edge at the -x wall
run_floor = (-4.0) - (-WALL_IN + R_TAB)
run_wall = 22.0 - 3.4 - R_TAB
tail = run_floor + run_wall + math.pi / 2 * R_TAB + 6.0
print(f"  rear (-x) tab: NO PCB EDGE at the -x wall (PCB starts at x -4, L10). Tail from the PCB's")
print(f"  -y corner along the floor at y -15 (sleeve at |y| <= 4, yoke at y 0): {run_floor:.1f} mm floor run,")
print(f"  90 deg bend, {run_wall:.1f} mm up the wall -> tail ~{tail:.0f} mm incl. a 6 mm service fold")
