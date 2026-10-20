# Cómo trabajamos

## Ramas

- `main`: lo que está desplegado. Protegida, solo entra desde `develop` por PR.
- `develop`: integración. Todo PR va aquí.
- `feature/HU-XX-descripcion-corta`: una rama por historia. Ejemplo: `feature/HU-05-registrar-cliente`.

Actualiza tu rama con `develop` al menos una vez al día (`git pull origin develop`) para evitar conflictos grandes.

## Commits

Mensajes cortos en español, empezando por la historia:

```
HU-05: agrega validación de NIT único
```

Husky revisa esto solo (`npm install` en la raíz para activarlo):

- `.husky/pre-commit`: no deja hacer commit en `main` ni `develop`, ni en ramas que no sigan `feature/HU-XX-descripcion-corta` (también `feature/HU-INF-XX-...`).
- `.husky/commit-msg`: el mensaje debe empezar por `HU-XX: ` (o `HU-INF-XX: `). Los mensajes de merge y revert que genera git pasan.

## Pull requests

- PRs pequeños: idealmente una historia o una parte de ella. Mejor 3 PRs de un día que 1 de tres días.
- Llena la plantilla. Kevin V (guardián del repo) o quien él asigne revisa y aprueba.
- Nadie aprueba su propio PR.

## Migraciones (base de datos)

El esquema solo cambia con migraciones, nunca con `synchronize: true`.

1. Crea o cambia tu `*.orm-entity.ts`.
2. `npm run migration:generate -- src/database/migrations/NombreDescriptivo`
3. Revisa el SQL generado y súbelo en tu PR.
4. **Avisa a Francisco** antes de mergear: si dos migraciones tocan la misma tabla, chocan.

## Estructura de un módulo (Clean Architecture)

Copia `backend/src/modules/zonas`. Las dependencias van siempre hacia adentro:

```
presentation  →  application  →  domain  ←  infrastructure
(controller,     (casos de uso)  (entidad,    (TypeORM, S3,
 DTO)                             puerto)      BetterAuth)
```

- `domain/` no importa nada de NestJS, TypeORM ni AWS.
- Los casos de uso reciben el repositorio por su interfaz (token `XXX_REPOSITORY`).
- Lo externo (S3, BetterAuth, CSV, OpenStreetMap) es un adaptador en `infrastructure/`.

## Frontend

- Colores en `frontend/src/styles/theme.css`, siempre con `var(--...)`. Están sacados de los diseños de Comercial 360.
- Todas las llamadas al backend pasan por `frontend/src/api/client.ts`.
- Tu pantalla reemplaza el `PlaceholderPage` de tu ruta en `frontend/src/App.tsx`. El menú está en `frontend/src/layout/menu.ts`.
- Ejemplo de pantalla conectada a la API: `frontend/src/pages/ZonasPage.tsx`.

## Secretos y archivos

- Nunca subas `.env`, contraseñas, llaves de AWS ni archivos `.pem`.
- Nunca subas imágenes, PDFs ni documentos: van a S3 (requisito de la sustentación). Los diseños de referencia se comparten fuera del repo.
