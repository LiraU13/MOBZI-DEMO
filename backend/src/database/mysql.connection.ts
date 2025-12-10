/**
 * Utilidades específicas para MySQL
 */

import mysql from 'mysql2/promise';
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
// Función para ejecutar consultas MySQL
// ============================================
export const executeQuery = async (
  query: string,
  params: unknown[] = []
): Promise<QueryResult> => {
  const db = getDatabase();

  if (!db.mysql) {
    throw new Error('MySQL pool no está disponible');
  }

  try {
    const [rows] = await db.mysql.execute(query, params);
    const result = rows as mysql.RowDataPacket[] | mysql.ResultSetHeader;

    // Si es un INSERT, UPDATE o DELETE
    if (Array.isArray(result)) {
      return {
        rows: result,
        rowCount: result.length,
      };
    } else {
      // ResultSetHeader para INSERT, UPDATE, DELETE
      return {
        rows: [],
        rowCount: result.affectedRows || 0,
        insertId: result.insertId,
      };
    }
  } catch (error) {
    console.error('Error en consulta MySQL:', error);
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

  if (!db.mysql) {
    throw new Error('MySQL pool no está disponible');
  }

  const connection = await db.mysql.getConnection();

  try {
    await connection.beginTransaction();

    for (const { query, params = [] } of queries) {
      await connection.execute(query, params);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// Función para obtener una conexión directa
// ============================================
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  const db = getDatabase();

  if (!db.mysql) {
    throw new Error('MySQL pool no está disponible');
  }

  return await db.mysql.getConnection();
};

export default {
  executeQuery,
  executeTransaction,
  getConnection,
};

