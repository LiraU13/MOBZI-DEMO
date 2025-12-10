/**
 * Modelo de Usuario
 * Funciones para interactuar con la tabla de usuarios
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../types/database.types';
import { hashPassword } from '../utils/password.util';

// ============================================
// Crear nuevo usuario
// ============================================
export const createUsuario = async (
  usuarioData: UsuarioCreate
): Promise<Usuario> => {
  const dbType = getDbType();
  const hashedPassword = await hashPassword(usuarioData.password);

  // Generar ID único
  const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let query: string;
  let params: unknown[];

  if (dbType === 'mysql') {
    query = `
      INSERT INTO usuarios (
        id, nombre, apellido, email, password_hash, telefono, 
        tipo_usuario, municipio_preferido, activo, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    params = [
      id,
      usuarioData.nombre,
      usuarioData.apellido || null,
      usuarioData.email,
      hashedPassword,
      usuarioData.telefono || null,
      usuarioData.tipo_usuario || 'regular',
      usuarioData.municipio_preferido || null,
      true,
    ];
  } else {
    query = `
      INSERT INTO usuarios (
        id, nombre, apellido, email, password_hash, telefono, 
        tipo_usuario, municipio_preferido, activo, fecha_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    params = [
      id,
      usuarioData.nombre,
      usuarioData.apellido || null,
      usuarioData.email,
      hashedPassword,
      usuarioData.telefono || null,
      usuarioData.tipo_usuario || 'regular',
      usuarioData.municipio_preferido || null,
      true,
    ];
  }

  const result = await executeQuery(query, params);

  // Si es MySQL, necesitamos hacer un SELECT después del INSERT
  if (dbType === 'mysql') {
    const usuario = await getUsuarioById(id);
    if (!usuario) {
      throw new Error('Error al crear usuario');
    }
    return usuario;
  }

  // PostgreSQL devuelve el registro directamente
  return result.rows[0] as Usuario;
};

// ============================================
// Obtener usuario por ID
// ============================================
export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM usuarios WHERE id = ?'
      : 'SELECT * FROM usuarios WHERE id = $1';
  const params = [id];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as Usuario;
};

// ============================================
// Obtener usuario por email
// ============================================
export const getUsuarioByEmail = async (
  email: string
): Promise<Usuario | null> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM usuarios WHERE email = ?'
      : 'SELECT * FROM usuarios WHERE email = $1';
  const params = [email.toLowerCase()];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as Usuario;
};

// ============================================
// Actualizar usuario
// ============================================
export const updateUsuario = async (
  id: string,
  usuarioData: UsuarioUpdate
): Promise<Usuario | null> => {
  const dbType = getDbType();
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (usuarioData.nombre !== undefined) {
    if (dbType === 'mysql') {
      updates.push('nombre = ?');
    } else {
      updates.push(`nombre = $${paramIndex}`);
    }
    params.push(usuarioData.nombre);
    paramIndex++;
  }

  if (usuarioData.apellido !== undefined) {
    if (dbType === 'mysql') {
      updates.push('apellido = ?');
    } else {
      updates.push(`apellido = $${paramIndex}`);
    }
    params.push(usuarioData.apellido);
    paramIndex++;
  }

  if (usuarioData.email !== undefined) {
    if (dbType === 'mysql') {
      updates.push('email = ?');
    } else {
      updates.push(`email = $${paramIndex}`);
    }
    params.push(usuarioData.email.toLowerCase());
    paramIndex++;
  }

  if (usuarioData.telefono !== undefined) {
    if (dbType === 'mysql') {
      updates.push('telefono = ?');
    } else {
      updates.push(`telefono = $${paramIndex}`);
    }
    params.push(usuarioData.telefono);
    paramIndex++;
  }

  if (usuarioData.municipioPreferido !== undefined) {
    if (dbType === 'mysql') {
      updates.push('municipio_preferido = ?');
    } else {
      updates.push(`municipio_preferido = $${paramIndex}`);
    }
    params.push(usuarioData.municipioPreferido);
    paramIndex++;
  }

  if (usuarioData.activo !== undefined) {
    if (dbType === 'mysql') {
      updates.push('activo = ?');
    } else {
      updates.push(`activo = $${paramIndex}`);
    }
    params.push(usuarioData.activo);
    paramIndex++;
  }

  if (updates.length === 0) {
    return await getUsuarioById(id);
  }

  // Agregar fecha de actualización
  if (dbType === 'mysql') {
    updates.push('fecha_actualizacion = NOW()');
  } else {
    updates.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  }

  // Construir la consulta SQL correctamente
  // Agregar ID al final de los parámetros
  params.push(id);
  
  let query: string;
  if (dbType === 'mysql') {
    query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`;
  } else {
    // Para PostgreSQL, el índice del parámetro es la longitud del array params
    query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${params.length}`;
  }

  await executeQuery(query, params);

  return await getUsuarioById(id);
};

// ============================================
// Actualizar último acceso
// ============================================
export const updateLastAccess = async (id: string): Promise<void> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?'
      : 'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1';
  const params = [id];

  await executeQuery(query, params);
};

// ============================================
// Eliminar usuario (soft delete)
// ============================================
export const deleteUsuario = async (id: string): Promise<boolean> => {
  return (await updateUsuario(id, { activo: false })) !== null;
};

// ============================================
// Verificar si el email existe
// ============================================
export const emailExists = async (email: string): Promise<boolean> => {
  const usuario = await getUsuarioByEmail(email);
  return usuario !== null;
};

// ============================================
// Obtener todos los usuarios
// ============================================
export const getAllUsuarios = async (): Promise<Usuario[]> => {
  const query = 'SELECT * FROM usuarios ORDER BY fecha_registro DESC';
  const result = await executeQuery(query, []);
  return result.rows as Usuario[];
};


// ============================================
// Opciones para restablecimiento de contraseña
// ============================================
export const setResetToken = async (
  id: string,
  token: string | null
): Promise<void> => {
  const dbType = getDbType();

  if (dbType === 'mysql') {
    const query = `UPDATE usuarios SET reset_token = ? WHERE id = ?`;
    await executeQuery(query, [token, id]);
  } else {
    const query = `UPDATE usuarios SET reset_token = $1 WHERE id = $2`;
    await executeQuery(query, [token, id]);
  }
};

export const getUsuarioByResetToken = async (
  token: string
): Promise<Usuario | null> => {
  const dbType = getDbType();
  const query = dbType === 'mysql' ? 'SELECT * FROM usuarios WHERE reset_token = ?' : 'SELECT * FROM usuarios WHERE reset_token = $1';
  const params = [token];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) return null;
  return result.rows[0] as Usuario;
};

export const updatePassword = async (id: string, password: string): Promise<void> => {
  const dbType = getDbType();
  const hashed = await hashPassword(password);

  if (dbType === 'mysql') {
    const query = `UPDATE usuarios SET password_hash = ?, fecha_actualizacion = NOW() WHERE id = ?`;
    await executeQuery(query, [hashed, id]);
  } else {
    const query = `UPDATE usuarios SET password_hash = $1, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $2`;
    await executeQuery(query, [hashed, id]);
  }
};

export default {
  createUsuario,
  getUsuarioById,
  getUsuarioByEmail,
  getAllUsuarios,
  updateUsuario,
  updateLastAccess,
  deleteUsuario,
  emailExists,
  setResetToken,
  getUsuarioByResetToken,
  updatePassword,
};


