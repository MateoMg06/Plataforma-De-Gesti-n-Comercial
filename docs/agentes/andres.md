# Andres · Planeación de rutas

Módulo backend: `backend/src/modules/rutas/`. Pantalla: `/rutas`.
Rol en el equipo: responsable del frontend común (layout, menú, navegación).

## Prioridad para la demo del MVP
No estás en el recorrido principal. Avanza HU-14 (crear ruta) y, si llegas, se muestra como extra.

## Historias
- **HU-14 · Crear ruta (Must).** Nombre, asesor, `fecha_inicio`, `fecha_fin`. Estado inicial `planeada`.
- **HU-15 · Clientes y orden de visita (Must).** Agregar clientes con `orden_visita` secuencial; no duplicar un cliente en la misma ruta; poder reordenar.
- **HU-16 · Ciclo de vida (Must).** `planeada → activa → finalizada`. Una ruta finalizada no admite cambios. Al activarla se generan sus visitas.
- **HU-17 · Sugerencia por frecuencia (Could).** Clientes cuya última visita supera su `frecuencia_visita_dias`, ordenados por días de atraso.

## Tablas que son tuyas
RUTA, RUTA_CLIENTE.

## Dependencias
- Usas CLIENTE de Francisco y ASESOR de Mateo, a través de casos de uso que ellos exporten.
- HU-16 crea visitas: acuerda con Santiago que su módulo exporte un caso de uso `ProgramarVisitaUseCase` y llámalo desde tu caso de uso de activar ruta. No insertes en VISITA directamente.

## Notas para el agente
- Las transiciones de estado de la ruta (`activar()`, `finalizar()`) y "no duplicar cliente" son métodos de la entidad de dominio `Ruta`.
- Reordenar clientes puede ser con botones subir/bajar; no agregues librerías de drag and drop.
