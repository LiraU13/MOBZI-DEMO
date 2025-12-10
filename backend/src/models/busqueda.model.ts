/**
 * Modelo de Búsqueda
 * Funciones para interactuar con búsquedas de usuarios
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { Busqueda, BusquedaCreate } from '../types/database.types';

// ============================================
// Crear búsqueda
// ============================================
export const createBusqueda = async (
  busquedaData: BusquedaCreate
): Promise<Busqueda> => {
  const dbType = getDbType();
  let query: string;
  let params: unknown[];

  if (dbType === 'mysql') {
    query = `
      INSERT INTO busquedas (
        usuario_id, query, municipio_id, resultados_encontrados, fecha_busqueda
      ) VALUES (?, ?, ?, ?, NOW())
    `;
    params = [
      busquedaData.usuario_id || null,
      busquedaData.query,
      busquedaData.municipio_id || null,
      busquedaData.resultados_encontrados || 0,
    ];
    
    const result = await executeQuery(query, params);
    
    // Para MySQL, obtener el ID insertado
    const insertId = result.insertId;
    if (insertId) {
      const getQuery = 'SELECT * FROM busquedas WHERE id = ?';
      const getResult = await executeQuery(getQuery, [insertId]);
      if (getResult.rows && getResult.rows.length > 0) {
        return getResult.rows[0] as Busqueda;
      }
    }
    
    // Si no se puede obtener, devolver un objeto básico
    return {
      id: insertId || 0,
      usuario_id: busquedaData.usuario_id || undefined,
      query: busquedaData.query,
      municipio_id: busquedaData.municipio_id || undefined,
      resultados_encontrados: busquedaData.resultados_encontrados || 0,
      fecha_busqueda: new Date().toISOString(),
    } as Busqueda;
  } else {
    query = `
      INSERT INTO busquedas (
        usuario_id, query, municipio_id, resultados_encontrados, fecha_busqueda
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    params = [
      busquedaData.usuario_id || null,
      busquedaData.query,
      busquedaData.municipio_id || null,
      busquedaData.resultados_encontrados || 0,
    ];
    
    const result = await executeQuery(query, params);
    return result.rows[0] as Busqueda;
  }
};

export default {
  createBusqueda,
};

