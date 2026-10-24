import type { Cliente } from './cliente.js';

export type OpcionCliente = { id: number; nombre: string };

export type ConsultaClientes = {
  page: number;
  limit: number;
  busqueda?: string;
  idZona?: number;
  idTipoCliente?: number;
  idPotencial?: number;
  idEstadoCliente?: number;
  // HU-03: si viene, solo se listan estos clientes (los del asesor).
  ids?: number[];
};

export type PaginaClientes = {
  datos: Cliente[];
  total: number;
  page: number;
  limit: number;
};

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');

export interface ClienteRepository {
  listar(consulta: ConsultaClientes): Promise<PaginaClientes>;
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
