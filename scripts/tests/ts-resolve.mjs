// Minimal loader: lets plain Node resolve extensionless relative .ts imports.
// Usage: node --experimental-strip-types --import ./scripts/tests/ts-resolve.mjs <test.ts>
import { register } from 'node:module'
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  try { return await next(spec, ctx) } catch (e) {
    if (spec.startsWith('.') && !/\\.[a-z]+$/.test(spec)) return next(spec + '.ts', ctx)
    throw e
  }
}`), import.meta.url)
