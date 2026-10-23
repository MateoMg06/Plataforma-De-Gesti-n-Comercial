import { Injectable } from '@nestjs/common';
import { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import { ListarClientesUseCase } from '../../clientes/application/listar-clientes.use-case.js';
import { ListarCotizacionesUseCase } from '../../ventas/application/listar-cotizaciones.use-case.js';
import { ListarPedidosUseCase } from '../../ventas/application/listar-pedidos.use-case.js';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import { ObtenerZonaUseCase } from '../../zonas/application/obtener-zona.use-case.js';
import type { DatoNombre } from '../domain/kpis-dashboard.js';
import type { FuenteDatosReporte } from '../domain/fuente-datos-reporte.js';
import type { ClienteOrigen, DatosReporte } from '../domain/reporte.js';

// Adaptador con datos REALES para los reportes (HU-33/34). Igual que el
// dashboard: solo llama a casos de uso que exportan los módulos dueños.
@Injectable()
export class FuenteDatosReporteReal implements FuenteDatosReporte {
  constructor(
    private readonly listarVisitas: ListarVisitasUseCase,
    private readonly listarCotizaciones: ListarCotizacionesUseCase,
    private readonly listarPedidos: ListarPedidosUseCase,
    private readonly listarClientes: ListarClientesUseCase,
    private readonly obtenerAsesor: ObtenerAsesorUseCase,
    private readonly obtenerZona: ObtenerZonaUseCase,
  ) {}

  async obtener(): Promise<DatosReporte> {
    const [visitas, cotizaciones, pedidos, clientes] = await Promise.all([
      this.listarVisitas.ejecutar(),
      this.listarCotizaciones.ejecutar(),
      this.listarPedidos.ejecutar(),
      this.todosLosClientes(),
    ]);

    // El pedido no guarda el asesor: se toma el de la cotización que lo originó.
    const asesorDeCotizacion = new Map(cotizaciones.map((c) => [c.id, c.idAsesor]));
    // El cliente no tiene asesor propio: se toma el de su visita más reciente.
    const asesorDeCliente = new Map<number, number>();
    for (const v of [...visitas].sort((a, b) => a.fechaProgramada.getTime() - b.fechaProgramada.getTime())) {
      asesorDeCliente.set(v.idCliente, v.idAsesor);
    }

    const datos: DatosReporte = {
      visitas: visitas.map((v) => ({
        id: v.id!,
        fecha: v.fechaProgramada,
        idCliente: v.idCliente,
        idAsesor: v.idAsesor,
        estado: v.estado,
      })),
      cotizaciones: cotizaciones.map((c) => ({
        id: c.id!,
        numero: c.numero,
        fecha: c.fecha,
        idCliente: c.idCliente,
        idAsesor: c.idAsesor,
        estado: c.estado,
        valor: c.total,
      })),
      pedidos: pedidos.map((p) => ({
        id: p.id!,
        numero: p.numero,
        fecha: p.fecha,
        idCliente: p.idCliente,
        idAsesor: asesorDeCotizacion.get(p.idCotizacion) ?? 0,
        estado: p.estado,
        valor: Number(p.valor),
      })),
      clientes: clientes.map((c) => ({ ...c, idAsesor: asesorDeCliente.get(c.id) })),
      asesores: [],
      zonas: [],
    };
    datos.asesores = await this.nombres(
      [...datos.visitas, ...datos.cotizaciones, ...datos.pedidos].map((f) => f.idAsesor),
      async (id) => (await this.obtenerAsesor.ejecutar(id)).nombre,
    );
    datos.zonas = await this.nombres(
      clientes.map((c) => c.idZona),
      async (id) => (await this.obtenerZona.ejecutar(id)).nombre,
    );
    return datos;
  }

  // ListarClientes pagina de a máximo 100: se piden páginas hasta tenerlos todos.
  private async todosLosClientes(): Promise<ClienteOrigen[]> {
    const clientes: ClienteOrigen[] = [];
    for (let page = 1; ; page++) {
      const pagina = await this.listarClientes.ejecutar({ page, limit: 100 });
      clientes.push(
        ...pagina.datos.map((c) => ({
          id: c.id!,
          nit: c.nit,
          razonSocial: c.razonSocial,
          idZona: c.idZona,
          fechaCreacion: c.fechaCreacion,
          activo: c.activo,
        })),
      );
      if (clientes.length >= pagina.total || pagina.datos.length === 0) return clientes;
    }
  }

  // Busca el nombre de cada id distinto. Si alguno no existe, el dominio usa uno genérico.
  private async nombres(ids: number[], buscar: (id: number) => Promise<string>): Promise<DatoNombre[]> {
    const resultado: DatoNombre[] = [];
    for (const id of new Set(ids.filter((id) => id > 0))) {
      try {
        resultado.push({ id, nombre: await buscar(id) });
      } catch {
        // No existe en la base: se resuelve con nombre genérico.
      }
    }
    return resultado;
  }
}
