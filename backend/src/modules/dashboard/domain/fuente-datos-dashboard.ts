import type {
  DatoNombre,
  FilaCliente,
  FilaCotizacion,
  FilaPedido,
} from './kpis-dashboard.js';

// Puerto por el que el dashboard pide los datos de ventas y clientes.
// Lo implementa infrastructure/fuente-datos-real.ts con los casos de uso
// que exportan esos módulos. En las pruebas se usa uno en memoria.
export interface FuenteDatosDashboard {
  listarCotizaciones(): Promise<FilaCotizacion[]>;
  listarPedidos(): Promise<FilaPedido[]>;
  listarClientes(): Promise<FilaCliente[]>;
  listarPotenciales(): Promise<DatoNombre[]>;
}

export const FUENTE_DATOS_DASHBOARD = Symbol('FUENTE_DATOS_DASHBOARD');
