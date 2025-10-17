import Fastify from 'fastify';

const fastify = Fastify();

// Parse the PORT environment variable to ensure it's a number
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

fastify.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running at ${address}`);
});