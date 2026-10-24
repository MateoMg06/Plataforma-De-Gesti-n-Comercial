# Modelo de datos: quién crea cada tabla

Basado en el modelo entidad-relación del enunciado. **Cada tabla tiene un solo dueño**: solo esa persona crea y cambia su `*.orm-entity.ts` y su migración. Si necesitas un campo en una tabla ajena, pídeselo al dueño.

| Tabla | Módulo | Dueño |
|---|---|---|
| ZONA | `zonas` (ejemplo ya hecho) | Francisco |
| CLIENTE, CONTACTO_CLIENTE, TIPO_CLIENTE, POTENCIAL, ESTADO_CLIENTE, PORTAFOLIO, CLIENTE_PORTAFOLIO | `clientes` | Francisco |
| ASESOR | `asesores` | Mateo |
| RUTA, RUTA_CLIENTE | `rutas` | Andres |
| VISITA, RESULTADO_VISITA, VISITA_RESULTADO | `visitas` | Santiago |
| SEGUIMIENTO, HISTORIAL_CLIENTE, bitácora | `seguimiento` | Kevin B |
| COTIZACION, COTIZACION_DETALLE, PEDIDO | `ventas` | Daniel |
| Usuarios y sesiones | `auth` (las genera BetterAuth) | Kevin V |

## Orden en que deben existir

1. **Día 1-2:** ZONA y catálogos, CLIENTE (Francisco), ASESOR (Mateo), usuarios (Kevin V). Casi todo depende de estas.
2. **Día 2-3:** RUTA, VISITA. Andres y Santiago acuerdan VISITA juntos (HU-16 crea visitas al activar una ruta).
3. **Día 3:** SEGUIMIENTO, COTIZACION, PEDIDO.

## Campos que faltan en el modelo del enunciado

Las historias de usuario piden cosas que el modelo entidad-relación no trae. Propuesta para confirmar en la primera reunión:

| Tabla | Campo a agregar | Lo pide | Dueño |
|---|---|---|---|
| CLIENTE | `latitud`, `longitud` | HU-20: el mapa usa coordenadas del cliente | Francisco |
| ASESOR | `id_usuario` | HU-03: el asesor solo ve lo suyo, hay que unir su login con su registro de asesor | Mateo + Kevin V |
| VISITA | `motivo_reprogramacion` | HU-13: reprogramar con motivo (lo usa Mateo) | Santiago |
| COTIZACION | `documento_key` | HU-29: la BD guarda la referencia del archivo en S3 | Daniel |
| SEGUIMIENTO | `fecha_completado`, `completado_por` | HU-24: marcar completado registra fecha y usuario | Kevin B |

## Valores de estado acordados

Para que backend y frontend usen las mismas palabras:

- **RUTA.estado:** `planeada`, `activa`, `finalizada`
- **VISITA.estado_visita:** `programada`, `realizada`, `cancelada`, `no_atendida`, `reprogramada`
- **COTIZACION.estado:** `borrador`, `enviada`, `aprobada`, `rechazada`
- **ASESOR.estado:** `activo`, `inactivo`
- **Roles:** `administrador`, `lider`, `asesor`
