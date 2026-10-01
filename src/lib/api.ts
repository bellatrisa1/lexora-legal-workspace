import type { WorkspaceApi } from './api/contracts';
import { mockWorkspaceApi } from './api/mock';
// Replace this adapter with REST calls without importing transport details into components.
export const api: WorkspaceApi = mockWorkspaceApi;
export type { WorkspaceApi } from './api/contracts';
