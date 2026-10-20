# Francisco · Gestión de clientes + base de datos

Módulos backend: `backend/src/modules/clientes/` y `backend/src/modules/zonas/` (el ejemplo ya hecho es tuyo). Pantalla: `/clientes` y catálogos en Configuración.
Rol en el equipo: dueño de la base de datos. Revisas toda migración antes de que se mergee.

## Prioridad para la demo del MVP
1. Entidad CLIENTE publicada **hoy, lo antes posible** (Santiago, Andres y Mateo dependen de ella).
2. HU-05 y HU-06: registrar y listar clientes, con `latitud` y `longitud`.
3. Datos de ejemplo: algunas zonas, tipos, potenciales y estados, y 5 clientes con coordenadas reales para que el mapa se vea lleno.

## Historias
- **HU-05 · Registrar cliente (Must).** NIT, razón social, nombre comercial, dirección, departamento, municipio, barrio, teléfono, email. NIT y email únicos (validar en el caso de uso consultando el repositorio). Se asignan zona, tipo, potencial, estado y `frecuencia_visita_dias`. Fecha de creación automática y `activo = true` por defecto.
- **HU-06 · Consultar y editar (Must).** Listado paginado simple con búsqueda por NIT, razón social o nombre comercial. Filtros por zona, tipo, potencial y estado. Editar con las mismas validaciones. Activar/desactivar.
- **HU-07 · Contactos (Must).** CRUD de contactos (nombre, cargo, teléfono, celular, email). Solo un contacto principal por cliente: es regla de dominio.
- **HU-08 · Catálogos (Must).** CRUD de ZONA (ya existe), TIPO_CLIENTE, POTENCIAL (con orden) y ESTADO_CLIENTE. No se borran catálogos en uso.
- **HU-09 · Portafolio (Should).** Relación N:M cliente-portafolio con fecha de registro; agregar y retirar.
- **HU-INF-02 · RDS (después del MVP).** Migraciones versionadas y datos semilla.

## Tablas que son tuyas
ZONA, CLIENTE (+ `latitud`, `longitud`), CONTACTO_CLIENTE, TIPO_CLIENTE, POTENCIAL, ESTADO_CLIENTE, PORTAFOLIO, CLIENTE_PORTAFOLIO.

## Dependencias
- Andres (rutas), Santiago (visitas), Daniel (ventas) y Julian (dashboard) usan CLIENTE. Para que lo consulten, exporta desde tu módulo un caso de uso (por ejemplo `ObtenerClienteUseCase`), no tu repositorio.

## Notas para el agente
- Los catálogos son CRUD sencillos: copia zonas tal cual, uno por catálogo. No hagas un "catálogo genérico".
- Los datos de ejemplo pueden ser una migración de semilla o un script simple; elige el más sencillo y explícalo.
- La paginación es `page` y `limit` por query string. No uses librerías de paginación.
