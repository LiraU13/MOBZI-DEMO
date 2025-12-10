/**
 * Modelo de Horario
 * Funciones para interactuar con la tabla de horarios
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { Horario } from '../types/database.types';

// ============================================
// Obtener horarios por ruta
// ============================================
export const getHorariosByRutaId = async (rutaId: string): Promise<Horario[]> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM horarios WHERE ruta_id = ? AND activo = true ORDER BY dia ASC'
      : 'SELECT * FROM horarios WHERE ruta_id = $1 AND activo = true ORDER BY dia ASC';
  const params = [rutaId];

  const result = await executeQuery(query, params);
  const rows = result.rows as Array<Record<string, unknown>>;
  // Procesar salidas según el tipo de base de datos
  return rows.map((row) => {
    let salidas: string[] = [];
    const rawSalidas = row.salidas as unknown;
    if (dbType === 'mysql') {
      try {
        salidas = typeof rawSalidas === 'string' ? JSON.parse(rawSalidas) : Array.isArray(rawSalidas) ? (rawSalidas as string[]) : [];
      } catch {
        salidas = [];
      }
    } else {
      salidas = Array.isArray(rawSalidas) ? (rawSalidas as string[]) : [];
    }
    
    return {
      ...row,
      salidas,
    } as Horario;
  });
};

// ============================================
// Obtener todos los horarios (incluyendo inactivos)
// ============================================
export const getAllHorariosByRutaId = async (rutaId: string): Promise<Horario[]> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM horarios WHERE ruta_id = ? ORDER BY dia ASC'
      : 'SELECT * FROM horarios WHERE ruta_id = $1 ORDER BY dia ASC';
  const params = [rutaId];

  const result = await executeQuery(query, params);
  const rows = result.rows as Array<Record<string, unknown>>;
  // Procesar salidas según el tipo de base de datos
  return rows.map((row) => {
    let salidas: string[] = [];
    const rawSalidas = row.salidas as unknown;
    if (dbType === 'mysql') {
      try {
        salidas = typeof rawSalidas === 'string' ? JSON.parse(rawSalidas) : Array.isArray(rawSalidas) ? (rawSalidas as string[]) : [];
      } catch {
        salidas = [];
      }
    } else {
      salidas = Array.isArray(rawSalidas) ? (rawSalidas as string[]) : [];
    }
    
    return {
      ...row,
      salidas,
    } as Horario;
  });
};

export default {
  getHorariosByRutaId,
  getAllHorariosByRutaId,
};

