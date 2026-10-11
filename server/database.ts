import { Pool, type PoolClient } from 'pg';
export function createPool(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL is required');
  return new Pool({ connectionString: url, max: 10, connectionTimeoutMillis: 5000 });
}
export async function transaction<T>(pool: Pool, run: (db: PoolClient) => Promise<T>): Promise<T> {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const result = await run(db);
    await db.query('COMMIT');
    return result;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    db.release();
  }
}
export const tables = [
  'organizations',
  'jurisdictions',
  'practices',
  'clients',
  'users',
  'matters',
  'documents',
  'tasks',
  'messages',
  'activities',
] as const;
export type Table = (typeof tables)[number];
export async function insert(db: PoolClient, table: Table, value: object, ignore = false) {
  const entries = Object.entries(value);
  const columns = entries.map(([key]) => `"${key.replaceAll('"', '""')}"`).join(',');
  await db.query(
    `INSERT INTO ${table} (${columns}) VALUES (${entries.map((_, i) => `$${i + 1}`).join(',')}) ${ignore ? 'ON CONFLICT DO NOTHING' : ''}`,
    entries.map(([, v]) => v),
  );
}
