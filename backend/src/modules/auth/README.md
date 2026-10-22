# Módulo `auth`

**Responsable:** Kevin V

**Historias:** HU-01 a HU-04

**Tablas del modelo:** usuarios y sesiones (las crea BetterAuth)

Copia la estructura de `../zonas`: entidad y puerto en `domain/`, casos de uso en `application/`, entidades TypeORM (`*.orm-entity.ts`) y adaptadores en `infrastructure/`, controladores y DTOs en `presentation/`.

---

## Estado: HU-01 · Inicio de sesión (lista)

La autenticación la resuelve **BetterAuth** de punta a punta. Por eso esta historia
no tiene caso de uso ni controlador propios: no hay lógica de negocio nuestra que
escribir, BetterAuth ya valida el correo y la contraseña.

### Qué hay hoy

| Archivo | Para qué sirve |
|---|---|
| `infrastructure/auth.ts` | La instancia `betterAuth()`. Conecta al **mismo** PostgreSQL que TypeORM usando el pool de `pg` y las variables `DB_*`. Habilita correo+contraseña. |
| `auth.module.ts` | Módulo NestJS que monta el handler de BetterAuth en **`/api/auth/*`**. |
| `../../database/migrations/1792507519570-CrearTablasBetterAuth.ts` | Crea las tablas `user`, `session`, `account` y `verification` con el SQL oficial de BetterAuth. |

### Cómo funciona

- **Login:** `POST /api/auth/sign-in/email` con `{ email, password }`.
  Crea la sesión y deja una **cookie httpOnly** en el navegador.
- **Ver sesión:** `GET /api/auth/get-session` devuelve el usuario o `null`.
- **Errores:** credenciales inválidas responden **401** con
  `{"message":"Invalid email or password"}`. El mensaje es igual si el correo no
  existe, para no revelar qué correos están registrados.
- **La contraseña nunca sale:** se guarda hasheada (scrypt) en la columna
  `account.password` y no aparece en ninguna respuesta ni log.

### Cómo probarlo (paso a paso)

1. `docker compose up -d` en la raíz.
2. `cd backend && npm run migration:run` (crea las tablas).
3. `npm run start:dev` en `backend/` y `npm run dev` en `frontend/`.
4. Abrir `http://localhost:5173/login`.

**Nota sobre usuarios:** BetterAuth trae el registro de fábrica, así que por ahora
se crea un usuario con:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Nombre","email":"correo@empresa.com","password":"contraseña"}'
```

Ese endpoint se restringe o se esconde en la **HU-04** (administración de usuarios).

### Detalles técnicos importantes (para explicar en la sustentación)

- **`disableGlobalAuthGuard: true`**: la librería `@thallesp/nestjs-better-auth`
  activa por defecto un guard que protege **todos** los endpoints. Lo dejamos
  desactivado en la HU-01 para no romper los otros módulos (`/api/health`,
  `/api/zonas`...). Activarlo con `@AllowAnonymous()` y `@Roles()` es la **HU-02**
  y **HU-03**.
- **`bodyParser: false`** en `main.ts`: requisito de la integración oficial.
  BetterAuth necesita leer el body crudo; la librería vuelve a agregar el parser
  para las rutas normales.
- **`import 'dotenv/config'`** en `infrastructure/auth.ts`: este archivo se evalúa
  al importar los módulos, *antes* de que `ConfigModule` cargue el `.env`.
  Es el mismo truco que usa `src/database/data-source.ts`.

### Variables de entorno (en `.env`, nunca en el código)

- `BETTER_AUTH_SECRET` — secreto de cifrado. Generar con `openssl rand -base64 32`.
- `BETTER_AUTH_URL` — `http://localhost:3000`.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — las mismas del backend.
- `FRONTEND_URL` — `http://localhost:5173`. Necesario para CORS y cookies.

---

## HU-03 · Roles y permisos

Hay **una sola** forma de proteger por rol: el `@Roles()` de la integración oficial
`@thallesp/nestjs-better-auth`. No hay guard propio.

### Cómo proteger un endpoint

```ts
import { Roles } from '@thallesp/nestjs-better-auth';

@Roles(['administrador'])            // o ['administrador', 'lider']
@Post()
crear(@Body() dto: CrearZonaDto) { /* ... */ }
```

No hay que registrar nada en tu módulo: el `AuthGuard` de la librería ya es global.

| Lo que pasa | Respuesta |
|---|---|
| Sin sesión | `401` |
| Con sesión, pero el rol no está en la lista | `403` |
| El usuario no tiene rol | `403`. La librería niega el acceso (`if (!role) return false`) |
| El endpoint no tiene `@Roles()` | Pasa cualquiera con sesión |

### De dónde sale el rol

- La columna `role` de la tabla `user` (migración `AgregarRolUsuario`). Sus valores son `administrador`, `lider` y `asesor`, y por defecto es `asesor`.
- En `infrastructure/auth.ts` se declara con `additionalFields` e `input: false`, para que **nadie pueda elegir su rol al registrarse**.
- Llega a la sesión como **`user.role`**, no como `rol`. El frontend lo lee de `GET /api/auth/get-session` para filtrar el menú.
- Para asignar roles en local: `npm run seed` (ver el README principal).

### Que el asesor vea solo lo suyo

Lee el usuario de la sesión en el controlador y pásalo al caso de uso:

```ts
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Get()
listar(@Session() session: UserSession) {
  return this.listarVisitas.ejecutar({ id: session.user.id, role: session.user.role as string });
}
```

En el caso de uso, si `role === 'asesor'`, busca su asesor con `ObtenerAsesorPorUsuarioUseCase` (lo exporta el módulo asesores, por la columna `id_usuario`) y filtra. Así lo hacen visitas, rutas, clientes y el dashboard.

> **Ojo:** no uses un `@Roles` propio con otra clave de metadata (`'roles'`). Nadie lo
> revisaría y el endpoint quedaría **abierto sin avisar**. Por eso se borró
> `common/decorators/roles.decorator.ts`.

---

## HU-04 · Administración de usuarios

La administración de usuarios se resuelve utilizando el **plugin oficial `admin` de BetterAuth** con control de acceso por roles (`createAccessControl`) y la columna `activo` para borrado lógico (desactivación).

### Qué hay hoy

| Archivo | Para qué sirve |
|---|---|
| `infrastructure/auth.ts` | Configura el plugin `admin` con permisos RBAC estrictos (solo `administrador` puede crear, listar, modificar y desactivar usuarios), y declara el campo `activo` en `user.additionalFields`. |
| `frontend/src/pages/UsuariosPage.tsx` | Pantalla de administración en Configuración (`/configuracion/usuarios`) para listar usuarios, registrar nuevos con contraseña y activar/inactivar cuentas. |
| `frontend/src/pages/CatalogosPage.tsx` | Enlace a la gestión de usuarios dentro del menú de Configuración. |
| `frontend/src/App.tsx` | Registra la ruta protegida `/configuracion/usuarios`. |

### Cómo funciona

- **Listar usuarios:** `GET /api/auth/admin/list-users` (solo rol `administrador`). Devuelve todos los usuarios registrados con su nombre, correo, rol y estado.
- **Crear usuario:** `POST /api/auth/admin/create-user` con `{ name, email, password, role }`.
  - Valida automáticamente que el correo sea único (BetterAuth rechaza duplicados).
  - La contraseña se hashea de forma segura con Scrypt antes de guardarse en `account`.
  - El usuario se crea con estado `activo: true` por defecto.
- **Activar / Inactivar:** `POST /api/auth/admin/update-user` con `{ userId, data: { activo: boolean } }`.
  - Cumple la regla *"no se eliminan usuarios con actividad, solo se desactivan"*: la pantalla no expone eliminación destructiva física para no romper claves foráneas ni perder la autoría histórica en visitas, cotizaciones o pedidos.
- **Bloqueo de acceso:** Un usuario con `activo: false` no puede acceder a las funciones del sistema.

### Detalles técnicos importantes (para explicar en la sustentación)

- **Control de acceso del plugin admin (`createAccessControl`):** En `infrastructure/auth.ts`, definimos explícitamente qué acciones puede hacer cada rol sobre el recurso `user`. El rol `administrador` tiene permisos completos (`create`, `list`, `update`, `set-role`, `ban`, `get`), `lider` solo `list`, y `asesor` ninguno (`[]`). Si un usuario que no es administrador intenta consumir los endpoints de `/api/auth/admin/*`, BetterAuth devuelve automáticamente **403 Forbidden**.
- **Borrado lógico vs. Borrado físico:** En sistemas comerciales y de auditoría nunca se eliminan registros con historial (`DELETE FROM "user"`). En su lugar se usa el campo `activo: boolean`. Esto preserva la integridad de las relaciones con asesores, agendas, visitas y seguimientos.
- **Sin registro público:** No existe pantalla de registro para usuarios externos; solo los administradores autenticados pueden registrar personal del equipo desde el módulo de Configuración.

### Cómo probarlo (paso a paso)

1. Iniciar sesión como administrador (`admin@comercial360.co` / `Demo2026!`).
2. Ir a **Configuración** en el menú lateral y hacer clic en **Usuarios**.
3. **Crear usuario:** Llenar el formulario con nombre, correo nuevo, contraseña y rol (ej. `asesor`). Al hacer clic en "Agregar", el nuevo usuario aparece en la tabla inferior.
4. **Validar correo único:** Intentar registrar otro usuario con el mismo correo. El sistema mostrará un error indicando que ya está registrado.
5. **Inactivar usuario:** En la tabla, presionar el botón "Inactivar" del usuario recién creado. Su badge cambia a `inactivo` y el botón a "Activar".
6. **Activar usuario:** Presionar "Activar" para restaurar el estado activo de la cuenta.

