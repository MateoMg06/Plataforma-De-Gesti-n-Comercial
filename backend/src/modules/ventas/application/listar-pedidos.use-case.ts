import { Inject, Injectable } from '@nestjs/common';
import { PEDIDO_REPOSITORY, type PedidoRepository } from '../domain/pedido.repository.js';
import type { FiltrosPedido } from '../domain/pedido.repository.js';

@Injectable()
export class ListarPedidosUseCase {
  constructor(@Inject(PEDIDO_REPOSITORY) private readonly repo: PedidoRepository) {}
  ejecutar(filtros?: FiltrosPedido) {
    return this.repo.listar(filtros);
  }
}
