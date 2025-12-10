/**
 * Modelo de Ruta
 * Funciones para interactuar con la tabla de rutas
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { Ruta, RutaCreate, RutaUpdate } from '../types/database.types';

// ============================================
// Obtener todas las rutas
// ============================================
export const getAllRutas = async (): Promise<Ruta[]> => {
  const query = 'SELECT * FROM rutas ORDER BY fecha_creacion DESC';
  const result = await executeQuery(query, []);
  return result.rows as Ruta[];
};

// ============================================
// Obtener ruta por ID
// ============================================
export const getRutaById = async (id: string): Promise<Ruta | null> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM rutas WHERE id = ?'
      : 'SELECT * FROM rutas WHERE id = $1';
  const params = [id];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as Ruta;
};

// ============================================
// Crear nueva ruta
// ============================================
export const createRuta = async (rutaData: RutaCreate): Promise<Ruta> => {
  const dbType = getDbType();
  const id = `rt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let query: string;
  let params: unknown[];

  if (dbType === 'mysql') {
    query = `
      INSERT INTO rutas (
        id, nombre, origen, destino, municipio_id, empresa_id,
        costo_minimo, costo_maximo, moneda, duracion, frecuencia,
        usuarios_registrados, activa, fecha_creacion, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    params = [
      id,
      rutaData.nombre,
      rutaData.origen,
      rutaData.destino,
      rutaData.municipio_id,
      rutaData.empresa_id,
      rutaData.costo_minimo,
      rutaData.costo_maximo,
      rutaData.moneda || 'MXN',
      rutaData.duracion || null,
      rutaData.frecuencia || null,
      rutaData.usuarios_registrados || 0,
      rutaData.activa !== false,
      rutaData.notas || null,
    ];
  } else {
    query = `
      INSERT INTO rutas (
        id, nombre, origen, destino, municipio_id, empresa_id,
        costo_minimo, costo_maximo, moneda, duracion, frecuencia,
        usuarios_registrados, activa, fecha_creacion, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, $14)
      RETURNING *
    `;
    params = [
      id,
      rutaData.nombre,
      rutaData.origen,
      rutaData.destino,
      rutaData.municipio_id,
      rutaData.empresa_id,
      rutaData.costo_minimo,
      rutaData.costo_maximo,
      rutaData.moneda || 'MXN',
      rutaData.duracion || null,
      rutaData.frecuencia || null,
      rutaData.usuarios_registrados || 0,
      rutaData.activa !== false,
      rutaData.notas || null,
    ];
  }

  const result = await executeQuery(query, params);

  if (dbType === 'mysql') {
    return await getRutaById(id) as Ruta;
  }

  return result.rows[0] as Ruta;
};

// ============================================
// Actualizar ruta
// ============================================
export const updateRuta = async (
  id: string,
  rutaData: RutaUpdate
): Promise<Ruta | null> => {
  const dbType = getDbType();
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (rutaData.nombre !== undefined) {
    updates.push(dbType === 'mysql' ? 'nombre = ?' : `nombre = $${paramIndex++}`);
    params.push(rutaData.nombre);
  }
  if (rutaData.origen !== undefined) {
    updates.push(dbType === 'mysql' ? 'origen = ?' : `origen = $${paramIndex++}`);
    params.push(rutaData.origen);
  }
  if (rutaData.destino !== undefined) {
    updates.push(dbType === 'mysql' ? 'destino = ?' : `destino = $${paramIndex++}`);
    params.push(rutaData.destino);
  }
  if (rutaData.municipio_id !== undefined) {
    updates.push(dbType === 'mysql' ? 'municipio_id = ?' : `municipio_id = $${paramIndex++}`);
    params.push(rutaData.municipio_id);
  }
  if (rutaData.empresa_id !== undefined) {
    updates.push(dbType === 'mysql' ? 'empresa_id = ?' : `empresa_id = $${paramIndex++}`);
    params.push(rutaData.empresa_id);
  }
  if (rutaData.costo_minimo !== undefined) {
    updates.push(dbType === 'mysql' ? 'costo_minimo = ?' : `costo_minimo = $${paramIndex++}`);
    params.push(rutaData.costo_minimo);
  }
  if (rutaData.costo_maximo !== undefined) {
    updates.push(dbType === 'mysql' ? 'costo_maximo = ?' : `costo_maximo = $${paramIndex++}`);
    params.push(rutaData.costo_maximo);
  }
  if (rutaData.moneda !== undefined) {
    updates.push(dbType === 'mysql' ? 'moneda = ?' : `moneda = $${paramIndex++}`);
    params.push(rutaData.moneda);
  }
  if (rutaData.duracion !== undefined) {
    updates.push(dbType === 'mysql' ? 'duracion = ?' : `duracion = $${paramIndex++}`);
    params.push(rutaData.duracion);
  }
  if (rutaData.frecuencia !== undefined) {
    updates.push(dbType === 'mysql' ? 'frecuencia = ?' : `frecuencia = $${paramIndex++}`);
    params.push(rutaData.frecuencia);
  }
  if (rutaData.activa !== undefined) {
    updates.push(dbType === 'mysql' ? 'activa = ?' : `activa = $${paramIndex++}`);
    params.push(rutaData.activa);
  }
  if (rutaData.notas !== undefined) {
    updates.push(dbType === 'mysql' ? 'notas = ?' : `notas = $${paramIndex++}`);
    params.push(rutaData.notas);
  }

  if (updates.length === 0) {
    return await getRutaById(id);
  }

  updates.push(
    dbType === 'mysql'
      ? 'fecha_actualizacion = NOW()'
      : 'fecha_actualizacion = CURRENT_TIMESTAMP'
  );

  params.push(id);

  const query =
    dbType === 'mysql'
      ? `UPDATE rutas SET ${updates.join(', ')} WHERE id = ?`
      : `UPDATE rutas SET ${updates.join(', ')} WHERE id = $${paramIndex}`;

  await executeQuery(query, params);
  return await getRutaById(id);
};

// ============================================
// Eliminar ruta (soft delete)
// ============================================
export const deleteRuta = async (id: string): Promise<void> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'UPDATE rutas SET activa = false WHERE id = ?'
      : 'UPDATE rutas SET activa = false WHERE id = $1';
  const params = [id];

  await executeQuery(query, params);
};

// ============================================
// Obtener todas las rutas con información relacionada
// ============================================
export const getAllRutasWithDetails = async (): Promise<(Ruta & { municipio_nombre: string | null; empresa_nombre: string | null })[]> => {
  const query = `
    SELECT 
      r.*,
      m.nombre as municipio_nombre,
      e.nombre as empresa_nombre
    FROM rutas r
    LEFT JOIN municipios m ON r.municipio_id = m.id
    LEFT JOIN empresas e ON r.empresa_id = e.id
    ORDER BY r.fecha_creacion DESC
  `;
  const result = await executeQuery(query, []);
  return result.rows as (Ruta & { municipio_nombre: string | null; empresa_nombre: string | null })[];
};

