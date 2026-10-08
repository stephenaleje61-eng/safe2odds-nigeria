import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  // Security & parsing middlewares
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Mount production API routes
  app.use('/api', apiRouter);

  // Catch-all for undefined /api routes returning standard JSON
  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API endpoint was not found.',
      },
    });
  });

  // Global error handler for API errors (including body-parser JSON SyntaxError)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      const statusCode = err.status || err.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        data: null,
        error: {
          code: err.type === 'entity.parse.failed' ? 'INVALID_JSON_BODY' : 'REQUEST_ERROR',
          message: err.type === 'entity.parse.failed' 
            ? 'Malformed request body: Invalid JSON payload provided.' 
            : err.message || 'An error occurred while processing the request.',
        },
      });
    }
    next(err);
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'safe2odds-nigeria-core', timestamp: new Date().toISOString() });
  });

  // Vite SPA middlewares in development / static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Safe2Odds Nigeria] Production server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('[Safe2Odds Nigeria] Fatal server startup error:', err);
  process.exit(1);
});
