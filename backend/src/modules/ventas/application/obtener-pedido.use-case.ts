import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PEDIDO_REPOSITORY, type PedidoRepository } from '../domain/pedido.repository.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';

@Injectable()
export class ObtenerPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: PedidoRepository,
    @Inject(COTIZACION_REPOSITORY) private readonly cotizacionRepo: CotizacionRepository,
  ) {}
  async ejecutar(id: number) {
    const pedido = await this.pedidoRepo.buscarPorId(id);
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    const cotizacion = await this.cotizacionRepo.buscarPorId(pedido.idCotizacion);
    return { ...pedido.toJSON(), cotizacionOrigen: cotizacion };
  }
}
