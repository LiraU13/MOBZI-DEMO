/**
 * Modelo de Preferencias
 * Funciones para interactuar con preferencias de usuario
 */

import { executeQuery, getDbType } from '../database/db.connection';

// ============================================
// Obtener preferencias de un usuario
// ============================================
export const getPreferenciasByUsuarioId = async (
  usuarioId: string
): Promise<{
  notificaciones: boolean;
  tema: string;
  idioma: string;
  mostrarFavoritas: boolean;
}> => {
  const dbType = getDbType();
  const query =
    dbType === 'mysql'
      ? 'SELECT * FROM preferencias_usuario WHERE usuario_id = ?'
      : 'SELECT * FROM preferencias_usuario WHERE usuario_id = $1';
  const params = [usuarioId];

  const result = await executeQuery(query, params);

  if (result.rows.length === 0) {
    // Retornar valores por defecto si no existen preferencias
    return {
      notificaciones: true,
      tema: 'auto',
      idioma: 'es',
      mostrarFavoritas: true,
    };
  }

  const pref = result.rows[0] as Record<string, unknown>;
  return {
    notificaciones: (pref.notificaciones as boolean | undefined) ?? true,
    tema: (pref.tema as string | undefined) ?? 'auto',
    idioma: (pref.idioma as string | undefined) ?? 'es',
    mostrarFavoritas: (pref.mostrar_favoritas as boolean | undefined) !== false,
  };
};

// ============================================
// Actualizar preferencias de un usuario
// ============================================
export const updatePreferencias = async (
  usuarioId: string,
  preferencias: {
    notificaciones?: boolean;
    tema?: string;
    idioma?: string;
    mostrarFavoritas?: boolean;
  }
): Promise<void> => {
  const dbType = getDbType();

  // Verificar si existen preferencias
  const checkQuery =
    dbType === 'mysql'
      ? 'SELECT id FROM preferencias_usuario WHERE usuario_id = ?'
      : 'SELECT id FROM preferencias_usuario WHERE usuario_id = $1';
  const checkResult = await executeQuery(checkQuery, [usuarioId]);

  if (checkResult.rows.length === 0) {
    // Crear preferencias si no existen
    const insertQuery =
      dbType === 'mysql'
        ? `
          INSERT INTO preferencias_usuario (
            usuario_id, notificaciones, tema, idioma, mostrar_favoritas
          ) VALUES (?, ?, ?, ?, ?)
        `
        : `
          INSERT INTO preferencias_usuario (
            usuario_id, notificaciones, tema, idioma, mostrar_favoritas
          ) VALUES ($1, $2, $3, $4, $5)
        `;
    const insertParams = [
      usuarioId,
      preferencias.notificaciones !== undefined ? preferencias.notificaciones : true,
      preferencias.tema || 'auto',
      preferencias.idioma || 'es',
      preferencias.mostrarFavoritas !== undefined ? preferencias.mostrarFavoritas : true,
    ];
    await executeQuery(insertQuery, insertParams);
  } else {
    // Actualizar preferencias existentes
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (preferencias.notificaciones !== undefined) {
      updates.push(
        dbType === 'mysql' ? 'notificaciones = ?' : `notificaciones = $${paramIndex++}`
      );
      params.push(preferencias.notificaciones);
    }
    if (preferencias.tema !== undefined) {
      updates.push(
        dbType === 'mysql' ? 'tema = ?' : `tema = $${paramIndex++}`
      );
      params.push(preferencias.tema);
    }
    if (preferencias.idioma !== undefined) {
      updates.push(
        dbType === 'mysql' ? 'idioma = ?' : `idioma = $${paramIndex++}`
      );
      params.push(preferencias.idioma);
    }
    if (preferencias.mostrarFavoritas !== undefined) {
      updates.push(
        dbType === 'mysql' ? 'mostrar_favoritas = ?' : `mostrar_favoritas = $${paramIndex++}`
      );
      params.push(preferencias.mostrarFavoritas);
    }

    if (updates.length > 0) {
      params.push(usuarioId);
      const updateQuery =
        dbType === 'mysql'
          ? `UPDATE preferencias_usuario SET ${updates.join(', ')} WHERE usuario_id = ?`
          : `UPDATE preferencias_usuario SET ${updates.join(', ')} WHERE usuario_id = $${paramIndex}`;
      await executeQuery(updateQuery, params);
    }
  }
};

