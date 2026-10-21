import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ListarPedidosUseCase } from '../application/listar-pedidos.use-case.js';
import { ObtenerPedidoUseCase } from '../application/obtener-pedido.use-case.js';
import { ConsultarPedidosDto } from './dto/consultar-pedidos.dto.js';

// Presentación: valida los filtros con el DTO y delega en los casos de uso.
@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly listar: ListarPedidosUseCase,
    private readonly obtener: ObtenerPedidoUseCase,
  ) {}

  // HU-31: filtros por cliente, asesor, estado y fechas (combinables).
  @Get()
  listarPedidos(@Query() dto: ConsultarPedidosDto, @Session() session: UserSession) {
    return this.listar.ejecutar(
      {
        idCliente: dto.idCliente,
        idAsesor: dto.idAsesor,
        estado: dto.estado,
        desde: dto.desde ? new Date(`${dto.desde}T00:00:00`) : undefined,
        hasta: dto.hasta ? new Date(`${dto.hasta}T00:00:00`) : undefined,
      },
      { id: session.user.id, role: session.user.role as string },
    );
  }

  // Detalle del pedido con su cotización de origen.
  @Get(':id')
  obtenerPedido(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.ejecutar(id);
  }
}
