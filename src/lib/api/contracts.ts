import type {
  Matter,
  MatterInput,
  MatterStatus,
  SessionContext,
  TaskStatus,
  WorkspaceData,
} from '../domain';
export interface WorkspaceApi {
  getWorkspace(context: SessionContext): Promise<WorkspaceData>;
  createMatter(context: SessionContext, input: MatterInput): Promise<Matter>;
  changeStatus(context: SessionContext, id: string, status: MatterStatus): Promise<void>;
  sendMessage(context: SessionContext, id: string, text: string): Promise<void>;
  updateTask(context: SessionContext, id: string, status: TaskStatus): Promise<void>;
}
export const apiErrorCodes = [
  'unavailable',
  'notFound',
  'forbidden',
  'invalidStatus',
  'invalidInput',
  'unknown',
] as const;
export type ApiErrorCode = (typeof apiErrorCodes)[number];
export class ApiError extends Error {
  constructor(public readonly code: ApiErrorCode) {
    super(code);
    this.name = 'ApiError';
  }
}
