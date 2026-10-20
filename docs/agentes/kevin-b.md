# Kevin B · Seguimientos y bitácora

Módulo backend: `backend/src/modules/seguimiento/`. Pantalla: `/seguimientos` e historial en la ficha del cliente.
Rol en el equipo: responsable de calidad (pruebas de extremo a extremo antes de cada demo).

## Prioridad para la demo del MVP
No estás en el recorrido principal. Avanza HU-23 y HU-24, y antes del corte de las 6 pm prueba el recorrido completo (login, cliente, visita, mapa) y reporta errores por el grupo.

## Historias
- **HU-23 · Crear seguimiento (Must).** Desde una visita: `id_visita`, `fecha_proxima`, actividad y observación. Estado inicial `completado = false`.
- **HU-24 · Seguimientos pendientes (Must).** Lista ordenada por `fecha_proxima`, resaltando los vencidos. Marcar completado registra fecha y usuario.
- **HU-25 · Bitácora (Must).** Registro automático de quién, cuándo y qué en acciones clave (crear o editar cliente, visitas, cotizaciones, pedidos, reprogramaciones). Transversal con un interceptor o decorador, sin repetir código. Consulta con filtros por usuario, fecha y tipo.
- **HU-26 · Historial del cliente (Should).** Línea de tiempo con visitas, seguimientos, cotizaciones y pedidos del cliente.

## Tablas que son tuyas
SEGUIMIENTO (+ `fecha_completado`, `completado_por`), HISTORIAL_CLIENTE y la tabla de bitácora.

## Dependencias
- Todos los módulos usarán tu bitácora. Publica pronto un decorador simple, por ejemplo `@RegistrarEnBitacora('crear_cliente')`, con un ejemplo de uso en el grupo.

## Notas para el agente
- La bitácora es un interceptor de NestJS que lee el decorador y guarda un registro. Es el único lugar del proyecto donde se justifica algo transversal; mantenlo en un solo archivo de interceptor y uno de decorador.
- No uses librerías de auditoría ni suscriptores de TypeORM.
