import { type DatosReporte, Reporte } from './reporte.js';

// Dos zonas, dos asesores, dos clientes (uno por zona).
const datos: DatosReporte = {
  clientes: [
    { id: 1, nit: '900', razonSocial: 'Ferretería Norte', idZona: 1, fechaCreacion: new Date('2026-10-01T10:00:00'), activo: true, idAsesor: 1 },
    { id: 2, nit: '901', razonSocial: 'Almacén Sur', idZona: 2, fechaCreacion: new Date('2026-10-15T10:00:00'), activo: true },
  ],
  visitas: [
    { id: 1, fecha: new Date('2026-10-10T09:00:00'), idCliente: 1, idAsesor: 1, estado: 'realizada' },
    { id: 2, fecha: new Date('2026-10-20T09:00:00'), idCliente: 2, idAsesor: 2, estado: 'programada' },
  ],
  cotizaciones: [
    { id: 1, numero: 1001, fecha: new Date('2026-10-11T09:00:00'), idCliente: 1, idAsesor: 1, estado: 'aprobada', valor: 1000 },
    { id: 2, numero: 1002, fecha: new Date('2026-10-21T09:00:00'), idCliente: 2, idAsesor: 2, estado: 'enviada', valor: 500 },
  ],
  pedidos: [
    { id: 1, numero: 1, fecha: new Date('2026-10-12T09:00:00'), idCliente: 1, idAsesor: 1, estado: 'pendiente', valor: 1000 },
  ],
  asesores: [{ id: 1, nombre: 'Laura' }],
  zonas: [{ id: 1, nombre: 'Norte' }, { id: 2, nombre: 'Sur' }],
};

describe('Reporte (HU-33)', () => {
  it('sin filtros trae todo con nombres y totales', () => {
    const r = Reporte.generar(datos, {});
    expect(r.totales).toEqual({
      visitas: { cantidad: 2, realizadas: 1 },
      cotizaciones: { cantidad: 2, valor: 1500 },
      pedidos: { cantidad: 1, valor: 1000 },
    });
    // Del más reciente al más antiguo; un asesor sin nombre usa uno genérico.
    expect(r.cotizaciones[0]).toMatchObject({ referencia: 'COT-1002', cliente: 'Almacén Sur', zona: 'Sur', asesor: 'Asesor #2' });
  });

  it('filtra por zona (la del cliente) y por asesor', () => {
    expect(Reporte.generar(datos, { idZona: 2 }).cotizaciones.map((c) => c.referencia)).toEqual(['COT-1002']);
    expect(Reporte.generar(datos, { idAsesor: 1 }).totales.visitas.cantidad).toBe(1);
  });

  it('filtra por rango de fechas ("hasta" exclusivo)', () => {
    const r = Reporte.generar(datos, { desde: new Date('2026-10-11T00:00:00'), hasta: new Date('2026-10-21T00:00:00') });
    expect(r.visitas.map((v) => v.referencia)).toEqual(['VIS-2']);
    expect(r.cotizaciones.map((c) => c.referencia)).toEqual(['COT-1001']);
  });

  it('rechaza un rango de fechas al revés', () => {
    expect(() => Reporte.generar(datos, { desde: new Date('2026-10-20'), hasta: new Date('2026-10-10') })).toThrow();
  });

  it('clientes: filtra por fecha de creación y marca los que no tienen asesor', () => {
    const clientes = Reporte.clientes(datos, { desde: new Date('2026-10-10T00:00:00') });
    expect(clientes).toEqual([expect.objectContaining({ razonSocial: 'Almacén Sur', zona: 'Sur', asesor: 'Sin asesor' })]);
  });
});
