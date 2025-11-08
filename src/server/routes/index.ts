import { FastifyInstance } from 'fastify';
import adminApiRoutes from './admin-api';
import apiRoutes from './api';
import authRoutes from './auth';
import publicApiRoutes from './public-api';

export async function registerRoutes(fastify: FastifyInstance) {
  // Register all route groups
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(apiRoutes, { prefix: '/api' });
  await fastify.register(adminApiRoutes, { prefix: '/admin-api' });
  await fastify.register(publicApiRoutes, { prefix: '/api/public' });

  // Client app / index page
  fastify.get('/', async (req, reply) => {
    if (req.user) {
      return reply.view('generic-spa', {
        scriptName: 'app',
        scriptNonce: reply.cspNonce.script,
        styleNonce: reply.cspNonce.style,
      });
    }
    return reply.view('generic-spa', {
      scriptName: 'login',
      scriptNonce: reply.cspNonce.script,
      styleNonce: reply.cspNonce.style,
    });
  });
}