import { itemsForIssue, issueCogs, marginCheck, RATION_MANIFEST } from '../src/shared/utils/ration'
const eq = (a: unknown, b: unknown, m: string) => { if (a !== b) { console.error(`FAIL ${m}: ${a} !== ${b}`); process.exit(1) } console.log(`PASS ${m}`) }
eq(RATION_MANIFEST.length, 23, 'manifest = 23')
eq(itemsForIssue(1).length, 23, 'issue 1 = full load')
eq(itemsForIssue(2).length, 18, 'issue 2 = monthly only')
eq(itemsForIssue(4).length, 22, 'issue 4 = monthly + quarterly')
eq(itemsForIssue(7).length, 23, 'issue 7 = full (semi-annual)')
const none = issueCogs(1, {}); eq(marginCheck(none.totalUsd, none.unquoted).ok, false, 'unquoted never passes')
const q = Object.fromEntries(RATION_MANIFEST.map(i => [i.seq, 1])); const c = issueCogs(1, q)
eq(marginCheck(c.totalUsd, c.unquoted).ok, true, 'quoted under ceiling passes')
