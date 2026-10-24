import type { EstadoCliente } from './estado-cliente.js';

export const ESTADO_CLIENTE_REPOSITORY = Symbol('ESTADO_CLIENTE_REPOSITORY');

export interface EstadoClienteRepository {
  guardar(opcion: EstadoCliente): Promise<EstadoCliente>;
  listar(): Promise<EstadoCliente[]>;
  buscarPorId(id: number): Promise<EstadoCliente | null>;
  buscarPorNombre(nombre: string): Promise<EstadoCliente | null>;
  // False indica que una llave foránea impide eliminar la opción.
  eliminar(id: number): Promise<boolean>;
}
