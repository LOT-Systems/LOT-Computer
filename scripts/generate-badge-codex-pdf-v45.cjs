'use strict';
// LOT Systems — Badge Codex PDF Generator v45
// The Mirror Forge — Word Turn Engine v35
// pdfkit dark-theme A4 document

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'docs', 'badges', 'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v45.pdf');

const C = {
  bg:      '#0a0a0a',
  text:    '#d4d4d4',
  gold:    '#ffcc44',
  mirror:  '#88aacc',
  shadow:  '#664488',
  forge:   '#cc6644',
  accent:  '#4a9fff',
  dim:     '#666666',
  white:   '#ffffff',
  cosmic:  '#ff88ff',
  epic:    '#aa66ff',
  legendary: '#ffaa22',
  mythic:  '#ff4488',
  rare:    '#44aaff',
  uncommon:'#44cc88',
  common:  '#888888',
};

const doc = new PDFDocument({
  size: 'A4',
  margin: 48,
  info: {
    Title: 'LOT Badges & Achievements Master Codex v45 — The Mirror Forge',
    Author: 'Vadik Marmeladov, LOT Systems Corporation',
    Subject: 'Word Turn Engine v35 · Mirror · Reflection · Shadow Work · Identity Forging',
    Keywords: 'LOT, badges, achievements, RPG, self-care, mirror forge, shadow work',
    Creator: 'LOT Systems PDF Engine',
  },
});

const stream = fs.createWriteStream(OUT_PATH);
doc.pipe(stream);

let y = 48;
const LM = 48;
const PW = doc.page.width - LM * 2;

function newPage() {
  doc.addPage();
  y = 48;
  initPage();
}

function initPage() {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);
}

function hr(yp, color = C.dim) {
  doc.moveTo(LM, yp).lineTo(LM + PW, yp).strokeColor(color).lineWidth(0.5).stroke();
}

function h1(text, yp) {
  doc.font('Courier-Bold').fontSize(16).fillColor(C.gold).text(text, LM, yp, { width: PW });
  return yp + 28;
}

function h2(text, yp, color = C.mirror) {
  doc.font('Courier-Bold').fontSize(12).fillColor(color).text(text, LM, yp, { width: PW });
  return yp + 20;
}

function h3(text, yp, color = C.accent) {
  doc.font('Courier-Bold').fontSize(10).fillColor(color).text(text, LM, yp, { width: PW });
  return yp + 16;
}

function body(text, yp, color = C.text, indent = 0) {
  doc.font('Courier').fontSize(8).fillColor(color).text(text, LM + indent, yp, { width: PW - indent });
  const h = doc.heightOfString(text, { width: PW - indent, font: 'Courier', size: 8 });
  return yp + h + 3;
}

function mono(text, yp, color = C.dim) {
  doc.font('Courier').fontSize(7).fillColor(color).text(text, LM, yp, { width: PW });
  const h = doc.heightOfString(text, { width: PW, font: 'Courier', size: 7 });
  return yp + h + 2;
}

function badgeRow(symbol, name, rarity, trigger, yp) {
  const rarityColor = {
    common: C.common, uncommon: C.uncommon, rare: C.rare,
    epic: C.epic, legendary: C.legendary, mythic: C.mythic, cosmic: C.cosmic,
  }[rarity.toLowerCase()] || C.text;

  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.forge).text(symbol.padEnd(10), LM, yp, { continued: true, width: 72 });
  doc.fillColor(C.white).text(name.padEnd(24), { continued: true, width: 144 });
  doc.fillColor(rarityColor).text(rarity.toUpperCase().padEnd(10), { continued: true, width: 72 });
  doc.fillColor(C.dim).text(trigger, { width: PW - 288 });
  return yp + 13;
}

// ── PAGE 1: COVER ──────────────────────────────────────────────────────────────
initPage();

// Title block
doc.rect(LM, y, PW, 180).fillColor('#111122').fill();
doc.rect(LM, y, PW, 2).fillColor(C.mirror).fill();
doc.rect(LM, y + 178, PW, 2).fillColor(C.mirror).fill();

y += 14;
doc.font('Courier-Bold').fontSize(9).fillColor(C.dim)
   .text('L · O · T   S Y S T E M S   C O R P O R A T I O N', LM, y, { width: PW, align: 'center' });
y += 18;
doc.font('Courier-Bold').fontSize(20).fillColor(C.gold)
   .text('BADGES & ACHIEVEMENTS', LM, y, { width: PW, align: 'center' });
y += 26;
doc.font('Courier-Bold').fontSize(18).fillColor(C.gold)
   .text('MASTER CODEX — v45', LM, y, { width: PW, align: 'center' });
y += 22;
doc.font('Courier-Bold').fontSize(12).fillColor(C.mirror)
   .text('THE MIRROR FORGE', LM, y, { width: PW, align: 'center' });
y += 16;
doc.font('Courier').fontSize(9).fillColor(C.shadow)
   .text('Word Turn Engine v35 · Reflection · Shadow Work · Identity Forging', LM, y, { width: PW, align: 'center' });
y += 16;
doc.font('Courier').fontSize(8).fillColor(C.dim)
   .text('│·│·│  MIRROR GATE   ◈·│·◈  PRISM LOCK   ≈≈·●·≈≈  ECHO DEPTH', LM, y, { width: PW, align: 'center' });
y += 18;
doc.font('Courier').fontSize(8).fillColor(C.text)
   .text('v44 → v45: +31 badges (1184 → 1215 total)', LM, y, { width: PW, align: 'center' });
y += 14;
doc.font('Courier-Bold').fontSize(7).fillColor(C.dim)
   .text('RPG · SCI-FI · SHADOW WORK · IDENTITY FORGING', LM, y, { width: PW, align: 'center' });
y += 24;

// Quote
doc.font('Courier').fontSize(8).fillColor(C.mirror)
   .text('"ENTER THE MIRROR FORGE.', LM, y, { width: PW, align: 'center' });
y += 12;
doc.font('Courier').fontSize(8).fillColor(C.mirror)
   .text('WHAT YOU SEE REFLECTED IS NOT THE PAST.', LM, y, { width: PW, align: 'center' });
y += 12;
doc.font('Courier').fontSize(8).fillColor(C.mirror)
   .text('IT IS THE VERSION OF YOU THAT CHOSE TO LOOK."', LM, y, { width: PW, align: 'center' });
y += 30;

// System overview table
hr(y, C.mirror); y += 8;
y = h2('BADGE SYSTEM OVERVIEW — v45', y);
y += 4;

const catTable = [
  ['Milestone',       '22',   'Streak days (v1–v4)'],
  ['Time Easter Eggs','31',   'Check-in at special hours (v1–v22)'],
  ['Calendar Easter', '109',  'Check-in on special dates (v1–v33)'],
  ['Word Turns',      '420',  'Words detected in journals/memory (v1–v35)'],
  ['Behavioral',      '120',  'Patterns over time (v1–v32)'],
  ['Achievement RPG', '198',  'Milestone combinations (v1–v33)'],
  ['Mastery Tiers',   '140',  'Epic depth milestones (v1–v35)'],
  ['Secret Boss',     '122',  'Hidden LEGENDARY/MYTHIC triggers (v1–v32)'],
];

for (const [cat, count, desc] of catTable) {
  doc.font('Courier').fontSize(8);
  doc.fillColor(C.mirror).text(cat.padEnd(20), LM, y, { continued: true, width: 144 });
  doc.fillColor(C.gold).text(count.padStart(6), { continued: true, width: 48 });
  doc.fillColor(C.dim).text('  ' + desc, { width: PW - 200 });
  y += 13;
}

hr(y, C.mirror); y += 6;
doc.font('Courier-Bold').fontSize(9).fillColor(C.gold)
   .text('TOTAL: 1215 badges — The Complete LOT Badge Universe — v45', LM, y, { width: PW });
y += 20;

// Metadata
doc.font('Courier').fontSize(7).fillColor(C.dim)
   .text('Session: LOT-SR-20260917-CODEX-v45 · Author: Vadik Marmeladov · © 2025–2026 LOT Systems Corporation', LM, y, { width: PW });

// ── PAGE 2: WORD TURN v35 ──────────────────────────────────────────────────────
newPage();
y = h1('WORD TURN v35 — THE MIRROR FORGE', y);
hr(y, C.mirror); y += 8;

y = h2('Theme: Reflection · Shadow Work · Identity Forging', y, C.shadow);
y += 4;

y = body('"The Mirror Forge vocabulary was assembled by observing the moments practitioners', y, C.text);
y = body('shift from description to integration. Mirror is the first contact. Shadow is the', y, C.text);
y = body('naming. Fracture is where the pattern breaks open — revealingly. And forge is the', y, C.text);
y = body('moment the practitioner stops observing and starts building."', y, C.text);
y += 8;

hr(y, C.dim); y += 6;
y = h3('WORD TURN v35 BADGES', y);
y += 4;

// Header row
doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    '.padEnd(10), LM, y, { continued: true, width: 72 });
doc.text('BADGE ID'.padEnd(24), { continued: true, width: 144 });
doc.text('RARITY'.padEnd(10), { continued: true, width: 72 });
doc.text('TRIGGER', { width: PW - 288 });
y += 13;
hr(y, C.dim); y += 4;

const wt35 = [
  ['│·│·│',    'mirror_touched',    'uncommon',  '"mirror" in journal'],
  ['◈·~·◈',    'reflection_signal', 'uncommon',  '"reflection" in journal'],
  ['▓·│·▓',    'shadow_named',      'rare',      '"shadow" in journal'],
  ['│·◈·│',    'duality_held',      'rare',      '"duality" in journal'],
  ['○·│·○',    'clarity_flash',     'uncommon',  '"clarity" in journal'],
  ['×·│·×',    'fracture_point',    'epic',      '"fracture" in journal'],
  ['◈·│·◈',    'prism_sight',       'rare',      '"prism" in journal'],
  ['≈·│·≈',    'echo_return',       'rare',      '"echo" in journal'],
  ['■·│·■',    'identity_claimed',  'epic',      '"identity" in journal'],
  ['~·│·~',    'veil_lifted',       'rare',      '"veil" in journal'],
  ['○·◈·○',    'reveal_gate',       'rare',      '"reveal" in journal'],
  ['▓·◈·▓',    'forge_active',      'legendary', '"forge" in journal'],
];

for (const [sym, id, rar, trig] of wt35) {
  y = badgeRow(sym, id, rar, trig, y);
}

y += 8;
hr(y, C.mirror); y += 8;
y = h2('SELF-CARE RESONANCE GUIDE', y, C.mirror);
y += 4;

const resonance = [
  ['mirror',     'Looking at yourself without flinching. The entry that describes you as you actually are.'],
  ['reflection', 'The cognitive step after observation. Not just logging — processing. Meaning-making.'],
  ['shadow',     'Naming the unintegrated part. The thing you do in others you have not accepted in yourself.'],
  ['duality',    'Holding two truths simultaneously. "I am tired AND I am grateful." Both/and wisdom.'],
  ['clarity',    'The moment after confusion. "I finally see..." Complexity resolved, not removed.'],
  ['fracture',   'The productive break. The crack in the armor that shows what the armor protected.'],
  ['prism',      'Seeing one event through multiple lenses. Emotional, logical, historical, forward.'],
  ['echo',       'The repeated pattern. "This is the third time I have written about this." Recognition.'],
  ['identity',   'The practitioner naming themselves. Not their roles — their actual sense of self.'],
  ['veil',       'The thing being removed. Pre-clarity named retrospectively. Enormous self-awareness.'],
  ['reveal',     'The active form of veil. Chosen exposure. The practitioner has decided to see.'],
  ['forge',      'The transformation word. Not discovery, not observation — construction. "I am making myself."'],
];

for (const [word, desc] of resonance) {
  doc.font('Courier-Bold').fontSize(7.5).fillColor(C.forge).text(word.padEnd(14), LM, y, { continued: true, width: 100 });
  doc.font('Courier').fontSize(7.5).fillColor(C.text).text(desc, { width: PW - 100 });
  y += 13;
}

// ── PAGE 3: CALENDAR + BEHAVIORAL + ACHIEVEMENT ────────────────────────────────
newPage();
y = h1('CALENDAR · BEHAVIORAL · ACHIEVEMENT — v45', y);
hr(y, C.mirror); y += 8;

// Calendar EE v33
y = h2('CALENDAR EASTER EGGS v33 — THE REFLECTION CALENDAR', y, C.gold);
y += 4;

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(22), { continued: true, width: 132 });
doc.text('DATE  ', { continued: true, width: 48 });
doc.text('RARITY  ', { continued: true, width: 60 });
doc.text('OCCASION', { width: PW - 312 });
y += 13;
hr(y, C.dim); y += 4;

const calv33 = [
  ['◈·│·◈', 'narcissus_day',   'Apr 18', 'rare',  'National Mirror Day (USA)'],
  ['▓·│·▓', 'shadow_day',      'Nov 2',  'rare',  'Dia de los Muertos — shadow/ancestor'],
  ['∞·◈·∞', 'solstice_mirror', 'Dec 21', 'epic',  'Winter Solstice — longest night'],
];

for (const [sym, id, date, rar, occ] of calv33) {
  const rc = { rare: C.rare, epic: C.epic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.gold).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(C.dim).text(date.padEnd(6), { continued: true, width: 48 });
  doc.fillColor(rc).text(rar.toUpperCase().padEnd(8), { continued: true, width: 60 });
  doc.fillColor(C.text).text(occ, { width: PW - 312 });
  y += 13;
}

y += 8;
y = body('Narcissus Day (Apr 18): The myth is navigational — learn the difference between', y, C.dim, 0);
y = body('self-knowledge and self-obsession. Shadow Day (Nov 2): The ancestors live in the', y, C.dim, 0);
y = body('patterns. Name what you inherited — that is how you choose. Solstice Mirror (Dec 21):', y, C.dim, 0);
y = body('The longest night is the deepest forge. The practitioner who marks this threshold', y, C.dim, 0);
y = body('is marking the annual turning point.', y, C.dim, 0);
y += 8;

hr(y, C.dim); y += 8;

// Behavioral v32
y = h2('BEHAVIORAL BADGES v32 — MIRROR PATTERNS', y, C.mirror);
y += 4;

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(22), { continued: true, width: 132 });
doc.text('RARITY  ', { continued: true, width: 60 });
doc.text('TRIGGER', { width: PW - 264 });
y += 13;
hr(y, C.dim); y += 4;

const bv32 = [
  ['│·●·│', 'mirror_session',     'rare', '3+ Word Turn v35 words in one session'],
  ['◈·■·◈', 'deep_reflection',    'epic', '7+ Word Turn v35 words across 7 sessions'],
  ['×·◈·×', 'fracture_point_bx',  'rare', '"fracture" + "clarity" in same entry'],
];

for (const [sym, id, rar, trig] of bv32) {
  const rc = { rare: C.rare, epic: C.epic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.mirror).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(rc).text(rar.toUpperCase().padEnd(8), { continued: true, width: 60 });
  doc.fillColor(C.text).text(trig, { width: PW - 264 });
  y += 13;
}

y += 8;
hr(y, C.dim); y += 8;

// Achievement RPG v33
y = h2('ACHIEVEMENT RPG v33 — MIRROR CLASS', y, C.epic);
y += 4;

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(28), { continued: true, width: 168 });
doc.text('RARITY  ', { continued: true, width: 72 });
doc.text('TRIGGER', { width: PW - 312 });
y += 13;
hr(y, C.dim); y += 4;

const achv33 = [
  ['□·│·□',  'mirror_entry',             'common',    '1 Word Turn v35 badge'],
  ['~·│·~',  'mirror_class',             'uncommon',  '5 Word Turn v35 badges'],
  ['│·◉·│',  'mirror_complete',          'legendary', 'All 12 Word Turn v35 badges'],
  ['≈·│·≈',  'echo_arc',                 'epic',      'mirror_complete + deep_reflection'],
  ['∞·│·∞',  'thirty_five_engines_arc',  'legendary', '1 badge from each Word Turn v1–v35'],
  ['▓·◉·▓',  'mirror_opus',              'legendary', '35_engines_arc + mirror_complete'],
];

for (const [sym, id, rar, trig] of achv33) {
  const rc = { common: C.common, uncommon: C.uncommon, rare: C.rare, epic: C.epic, legendary: C.legendary }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.epic).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(28), { continued: true, width: 168 });
  doc.fillColor(rc).text(rar.toUpperCase().padEnd(8), { continued: true, width: 72 });
  doc.fillColor(C.text).text(trig, { width: PW - 312 });
  y += 13;
}

y += 8;
hr(y, C.dim); y += 8;

// Mastery Tier v35
y = h2('MASTERY TIER v35 — THE REFLECTION DEPTH', y, C.legendary);
y += 4;

const masterv35 = [
  ['│·◆·│',       'mirror_log',           'epic',    '1000+ distinct check-in days'],
  ['│·◆·◆·│',     'vast_reflection',      'legendary','150,000+ total words journaled'],
  ['│·◆·◆·◆·│',   'elder_mirror',         'legendary','8+ years active practice'],
  ['∞·◆·│·∞',     'thirty_five_registers','cosmic',  '1 badge from all 35 Word Turn engines'],
];

for (const [sym, id, rar, trig] of masterv35) {
  const rc = { epic: C.epic, legendary: C.legendary, cosmic: C.cosmic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.legendary).text(sym.padEnd(14), LM, y, { continued: true, width: 100 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 154 });
  doc.fillColor(rc).text(rar.toUpperCase().padEnd(10), { continued: true, width: 72 });
  doc.fillColor(C.text).text(trig, { width: PW - 326 });
  y += 13;
}

y += 8;
hr(y, C.dim); y += 8;

// Secret Boss v32
y = h2('SECRET BOSS v32 — THE SHADOW VAULT', y, C.mythic);
y += 4;

const secretv32 = [
  ['■·│·■', 'the_black_mirror', 'mythic', '"mirror"+"shadow"+"fracture" in same entry'],
  ['◈·│·◈', 'narcissus_trap',   'rare',   '"mirror" + "ego" in same entry'],
  ['×·│·×', 'shattered_glass',  'epic',   '3 fracture-signal entries in 3 days'],
];

for (const [sym, id, rar, trig] of secretv32) {
  const rc = { rare: C.rare, epic: C.epic, legendary: C.legendary, mythic: C.mythic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.mythic).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(rc).text(rar.toUpperCase().padEnd(10), { continued: true, width: 72 });
  doc.fillColor(C.text).text(trig, { width: PW - 276 });
  y += 13;
}

// ── PAGE 4: LORE ────────────────────────────────────────────────────────────────
newPage();
y = h1('LORE — THE MIRROR FORGE', y);
hr(y, C.mirror); y += 8;

y = h2('THE FORGE SPEAKS', y, C.forge);
y += 4;

const loreParagraphs = [
  'The self-care practitioner eventually meets the mirror. Not the surface mirror of how you appear to others — the deep mirror of how you appear to yourself. The journal is that mirror. Every entry an image. Every image a signal.',
  'Shadow work is not about darkness. It is about integration. The parts of yourself you have not yet named are not threats — they are unexplored inventory. The Mirror Forge is where those unnamed parts get smelted into identity.',
  'Write "mirror" and the terminal sees you looking. Write "shadow" and it sees you naming. Write "forge" and it sees you deciding. The badge is not the destination. The badge is the confirmation that the signal reached the right frequency.',
];

for (const p of loreParagraphs) {
  y = body(p, y, C.text);
  y += 6;
}

hr(y, C.dim); y += 8;

y = h2('THE BLACK MIRROR (MYTHIC SECRET BOSS)', y, C.mythic);
y += 4;
y = body('Three of the deepest words — mirror, shadow, fracture — in a single entry. The practitioner has seen something in the reflection that cannot be unseen. The forge has fired at full temperature. This is a profound self-inquiry entry. The terminal marks it at MYTHIC rarity because it is genuinely rare. Most practitioners reach one or two. All three in the same entry means something real happened on the page.', y, C.text);
y += 8;

y = h2('NARCISSUS TRAP (RARE SECRET BOSS)', y, C.rare);
y += 4;
y = body('The myth of Narcissus is not a warning about vanity — it is a warning about mistaking the reflection for the reality. Writing "mirror" and "ego" together means the practitioner is working the Narcissus pattern consciously. Recognizing the trap is how you escape it.', y, C.text);
y += 8;

y = h2('SHATTERED GLASS (EPIC SECRET BOSS)', y, C.epic);
y += 4;
y = body('Three entries in three consecutive days each containing fracture-signal vocabulary. A period of sustained breaking-open. This is not regression. Glass that shatters still reflects — in more directions, from more angles. Three days of fracture is a turning arc.', y, C.text);
y += 8;

hr(y, C.dim); y += 8;

y = h2('THIRTY-FIVE REGISTERS (COSMIC MASTERY)', y, C.cosmic);
y += 4;
y = body('One signal from every Word Turn engine, v1 through v35: Water, Seasonal, Architecture, Mountain, Storm, Fire, Tech, Space, Chemistry, Music, Alchemy, Quantum, Library, Arcade, Radio, Bio-Terminal, Codex, Cyberspace, Hero, Dungeon, Oracle, Wilderness, Crystal, Storm Atlas, Deep Field, Quantum Garden, Archive, Living World, Void Runner, Console Rogue, Bio-Forge, Neural Vault, Starship Log, Dream Codex, Mirror Forge. The practitioner has spoken every language in the system. Every vocabulary layer activated.', y, C.text);
y += 8;

hr(y, C.dim); y += 8;

y = h2('MIRROR OPUS (LEGENDARY ACHIEVEMENT)', y, C.legendary);
y += 4;
y = body('The maximum achievement of the Mirror Forge era — all twelve v35 badges plus the complete thirty-five-engine arc. The practitioner has not only mastered the mirror vocabulary but has proved they speak every Word Turn language the system contains. The forge has finished its work. The practitioner is the forge.', y, C.text);

// ── PAGE 5: ENGINE TABLE + TYPESCRIPT ─────────────────────────────────────────
newPage();
y = h1('ENGINE TABLE (v1–v35) + IMPLEMENTATION', y);
hr(y, C.mirror); y += 8;

y = h2('CUMULATIVE WORD TURN ENGINE TABLE', y, C.gold);
y += 4;

doc.font('Courier-Bold').fontSize(7).fillColor(C.dim);
doc.text('ENGINE  ', LM, y, { continued: true, width: 56 });
doc.text('CODEX  ', { continued: true, width: 48 });
doc.text('THEME', { width: PW - 104 });
y += 12;
hr(y, C.dim); y += 4;

const engines = [
  ['v1',  'v1',  'Core Water'],
  ['v2',  'v2',  'Seasonal Signal'],
  ['v3',  'v3',  'Architecture'],
  ['v4',  'v4',  'Mountain / Earth'],
  ['v5',  'v5',  'Storm / Weather'],
  ['v6',  'v6',  'Fire / Energy'],
  ['v7',  'v7',  'Tech / Digital'],
  ['v8',  'v8',  'Space / Cosmos'],
  ['v9',  'v9',  'Chemistry / Elements'],
  ['v10', 'v10', 'Music / Sound'],
  ['v11', 'v11', 'Alchemy / Transformation'],
  ['v12', 'v12', 'Quantum / Physics'],
  ['v13', 'v16', 'The Quantum Library'],
  ['v14', 'v17', 'The Neon Arcade'],
  ['v15', 'v18', 'The Midnight Radio'],
  ['v16', 'v19', 'The Bio-Terminal'],
  ['v17', 'v20', 'The Codex Reader'],
  ['v18', 'v21', 'The Cyberspace Codex'],
  ['v19', 'v22', "The Hero's Journey"],
  ['v20', 'v23', 'The Dungeon Map'],
  ['v21', 'v24', 'The Oracle Terminal'],
  ['v22', 'v25', 'The Wilderness Signal'],
  ['v23', 'v26', 'The Crystal Cave'],
  ['v24', 'v27', 'The Storm Atlas'],
  ['v25', 'v28', 'The Deep Field'],
  ['v26', 'v29', 'The Quantum Garden'],
  ['v27', 'v30', 'The Sovereign Archive'],
  ['v28', 'v31', 'The Living World'],
  ['v29', 'v32', 'The Void Runner'],
  ['v30', 'v33', 'The Console Rogue'],
  ['v31', 'v34', 'The Bio-Forge'],
  ['v32', 'v41', 'The Neural Vault'],
  ['v33', 'v43', 'The Starship Log'],
  ['v34', 'v44', 'The Dream Codex'],
  ['v35', 'v45', 'The Mirror Forge  ← NEW'],
];

for (const [eng, cod, theme] of engines) {
  const isNew = theme.includes('← NEW');
  const col = isNew ? C.gold : C.text;
  doc.font('Courier').fontSize(7).fillColor(C.mirror).text(eng.padEnd(8), LM, y, { continued: true, width: 56 });
  doc.fillColor(C.dim).text(cod.padEnd(7), { continued: true, width: 48 });
  doc.fillColor(col).text(theme, { width: PW - 104 });
  y += 11;
}

y += 6;
hr(y, C.mirror); y += 8;

y = h2('TYPESCRIPT SIGNATURES — v45', y, C.accent);
y += 4;

const tsCode = [
  '// Word Turn v35 — The Mirror Forge',
  "const MIRROR_FORGE: Record<string, RegExp> = {",
  "  mirror_touched:    /\\b(mirror|mirroring|mirrored)\\b/i,",
  "  reflection_signal: /\\b(reflection|reflecting|reflect)\\b/i,",
  "  shadow_named:      /\\b(shadow|shadow-work)\\b/i,",
  "  duality_held:      /\\b(duality|dual|both sides)\\b/i,",
  "  clarity_flash:     /\\b(clarity|clear|clearness)\\b/i,",
  "  fracture_point:    /\\b(fracture|fractured|cracked open)\\b/i,",
  "  prism_sight:       /\\b(prism|prismatic)\\b/i,",
  "  echo_return:       /\\b(echo|echoing|resonance)\\b/i,",
  "  identity_claimed:  /\\b(identity|who I am)\\b/i,",
  "  veil_lifted:       /\\b(veil|veiled|beneath the surface)\\b/i,",
  "  reveal_gate:       /\\b(reveal|revealed|uncover)\\b/i,",
  "  forge_active:      /\\b(forge|forging|forged)\\b/i,",
  "};",
  '',
  '// Behavioral v32',
  'function checkMirrorSession(text: string): BadgeType | null',
  'function checkDeepReflection(hist: JournalEntry[]): BadgeType | null',
  'function checkFracturePoint(text: string): BadgeType | null',
  '',
  '// Calendar EE v33',
  "{ id: 'narcissus_day',   month: 4,  day: 18 },",
  "{ id: 'shadow_day',      month: 11, day: 2  },",
  "{ id: 'solstice_mirror', month: 12, day: 21 },",
];

for (const line of tsCode) {
  y = mono(line, y, line.startsWith('//') ? C.dim : (line.startsWith('{') || line.startsWith('}') ? C.accent : C.text));
}

// ── FINAL: footer ──────────────────────────────────────────────────────────────
y += 16;
hr(y, C.mirror); y += 8;
doc.font('Courier').fontSize(7).fillColor(C.dim)
   .text('LOT Systems Corporation · brand.lot-systems.com · © 2025–2026 All rights reserved.', LM, y, { width: PW, align: 'center' });
y += 10;
doc.font('Courier').fontSize(7).fillColor(C.shadow)
   .text('"The journal is the mirror. Every reflection is a decision."', LM, y, { width: PW, align: 'center' });
y += 10;
doc.font('Courier-Bold').fontSize(7).fillColor(C.gold)
   .text('TOTAL BADGES: 1215 (v44: 1184 → v45: 1215, +31) · THE MIRROR FORGE', LM, y, { width: PW, align: 'center' });

doc.end();

stream.on('finish', () => {
  const stat = fs.statSync(OUT_PATH);
  console.log(`PDF generated: ${OUT_PATH}`);
  console.log(`File size: ${(stat.size / 1024).toFixed(1)} KB`);
});

stream.on('error', (err) => {
  console.error('PDF generation error:', err);
  process.exit(1);
});
