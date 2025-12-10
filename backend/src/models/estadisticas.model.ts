/**
 * Modelo de Estadísticas
 * Funciones para interactuar con estadísticas de usuario
 */

import { executeQuery, getDbType } from '../database/db.connection';

// ============================================
// Obtener estadísticas de un usuario
// ============================================
export const getEstadisticasByUsuarioId = async (
  usuarioId: string
): Promise<{
  rutasGuardadas: number;
  rutasFavoritas: number;
  busquedasRealizadas: number;
  tiempoAhorrado: number;
}> => {
  const dbType = getDbType();

  // Valores por defecto
  let rutasGuardadas = 0;
  let rutasFavoritas = 0;
  let busquedasRealizadas = 0;

  try {
    // Contar rutas guardadas
    const rutasGuardadasQuery =
      dbType === 'mysql'
        ? 'SELECT COUNT(*) as count FROM rutas_guardadas WHERE usuario_id = ?'
        : 'SELECT COUNT(*) as count FROM rutas_guardadas WHERE usuario_id = $1';
    const rutasGuardadasResult = await executeQuery(rutasGuardadasQuery, [usuarioId]);
    const row0 = rutasGuardadasResult.rows[0] as Record<string, unknown> | undefined;
    rutasGuardadas = parseInt(String(row0?.count ?? '0'), 10);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.warn('Error al contar rutas guardadas:', msg);
    rutasGuardadas = 0;
  }

  try {
    // Contar rutas favoritas
    const rutasFavoritasQuery =
      dbType === 'mysql'
        ? 'SELECT COUNT(*) as count FROM rutas_guardadas WHERE usuario_id = ? AND favorita = true'
        : 'SELECT COUNT(*) as count FROM rutas_guardadas WHERE usuario_id = $1 AND favorita = true';
    const rutasFavoritasResult = await executeQuery(rutasFavoritasQuery, [usuarioId]);
    const row1 = rutasFavoritasResult.rows[0] as Record<string, unknown> | undefined;
    rutasFavoritas = parseInt(String(row1?.count ?? '0'), 10);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.warn('Error al contar rutas favoritas:', msg);
    rutasFavoritas = 0;
  }

  try {
    // Contar búsquedas realizadas - usar tabla 'busquedas' (no 'historial_busquedas')
    const busquedasQuery =
      dbType === 'mysql'
        ? 'SELECT COUNT(*) as count FROM busquedas WHERE usuario_id = ?'
        : 'SELECT COUNT(*) as count FROM busquedas WHERE usuario_id = $1';
    const busquedasResult = await executeQuery(busquedasQuery, [usuarioId]);
    const row2 = busquedasResult.rows[0] as Record<string, unknown> | undefined;
    busquedasRealizadas = parseInt(String(row2?.count ?? '0'), 10);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.warn('Error al contar búsquedas (tabla puede no existir):', msg);
    busquedasRealizadas = 0;
  }

  // Calcular tiempo ahorrado (estimado: 5 minutos por ruta guardada)
  const tiempoAhorrado = rutasGuardadas * 5;

  return {
    rutasGuardadas,
    rutasFavoritas,
    busquedasRealizadas,
    tiempoAhorrado,
  };
};

