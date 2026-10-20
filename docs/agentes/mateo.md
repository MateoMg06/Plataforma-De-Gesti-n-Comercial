# Mateo · Asesores y agenda + líder del equipo

Módulo backend: `backend/src/modules/asesores/`. Pantallas: `/agenda` y asesores en Configuración.
Rol en el equipo: líder e integrador. Antes de cada demo bajas `develop`, lo levantas en el computador de la demo y avisas si algo falla.

## Prioridad para la demo del MVP
1. Entidad ASESOR publicada **hoy, lo antes posible** (Santiago depende de ella para programar visitas).
2. HU-10: CRUD básico de asesores.
3. Desde las 4 pm, integrar el trabajo de todos en el computador de la demo.
4. Si sobra tiempo, HU-12 como una lista simple de visitas del asesor.

## Historias
- **HU-10 · Gestionar asesores (Must).** CRUD con nombre, correo (único), teléfono y estado (`activo`/`inactivo`). Los inactivos no reciben rutas nuevas.
- **HU-11 · Agenda comercial global (Must).** Calendario semanal y mensual con las visitas de todos los asesores. Cada evento muestra cliente, asesor, hora y estado. Navegación por semana y por mes.
- **HU-12 · Mi agenda (Must).** El asesor ve solo sus visitas: lista del día y calendario semanal.
- **HU-13 · Reprogramar visita (Should).** Cambiar `fecha_programada` indicando el motivo. La reprogramación queda en la bitácora.
- **HU-INF-03 · Despliegue en EC2 (después del MVP).** Backend y frontend accesibles desde Internet, variables de entorno seguras, la app sobrevive reinicios (pm2 o systemd).

## Tablas que son tuyas
ASESOR (+ `id_usuario`, coordinado con Kevin V). La agenda **solo lee** VISITA (de Santiago).

## Dependencias
- Andres (rutas), Santiago (visitas) y Daniel (ventas) usan ASESOR. Exporta un caso de uso (por ejemplo `ObtenerAsesorUseCase`), no tu repositorio.
- Para la agenda necesitas un caso de uso de lectura de visitas que exporte Santiago. Mientras no exista, trabaja la pantalla con datos falsos.
- HU-13 cambia la fecha de una VISITA, que es de Santiago: pídele que exporte un caso de uso de reprogramar (y el campo `motivo_reprogramacion`) y llámalo desde tu módulo. Usa el decorador de bitácora de Kevin B.

## Librerías permitidas para ti
Para el calendario, pregunta primero; una tabla o lista por días hecha a mano es suficiente para empezar.

## Notas para el agente
- La regla "un asesor inactivo no recibe rutas" es un método de la entidad de dominio `Asesor` (por ejemplo `puedeRecibirRutas()`).
- Mateo también lidera: si te pide ayuda para organizar al equipo, revisar PRs o entender el código de otros, ayúdalo explicando en lenguaje simple.
