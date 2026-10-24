// Puerto de la exportación (HU-34): recibe encabezados y filas y devuelve el texto del archivo.
// Lo implementa infrastructure/exportador-csv.adapter.ts.
export type CeldaCsv = string | number | null;

export interface ExportadorCsv {
  exportar(encabezados: string[], filas: CeldaCsv[][]): string;
}

export const EXPORTADOR_CSV = Symbol('EXPORTADOR_CSV');
