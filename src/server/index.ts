import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = Fastify();

server.register(fastifyStatic, {
  root: path.join(__dirname, '../client'),
  prefix: '/',
});

server.get('/health', async () => {
  return { status: 'ok' };
});

server.get('/*', (request, reply) => {
  // This will only work if the plugin is registered correctly!
  reply.sendFile('index.html');
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
server.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});