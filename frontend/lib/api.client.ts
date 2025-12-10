/**
 * Cliente API para comunicarse con el backend
 */

import { API_CONFIG, STORAGE_KEYS } from './api.config';

// ============================================
// Tipos
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  error?: string;
}

export interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// ============================================
// Función para obtener el token
// ============================================
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// ============================================
// Función para hacer requests
// ============================================
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { requireAuth = false, ...fetchOptions } = options;

  // Construir URL
  const url = `${API_CONFIG.baseURL}${endpoint}`;

  // Construir headers usando la API Headers (más seguro en TypeScript)
  const headers = new Headers(fetchOptions.headers as HeadersInit);

  // Asegurar Content-Type por defecto
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Agregar token si es requerido
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    // Verificar el Content-Type antes de parsear
    const contentType = response.headers.get('content-type');
    let data: ApiResponse<T>;

    // Intentar parsear como JSON solo si el content-type es JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // Si falla el parseo JSON, leer como texto
        const text = await response.text();
        data = { success: response.ok, message: text || 'Error en la respuesta del servidor' };
      }
    } else {
      // Si no es JSON, leer como texto
      const text = await response.text();
      data = { success: response.ok, message: text || 'Error en la respuesta del servidor' };
    }

    // Si la respuesta no es exitosa
    if (!response.ok) {
      // Si es 401, limpiar tokens
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      }

      // Si es 429 (Too Many Requests), manejar especialmente
      if (response.status === 429) {
        // Intentar obtener información del tiempo de espera desde los headers
        const retryAfter = response.headers.get('Retry-After') || response.headers.get('X-RateLimit-Reset');
        let message = data.message || 'Demasiadas solicitudes. Por favor, espera un momento.';
        
        if (retryAfter) {
          const seconds = parseInt(retryAfter);
          const minutes = Math.ceil(seconds / 60);
          message += ` Intenta de nuevo en aproximadamente ${minutes} minuto${minutes > 1 ? 's' : ''}.`;
        }
        
        return {
          success: false,
          message,
          error: data.error || 'RATE_LIMIT_ERROR',
        };
      }

      return {
        success: false,
        message: data.message || 'Error en la solicitud',
        errors: data.errors,
        error: data.error,
      };
    }

    return {
      ...data,
      success: data.success ?? true,
    };
  } catch (error: unknown) {
    console.error('Error en API request:', error);

    // Si es un error de timeout o abort
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      return {
        success: false,
        message: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.',
        error: 'TIMEOUT_ERROR',
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message || 'Error de conexión con el servidor' : 'Error de conexión con el servidor',
      error: 'NETWORK_ERROR',
    };
  }
};

// ============================================
// Métodos HTTP helpers
// ============================================
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;

