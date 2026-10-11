import express, { type ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { ApiError, type WorkspaceApi } from '../src/lib/api/contracts';
import { matterStatuses, taskStatuses } from '../src/lib/domain';
export function createApp(api: WorkspaceApi, options: { demoEnabled: boolean; origin: string }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use('/api/v1', (req, res, next) => {
    if (!options.demoEnabled) return res.status(503).json({ error: { code: 'unavailable' } });
    const origin = req.get('origin');
    if (origin && origin !== options.origin)
      return res.status(403).json({ error: { code: 'forbidden' } });
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', mode: 'development-demo' });
  });
  function context(req: express.Request) {
    const result = z
      .object({ organizationId: z.string().min(1).max(100), userId: z.string().min(1).max(100) })
      .safeParse({
        organizationId: req.get('x-demo-organization'),
        userId: req.get('x-demo-user'),
      });
    if (!result.success) throw new ApiError('forbidden');
    return result.data;
  }
  app.get('/api/v1/workspace', async (req, res) => {
    res.json(await api.getWorkspace(context(req)));
  });
  app.post('/api/v1/matters', async (req, res) => {
    res.status(201).json(await api.createMatter(context(req), req.body));
  });
  app.patch('/api/v1/matters/:id/status', async (req, res) => {
    const body = z.object({ status: z.enum(matterStatuses) }).parse(req.body);
    await api.changeStatus(context(req), req.params.id, body.status);
    res.sendStatus(204);
  });
  app.post('/api/v1/matters/:id/messages', async (req, res) => {
    const body = z.object({ text: z.string() }).parse(req.body);
    await api.sendMessage(context(req), req.params.id, body.text);
    res.sendStatus(204);
  });
  app.patch('/api/v1/tasks/:id/status', async (req, res) => {
    const body = z.object({ status: z.enum(taskStatuses) }).parse(req.body);
    await api.updateTask(context(req), req.params.id, body.status);
    res.sendStatus(204);
  });
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'notFound' } });
  });
  const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    if (res.headersSent) return next(error);
    const databaseCode =
      typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
    const status =
      typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
    const code =
      error instanceof ApiError
        ? error.code
        : error instanceof z.ZodError ||
            ['23503', '23514', '22P02'].includes(databaseCode) ||
            status === 400 ||
            status === 413
          ? 'invalidInput'
          : 'unknown';
    if (code === 'unknown') console.error('API operation failed');
    res
      .status(
        code === 'notFound' ? 404 : code === 'forbidden' ? 403 : code === 'unknown' ? 500 : 400,
      )
      .json({ error: { code } });
  };
  app.use(errorHandler);
  return app;
}
