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
import { CrearEstadoClienteUseCase } from '../application/crear-estado-cliente.use-case.js';
import { EditarEstadoClienteUseCase } from '../application/editar-estado-cliente.use-case.js';
import { EliminarEstadoClienteUseCase } from '../application/eliminar-estado-cliente.use-case.js';
import { ListarEstadosClienteUseCase } from '../application/listar-estados-cliente.use-case.js';
import { GuardarEstadoClienteDto } from './dto/guardar-estado-cliente.dto.js';

// HU-03: crear, editar y borrar es solo para administrador (Configuración).
@ApiTags('EstadosCliente')
@Controller('estados-cliente')
export class EstadosClienteController {
  constructor(
    private readonly crearOpcion: CrearEstadoClienteUseCase,
    private readonly editarOpcion: EditarEstadoClienteUseCase,
    private readonly eliminarOpcion: EliminarEstadoClienteUseCase,
    private readonly listarOpciones: ListarEstadosClienteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar estados-cliente',
    description: 'Ordenados por nombre.',
  })
  listar() {
    return this.listarOpciones.ejecutar();
  }

  @Roles(['administrador'])
  @Post()
  @ApiOperation({ summary: 'Crear estado de cliente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  crear(@Body() dto: GuardarEstadoClienteDto) {
    return this.crearOpcion.ejecutar(dto.nombre);
  }

  @Roles(['administrador'])
  @Patch(':id')
  @ApiOperation({ summary: 'Editar estado de cliente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  @ApiNotFoundResponse({ description: 'La opción no existe.' })
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarEstadoClienteDto,
  ) {
    return this.editarOpcion.ejecutar(id, dto.nombre);
  }

  @Roles(['administrador'])
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estado de cliente sin referencias' })
  @ApiNotFoundResponse({ description: 'La opción no existe.' })
  @ApiConflictResponse({ description: 'La opción está en uso.' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.eliminarOpcion.ejecutar(id);
    return { mensaje: 'Opción eliminada' };
  }
}
