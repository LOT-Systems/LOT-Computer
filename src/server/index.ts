import customPaths from './utils/custom-paths'

customPaths.register({
  prefixes: ['#server', '#shared'],
})

require('./server')
