# Daniel · Cotizaciones y pedidos

Módulo backend: `backend/src/modules/ventas/`. Pantallas: `/cotizaciones` y `/pedidos`.
Rol en el equipo: responsable de integraciones externas (S3 con puerto y adaptador).

## Prioridad para la demo del MVP
No estás en el recorrido principal. Si llegas, HU-27 (crear cotización en borrador) se muestra como extra. S3 queda para después.

## Historias
- **HU-27 · Crear cotización (Must).** Número automático y único. Detalle con producto, cantidad, precio y subtotal calculado. Total calculado. Estado inicial `borrador`.
- **HU-28 · Estados (Must).** `borrador → enviada → aprobada | rechazada`. Solo se edita en borrador. Cada cambio queda en la bitácora.
- **HU-29 · Documento en S3 (Must, después del MVP).** El archivo va a S3; la BD guarda solo `documento_key`. Ver y descargar según el rol.
- **HU-30 · Convertir en pedido (Must).** Solo cotizaciones aprobadas. El pedido hereda cliente, valor y referencia a la cotización. Número automático y único.
- **HU-31 · Consultar pedidos (Should).** Filtros por cliente, asesor, estado y fechas; detalle con su cotización de origen.
- **HU-INF-04 · S3 (después del MVP).** Bucket con permisos mínimos; puerto `StoragePort` en dominio y adaptador S3 en infraestructura.

## Tablas que son tuyas
COTIZACION (+ `documento_key`), COTIZACION_DETALLE, PEDIDO.

## Dependencias
- Usas CLIENTE (Francisco) y ASESOR (Mateo) mediante casos de uso que ellos exporten.
- Usa el decorador de bitácora de Kevin B para los cambios de estado.

## Librerías permitidas para ti
Después del MVP, `@aws-sdk/client-s3` (y `@aws-sdk/s3-request-presigner` si haces descargas firmadas). Nada más.

## Notas para el agente
- La entidad de dominio `Cotizacion` tiene los métodos `agregarProducto()`, `enviar()`, `aprobar()`, `rechazar()` y el `total` calculado. Ahí viven todas las reglas de estado.
- Mientras no haya S3, el caso de uso puede recibir el `StoragePort` con un adaptador en memoria; no guardes archivos en disco ni en el repo.
