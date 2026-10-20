# Informe de trabajo — HU-01 y HU-02 (Autenticación)

**Responsable:** Kevin V (kevinusergt)
**Fecha:** 20 de octubre de 2026
**Ramas:** `feature/HU-01-inicio-sesion`, `feature/HU-02-rutas-protegidas`
**Módulo:** `backend/src/modules/auth/`

---

## Resumen

Se implementó el inicio y cierre de sesión de Comercial 360 con **BetterAuth**,
siguiendo Clean Architecture y el patrón del módulo `zonas`. Las dos historias
quedaron probadas de punta a punta y commiteadas, pendientes de push y PR.

---

## HU-01 · Inicio de sesión

*Criterio: credenciales válidas crean sesión y llevan al dashboard; inválidas
muestran un error claro sin revelar datos; la contraseña nunca aparece en
respuestas ni logs.*

### Backend

| Archivo | Qué hace |
|---|---|
| `backend/src/modules/auth/infrastructure/auth.ts` | Crea la instancia de BetterAuth: pool de `pg`, configuración de `DB_*`, `emailAndPassword` activado, `secret`/`baseURL` desde `.env` y `trustedOrigins`. |
| `backend/src/modules/auth/auth.module.ts` | Módulo de NestJS que monta el handler de BetterAuth bajo `/api/auth/*`. |
| `backend/src/modules/auth/README.md` | Documentación del módulo: cómo probarlo y detalles técnicos. |
| `backend/src/database/migrations/1792507519570-CrearTablasBetterAuth.ts` | Crea las tablas `user`, `session`, `account` y `verification`. |
| `backend/src/main.ts` | `bodyParser: false` (requisito de la integración con BetterAuth). |
| `backend/src/app.module.ts` | Registra el `AuthModule`. |

**Dependencias instaladas (con permiso):** `better-auth`,
`@thallesp/nestjs-better-auth` (integración que recomienda la doc oficial
de BetterAuth para NestJS) y `@types/pg` (devDependency).

### Frontend

| Archivo | Qué hace |
|---|---|
| `frontend/src/pages/LoginPage.tsx` | Formulario de login conectado con `api()` a `POST /auth/sign-in/email`. |
| `frontend/src/pages/LoginPage.css` | Clase `.login-error` para el mensaje de error. |
| `frontend/src/api/client.ts` | Evita redirigir a `/login` cuando ya se está en `/login` (arregla un bucle de 401). |

### Verificaciones HU-01

- Registro de usuario: funciona.
- Login correcto → crea sesión con cookie **httpOnly**.
- Contraseña incorrecta → `401` con mensaje genérico *"Invalid email or password"*.
- Correo inexistente → `401` con el **mismo** mensaje (no revela si la cuenta existe).
- La contraseña se guarda hasheada con **scrypt** (161 caracteres), nunca en claro.
- CORS funcionando desde `http://localhost:5173`.

---

## HU-02 · Cierre de sesión y rutas protegidas

*Criterio: el logout invalida la sesión en el servidor; los endpoints privados
responden 401 sin sesión; el frontend redirige a /login al perder la sesión.*

### Cambios

| Archivo | Qué hace |
|---|---|
| `backend/src/modules/auth/auth.module.ts` | Se quitó `disableGlobalAuthGuard: true` → el **guard global quedó activo**. |
| `backend/src/shared/presentation/health.controller.ts` | `@AllowAnonymous()` para que `/api/health` siga siendo público (lo usan Jenkins y EC2). |
| `frontend/src/layout/AppLayout.tsx` | Botón **"Cerrar sesión"** en la barra superior: llama `POST /auth/sign-out` y navega a `/login`. |
| `frontend/src/layout/AppLayout.css` | Estilos del botón (`.logout`). |
| `frontend/src/pages/LoginPage.tsx` | Al abrir `/login` con sesión activa, redirige al **dashboard** (evita volver al login estando dentro). |

> El frontend ya redirigía a `/login` al recibir un 401 (lo implementó la HU-01
> en `client.ts`), así que ese criterio ya estaba cubierto.

### Verificaciones HU-02 (flujo completo probado)

| Paso | Resultado |
|---|---|
| `/api/health` sin sesión | `200` ✓ (Jenkins no se rompe) |
| `/api/zonas` sin sesión | `401` ✓ (endpoint privado protegido) |
| Login | `200` ✓ |
| `/api/zonas` con sesión | `200` ✓ |
| Logout | `200` ✓ y **la fila se borró de la tabla `session`** |
| `/api/zonas` con la cookie vieja | `401` ✓ |
| `get-session` después del logout | `null` ✓ |

### Hallazgo técnico: protección CSRF de BetterAuth

Al probar el logout con `curl` devolvía `403`. La causa: BetterAuth valida el
header **`Origin`** como protección CSRF y `curl` no lo envía. **El navegador sí
lo manda siempre**, así que en el uso real funciona. Buen dato para la
sustentación: demuestra que las peticiones se validan por origen.

---

## Calidad

| Verificación | Resultado |
|---|---|
| `backend` — `npm test` | 3 tests pasan |
| `backend` — lint | pasa |
| `frontend` — `npm run build` | pasa |
| `frontend` — lint | pasa |
| `backend` — `npm run build` | **Falla solo por `src/common/utils/bcrypt.ts`**, que es de otro compañero (ver "Pendientes") |

---

## Commits (autor corregido a `kevinusergt <kevinvilla6033@gmail.com>`)

**`feature/HU-01-inicio-sesion`**
1. `48d0f08` — `HU-01: agrega BetterAuth con módulo auth y sus tablas`
2. `2e1af54` — `HU-01: conecta el login del frontend`

**`feature/HU-02-rutas-protegidas`** (incluye los dos anteriores)
3. `b1e60ae` — `HU-02: activa el guard de sesión y marca health como público`
4. `0905b71` — `HU-02: agrega cierre de sesión en el layout`

> La rama original `feature/HU-001-login` fue **renombrada**: el hook de husky
> exige dos dígitos (`HU-XX`), no tres. Los commits se reescribieron para
> corregir el autor; se verificó que el **árbol de contenido quedó idéntico**
> (no cambió ninguna línea de código).

---

## Decisiones tomadas

1. **BetterAuth + `@thallesp/nestjs-better-auth`**, la integración que recomienda
   la documentación oficial de BetterAuth para NestJS.
2. **Mismo PostgreSQL** usando el pool de `pg` ya existente (sin adapter
   TypeORM, que BetterAuth no tiene oficial).
3. **Guard global desactivado en HU-01** para no romper `/api/health` y
   `/api/zonas`; se activó en la HU-02.
4. **Dos ramas, un PR por historia**, siguiendo `CONTRIBUTING.md`.
5. **El puente user ↔ asesor se difirió a la HU-03** (ver pendientes).

---

## Pendientes y avisos al equipo

1. **Ocean4blue / Mateo:** `backend/src/common/utils/bcrypt.ts` (commit
   `e4c0b1d`) rompe `npm run build` para todos. Importa `bcryptjs` pero instaló
   `bcrypt`. Arreglar: cambiar el import a `'bcrypt'`. **No se tocó** porque es
   su archivo.
2. **Francisco:** con el guard activo, `/api/zonas` responde `401` sin sesión.
   Es lo correcto para el producto, pero si prueba con `curl` debe loguearse
   primero. **No se tocó su archivo.**
3. **Mateo (HU-03):** el campo `id_usuario` en ASESOR sigue pendiente. Hay dos
   opciones anotadas: campo en ASESOR (requiere migración de Mateo) o campos
   extra en el usuario de BetterAuth (`additionalFields`). Definir en la HU-03.
4. **Falta hacer push** de ambas ramas y crear los PR hacia `develop`.

---

## Usuario de prueba

- **Correo:** `kevin@comercial360.com`
- **Contraseña:** `Secreta123!`
- **Nombre:** Kevin Prueba
