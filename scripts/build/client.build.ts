import { build } from 'esbuild'
import type { Loader } from 'esbuild'
import { commonConfig } from './build.config.ts'

async function buildClient() {
  try {
    console.log('📦 Building client bundles...')
    await build({
      ...commonConfig,
      entryPoints: [
        './src/client/entries/app.tsx',
        './src/client/entries/login.tsx',
        './src/client/entries/ui-lib.tsx'
      ],
      outdir: './dist/client/js',
      splitting: true,
      format: 'esm',
      platform: 'browser', // Important: use browser for client
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.css': 'css',
        '.svg': 'dataurl',
        '.png': 'dataurl',
        '.jpg': 'dataurl'
      } as { [key: string]: Loader },
      external: [
        'react',
        'react-dom'
      ]
    })
    console.log('✅ Client build completed')
  } catch (error) {
    console.error('❌ Client build failed:', error)
    process.exit(1)
  }
}

buildClient()