/**
 * Modelo de Municipio
 * Funciones para interactuar con la tabla de municipios
 */

import { executeQuery } from '../database/db.connection';
import { Municipio } from '../types/database.types';

// ============================================
// Obtener todos los municipios
// ============================================
export const getAllMunicipios = async (): Promise<Municipio[]> => {
  const query = 'SELECT * FROM municipios WHERE activo = true ORDER BY nombre ASC';
  const result = await executeQuery(query, []);
  return result.rows as Municipio[];
};

// ============================================
// Obtener municipio por ID
// ============================================
export const getMunicipioById = async (id: string): Promise<Municipio | null> => {
  const { getDbType } = await import('../database/db.connection');
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM municipios WHERE id = ? AND activo = true'
      : 'SELECT * FROM municipios WHERE id = $1 AND activo = true';
  const params = [id];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as Municipio;
};

export default {
  getAllMunicipios,
  getMunicipioById,
};

