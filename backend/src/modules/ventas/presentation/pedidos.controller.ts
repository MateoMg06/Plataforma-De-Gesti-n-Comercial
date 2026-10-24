import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ListarPedidosUseCase } from '../application/listar-pedidos.use-case.js';
import { ObtenerPedidoUseCase } from '../application/obtener-pedido.use-case.js';
import { ConsultarPedidosDto } from './dto/consultar-pedidos.dto.js';

const pedidoEjemplo = {
  id: 1,
  numero: 1,
  idCotizacion: 1,
  idCliente: 1,
  valor: 9850000,
  estado: 'pendiente',
  fecha: '2026-10-21T14:00:00.000Z',
};

// Presentación: valida los filtros con el DTO y delega en los casos de uso.
@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly listar: ListarPedidosUseCase,
    private readonly obtener: ObtenerPedidoUseCase,
  ) {}

  // HU-31: filtros por cliente, asesor, estado y fechas (combinables).
  @Get()
  @ApiOperation({
    summary: 'Consultar pedidos (HU-31)',
    description: 'Filtros combinables. Con rol asesor solo devuelve sus pedidos. Del más reciente al más antiguo.',
  })
  @ApiOkResponse({ schema: { example: [pedidoEjemplo] } })
  @ApiBadRequestResponse({ description: 'Filtro inválido (estado o fecha).' })
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
  @ApiOperation({ summary: 'Detalle del pedido con su cotización de origen' })
  @ApiOkResponse({
    schema: {
      example: {
        ...pedidoEjemplo,
        cotizacionOrigen: { numero: 1001, estado: 'aprobada', total: 9850000, detalles: [{ producto: 'Equipo de soldadura', cantidad: 2, precio: 4500000, subtotal: 9000000 }] },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'El pedido no existe.' })
  obtenerPedido(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.ejecutar(id);
  }
}
