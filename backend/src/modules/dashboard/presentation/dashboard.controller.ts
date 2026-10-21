import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ConsultarKpisDashboardUseCase } from '../application/consultar-kpis-dashboard.use-case.js';
import { ConsultarKpisDto } from './dto/consultar-kpis.dto.js';

// Presentación: recibe HTTP, valida con el DTO y delega en el caso de uso.
// Sin lógica de negocio aquí.
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly consultarKpis: ConsultarKpisDashboardUseCase) {}

  @Get('kpis')
  @ApiOperation({
    summary: 'KPIs del dashboard (HU-32). El asesor ve solo los suyos.',
  })
  kpis(@Query() dto: ConsultarKpisDto, @Session() session: UserSession) {
    return this.consultarKpis.ejecutar(dto.idAsesor ?? null, {
      id: session.user.id,
      role: session.user.role as string,
    });
  }
}
