import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearSeguimientoUseCase } from '../application/crear-seguimiento.use-case.js';
import { ListarSeguimientosPendientesUseCase } from '../application/listar-seguimientos-pendientes.use-case.js';
import { ObtenerHistorialClienteUseCase } from '../application/obtener-historial-cliente.use-case.js';

@Controller('seguimientos')
export class SeguimientosController {
  constructor(
    private readonly crearSeguimiento: CrearSeguimientoUseCase,
    private readonly listarPendientesUseCase: ListarSeguimientosPendientesUseCase,
    private readonly obtenerHistorialUseCase: ObtenerHistorialClienteUseCase,
  ) {}

  @Post()
  async crear(@Body() dto: { id_visita: number; fecha_proxima: string; actividad: string; observacion: string }): Promise<void> {
    await this.crearSeguimiento.ejecutar(dto.id_visita, dto.fecha_proxima, dto.actividad, dto.observacion);
  }

  @Get('pendientes')
  async listarPendientes(): Promise<void> {
    await this.listarPendientesUseCase.ejecutar();
  }

  @Get('cliente/:idCliente')
  async historialCliente(@Param('idCliente') idCliente: number): Promise<void> {
    await this.obtenerHistorialUseCase.ejecutar(idCliente);
  }
}