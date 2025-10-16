import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = Fastify({
    logger: true
});
server.register(fastifyStatic, {
    root: join(__dirname, '../../dist/client'),
    prefix: '/',
    decorateReply: false
});
server.get('/health', async (request, reply) => {
    return { status: 'ok' };
});
server.setNotFoundHandler((request, reply) => {
    return reply.sendFile('index.html');
});
server.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        await server.listen({ port, host: '0.0.0.0' });
        server.log.info(`Server listening on port ${port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
export default server;
