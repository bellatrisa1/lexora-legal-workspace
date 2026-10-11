'use client';
import { useT } from '@/i18n/provider';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TaskStatus, WorkspaceData } from '@/lib/domain';
import { taskStatuses } from '@/lib/domain';
import { capabilities } from '@/lib/policy';
import { api } from '@/lib/api';
import { usePresentation } from '@/lib/presentation';
import { matterName } from '@/lib/selectors';
import { useWorkspace, useFormat } from '@/lib/queries';
import { useWorkspaceContext } from '../providers';
import { Avatar, Badge, PriorityBadge, Empty, ErrorState, Loading, PageHeading } from '../common';
import s from '../ui.module.scss';
export function TaskList({ data, matterId }: { data: WorkspaceData; matterId?: string }) {
  const { errorMessage, taskLabels } = usePresentation();

  const translate = useT();

  const [filter, setFilter] = useState('active');
  const [success, setSuccess] = useState(false);
  const { session } = useWorkspaceContext();
  const cache = useQueryClient();
  const format = useFormat();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTask(session, id, status),
    onSuccess: async () => {
      setSuccess(true);
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
          aria-label={translate('tasks.taskFilter')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="active"> {translate('tasks.openTasks')} </option>
          <option value="all"> {translate('tasks.allTasks')} </option>
          {taskStatuses.map((status) => (
            <option key={status} value={status}>
              {taskLabels[status]}
            </option>
          ))}
        </select>
        <span className={s.small} role="status">
          {success
            ? translate('tasks.taskUpdated')
            : translate('tasks.count', { count: tasks.length })}
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
                <th> {translate('tasks.taskMatter')} </th>
                <th> {translate('tasks.assignee')} </th>
                <th> {translate('tasks.dueDate')} </th>
                <th> {translate('matters.priority')} </th>
                <th> {translate('matters.status')} </th>
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
                    <td data-label={translate('tasks.assignee')}>
                      <span className={s.person}>
                        {assignee && <Avatar name={assignee.name} />}{' '}
                        {assignee?.name ?? translate('matters.unassigned')}
                      </span>
                    </td>
                    <td data-label={translate('tasks.dueDate')}>
                      {format.date(task.dueDate, 'short')}
                    </td>
                    <td data-label={translate('matters.priority')}>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td data-label={translate('matters.status')}>
                      {can.manageTasks ? (
                        <select
                          className={s.select}
                          aria-label={translate('tasks.statusFor', { title: task.title })}
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
          title={translate('tasks.noTasksInThisView')}
          text={translate('tasks.yourTeamsWorkItemsWillAppearHere')}
        />
      )}
    </>
  );
}
export function TasksPage() {
  const { errorMessage } = usePresentation();

  const translate = useT();

  const query = useWorkspace();
  if (query.isPending) return <Loading />;
  if (query.error)
    return <ErrorState message={errorMessage(query.error)} retry={() => query.refetch()} />;
  return (
    <>
      <PageHeading
        title={translate('navigation.tasks')}
        description={translate('tasks.keepLegalWorkMovingOneClearNext')}
      />
      <section className={s.panel}>
        <TaskList data={query.data} />
      </section>
    </>
  );
}
