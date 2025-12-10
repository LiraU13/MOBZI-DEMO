/**
 * Configuración de conexiones a bases de datos
 * Soporta MySQL (XAMPP) y PostgreSQL (Supabase)
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Pool, PoolConfig } from 'pg';

dotenv.config();

// ============================================
// Tipos
// ============================================
export type DatabaseType = 'mysql' | 'postgresql';

export interface DatabaseConfig {
  type: DatabaseType;
  mysql?: mysql.Pool;
  postgresql?: Pool;
}

// ============================================
// Configuración MySQL
// ============================================
const mysqlConfig: mysql.PoolOptions = {
  host: process.env.DB_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.DB_MYSQL_PORT || '3306'),
  user: process.env.DB_MYSQL_USER || 'root',
  password: process.env.DB_MYSQL_PASSWORD || '',
  database: process.env.DB_MYSQL_DATABASE || 'mobzi',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_MYSQL_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// ============================================
// Configuración PostgreSQL
// ============================================
const postgresqlConfig: PoolConfig = {
  host: process.env.DB_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DB_POSTGRES_PORT || '5432'),
  user: process.env.DB_POSTGRES_USER || 'postgres',
  password: process.env.DB_POSTGRES_PASSWORD || '',
  database: process.env.DB_POSTGRES_DATABASE || 'postgres',
  ssl: process.env.DB_POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// ============================================
// Crear pools de conexión
// ============================================
let mysqlPool: mysql.Pool | null = null;
let postgresqlPool: Pool | null = null;

export const dbType = (process.env.DB_TYPE || 'mysql') as DatabaseType;

// Crear pool MySQL
if (dbType === 'mysql') {
  try {
    mysqlPool = mysql.createPool(mysqlConfig);
    console.log('✅ MySQL pool creado correctamente');
  } catch (error) {
    console.error('❌ Error al crear MySQL pool:', error);
  }
}

// Crear pool PostgreSQL
if (dbType === 'postgresql') {
  try {
    postgresqlPool = new Pool(postgresqlConfig);
    console.log('✅ PostgreSQL pool creado correctamente');
  } catch (error) {
    console.error('❌ Error al crear PostgreSQL pool:', error);
  }
}

// ============================================
// Función para obtener la conexión activa
// ============================================
export const getDatabase = (): DatabaseConfig => {
  return {
    type: dbType,
    mysql: mysqlPool || undefined,
    postgresql: postgresqlPool || undefined,
  };
};

// ============================================
// Función para probar la conexión
// ============================================
export const testConnection = async (): Promise<boolean> => {
  try {
    if (dbType === 'mysql' && mysqlPool) {
      const connection = await mysqlPool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Conexión MySQL verificada');
      return true;
    }

    if (dbType === 'postgresql' && postgresqlPool) {
      const result = await postgresqlPool.query('SELECT NOW()');
      console.log('✅ Conexión PostgreSQL verificada:', result.rows[0]);
      return true;
    }

    console.error('❌ No hay pool de conexión disponible');
    return false;
  } catch (error) {
    console.error('❌ Error al verificar conexión:', error);
    return false;
  }
};

// ============================================
// Función para cerrar conexiones
// ============================================
export const closeConnections = async (): Promise<void> => {
  try {
    if (mysqlPool) {
      await mysqlPool.end();
      console.log('✅ Conexiones MySQL cerradas');
    }

    if (postgresqlPool) {
      await postgresqlPool.end();
      console.log('✅ Conexiones PostgreSQL cerradas');
    }
  } catch (error) {
    console.error('❌ Error al cerrar conexiones:', error);
  }
};

// ============================================
// Exportar configuración
// ============================================
export default {
  getDatabase,
  testConnection,
  closeConnections,
  dbType,
  mysqlConfig,
  postgresqlConfig,
};

