import type { ResultadoRegistrado, ResultadoVisita } from './resultado-visita.js';
import type { Visita } from './visita.js';

// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
export interface VisitaRepository {
  guardar(visita: Visita): Promise<Visita>;
  listar(): Promise<Visita[]>;
  buscarPorId(id: number): Promise<Visita | null>;
  listarResultadosCatalogo(): Promise<ResultadoVisita[]>;
  guardarResultadosVisita(idVisita: number, resultados: ResultadoRegistrado[]): Promise<void>;
}

// Token para inyectar la interfaz (las interfaces no existen en tiempo de ejecución).
export const VISITA_REPOSITORY = Symbol('VISITA_REPOSITORY');
