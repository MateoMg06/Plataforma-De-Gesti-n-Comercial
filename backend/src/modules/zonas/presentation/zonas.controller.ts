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
import { Roles } from '@thallesp/nestjs-better-auth';
import { CrearZonaUseCase } from '../application/crear-zona.use-case.js';
import { ListarZonasUseCase } from '../application/listar-zonas.use-case.js';
import { CrearZonaDto } from './dto/crear-zona.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
// Sin lógica de negocio aquí.
// Cuando HU-02/HU-03 estén listas, agregar el guard de sesión y @Roles('administrador').
// HU-03: crear, editar y borrar es solo para administrador (Configuración).
@ApiTags('Zonas')
@Controller('zonas')
export class ZonasController {
  constructor(
    private readonly editarZona: EditarZonaUseCase,
    private readonly eliminarZona: EliminarZonaUseCase,
    private readonly crearZona: CrearZonaUseCase,
    private readonly listarZonas: ListarZonasUseCase,
  ) {}

  @Roles(['administrador'])
  @Patch(':id')
  @ApiOperation({ summary: 'Editar el nombre de una zona' })
  @ApiBadRequestResponse({ description: 'ID o nombre inválido.' })
  @ApiNotFoundResponse({ description: 'La zona no existe.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  editar(@Param('id', ParseIntPipe) id: number, @Body() dto: CrearZonaDto) {
    return this.editarZona.ejecutar(id, dto.nombre);
  }

  @Roles(['administrador'])
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
  @ApiOperation({ summary: 'Listar zonas', description: 'Ordenadas por nombre.' })
  @ApiOkResponse({ schema: { example: [{ id: 1, nombre: 'Norte' }] } })
  listar() {
    return this.listarZonas.ejecutar();
  }

  @Roles(['administrador'])
  @Post()
  @ApiOperation({ summary: 'Crear zona' })
  @ApiBadRequestResponse({ description: 'Nombre inválido.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  crear(@Body() dto: CrearZonaDto) {
    return this.crearZona.ejecutar(dto.nombre);
  }
}
