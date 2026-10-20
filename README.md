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
npm run start:dev

# 3. Frontend (http://localhost:5173), en otra terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

Para comprobar que todo funciona: abre http://localhost:3000/api/health y luego, en el frontend, **Configuración → Ver ejemplo: catálogo de zonas**. Si puedes agregar una zona, la cadena frontend → backend → PostgreSQL está bien.

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
| Mateo | `asesores` (agenda) + EC2 | HU-11, HU-12, HU-INF-03 |
| Andres | `rutas`, `asesores` | HU-10, HU-14 a HU-17 |
| Santiago | `visitas` | HU-18 a HU-22 |
| Kevin B | `seguimiento` | HU-13, HU-23 a HU-26 |
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
