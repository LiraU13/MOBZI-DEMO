/**
 * Punto de entrada principal del servidor MOBZI
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { serverConfig, corsConfig, rateLimitConfig, validateConfig } from './config/app.config';
import { testConnection, closeConnections } from './config/database.config';
// import authRoutes from './routes/auth.routes';

// Cargar variables de entorno
dotenv.config();

// Validar configuración
validateConfig();

// ============================================
// Crear aplicación Express
// ============================================
const app = express();
app.set('trust proxy', 1);

// ============================================
// Middleware de seguridad
// ============================================
app.use(helmet());

// ============================================
// CORS
// ============================================
app.use(
  cors({
    origin: corsConfig.origin,
    credentials: corsConfig.credentials,
  })
);

// ============================================
// Rate Limiting
// ============================================
// Rate limiter general (más permisivo para uso normal)
const generalLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes desde esta IP. Por favor, espera unos minutos antes de intentar de nuevo.',
      error: 'RATE_LIMIT_ERROR',
    });
  },
});

// Aplicar rate limiter general a todas las rutas de API
app.use('/api/', generalLimiter);

// ============================================
// Middleware para parsear JSON
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Ruta de salud
// ============================================
app.get('/health', async (_req, res) => {
  const dbConnected = await testConnection();

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: serverConfig.nodeEnv,
  });
});

// ============================================
// Ruta raíz
// ============================================
app.get('/', (_req, res) => {
  res.json({
    message: 'MOBZI API (Guest Mode)',
    version: serverConfig.apiVersion,
    status: 'running',
    documentation: '/api/docs',
  });
});

// ============================================
// Rutas de la API
// ============================================
// import adminRoutes from './routes/admin.routes';
// import profileRoutes from './routes/profile.routes';
import publicRoutes from './routes/public.routes';

// app.use(`/api/${serverConfig.apiVersion}/auth`, authRoutes);
// app.use(`/api/${serverConfig.apiVersion}/admin`, adminRoutes);
// app.use(`/api/${serverConfig.apiVersion}/profile`, profileRoutes);
app.use(`/api/${serverConfig.apiVersion}`, publicRoutes);

const pwaDir = serverConfig.nodeEnv === 'production' ? path.join(__dirname, 'pwa') : path.join(process.cwd(), 'backend', 'src', 'pwa');
app.use('/pwa', express.static(pwaDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('service-worker.js')) res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  },
}));

// ============================================
// Manejo de errores 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// ============================================
// Manejo de errores global
// ============================================
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no manejado:', err);

  res.status(500).json({
    error: 'Error interno del servidor',
    message: serverConfig.nodeEnv === 'development' ? err.message : undefined,
  });
});

// ============================================
// Iniciar servidor
// ============================================
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(serverConfig.port, () => {
      console.log('🚀 Servidor MOBZI iniciado');
      console.log(`📍 Puerto: ${serverConfig.port}`);
      console.log(`🌍 Entorno: ${serverConfig.nodeEnv}`);
      console.log(`📊 Base de datos: ${process.env.DB_TYPE || 'mysql'}`);
      console.log(`🔗 Health check: http://localhost:${serverConfig.port}/health`);
      console.log(`🔗 API: http://localhost:${serverConfig.port}/api/${serverConfig.apiVersion}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// ============================================
// Manejo de cierre graceful
// ============================================
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando servidor...');
  await closeConnections();
  process.exit(0);
});

// ============================================
// Iniciar aplicación
// ============================================
startServer();

export default app;

