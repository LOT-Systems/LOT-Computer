import { build, Loader } from 'esbuild'
import { commonConfig } from './build.config.ts'

async function buildServer() {
  try {
    console.log('🔧 Building server...')
    await build({
      ...commonConfig,
      entryPoints: ['./src/server/index.ts'],
      platform: 'node',
      outfile: './dist/server/index.js',
      format: 'esm',
      external: [
        'fastify',
        '@fastify/static',
        'path',
        'url'
      ],
      loader: {
        '.ts': 'ts',
        '.js': 'js'
      } as { [key: string]: Loader }
    })
    console.log('Server build completed')
  } catch (error) {
    console.error('Server build failed:', error)
    process.exit(1)
  }
}

buildServer()