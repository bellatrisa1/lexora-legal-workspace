import { createPool } from './database';
import { migrate } from './migrate';
import { seed } from './seed';
async function main() {
  const pool = createPool();
  try {
    if (process.argv[2] === 'migrate') await migrate(pool);
    else if (process.argv[2] === 'seed') await seed(pool);
    else throw new Error('Expected migrate or seed');
    console.info('Database command completed.');
  } finally {
    await pool.end();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Database command failed');
  process.exitCode = 1;
});
