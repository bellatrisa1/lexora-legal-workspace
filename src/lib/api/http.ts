import { ApiError, apiErrorCodes, type WorkspaceApi } from './contracts';
import type { SessionContext } from '../domain';
export function createHttpApi(base = '/api/v1'): WorkspaceApi {
  async function request<T>(
    context: SessionContext,
    path: string,
    method = 'GET',
    body?: unknown,
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-demo-organization': context.organizationId,
          'x-demo-user': context.userId,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new ApiError('unavailable');
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
      const code =
        payload &&
        typeof payload === 'object' &&
        'error' in payload &&
        payload.error &&
        typeof payload.error === 'object' &&
        'code' in payload.error
          ? payload.error.code
          : null;
      throw new ApiError(apiErrorCodes.find((c) => c === code) ?? 'unknown');
    }
    return response.status === 204 ? (undefined as T) : response.json();
  }
  return {
    getWorkspace: (c) => request(c, '/workspace'),
    createMatter: (c, input) => request(c, '/matters', 'POST', input),
    changeStatus: (c, id, status) =>
      request(c, `/matters/${encodeURIComponent(id)}/status`, 'PATCH', { status }),
    sendMessage: (c, id, text) =>
      request(c, `/matters/${encodeURIComponent(id)}/messages`, 'POST', { text }),
    updateTask: (c, id, status) =>
      request(c, `/tasks/${encodeURIComponent(id)}/status`, 'PATCH', { status }),
  };
}
