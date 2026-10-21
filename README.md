# Comercial 360 · Plataforma de Gestión Comercial

Backend en NestJS + frontend en React, con Clean Architecture, PostgreSQL (RDS), S3, EC2 y Jenkins.

## Requisitos

- Node.js 24 LTS
- Docker (solo para la base de datos local)

## Correr el proyecto en tu máquina

```bash
# 1. Base de datos local
docker compose up -d

# 2. Backend (http://localhost:3000/api)
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run seed          # datos de prueba (ver abajo)
npm run start:dev

# 3. Frontend (http://localhost:5173), en otra terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

Para comprobar que todo funciona: abre http://localhost:3000/api/health y luego, en el frontend, **Configuración → Ver ejemplo: catálogo de zonas**. Si puedes agregar una zona, la cadena frontend → backend → PostgreSQL está bien.

## Datos de prueba (seed)

`npm run seed` (en `backend/`) carga datos para la demo:

- 6 usuarios con rol.
- Catálogos: zonas, tipos, potenciales y estados.
- 4 asesores, uno de ellos inactivo.
- 10 clientes con coordenadas reales y su contacto principal.
- 2 rutas.
- 10 visitas con fechas **relativas a hoy**, para que la agenda siempre tenga visitas.
- Seguimientos, 3 cotizaciones y un pedido.

Se puede correr varias veces: lo que ya existe no se vuelve a crear.

Todos los usuarios tienen la contraseña de prueba **`Demo2026!`**. Es solo para desarrollo y demo; nunca la uses en producción.

| Usuario | Rol | Qué ve |
|---|---|---|
| `admin@comercial360.co` | administrador | Todo, incluida Configuración |
| `lider@comercial360.co` | lider | Todo menos Configuración |
| `laura@comercial360.co` | asesor | Solo sus 4 visitas, sus clientes y su ruta activa |
| `carlos@comercial360.co` | asesor | Solo sus visitas y clientes |
| `sofia@comercial360.co` | asesor | Nada: es un asesor sin visitas |
| `juan@comercial360.co` | asesor | "Mi agenda" le avisa que no tiene asesor vinculado |

Si el usuario ya existía en tu base, el seed solo le asigna el rol y conserva su contraseña.

**Empezar de cero** (borra todos los datos locales):

```bash
docker compose down -v
docker compose up -d
cd backend && npm run migration:run && npm run seed
```

## Estructura

```
backend/src/
  config/              configuración de la base de datos (lee .env)
  database/migrations/ migraciones TypeORM versionadas
  shared/              piezas comunes (health check)
  modules/
    zonas/             ← EJEMPLO COMPLETO: cópialo para tu módulo
    auth/ clientes/ asesores/ rutas/ visitas/ seguimiento/ ventas/ dashboard/
                       cada uno con domain / application / infrastructure / presentation
frontend/src/
  api/client.ts        única forma de llamar al backend
  layout/              barra lateral, menú por rol
  pages/               pantallas (ZonasPage es el ejemplo)
  styles/theme.css     colores de los diseños
docs/modelo-datos.md   quién es dueño de cada tabla y campos que faltan
```

## Quién hace qué

| Persona | Módulo | Historias |
|---|---|---|
| Kevin V | `auth` + repositorio | HU-01 a HU-04, HU-INF-01 |
| Francisco | `clientes`, `zonas` + RDS | HU-05 a HU-09, HU-INF-02 |
| Mateo | `asesores` (asesores y agenda) + EC2 | HU-10 a HU-13, HU-INF-03 |
| Andres | `rutas` | HU-14 a HU-17 |
| Santiago | `visitas` | HU-18 a HU-22 |
| Kevin B | `seguimiento` | HU-23 a HU-26 |
| Daniel | `ventas` + S3 | HU-27 a HU-31, HU-INF-04 |
| Julian | `dashboard` + Jenkins | HU-32 a HU-35, HU-INF-05 |

Antes de tu primer PR lee [CONTRIBUTING.md](CONTRIBUTING.md).

## Si usas Claude Code u otro agente de IA

Abre el agente en la raíz del repo. Leerá `CLAUDE.md` / `AGENTS.md` (reglas del proyecto) y te preguntará quién eres para leer tu archivo en `docs/agentes/`. Puedes decírselo de una vez: *"Soy Francisco, voy a trabajar la HU-05"*.



## Comandos útiles (backend)

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | Levanta la API con recarga automática |
| `npm test` | Pruebas unitarias |
| `npm run migration:generate -- src/database/migrations/Nombre` | Crea una migración a partir de tus entidades |
| `npm run migration:run` | Aplica las migraciones pendientes |
| `npm run seed` | Carga los datos de prueba (se puede correr varias veces) |
