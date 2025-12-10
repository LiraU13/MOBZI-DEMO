# Guía de Despliegue MOBZI (Modo Invitado)

Esta guía te llevará paso a paso para desplegar **MOBZI Guest** totalmente gratis utilizando:

- **Base de Datos**: Neon (PostgreSQL)
- **Backend**: Render
- **Frontend**: Vercel

---

## 🚀 Paso 1: Exportar tus Datos Locales

Antes de subir nada, necesitamos sacar tus rutas de tu MySQL local y convertirlas a un formato compatible con PostgreSQL.

1.  Asegúrate de que tu archivo `MobziGuest/backend/.env` tiene las credenciales correctas de tu **MySQL local**.
2.  Abre una terminal en `MobziGuest/backend` y ejecuta:
    ```bash
    npm install
    # Ejecutar el script mágico de exportación
    npx tsx scripts/generate_postgres_dump.ts
    ```
3.  Esto generará un archivo llamado `data_dump_postgres.sql` en la carpeta `MobziGuest`. **¡Guárdalo bien!**

---

## 🐘 Paso 2: Crear la Base de Datos en Neon

1.  Ve a [neon.tech](https://neon.tech) y regístrate (plan Free Tier).
2.  Crea un nuevo proyecto llamado `mobzi-db`.
3.  Copia la **Connection String** (se ve como `postgres://usuario:pass@...`).
4.  Ve a la sección **SQL Editor** en Neon.
5.  **Primero: Crear las tablas**:
    - Abre el archivo `MobziGuest/backend/database/postgresql_db.sql` de tu proyecto.
    - Copia todo su contenido y pégalo en el SQL Editor de Neon.
    - Ejecuta el script.
6.  **Segundo: Cargar tus datos**:
    - Abre el archivo `data_dump_postgres.sql` que generaste en el Paso 1.
    - Copia todo el contenido y pégalo en el SQL Editor de Neon.
    - Ejecuta el script.
    - _Tip: Verifica que se cargaron datos haciendo `SELECT _ FROM rutas;`\*

---

## 🖥️ Paso 3: Desplegar Backend en Render

1.  Sube tu carpeta `MobziGuest` a un nuevo repositorio en GitHub (o al mismo, en una carpeta).
    - _Nota: Render te pedirá acceso a tu GitHub._
2.  Ve a [dashboard.render.com](https://dashboard.render.com) > **New +** > **Web Service**.
3.  Conecta tu repositorio.
4.  Configuración:
    - **Root Directory**: `backend`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm run start`
    - **Environment Variables** (Añadir estas variables):
      - `DB_TYPE`: `postgresql`
      - `DB_POSTGRES_HOST`: **SOLO el host** (ej: `ep-steep-smoke-123456.us-east-2.aws.neon.tech`). **NO** incluyas `postgres://` ni el usuario/pass ni `/neondb`.
      - `DB_POSTGRES_PORT`: `5432`
      - `DB_POSTGRES_USER`: Tu usuario (ej: `neondb_owner`)
      - `DB_POSTGRES_PASSWORD`: Tu contraseña
      - `DB_POSTGRES_DATABASE`: `neondb` (o el nombre de tu BD en Neon)
      - `DB_POSTGRES_SSL`: `true`
      - `PORT`: `10000` (Render usa este por defecto)
5.  Haz clic en **Create Web Service**. Espera a que termine.
6.  Copia la URL que te da Render (ej. `https://mobzi-backend.onrender.com`).

---

## 🌐 Paso 4: Desplegar Frontend en Vercel

1.  Ve a [vercel.com](https://vercel.com) > **Add New...** > **Project**.
2.  Importa el mismo repositorio de GitHub.
3.  Configuración:
    - **Root Directory**: `frontend` (Editalo si no lo detecta).
    - **Environment Variables**:
      - `NEXT_PUBLIC_API_URL`: Pega la URL de tu backend en Render + `/api/v1` (Ej. `https://mobzi-backend.onrender.com/api/v1`).
      - `NEXT_PUBLIC_MAPBOX_TOKEN`: Tu token de Mapbox.
4.  Haz clic en **Deploy**.

---

## ¡Listo! 🎉

Tu demostración de MOBZI Modo Invitado debería estar funcionando en la URL que te de Vercel.

**Notas:**

- El backend en Render (Free) se "duerme" tras 15 min de inactividad. La primera carga puede tardar unos 30-60 segundos en despertar.
- Si actualizas rutas en tu local, tendrás que repetir el proceso de exportación (Paso 1) y ejecutarlo en Neon (Paso 2).
