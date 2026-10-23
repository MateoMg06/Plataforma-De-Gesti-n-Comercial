import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type CeldaCsv, EXPORTADOR_CSV, type ExportadorCsv } from '../domain/exportador-csv.js';
import { FUENTE_DATOS_REPORTE, type FuenteDatosReporte } from '../domain/fuente-datos-reporte.js';
import { type DatosReporte, type FiltrosReporte, type FilaReporte, Reporte } from '../domain/reporte.js';

export const TIPOS_EXPORTACION = ['clientes', 'visitas', 'cotizaciones', 'pedidos'] as const;
export type TipoExportacion = (typeof TIPOS_EXPORTACION)[number];

// HU-34: exporta a CSV lo mismo que muestra el reporte, respetando los filtros.
@Injectable()
export class ExportarReporteCsvUseCase {
  constructor(
    @Inject(FUENTE_DATOS_REPORTE) private readonly fuente: FuenteDatosReporte,
    @Inject(EXPORTADOR_CSV) private readonly exportador: ExportadorCsv,
  ) {}

  async ejecutar(tipo: TipoExportacion, filtros: FiltrosReporte): Promise<{ nombreArchivo: string; contenido: string }> {
    const datos = await this.fuente.obtener();
    let tabla: { encabezados: string[]; filas: CeldaCsv[][] };
    try {
      tabla = tipo === 'clientes' ? tablaClientes(datos, filtros) : tablaMovimientos(tipo, datos, filtros);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
    return {
      nombreArchivo: `${tipo}-${dia(new Date())}.csv`,
      contenido: this.exportador.exportar(tabla.encabezados, tabla.filas),
    };
  }
}

function tablaClientes(datos: DatosReporte, filtros: FiltrosReporte) {
  return {
    encabezados: ['ID', 'NIT', 'Razón social', 'Zona', 'Asesor', 'Fecha de creación', 'Activo'],
    filas: Reporte.clientes(datos, filtros).map((c) => [
      c.id,
      c.nit,
      c.razonSocial,
      c.zona,
      c.asesor,
      dia(c.fechaCreacion),
      c.activo ? 'Sí' : 'No',
    ]),
  };
}

function tablaMovimientos(tipo: 'visitas' | 'cotizaciones' | 'pedidos', datos: DatosReporte, filtros: FiltrosReporte) {
  const filas: FilaReporte[] = Reporte.generar(datos, filtros)[tipo];
  const conValor = tipo !== 'visitas';
  return {
    encabezados: ['Referencia', 'Fecha', 'Cliente', 'Zona', 'Asesor', 'Estado', ...(conValor ? ['Valor'] : [])],
    filas: filas.map((f) => [
      f.referencia,
      dia(f.fecha),
      f.cliente,
      f.zona,
      f.asesor,
      f.estado,
      ...(conValor ? [f.valor] : []),
    ]),
  };
}

// AAAA-MM-DD en la hora del servidor (toISOString usaría UTC y podría cambiar el día).
function dia(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${d}`;
}
