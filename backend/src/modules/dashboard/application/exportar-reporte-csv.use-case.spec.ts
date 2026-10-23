import { BadRequestException } from '@nestjs/common';
import type { FuenteDatosReporte } from '../domain/fuente-datos-reporte.js';
import type { DatosReporte } from '../domain/reporte.js';
import { ExportadorCsvAdapter } from '../infrastructure/exportador-csv.adapter.js';
import { ExportarReporteCsvUseCase } from './exportar-reporte-csv.use-case.js';

const datos: DatosReporte = {
  clientes: [
    { id: 1, nit: '900', razonSocial: 'Ferretería "El Tornillo", S.A.S.', idZona: 1, fechaCreacion: new Date('2026-10-01T10:00:00'), activo: true, idAsesor: 1 },
  ],
  visitas: [],
  cotizaciones: [
    { id: 1, numero: 1001, fecha: new Date('2026-10-11T09:00:00'), idCliente: 1, idAsesor: 1, estado: 'aprobada', valor: 1000 },
    { id: 2, numero: 1002, fecha: new Date('2026-10-21T09:00:00'), idCliente: 1, idAsesor: 2, estado: 'enviada', valor: 500 },
  ],
  pedidos: [],
  asesores: [{ id: 1, nombre: 'Laura Gómez' }],
  zonas: [{ id: 1, nombre: 'Norte' }],
};

const fuente: FuenteDatosReporte = { obtener: async () => datos };
const useCase = new ExportarReporteCsvUseCase(fuente, new ExportadorCsvAdapter());

describe('ExportarReporteCsvUseCase (HU-34)', () => {
  it('empieza con BOM, escapa comas y comillas y usa \\r\\n', async () => {
    const { contenido, nombreArchivo } = await useCase.ejecutar('clientes', {});
    expect(nombreArchivo).toMatch(/^clientes-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(contenido.startsWith('﻿')).toBe(true);
    expect(contenido).toBe(
      '﻿ID,NIT,Razón social,Zona,Asesor,Fecha de creación,Activo\r\n' +
        '1,900,"Ferretería ""El Tornillo"", S.A.S.",Norte,Laura Gómez,2026-10-01,Sí\r\n',
    );
  });

  it('respeta los filtros del reporte', async () => {
    const { contenido } = await useCase.ejecutar('cotizaciones', { idAsesor: 1 });
    const lineas = contenido.trim().split('\r\n');
    expect(lineas).toHaveLength(2);
    expect(lineas[1]).toBe('COT-1001,2026-10-11,"Ferretería ""El Tornillo"", S.A.S.",Norte,Laura Gómez,aprobada,1000');
  });

  it('un rango de fechas al revés responde 400', async () => {
    await expect(
      useCase.ejecutar('visitas', { desde: new Date('2026-10-20'), hasta: new Date('2026-10-10') }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
