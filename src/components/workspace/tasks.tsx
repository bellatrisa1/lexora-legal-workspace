'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskStatus, WorkspaceData } from '@/lib/domain';
import { taskStatuses } from '@/lib/domain';
import { capabilities } from '@/lib/policy';
import { api } from '@/lib/api';
import { errorMessage, taskLabels } from '@/lib/presentation';
import { matterName } from '@/lib/selectors';
import { useWorkspace, useFormat } from '@/lib/queries';
import { useWorkspaceContext } from '../providers';
import { Avatar, Badge, PriorityBadge, Empty, ErrorState, Loading, PageHeading } from '../common';
import s from '../ui.module.scss';
export function TaskList({ data, matterId }: { data: WorkspaceData; matterId?: string }) {
  const [filter, setFilter] = useState('active');
  const [success, setSuccess] = useState('');
  const { session } = useWorkspaceContext();
  const cache = useQueryClient();
  const format = useFormat();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTask(session, id, status),
    onSuccess: async () => {
      setSuccess('Task updated.');
      await cache.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
  const tasks = data.tasks
    .filter(
      (t) =>
        (!matterId || t.matterId === matterId) &&
        (filter === 'all' ||
          (filter === 'active' ? t.status !== 'completed' : t.status === filter)),
    )
    .toSorted((a, b) => a.dueDate.localeCompare(b.dueDate));
  const can = capabilities(data.currentUser);
  return (
    <>
      <div className={s.toolbar}>
        <select
          className={s.select}
          aria-label="Task filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active">Open tasks</option>
          <option value="all">All tasks</option>
          {taskStatuses.map((status) => (
            <option key={status} value={status}>
              {taskLabels[status]}
            </option>
          ))}
        </select>
        <span className={s.small} role="status">
          {success || `${tasks.length} tasks`}
        </span>
        {mutation.error && (
          <span className={s.error} role="alert">
            {errorMessage(mutation.error)}
          </span>
        )}
      </div>
      {tasks.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Task / Matter</th>
                <th>Assignee</th>
                <th>Due date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const assignee = data.users.find((u) => u.id === task.assigneeId);
                return (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      <small>
                        <Link href={`/matters/${task.matterId}?tab=tasks`}>
                          {matterName(data, task.matterId)}
                        </Link>
                      </small>
                    </td>
                    <td data-label="Assignee">
                      <span className={s.person}>
                        {assignee && <Avatar name={assignee.name} />}{' '}
                        {assignee?.name ?? 'Unassigned'}
                      </span>
                    </td>
                    <td data-label="Due date">{format.date(task.dueDate, 'short')}</td>
                    <td data-label="Priority">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td data-label="Status">
                      {can.manageTasks ? (
                        <select
                          className={s.select}
                          aria-label={`Status for ${task.title}`}
                          value={task.status}
                          disabled={mutation.isPending}
                          onChange={(e) =>
                            mutation.mutate({ id: task.id, status: e.target.value as TaskStatus })
                          }
                        >
                          {taskStatuses.map((status) => (
                            <option key={status} value={status}>
                              {taskLabels[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge status={task.status} label={taskLabels[task.status]} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No tasks in this view"
          text="Your team’s work items will appear here. Try selecting all tasks."
        />
      )}
    </>
  );
}
export function TasksPage() {
  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  return (
    <>
      <PageHeading
        title="Tasks"
        description="Keep legal work moving, one clear next step at a time."
      />
      <section className={s.panel}>
        <TaskList data={query.data} />
      </section>
    </>
  );
}
