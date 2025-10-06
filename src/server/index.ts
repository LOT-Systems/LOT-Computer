import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Fix for ESM __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = fastify()

// Serve static files
server.register(fastifyStatic, {
  root: join(__dirname, '../../dist/client'),
  prefix: '/'
})

// Handle all routes (for SPA)
server.setNotFoundHandler((request, reply) => {
  reply.sendFile('index.html')
})

// Add a root route handler
server.get('/', async (request, reply) => {
  return reply.sendFile('index.html')
})

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server listening on port 3000')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()