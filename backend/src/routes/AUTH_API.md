# API de Autenticación - Documentación

## Endpoints Disponibles

### 1. Registrar Usuario

**POST** `/api/v1/auth/register`

Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "MiPassword123",
  "confirmPassword": "MiPassword123",
  "acceptTerms": true
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "usuario": {
      "id": "usr-1234567890-abc123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "tipoUsuario": "regular"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `409`: Email ya registrado
- `500`: Error del servidor

---

### 2. Iniciar Sesión

**POST** `/api/v1/auth/login`

Inicia sesión con email y contraseña.

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "MiPassword123",
  "rememberUser": false
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id": "usr-1234567890-abc123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "tipoUsuario": "regular",
      "municipioPreferido": "huamantla"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Credenciales inválidas
- `403`: Cuenta desactivada
- `500`: Error del servidor

---

### 3. Verificar Token

**GET** `/api/v1/auth/verify`

Verifica si el token es válido y devuelve información del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "usr-1234567890-abc123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@example.com",
      "tipoUsuario": "regular",
      "municipioPreferido": "huamantla"
    }
  }
}
```

**Errores:**
- `401`: Token inválido o expirado
- `403`: Cuenta desactivada

---

### 4. Cerrar Sesión

**POST** `/api/v1/auth/logout`

Cierra la sesión del usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## Uso del Token

Una vez que obtienes el token en login o register, debes incluirlo en todas las peticiones protegidas:

```
Authorization: Bearer <tu_token_aqui>
```

El token expira en 7 días por defecto (configurable en `.env`).

---

## Ejemplos de Uso

### Con cURL

**Registro:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "password": "MiPassword123",
    "confirmPassword": "MiPassword123",
    "acceptTerms": true
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiPassword123"
  }'
```

**Verificar Token:**
```bash
curl -X GET http://localhost:3001/api/v1/auth/verify \
  -H "Authorization: Bearer <tu_token>"
```

### Con JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'juan@example.com',
    password: 'MiPassword123',
  }),
});

const data = await response.json();
const token = data.data.token;

// Usar token en peticiones protegidas
const protectedResponse = await fetch('http://localhost:3001/api/v1/auth/verify', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## Validaciones

### Registro
- Nombre: mínimo 2 caracteres, máximo 50
- Apellido: mínimo 2 caracteres, máximo 50
- Email: formato válido, máximo 255 caracteres
- Contraseña: mínimo 8 caracteres, máximo 100
- Las contraseñas deben coincidir
- Debe aceptar términos y condiciones

### Login
- Email: formato válido
- Contraseña: requerida

---

## Notas

- Todos los emails se convierten a minúsculas automáticamente
- Las contraseñas se hashean con bcrypt antes de guardarse
- Los tokens JWT incluyen: userId, email, tipoUsuario
- El último acceso se actualiza automáticamente en cada login

