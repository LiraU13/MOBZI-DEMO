/**
 * Utilidades específicas para PostgreSQL
 */

import { Pool, QueryResult as PGQueryResult } from 'pg';
import { getDatabase } from '../config/database.config';

// ============================================
// Tipos
// ============================================
export interface QueryResult {
  rows: unknown[];
  rowCount: number;
  insertId?: number;
}

// ============================================
// Función para ejecutar consultas PostgreSQL
// ============================================
export const executeQuery = async (
  query: string,
  params: unknown[] = []
): Promise<QueryResult> => {
  const db = getDatabase();

  if (!db.postgresql) {
    throw new Error('PostgreSQL pool no está disponible');
  }

  try {
    const result: PGQueryResult = await db.postgresql.query(query, params);

    return {
      rows: result.rows,
      rowCount: result.rowCount || 0,
      insertId: result.rows[0]?.id, // PostgreSQL devuelve el ID en la primera fila
    };
  } catch (error) {
    console.error('Error en consulta PostgreSQL:', error);
    throw error;
  }
};

// ============================================
// Función para ejecutar transacciones
// ============================================
export const executeTransaction = async (
  queries: Array<{ query: string; params?: unknown[] }>
): Promise<void> => {
  const db = getDatabase();

  if (!db.postgresql) {
    throw new Error('PostgreSQL pool no está disponible');
  }

  const client = await db.postgresql.connect();

  try {
    await client.query('BEGIN');

    for (const { query, params = [] } of queries) {
      await client.query(query, params);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ============================================
// Función para obtener un cliente directo
// ============================================
export const getClient = async (): Promise<Pool> => {
  const db = getDatabase();

  if (!db.postgresql) {
    throw new Error('PostgreSQL pool no está disponible');
  }

  return db.postgresql;
};

export default {
  executeQuery,
  executeTransaction,
  getClient,
};

