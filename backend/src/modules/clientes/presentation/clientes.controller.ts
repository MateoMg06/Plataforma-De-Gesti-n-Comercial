import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ListarClientesUseCase } from '../application/listar-clientes.use-case.js';
import { EditarClienteUseCase } from '../application/editar-cliente.use-case.js';
import { CambiarActividadClienteUseCase } from '../application/cambiar-actividad-cliente.use-case.js';
import { ConsultarClientesDto } from './dto/consultar-clientes.dto.js';
import { EditarClienteDto } from './dto/editar-cliente.dto.js';
import { CambiarActividadClienteDto } from './dto/cambiar-actividad-cliente.dto.js';
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
  PaginaClientesDto,
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
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { RegistrarClienteUseCase } from '../application/registrar-cliente.use-case.js';
import { ObtenerClienteUseCase } from '../application/obtener-cliente.use-case.js';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto.js';
import { RegistrarEnBitacora } from '../../bitacora/infrastructure/bitacora.decorator.js';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly listarClientes: ListarClientesUseCase,
    private readonly editarCliente: EditarClienteUseCase,
    private readonly cambiarActividad: CambiarActividadClienteUseCase,
    private readonly listarOpciones: ListarOpcionesClienteUseCase,
    private readonly registrarCliente: RegistrarClienteUseCase,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar clientes',
    description:
      'Paginación page/limit; búsqueda por NIT, razón social o nombre comercial y filtros combinables. Incluye activos e inactivos, ordenados por ID descendente.',
  })
  @ApiOkResponse({ type: PaginaClientesDto })
  @ApiBadRequestResponse({ description: 'Parámetros de consulta inválidos.' })
  listar(@Query() dto: ConsultarClientesDto, @Session() session: UserSession) {
    // HU-03: el asesor solo ve sus clientes.
    return this.listarClientes.ejecutar(dto, {
      id: session.user.id,
      role: session.user.role as string,
    });
  }

  @Put(':id')
  @RegistrarEnBitacora('editar_cliente')
  @ApiOperation({
    summary: 'Editar los datos de un cliente',
    description:
      'Exige los mismos campos que registrar. Conserva ID, fecha de creación y actividad.',
  })
  @ApiParam({ name: 'id', type: 'integer', example: 1 })
  @ApiOkResponse({ type: RespuestaClienteDto })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o catálogo inexistente.',
  })
  @ApiNotFoundResponse({ description: 'Cliente o zona inexistente.' })
  @ApiConflictResponse({ description: 'Otro cliente usa ese NIT o email.' })
  editar(@Param('id', ParseIntPipe) id: number, @Body() dto: EditarClienteDto) {
    return this.editarCliente.ejecutar(id, dto);
  }

  @Patch(':id/actividad')
  @RegistrarEnBitacora('editar_cliente')
  @ApiOperation({ summary: 'Activar o desactivar un cliente' })
  @ApiParam({ name: 'id', type: 'integer', example: 1 })
  @ApiOkResponse({ type: RespuestaClienteDto })
  @ApiBadRequestResponse({ description: 'activo debe ser booleano.' })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  actividad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarActividadClienteDto,
  ) {
    return this.cambiarActividad.ejecutar(id, dto.activo);
  }

  @Post()
  @RegistrarEnBitacora('crear_cliente')
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
