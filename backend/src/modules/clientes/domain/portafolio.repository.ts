import type { Portafolio, PortafolioDeCliente } from './portafolio.js';

export const PORTAFOLIO_REPOSITORY = Symbol('PORTAFOLIO_REPOSITORY');

// HU-09: catálogo PORTAFOLIO y su relación N:M con CLIENTE (CLIENTE_PORTAFOLIO).
export interface PortafolioRepository {
  guardar(portafolio: Portafolio): Promise<Portafolio>;
  listar(): Promise<Portafolio[]>;
  buscarPorId(id: number): Promise<Portafolio | null>;
  buscarPorNombre(nombre: string): Promise<Portafolio | null>;
  // False indica que una llave foránea impide eliminarlo (algún cliente lo tiene).
  eliminar(id: number): Promise<boolean>;

  listarDeCliente(idCliente: number): Promise<PortafolioDeCliente[]>;
  estaAsignado(idCliente: number, idPortafolio: number): Promise<boolean>;
  asignar(idCliente: number, idPortafolio: number): Promise<void>;
  retirar(idCliente: number, idPortafolio: number): Promise<void>;
}
