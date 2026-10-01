import {
  matterSchema,
  matterStatuses,
  messageSchema,
  taskStatuses,
  type Activity,
  type Matter,
  type SessionContext,
} from '../domain';
import * as seed from '../fixtures';
import { canViewMatter, capabilities } from '../policy';
import { ApiError, type WorkspaceApi } from './contracts';
const initial = () =>
  structuredClone({
    matters: seed.matters,
    documents: seed.documents,
    tasks: seed.tasks,
    messages: seed.messages,
    activities: seed.activities,
  });
let records = initial();
let failNext = false;
async function delay() {
  // Capture the outcome when a call starts; an older in-flight call must not consume the next simulated failure.
  const shouldFail = failNext;
  failNext = false;
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (shouldFail) throw new ApiError('unavailable');
}
function actor(context: SessionContext) {
  const user = seed.users.find(
    (u) => u.id === context.userId && u.organizationId === context.organizationId,
  );
  if (!user) throw new ApiError('forbidden');
  return user;
}
function find(context: SessionContext, id: string) {
  const user = actor(context);
  const matter = records.matters.find((m) => m.id === id && canViewMatter(user, m));
  if (!matter) throw new ApiError('notFound');
  return matter;
}
function record(
  context: SessionContext,
  matterId: string,
  event:
    | Omit<
        Extract<Activity, { type: 'status_changed' }>,
        'id' | 'organizationId' | 'matterId' | 'actorId' | 'createdAt'
      >
    | Omit<
        Extract<Activity, { type: 'task_updated' }>,
        'id' | 'organizationId' | 'matterId' | 'actorId' | 'createdAt'
      >
    | { type: 'matter_created' | 'message_sent' },
) {
  const createdAt = new Date().toISOString();
  records.activities.unshift({
    ...event,
    id: crypto.randomUUID(),
    organizationId: context.organizationId,
    matterId,
    actorId: context.userId,
    createdAt,
  });
  const matter = records.matters.find((m) => m.id === matterId);
  if (matter) matter.updatedAt = createdAt;
}
// Client-side scoping only models API behavior. Production authorization must run on a trusted server.
export const mockWorkspaceApi: WorkspaceApi = {
  async getWorkspace(context) {
    await delay();
    const user = actor(context);
    const matters = records.matters.filter((m) => canViewMatter(user, m));
    const ids = new Set(matters.map((m) => m.id));
    return structuredClone({
      organization: seed.organization,
      currentUser: user,
      users: seed.users.filter((u) => u.organizationId === context.organizationId),
      clients: seed.clients.filter(
        (c) =>
          c.organizationId === context.organizationId &&
          (user.role !== 'client' || c.id === user.clientId),
      ),
      matters,
      documents: records.documents.filter((d) => ids.has(d.matterId)),
      tasks: records.tasks.filter((t) => ids.has(t.matterId)),
      messages: records.messages.filter((m) => ids.has(m.matterId)),
      activities: records.activities.filter((a) => ids.has(a.matterId)),
      jurisdictions: seed.jurisdictions,
      practiceAreas: seed.practiceAreas,
    });
  },
  async createMatter(context, input) {
    await delay();
    const user = actor(context);
    const parsed = matterSchema.safeParse(input);
    if (!parsed.success) throw new ApiError('invalidInput');
    const value = parsed.data;
    const client = seed.clients.find(
      (c) => c.id === value.clientId && c.organizationId === context.organizationId,
    );
    if (
      !client ||
      !seed.practiceAreas.some((p) => p.id === value.practiceAreaId) ||
      !seed.jurisdictions.some((j) => j.id === value.jurisdictionId)
    )
      throw new ApiError('invalidInput');
    if (user.role === 'client' && value.clientId !== user.clientId) throw new ApiError('forbidden');
    if (!capabilities(user).assignCounsel && value.leadCounselId) throw new ApiError('forbidden');
    if (
      value.leadCounselId &&
      !seed.users.some(
        (u) =>
          u.id === value.leadCounselId &&
          u.organizationId === context.organizationId &&
          u.role === 'lawyer',
      )
    )
      throw new ApiError('invalidInput');
    const id = String(Math.max(...records.matters.map((m) => Number(m.id))) + 1);
    const now = new Date().toISOString();
    const matter: Matter = {
      ...value,
      id,
      reference: `LEX-${new Date().getUTCFullYear()}-${id}`,
      organizationId: context.organizationId,
      status: 'open',
      teamIds: value.leadCounselId ? [value.leadCounselId] : [],
      createdAt: now,
      updatedAt: now,
    };
    records.matters.unshift(matter);
    record(context, id, { type: 'matter_created' });
    return structuredClone(matter);
  },
  async changeStatus(context, id, status) {
    await delay();
    const user = actor(context);
    const matter = find(context, id);
    if (!capabilities(user).changeMatterStatus) throw new ApiError('forbidden');
    if (!matterStatuses.includes(status)) throw new ApiError('invalidStatus');
    if (matter.status === status) return;
    const from = matter.status;
    matter.status = status;
    record(context, id, { type: 'status_changed', from, to: status });
  },
  async sendMessage(context, id, text) {
    await delay();
    actor(context);
    find(context, id);
    const parsed = messageSchema.safeParse(text);
    if (!parsed.success) throw new ApiError('invalidInput');
    records.messages.push({
      id: crypto.randomUUID(),
      organizationId: context.organizationId,
      matterId: id,
      authorId: context.userId,
      text: parsed.data,
      createdAt: new Date().toISOString(),
    });
    record(context, id, { type: 'message_sent' });
  },
  async updateTask(context, id, status) {
    await delay();
    const user = actor(context);
    const task = records.tasks.find((t) => t.id === id);
    if (!task) throw new ApiError('notFound');
    find(context, task.matterId);
    if (!capabilities(user).manageTasks) throw new ApiError('forbidden');
    if (!taskStatuses.includes(status)) throw new ApiError('invalidInput');
    if (task.status === status) return;
    task.status = status;
    record(context, task.matterId, { type: 'task_updated', taskId: id, status });
  },
};
export function simulateFailure() {
  failNext = true;
}
export function resetDemo() {
  records = initial();
  failNext = false;
}
