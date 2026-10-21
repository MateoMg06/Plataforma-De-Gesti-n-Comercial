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
import { CrearTipoClienteUseCase } from '../application/crear-tipo-cliente.use-case.js';
import { EditarTipoClienteUseCase } from '../application/editar-tipo-cliente.use-case.js';
import { EliminarTipoClienteUseCase } from '../application/eliminar-tipo-cliente.use-case.js';
import { ListarTiposClienteUseCase } from '../application/listar-tipos-cliente.use-case.js';
import { GuardarTipoClienteDto } from './dto/guardar-tipo-cliente.dto.js';

// HU-03: crear, editar y borrar es solo para administrador (Configuración).
@ApiTags('TiposCliente')
@Controller('tipos-cliente')
export class TiposClienteController {
  constructor(
    private readonly crearOpcion: CrearTipoClienteUseCase,
    private readonly editarOpcion: EditarTipoClienteUseCase,
    private readonly eliminarOpcion: EliminarTipoClienteUseCase,
    private readonly listarOpciones: ListarTiposClienteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar tipos-cliente',
    description: 'Ordenados por nombre.',
  })
  listar() {
    return this.listarOpciones.ejecutar();
  }

  @Roles(['administrador'])
  @Post()
  @ApiOperation({ summary: 'Crear tipo de cliente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  crear(@Body() dto: GuardarTipoClienteDto) {
    return this.crearOpcion.ejecutar(dto.nombre);
  }

  @Roles(['administrador'])
  @Patch(':id')
  @ApiOperation({ summary: 'Editar tipo de cliente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  @ApiConflictResponse({ description: 'Nombre duplicado.' })
  @ApiNotFoundResponse({ description: 'La opción no existe.' })
  editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GuardarTipoClienteDto,
  ) {
    return this.editarOpcion.ejecutar(id, dto.nombre);
  }

  @Roles(['administrador'])
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tipo de cliente sin referencias' })
  @ApiNotFoundResponse({ description: 'La opción no existe.' })
  @ApiConflictResponse({ description: 'La opción está en uso.' })
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.eliminarOpcion.ejecutar(id);
    return { mensaje: 'Opción eliminada' };
  }
}
