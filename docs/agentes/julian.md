# Julian · Dashboard y reportes

Módulo backend: `backend/src/modules/dashboard/`. Pantallas: `/dashboard` y `/reportes`.
Rol en el equipo: responsable de infraestructura AWS y pipeline Jenkins (después del MVP).

## Prioridad para la demo del MVP
No estás en el recorrido principal. Puedes avanzar el dashboard con datos falsos; se conecta a datos reales cuando existan clientes, visitas y cotizaciones.

## Historias
- **HU-32 · Dashboard de KPIs (Must).** Visitas realizadas vs programadas, cotizaciones por estado, valor cotizado y pedidos por asesor, clientes por potencial. Datos actualizados al cargar. El asesor ve solo los suyos.
- **HU-33 (TERMINADA) · Reportes con filtros (Must).** Visitas, cotizaciones y pedidos filtrados por fechas, asesor y zona; tabla con totales.
- **HU-34 (TERMINADA) · Exportar a CSV (Must).** Clientes, visitas, cotizaciones y pedidos; respeta los filtros; UTF-8 compatible con Excel (agrega BOM al inicio).
- **HU-35 (TERMINADA) · Gráficos (Should).** Al menos 3 gráficos interactivos que se actualizan con los filtros.
- **HU-INF-05 · Jenkins (después del MVP).** Jenkins en el mismo EC2; pipeline pull → build → test → deploy; demostrar un cambio desplegado.

## Tablas
Ninguna propia. El dashboard **solo lee** de los demás módulos.

## Dependencias
- Necesitas casos de uso de lectura de clientes (Francisco), visitas (Santiago) y ventas (Daniel). Mientras no existan, trabaja con datos falsos en el frontend.

## Librerías permitidas para ti
Para gráficos, `recharts`. Para CSV, genera el texto a mano (unir columnas con comas y escapar comillas); no hace falta librería.

## Notas para el agente
- Los KPIs se calculan en casos de uso del módulo dashboard que llaman a casos de uso de otros módulos. No escribas SQL contra tablas ajenas.
- La exportación CSV es un adaptador `ExportadorCsv` en infraestructura detrás de un puerto simple.
