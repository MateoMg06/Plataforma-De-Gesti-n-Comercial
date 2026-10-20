# Módulo `clientes`

**Responsable:** Francisco

**Historias:** HU-05 a HU-09

**Tablas del modelo:** CLIENTE, CONTACTO_CLIENTE, TIPO_CLIENTE, POTENCIAL, ESTADO_CLIENTE, PORTAFOLIO, CLIENTE_PORTAFOLIO (ZONA ya está en `zonas`)

Copia la estructura de `../zonas`: entidad y puerto en `domain/`, casos de uso en `application/`, entidades TypeORM (`*.orm-entity.ts`) y adaptadores en `infrastructure/`, controladores y DTOs en `presentation/`.

## HU-05: primer paso implementado (backend)

- `POST /api/clientes`: registra los datos del cliente; NIT y email únicos.
- `GET /api/clientes/:id`: consulta un cliente; devuelve 404 si no existe.
- `ClientesModule` exporta `ObtenerClienteUseCase` para que los demás módulos
  consulten clientes sin acceder a su repositorio.
- El email se guarda en minúsculas. El cliente nace activo y con fecha automática.
- Las coordenadas son obligatorias: latitud entre -90 y 90 y longitud entre -180 y 180.
- Los IDs de zona, tipo, potencial y estado deben existir antes de registrar.

Archivos principales:

- `domain/cliente.ts`: datos y reglas del cliente, sin NestJS ni TypeORM.
- `domain/cliente.repository.ts`: operaciones que necesita el módulo de la base de datos.
- `application/registrar-cliente.use-case.ts`: valida duplicados y referencias antes de guardar.
- `application/obtener-cliente.use-case.ts`: consulta disponible para otros módulos.
- `infrastructure/*.orm-entity.ts`: tablas de cliente y sus tres catálogos.
- `infrastructure/typeorm-cliente.repository.ts`: guarda y recupera clientes con TypeORM.
- `presentation/clientes.controller.ts` y `presentation/dto/registrar-cliente.dto.ts`:
  reciben las peticiones HTTP y validan el formato.
- `clientes.module.ts`: conecta las cuatro capas y exporta la consulta.
- Los archivos `*.spec.ts` prueban el dominio y los casos de uso sin base de datos.

La migración `CrearClientesYCatalogos` crea las cuatro tablas y sus llaves foráneas.
No modifica la tabla zona. Impide borrar catálogos usados por clientes.
Para aplicarla en desarrollo, con PostgreSQL activo y las variables de `backend/.env`
configuradas, ejecutar desde `backend/` (Node 24 o superior):

```sh
npm run migration:run
npm run build
npm test
```

Ejemplo de cuerpo para registrar (los IDs son ilustrativos; deben existir):

```json
{
  "nit": "900123456-7",
  "razonSocial": "Comercial Ejemplo SAS",
  "nombreComercial": "Ejemplo",
  "direccion": "Calle 10 # 20-30",
  "departamento": "Antioquia",
  "municipio": "Medellín",
  "barrio": "Centro",
  "telefono": "6041234567",
  "email": "ventas@example.com",
  "idZona": 1,
  "idTipoCliente": 1,
  "idPotencial": 1,
  "idEstadoCliente": 1,
  "frecuenciaVisitaDias": 15,
  "latitud": 6.2442,
  "longitud": -75.5812
}
```

## Formulario y catálogos iniciales

La pantalla `/clientes` permite registrar clientes y muestra errores o confirmación.
`frontend/src/pages/ClientesPage.tsx` carga las opciones con `api()` y envía el registro;
`ClientesPage.css` organiza el formulario y lo adapta a pantallas pequeñas.
La ruta se conecta en `frontend/src/App.tsx`.

`GET /api/clientes/opciones` devuelve tipos, potenciales (por orden) y estados.
`application/listar-opciones-cliente.use-case.ts` consulta esas opciones a través
del puerto; las zonas se cargan con el endpoint existente `/api/zonas`.

Para cargar opciones iniciales después de ejecutar las migraciones:

```sh
node dist/modules/clientes/infrastructure/sembrar-catalogos.js
```

El script `infrastructure/sembrar-catalogos.ts` agrega Centro y Norte, Minorista y
Mayorista, potenciales Alto/Medio/Bajo, y estados Prospecto/Cliente. Puede repetirse:
no duplica nombres ni cambia opciones existentes. No crea clientes de ejemplo.

Si el puerto 5432 está ocupado, se puede iniciar la base del proyecto en 5433 sin
cambiar el archivo compose compartido. Desde la raíz (Docker Compose actualizado):

```sh
docker compose -f docker-compose.yml -f - up -d <<'YAML'
services:
  postgres:
    ports: !override
      - '127.0.0.1:5433:5432'
YAML
```

En ese caso usar `DB_PORT=5433` en `backend/.env`. Para volver a iniciar el contenedor
ya creado sin cambiar su puerto: `docker compose start postgres`.

Pendiente para siguientes pasos: cinco clientes de ejemplo y listado/edición (HU-06).

## HU-08: administración de catálogos

En `/configuracion` están los enlaces a Zonas, Tipos de cliente, Potenciales y
Estados de cliente. Cada pantalla permite crear, listar, editar y eliminar.
Potencial incluye `orden`: entero entre 0 y 2147483647; se lista por orden y nombre.
No se exige un orden único, por lo que dos potenciales pueden compartirlo.

Endpoints de cada catálogo:

| Catálogo | Ruta |
| --- | --- |
| Zona | `/api/zonas` |
| Tipo de cliente | `/api/tipos-cliente` |
| Potencial | `/api/potenciales` |
| Estado de cliente | `/api/estados-cliente` |

En cada ruta se usa `GET` para listar y `POST` para crear. `PATCH /:id` edita y
`DELETE /:id` elimina, devolviendo una confirmación JSON. Nombre duplicado o
catálogo en uso responde 409; ID inexistente, 404; datos inválidos, 400.
Swagger está disponible en `/api/docs`.

Archivos de cada catálogo dentro de este módulo:

- `domain/tipo-cliente.ts`, `potencial.ts` y `estado-cliente.ts` contienen sus
  reglas; los correspondientes `*.repository.ts` definen las operaciones necesarias.
- `application/crear-*.use-case.ts`, `editar-*.use-case.ts`, `listar-*.use-case.ts`
  y `eliminar-*.use-case.ts` resuelven cada acción por separado.
- `infrastructure/typeorm-*.repository.ts` implementan esas operaciones y convierten
  filas en entidades de dominio. Si PostgreSQL impide borrar una referencia en uso,
  lo notifican al caso de uso para responder con 409.
- `presentation/*controller.ts` reciben HTTP y los DTO `guardar-*.dto.ts` validan
  nombre y, para Potencial, orden. `clientes.module.ts` registra estos componentes.
- Los `*.use-case.spec.ts` prueban el dominio y los casos de uso sin base de datos.

En zonas se agregaron `editar-zona.use-case.ts`, `eliminar-zona.use-case.ts` y sus
pruebas. Su repositorio usa la misma protección de referencias.

En frontend, `CatalogosPage.tsx` muestra los enlaces; `TiposClientePage.tsx`,
`PotencialesPage.tsx`, `EstadosClientePage.tsx` y `ZonasPage.tsx` administran cada
catálogo con `api()`. `App.tsx` conecta las rutas de Configuración.
Estas pantallas y los controladores son independientes, sin catálogo genérico.
Las tablas y llaves foráneas existentes sirven para HU-08: no requiere una migración nueva.
