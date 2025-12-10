/**
 * Modelo de Empresa
 * Funciones para interactuar con la tabla de empresas
 */

import { executeQuery, getDbType } from '../database/db.connection';
import { Empresa } from '../types/database.types';

// ============================================
// Obtener todas las empresas
// ============================================
export const getAllEmpresas = async (): Promise<Empresa[]> => {
  const query = 'SELECT * FROM empresas ORDER BY fecha_creacion DESC';
  const result = await executeQuery(query, []);
  return result.rows as Empresa[];
};

// ============================================
// Obtener empresas por municipio
// ============================================
export const getEmpresasByMunicipioId = async (municipioId: string): Promise<Empresa[]> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM empresas WHERE municipio_id = ? AND activa = true ORDER BY nombre ASC'
      : 'SELECT * FROM empresas WHERE municipio_id = $1 AND activa = true ORDER BY nombre ASC';
  const params = [municipioId];

  const result = await executeQuery(query, params);
  return result.rows as Empresa[];
};

// ============================================
// Obtener empresa por ID
// ============================================
export const getEmpresaById = async (id: string): Promise<Empresa | null> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM empresas WHERE id = ?'
      : 'SELECT * FROM empresas WHERE id = $1';
  const params = [id];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as Empresa;
};

export const createEmpresa = async (empresa: {
  id: string;
  nombre: string;
  municipio_id: string;
  telefono?: string | null;
  email?: string | null;
  activa?: boolean;
}): Promise<Empresa> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'INSERT INTO empresas (id, nombre, municipio_id, telefono, email, activa, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, NOW())'
      : 'INSERT INTO empresas (id, nombre, municipio_id, telefono, email, activa, fecha_creacion) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)';
  const params = [
    empresa.id,
    empresa.nombre,
    empresa.municipio_id,
    empresa.telefono ?? null,
    empresa.email ?? null,
    empresa.activa ?? true,
  ];
  await executeQuery(query, params);
  const creada = await getEmpresaById(empresa.id);
  return creada as Empresa;
};

export const updateEmpresa = async (
  id: string,
  updates: {
    nombre?: string;
    municipio_id?: string;
    telefono?: string | null;
    email?: string | null;
    activa?: boolean;
  }
): Promise<Empresa | null> => {
  const dbType = getDbType();
  const setParts: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  if (updates.nombre !== undefined) {
    setParts.push(dbType === 'mysql' ? 'nombre = ?' : `nombre = $${idx++}`);
    params.push(updates.nombre);
  }
  if (updates.municipio_id !== undefined) {
    setParts.push(dbType === 'mysql' ? 'municipio_id = ?' : `municipio_id = $${idx++}`);
    params.push(updates.municipio_id);
  }
  if (updates.telefono !== undefined) {
    setParts.push(dbType === 'mysql' ? 'telefono = ?' : `telefono = $${idx++}`);
    params.push(updates.telefono);
  }
  if (updates.email !== undefined) {
    setParts.push(dbType === 'mysql' ? 'email = ?' : `email = $${idx++}`);
    params.push(updates.email);
  }
  if (updates.activa !== undefined) {
    setParts.push(dbType === 'mysql' ? 'activa = ?' : `activa = $${idx++}`);
    params.push(updates.activa);
  }
  if (setParts.length === 0) {
    return await getEmpresaById(id);
  }
  const setClause = setParts.join(', ');
  let query: string;
  if (dbType === 'mysql') {
    query = `UPDATE empresas SET ${setClause}, fecha_actualizacion = NOW() WHERE id = ?`;
    params.push(id);
  } else {
    query = `UPDATE empresas SET ${setClause}, fecha_actualizacion = NOW() WHERE id = $${idx}`;
    params.push(id);
  }
  await executeQuery(query, params);
  return await getEmpresaById(id);
};

export const deleteEmpresa = async (id: string): Promise<void> => {
  const dbType = getDbType();
  const query = dbType === 'mysql' ? 'UPDATE empresas SET activa = false, fecha_actualizacion = NOW() WHERE id = ?' : 'UPDATE empresas SET activa = false, fecha_actualizacion = NOW() WHERE id = $1';
  await executeQuery(query, [id]);
};

export default {
  getAllEmpresas,
  getEmpresasByMunicipioId,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
};

