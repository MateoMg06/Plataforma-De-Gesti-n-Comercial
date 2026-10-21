import type { Pedido } from './pedido.js';

export interface PedidoRepository {
  guardar(pedido: Pedido): Promise<Pedido>;
  buscarPorId(id: number): Promise<Pedido | null>;
  obtenerSiguienteNumero(): Promise<number>;
}

export const PEDIDO_REPOSITORY = Symbol('PEDIDO_REPOSITORY');
