import type { Cliente } from './cliente.js';

export type OpcionCliente = { id: number; nombre: string };

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');

export interface ClienteRepository {
  listarTipos(): Promise<OpcionCliente[]>;
  listarPotenciales(): Promise<(OpcionCliente & { orden: number })[]>;
  listarEstados(): Promise<OpcionCliente[]>;
  guardar(cliente: Cliente): Promise<Cliente>;
  buscarPorId(id: number): Promise<Cliente | null>;
  buscarPorNit(nit: string): Promise<Cliente | null>;
  buscarPorEmail(email: string): Promise<Cliente | null>;
  existeTipoCliente(id: number): Promise<boolean>;
  existePotencial(id: number): Promise<boolean>;
  existeEstadoCliente(id: number): Promise<boolean>;
}
