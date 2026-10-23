import { Module } from '@nestjs/common';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { VentasModule } from '../ventas/ventas.module.js';
import { VisitasModule } from '../visitas/visitas.module.js';
import { ZonasModule } from '../zonas/zonas.module.js';
import { ConsultarKpisDashboardUseCase } from './application/consultar-kpis-dashboard.use-case.js';
import { ConsultarReporteUseCase } from './application/consultar-reporte.use-case.js';
import { ExportarReporteCsvUseCase } from './application/exportar-reporte-csv.use-case.js';
import { EXPORTADOR_CSV } from './domain/exportador-csv.js';
import { FUENTE_DATOS_DASHBOARD } from './domain/fuente-datos-dashboard.js';
import { FUENTE_DATOS_REPORTE } from './domain/fuente-datos-reporte.js';
import { ExportadorCsvAdapter } from './infrastructure/exportador-csv.adapter.js';
import { FuenteDatosReal } from './infrastructure/fuente-datos-real.js';
import { FuenteDatosReporteReal } from './infrastructure/fuente-datos-reporte-real.js';
import { DashboardController } from './presentation/dashboard.controller.js';
import { ReportesController } from './presentation/reportes.controller.js';

// HU-32 (dashboard), HU-33 (reportes) y HU-34 (CSV). No tiene tablas propias:
// solo lee, siempre por casos de uso exportados por cada módulo dueño de sus datos:
// - VisitasModule: ListarVisitasUseCase.
// - AsesoresModule: ObtenerAsesorUseCase (nombres) y ObtenerAsesorPorUsuarioUseCase (sesión).
// - VentasModule: ListarCotizacionesUseCase y ListarPedidosUseCase.
// - ClientesModule: ListarClientesUseCase y ListarPotencialesUseCase.
// - ZonasModule: ObtenerZonaUseCase (nombres de zona en los reportes).
@Module({
  imports: [VisitasModule, AsesoresModule, VentasModule, ClientesModule, ZonasModule],
  controllers: [DashboardController, ReportesController],
  providers: [
    ConsultarKpisDashboardUseCase,
    ConsultarReporteUseCase,
    ExportarReporteCsvUseCase,
    // Aquí se conectan los puertos con sus adaptadores.
    { provide: FUENTE_DATOS_DASHBOARD, useClass: FuenteDatosReal },
    { provide: FUENTE_DATOS_REPORTE, useClass: FuenteDatosReporteReal },
    { provide: EXPORTADOR_CSV, useClass: ExportadorCsvAdapter },
  ],
})
export class DashboardModule {}
