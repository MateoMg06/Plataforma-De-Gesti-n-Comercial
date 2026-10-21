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

## Estado: HU-03 · Roles y permisos (lista)

### Cómo proteger un endpoint tuyo (lo que necesitas, en 3 líneas)

Importa el decorador y el enum, y pon `@Roles(...)` encima del método:

```ts
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UserRole } from '../../../common/enums/domain.enums.js';

@Get()
@Roles(UserRole.ADMINISTRADOR, UserRole.LIDER)
listar() { /* ... */ }
```

Eso es todo. **No hay que registrar nada en tu módulo**: el `RolesGuard` es global
y ya corre en toda la aplicación (se registra en `auth.module.ts`).

| Lo que pasa | Respuesta |
|---|---|
| Sin sesión y la ruta tiene `@Roles()` | `401 Unauthorized` |
| Con sesión, pero el rol no está en la lista | `403 Forbidden` |
| La ruta **no** tiene `@Roles()` | Pasa cualquiera con sesión (como antes) |

### Saber quién es el usuario de la sesión

Si tu caso de uso necesita el usuario actual (por ejemplo, para que el asesor
solo vea lo suyo), importa `ObtenerUsuarioActualUseCase`, que este módulo exporta:

```ts
// en tu modulo.ts:  imports: [AuthModule]
this.usuarioActual.ejecutar(request.session.user) // -> Usuario { id, nombre, correo, rol, activo }
```

El controlador obtiene la sesión de la petición con `@Req()`:

```ts
@Get()
listar(@Req() req) {
  const usuario = this.usuarioActual.ejecutar(req.session.user);
  return this.listarVisitas.ejecutar(usuario);
}
```

`Usuario` tiene dos métodos de negocio que ahorran preguntas:

- `puedeAccederA([UserRole.ADMINISTRADOR])` — `false` si el usuario está desactivado.
- `esAsesor()` — para saber si hay que filtrar por sus propios datos.

### Qué hay hoy

| Archivo | Para qué sirve |
|---|---|
| `domain/usuario.ts` | Entidad de dominio: el rol y las reglas (`puedeAccederA`, `esAsesor`). TypeScript puro. |
| `application/obtener-usuario-actual.use-case.ts` | Convierte la sesión de BetterAuth en un `Usuario` del negocio. |
| `../../common/decorators/roles.decorator.ts` | El decorador `@Roles(...)`. |
| `../../common/guards/roles.guard.ts` | El guard global que hace cumplir `@Roles()`. |

### Detalles técnicos importantes (para la sustentación)

- **El `RolesGuard` es global** (`APP_GUARD` en `auth.module.ts`) para que todos
  los módulos lo tengan sin configurar nada. Si cada uno tuviera que registrarlo,
  sería fácil olvidarlo y dejar un endpoint abierto.
- **La clave de metadata es `'roles'`, no `'ROLES'`.** La librería de BetterAuth
  usa `'ROLES'` para su propio decorador, que solo entiende el plugin `admin`.
  Nuestro decorador usa `'roles'` a propósito, para no chocar ni depender de él.
- **El guard busca la sesión él mismo** si `request.session` todavía no está.
  Los guards globales de NestJS no garantizan un orden entre módulos, y esta
  integración registra el suyo por su cuenta. Buscar la sesión con
  `authService.api.getSession()` hace que el guard funcione sin importar el orden.
- **Un rol desconocido se trata como `asesor`.** Si en la base aparece un rol que
  no está en el enum `UserRole`, el usuario queda con los permisos mínimos. Fallar
  hacia el lado seguro, nunca hacia el lado permisivo.
- **El rol viaja en la sesión**, así que el frontend no necesita un endpoint extra
  para saber qué menú mostrar: lo lee de `GET /api/auth/get-session`.
