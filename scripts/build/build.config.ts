import type { BuildOptions } from 'esbuild'

export const commonConfig: BuildOptions = {
  bundle: true,
  minify: process.env.NODE_ENV === 'production',
  sourcemap: process.env.NODE_ENV !== 'production',
  target: ['es2020', 'chrome58', 'firefox57', 'safari11'],
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx'
  }
}