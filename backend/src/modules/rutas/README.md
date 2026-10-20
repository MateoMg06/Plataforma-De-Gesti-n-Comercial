# Módulo `rutas`

La documentación interactiva de la API está disponible en `http://localhost:3000/api/docs` cuando el backend está iniciado.

**Responsable:** Andres

**Historias:** HU-14 a HU-17

**Tablas del modelo:** RUTA, RUTA_CLIENTE

Copia la estructura de `../zonas`: entidad y puerto en `domain/`, casos de uso en `application/`, entidades TypeORM (`*.orm-entity.ts`) y adaptadores en `infrastructure/`, controladores y DTOs en `presentation/`.

## HU-14

`POST /api/rutas` recibe `nombre`, `id_asesor`, `fecha_inicio` y `fecha_fin`. La ruta se crea con estado `planeada`. El dominio valida el nombre, el identificador positivo del asesor y que el rango de fechas sea válido.

El catálogo y la validación de existencia del asesor se integrarán cuando el módulo de asesores exporte su caso de uso. Hasta entonces el formulario solicita el ID del asesor.

## HU-15

- `GET /api/rutas` lista rutas con sus clientes y orden.
- `POST /api/rutas/:id/clientes` agrega un cliente al final de la secuencia.
- `PATCH /api/rutas/:id/clientes/:idCliente/orden` cambia su posición y renumera la secuencia desde 1.

El dominio evita repetir el mismo cliente en una ruta. La existencia del cliente se validará cuando esté disponible el caso de uso del módulo de clientes; por ahora se recibe su ID.
