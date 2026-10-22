import { Module } from '@nestjs/common';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { ClientesModule } from '../clientes/clientes.module.js';
import { VentasModule } from '../ventas/ventas.module.js';
import { VisitasModule } from '../visitas/visitas.module.js';
import { ConsultarKpisDashboardUseCase } from './application/consultar-kpis-dashboard.use-case.js';
import { FUENTE_DATOS_DASHBOARD } from './domain/fuente-datos-dashboard.js';
import { FuenteDatosReal } from './infrastructure/fuente-datos-real.js';
import { DashboardController } from './presentation/dashboard.controller.js';

// HU-32: dashboard de KPIs. No tiene tablas propias: solo lee, siempre por
// casos de uso exportados por cada módulo dueño de sus datos:
// - VisitasModule: ListarVisitasUseCase.
// - AsesoresModule: ObtenerAsesorUseCase (nombres) y ObtenerAsesorPorUsuarioUseCase (sesión).
// - VentasModule: ListarCotizacionesUseCase y ListarPedidosUseCase.
// - ClientesModule: ListarClientesUseCase y ListarPotencialesUseCase.
@Module({
  imports: [VisitasModule, AsesoresModule, VentasModule, ClientesModule],
  controllers: [DashboardController],
  providers: [
    ConsultarKpisDashboardUseCase,
    // Aquí se conecta el puerto con su adaptador de datos reales.
    { provide: FUENTE_DATOS_DASHBOARD, useClass: FuenteDatosReal },
  ],
})
export class DashboardModule {}
