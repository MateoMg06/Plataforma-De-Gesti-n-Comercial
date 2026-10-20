# Contexto del proyecto para agentes de IA

Lee este archivo completo antes de escribir código. Después **pregunta al usuario quién es** y lee su archivo en `docs/agentes/` (por ejemplo `docs/agentes/francisco.md`). Ahí están sus historias y lo que puede tocar.

## Qué es el proyecto

**Comercial 360**: plataforma web de gestión comercial (clientes, asesores, rutas, visitas, seguimientos, cotizaciones, pedidos y dashboard). Proyecto académico de un equipo de 8 desarrolladores **de nivel junior**, con sustentación el **lunes 26 de octubre de 2026**. Líder: Mateo.

- Backend: NestJS + TypeORM + PostgreSQL. Carpeta `backend/`.
- Frontend: React + Vite + TypeScript + react-router-dom + lucide-react. Carpeta `frontend/`.
- Autenticación: BetterAuth. Mapa: OpenStreetMap (Leaflet). Exportación: CSV.
- AWS (EC2, RDS, S3, Jenkins) llega **después**. Por ahora todo corre en local con `docker compose up -d`.

Documentos de referencia en el repo: `README.md`, `CONTRIBUTING.md`, `docs/modelo-datos.md`.

## Cómo debes trabajar

El equipo está aprendiendo. Tu código debe poder entenderlo y explicarlo un junior en la sustentación.

1. **Haz lo mínimo que cumpla los criterios de aceptación de la historia.** Nada más. Si algo "sería bueno tenerlo", menciónalo pero no lo hagas.
2. **Copia el patrón del módulo `backend/src/modules/zonas`.** Es la referencia oficial. Si dudas cómo hacer algo, mira cómo lo hace zonas.
3. **Explica lo que hiciste** en lenguaje sencillo al terminar: qué archivos creaste y para qué sirve cada uno.
4. **Pregunta antes de** instalar una librería, crear o cambiar una tabla, o tocar un archivo fuera del módulo del usuario.
5. **Trabaja en pasos pequeños** que se puedan probar. Un PR por historia o parte de historia.
6. Si el usuario te pide algo que rompe estas reglas, avísale y explica por qué antes de hacerlo.

## Arquitectura (obligatoria: Clean Architecture)

Cada funcionalidad es un **módulo de NestJS** en `backend/src/modules/<modulo>/`. Dentro de cada módulo hay **4 carpetas (capas)**:

```
presentation  →  application  →  domain  ←  infrastructure
```

| Carpeta | Qué va | Ejemplo en zonas |
|---|---|---|
| `domain/` | Entidad con sus reglas de negocio + interfaz del repositorio (puerto) y su token | `zona.ts`, `zona.repository.ts` |
| `application/` | Un caso de uso por acción del usuario, con método `ejecutar()` | `crear-zona.use-case.ts` |
| `infrastructure/` | Entidad TypeORM (`*.orm-entity.ts`) y repositorio que implementa el puerto | `zona.orm-entity.ts`, `typeorm-zona.repository.ts` |
| `presentation/` | Controlador HTTP y DTOs con class-validator | `zonas.controller.ts`, `dto/crear-zona.dto.ts` |

Reglas que **nunca** se rompen:

- `domain/` es TypeScript puro: **no importa NestJS, TypeORM, AWS ni nada de `infrastructure/`**.
- Las reglas de negocio (estados, transiciones, cálculos, validaciones del negocio) van en la entidad de dominio, como métodos.
- Las reglas que necesitan consultar la base (por ejemplo "NIT único") van en el caso de uso, preguntando al repositorio.
- El controlador no tiene lógica: valida con el DTO y llama al caso de uso.
- El caso de uso recibe el repositorio por su interfaz con `@Inject(XXX_REPOSITORY)`, nunca la clase de TypeORM.
- La entidad de dominio y la entidad ORM son clases distintas. El repositorio traduce entre ellas.
- Un módulo no usa el repositorio de otro módulo. Si necesitas datos de otro módulo, ese módulo exporta un caso de uso y tú lo importas.
- Registra cada módulo nuevo en `backend/src/app.module.ts`.

## Qué NO hacer (sobreingeniería)

- No crear clases base genéricas (`BaseRepository<T>`, `BaseEntity`, `GenericCrudService`).
- No usar CQRS, eventos, colas, microservicios, mappers automáticos ni patrones que zonas no usa.
- No agregar librerías nuevas sin permiso del usuario. Ya están: class-validator, class-transformer, TypeORM, pg, @nestjs/config.
- No crear capas o carpetas extra (`utils/`, `helpers/`, `common/`, `core/`) sin necesidad real.
- No escribir interfaces para todo: solo el puerto del repositorio (y de servicios externos como S3).
- No optimizar consultas ni agregar caché, paginación avanzada o índices que la historia no pida.
- No escribir pruebas para controladores ni repositorios. Solo pruebas unitarias del dominio y los casos de uso, como `crear-zona.use-case.spec.ts`.
- No usar `synchronize: true` en TypeORM.

## Convenciones

- **Nombres en español** para el negocio: `Cliente`, `crearCliente`, `RegistrarClienteUseCase`. Archivos en kebab-case: `registrar-cliente.use-case.ts`.
- Imports del backend con extensión `.js` (el proyecto es ESM): `import { Zona } from '../domain/zona.js'`.
- Columnas de la base en snake_case, como en el modelo: `id_cliente`, `razon_social`, `fecha_creacion`.
- Rutas HTTP en plural y en español: `GET /api/clientes`, `POST /api/visitas`.
- Ramas: `feature/HU-XX-descripcion-corta`. Commits: `HU-05: agrega validación de NIT único`.
- Valores de estado y roles exactamente como en `docs/modelo-datos.md`.

## Base de datos

- Cada tabla tiene **un solo dueño** (ver `docs/modelo-datos.md`). Solo el dueño crea o cambia su entidad ORM y su migración.
- Para crear una migración: cambia el `*.orm-entity.ts`, luego `npm run migration:generate -- src/database/migrations/NombreDescriptivo`, revisa el SQL y luego `npm run migration:run`.
- Si el usuario necesita un campo en una tabla ajena, dile que se lo pida al dueño.

## Frontend

- Colores solo con las variables de `frontend/src/styles/theme.css` (azul marino y naranja de los diseños de Comercial 360).
- Toda llamada al backend pasa por `api()` de `frontend/src/api/client.ts`. No uses axios ni otro cliente.
- Cada pantalla vive en `frontend/src/pages/` y reemplaza su `PlaceholderPage` en `App.tsx`. El menú está en `frontend/src/layout/menu.ts`.
- Ejemplo de pantalla conectada: `frontend/src/pages/ZonasPage.tsx`. Estado con `useState` y `useEffect`; no agregues Redux, React Query ni librerías de formularios.
- Estilos con CSS simple (un `.css` junto a la página) y las clases comunes de `index.css` (`.card`, `.btn`, `.btn-primary`, `.input`).

## Seguridad y archivos

- Nunca escribas contraseñas, llaves ni secretos en el código. Todo va en `.env` (que no se sube) y se documenta en `.env.example`.
- Nunca agregues imágenes, PDFs ni documentos al repo. Irán a S3.

## Antes de dar algo por terminado

1. `cd backend && npm run build && npm test` pasan.
2. `cd frontend && npm run build` pasa.
3. Se cumplen los criterios de aceptación de la historia (están en el archivo del usuario en `docs/agentes/`).
4. Explicaste al usuario qué hiciste para que pueda contarlo en la sustentación.
