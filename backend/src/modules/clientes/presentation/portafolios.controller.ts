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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CrearPortafolioUseCase } from '../application/crear-portafolio.use-case.js';
import { EditarPortafolioUseCase } from '../application/editar-portafolio.use-case.js';
import { EliminarPortafolioUseCase } from '../application/eliminar-portafolio.use-case.js';
import { ListarPortafoliosUseCase } from '../application/listar-portafolios.use-case.js';
import { GuardarPortafolioDto } from './dto/guardar-portafolio.dto.js';

// HU-09: catálogo de portafolio. Crear, editar y borrar es solo para administrador.
@ApiTags('Portafolio')
@Controller('portafolios')
export class PortafoliosController {
  constructor(
    private readonly listarPortafolios: ListarPortafoliosUseCase,
    private readonly crearPortafolio: CrearPortafolioUseCase,
    private readonly editarPortafolio: EditarPortafolioUseCase,
    private readonly eliminarPortafolio: EliminarPortafolioUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar portafolio', description: 'Ordenado por nombre.' })
  listar() {
    return this.listarPortafolios.ejecutar();
  }

  @Roles(['administrador'])
  @Post()
  @ApiOperation({ summary: 'Crear línea del portafolio' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  crear(@Body() dto: GuardarPortafolioDto) {
    return this.crearPortafolio.ejecutar(dto.nombre, dto.descripcion ?? '');
  }

  @Roles(['administrador'])
  @Patch(':id')
  @ApiOperation({ summary: 'Editar línea del portafolio' })
  @ApiNotFoundResponse({ description: 'No existe.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  editar(@Param('id', ParseIntPipe) id: number, @Body() dto: GuardarPortafolioDto) {
    return this.editarPortafolio.ejecutar(id, dto.nombre, dto.descripcion ?? '');
  }

  @Roles(['administrador'])
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar línea del portafolio sin clientes' })
  @ApiNotFoundResponse({ description: 'No existe.' })
  @ApiConflictResponse({ description: 'Está asignada a clientes.' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.eliminarPortafolio.ejecutar(id);
    return { mensaje: 'Portafolio eliminado' };
  }
}
