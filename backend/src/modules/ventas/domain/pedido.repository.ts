import type { Pedido } from './pedido.js';

export interface FiltrosPedido {
  idCliente?: number;
  idAsesor?: number;
  estado?: string;
  desde?: Date;
  hasta?: Date;
}

export interface PedidoRepository {
  guardar(pedido: Pedido): Promise<Pedido>;
  buscarPorId(id: number): Promise<Pedido | null>;
  // HU-30: para saber si una cotización ya se convirtió en pedido.
  buscarPorCotizacion(idCotizacion: number): Promise<Pedido | null>;
  listar(filtros?: FiltrosPedido): Promise<Pedido[]>;
  obtenerSiguienteNumero(): Promise<number>;
}

export const PEDIDO_REPOSITORY = Symbol('PEDIDO_REPOSITORY');
