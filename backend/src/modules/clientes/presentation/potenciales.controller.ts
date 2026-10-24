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
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CrearPotencialUseCase } from '../application/crear-potencial.use-case.js';
import { EditarPotencialUseCase } from '../application/editar-potencial.use-case.js';
import { EliminarPotencialUseCase } from '../application/eliminar-potencial.use-case.js';
import { ListarPotencialesUseCase } from '../application/listar-potenciales.use-case.js';
import { GuardarPotencialDto } from './dto/guardar-potencial.dto.js';

// HU-03: crear, editar y borrar es solo para administrador (Configuración).
@ApiTags('Potenciales')
@Controller('potenciales')
export class PotencialesController {
  constructor(
    private readonly crearOpcion: CrearPotencialUseCase,
    private readonly editarOpcion: EditarPotencialUseCase,
    private readonly eliminarOpcion: EliminarPotencialUseCase,
    private readonly listarOpciones: ListarPotencialesUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar potenciales',
    description: 'Ordenados por orden y nombre.',
  })
  listar() {
    return this.listarOpciones.ejecutar();
  }

  @Roles(['administrador'])
  @Post()
  @ApiOperation({ summary: 'Crear potencial' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  crear(@Body() dto: GuardarPotencialDto) {
    return this.crearOpcion.ejecutar(dto.nombre, dto.orden);
  }

  @Roles(['administrador'])
  @Patch(':id')
  @ApiOperation({ summary: 'Editar potencial' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  @ApiNotFoundResponse({ description: 'La opción no existe.' })
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarPotencialDto,
  ) {
    return this.editarOpcion.ejecutar(id, dto.nombre, dto.orden);
  }

  @Roles(['administrador'])
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar potencial sin referencias' })
  @ApiNotFoundResponse({ description: 'La opción no existe.' })
  @ApiConflictResponse({ description: 'La opción está en uso.' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.eliminarOpcion.ejecutar(id);
    return { mensaje: 'Opción eliminada' };
  }
}
