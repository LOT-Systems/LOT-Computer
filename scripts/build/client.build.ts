import { build } from 'esbuild'
import type { Loader } from 'esbuild'
import { commonConfig } from './build.config.ts'
import path from 'path'

async function buildClient() {
  try {
    console.log('🔦 Building client bundles...')
    await build({
      ...commonConfig,
      entryPoints: [
        './src/client/entries/app.tsx',
        './src/client/entries/login.tsx',
        './src/client/entries/ui-lib.tsx',
        './src/client/entries/us.tsx',
        './src/client/entries/status.tsx',
        './src/client/entries/public-profile.tsx'
      ],
      outdir: './dist/client/js',
      splitting: true,
      format: 'esm',
      platform: 'browser',
      bundle: true,
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production',
      alias: {
        '#client': path.resolve('./src/client'),
        '#shared': path.resolve('./src/shared'),
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.APP_HOST': JSON.stringify(process.env.APP_HOST || ''),
        'process.env.APP_NAME': JSON.stringify(process.env.APP_NAME || ''),
        'process.env.APP_DESCRIPTION': JSON.stringify(process.env.APP_DESCRIPTION || ''),
      },
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
    })
    console.log('✅ Client build completed')
  } catch (error) {
    console.error('❌ Client build failed:', error)
    process.exit(1)
  }
}

buildClient()
