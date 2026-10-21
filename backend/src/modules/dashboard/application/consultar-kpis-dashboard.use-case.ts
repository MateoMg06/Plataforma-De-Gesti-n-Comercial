import { Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import {
  FUENTE_DATOS_DASHBOARD,
  type FuenteDatosDashboard,
} from '../domain/fuente-datos-dashboard.js';
import { KpisDashboard, type DatoNombre } from '../domain/kpis-dashboard.js';

// HU-32: consulta los KPIs del dashboard. Los KPIs se calculan en el
// dominio (KpisDashboard); este caso de uso solo junta los datos:
// - visitas: caso de uso real de visitas (ListarVisitasUseCase, ya exportado).
// - asesores: caso de uso real de asesores (ObtenerAsesorUseCase) para nombres.
// - cotizaciones, pedidos y clientes: por el puerto FUENTE_DATOS_DASHBOARD
//   mientras esos módulos no exporten sus lecturas (ver fuente-datos-fake.ts).
@Injectable()
export class ConsultarKpisDashboardUseCase {
  constructor(
    @Inject(FUENTE_DATOS_DASHBOARD) private readonly fuente: FuenteDatosDashboard,
    private readonly listarVisitas: ListarVisitasUseCase,
    private readonly obtenerAsesor: ObtenerAsesorUseCase,
  ) {}

  async ejecutar(idAsesor: number | null): Promise<KpisDashboard> {
    const [visitas, cotizaciones, pedidos, clientes, potenciales] = await Promise.all([
      this.listarVisitas.ejecutar(),
      this.fuente.listarCotizaciones(),
      this.fuente.listarPedidos(),
      this.fuente.listarClientes(),
      this.fuente.listarPotenciales(),
    ]);

    return KpisDashboard.calcular(
      {
        visitas,
        cotizaciones,
        pedidos,
        clientes,
        potenciales,
        asesores: await this.nombresDeAsesores(KpisDashboard.idsEnUso(cotizaciones, pedidos, idAsesor)),
      },
      idAsesor,
    );
  }

  // Trae el nombre real de cada asesor que aparece en los KPIs.
  // Si un id no existe en la base, el dominio usa "Asesor #id".
  private async nombresDeAsesores(ids: number[]): Promise<DatoNombre[]> {
    const nombres: DatoNombre[] = [];
    for (const id of ids) {
      try {
        nombres.push({ id, nombre: (await this.obtenerAsesor.ejecutar(id)).nombre });
      } catch {
        // Asesor inexistente en la base: se resuelve con nombre genérico.
      }
    }
    return nombres;
  }
}
