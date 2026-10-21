import type { Zona } from './zona.js';

// Puerto: el dominio define QUÉ necesita; la infraestructura decide CÓMO.
export interface ZonaRepository {
  // Devuelve false si una llave foránea impide borrar una zona en uso.
  eliminar(id: number): Promise<boolean>;
  guardar(zona: Zona): Promise<Zona>;
  buscarPorId(id: number): Promise<Zona | null>;
  listar(): Promise<Zona[]>;
  buscarPorNombre(nombre: string): Promise<Zona | null>;
}

// Token para inyectar la interfaz (las interfaces no existen en tiempo de ejecución).
export const ZONA_REPOSITORY = Symbol('ZONA_REPOSITORY');
