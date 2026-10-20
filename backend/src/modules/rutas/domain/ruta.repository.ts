import type { Ruta } from './ruta.js';

// Puerto: define lo que necesita el caso de uso para guardar una ruta.
export interface RutaRepository {
  guardar(ruta: Ruta): Promise<Ruta>;
  buscarPorId(id: number): Promise<Ruta | null>;
  listar(): Promise<Ruta[]>;
}

export const RUTA_REPOSITORY = Symbol('RUTA_REPOSITORY');
