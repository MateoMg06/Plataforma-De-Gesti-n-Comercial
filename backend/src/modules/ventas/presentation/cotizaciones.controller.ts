import { Body, Controller, Post } from '@nestjs/common';
import { CrearCotizacionUseCase } from '../application/crear-cotizacion.use-case.js';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto.js';

@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly crearCotizacion: CrearCotizacionUseCase) {}

  @Post()
  crear(@Body() dto: CrearCotizacionDto) {
    return this.crearCotizacion.ejecutar(dto.idCliente, dto.idAsesor, dto.detalles);
  }
}
