import { createHttpApi } from './api/http';
import type { WorkspaceApi } from './api/contracts';
import { mockWorkspaceApi } from './api/mock';
// Replace this adapter with REST calls without importing transport details into components.
export const isRestMode = process.env.NEXT_PUBLIC_API_MODE === 'rest';
export const api: WorkspaceApi = isRestMode ? createHttpApi() : mockWorkspaceApi;
export type { WorkspaceApi } from './api/contracts';
