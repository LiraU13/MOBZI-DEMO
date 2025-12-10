/**
 * Rutas Públicas
 * No requieren autenticación
 */

import { Router } from 'express';
import {
  getMunicipios,
  getRutasByMunicipio,
  getEmpresasByMunicipio,
  getRutaDetails,
  postDebugLog,
} from '../controllers/public.controller';

const router = Router();

// GET /api/v1/municipios - Obtener todos los municipios
router.get('/municipios', getMunicipios);

// GET /api/v1/rutas?municipio=xxx - Obtener rutas por municipio
router.get('/rutas', getRutasByMunicipio);

// GET /api/v1/empresas?municipio=xxx - Obtener empresas por municipio
router.get('/empresas', getEmpresasByMunicipio);

// GET /api/v1/rutas/:id - Obtener detalles de una ruta específica
router.get('/rutas/:id', getRutaDetails);

// POST /api/v1/debug/logs - endpoint temporal para recibir logs desde el cliente en desarrollo
router.post('/debug/logs', postDebugLog);

export default router;

