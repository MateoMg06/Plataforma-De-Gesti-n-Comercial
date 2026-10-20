import type { Zona } from './zona.js';

// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
export interface ZonaRepository {
  guardar(zona: Zona): Promise<Zona>;
  listar(): Promise<Zona[]>;
  buscarPorNombre(nombre: string): Promise<Zona | null>;
}

// Token para inyectar la interfaz (las interfaces no existen en tiempo de ejecución).
export const ZONA_REPOSITORY = Symbol('ZONA_REPOSITORY');
