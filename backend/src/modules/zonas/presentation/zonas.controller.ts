import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EditarZonaUseCase } from '../application/editar-zona.use-case.js';
import { EliminarZonaUseCase } from '../application/eliminar-zona.use-case.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CrearZonaUseCase } from '../application/crear-zona.use-case.js';
import { ListarZonasUseCase } from '../application/listar-zonas.use-case.js';
import { CrearZonaDto } from './dto/crear-zona.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
// Cuando HU-02/HU-03 estén listas, agregar el guard de sesión y @Roles('administrador').
@ApiTags('Zonas')
@Controller('zonas')
export class ZonasController {
  constructor(
    private readonly editarZona: EditarZonaUseCase,
    private readonly eliminarZona: EliminarZonaUseCase,
    private readonly crearZona: CrearZonaUseCase,
    private readonly listarZonas: ListarZonasUseCase,
  ) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Editar el nombre de una zona' })
  @ApiBadRequestResponse({ description: 'ID o nombre inválido.' })
  @ApiNotFoundResponse({ description: 'La zona no existe.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  editar(@Param('id', ParseIntPipe) id: number, @Body() dto: CrearZonaDto) {
    return this.editarZona.ejecutar(id, dto.nombre);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una zona sin referencias' })
  @ApiOkResponse({ description: 'Zona eliminada.' })
  @ApiNotFoundResponse({ description: 'La zona no existe.' })
  @ApiConflictResponse({ description: 'La zona está en uso.' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.eliminarZona.ejecutar(id);
    return { mensaje: 'Zona eliminada' };
  }

  @Get()
  listar() {
    return this.listarZonas.ejecutar();
  }

  @Post()
  crear(@Body() dto: CrearZonaDto) {
    return this.crearZona.ejecutar(dto.nombre);
  }
}
