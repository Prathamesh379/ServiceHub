import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './server/src/routes/apiRoutes.ts';
import uploadRoutes from './server/src/routes/uploadRoutes.ts';
import { initSocketIO } from './server/src/sockets/socketHandler.ts';
import { getDb } from './server/src/config/db.ts';
import { connectMongo } from './server/src/config/mongo.ts';
import { rateLimit } from './server/src/middleware/auth.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Security headers with Helmet (configured safely for embedded preview & cross-origin assets)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS support
  app.use(cors({ origin: '*', credentials: true }));

  // Initialize DB data store & connect MongoDB if configured
  getDb();
  connectMongo().catch((err) => {
    console.warn('[ServiceHub] Mongo startup note:', err.message);
  });

  // Socket.IO setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });
  initSocketIO(io);

  // Body parser middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploaded images statically
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Request rate limiter on API routes
  app.use('/api', rateLimit(200, 60000));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ServiceHub API',
      version: '1.0.0',
      time: new Date().toISOString(),
      dbMode: process.env.MONGODB_URI ? 'MongoDB Active' : 'Persistent Store Active',
    });
  });

  // Mount API & Upload routes
  app.use('/api/upload', uploadRoutes);
  app.use('/api', apiRoutes);

  // Catch-all for undefined API endpoints (Always return JSON, never fall through to Vite SPA HTML)
  app.all('/api/*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Global API error handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error occurred',
    });
  });

  // Vite Middleware for development OR static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[ServiceHub] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ServiceHub server:', err);
  process.exit(1);
});
