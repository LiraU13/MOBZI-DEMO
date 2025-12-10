/**
 * Tipos TypeScript para las entidades de la base de datos
 */

// ============================================
// Usuario
// ============================================
export interface Usuario {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  password_hash: string;
  reset_token?: string | null;
  telefono?: string;
  tipo_usuario: 'regular' | 'admin';
  municipio_preferido?: string;
  activo: boolean;
  fecha_registro: Date | string;
  fecha_actualizacion?: Date | string;
  ultimo_acceso?: Date | string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  telefono?: string;
  tipo_usuario?: 'regular' | 'admin';
  municipio_preferido?: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  municipioPreferido?: string;
  activo?: boolean;
}

// ============================================
// Municipio
// ============================================
export interface Municipio {
  id: string;
  nombre: string;
  centro_lng: number;
  centro_lat: number;
  activo: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
}

// ============================================
// Empresa
// ============================================
export interface Empresa {
  id: string;
  nombre: string;
  municipio_id: string;
  telefono?: string;
  email?: string;
  activa: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
}

// ============================================
// Ruta
// ============================================
export interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  municipio_id: string;
  empresa_id: string;
  costo_minimo: number;
  costo_maximo: number;
  moneda: string;
  duracion?: string;
  frecuencia?: string;
  usuarios_registrados: number;
  activa: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
  notas?: string;
}

export interface RutaCreate {
  nombre: string;
  origen: string;
  destino: string;
  municipio_id: string;
  empresa_id: string;
  costo_minimo: number;
  costo_maximo: number;
  moneda?: string;
  duracion?: string;
  frecuencia?: string;
  usuarios_registrados?: number;
  activa?: boolean;
  notas?: string;
}

export interface RutaUpdate {
  nombre?: string;
  origen?: string;
  destino?: string;
  municipio_id?: string;
  empresa_id?: string;
  costo_minimo?: number;
  costo_maximo?: number;
  moneda?: string;
  duracion?: string;
  frecuencia?: string;
  activa?: boolean;
  notas?: string;
}

// ============================================
// Parada
// ============================================
export interface Parada {
  id: number;
  ruta_id: string;
  nombre: string;
  orden: number;
  coordenada_lng: number;
  coordenada_lat: number;
  activa: boolean;
  fecha_creacion: Date | string;
}

export interface ParadaCreate {
  ruta_id: string;
  nombre: string;
  orden: number;
  coordenada_lng: number;
  coordenada_lat: number;
  activa?: boolean;
}

// ============================================
// Horario
// ============================================
export interface Horario {
  id: number;
  ruta_id: string;
  dia: string;
  salidas: string[]; // JSON array
  activo: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
}

export interface HorarioCreate {
  ruta_id: string;
  dia: string;
  salidas: string[];
  activo?: boolean;
}

// ============================================
// Ruta Guardada
// ============================================
export interface RutaGuardada {
  id: string;
  usuario_id: string;
  ruta_id: string;
  nombre_personalizado?: string;
  favorita: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
}

export interface RutaGuardadaCreate {
  usuario_id: string;
  ruta_id: string;
  nombre_personalizado?: string;
  favorita?: boolean;
}

export interface RutaGuardadaUpdate {
  nombre_personalizado?: string;
  favorita?: boolean;
}

// ============================================
// Preferencias Usuario
// ============================================
export interface PreferenciasUsuario {
  id: number;
  usuario_id: string;
  notificaciones: boolean;
  tema: 'oscuro' | 'claro' | 'auto';
  idioma: string;
  mostrar_favoritas: boolean;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
}

export interface PreferenciasUsuarioUpdate {
  notificaciones?: boolean;
  tema?: 'oscuro' | 'claro' | 'auto';
  idioma?: string;
  mostrar_favoritas?: boolean;
}

// ============================================
// Estadísticas Usuario
// ============================================
export interface EstadisticasUsuario {
  id: number;
  usuario_id: string;
  rutas_guardadas: number;
  rutas_favoritas: number;
  busquedas_realizadas: number;
  tiempo_ahorrado: number;
  fecha_creacion: Date | string;
  fecha_actualizacion?: Date | string;
}

// ============================================
// Búsqueda
// ============================================
export interface Busqueda {
  id: number;
  usuario_id?: string;
  query: string;
  municipio_id?: string;
  resultados_encontrados: number;
  fecha_busqueda: Date | string;
}

export interface BusquedaCreate {
  usuario_id?: string;
  query: string;
  municipio_id?: string;
  resultados_encontrados: number;
}

