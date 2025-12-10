/**
 * Utilidades de validación
 */

import { z } from 'zod';

// ============================================
// Schemas de validación
// ============================================

// Schema para registro
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .max(255, 'El email no puede exceder 255 caracteres'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .max(255, 'El email no puede exceder 255 caracteres'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberUser: z.boolean().optional().default(false),
});

// Schema para solicitud de restablecimiento de contraseña
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().max(255),
});

// Schema para restablecer contraseña
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token es requerido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Schema para actualizar perfil
export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .max(255, 'El email no puede exceder 255 caracteres')
    .optional(),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  municipioPreferido: z.string().max(50).optional(),
});

export const routeCreateSchema = z.object({
  nombre: z.string().min(2).max(120),
  origen: z.string().min(2).max(120),
  destino: z.string().min(2).max(120),
  municipioId: z.string().min(1).optional(),
  empresaId: z.string().min(1).optional(),
  municipio: z.string().min(1).optional(),
  empresa: z.string().min(1).optional(),
  costoMinimo: z.number().nonnegative(),
  costoMaximo: z.number().nonnegative(),
  moneda: z.string().min(2).max(6).default('MXN').optional(),
  duracion: z.string().max(120).optional(),
  frecuencia: z.string().max(120).optional(),
  activa: z.boolean().optional().default(true),
  notas: z.string().max(500).optional(),
  paradas: z.array(z.string()).optional(),
  coordenadas: z.array(z.tuple([z.number(), z.number()])).optional(),
  horarios: z.array(z.object({ dia: z.string().min(1), salidas: z.array(z.string()).default([]) })).optional(),
});

export const routeUpdateSchema = z.object({
  nombre: z.string().min(2).max(120).optional(),
  origen: z.string().min(2).max(120).optional(),
  destino: z.string().min(2).max(120).optional(),
  municipioId: z.string().min(1).optional(),
  empresaId: z.string().min(1).optional(),
  municipio: z.string().min(1).optional(),
  empresa: z.string().min(1).optional(),
  costoMinimo: z.number().nonnegative().optional(),
  costoMaximo: z.number().nonnegative().optional(),
  moneda: z.string().min(2).max(6).optional(),
  duracion: z.string().max(120).optional(),
  frecuencia: z.string().max(120).optional(),
  activa: z.boolean().optional(),
  notas: z.string().max(500).optional(),
  paradas: z.array(z.string()).optional(),
  coordenadas: z.array(z.tuple([z.number(), z.number()])).optional(),
  horarios: z.array(z.object({ dia: z.string().min(1), salidas: z.array(z.string()).default([]) })).optional(),
});

export const empresaCreateSchema = z.object({
  nombre: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(2).max(120)),
  municipioId: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(1)),
  telefono: z.preprocess((v) => (v === '' ? null : v), z.union([z.string().max(20), z.null()]).optional()),
  email: z.preprocess((v) => (v === '' ? null : v), z.union([z.string().email().max(255), z.null()]).optional()),
  activa: z.coerce.boolean().optional(),
});

export const empresaUpdateSchema = z.object({
  nombre: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(2).max(120).optional()),
  municipioId: z.preprocess((v) => (v === '' ? undefined : typeof v === 'string' ? v.trim() : v), z.string().min(1).optional()),
  telefono: z.preprocess((v) => (v === '' ? null : v), z.union([z.string().max(20), z.null()]).optional()),
  email: z.preprocess((v) => (v === '' ? null : v), z.union([z.string().email().max(255), z.null()]).optional()),
  activa: z.coerce.boolean().optional(),
});

// ============================================
// Tipos inferidos de los schemas
// ============================================
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RouteCreateInput = z.infer<typeof routeCreateSchema>;
export type RouteUpdateInput = z.infer<typeof routeUpdateSchema>;
export type EmpresaCreateInput = z.infer<typeof empresaCreateSchema>;
export type EmpresaUpdateInput = z.infer<typeof empresaUpdateSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================
// Función helper para validar
// ============================================
export const validate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
};

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  routeCreateSchema,
  routeUpdateSchema,
  empresaCreateSchema,
  empresaUpdateSchema,
  validate,
};

