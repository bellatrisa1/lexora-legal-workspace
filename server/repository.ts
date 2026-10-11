import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { ApiError, type WorkspaceApi } from '../src/lib/api/contracts';
import {
  matterSchema,
  matterStatuses,
  messageSchema,
  taskStatuses,
  type Activity,
  type Matter,
  type SessionContext,
  type User,
  type WorkspaceData,
} from '../src/lib/domain';
import { capabilities, canViewMatter } from '../src/lib/policy';
import { transaction, insert, type Table } from './database';
async function rows<T>(db: PoolClient, table: Table, org?: string): Promise<T[]> {
  const result = await db.query<{ value: T }>(
    `SELECT row_to_json(t) AS value FROM ${table} t ${org ? 'WHERE "organizationId"=$1' : ''}`,
    org ? [org] : [],
  );
  return result.rows.map((r) => r.value);
}
async function actor(db: PoolClient, context: SessionContext) {
  const users = await rows<User>(db, 'users', context.organizationId);
  const user = users.find((u) => u.id === context.userId);
  if (!user) throw new ApiError('forbidden');
  return user;
}
async function matter(db: PoolClient, context: SessionContext, id: string, user: User) {
  const result = await db.query<{ value: Matter }>(
    'SELECT row_to_json(m) AS value FROM matters m WHERE id=$1 AND "organizationId"=$2 FOR UPDATE',
    [id, context.organizationId],
  );
  const value = result.rows[0]?.value;
  if (!value || !canViewMatter(user, value)) throw new ApiError('notFound');
  return value;
}
// Событие и изменение сущности записываются одной транзакцией; ошибку нельзя оставить только в истории.
async function record(
  db: PoolClient,
  context: SessionContext,
  matterId: string,
  type: Activity['type'],
  payload: object = {},
) {
  await insert(db, 'activities', {
    id: randomUUID(),
    organizationId: context.organizationId,
    actorId: context.userId,
    matterId,
    type,
    payload,
  });
  await db.query('UPDATE matters SET "updatedAt"=now() WHERE id=$1 AND "organizationId"=$2', [
    matterId,
    context.organizationId,
  ]);
}
export function createRepository(pool: Pool): WorkspaceApi {
  return {
    getWorkspace: (context) =>
      transaction(pool, async (db) => {
        await db.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        const currentUser = await actor(db, context);
        const organizations = await rows<WorkspaceData['organization']>(db, 'organizations');
        const organization = organizations.find((o) => o.id === context.organizationId);
        if (!organization) throw new ApiError('notFound');
        const matters = (await rows<Matter>(db, 'matters', context.organizationId))
          .filter((m) => canViewMatter(currentUser, m))
          .map((m) => ({ ...m, leadCounselId: m.leadCounselId ?? '' }))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const ids = new Set(matters.map((m) => m.id));
        const users = await rows<User>(db, 'users', context.organizationId);
        const clients = (
          await rows<WorkspaceData['clients'][number]>(db, 'clients', context.organizationId)
        ).filter((c) => currentUser.role !== 'client' || c.id === currentUser.clientId);
        const documents = (
          await rows<WorkspaceData['documents'][number]>(db, 'documents', context.organizationId)
        ).filter((d) => ids.has(d.matterId));
        const tasks = (
          await rows<WorkspaceData['tasks'][number]>(db, 'tasks', context.organizationId)
        ).filter((t) => ids.has(t.matterId));
        const messages = (
          await rows<WorkspaceData['messages'][number]>(db, 'messages', context.organizationId)
        )
          .filter((m) => ids.has(m.matterId))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const activityRows = await rows<Activity & { payload: object }>(
          db,
          'activities',
          context.organizationId,
        );
        const activities = activityRows
          .filter((a) => ids.has(a.matterId))
          .map(({ payload, ...a }) => ({ ...a, ...payload }) as Activity);
        return {
          organization,
          currentUser,
          users,
          clients,
          matters,
          documents,
          tasks,
          messages,
          activities,
          jurisdictions: await rows(db, 'jurisdictions'),
          practiceAreas: await rows(db, 'practices'),
        };
      }),
    createMatter: (context, input) =>
      transaction(pool, async (db) => {
        const user = await actor(db, context);
        const parsed = matterSchema.safeParse(input);
        if (!parsed.success) throw new ApiError('invalidInput');
        const value = parsed.data;
        if (user.role === 'client' && value.clientId !== user.clientId)
          throw new ApiError('forbidden');
        if (value.leadCounselId && !capabilities(user).assignCounsel)
          throw new ApiError('forbidden');
        if (value.leadCounselId) {
          const counsel = await db.query(
            'SELECT id FROM users WHERE id=$1 AND "organizationId"=$2 AND role=$3',
            [value.leadCounselId, context.organizationId, 'lawyer'],
          );
          if (!counsel.rowCount) throw new ApiError('invalidInput');
        }
        const sequence = await db.query<{ number: string }>(
          "SELECT nextval('matter_reference_seq')::text AS number",
        );
        const id = randomUUID();
        const now = new Date().toISOString();
        const result: Matter = {
          ...value,
          id,
          organizationId: context.organizationId,
          reference: `LEX-${new Date().getUTCFullYear()}-${sequence.rows[0].number}`,
          status: 'open',
          teamIds: value.leadCounselId ? [value.leadCounselId] : [],
          createdAt: now,
          updatedAt: now,
        };
        await insert(db, 'matters', { ...result, leadCounselId: result.leadCounselId || null });
        await record(db, context, id, 'matter_created');
        return result;
      }),
    changeStatus: (context, id, status) =>
      transaction(pool, async (db) => {
        const user = await actor(db, context);
        if (!capabilities(user).changeMatterStatus) throw new ApiError('forbidden');
        if (!matterStatuses.includes(status)) throw new ApiError('invalidStatus');
        const current = await matter(db, context, id, user);
        if (current.status === status) return;
        await db.query('UPDATE matters SET status=$1 WHERE id=$2', [status, id]);
        await record(db, context, id, 'status_changed', { from: current.status, to: status });
      }),
    sendMessage: (context, id, text) =>
      transaction(pool, async (db) => {
        const user = await actor(db, context);
        await matter(db, context, id, user);
        const parsed = messageSchema.safeParse(text);
        if (!parsed.success) throw new ApiError('invalidInput');
        await insert(db, 'messages', {
          id: randomUUID(),
          organizationId: context.organizationId,
          matterId: id,
          authorId: user.id,
          text: parsed.data,
        });
        await record(db, context, id, 'message_sent');
      }),
    updateTask: (context, id, status) =>
      transaction(pool, async (db) => {
        const user = await actor(db, context);
        if (!capabilities(user).manageTasks) throw new ApiError('forbidden');
        if (!taskStatuses.includes(status)) throw new ApiError('invalidInput');
        const result = await db.query<{ value: WorkspaceData['tasks'][number] }>(
          'SELECT row_to_json(t) AS value FROM tasks t WHERE id=$1 AND "organizationId"=$2 FOR UPDATE',
          [id, context.organizationId],
        );
        const task = result.rows[0]?.value;
        if (!task) throw new ApiError('notFound');
        await matter(db, context, task.matterId, user);
        if (task.status === status) return;
        await db.query('UPDATE tasks SET status=$1 WHERE id=$2', [status, id]);
        await record(db, context, task.matterId, 'task_updated', { taskId: id, status });
      }),
  };
}
