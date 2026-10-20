import type { Potencial } from './potencial.js';

export const POTENCIAL_REPOSITORY = Symbol('POTENCIAL_REPOSITORY');

export interface PotencialRepository {
  guardar(opcion: Potencial): Promise<Potencial>;
  listar(): Promise<Potencial[]>;
  buscarPorId(id: number): Promise<Potencial | null>;
  buscarPorNombre(nombre: string): Promise<Potencial | null>;
  // False indica que una llave foránea impide eliminar la opción.
  eliminar(id: number): Promise<boolean>;
}
