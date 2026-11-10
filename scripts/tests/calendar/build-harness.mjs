// Bundles harness.tsx (CalendarWidget + CalendarAlertHost) for the browser test.
// Run from repo root: node scripts/tests/calendar/build-harness.mjs <outfile>
import { build } from 'esbuild'
import path from 'path'
await build({
  entryPoints: [path.resolve('scripts/tests/calendar/harness.tsx')], outfile: process.argv[2], bundle: true, format: 'esm', platform: 'browser',
  alias: { '#client': path.resolve('./src/client'), '#shared': path.resolve('./src/shared') },
  define: { 'process.env.NODE_ENV': '"development"', 'process.env.APP_HOST': '""', 'process.env.APP_NAME': '""', 'process.env.APP_DESCRIPTION': '""', 'process.env.APP_VERSION': '"0"' },
  loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl' }, logLevel: 'error',
})
