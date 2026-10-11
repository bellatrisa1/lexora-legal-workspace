import * as fixtures from '../src/lib/fixtures';
import { createPool, transaction, insert, type Table } from './database';
export async function seed(pool: ReturnType<typeof createPool>) {
  await transaction(pool, async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(781043)');
    const groups: [Table, object[]][] = [
      ['organizations', [fixtures.organization]],
      ['jurisdictions', fixtures.jurisdictions],
      ['practices', fixtures.practiceAreas],
      ['clients', fixtures.clients],
      ['users', fixtures.users],
      ['matters', fixtures.matters.map((m) => ({ ...m, leadCounselId: m.leadCounselId || null }))],
      ['documents', fixtures.documents],
      ['tasks', fixtures.tasks],
      ['messages', fixtures.messages],
      [
        'activities',
        fixtures.activities.map(
          ({ id, organizationId, matterId, actorId, createdAt, type, ...payload }) => ({
            id,
            organizationId,
            matterId,
            actorId,
            createdAt,
            type,
            payload,
          }),
        ),
      ],
    ];
    for (const [table, rows] of groups) for (const row of rows) await insert(db, table, row, true);
  });
}
