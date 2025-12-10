/**
 * Configuración general de la aplicación
 */

import dotenv from 'dotenv';

dotenv.config();

// ============================================
// Configuración del servidor
// ============================================
export const serverConfig = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
};

// ============================================
// Configuración JWT
// ============================================
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'change-this-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

// ============================================
// Configuración CORS
// ============================================
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
};

// ============================================
// Configuración Rate Limiting
// ============================================
export const rateLimitConfig = {
  // Rate limiter general (más permisivo)
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '6000'),
  
  // Rate limiter para autenticación (más estricto para prevenir ataques)
  authWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '900000'),
  authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '10'),
};

// ============================================
// Configuración de Logging
// ============================================
export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
};

// ============================================
// Validación de variables críticas
// ============================================
export const validateConfig = (): void => {
  const dbType = process.env.DB_TYPE || 'mysql';
  const required = [
    'DB_TYPE',
    dbType === 'mysql' ? 'DB_MYSQL_DATABASE' : 'DB_POSTGRES_DATABASE',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️  Variables de entorno faltantes:', missing.join(', '));
  }

  if (jwtConfig.secret === 'change-this-secret-key') {
    console.warn('⚠️  JWT_SECRET no está configurado. Usando valor por defecto (INSEGURO)');
  }
};

export default {
  serverConfig,
  jwtConfig,
  corsConfig,
  rateLimitConfig,
  logConfig,
  validateConfig,
};

