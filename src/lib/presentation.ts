import type { Activity, MatterStatus, Priority, TaskStatus, WorkspaceData } from './domain';
import { ApiError } from './api/contracts';
import { useT } from '@/i18n/provider';
export function usePresentation() {
  const t = useT();
  const statusLabels: Record<MatterStatus, string> = {
    open: t('domain.open'),
    in_progress: t('domain.inProgress'),
    in_review: t('home.inReview'),
    client_action: t('domain.clientActionRequired'),
    on_hold: t('domain.onHold'),
    closed: t('matters.closed'),
  };
  const priorityLabels: Record<Priority, string> = {
    low: t('domain.low'),
    medium: t('domain.medium'),
    high: t('domain.high'),
  };
  const taskLabels: Record<TaskStatus, string> = {
    todo: t('domain.toDo'),
    in_progress: t('domain.inProgress'),
    blocked: t('domain.blocked'),
    completed: t('domain.completed'),
  };
  const documentLabels = {
    draft: t('domain.draft'),
    under_review: t('domain.underReview'),
    approved: t('domain.approved'),
    executed: t('domain.executed'),
    archived: t('domain.archived'),
  };
  function errorMessage(error: unknown) {
    return t(`errors.${error instanceof ApiError ? error.code : 'unknown'}`);
  }
  function activityText(event: Activity, data: WorkspaceData) {
    switch (event.type) {
      case 'matter_created':
        return t('domain.createdTheMatter');
      case 'status_changed':
        return t('domain.statusChanged', {
          from: statusLabels[event.from],
          to: statusLabels[event.to],
        });
      case 'counsel_assigned':
        return t('domain.counselAssigned', {
          name: data.users.find((u) => u.id === event.userId)?.name ?? t('domain.aTeamMember'),
        });
      case 'document_added':
        return t('domain.documentAdded', {
          name:
            data.documents.find((d) => d.id === event.documentId)?.name ?? t('domain.aDocument'),
        });
      case 'message_sent':
        return t('domain.sentAMessage');
      case 'task_updated':
        return t('domain.taskUpdated', {
          title: data.tasks.find((task) => task.id === event.taskId)?.title ?? t('domain.task'),
          status: taskLabels[event.status],
        });
    }
  }

  return { statusLabels, priorityLabels, taskLabels, documentLabels, errorMessage, activityText };
}
