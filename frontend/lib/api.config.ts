/**
 * Configuración de la API
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000, // 30 segundos
};

// Claves para localStorage
export const STORAGE_KEYS = {
  TOKEN: 'mobzi_token',
  REFRESH_TOKEN: 'mobzi_refresh_token',
  USER: 'mobzi_user',
  REMEMBER_USER: 'mobzi_remember_user',
};

