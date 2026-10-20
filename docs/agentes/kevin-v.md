# Kevin V · Autenticación y usuarios + repositorio

Módulo backend: `backend/src/modules/auth/`. Pantallas: `LoginPage.tsx`, gestión de usuarios dentro de Configuración.
Rol en el equipo: guardián del repositorio (revisa y aprueba PRs a `develop`).

## Prioridad para la demo del MVP
HU-01 y HU-02: iniciar y cerrar sesión con email y contraseña. Los roles (HU-03) pueden esperar a después del MVP.

## Historias
- **HU-01 · Inicio de sesión (Must).** Login con correo y contraseña mediante BetterAuth. Credenciales válidas crean sesión y llevan al dashboard. Inválidas muestran un error claro sin revelar datos. La contraseña nunca aparece en respuestas ni logs.
- **HU-02 · Cierre de sesión y rutas protegidas (Must).** El logout invalida la sesión en el servidor. Endpoints privados responden 401 sin sesión (guard de NestJS). El frontend redirige a `/login` al perder la sesión (ya lo hace `api/client.ts` con el 401).
- **HU-03 · Roles y permisos (Must).** Roles `administrador`, `lider`, `asesor`. Decorador `@Roles()` + guard. El asesor solo ve sus rutas, visitas y clientes. El menú se filtra por rol (`frontend/src/layout/menu.ts` ya tiene el campo `roles`; falta leer el rol real de la sesión en `AppLayout.tsx`).
- **HU-04 · Administración de usuarios (Should).** CRUD con correo único; un usuario desactivado no puede entrar; no se eliminan usuarios con actividad, solo se desactivan.
- **HU-INF-01 · Repositorio GitHub.** Ramas `main`/`develop`/`feature`, `main` protegida, sin secretos ni multimedia, README con instrucciones.

## Tablas
Usuarios y sesiones: las genera BetterAuth. Coordina con Mateo el campo `id_usuario` en ASESOR para unir el login con el asesor.

## Dependencias
- Todos esperan tu guard y tu decorador de roles para proteger sus endpoints. Publícalos apenas funcionen, aunque sea simple.
- Deja el guard en un lugar que todos puedan importar y avisa por el grupo cómo usarlo (un ejemplo de 3 líneas).

## Librerías permitidas para ti
`better-auth` y lo que su documentación oficial indique para NestJS. Nada más.

## Notas para el agente
- Usa la integración que recomiende la documentación oficial de BetterAuth; no implementes JWT, hashing ni sesiones a mano.
- Las credenciales de BetterAuth van en `.env` (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`), ya listadas en `.env.example`.
- El login con Microsoft que aparece en el diseño es opcional y va al final, si sobra tiempo.
