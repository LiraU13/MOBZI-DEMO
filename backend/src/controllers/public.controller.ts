/**
 * Controlador Público
 * Maneja las peticiones públicas (sin autenticación)
 */

import { Request, Response } from 'express';
import { getAllMunicipios } from '../models/municipio.model';
import { getAllRutas, getRutaById } from '../models/ruta.model';
import { getEmpresasByMunicipioId } from '../models/empresa.model';
import { getParadasByRutaId } from '../models/parada.model';
import { getHorariosByRutaId } from '../models/horario.model';

// ============================================
// Obtener todos los municipios
// ============================================
export const getMunicipios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const municipios = await getAllMunicipios();

    // Formatear para el frontend
    const municipiosFormateados = municipios.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      centro: {
        lng: parseFloat(m.centro_lng.toString()),
        lat: parseFloat(m.centro_lat.toString()),
      },
    }));

    res.json({
      success: true,
      data: municipiosFormateados,
    });
  } catch (error: unknown) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener municipios',
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

// ============================================
// Obtener rutas por municipio
// ============================================
export const getRutasByMunicipio = async (req: Request, res: Response): Promise<void> => {
  try {
    const municipioId = req.query.municipio as string;

    if (!municipioId) {
      res.status(400).json({
        success: false,
        message: 'Parámetro municipio requerido',
      });
      return;
    }

    // Obtener todas las rutas y filtrar por municipio
    const todasLasRutas = await getAllRutas();
    const rutasFiltradas = todasLasRutas.filter(
      (r) => r.municipio_id === municipioId && r.activa
    );

    // Formatear para el frontend
    const rutasFormateadas = rutasFiltradas.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      origen: r.origen,
      destino: r.destino,
      empresaId: r.empresa_id,
      costoMinimo: r.costo_minimo,
      costoMaximo: r.costo_maximo,
      moneda: r.moneda,
    }));

    res.json({
      success: true,
      data: rutasFormateadas,
    });
  } catch (error: unknown) {
    console.error('Error al obtener rutas por municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener rutas',
       error: error instanceof Error ? error.message : undefined,
    });
  }
};

// ============================================
// Obtener empresas por municipio
// ============================================
export const getEmpresasByMunicipio = async (req: Request, res: Response): Promise<void> => {
  try {
    const municipioId = req.query.municipio as string;

    if (!municipioId) {
      res.status(400).json({
        success: false,
        message: 'Parámetro municipio requerido',
      });
      return;
    }

    const empresas = await getEmpresasByMunicipioId(municipioId);

    // Formatear para el frontend
    const empresasFormateadas = empresas.map((e) => ({
      id: e.id,
      nombre: e.nombre,
    }));

    res.json({
      success: true,
      data: empresasFormateadas,
    });
  } catch (error: unknown) {
    console.error('Error al obtener empresas por municipio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empresas',
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

// ============================================
// Obtener detalles de una ruta específica
// ============================================
export const getRutaDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const rutaId = req.params.id;

    if (!rutaId) {
      res.status(400).json({
        success: false,
        message: 'ID de ruta requerido',
      });
      return;
    }

    // Obtener ruta
    const ruta = await getRutaById(rutaId);
    if (!ruta || !ruta.activa) {
      res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
      });
      return;
    }

    // Obtener paradas
    const paradas = await getParadasByRutaId(rutaId);
    const nombresParadas = paradas.map((p) => p.nombre);
    const coordenadas: [number, number][] = paradas.map((p) => [
      parseFloat(p.coordenada_lng.toString()),
      parseFloat(p.coordenada_lat.toString()),
    ]);

    // Obtener horarios
    const horarios = await getHorariosByRutaId(rutaId);
    const horariosFormateados = horarios.map((h) => ({
      dia: h.dia,
      salidas: h.salidas,
    }));

    res.json({
      success: true,
      data: {
        id: ruta.id,
        nombre: ruta.nombre,
        origen: ruta.origen,
        destino: ruta.destino,
        costoMinimo: ruta.costo_minimo,
        costoMaximo: ruta.costo_maximo,
        moneda: ruta.moneda,
        duracion: ruta.duracion || '',
        frecuencia: ruta.frecuencia || '',
        paradas: nombresParadas,
        coordenadas,
        horarios: horariosFormateados,
        notas: ruta.notas || '',
      },
    });
  } catch (error: unknown) {
    console.error('Error al obtener detalles de ruta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de ruta',
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

// Endpoint temporal para recibir logs del cliente en desarrollo
export const postDebugLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;
    // Imprimir en consola del servidor para debug remoto
    console.log('[CLIENT-LOG]', JSON.stringify(payload));
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Error al recibir debug log:', error);
    res.status(500).json({ success: false });
  }
};

export default {
  getMunicipios,
  getRutasByMunicipio,
  getEmpresasByMunicipio,
  getRutaDetails,
  postDebugLog,
};

