import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import type { Server } from 'node:http';
import { randomUUID } from 'node:crypto';
import { migrate } from '../server/migrate';
import { seed } from '../server/seed';
import { createRepository } from '../server/repository';
import { createApp } from '../server/app';
const databaseUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!databaseUrl)('Express + PostgreSQL integration', () => {
  let pool: Pool;
  let admin: Pool;
  let server: Server;
  let base: string;
  const schema = 'test_' + randomUUID().replaceAll('-', '');
  const context = { organizationId: 'org-lex', userId: 'olivia' };
  const input = {
    title: 'Persisted international matter',
    clientId: 'asteria',
    practiceAreaId: 'ip',
    jurisdictionId: 'ew',
    leadCounselId: 'olivia',
    priority: 'high',
    description: 'Coordinate a cross-border review with international counsel.',
    targetDate: '2099-12-01',
  };
  async function request(path: string, method = 'GET', body?: unknown, user = 'olivia') {
    return fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-demo-organization': 'org-lex',
        'x-demo-user': user,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  beforeAll(async () => {
    admin = new Pool({ connectionString: databaseUrl });
    await admin.query(`CREATE SCHEMA ${schema}`);
    pool = new Pool({ connectionString: databaseUrl, options: `-c search_path=${schema}` });
    await migrate(pool);
    await migrate(pool);
    await seed(pool);
    await seed(pool);
    const app = createApp(createRepository(pool), {
      demoEnabled: true,
      origin: 'http://localhost:3000',
    });
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing address');
    base = `http://127.0.0.1:${address.port}/api/v1`;
  });
  afterAll(async () => {
    if (server)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    await pool?.end();
    if (admin) {
      await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await admin.end();
    }
  });
  it('applies migration and seed twice without duplicates', async () => {
    const workspace = await createRepository(pool).getWorkspace(context);
    expect(workspace.matters).toHaveLength(7);
    expect(workspace.clients).toHaveLength(6);
    expect((await pool.query('SELECT * FROM schema_migrations')).rowCount).toBe(1);
  });
  it('persists creation, messages, task updates and activity through REST', async () => {
    const response = await request('/matters', 'POST', input);
    expect(response.status).toBe(201);
    const matter = await response.json();
    expect(
      (
        await request(
          `/matters/${matter.id}/messages`,
          'POST',
          { text: 'Please review the terms.' },
          'alex',
        )
      ).status,
    ).toBe(204);
    expect(
      (await request(`/matters/${matter.id}/status`, 'PATCH', { status: 'in_review' })).status,
    ).toBe(204);
    const reconnected = new Pool({
      connectionString: databaseUrl,
      options: `-c search_path=${schema}`,
    });
    try {
      const data = await createRepository(reconnected).getWorkspace(context);
      expect(data.matters.find((m) => m.id === matter.id)?.status).toBe('in_review');
      expect(data.messages.some((m) => m.text === 'Please review the terms.')).toBe(true);
      expect(data.activities.filter((a) => a.matterId === matter.id)).toHaveLength(3);
      const task = data.tasks.find((t) => t.status !== 'completed')!;
      expect(
        (await request(`/tasks/${task.id}/status`, 'PATCH', { status: 'completed' })).status,
      ).toBe(204);
    } finally {
      await reconnected.end();
    }
  });
  it('validates requests and prevents forbidden client changes', async () => {
    expect((await request('/matters', 'POST', { ...input, title: 'X' })).status).toBe(400);
    expect((await request('/matters', 'POST', { ...input, clientId: 'missing' })).status).toBe(400);
    expect(
      (await request('/matters', 'POST', { ...input, clientId: 'aurelia' }, 'alex')).status,
    ).toBe(403);
    expect(
      (await request('/matters/1048/status', 'PATCH', { status: 'closed' }, 'alex')).status,
    ).toBe(403);
    expect((await request('/workspace', 'GET', undefined, 'unknown')).status).toBe(403);
    const response = await request('/workspace', 'GET', undefined, 'alex');
    const data = await response.json();
    expect(data.matters.every((m: { clientId: string }) => m.clientId === 'asteria')).toBe(true);
    expect(
      (await request('/matters/1047/messages', 'POST', { text: 'Blocked' }, 'alex')).status,
    ).toBe(404);
  });
  it('serializes concurrent updates and records accurate previous statuses', async () => {
    const repo = createRepository(pool);
    await Promise.all([
      repo.changeStatus(context, '1046', 'in_review'),
      repo.changeStatus(context, '1046', 'closed'),
    ]);
    const data = await repo.getWorkspace(context);
    const events = data.activities.filter(
      (a) => a.matterId === '1046' && a.type === 'status_changed',
    );
    expect(events).toHaveLength(2);
    const final = data.matters.find((m) => m.id === '1046')!;
    expect(events.some((e) => e.type === 'status_changed' && e.to === final.status)).toBe(true);
  });
  it('returns JSON errors and rejects requests from unrelated origins', async () => {
    const response = await fetch(base + '/workspace', {
      headers: { origin: 'https://unrelated.example' },
    });
    expect(response.status).toBe(403);
    expect((await request('/missing')).status).toBe(404);
    const invalid = await fetch(base + '/matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    expect(invalid.status).toBe(400);
  });
});
