import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = Fastify();

// Serve static files from dist/client
server.register(fastifyStatic, {
  root: path.join(__dirname, '../client'),
  prefix: '/', // Serve static files at root
});

// Health check endpoint for DigitalOcean
server.get('/health', async () => {
  return { status: 'ok' };
});

// SPA fallback: serve index.html for any unmatched route
server.get('/*', (request, reply) => {
  reply.sendFile('index.html');
});

// Listen on correct port and host for DigitalOcean
const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
server.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});