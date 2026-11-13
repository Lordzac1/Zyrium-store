import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify({ logger: true });

app.register(cors, {
  origin: '*'
});

app.get('/health', async () => {
  return {
    status: 'online',
    server: 'ZYRIUM MC',
    ip: 'zyriummc.bed.net.br',
    version: '1.21.11'
  };
});

app.get('/api/pix-info', async () => {
  return {
    holder: 'Isaac Nunes',
    pixKey: '11933593038'
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 API ZYRIUM MC rodando na porta ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
