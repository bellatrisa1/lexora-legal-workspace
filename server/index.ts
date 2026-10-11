import { createPool } from './database';
import { createRepository } from './repository';
import { createApp } from './app';
async function main() {
  if (process.env.DEMO_API_ENABLED !== 'true' || process.env.NODE_ENV === 'production')
    throw new Error(
      'API requires explicit local demo mode. Production authentication is not implemented.',
    );
  const pool = createPool();
  await pool.query('SELECT 1');
  const port = Number(process.env.API_PORT ?? 4000);
  const app = createApp(createRepository(pool), {
    demoEnabled: true,
    origin: process.env.APP_ORIGIN ?? 'http://localhost:3000',
  });
  const server = app.listen(port, '127.0.0.1', () =>
    console.info(`Lexora demo API: http://127.0.0.1:${port}`),
  );
  const stop = () =>
    server.close(() => {
      void pool.end();
    });
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'API startup failed');
  process.exitCode = 1;
});
