import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  OpcionesClienteDto,
  RespuestaClienteDto,
} from './dto/respuesta-cliente.dto.js';
import { ListarOpcionesClienteUseCase } from '../application/listar-opciones-cliente.use-case.js';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { RegistrarClienteUseCase } from '../application/registrar-cliente.use-case.js';
import { ObtenerClienteUseCase } from '../application/obtener-cliente.use-case.js';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto.js';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly listarOpciones: ListarOpcionesClienteUseCase,
    private readonly registrarCliente: RegistrarClienteUseCase,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un cliente',
    description:
      'NIT y email deben ser únicos. La zona y los catálogos deben existir. La fecha de creación y el estado activo se asignan automáticamente.',
  })
  @ApiCreatedResponse({
    description: 'Cliente registrado.',
    type: RespuestaClienteDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o tipo, potencial o estado inexistente.',
  })
  @ApiConflictResponse({
    description: 'Ya existe un cliente con ese NIT o email.',
  })
  @ApiNotFoundResponse({ description: 'La zona asignada no existe.' })
  registrar(@Body() dto: RegistrarClienteDto) {
    return this.registrarCliente.ejecutar(dto);
  }

  @Get('opciones')
  @ApiOperation({
    summary: 'Consultar opciones para registrar clientes',
    description:
      'Devuelve tipos y estados ordenados por nombre, y potenciales por orden y nombre. Las zonas se consultan en GET /api/zonas.',
  })
  @ApiOkResponse({
    description: 'Opciones disponibles.',
    type: OpcionesClienteDto,
  })
  opciones() {
    return this.listarOpciones.ejecutar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un cliente por ID' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    example: 1,
    description: 'ID del cliente.',
  })
  @ApiOkResponse({
    description: 'Cliente encontrado.',
    type: RespuestaClienteDto,
  })
  @ApiBadRequestResponse({ description: 'El ID debe ser un número entero.' })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerCliente.ejecutar(id);
  }
}
