import type { DatosReporte } from './reporte.js';

// Puerto por el que los reportes (HU-33/34) piden los datos a los otros módulos.
// Lo implementa infrastructure/fuente-datos-reporte-real.ts con sus casos de uso.
export interface FuenteDatosReporte {
  obtener(): Promise<DatosReporte>;
}

export const FUENTE_DATOS_REPORTE = Symbol('FUENTE_DATOS_REPORTE');
