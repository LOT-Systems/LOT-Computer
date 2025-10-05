import path from 'path'
import fs from 'fs'
import { build, LogLevel, Loader, context } from 'esbuild'
import gzipPlugin from '@luncheon/esbuild-plugin-gzip'
import watch from 'node-watch'
import notifier from 'node-notifier'
import config from '../src/server/config'

const args = process.argv.slice(2)
const buildConfig = {
  watch: args.includes('-w'),
  env: args.includes('-dev') ? 'development' : 'production',
  metafile: args.includes('-metafile'),
}

const esbuildConfig = {
  color: true,
  entryPoints: [
    './src/client/entries/app.tsx',
    './src/client/entries/login.tsx',
    './src/client/entries/us.tsx',
    './src/client/entries/ui-lib.tsx',
  ],
  metafile: buildConfig.metafile,
  outdir: './dist/client/js',
  minify: buildConfig.env === 'production',
  bundle: true,
  sourcemap: buildConfig.env === 'development',
  logLevel: 'error' as LogLevel,
  target: 'es2016',
  define: {
    'process.env.NODE_ENV': JSON.stringify(buildConfig.env),
    'process.env.APP_HOST': JSON.stringify(config.appHost),
    'process.env.APP_NAME': JSON.stringify(config.appName),
    'process.env.APP_DESCRIPTION': JSON.stringify(config.appDescription),
  },
  loader: { '.js': 'jsx' } as { '.js': Loader },
  write: buildConfig.env !== 'production',
  plugins: [
    buildConfig.env === 'production'
      ? gzipPlugin({
          uncompressed: true,
          gzip: true,
          brotli: false,
        })
      : null,
  ].filter(Boolean) as [],
}

async function run() {
  const clientPathRe = /src\/client\//
  const commonConstantsPathRe = /src\/constants/
  const includePaths = [clientPathRe, commonConstantsPathRe]
  try {
    if (buildConfig.watch) {
      const ctx = await context(esbuildConfig)
      await ctx.rebuild()
      console.log('👀 Watching `src/client` for changes')
      watch(
        path.join(__dirname, '../src'),
        {
          recursive: true,
          filter: (x) => includePaths.some((re) => re.test(x)),
        },
        async (_evt, name) => {
          try {
            console.log('changed: ', name)
            await ctx.rebuild()
          } catch (err) {
            console.log(`\x1b[31mRebuild error:\x1b[39m `, err)
            notifier.notify({
              title: `❌`,
              message: `Build error`,
              sound: true,
            })
          }
        }
      )
    } else {
      console.log('📦 Build bundle')
      const builder = await build(esbuildConfig)
      if (buildConfig.metafile) {
        fs.writeFileSync(
          path.join(__dirname, '../drafts/client.metafile.json'),
          JSON.stringify(builder.metafile)
        )
      }
    }
  } catch (err) {
    console.log(`\x1b[31mBuild error:\x1b[39m `, err)
    notifier.notify({
      title: `❌`,
      message: `Build error`,
      sound: true,
    })
  }
}

run()
