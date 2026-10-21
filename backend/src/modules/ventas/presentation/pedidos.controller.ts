import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ListarPedidosUseCase } from '../application/listar-pedidos.use-case.js';
import { ObtenerPedidoUseCase } from '../application/obtener-pedido.use-case.js';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly listar: ListarPedidosUseCase,
    private readonly obtener: ObtenerPedidoUseCase,
  ) {}

  @Get()
  listarPedidos(
    @Query('idCliente') idCliente?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.listar.ejecutar({
      idCliente: idCliente ? Number(idCliente) : undefined,
      estado,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
    });
  }

  @Get(':id')
  obtenerPedido(@Param('id', ParseIntPipe) id: number) {
    return this.obtener.ejecutar(id);
  }
}
