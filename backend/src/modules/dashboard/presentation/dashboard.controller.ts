import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { ConsultarKpisDashboardUseCase } from '../application/consultar-kpis-dashboard.use-case.js';
import { ConsultarKpisDto } from './dto/consultar-kpis.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en el caso de uso.
// Sin lógica de negocio aquí.
// Cuando HU-03 (Kevin V) conecte el rol de la sesión con el ASESOR (id_usuario),
// el id del asesor vendrá de la sesión y este query param quedará solo para pruebas.
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly consultarKpis: ConsultarKpisDashboardUseCase) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs del dashboard (HU-32)' })
  kpis(@Query() dto: ConsultarKpisDto) {
    return this.consultarKpis.ejecutar(dto.idAsesor ?? null);
  }
}
