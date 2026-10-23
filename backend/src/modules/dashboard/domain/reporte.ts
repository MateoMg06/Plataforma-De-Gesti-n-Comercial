// Entidad de dominio de los reportes (HU-33): TypeScript puro, sin NestJS ni TypeORM.
// Reglas: qué fila entra según los filtros (fechas, asesor, zona) y cómo se
// calculan los totales. Solo trabaja con datos en memoria; nunca consulta tablas.
import type { DatoNombre } from './kpis-dashboard.js';

// Datos crudos que llegan de los otros módulos (por casos de uso).
export type VisitaOrigen = { id: number; fecha: Date; idCliente: number; idAsesor: number; estado: string };
export type CotizacionOrigen = {
  id: number;
  numero: number;
  fecha: Date;
  idCliente: number;
  idAsesor: number;
  estado: string;
  valor: number;
};
// El pedido no guarda asesor: es el de su cotización de origen.
export type PedidoOrigen = CotizacionOrigen;
// idAsesor: el de la visita más reciente del cliente (igual que en el dashboard).
export type ClienteOrigen = {
  id: number;
  nit: string;
  razonSocial: string;
  idZona: number;
  fechaCreacion: Date;
  activo: boolean;
  idAsesor?: number;
};

export type DatosReporte = {
  visitas: VisitaOrigen[];
  cotizaciones: CotizacionOrigen[];
  pedidos: PedidoOrigen[];
  clientes: ClienteOrigen[];
  asesores: DatoNombre[];
  zonas: DatoNombre[];
};

// Todos opcionales y combinables. "hasta" es exclusivo (el día siguiente al elegido).
export type FiltrosReporte = { desde?: Date; hasta?: Date; idAsesor?: number; idZona?: number };

// Fila lista para mostrar o exportar, con nombres en vez de ids.
export type FilaReporte = {
  id: number;
  referencia: string;
  fecha: Date;
  cliente: string;
  zona: string;
  asesor: string;
  estado: string;
  valor: number | null;
};

export type FilaClienteReporte = {
  id: number;
  nit: string;
  razonSocial: string;
  zona: string;
  asesor: string;
  fechaCreacion: Date;
  activo: boolean;
};

export type TotalesReporte = {
  visitas: { cantidad: number; realizadas: number };
  cotizaciones: { cantidad: number; valor: number };
  pedidos: { cantidad: number; valor: number };
};

export function validarFiltrosReporte(filtros: FiltrosReporte): void {
  if (filtros.desde && filtros.hasta && filtros.desde >= filtros.hasta) {
    throw new Error('La fecha "desde" no puede ser posterior a "hasta"');
  }
}

export class Reporte {
  constructor(
    public readonly visitas: FilaReporte[],
    public readonly cotizaciones: FilaReporte[],
    public readonly pedidos: FilaReporte[],
    public readonly totales: TotalesReporte,
  ) {}

  // HU-33: visitas, cotizaciones y pedidos que cumplen los filtros, del más reciente al más antiguo.
  static generar(datos: DatosReporte, filtros: FiltrosReporte): Reporte {
    validarFiltrosReporte(filtros);
    const nombres = new Nombres(datos);
    const cumple = (fila: { fecha: Date; idCliente: number; idAsesor: number }) =>
      cumpleFiltros(fila.fecha, fila.idAsesor, nombres.zonaDeCliente(fila.idCliente), filtros);

    const visitas = datos.visitas.filter(cumple).map((v) => nombres.fila(v, `VIS-${v.id}`, null));
    const cotizaciones = datos.cotizaciones.filter(cumple).map((c) => nombres.fila(c, `COT-${c.numero}`, c.valor));
    const pedidos = datos.pedidos.filter(cumple).map((p) => nombres.fila(p, `PED-${p.numero}`, p.valor));

    const suma = (filas: FilaReporte[]) => filas.reduce((total, f) => total + (f.valor ?? 0), 0);
    return new Reporte(ordenar(visitas), ordenar(cotizaciones), ordenar(pedidos), {
      visitas: { cantidad: visitas.length, realizadas: visitas.filter((v) => v.estado === 'realizada').length },
      cotizaciones: { cantidad: cotizaciones.length, valor: suma(cotizaciones) },
      pedidos: { cantidad: pedidos.length, valor: suma(pedidos) },
    });
  }

  // HU-34: clientes con los mismos filtros (la fecha es la de creación del cliente).
  static clientes(datos: DatosReporte, filtros: FiltrosReporte): FilaClienteReporte[] {
    validarFiltrosReporte(filtros);
    const nombres = new Nombres(datos);
    return datos.clientes
      .filter((c) => cumpleFiltros(c.fechaCreacion, c.idAsesor, c.idZona, filtros))
      .map((c) => ({
        id: c.id,
        nit: c.nit,
        razonSocial: c.razonSocial,
        zona: nombres.zona(c.idZona),
        asesor: c.idAsesor ? nombres.asesor(c.idAsesor) : 'Sin asesor',
        fechaCreacion: c.fechaCreacion,
        activo: c.activo,
      }));
  }
}

function cumpleFiltros(
  fecha: Date,
  idAsesor: number | undefined,
  idZona: number | undefined,
  filtros: FiltrosReporte,
): boolean {
  if (filtros.desde && fecha < filtros.desde) return false;
  if (filtros.hasta && fecha >= filtros.hasta) return false;
  if (filtros.idAsesor && idAsesor !== filtros.idAsesor) return false;
  if (filtros.idZona && idZona !== filtros.idZona) return false;
  return true;
}

function ordenar(filas: FilaReporte[]): FilaReporte[] {
  return [...filas].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

// Traduce ids a nombres. Si un id no aparece, usa un nombre genérico ("Asesor #3").
class Nombres {
  private readonly clientes: Map<number, ClienteOrigen>;
  private readonly asesores: Map<number, string>;
  private readonly zonas: Map<number, string>;

  constructor(datos: DatosReporte) {
    this.clientes = new Map(datos.clientes.map((c) => [c.id, c]));
    this.asesores = new Map(datos.asesores.map((a) => [a.id, a.nombre]));
    this.zonas = new Map(datos.zonas.map((z) => [z.id, z.nombre]));
  }

  zonaDeCliente(idCliente: number): number | undefined {
    return this.clientes.get(idCliente)?.idZona;
  }

  asesor(id: number): string {
    return this.asesores.get(id) ?? `Asesor #${id}`;
  }

  zona(id: number | undefined): string {
    return id ? (this.zonas.get(id) ?? `Zona #${id}`) : 'Sin zona';
  }

  fila(
    origen: { id: number; fecha: Date; idCliente: number; idAsesor: number; estado: string },
    referencia: string,
    valor: number | null,
  ): FilaReporte {
    return {
      id: origen.id,
      referencia,
      fecha: origen.fecha,
      cliente: this.clientes.get(origen.idCliente)?.razonSocial ?? `Cliente #${origen.idCliente}`,
      zona: this.zona(this.zonaDeCliente(origen.idCliente)),
      asesor: this.asesor(origen.idAsesor),
      estado: origen.estado,
      valor,
    };
  }
}
