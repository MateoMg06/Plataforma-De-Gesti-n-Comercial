import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearZonaUseCase } from '../application/crear-zona.use-case.js';
import { ListarZonasUseCase } from '../application/listar-zonas.use-case.js';
import { CrearZonaDto } from './dto/crear-zona.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
// Cuando HU-02/HU-03 estén listas, agregar el guard de sesión y @Roles('administrador').
@Controller('zonas')
export class ZonasController {
  constructor(
    private readonly crearZona: CrearZonaUseCase,
    private readonly listarZonas: ListarZonasUseCase,
  ) {}

  @Get()
  listar() {
    return this.listarZonas.ejecutar();
  }

  @Post()
  crear(@Body() dto: CrearZonaDto) {
    return this.crearZona.ejecutar(dto.nombre);
  }
}
