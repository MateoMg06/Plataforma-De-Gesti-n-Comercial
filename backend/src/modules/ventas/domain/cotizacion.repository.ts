import type { Cotizacion } from './cotizacion.js';

export interface CotizacionRepository {
  guardar(cotizacion: Cotizacion): Promise<Cotizacion>;
  buscarPorId(id: number): Promise<Cotizacion | null>;
  listar(): Promise<Cotizacion[]>;
  obtenerSiguienteNumero(): Promise<number>;
}

export const COTIZACION_REPOSITORY = Symbol('COTIZACION_REPOSITORY');
