import type { Visita } from './visita.js';

// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
export interface VisitaRepository {
  guardar(visita: Visita): Promise<Visita>;
  listar(): Promise<Visita[]>;
}

// Token para inyectar la interfaz (las interfaces no existen en tiempo de ejecución).
export const VISITA_REPOSITORY = Symbol('VISITA_REPOSITORY');
