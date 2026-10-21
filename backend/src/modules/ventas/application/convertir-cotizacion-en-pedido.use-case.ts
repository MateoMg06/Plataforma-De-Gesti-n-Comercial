import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CotizacionEstado } from '../../../common/enums/domain.enums.js';
import { Cotizacion } from '../domain/cotizacion.js';
import { COTIZACION_REPOSITORY, type CotizacionRepository } from '../domain/cotizacion.repository.js';
import { Pedido } from '../domain/pedido.js';
import { PEDIDO_REPOSITORY, type PedidoRepository } from '../domain/pedido.repository.js';

@Injectable()
export class ConvertirCotizacionEnPedidoUseCase {
  constructor(
    @Inject(COTIZACION_REPOSITORY) private readonly cotizacionRepo: CotizacionRepository,
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: PedidoRepository,
  ) {}

  async ejecutar(idCotizacion: number): Promise<Pedido> {
    const cotizacion = await this.cotizacionRepo.buscarPorId(idCotizacion);
    if (!cotizacion) throw new NotFoundException('Cotización no encontrada');
    if (cotizacion.estado !== CotizacionEstado.APROBADA) {
      throw new BadRequestException('Solo se puede convertir una cotización aprobada');
    }
    const numero = await this.pedidoRepo.obtenerSiguienteNumero();
    const pedido = Pedido.crear(numero, cotizacion);
    return this.pedidoRepo.guardar(pedido);
  }
}
