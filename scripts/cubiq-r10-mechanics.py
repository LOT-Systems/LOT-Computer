#!/usr/bin/env python3
"""CUBIQ(tm) v.0 R10: v.1 rocker + torsion spring, v.2 yaw actuator (the missing part), and the
moving-deck envelope behind contract v0.6-draft G11. Stdlib only.
Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md §03-§05.
All inputs marked EST are placeholders for bench measurement, not datasheet values."""
import math
import random

G = 9.81
A = 0.045                      # cube edge, m
M_R09 = 0.1087                 # R09 mass budget v0.7 with D48 (moving magnet), kg
M_V1_TARGET = 0.090            # v.1 target (R01)
TRANSFER = 0.70                # spring -> body KE (R03, EST)
STROKE_V1 = 0.010              # v.1 plunger stroke (R06 D28)
E_LEAP_V0 = 0.043              # v.0 LEAP spring energy (R07 §03)
ARM_LEAP_V0 = 1.1              # s, cam arm time for the v.0 LEAP (R08 FSM v0.3 T["ARM"])
AXIAL_ROOM = 16.6              # mm along the thrust line, contact point -> stator (R08 F51 after raise)
CLEAR = 0.5                    # mm clearance used throughout R08
E_STEEL = 196e9                # music wire modulus, Pa
G_STEEL = 79.3e9               # music wire shear modulus, Pa


def sut_music_wire(d_mm):
    """Shigley: Sut = A / d^m, music wire A = 2211 MPa*mm^m, m = 0.145."""
    return 2211.0 / d_mm ** 0.145


def ballistic(m, rng, elev_deg=60.0):
    th = math.radians(elev_deg)
    v2 = G * rng / math.sin(2 * th)
    vy = math.sqrt(v2) * math.sin(th)
    return 0.5 * m * v2, 2 * vy / G


def solve_d(stress_fn, allow_frac, lo=0.2, hi=4.0):
    """Smallest wire diameter (mm) whose stress is <= allow_frac * Sut(d)."""
    for _ in range(60):
        mid = (lo + hi) / 2
        if stress_fn(mid) <= allow_frac * sut_music_wire(mid):
            hi = mid
        else:
            lo = mid
    return hi


# ---------------------------------------------------------------------------------------------
print("== F81: v.1 LONG JUMP SPRING — axial compression vs rocker + torsion spring ==")
print("  stroke 10 mm (R06 D28), launch 60°, transfer 70 % (R03), axial room 16.6 mm (R08 F51)")
MU_GUIDE = 0.15                # EST: roller on a PTFE-bushed rod
cases = []
for m, tag in ((M_R09, "108.7 g (R09+D48)"), (M_V1_TARGET, " 90.0 g (v.1 target)")):
    for rng_mm in (150, 200):
        ke, t_fl = ballistic(m, rng_mm / 1000)
        cases.append((tag, rng_mm, ke, t_fl))

C = 6.0                        # spring index D/d (EST, common)
for tag, rng_mm, ke, _ in cases:
    print(f"  -- {tag}, {rng_mm} mm: body KE {ke*1e3:5.1f} mJ")
    # (1) axial compression spring, R08 floating sleeve
    e_s = ke / TRANSFER
    F = 2 * e_s / STROKE_V1                                       # N, linear spring from zero
    kw = lambda c: (4 * c - 1) / (4 * c - 4) + 0.615 / c          # Wahl
    tau = lambda d: kw(C) * 8 * F * C / (math.pi * (d / 1000) ** 2) / 1e6
    d = solve_d(tau, 0.45)                                        # 0.45 Sut: shear, set-removed
    D = C * d
    k = F / (STROKE_V1 * 1000)                                    # N/mm
    n_act = G_STEEL * (d / 1000) ** 4 / (8 * (D / 1000) ** 3 * k * 1000)
    solid = (n_act + 2) * d
    free = solid + STROKE_V1 * 1000 + 0.15 * STROKE_V1 * 1000     # 15 % clash allowance
    floating = 2 + free + 1
    fixed = 2 + solid + 0.15 * 10 + 1
    print(f"     (1) axial compression: F {F:4.1f} N  k {k:4.2f} N/mm  d {d:4.2f} mm  D {D:4.1f} mm  "
          f"{n_act:4.1f} coils  free {free:4.1f} mm")
    print(f"         stack fixed sleeve {fixed:4.1f} mm, floating {floating:4.1f} mm vs room {AXIAL_ROOM} "
          f"-> {'fits' if floating + CLEAR <= AXIAL_ROOM else 'CLASH %.1f mm' % (floating + CLEAR - AXIAL_ROOM)}")
    # (2) rocker + torsion spring at the pivot, driving a guided tip rod
    for L in (10, 12, 16):
        theta = STROKE_V1 * 1000 / L                              # rad of arm swing (small-angle on a roller)
        # rod guide sets direction; roller side load ~ F tan(phi), phi sweeps -theta/2..+theta/2
        mean_tan = sum(abs(math.tan(-theta / 2 + theta * i / 200)) for i in range(201)) / 201
        eta = 1 - MU_GUIDE * mean_tan
        e_s2 = ke / (TRANSFER * eta)
        Mpk = 2 * e_s2 / theta                                    # N*m, linear torsion from zero
        ki = (4 * C * C - C - 1) / (4 * C * (C - 1))
        sig = lambda d: ki * 32 * Mpk / (math.pi * (d / 1000) ** 3) / 1e6
        d2 = solve_d(sig, 0.55)                                   # 0.55 Sut: bending, ~1e5 cycles EST
        D2 = C * d2
        k_t = Mpk / theta
        n_t = E_STEEL * (d2 / 1000) ** 4 / (64 * (D2 / 1000) * k_t)
        body = (n_t + 1) * d2
        rod_top = 10 + 4 + 1                                      # stroke + 4 mm guide engagement + roller cap
        cases_ok = rod_top + CLEAR <= AXIAL_ROOM
        print(f"     (2) rocker L {L:2d} mm: swing {math.degrees(theta):4.1f}°  eta {eta:4.2f}  spring {e_s2*1e3:5.1f} mJ  "
              f"M {Mpk*1e3:4.0f} N·mm  d {d2:4.2f}  OD {D2+d2:4.1f}  {n_t:3.1f} turns  body {body:4.1f} mm  "
              f"rod {rod_top} mm {'fits' if cases_ok else 'CLASH'}")
    # double torsion spring at L 12 mm: two coils in parallel, each carries half the torque
    L = 12
    theta = STROKE_V1 * 1000 / L
    mean_tan = sum(abs(math.tan(-theta / 2 + theta * i / 200)) for i in range(201)) / 201
    Mh = 2 * (ke / (TRANSFER * (1 - MU_GUIDE * mean_tan))) / theta / 2
    ki = (4 * C * C - C - 1) / (4 * C * (C - 1))
    d3 = solve_d(lambda d: ki * 32 * Mh / (math.pi * (d / 1000) ** 3) / 1e6, 0.55)
    gap = 14.4 - 5.6                                              # stator bottom (R08 L7) - PCB top (R08)
    od3 = (C + 1) * d3
    print(f"     double torsion, L 12: d {d3:4.2f} mm  OD {od3:4.1f} mm  vs under-stator gap {gap:.1f} mm "
          f"-> {'fits' if od3 + CLEAR <= gap + 1e-9 else 'CLASH %.1f mm' % (od3 + CLEAR - gap)}")
    arm = ARM_LEAP_V0 * e_s / E_LEAP_V0
    print(f"     cam arm time at the v.0 motor: {arm:4.1f} s  (v.0 LEAP 1.1 s for 43 mJ)")
print("  pivot clearance -> stroke error: c 0.05 mm on L 12 mm = 0.24° of swing -> "
      f"energy {2*0.05/10*100:.0f} % -> range ~1 %  (direction is set by the rod guide, not the pivot)")

# ---------------------------------------------------------------------------------------------
print("== F82: v.2 YAW — the part every cross-track run since R04 assumed ==")
print("  R04-R07 traverses re-aim by a 'small yaw step before every hop'. R05 F24 removed the only")
print("  yaw mechanism (piezo: 3.2 mdeg per stroke). Nothing in layout v0.2 can turn the cube.")
I_B = M_R09 * A ** 2 / 6
ring_od, ring_id, ring_t, rho = 0.030, 0.026, 0.002, 7850.0      # steel rotor ring, EST
m_w = math.pi * ((ring_od / 2) ** 2 - (ring_id / 2) ** 2) * ring_t * rho
I_W = 0.5 * m_w * ((ring_od / 2) ** 2 + (ring_id / 2) ** 2)
M_STATOR_DRV = 0.0035                                              # outrunner stator, rotor magnets, driver, EST
T_MAX = 0.006                                                      # N*m continuous-peak, EST
I_B2 = (M_R09 + m_w + M_STATOR_DRV) * A ** 2 / 6
ratio = (I_B2 + I_W) / I_W
print(f"  rotor ring Ø30/Ø26 × 2 mm steel: {m_w*1e3:4.1f} g, I_w {I_W*1e9:5.0f} g·mm²; "
      f"body I_z {I_B2*1e9:6.0f} g·mm²; ratio {ratio:4.1f}")
print(f"  mass +{(m_w+M_STATOR_DRV)*1e3:4.1f} g -> cube {(M_R09+m_w+M_STATOR_DRV)*1e3:5.1f} g "
      f"(cap 120 g, margin {(0.120-M_R09-m_w-M_STATOR_DRV)*1e3:3.1f} g)")


def hop_flight(range_mm, elev=60.0):
    if range_mm == 0:
        return 2 * math.sqrt(2 * 0.010 / G)                         # HOP in place, 10 mm rise
    return ballistic(1.0, range_mm / 1000, elev)[1]


print("  IN-FLIGHT TURN: feet off the table, no friction; wheel spun up and back to rest relative to")
print("  the body inside 80 % of the flight. Body angle = wheel angle / ratio, exactly (encoder counts).")
print("    hop                 flight   turn   wheel angle  peak speed   torque    max turn @ 6 mN·m")
for hop_mm, turn in ((0, 20.0), (20, 5.0), (20, 20.0), (40, 5.0), (40, 20.0)):
    t = 0.8 * hop_flight(hop_mm)
    phi = math.radians(turn) * ratio
    w_pk = 2 * phi / t
    torque = I_W * 4 * phi / t ** 2
    phi_max = (T_MAX / I_W) * t ** 2 / 4
    print(f"    {('HOP in place' if hop_mm == 0 else f'{hop_mm} mm @60°'):18s} {t/0.8*1e3:5.0f} ms  {turn:4.0f}°  "
          f"{phi/(2*math.pi):5.2f} rev   {w_pk*60/(2*math.pi):6.0f} rpm  {torque*1e3:5.2f} mN·m   "
          f"{math.degrees(phi_max/ratio):5.1f}°")
print("  max turn per hop = T·t²/(4·I_body) to first order: it is set by motor TORQUE, not by the wheel's")
print("  inertia. The wheel only sets the speed. So the ring is sized light, and the motor is sized for torque.")
mu, r_feet = 0.5, 0.0177
T_fric = mu * (M_R09 + m_w + M_STATOR_DRV) * G * r_feet
print(f"  ON THE TABLE: foot friction torque {T_fric*1e3:4.1f} mN·m > motor {T_MAX*1e3:.0f} mN·m, so the wheel can't twist")
print("  the cube on its feet at all. It turns only in flight. A cube that can't scrub its feet can't scuff a table.")
print("  y-axis launch pair (the R08/R09 alternative), EST: 2 more plunger modules 2 × 5.5 g + a second")
print("  cam module 6 g = +17 g, and both side pockets (cam +y, supercap −y) are already full. Rejected.")

print("  200 mm traverse re-run (R07 F44 model: 20 mm hops, lateral ToF σ 5 mm, slip 0.5 mm, N 20000):")
random.seed(10)


def traverse(hop_mm, sig_tof, sig_slip, sig_yaw, max_aim, gain=0.8, n=20000, sig_range=0.10):
    final, worst = [], []
    for _ in range(n):
        y = peak = 0.0
        for _ in range(math.ceil(200 / hop_mm)):
            aim = math.atan2(-gain * (y + random.gauss(0, sig_tof)), hop_mm)
            aim = max(-math.radians(max_aim), min(math.radians(max_aim), aim))
            h = aim + math.radians(random.gauss(0, sig_yaw))
            y += hop_mm * (1 + random.gauss(0, sig_range)) * math.sin(h) + random.gauss(0, sig_slip)
            peak = max(peak, abs(y))
        final.append(abs(y)); worst.append(peak)
    final.sort(); worst.sort()
    return final[int(0.98 * n)], worst[int(0.98 * n)]


t20 = 0.8 * hop_flight(20)
max_turn20 = math.degrees((T_MAX / I_W) * t20 ** 2 / 4 / ratio)
print("    yaw source                                yaw σ   aim clip   p98 final   p98 worst   gate <15")
for label, sy, clip in (("R07 F44 assumption (unspecified actuator)", 3.0, 20.0),
                        ("wheel: landing yaw slip 1.0° + trim 0.3°", math.hypot(1.0, 0.3), max_turn20),
                        ("wheel, pessimistic slip 2.0°", math.hypot(2.0, 0.3), max_turn20)):
    f, w = traverse(20, 5.0, 0.5, sy, clip)
    print(f"    {label:42s} {sy:4.2f}°   ±{clip:4.1f}°    {f:5.1f} mm    {w:5.1f} mm    {'PASS' if w < 15 else 'FAIL'}")

# ---------------------------------------------------------------------------------------------
print("== F80: MOVING DECK — what a moored boat does to each gesture ==")
H_ROLL = 0.6                   # m, roll centre to table top, narrowboat-class EST
EDGE_MARGIN = 20.0             # mm, R02 edge-ladder margin
STILL_A = 0.02                 # m/s^2, R05 placement 'still' threshold EST
gestures = (("HOP in place", hop_flight(0)), ("LEAP 40 mm @60°", hop_flight(40)),
            ("JUMP 150 mm @60° (v.1)", hop_flight(150)), ("JUMP 200 mm @60° (v.1)", hop_flight(200)))
print(f"  roll centre {H_ROLL} m below the table (EST). Deck acceleration a = h·θa·ω²; tilt rate θa·ω.")
print("    roll amp  period   deck a      vs 'still'   class")
envelope = []
for amp, per in ((0.5, 4.0), (1.0, 3.0), (2.0, 2.5), (2.0, 2.0), (4.0, 2.0), (6.0, 1.5)):
    w = 2 * math.pi / per
    a = H_ROLL * math.radians(amp) * w * w
    cls = "gentle" if (amp <= 2.0 and per >= 2.0) else "rough"
    envelope.append((amp, per, a, w, cls))
    print(f"    ±{amp:3.1f}°    {per:3.1f} s   {a:5.3f} m/s²   ×{a/STILL_A:4.1f}  {'fails' if a > STILL_A else 'passes'}   {cls}")
print("  -> R05 placement step 1 ('still for ≥ 2 s') fails from about ±1° of roll: G7 unplaced, SETTLE")
print("     only, for as long as the water moves. v0.6 placement: still RELATIVE TO THE SURFACE (ToF ranges steady) + motion class.")
a_g, w_g = max((e[2], e[3]) for e in envelope if e[4] == "gentle")
amp_g = 2.0
print(f"  worst GENTLE case (±2°, 2.0 s, a {a_g:4.3f} m/s²), landing shift = ½·a·t², tilt change = θa·ω·t:")
print("    gesture                  flight    shift    tilt Δ   share of 20 mm edge margin   verdict")
for name, t in gestures:
    shift = 0.5 * a_g * t * t * 1000
    dtilt = amp_g * w_g * t
    share = shift / EDGE_MARGIN
    ok = share <= 0.25
    print(f"    {name:24s} {t*1e3:5.0f} ms  {shift:5.1f} mm   {dtilt:4.2f}°    {share*100:4.0f} %                       "
          f"{'allowed' if ok else 'CAP -> LEAP'}")
print("  rule (G11): gentle caps JUMP at LEAP; rough defers like G9; > 5 Hz content is G9 (engine).")
