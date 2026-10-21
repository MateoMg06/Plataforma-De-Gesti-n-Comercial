import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CrearCotizacionUseCase } from '../application/crear-cotizacion.use-case.js';
import { EnviarCotizacionUseCase } from '../application/enviar-cotizacion.use-case.js';
import { AprobarCotizacionUseCase } from '../application/aprobar-cotizacion.use-case.js';
import { RechazarCotizacionUseCase } from '../application/rechazar-cotizacion.use-case.js';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto.js';

@Controller('cotizaciones')
export class CotizacionesController {
  constructor(
    private readonly crearCotizacion: CrearCotizacionUseCase,
    private readonly enviarCotizacion: EnviarCotizacionUseCase,
    private readonly aprobarCotizacion: AprobarCotizacionUseCase,
    private readonly rechazarCotizacion: RechazarCotizacionUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearCotizacionDto) {
    return this.crearCotizacion.ejecutar(dto.idCliente, dto.idAsesor, dto.detalles);
  }

  @Patch(':id/enviar')
  enviar(@Param('id', ParseIntPipe) id: number) {
    return this.enviarCotizacion.ejecutar(id);
  }

  @Patch(':id/aprobar')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.aprobarCotizacion.ejecutar(id);
  }

  @Patch(':id/rechazar')
  rechazar(@Param('id', ParseIntPipe) id: number) {
    return this.rechazarCotizacion.ejecutar(id);
  }
}
