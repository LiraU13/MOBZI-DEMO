/**
 * Modelo de Ruta Guardada
 * Funciones para interactuar con rutas guardadas de usuarios
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { RutaGuardada, RutaGuardadaCreate, RutaGuardadaUpdate } from '../types/database.types';

// ============================================
// Obtener rutas guardadas de un usuario
// ============================================
export const getRutasGuardadasByUsuarioId = async (
  usuarioId: string
): Promise<RutaGuardada[]> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? `
        SELECT 
          rg.*,
          r.nombre as ruta_nombre,
          r.origen,
          r.destino,
          m.nombre as municipio_nombre,
          e.nombre as empresa_nombre
        FROM rutas_guardadas rg
        LEFT JOIN rutas r ON rg.ruta_id = r.id
        LEFT JOIN municipios m ON r.municipio_id = m.id
        LEFT JOIN empresas e ON r.empresa_id = e.id
        WHERE rg.usuario_id = ?
        ORDER BY rg.fecha_creacion DESC
      `
      : `
        SELECT 
          rg.*,
          r.nombre as ruta_nombre,
          r.origen,
          r.destino,
          m.nombre as municipio_nombre,
          e.nombre as empresa_nombre
        FROM rutas_guardadas rg
        LEFT JOIN rutas r ON rg.ruta_id = r.id
        LEFT JOIN municipios m ON r.municipio_id = m.id
        LEFT JOIN empresas e ON r.empresa_id = e.id
        WHERE rg.usuario_id = $1
        ORDER BY rg.fecha_creacion DESC
      `;
  const params = [usuarioId];

  const result = await executeQuery(query, params);
  return result.rows as RutaGuardada[];
};

// ============================================
// Crear ruta guardada
// ============================================
export const createRutaGuardada = async (
  rutaData: RutaGuardadaCreate
): Promise<RutaGuardada> => {
  const dbType = getDbType();
  const id = `rg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let query: string;
  let params: unknown[];

  if (dbType === 'mysql') {
    query = `
      INSERT INTO rutas_guardadas (
        id, usuario_id, ruta_id, nombre_personalizado, favorita, fecha_creacion
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;
    params = [
      id,
      rutaData.usuario_id,
      rutaData.ruta_id,
      rutaData.nombre_personalizado || null,
      rutaData.favorita || false,
    ];
  } else {
    query = `
      INSERT INTO rutas_guardadas (
        id, usuario_id, ruta_id, nombre_personalizado, favorita, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    params = [
      id,
      rutaData.usuario_id,
      rutaData.ruta_id,
      rutaData.nombre_personalizado || null,
      rutaData.favorita || false,
    ];
  }

  const result = await executeQuery(query, params);

  if (dbType === 'mysql') {
    const rutaGuardada = await getRutaGuardadaById(id);
    if (!rutaGuardada) {
      throw new Error('Error al crear ruta guardada');
    }
    return rutaGuardada;
  }

  return result.rows[0] as RutaGuardada;
};

// ============================================
// Obtener ruta guardada por ID
// ============================================
export const getRutaGuardadaById = async (id: string): Promise<RutaGuardada | null> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM rutas_guardadas WHERE id = ?'
      : 'SELECT * FROM rutas_guardadas WHERE id = $1';
  const params = [id];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as RutaGuardada;
};

// ============================================
// Verificar si una ruta ya está guardada por el usuario
// ============================================
export const getRutaGuardadaByUsuarioAndRuta = async (
  usuarioId: string,
  rutaId: string
): Promise<RutaGuardada | null> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM rutas_guardadas WHERE usuario_id = ? AND ruta_id = ?'
      : 'SELECT * FROM rutas_guardadas WHERE usuario_id = $1 AND ruta_id = $2';
  const params = [usuarioId, rutaId];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as RutaGuardada;
};

// ============================================
// Actualizar ruta guardada
// ============================================
export const updateRutaGuardada = async (
  id: string,
  rutaData: RutaGuardadaUpdate
): Promise<RutaGuardada | null> => {
  const dbType = getDbType();
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (rutaData.nombre_personalizado !== undefined) {
    updates.push(
      dbType === 'mysql' ? 'nombre_personalizado = ?' : `nombre_personalizado = $${paramIndex++}`
    );
    params.push(rutaData.nombre_personalizado);
  }

  if (rutaData.favorita !== undefined) {
    updates.push(
      dbType === 'mysql' ? 'favorita = ?' : `favorita = $${paramIndex++}`
    );
    params.push(rutaData.favorita);
  }

  if (updates.length === 0) {
    return await getRutaGuardadaById(id);
  }

  updates.push(
    dbType === 'mysql'
      ? 'fecha_actualizacion = NOW()'
      : 'fecha_actualizacion = CURRENT_TIMESTAMP'
  );

  params.push(id);

  const query =
    dbType === 'mysql'
      ? `UPDATE rutas_guardadas SET ${updates.join(', ')} WHERE id = ?`
      : `UPDATE rutas_guardadas SET ${updates.join(', ')} WHERE id = $${paramIndex}`;

  await executeQuery(query, params);
  return await getRutaGuardadaById(id);
};

// ============================================
// Eliminar ruta guardada
// ============================================
export const deleteRutaGuardada = async (id: string): Promise<boolean> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'DELETE FROM rutas_guardadas WHERE id = ?'
      : 'DELETE FROM rutas_guardadas WHERE id = $1';
  const params = [id];

  const result = await executeQuery(query, params);
  return result.rowCount > 0;
};

export default {
  getRutasGuardadasByUsuarioId,
  createRutaGuardada,
  getRutaGuardadaById,
  getRutaGuardadaByUsuarioAndRuta,
  updateRutaGuardada,
  deleteRutaGuardada,
};

