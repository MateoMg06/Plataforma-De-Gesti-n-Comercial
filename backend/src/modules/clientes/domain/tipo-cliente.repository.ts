import type { TipoCliente } from './tipo-cliente.js';

export const TIPO_CLIENTE_REPOSITORY = Symbol('TIPO_CLIENTE_REPOSITORY');

export interface TipoClienteRepository {
  guardar(opcion: TipoCliente): Promise<TipoCliente>;
  listar(): Promise<TipoCliente[]>;
  buscarPorId(id: number): Promise<TipoCliente | null>;
  buscarPorNombre(nombre: string): Promise<TipoCliente | null>;
  // False indica que una llave foránea impide eliminar la opción.
  eliminar(id: number): Promise<boolean>;
}
