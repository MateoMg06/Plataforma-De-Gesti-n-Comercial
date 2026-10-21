import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CrearSeguimientoUseCase } from '../application/crear-seguimiento.use-case.js';
import { ListarSeguimientosPendientesUseCase } from '../application/listar-seguimientos-pendientes.use-case.js';
import { ObtenerHistorialClienteUseCase } from '../application/obtener-historial-cliente.use-case.js';
import { RegistrarEnBitacora } from '../../bitacora/infrastructure/bitacora.decorator.js';
import { CrearSeguimientoDto } from './dto/crear-seguimiento.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en los casos de uso.
@Controller('seguimientos')
export class SeguimientosController {
  constructor(
    private readonly crearSeguimiento: CrearSeguimientoUseCase,
    private readonly listarPendientesUseCase: ListarSeguimientosPendientesUseCase,
    private readonly obtenerHistorialUseCase: ObtenerHistorialClienteUseCase,
  ) {}

  @Post()
  @RegistrarEnBitacora('crear_seguimiento')
  crear(@Body() dto: CrearSeguimientoDto) {
    return this.crearSeguimiento.ejecutar(dto.id_visita, dto.fecha_proxima, dto.actividad, dto.observacion);
  }

  @Get('pendientes')
  listarPendientes() {
    return this.listarPendientesUseCase.ejecutar();
  }

  @Get('cliente/:idCliente')
  historialCliente(@Param('idCliente', ParseIntPipe) idCliente: number) {
    return this.obtenerHistorialUseCase.ejecutar(idCliente);
  }
}
