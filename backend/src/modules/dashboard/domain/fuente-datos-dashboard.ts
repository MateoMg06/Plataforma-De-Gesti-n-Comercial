import type {
  DatoNombre,
  FilaCliente,
  FilaCotizacion,
  FilaPedido,
} from './kpis-dashboard.js';

// Puerto por el que el dashboard pide los datos que todavía no puede leer
// de otros módulos (ventas, clientes y pedidos). Mientras esos módulos no
// exporten sus casos de uso de lectura, lo implementa el adaptador
// infrastructure/fuente-datos-fake.ts con datos de muestra.
export interface FuenteDatosDashboard {
  listarCotizaciones(): Promise<FilaCotizacion[]>;
  listarPedidos(): Promise<FilaPedido[]>;
  listarClientes(): Promise<FilaCliente[]>;
  listarPotenciales(): Promise<DatoNombre[]>;
}

export const FUENTE_DATOS_DASHBOARD = Symbol('FUENTE_DATOS_DASHBOARD');
