import { Body, Controller, Post } from '@nestjs/common';
import { CrearRutaUseCase } from '../application/crear-ruta.use-case.js';
import { CrearRutaDto } from './dto/crear-ruta.dto.js';

@Controller('rutas')
export class RutasController {
  constructor(private readonly crearRuta: CrearRutaUseCase) {}

  @Post()
  crear(@Body() dto: CrearRutaDto) {
    return this.crearRuta.ejecutar(
      dto.nombre,
      dto.id_asesor,
      dto.fecha_inicio,
      dto.fecha_fin,
    );
  }
}
