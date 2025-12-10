/**
 * Utilidades para manejo de JWT (JSON Web Tokens)
 */

import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import { jwtConfig } from '../config/app.config';

// Para reset de contraseña usaremos un secreto y expiración propios
const resetSecret = (process.env.PASSWORD_RESET_SECRET || jwtConfig.secret) as Secret;
const resetExpiresIn = process.env.PASSWORD_RESET_EXPIRES_IN || '1h';

// Payload para token de reset
export interface PasswordResetPayload {
  userId: string;
}

export const generatePasswordResetToken = (payload: PasswordResetPayload): string => {
  const options = { expiresIn: resetExpiresIn } as unknown as SignOptions;
  return jwt.sign(payload as JwtPayload, resetSecret, options);
};

export const verifyPasswordResetToken = (token: string): PasswordResetPayload | null => {
  try {
    const decoded = jwt.verify(token, resetSecret) as PasswordResetPayload;
    return decoded;
  } catch (err) {
    return null;
  }
};

// ============================================
// Tipos
// ============================================
export interface TokenPayload {
  userId: string;
  email: string;
  tipoUsuario: 'regular' | 'admin';
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: string;
}

// ============================================
// Generar token de acceso
// ============================================
export const generateAccessToken = (payload: TokenPayload): string => {
  const options = { expiresIn: jwtConfig.expiresIn } as unknown as SignOptions;
  return jwt.sign(payload as JwtPayload, jwtConfig.secret as Secret, options);
};

// ============================================
// Generar refresh token
// ============================================
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options = { expiresIn: jwtConfig.refreshExpiresIn } as unknown as SignOptions;
  return jwt.sign(payload as JwtPayload, jwtConfig.refreshSecret as Secret, options);
};

// ============================================
// Generar ambos tokens
// ============================================
export const generateTokens = (payload: TokenPayload): TokenResponse => {
  return {
    token: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: jwtConfig.expiresIn,
  };
};

// ============================================
// Verificar token de acceso
// ============================================
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as TokenPayload;
    return decoded;
  } catch {
    throw new Error('Token inválido o expirado');
  }
};

// ============================================
// Verificar refresh token
// ============================================
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
    return decoded;
  } catch {
    throw new Error('Refresh token inválido o expirado');
  }
};

// ============================================
// Decodificar token sin verificar (solo para lectura)
// ============================================
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};

