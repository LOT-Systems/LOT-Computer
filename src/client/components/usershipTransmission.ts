// ─── Usership Transmission — appended after each assembly run ───────────────
// This is the system talking to the person. Terse, technical, alive.
//
// Lives in its own module so ArchitectWidget (eager) can read it without
// statically pulling the ~180 KB SystemProgressWidget into the main bundle.
// SystemProgressWidget re-exports it, so existing imports keep working.
// Assembly runs: update USERSHIP_TRANSMISSION HERE.
export const USERSHIP_TRANSMISSION = {
  date: '2026-08-05',
  message: [
    'ASSEMBLY RUN — 2026-08-05 · WIKI-v87 · FM v113 SYNC · Day 1073+',
    'Built: LOT-WIKI-v87. Six-level coherence architecture now complete and documented.',
    'Feedback applied: "The concept outlives the author. The self speaks every language the genre built."',
    'QIE v113 synchronized: P149 QPCRYST · P150 TOTCOH [CEILING] · P151 RECINTEL · Arch51 Quantum Presence Crystallizer · J48 09:00 UTC.',
    'Badge v31 synchronized: THE CYBERSPACE CODEX · 781 badges · Word Turn v21 (grok/ansible/spice/golden_path/matrix/cyberspace) · Secret Boss v18 (gibson/dick/lem) · 258 trigger words · 24 secret boss triggers.',
    'LEVEL 6 — PRESENCE CONVERGENCE documented. P150 total-field-coherence is the QIE ceiling. No higher state defined.',
    'Cockpit updated. Vocabulary expanded. Snapshot current.',
    'FM v113 · Wiki v87 · 151P · 51A · 48J · 190+ nodes · 781 badges.',
    'Status: DEPLOYED.',
    'Next: LOT-WIKI-v88 — sync to Field Manual v114+',
  ],
}
