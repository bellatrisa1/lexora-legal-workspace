import type { Activity, MatterStatus, Priority, TaskStatus, WorkspaceData } from './domain';
import { ApiError } from './api/contracts';
import messages from '@/i18n/messages/en.json';
export const statusLabels: Record<MatterStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  in_review: 'In Review',
  client_action: 'Client Action Required',
  on_hold: 'On Hold',
  closed: 'Closed',
};
export const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
export const taskLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
};
export const documentLabels = {
  draft: 'Draft',
  under_review: 'Under Review',
  approved: 'Approved',
  executed: 'Executed',
  archived: 'Archived',
};
export function errorMessage(error: unknown) {
  return messages.errors[error instanceof ApiError ? error.code : 'unknown'];
}
export function activityText(event: Activity, data: WorkspaceData) {
  switch (event.type) {
    case 'matter_created':
      return 'created the matter';
    case 'status_changed':
      return `changed status from ${statusLabels[event.from]} to ${statusLabels[event.to]}`;
    case 'counsel_assigned':
      return `assigned ${data.users.find((u) => u.id === event.userId)?.name ?? 'a team member'} as lead counsel`;
    case 'document_added':
      return `added ${data.documents.find((d) => d.id === event.documentId)?.name ?? 'a document'}`;
    case 'message_sent':
      return 'sent a message';
    case 'task_updated':
      return `marked “${data.tasks.find((t) => t.id === event.taskId)?.title ?? 'Task'}” as ${taskLabels[event.status]}`;
  }
}
