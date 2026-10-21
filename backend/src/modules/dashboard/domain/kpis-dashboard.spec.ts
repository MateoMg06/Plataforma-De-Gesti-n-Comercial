import { KpisDashboard, type DatosDashboard } from './kpis-dashboard.js';

// Gracias a que los KPIs se calculan en TypeScript puro, se prueban sin base de datos.
const datos = (): DatosDashboard => ({
  visitas: [
    { idAsesor: 1, estado: 'realizada' },
    { idAsesor: 1, estado: 'programada' },
    { idAsesor: 2, estado: 'realizada' },
    { idAsesor: 2, estado: 'cancelada' },
  ],
  cotizaciones: [
    { idAsesor: 1, estado: 'aprobada', valor: 300 },
    { idAsesor: 1, estado: 'borrador', valor: 100 },
    { idAsesor: 2, estado: 'enviada', valor: 500 },
  ],
  pedidos: [{ idAsesor: 2 }],
  clientes: [
    { idPotencial: 1, idAsesor: 1 },
    { idPotencial: 1, idAsesor: 2 },
    { idPotencial: 2, idAsesor: 2 },
    { idPotencial: 2, idAsesor: 2 },
  ],
  potenciales: [
    { id: 1, nombre: 'Alto' },
    { id: 2, nombre: 'Medio' },
  ],
  asesores: [{ id: 1, nombre: 'Ana' }],
});

describe('KpisDashboard', () => {
  it('cuenta visitas realizadas y programadas', () => {
    const kpis = KpisDashboard.calcular(datos());
    expect(kpis.visitas).toEqual({ realizadas: 2, programadas: 1 });
  });

  it('cuenta cotizaciones por estado', () => {
    const kpis = KpisDashboard.calcular(datos());
    expect(kpis.cotizacionesPorEstado).toEqual({
      borrador: 1,
      enviada: 1,
      aprobada: 1,
      rechazada: 0,
    });
  });

  it('suma el valor cotizado por asesor con nombre real o genérico', () => {
    const kpis = KpisDashboard.calcular(datos());
    expect(kpis.valorCotizadoPorAsesor).toEqual([
      { idAsesor: 1, nombreAsesor: 'Ana', valorCotizado: 400 },
      { idAsesor: 2, nombreAsesor: 'Asesor #2', valorCotizado: 500 },
    ]);
  });

  it('agrupa pedidos por asesor', () => {
    const kpis = KpisDashboard.calcular(datos());
    expect(kpis.pedidosPorAsesor).toEqual([
      { idAsesor: 2, nombreAsesor: 'Asesor #2', pedidos: 1 },
    ]);
  });

  it('agrupa clientes por potencial en el orden del catálogo', () => {
    const kpis = KpisDashboard.calcular(datos());
    expect(kpis.clientesPorPotencial).toEqual([
      { potencial: 'Alto', clientes: 2 },
      { potencial: 'Medio', clientes: 2 },
    ]);
  });

  it('filtra todas las agrupaciones por el asesor', () => {
    const kpis = KpisDashboard.calcular(datos(), 1);
    expect(kpis.idAsesorFiltrado).toBe(1);
    expect(kpis.visitas).toEqual({ realizadas: 1, programadas: 1 });
    expect(kpis.cotizacionesPorEstado).toEqual({
      borrador: 1,
      enviada: 0,
      aprobada: 1,
      rechazada: 0,
    });
    expect(kpis.valorCotizadoPorAsesor).toEqual([
      { idAsesor: 1, nombreAsesor: 'Ana', valorCotizado: 400 },
    ]);
    expect(kpis.pedidosPorAsesor).toEqual([]);
    expect(kpis.clientesPorPotencial).toEqual([
      { potencial: 'Alto', clientes: 1 },
      { potencial: 'Medio', clientes: 0 },
    ]);
  });

  it('rechaza un asesor inválido', () => {
    expect(() => KpisDashboard.calcular(datos(), 0)).toThrow('asesor no es válido');
    expect(() => KpisDashboard.calcular(datos(), 1.5)).toThrow('asesor no es válido');
  });

  it('lista los ids de asesor en uso, con el filtro aplicado', () => {
    const { cotizaciones, pedidos } = datos();
    expect(KpisDashboard.idsEnUso(cotizaciones, pedidos, null)).toEqual([1, 2]);
    expect(KpisDashboard.idsEnUso(cotizaciones, pedidos, 1)).toEqual([1]);
  });
});
