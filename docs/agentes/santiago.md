# Santiago · Visitas y mapa

Módulo backend: `backend/src/modules/visitas/`. Pantallas: `/visitas` y `/mapa`.
Rol en el equipo: responsable de la demo (guion y datos que se muestran).

## Prioridad para la demo del MVP
1. HU-18: programar visita.
2. HU-20: mapa con OpenStreetMap y marcadores por estado.
Mientras Francisco y Mateo publican CLIENTE y ASESOR, arma el mapa con datos falsos.

## Historias
- **HU-18 · Programar visita (Must).** Cliente, asesor, ruta (opcional) y `fecha_programada`. Estado inicial `programada`.
- **HU-19 · Resultado de la visita (Must).** Registrar `fecha_real` y `estado_visita` (`realizada`, `cancelada`, `no_atendida`). Varios resultados del catálogo RESULTADO_VISITA, cada uno con observación. Una visita realizada no se puede editar.
- **HU-20 · Mapa (Must).** OpenStreetMap, sin claves de pago. Marcadores de color según estado. Usa latitud y longitud del cliente.
- **HU-21 · Filtros del mapa (Should).** Por asesor, rango de fechas y estado, combinables; contador de visitas por estado.
- **HU-22 · Detalle desde el mapa (Could).** Popup con cliente, asesor, fecha y estado, y enlace al detalle.

## Tablas que son tuyas
VISITA (+ `motivo_reprogramacion` para HU-13 de Mateo), RESULTADO_VISITA, VISITA_RESULTADO.

## Dependencias
- Usas CLIENTE (Francisco) y ASESOR (Mateo) mediante casos de uso que ellos exporten.
- Exporta `ProgramarVisitaUseCase` para que Andres lo use al activar rutas, y un caso de uso de lectura de visitas para la agenda y la reprogramación de Mateo, y el dashboard de Julian.

## Librerías permitidas para ti
`leaflet`, `react-leaflet` y `@types/leaflet`. Nada más para el mapa.

## Notas para el agente
- Las reglas "solo se edita si no está realizada" y las transiciones de estado son métodos de la entidad de dominio `Visita`.
- Los íconos de colores del mapa pueden ser `CircleMarker` de react-leaflet con el color del estado; no hace falta subir imágenes.
