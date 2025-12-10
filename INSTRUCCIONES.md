# Guía de Despliegue - MOBZI Modo Invitado

Esta carpeta (`MobziGuest`) contiene una versión simplificada del proyecto MOBZI, extraída para funcionar exclusivamente en **Modo Invitado**.

Se han eliminado los módulos de autenticación, registro, perfil de usuario y administración, dejando únicamente la funcionalidad principal de visualización de rutas y mapas.

## Requisitos

- **Node.js** (versión 16 o superior recomendada).
- **Base de Datos Local**: Debes tener tu base de datos MySQL ejecutándose localmente con el esquema y datos de MOBZI (municipios, rutas, paradas, etc.).

## Pasos para ejecutar

### 1. Configurar el Backend

El backend se encargará de leer las rutas de tu base de datos local.

1. Abre una terminal en la carpeta `backend`:
   ```bash
   cd MobziGuest/backend
   ```
2. Crea un archivo `.env` basado en el ejemplo:
   - Windows (PowerShell): `cp .env.example .env` o crea el archivo manualmente.
3. **IMPORTANTE**: Edita el archivo `.env` y configura los datos de tu base de datos local:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_contraseña_mysql
   DB_NAME=mobzi
   ```
4. Instala las dependencias e inicia el servidor:
   ```bash
   npm install
   npm run start:dev
   ```
   El backend debería indicar que se ha conectado a la base de datos y está corriendo en el puerto configurado (ej. 4000).

### 2. Configurar el Frontend

El frontend mostrará el mapa y consumirá los datos del backend local.

1. Abre otra terminal en la carpeta `frontend`:
   ```bash
   cd MobziGuest/frontend
   ```
2. Configura las variables de entorno si es necesario (crea `.env.local` si no existe, basándote en `.env.example`).
   - Asegúrate de que `NEXT_PUBLIC_API_URL` apunte a tu backend local (ej. `http://localhost:4000/api/v1`).
   - Asegúrate de tener el `NEXT_PUBLIC_MAPBOX_TOKEN` configurado.
3. Instala las dependencias e inicia la aplicación:
   ```bash
   npm install
   npm run dev
   ```
4. Abre tu navegador en `http://localhost:3000`. La aplicación redirigirá automáticamente a la vista de mapas `/home`.

## Cambios Realizados

- **Frontend**: Se eliminaron las páginas de login, registro y perfil. La página de inicio ahora redirige directamente al mapa.
- **Backend**: Se desactivaron las rutas y controladores de autenticación y administración para aligerar el servicio y evitar errores por dependencias faltantes.
