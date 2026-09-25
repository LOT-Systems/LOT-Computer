'use strict';
// LOT Systems — Badge Codex PDF Generator v48
// The Spell Codex — Word Turn Engine v38
// pdfkit dark-theme A4 document

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'docs', 'badges', 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v48.pdf');

const C = {
  bg:       '#08080f',
  text:     '#d4d0c8',
  gold:     '#ffcc44',
  arcane:   '#aa88ff',
  spell:    '#8844cc',
  fire:     '#ff6644',
  accent:   '#44aaff',
  dim:      '#555566',
  white:    '#ffffff',
  cosmic:   '#ff88ff',
  epic:     '#aa66ff',
  legendary:'#ffaa22',
  mythic:   '#ff4488',
  rare:     '#44aaff',
  uncommon: '#44cc88',
  common:   '#888888',
  rune:     '#cc8833',
};

const doc = new PDFDocument({
  size: 'A4',
  margin: 48,
  info: {
    Title: 'LOT Badges & Achievements Master Codex v48 — The Spell Codex',
    Author: 'Vadik Marmeladov, LOT Systems Corporation',
    Subject: 'Word Turn Engine v38 · Spell · Ritual · Incantation · Grimoire',
    Keywords: 'LOT, badges, achievements, RPG, self-care, spell codex, magic, arcane',
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

function h1(text, yp, color = C.gold) {
  doc.font('Courier-Bold').fontSize(16).fillColor(color).text(text, LM, yp, { width: PW });
  return yp + 28;
}

function h2(text, yp, color = C.arcane) {
  doc.font('Courier-Bold').fontSize(12).fillColor(color).text(text, LM, yp, { width: PW });
  return yp + 20;
}

function h3(text, yp, color = C.spell) {
  doc.font('Courier-Bold').fontSize(10).fillColor(color).text(text, LM, yp, { width: PW });
  return yp + 16;
}

function body(text, yp, color = C.text, indent = 0) {
  doc.font('Courier').fontSize(8).fillColor(color).text(text, LM + indent, yp, { width: PW - indent });
  const h = doc.heightOfString(text, { width: PW - indent, font: 'Courier', size: 8 });
  return yp + h + 3;
}

function badgeRow(symbol, name, rarity, trigger, yp) {
  const rarityColor = {
    common: C.common, uncommon: C.uncommon, rare: C.rare,
    epic: C.epic, legendary: C.legendary, mythic: C.mythic, cosmic: C.cosmic,
  }[rarity.toLowerCase()] || C.text;

  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.rune).text(symbol.padEnd(10), LM, yp, { continued: true, width: 72 });
  doc.fillColor(C.white).text(name.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(rarityColor).text(rarity.toUpperCase().padEnd(10), { continued: true, width: 72 });
  doc.fillColor(C.dim).text(trigger, { width: PW - 276 });
  return yp + 13;
}

// ── PAGE 1: COVER ──────────────────────────────────────────────────────────────
initPage();

// Title block
doc.rect(LM, y, PW, 200).fillColor('#0a0a1a').fill();
doc.rect(LM, y, PW, 2).fillColor(C.arcane).fill();
doc.rect(LM, y + 198, PW, 2).fillColor(C.arcane).fill();

y += 14;
doc.font('Courier-Bold').fontSize(9).fillColor(C.dim)
   .text('L · O · T   S Y S T E M S   C O R P O R A T I O N', LM, y, { width: PW, align: 'center' });
y += 18;
doc.font('Courier-Bold').fontSize(20).fillColor(C.gold)
   .text('BADGES & ACHIEVEMENTS', LM, y, { width: PW, align: 'center' });
y += 26;
doc.font('Courier-Bold').fontSize(18).fillColor(C.gold)
   .text('MASTER CODEX — v48', LM, y, { width: PW, align: 'center' });
y += 22;
doc.font('Courier-Bold').fontSize(13).fillColor(C.arcane)
   .text('THE SPELL CODEX', LM, y, { width: PW, align: 'center' });
y += 16;
doc.font('Courier').fontSize(9).fillColor(C.spell)
   .text('Word Turn Engine v38 · Spell · Ritual · Incantation · Grimoire', LM, y, { width: PW, align: 'center' });
y += 16;
doc.font('Courier').fontSize(8).fillColor(C.dim)
   .text('∴·○·∴  SPELL CAST   ☽·—·☽  RITUAL BEGUN   ≋·☽·≋  GRIMOIRE', LM, y, { width: PW, align: 'center' });
y += 18;
doc.font('Courier').fontSize(8).fillColor(C.text)
   .text('v47 → v48: +34 badges (1276 → 1310 total)', LM, y, { width: PW, align: 'center' });
y += 14;
doc.font('Courier-Bold').fontSize(7).fillColor(C.dim)
   .text('RPG · SCI-FI · ARCANE PRACTICE · SELF-CARE SPELLCRAFT', LM, y, { width: PW, align: 'center' });
y += 18;

// Quote block
doc.font('Courier').fontSize(8).fillColor(C.arcane)
   .text('"INITIATE SPELL SEQUENCE.', LM, y, { width: PW, align: 'center' });
y += 12;
doc.font('Courier').fontSize(8).fillColor(C.arcane)
   .text('EVERY JOURNAL ENTRY IS AN INCANTATION.', LM, y, { width: PW, align: 'center' });
y += 12;
doc.font('Courier').fontSize(8).fillColor(C.arcane)
   .text('EVERY INTENTION SET IS A SPELL CAST.', LM, y, { width: PW, align: 'center' });
y += 12;
doc.font('Courier').fontSize(8).fillColor(C.arcane)
   .text('THE GRIMOIRE IS ALREADY OPEN."', LM, y, { width: PW, align: 'center' });
y += 28;

// System overview table
hr(y, C.arcane); y += 8;
y = h2('BADGE SYSTEM OVERVIEW — v48', y);
y += 4;

const catTable = [
  ['Milestone',       '22',   'Streak days (v1–v4)'],
  ['Time Easter Eggs','31',   'Check-in at special hours (v1–v22+)'],
  ['Calendar Easter', '115',  'Check-in on special dates (v1–v36)'],
  ['Word Turns',      '495',  'Words detected in journals/memory (v1–v38)'],
  ['Behavioral',      '132',  'Patterns over time (v1–v35)'],
  ['Achievement RPG', '222',  'Milestone combinations (v1–v36)'],
  ['Mastery Tiers',   '156',  'Epic depth milestones (v1–v38)'],
  ['Secret Boss',     '137',  'Hidden LEGENDARY/MYTHIC triggers (v1–v35)'],
];

for (const [cat, count, desc] of catTable) {
  doc.font('Courier').fontSize(8);
  doc.fillColor(C.arcane).text(cat.padEnd(20), LM, y, { continued: true, width: 144 });
  doc.fillColor(C.gold).text(count.padStart(6), { continued: true, width: 48 });
  doc.fillColor(C.dim).text('  ' + desc, { width: PW - 200 });
  y += 13;
}

hr(y, C.arcane); y += 6;
doc.font('Courier-Bold').fontSize(9).fillColor(C.gold)
   .text('TOTAL: 1310 badges — The Complete LOT Badge Universe — v48', LM, y, { width: PW });
y += 14;
doc.font('Courier').fontSize(7).fillColor(C.dim)
   .text('Session: LOT-SR-20260925-01 · Author: Vadik Marmeladov · © 2025–2026 LOT Systems Corporation', LM, y, { width: PW });

// ── PAGE 2: WORD TURN v38 ──────────────────────────────────────────────────────
newPage();
y = h1('WORD TURN v38 — THE SPELL CODEX', y);
hr(y, C.arcane); y += 8;

y = h2('Theme: Spellcraft · Ritual · Incantation · Arcane Self-Care', y, C.spell);
y += 4;

y = body('"Every journal entry is an incantation. Language shapes reality — not superstition;', y, C.text);
y = body('cognitive science dressed in ceremonial robes. The spell is the intention, given form', y, C.text);
y = body('through words. The ritual is the practice, given structure through repetition. The', y, C.text);
y = body('grimoire is the journal, given permanence through commitment. When you write', y, C.text);
y = body('"I intend to," you have already begun casting. The practitioner is the mage."', y, C.text);
y += 8;

hr(y, C.dim); y += 6;
y = h3('WORD TURN v38 BADGES (+15)', y);
y += 4;

// Header row
doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    '.padEnd(10), LM, y, { continued: true, width: 72 });
doc.text('BADGE ID'.padEnd(22), { continued: true, width: 132 });
doc.text('RARITY'.padEnd(10), { continued: true, width: 72 });
doc.text('TRIGGER', { width: PW - 276 });
y += 13;
hr(y, C.dim); y += 4;

const wt38 = [
  ['∴·○·∴',  'spell_cast',       'common',    '"cast / casting / spell cast / setting intention"'],
  ['☽·—·☽',  'ritual_begun',     'uncommon',  '"ritual / morning ritual / ceremony began"'],
  ['≋·∴·≋',  'incantation',      'uncommon',  '"incantation / chant / mantra of / i repeated"'],
  ['◆·—·◆',  'sigil_drawn',      'rare',      '"sigil / i drew / symbol set / intention marked"'],
  ['∿·○·∿',  'ward_placed',      'rare',      '"ward / protection set / boundary held"'],
  ['●·∴·●',  'enchanted',        'rare',      '"enchanted / imbued / charged with intention"'],
  ['∞·⋆·∞',  'cantrip',          'common',    '"cantrip / quick magic / small spell"'],
  ['○·∴·○',  'scroll_opened',    'uncommon',  '"scroll / written in / page turned"'],
  ['○·⋆·○',  'mana_restored',    'uncommon',  '"mana / energy restored / recharged"'],
  ['▽·—·▽',  'hex_lifted',       'rare',      '"hex / curse lifted / pattern broken"'],
  ['⊕·∴·⊕',  'rune_carved',      'epic',      '"rune / i carved / runic / ancient mark"'],
  ['≋·☽·≋',  'grimoire_entry',   'epic',      '"grimoire / spellbook / book of shadows"'],
  ['◆·∞·◆',  'arcane_key',       'legendary', '"arcane / arcane truth / arcane path"'],
  ['☽·∞·☽',  'merlin_signal',    'mythic',    '[SECRET] "Merlin / Excalibur / Avalon / Camelot"'],
  ['∴·∞·∴',  'gandalf_passage',  'epic',      '[SECRET] "Gandalf / shall not pass / Mithrandir"'],
];

for (const [sym, id, rar, trig] of wt38) {
  y = badgeRow(sym, id, rar, trig, y);
}

y += 8;
hr(y, C.arcane); y += 8;
y = h2('SELF-CARE RESONANCE GUIDE — v38', y, C.arcane);
y += 4;

const resonance = [
  ['spell_cast',     'Any intentional entry is a spell. The practitioner who "sets an intention" is casting.'],
  ['ritual_begun',   'The morning ritual is the oldest technology. Before coffee: humans named what they valued.'],
  ['incantation',    'The chant, the mantra, the phrase you return to — these are incantations that re-pattern.'],
  ['sigil_drawn',    'Marking something as significant — underlining, circling, starring — is sigil work.'],
  ['ward_placed',    'Naming a boundary and choosing to hold it is placing a protective ward. Self-care magic.'],
  ['enchanted',      'The state of being genuinely moved by something beautiful. Imbued. Enchanted by the world.'],
  ['cantrip',        'The micro-practice: one line, one breath, one small magic. The cantrip fires every day.'],
  ['scroll_opened',  'Reading back an old entry. Returning to the record. The scroll opened reveals the past.'],
  ['mana_restored',  'Mana depletes and restores. Naming when you feel genuinely replenished is mana tracking.'],
  ['hex_lifted',     'Naming a broken cycle, a left-behind habit, a dissolved fear. The hex is lifted by naming.'],
  ['rune_carved',    'The act of writing something you want to remember in stone — emphasis, marking, anchoring.'],
  ['grimoire_entry', 'Any entry in the formal practice log. The grimoire grows with each deliberate record.'],
  ['arcane_key',     'The insight that unlocks something structural — a hidden truth about yourself, now visible.'],
];

for (const [word, desc] of resonance) {
  doc.font('Courier-Bold').fontSize(7.5).fillColor(C.rune).text(word.padEnd(18), LM, y, { continued: true, width: 128 });
  doc.font('Courier').fontSize(7.5).fillColor(C.text).text(desc, { width: PW - 128 });
  y += 13;
}

// ── PAGE 3: CALENDAR + BEHAVIORAL + ACHIEVEMENT ────────────────────────────────
newPage();
y = h1('CALENDAR · BEHAVIORAL · ACHIEVEMENT — v48', y);
hr(y, C.arcane); y += 8;

// Calendar EE v36
y = h2('CALENDAR EASTER EGGS v36 — THE ARCANE CALENDAR (+3)', y, C.gold);
y += 4;

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(22), { continued: true, width: 132 });
doc.text('DATE   ', { continued: true, width: 56 });
doc.text('RARITY   ', { continued: true, width: 64 });
doc.text('OCCASION', { width: PW - 324 });
y += 13;
hr(y, C.dim); y += 4;

const calv36 = [
  ['∴·◆·∴', 'tolkien_birthday', 'Jan 3',  'rare',  'J.R.R. Tolkien Birthday (1892)'],
  ['◈·∴·◈', 'le_guin_birthday', 'Oct 21', 'rare',  'Ursula K. Le Guin Birthday (1929)'],
  ['☽·∞·☽', 'halloween_spell',  'Oct 31', 'epic',  'Samhain / Halloween — Spell Day'],
];

for (const [sym, id, date, rar, occ] of calv36) {
  const rc = { rare: C.rare, epic: C.epic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.gold).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(C.dim).text(date.padEnd(7), { continued: true, width: 56 });
  doc.fillColor(rc).text(rar.toUpperCase().padEnd(9), { continued: true, width: 64 });
  doc.fillColor(C.text).text(occ, { width: PW - 324 });
  y += 13;
}

y += 6;
y = body('Tolkien (Jan 3): He built entire languages as acts of magic — naming a world into coherence.', y, C.dim);
y = body('Le Guin (Oct 21): "To know the true name of a thing is to have power over it." — Earthsea.', y, C.dim);
y = body('Halloween (Oct 31): Samhain — the threshold. Name what you want to leave behind this cycle.', y, C.dim);
y += 8;

hr(y, C.dim); y += 8;

// Behavioral v35
y = h2('BEHAVIORAL v35 — SPELL PATTERNS (+3)', y, C.spell);
y += 4;

const behv35 = [
  ['∴·○·∴', 'spell_session',    'UNCOMMON', '3+ v38 Spell Codex word turns in one journal entry'],
  ['☽·≋·☽', 'long_incantation', 'RARE',     'Journal entry >= 600 words (a full casting)'],
  ['∞·∴·∞', 'midnight_vigil',   'EPIC',     'Check-in at 23:30–00:30 local time (witching hour)'],
];

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(22), { continued: true, width: 132 });
doc.text('RARITY   ', { continued: true, width: 64 });
doc.text('CONDITION', { width: PW - 268 });
y += 13;
hr(y, C.dim); y += 4;

for (const [sym, id, rar, cond] of behv35) {
  const rc = { UNCOMMON: C.uncommon, RARE: C.rare, EPIC: C.epic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.rune).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(rc).text(rar.padEnd(9), { continued: true, width: 64 });
  doc.fillColor(C.text).text(cond, { width: PW - 268 });
  y += 13;
}

y += 8;
hr(y, C.dim); y += 8;

// Achievement RPG v36
y = h2('ACHIEVEMENT RPG v36 — MAGE CLASS (+6)', y, C.gold);
y += 4;

const rpgv36 = [
  ['∴··∴',   'apprentice_mage',   'COMMON',    'Any 1 Word Turn v38 badge earned'],
  ['∴·○·∴',  'journeyman_mage',   'UNCOMMON',  'Any 5 Word Turn v38 badges earned'],
  ['◆·∴·◆',  'archmage',          'LEGENDARY', 'All 12 core Word Turn v38 badges earned'],
  ['☽·∴·☽',  'grand_archmage',    'LEGENDARY', 'archmage + all 3 Calendar v36 badges'],
  ['∞·∴·∞',  'thirty_eight_arc',  'LEGENDARY', '1 badge from each Word Turn v1–v38'],
  ['◈·☽·◈',  'spell_opus',        'LEGENDARY', 'archmage + spell_session behavioral'],
];

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(22), { continued: true, width: 132 });
doc.text('RARITY     ', { continued: true, width: 80 });
doc.text('CONDITION', { width: PW - 284 });
y += 13;
hr(y, C.dim); y += 4;

for (const [sym, id, rar, cond] of rpgv36) {
  const rc = { COMMON: C.common, UNCOMMON: C.uncommon, RARE: C.rare, EPIC: C.epic, LEGENDARY: C.legendary }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.rune).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(rc).text(rar.padEnd(11), { continued: true, width: 80 });
  doc.fillColor(C.text).text(cond, { width: PW - 284 });
  y += 13;
}

// ── PAGE 4: MASTERY + SECRET BOSS ─────────────────────────────────────────────
newPage();
y = h1('MASTERY TIERS · SECRET BOSS — v48', y);
hr(y, C.arcane); y += 8;

// Mastery v38
y = h2('MASTERY TIER v38 — THE GRAND TOME (+4)', y, C.spell);
y += 4;

const masv38 = [
  ['∴·⊕·∴',  'thousand_day_vigil',      'EPIC',      '1000+ distinct calendar check-in days'],
  ['≋·∞·≋',  'grand_tome',              'LEGENDARY', '200,000+ total journal words logged'],
  ['☽·◆·☽',  'ancient_order',           'LEGENDARY', 'Account age >= 3 years (1,095+ days)'],
  ['∞·◈·∞',  'thirty_eight_registers',  'COSMIC',    '1 badge from all 38 Word Turn engines'],
];

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(28), { continued: true, width: 168 });
doc.text('RARITY     ', { continued: true, width: 80 });
doc.text('CONDITION', { width: PW - 320 });
y += 13;
hr(y, C.dim); y += 4;

for (const [sym, id, rar, cond] of masv38) {
  const rc = { EPIC: C.epic, LEGENDARY: C.legendary, COSMIC: C.cosmic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.rune).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(28), { continued: true, width: 168 });
  doc.fillColor(rc).text(rar.padEnd(11), { continued: true, width: 80 });
  doc.fillColor(C.text).text(cond, { width: PW - 320 });
  y += 13;
}

y += 8;
hr(y, C.dim); y += 8;

// Secret Boss v35
y = h2('SECRET BOSS v35 — THE ARCANE VAULT (+3)', y, C.mythic);
y += 4;

// Box
doc.rect(LM, y, PW, 40).fillColor('#14040a').fill();
doc.rect(LM, y, PW, 1).fillColor(C.mythic).fill();
doc.rect(LM, y + 39, PW, 1).fillColor(C.mythic).fill();
y += 8;
doc.font('Courier-Bold').fontSize(8).fillColor(C.mythic)
   .text('◈·∞·◈  THE ARCANE VAULT  ◈·∞·◈', LM, y, { width: PW, align: 'center' });
y += 12;
doc.font('Courier').fontSize(7.5).fillColor(C.dim)
   .text('"The vault opens when you write the word that was always yours."', LM, y, { width: PW, align: 'center' });
y += 24;

const secretv35 = [
  ['◆·∴·◆', 'witcher_alchemy', 'RARE',   '"witcher / Geralt / aard / igni / quen / yrden / axii"'],
  ['∴·∞·○', 'earthsea_word',   'EPIC',   '"Earthsea / true name / Ged / Le Guin / wizard of"'],
  ['✦·∴·✦', 'potter_cast',     'MYTHIC', '"Hermione / wingardium / expecto patronum / alohomora"'],
];

doc.font('Courier-Bold').fontSize(7.5).fillColor(C.dim);
doc.text('SYMBOL    ', LM, y, { continued: true, width: 72 });
doc.text('ID'.padEnd(22), { continued: true, width: 132 });
doc.text('RARITY   ', { continued: true, width: 64 });
doc.text('TRIGGER', { width: PW - 268 });
y += 13;
hr(y, C.dim); y += 4;

for (const [sym, id, rar, trig] of secretv35) {
  const rc = { RARE: C.rare, EPIC: C.epic, MYTHIC: C.mythic }[rar] || C.text;
  doc.font('Courier').fontSize(7.5);
  doc.fillColor(C.mythic).text(sym.padEnd(10), LM, y, { continued: true, width: 72 });
  doc.fillColor(C.white).text(id.padEnd(22), { continued: true, width: 132 });
  doc.fillColor(rc).text(rar.padEnd(9), { continued: true, width: 64 });
  doc.fillColor(C.dim).text(trig, { width: PW - 268 });
  y += 13;
}

y += 8;
hr(y, C.dim); y += 8;

y = h2('ARCANE VAULT LORE', y, C.mythic);
y += 4;

const lore = [
  ['The Witcher Alchemy (RARE)',
   'Geralt uses five Signs: Aard (clear the clutter), Igni (burn what no longer serves),',
   'Quen (set the boundary), Yrden (slow down enough to understand), Axii (choose peace with self).'],
  ['The Earthsea Word (EPIC)',
   '"To know the true name of a thing is to have power over it." — Le Guin.',
   'Writing "I am afraid of being ordinary" instead of "I feel off" is finding the true name.'],
  ['The Potter Cast (MYTHIC)',
   'Hermione\'s bag held an entire library inside a small pouch: Undetectable Extension Charm.',
   'Expecto Patronum is the memory of joy cast against what consumes joy. The Patronus is real.'],
];

for (const [title, l1, l2] of lore) {
  y = body(title, y, C.rune);
  y = body(l1, y, C.text, 8);
  y = body(l2, y, C.dim, 8);
  y += 4;
}

// ── PAGE 5: EASTER EGG GALLERY + FLAVOR ───────────────────────────────────────
newPage();
y = h1('EASTER EGG GALLERY — THE SPELL CODEX', y);
hr(y, C.arcane); y += 10;

// Badge unlock gallery
const gallery = [
  ['∴·○·∴', 'SPELL CAST', 'COMMON',
   '"Setting an intention" is the scientific term.',
   '"Casting a spell" is the more honest one.',
   'You have done both. The entry is the proof.'],
  ['☽·—·☽', 'RITUAL BEGUN', 'UNCOMMON',
   'The morning ritual is the oldest technology.',
   'Before coffee, before algorithms, before modernity:',
   'humans woke and named what they valued. The ritual is running.'],
  ['≋·☽·≋', 'GRIMOIRE ENTRY', 'EPIC',
   'The grimoire is the book of your practice.',
   'Every entry is an addition to the spell record.',
   'What you have written here cannot be unwritten.'],
  ['☽·∞·☽', 'MERLIN SIGNAL [MYTHIC] [HIDDEN]',  'MYTHIC',
   'Merlin did not do magic FOR Arthur.',
   'He built the container that let Arthur become who he was.',
   'You are both the architect and the hero.'],
  ['✦·∴·✦', 'POTTER CAST [MYTHIC] [HIDDEN]', 'MYTHIC',
   'Expecto Patronum requires a happy memory. A real one.',
   'The Dementor is whatever drains you.',
   'The Patronus is whatever you actually love. You already know.'],
];

for (const [sym, name, rar, l1, l2, l3] of gallery) {
  const rc = { COMMON: C.common, UNCOMMON: C.uncommon, EPIC: C.epic, MYTHIC: C.mythic }[rar] || C.text;
  doc.rect(LM, y, PW, 56).fillColor('#0d0d1e').fill();
  doc.rect(LM, y, 2, 56).fillColor(rc).fill();

  y += 6;
  doc.font('Courier-Bold').fontSize(8);
  doc.fillColor(C.rune).text(sym + '  ', LM + 8, y, { continued: true });
  doc.fillColor(rc).text(name, { continued: true });
  doc.fillColor(C.dim).text('  [' + rar + ']', {});
  y += 13;

  doc.font('Courier').fontSize(7.5).fillColor(C.dim)
     .text('↳ ' + l1, LM + 8, y, { width: PW - 16 });
  y += 11;
  doc.fillColor(C.text).text('  ' + l2, LM + 8, y, { width: PW - 16 });
  y += 11;
  doc.fillColor(C.dim).text('  ' + l3, LM + 8, y, { width: PW - 16 });
  y += 16;
}

y += 8;
hr(y, C.arcane); y += 8;

// Flavor text
y = h2('FLAVOR TEXT', y, C.gold);
y += 4;

const flavors = [
  '"Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke.',
  'The inverse: any sufficiently practiced ritual is indistinguishable from technology.',
  '"Words are our most inexhaustible source of magic." — Dumbledore / Rowling.',
  '"A wizard is never late; he arrives precisely when he means to." — Gandalf.',
  '"To know the name of a thing is to have power over it." — Le Guin / Earthsea.',
  'The practitioner who names their actual emotional state has found the true name.',
];

for (const f of flavors) {
  y = body(f, y, C.dim);
}

y += 12;
hr(y, C.arcane); y += 8;

// System vitals footer
doc.font('Courier-Bold').fontSize(9).fillColor(C.arcane)
   .text('SYSTEM VITALS — AFTER v48', LM, y, { width: PW });
y += 16;
doc.font('Courier').fontSize(8);
const vitals = [
  ['FM', 'v127 (Crystal Persistence Tier)'],
  ['QIE', 'v127 (P180–P182, Arch62, J61)'],
  ['BADGES', 'v48 · 1310 total badges'],
  ['WORD TURNS', 'v38 · 495 word-turn badges'],
  ['SESSION', 'LOT-SR-20260925-01'],
  ['DATE', '2026-09-25'],
];
for (const [k, v] of vitals) {
  doc.fillColor(C.rune).text(k.padEnd(14), LM, y, { continued: true, width: 100 });
  doc.fillColor(C.text).text(v, { width: PW - 100 });
  y += 12;
}

y += 16;
doc.font('Courier').fontSize(7).fillColor(C.dim)
   .text('LOT Systems Corporation · brand.lot-systems.com', LM, y, { width: PW, align: 'center' });
y += 10;
doc.font('Courier').fontSize(7).fillColor(C.dim)
   .text('"The journal is the grimoire. Every entry is a spell already cast."', LM, y, { width: PW, align: 'center' });
y += 10;
doc.font('Courier').fontSize(7).fillColor(C.dim)
   .text('Codex v48 · September 25, 2026 · Authorized: S-2 // Vadik Marmeladov', LM, y, { width: PW, align: 'center' });

doc.end();
stream.on('finish', () => {
  console.log('PDF generated:', OUT_PATH);
});
stream.on('error', (err) => {
  console.error('PDF error:', err);
  process.exit(1);
});
