import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CrearSeguimientoUseCase } from '../application/crear-seguimiento.use-case.js';
import { ListarSeguimientosPendientesUseCase } from '../application/listar-seguimientos-pendientes.use-case.js';
import { ObtenerHistorialClienteUseCase } from '../application/obtener-historial-cliente.use-case.js';
import { RegistrarEnBitacora } from '../../bitacora/infrastructure/bitacora.decorator.js';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
@ApiTags('Seguimientos')
@Controller('seguimientos')
export class SeguimientosController {
  constructor(
    private readonly crearSeguimiento: CrearSeguimientoUseCase,
    private readonly listarPendientesUseCase: ListarSeguimientosPendientesUseCase,
    private readonly obtenerHistorialUseCase: ObtenerHistorialClienteUseCase,
  ) {}

  @Post()
  @RegistrarEnBitacora('crear_seguimiento')
  @ApiOperation({ summary: 'Crear seguimiento de una visita (HU-23)', description: 'Queda registrado en la bitácora.' })
  @ApiCreatedResponse({ description: 'Seguimiento creado.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  crear(@Body() dto: CrearSeguimientoDto) {
    return this.crearSeguimiento.ejecutar(dto.id_visita, dto.fecha_proxima, dto.actividad, dto.observacion);
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Seguimientos pendientes (HU-24)', description: 'Los no completados, ordenados por fecha próxima.' })
  @ApiOkResponse({ description: 'Seguimientos pendientes.' })
  listarPendientes() {
    return this.listarPendientesUseCase.ejecutar();
  }

  @Get('cliente/:idCliente')
  @ApiOperation({ summary: 'Historial de seguimientos de un cliente (HU-26)' })
  @ApiOkResponse({ description: 'Seguimientos del cliente.' })
  historialCliente(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return this.obtenerHistorialUseCase.ejecutar(idCliente);
  }
}
