/**
 * Abstracción unificada para trabajar con ambas bases de datos
 * Detecta automáticamente qué base de datos usar según la configuración
 */

import { getDatabase, dbType } from '../config/database.config';
import * as mysqlDb from './mysql.connection';
import * as postgresqlDb from './postgresql.connection';

// ============================================
// Tipos
// ============================================
export interface QueryResult {
  rows: unknown[];
  rowCount: number;
  insertId?: number;
}

// ============================================
// Función unificada para ejecutar consultas
// ============================================
export const executeQuery = async (
  query: string,
  params: unknown[] = []
): Promise<QueryResult> => {
  if (dbType === 'mysql') {
    return await mysqlDb.executeQuery(query, params);
  } else {
    return await postgresqlDb.executeQuery(query, params);
  }
};

// ============================================
// Función unificada para transacciones
// ============================================
export const executeTransaction = async (
  queries: Array<{ query: string; params?: unknown[] }>
): Promise<void> => {
  if (dbType === 'mysql') {
    return await mysqlDb.executeTransaction(queries);
  } else {
    return await postgresqlDb.executeTransaction(queries);
  }
};

// ============================================
// Función para adaptar consultas según la BD
// ============================================
export const adaptQuery = (query: string): string => {
  if (dbType === 'postgresql') {
    // Convertir placeholders de MySQL (?) a PostgreSQL ($1, $2, ...)
    let paramIndex = 1;
    return query.replace(/\?/g, () => `$${paramIndex++}`);
  }
  return query;
};

// ============================================
// Función para obtener el tipo de base de datos
// ============================================
export const getDbType = (): 'mysql' | 'postgresql' => {
  return dbType;
};

// ============================================
// Función para verificar si la BD está disponible
// ============================================
export const isDatabaseAvailable = (): boolean => {
  const db = getDatabase();
  return !!(db.mysql || db.postgresql);
};

export default {
  executeQuery,
  executeTransaction,
  adaptQuery,
  getDbType,
  isDatabaseAvailable,
};

