# Módulo `rutas`

**Responsable:** Andres

**Historias:** HU-14 a HU-17

**Tablas del modelo:** RUTA, RUTA_CLIENTE

Copia la estructura de `../zonas`: entidad y puerto en `domain/`, casos de uso en `application/`, entidades TypeORM (`*.orm-entity.ts`) y adaptadores en `infrastructure/`, controladores y DTOs en `presentation/`.

## HU-14

`POST /api/rutas` recibe `nombre`, `id_asesor`, `fecha_inicio` y `fecha_fin`. La ruta se crea con estado `planeada`. El dominio valida el nombre, el identificador positivo del asesor y que el rango de fechas sea válido.

El catálogo y la validación de existencia del asesor se integrarán cuando el módulo de asesores exporte su caso de uso. Hasta entonces el formulario solicita el ID del asesor.
