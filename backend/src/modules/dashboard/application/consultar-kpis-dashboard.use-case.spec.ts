import { NotFoundException } from '@nestjs/common';
import type { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import type { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import { Visita } from '../../visitas/domain/visita.js';
import type {
  DatoNombre,
  FilaCliente,
  FilaCotizacion,
  FilaPedido,
} from '../domain/kpis-dashboard.js';
import type { FuenteDatosDashboard } from '../domain/fuente-datos-dashboard.js';
import { ConsultarKpisDashboardUseCase } from './consultar-kpis-dashboard.use-case.js';

// Fuente de datos en memoria: cumple el puerto sin base de datos.
class FuenteEnMemoria implements FuenteDatosDashboard {
  constructor(
    private readonly cotizaciones: FilaCotizacion[] = [],
    private readonly pedidos: FilaPedido[] = [],
    private readonly clientes: FilaCliente[] = [],
    private readonly potenciales: DatoNombre[] = [{ id: 1, nombre: 'Alto' }],
  ) {}

  listarCotizaciones(): Promise<FilaCotizacion[]> {
    return Promise.resolve(this.cotizaciones);
  }

  listarPedidos(): Promise<FilaPedido[]> {
    return Promise.resolve(this.pedidos);
  }

  listarClientes(): Promise<FilaCliente[]> {
    return Promise.resolve(this.clientes);
  }

  listarPotenciales(): Promise<DatoNombre[]> {
    return Promise.resolve(this.potenciales);
  }
}

// El caso de uso solo conoce los casos de uso de otros módulos, no sus
// repositorios: aquí se simulan esos casos de uso con objetos simples.
const conVisitas = (visitas: Visita[]) =>
  ({
    ejecutar: () => Promise.resolve(visitas),
  }) as unknown as ListarVisitasUseCase;

const conAsesores = (porId: Record<number, string>) =>
  ({
    ejecutar: async (id: number) => {
      const nombre = porId[id];
      if (!nombre) throw new NotFoundException('El asesor no existe');
      return { id, nombre };
    },
  }) as unknown as ObtenerAsesorUseCase;

// La sesión del usuario u-carlos corresponde al asesor 2.
const porUsuario = {
  ejecutar: async (idUsuario: string) => {
    if (idUsuario !== 'u-carlos') throw new NotFoundException('Sin asesor');
    return { id: 2 };
  },
} as unknown as ObtenerAsesorPorUsuarioUseCase;

describe('ConsultarKpisDashboardUseCase', () => {
  it('combina visitas reales con los datos de la fuente y usa nombres reales', async () => {
    const useCase = new ConsultarKpisDashboardUseCase(
      new FuenteEnMemoria([{ idAsesor: 1, estado: 'aprobada', valor: 500 }]),
      conVisitas([
        Visita.crear(10, 1, new Date('2026-10-26T09:00:00')),
        Visita.crear(11, 1, new Date('2026-10-27T09:00:00')).registrarResultado(
          new Date('2026-10-27T10:00:00'),
          'realizada',
        ),
      ]),
      conAsesores({ 1: 'Ana Rodríguez' }),
      porUsuario,
    );

    const kpis = await useCase.ejecutar(null);

    expect(kpis.visitas).toEqual({ realizadas: 1, programadas: 1 });
    expect(kpis.cotizacionesPorEstado.aprobada).toBe(1);
    expect(kpis.valorCotizadoPorAsesor).toEqual([
      { idAsesor: 1, nombreAsesor: 'Ana Rodríguez', valorCotizado: 500 },
    ]);
    expect(kpis.pedidosPorAsesor).toEqual([]);
    expect(kpis.idAsesorFiltrado).toBeNull();
  });

  it('usa un nombre genérico cuando el asesor no existe en la base', async () => {
    const useCase = new ConsultarKpisDashboardUseCase(
      new FuenteEnMemoria([{ idAsesor: 9, estado: 'enviada', valor: 100 }]),
      conVisitas([]),
      conAsesores({}),
      porUsuario,
    );

    const kpis = await useCase.ejecutar(null);

    expect(kpis.valorCotizadoPorAsesor).toEqual([
      { idAsesor: 9, nombreAsesor: 'Asesor #9', valorCotizado: 100 },
    ]);
  });

  it('filtra los KPIs por el asesor indicado', async () => {
    const useCase = new ConsultarKpisDashboardUseCase(
      new FuenteEnMemoria([{ idAsesor: 2, estado: 'aprobada', valor: 700 }]),
      conVisitas([
        Visita.crear(10, 1, new Date('2026-10-26T09:00:00')),
        Visita.crear(11, 2, new Date('2026-10-26T10:00:00')),
      ]),
      conAsesores({ 2: 'Carlos Méndez' }),
      porUsuario,
    );

    const kpis = await useCase.ejecutar(1);

    expect(kpis.idAsesorFiltrado).toBe(1);
    expect(kpis.visitas).toEqual({ realizadas: 0, programadas: 1 });
    expect(kpis.valorCotizadoPorAsesor).toEqual([]);
    expect(kpis.cotizacionesPorEstado).toEqual({
      borrador: 0,
      enviada: 0,
      aprobada: 0,
      rechazada: 0,
    });
  });

  it('el asesor ve solo sus KPIs aunque pida otro asesor', async () => {
    const useCase = new ConsultarKpisDashboardUseCase(
      new FuenteEnMemoria([
        { idAsesor: 1, estado: 'aprobada', valor: 900 },
        { idAsesor: 2, estado: 'enviada', valor: 300 },
      ]),
      conVisitas([]),
      conAsesores({ 1: 'Ana Rodríguez', 2: 'Carlos Méndez' }),
      porUsuario,
    );

    // Pide el asesor 1, pero su sesión es la del asesor 2.
    const kpis = await useCase.ejecutar(1, { id: 'u-carlos', role: 'asesor' });

    expect(kpis.idAsesorFiltrado).toBe(2);
    expect(kpis.valorCotizadoPorAsesor).toEqual([
      { idAsesor: 2, nombreAsesor: 'Carlos Méndez', valorCotizado: 300 },
    ]);
  });
});
