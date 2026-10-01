import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../src/lib/api';
import { resetDemo, simulateFailure } from '../src/lib/api/mock';
import { matterSchema } from '../src/lib/domain';
const lawyer = { organizationId: 'org-lex', userId: 'olivia' };
const client = { organizationId: 'org-lex', userId: 'alex' };
const input = {
  title: 'International licensing review',
  clientId: 'asteria',
  practiceAreaId: 'ip',
  jurisdictionId: 'ew',
  leadCounselId: '',
  priority: 'medium' as const,
  description: 'Review the proposed licensing arrangement and commercial scope.',
  targetDate: '2099-12-01',
};
beforeEach(resetDemo);
describe('Workspace mock API', () => {
  it('scopes all related records to the client’s matters', async () => {
    const data = await api.getWorkspace(client);
    expect(data.matters).toHaveLength(2);
    expect((await api.getWorkspace(lawyer)).matters).toHaveLength(7);
    const ids = new Set(data.matters.map((m) => m.id));
    for (const group of [data.documents, data.tasks, data.messages, data.activities])
      expect(group.every((x) => ids.has(x.matterId))).toBe(true);
    await expect(api.sendMessage(client, '1047', 'Hello')).rejects.toThrow('notFound');
  });
  it('creates a matter visible to its client and legal team', async () => {
    const created = await api.createMatter(client, input);
    expect(created.status).toBe('open');
    expect((await api.getWorkspace(lawyer)).matters.find((m) => m.id === created.id)?.title).toBe(
      input.title,
    );
  });
  it('validates schema and related entities at the adapter boundary', async () => {
    await expect(api.createMatter(lawyer, { ...input, title: 'a' })).rejects.toThrow(
      'invalidInput',
    );
    expect(matterSchema.safeParse({ ...input, targetDate: '2020-01-01' }).success).toBe(false);
    await expect(api.createMatter(lawyer, { ...input, jurisdictionId: 'missing' })).rejects.toThrow(
      'invalidInput',
    );
  });
  it('prevents client status changes and records before/after values', async () => {
    await expect(api.changeStatus(client, '1048', 'closed')).rejects.toThrow('forbidden');
    await api.changeStatus(lawyer, '1048', 'closed');
    const data = await api.getWorkspace(client);
    expect(data.matters.find((m) => m.id === '1048')?.status).toBe('closed');
    expect(data.activities[0]).toMatchObject({
      type: 'status_changed',
      from: 'in_review',
      to: 'closed',
      actorId: 'olivia',
    });
  });
  it('retains message flow without fabricating a lawyer reply', async () => {
    const before = (await api.getWorkspace(client)).messages.length;
    await api.sendMessage(client, '1048', 'Please review our commercial instructions.');
    let data = await api.getWorkspace(client);
    expect(data.messages).toHaveLength(before + 1);
    expect(data.messages.at(-1)?.authorId).toBe('alex');
    await api.sendMessage(lawyer, '1048', 'We will review the instructions.');
    data = await api.getWorkspace(client);
    expect(data.messages).toHaveLength(before + 2);
  });
  it('isolates returned copies and recovers from a one-time failure', async () => {
    const data = await api.getWorkspace(lawyer);
    data.matters[0].title = 'changed';
    expect((await api.getWorkspace(lawyer)).matters[0].title).toBe('Northstar Acquisition');
    simulateFailure();
    await expect(api.getWorkspace(lawyer)).rejects.toThrow('unavailable');
    expect((await api.getWorkspace(lawyer)).matters).toHaveLength(7);
  });
  it('rejects a forged organization context and client assignment', async () => {
    await expect(api.getWorkspace({ ...lawyer, organizationId: 'another-org' })).rejects.toThrow(
      'forbidden',
    );
    await expect(api.createMatter(client, { ...input, clientId: 'aurelia' })).rejects.toThrow(
      'forbidden',
    );
    await expect(api.createMatter(client, { ...input, leadCounselId: 'olivia' })).rejects.toThrow(
      'forbidden',
    );
  });
  it('changes task state and appends a typed activity', async () => {
    await expect(api.updateTask(client, 't1', 'completed')).rejects.toThrow('forbidden');
    await api.updateTask(lawyer, 't1', 'completed');
    const data = await api.getWorkspace(lawyer);
    expect(data.tasks.find((t) => t.id === 't1')?.status).toBe('completed');
    expect(data.activities[0]).toMatchObject({
      type: 'task_updated',
      taskId: 't1',
      status: 'completed',
    });
  });
});

it('does not let an older in-flight call consume a simulated failure', async () => {
  const previous = api.getWorkspace(lawyer);
  simulateFailure();
  const next = api.getWorkspace(lawyer);
  const [first, second] = await Promise.allSettled([previous, next]);
  expect(first.status).toBe('fulfilled');
  expect(second.status).toBe('rejected');
  if (second.status === 'rejected') expect(second.reason).toMatchObject({ code: 'unavailable' });
  await expect(api.getWorkspace(lawyer)).resolves.toHaveProperty('matters');
});
