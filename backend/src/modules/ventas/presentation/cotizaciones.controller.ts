import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ConvertirCotizacionEnPedidoUseCase } from '../application/convertir-cotizacion-en-pedido.use-case.js';
import { CrearCotizacionUseCase } from '../application/crear-cotizacion.use-case.js';
import { ListarCotizacionesUseCase } from '../application/listar-cotizaciones.use-case.js';
import { EnviarCotizacionUseCase } from '../application/enviar-cotizacion.use-case.js';
import { AprobarCotizacionUseCase } from '../application/aprobar-cotizacion.use-case.js';
import { RechazarCotizacionUseCase } from '../application/rechazar-cotizacion.use-case.js';
import { RegistrarEnBitacora } from '../../bitacora/infrastructure/bitacora.decorator.js';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto.js';

@Controller('cotizaciones')
export class CotizacionesController {
  constructor(
    private readonly crearCotizacion: CrearCotizacionUseCase,
    private readonly listarCotizaciones: ListarCotizacionesUseCase,
    private readonly enviarCotizacion: EnviarCotizacionUseCase,
    private readonly aprobarCotizacion: AprobarCotizacionUseCase,
    private readonly rechazarCotizacion: RechazarCotizacionUseCase,
    private readonly convertirEnPedido: ConvertirCotizacionEnPedidoUseCase,
  ) {}

  @Get()
  listar() {
    return this.listarCotizaciones.ejecutar();
  }

  @Post()
  @RegistrarEnBitacora('crear_cotizacion')
  crear(@Body() dto: CrearCotizacionDto) {
    return this.crearCotizacion.ejecutar(dto.idCliente, dto.idAsesor, dto.detalles);
  }

  @Patch(':id/enviar')
  @RegistrarEnBitacora('editar_cotizacion')
  enviar(@Param('id', ParseIntPipe) id: number) {
    return this.enviarCotizacion.ejecutar(id);
  }

  @Patch(':id/aprobar')
  @RegistrarEnBitacora('editar_cotizacion')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.aprobarCotizacion.ejecutar(id);
  }

  @Patch(':id/rechazar')
  @RegistrarEnBitacora('editar_cotizacion')
  rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.rechazarCotizacion.ejecutar(id);
  }

  @Post(':id/convertir-pedido')
  @RegistrarEnBitacora('crear_pedido')
  convertir(@Param('id', ParseIntPipe) id: number) {
    return this.convertirEnPedido.ejecutar(id);
  }
}
