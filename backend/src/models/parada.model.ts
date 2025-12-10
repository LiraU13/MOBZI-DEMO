/**
 * Modelo de Parada
 * Funciones para interactuar con la tabla de paradas
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { Parada } from '../types/database.types';

// ============================================
// Obtener paradas por ruta
// ============================================
export const getParadasByRutaId = async (rutaId: string): Promise<Parada[]> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM paradas WHERE ruta_id = ? AND activa = true ORDER BY orden ASC'
      : 'SELECT * FROM paradas WHERE ruta_id = $1 AND activa = true ORDER BY orden ASC';
  const params = [rutaId];

  const result = await executeQuery(query, params);
  return result.rows as Parada[];
};

// ============================================
// Obtener todas las paradas (incluyendo inactivas)
// ============================================
export const getAllParadasByRutaId = async (rutaId: string): Promise<Parada[]> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM paradas WHERE ruta_id = ? ORDER BY orden ASC'
      : 'SELECT * FROM paradas WHERE ruta_id = $1 ORDER BY orden ASC';
  const params = [rutaId];

  const result = await executeQuery(query, params);
  return result.rows as Parada[];
};

export default {
  getParadasByRutaId,
  getAllParadasByRutaId,
};

