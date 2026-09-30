// CUBIQ(TM) v.0 — ballistic + energy budget model. Run: node scripts/cubiq/hop-model.mjs
// Companion to docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-DEV02.md. Vacuum-ballistic; ignores drag and bounce.
const g = 9.81;
const deg = (d) => (d * Math.PI) / 180;

// launch: mass (kg), angle from horizontal (deg), target range (m) -> speed, energy, apex
function forRange(m, angleDeg, range) {
  const v = Math.sqrt((range * g) / Math.sin(2 * deg(angleDeg)));
  return { v, keJ: 0.5 * m * v * v, apexMm: ((v * Math.sin(deg(angleDeg))) ** 2 / (2 * g)) * 1000 };
}
function forApex(m, apex) {
  const v = Math.sqrt(2 * g * apex);
  return { v, keJ: m * g * apex };
}
// slug-impact launcher: slug ms hits shell (inelastic), whole body leaves at v
const slugSpeed = (M, ms, v) => (M * v) / ms;
// acoustic standing-wave levitation, order-of-magnitude: radiation pressure ~ p^2/(rho c^2)
function acousticSPL(massKg, areaM2) {
  const rhoC2 = 1.2 * 343 * 343;
  const p = Math.sqrt(((massKg * g) / areaM2) * rhoC2);
  return { pPa: p, splDb: 20 * Math.log10(p / 20e-6) };
}
const row = (k, v) => console.log(k.padEnd(46), v);
const f = (x, d = 3) => Number(x).toFixed(d);

console.log('--- v.0 HOP (120 g, <10 mm rise)');
let r = forApex(0.12, 0.010); row('launch speed m/s', f(r.v)); row('kinetic energy mJ', f(r.keJ * 1e3, 1));
console.log('--- v.0 LEAP (120 g, 40 mm range, 75deg from horiz = 15deg bias)');
r = forRange(0.12, 75, 0.040); row('launch speed m/s', f(r.v)); row('kinetic energy mJ', f(r.keJ * 1e3, 1)); row('apex mm (vs "<10 mm" hop)', f(r.apexMm, 1));
console.log('--- v.0 LEAP at 5deg bias (85deg)');
r = forRange(0.12, 85, 0.040); row('launch speed m/s', f(r.v)); row('kinetic energy mJ', f(r.keJ * 1e3, 1)); row('apex mm', f(r.apexMm, 1));
console.log('--- v.1 LONG JUMP (90 g, 150 mm, 45deg)');
r = forRange(0.09, 45, 0.150); row('launch speed m/s', f(r.v)); row('kinetic energy mJ', f(r.keJ * 1e3, 1)); row('apex mm', f(r.apexMm, 1));
console.log('--- slug-impact launcher for v.0 LEAP (30 g slug, 120 g body)');
r = forRange(0.12, 75, 0.040);
const vs = slugSpeed(0.12, 0.03, r.v); const slugKE = 0.5 * 0.03 * vs * vs;
row('slug speed m/s', f(vs)); row('slug KE mJ', f(slugKE * 1e3, 1)); row('efficiency (body KE / slug KE)', f(r.keJ / slugKE, 2));
const strokeM = 0.015; row('voice-coil mean force over 15 mm stroke N', f(slugKE / strokeM, 1));
console.log('--- spring + latch alternative (store energy slowly)');
const eStore = slugKE; row('energy to store per leap mJ (use slug figure)', f(eStore * 1e3, 1));
row('micro-motor power to recharge in 1.0 s W', f(eStore / 1.0, 2));
const battJ = 0.3 * 3.7 * 3600; row('300 mAh @3.7 V battery J', f(battJ, 0));
row('leaps per charge at 25% drivetrain eff', f((battJ * 0.25) / eStore, 0));
console.log('--- acoustic levitation feasibility (45x45 mm face)');
for (const [label, m] of [['120 g cube', 0.12], ['20 g hollow cube', 0.02], ['5 g cube', 0.005]]) {
  const a = acousticSPL(m, 0.045 * 0.045); row(`${label}: required SPL dB`, f(a.splDb, 0));
}
