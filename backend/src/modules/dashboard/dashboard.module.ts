import { Module } from '@nestjs/common';
import { AsesoresModule } from '../asesores/asesores.module.js';
import { VisitasModule } from '../visitas/visitas.module.js';
import { ConsultarKpisDashboardUseCase } from './application/consultar-kpis-dashboard.use-case.js';
import { FUENTE_DATOS_DASHBOARD } from './domain/fuente-datos-dashboard.js';
import { FuenteDatosFake } from './infrastructure/fuente-datos-fake.js';
import { DashboardController } from './presentation/dashboard.controller.js';

// HU-32: dashboard de KPIs. No tiene tablas propias: solo lee.
// - VisitasModule exporta ListarVisitasUseCase (lectura real).
// - AsesoresModule exporta ObtenerAsesorUseCase (nombres reales).
// - Cotizaciones, pedidos y clientes llegan por FUENTE_DATOS_DASHBOARD
//   (datos de muestra) hasta que esos módulos exporten sus casos de uso.
@Module({
  imports: [VisitasModule, AsesoresModule],
  controllers: [DashboardController],
  providers: [
    ConsultarKpisDashboardUseCase,
    // Aquí se conecta el puerto con su adaptador. Cuando haya lecturas reales,
    // se cambia FuenteDatosFake por el adaptador que las llame.
    { provide: FUENTE_DATOS_DASHBOARD, useClass: FuenteDatosFake },
  ],
})
export class DashboardModule {}
