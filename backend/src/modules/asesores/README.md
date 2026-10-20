# Módulo `asesores`

Este módulo lo comparten dos personas, cada una con su parte:

| Parte | Responsable | Historias |
|---|---|---|
| CRUD de asesores y **dueño de la tabla ASESOR** | Andres | HU-10 |
| Agenda (solo lee VISITA, no tiene tablas propias) | Mateo | HU-11, HU-12 |

HU-13 (reprogramar visita) **no va en este módulo**: es de Kevin B y vive en `seguimiento`.

**Tablas del modelo:** ASESOR (dueño: Andres).

Copia la estructura de `../zonas`: entidad y puerto en `domain/`, casos de uso en `application/`, entidades TypeORM (`*.orm-entity.ts`) y adaptadores en `infrastructure/`, controladores y DTOs en `presentation/`.
