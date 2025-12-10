/**
 * Middleware de Autenticación
 * Verifica y valida tokens JWT
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { getUsuarioById } from '../models/usuario.model';

// ============================================
// Extender Request para incluir usuario
// ============================================
declare module 'express-serve-static-core' {
  interface Request {
    usuario?: {
      id: string;
      email: string;
      tipoUsuario: 'regular' | 'admin';
      nombre?: string;
      apellido?: string;
    };
  }
}

// ============================================
// Middleware de autenticación
// ============================================
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = verifyAccessToken(token);

    // Obtener información completa del usuario
    const usuario = await getUsuarioById(decoded.userId);

    if (!usuario) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    if (!usuario.activo) {
      res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada',
      });
      return;
    }

    // Agregar información del usuario al request
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipo_usuario as 'regular' | 'admin',
      nombre: usuario.nombre,
      apellido: usuario.apellido || undefined,
    };

    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token inválido o expirado';
    res.status(401).json({
      success: false,
      message,
    });
  }
};

// ============================================
// Middleware para verificar si es admin
// ============================================
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.usuario) {
    res.status(401).json({
      success: false,
      message: 'Autenticación requerida',
    });
    return;
  }

  if (req.usuario.tipoUsuario !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador',
    });
    return;
  }

  next();
};

// ============================================
// Middleware opcional (no falla si no hay token)
// ============================================
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      const usuario = await getUsuarioById(decoded.userId);

      if (usuario && usuario.activo) {
        req.usuario = {
          id: usuario.id,
          email: usuario.email,
          tipoUsuario: usuario.tipo_usuario as 'regular' | 'admin',
          nombre: usuario.nombre,
          apellido: usuario.apellido || undefined,
        };
      }
    }
  } catch {
    // Ignorar errores en autenticación opcional
  }

  next();
};

export default {
  authenticate,
  requireAdmin,
  optionalAuth,
};

