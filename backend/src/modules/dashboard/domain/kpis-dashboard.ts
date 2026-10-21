// Entidad de dominio del dashboard: TypeScript puro, sin NestJS ni TypeORM.
// Aquí viven las reglas de negocio de la HU-32: cómo se agrupan los KPIs
// y qué ve cada usuario. Solo agrupa datos en memoria; nunca consulta tablas.

// Filas mínimas que el dashboard necesita de cada origen.
export type FilaVisita = { idAsesor: number; estado: string };
export type FilaCotizacion = { idAsesor: number; estado: string; valor: number };
export type FilaPedido = { idAsesor: number };
// idAsesor hoy solo existe en los datos falsos: los clientes reales se
// filtrarán por las rutas del asesor cuando rutas exporte su caso de uso.
export type FilaCliente = { idPotencial: number; idAsesor?: number };
export type DatoNombre = { id: number; nombre: string };

export type DatosDashboard = {
  visitas: FilaVisita[];
  cotizaciones: FilaCotizacion[];
  pedidos: FilaPedido[];
  clientes: FilaCliente[];
  potenciales: DatoNombre[];
  asesores: DatoNombre[];
};

export type ConteoCotizaciones = {
  borrador: number;
  enviada: number;
  aprobada: number;
  rechazada: number;
};

export type ValorPorAsesor = {
  idAsesor: number;
  nombreAsesor: string;
  valorCotizado: number;
};

export type PedidosPorAsesorFila = {
  idAsesor: number;
  nombreAsesor: string;
  pedidos: number;
};

export type ClientesPorPotencialFila = {
  potencial: string;
  clientes: number;
};

export class KpisDashboard {
  constructor(
    public readonly visitas: { realizadas: number; programadas: number },
    public readonly cotizacionesPorEstado: ConteoCotizaciones,
    public readonly valorCotizadoPorAsesor: ValorPorAsesor[],
    public readonly pedidosPorAsesor: PedidosPorAsesorFila[],
    public readonly clientesPorPotencial: ClientesPorPotencialFila[],
    public readonly idAsesorFiltrado: number | null,
  ) {}

  // Agrupa los datos crudos en los KPIs de la HU-32.
  // Si idAsesor no es null, el asesor ve solo lo suyo (todas las agrupaciones).
  static calcular(datos: DatosDashboard, idAsesor: number | null = null): KpisDashboard {
    if (idAsesor !== null && (!Number.isInteger(idAsesor) || idAsesor <= 0)) {
      throw new Error('El asesor no es válido');
    }

    const visitas = KpisDashboard.filtrar(datos.visitas, idAsesor);
    const cotizaciones = KpisDashboard.filtrar(datos.cotizaciones, idAsesor);
    const pedidos = KpisDashboard.filtrar(datos.pedidos, idAsesor);

    // Los clientes solo se filtran si traen idAsesor (datos falsos de muestra).
    const clientes =
      idAsesor === null
        ? datos.clientes
        : datos.clientes.filter((cliente) => cliente.idAsesor === idAsesor);

    const nombres = new Map(datos.asesores.map((asesor) => [asesor.id, asesor.nombre]));

    return new KpisDashboard(
      KpisDashboard.contarVisitas(visitas),
      KpisDashboard.contarCotizaciones(cotizaciones),
      KpisDashboard.sumarValorPorAsesor(cotizaciones, nombres),
      KpisDashboard.contarPedidosPorAsesor(pedidos, nombres),
      KpisDashboard.contarClientesPorPotencial(clientes, datos.potenciales),
      idAsesor,
    );
  }

  // Ids de asesor que aparecen en cotizaciones o pedidos (con el filtro aplicado).
  // El caso de uso los usa para traer esos nombres reales desde asesores.
  static idsEnUso(
    cotizaciones: FilaCotizacion[],
    pedidos: FilaPedido[],
    idAsesor: number | null,
  ): number[] {
    const ids = new Set<number>();
    for (const fila of [...cotizaciones, ...pedidos]) {
      if (idAsesor === null || fila.idAsesor === idAsesor) ids.add(fila.idAsesor);
    }
    return [...ids].sort((a, b) => a - b);
  }

  // HU-32: visitas realizadas vs programadas. Los demás estados no cuentan aquí.
  private static contarVisitas(visitas: FilaVisita[]): {
    realizadas: number;
    programadas: number;
  } {
    let realizadas = 0;
    let programadas = 0;
    for (const visita of visitas) {
      if (visita.estado === 'realizada') realizadas += 1;
      else if (visita.estado === 'programada') programadas += 1;
    }
    return { realizadas, programadas };
  }

  // HU-32: cotizaciones contadas por cada estado del modelo.
  private static contarCotizaciones(cotizaciones: FilaCotizacion[]): ConteoCotizaciones {
    const conteo: ConteoCotizaciones = { borrador: 0, enviada: 0, aprobada: 0, rechazada: 0 };
    for (const cotizacion of cotizaciones) {
      if (cotizacion.estado in conteo) {
        conteo[cotizacion.estado as keyof ConteoCotizaciones] += 1;
      }
    }
    return conteo;
  }

  // HU-32: valor cotizado sumado por asesor, con su nombre
  // (si el asesor no existe en la base, se usa un nombre genérico).
  private static sumarValorPorAsesor(
    cotizaciones: FilaCotizacion[],
    nombres: Map<number, string>,
  ): ValorPorAsesor[] {
    const acumulado = new Map<number, number>();
    for (const cotizacion of cotizaciones) {
      acumulado.set(cotizacion.idAsesor, (acumulado.get(cotizacion.idAsesor) ?? 0) + cotizacion.valor);
    }
    return [...acumulado.entries()]
      .sort(([a], [b]) => a - b)
      .map(([idAsesor, valorCotizado]) => ({
        idAsesor,
        nombreAsesor: nombres.get(idAsesor) ?? `Asesor #${idAsesor}`,
        valorCotizado,
      }));
  }

  // HU-32: pedidos contados por asesor. Hoy la tabla PEDIDO no existe,
  // así que la lista llega vacía desde la fuente de datos.
  private static contarPedidosPorAsesor(
    pedidos: FilaPedido[],
    nombres: Map<number, string>,
  ): PedidosPorAsesorFila[] {
    const acumulado = new Map<number, number>();
    for (const pedido of pedidos) {
      acumulado.set(pedido.idAsesor, (acumulado.get(pedido.idAsesor) ?? 0) + 1);
    }
    return [...acumulado.entries()]
      .sort(([a], [b]) => a - b)
      .map(([idAsesor, pedidos]) => ({
        idAsesor,
        nombreAsesor: nombres.get(idAsesor) ?? `Asesor #${idAsesor}`,
        pedidos,
      }));
  }

  // HU-32: clientes agrupados por potencial, en el orden del catálogo.
  private static contarClientesPorPotencial(
    clientes: FilaCliente[],
    potenciales: DatoNombre[],
  ): ClientesPorPotencialFila[] {
    return potenciales.map((potencial) => ({
      potencial: potencial.nombre,
      clientes: clientes.filter((cliente) => cliente.idPotencial === potencial.id).length,
    }));
  }

  private static filtrar<T extends { idAsesor: number }>(filas: T[], idAsesor: number | null): T[] {
    return idAsesor === null ? filas : filas.filter((fila) => fila.idAsesor === idAsesor);
  }
}
