import assert from 'node:assert/strict'
import {
  BASIC_MANIFEST,
  BASIC_LANDED_CEILING_USD,
  issuedInMonth,
} from '../../src/shared/basic/manifest'
import { renderLedger, GRID } from '../../src/shared/basic/ledger'

assert.equal(BASIC_MANIFEST.length, 23, '23-item load')
assert.deepEqual(BASIC_MANIFEST.map((x) => x.no), Array.from({ length: 23 }, (_, k) => k + 1))
assert.equal(new Set(BASIC_MANIFEST.map((x) => x.nomenclature)).size, 23, 'unique nomenclature')
assert.equal(BASIC_LANDED_CEILING_USD, 40, 'landed ceiling USD 40')
assert.equal(issuedInMonth(1).length, 23, 'month 1 issues full load')
assert.ok(issuedInMonth(2).every((x) => x.cadence === 'M'), 'month 2 monthly only')
assert.ok(issuedInMonth(4).some((x) => x.cadence === 'Q'), 'month 4 includes quarterly')
for (const line of renderLedger().split('\n')) assert.ok(line.length <= GRID, `grid: ${line}`)
console.log('PASS basic manifest')
