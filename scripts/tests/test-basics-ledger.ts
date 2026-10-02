/** BASICS ledger invariants. Usage: npx esr scripts/tests/test-basics-ledger.ts */
import { RATION_MANIFEST, loadForMonth } from '../../src/shared/basics/ration.ts'

const fail = (m: string) => { console.error('FAIL', m); process.exit(1) }
if (RATION_MANIFEST.length !== 23) fail(`items=${RATION_MANIFEST.length} want 23`)
RATION_MANIFEST.forEach((i, k) => { if (i.no !== k + 1) fail(`seq ${i.no}`) })
if (new Set(RATION_MANIFEST.map((i) => i.nomenclature)).size !== 23) fail('dup nomenclature')
if (loadForMonth(1).length !== 23) fail('month 1 must issue all')
if (JSON.stringify(RATION_MANIFEST).match(/cogs|cost/i)) fail('COGS leaked')
console.log('PASS basics ledger: 23 items, sequential, unique, month-1 full, COGS withheld')
