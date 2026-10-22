import { Injectable } from '@nestjs/common';
import { ListarClientesUseCase } from '../../clientes/application/listar-clientes.use-case.js';
import { ListarPotencialesUseCase } from '../../clientes/application/listar-potenciales.use-case.js';
import { ListarCotizacionesUseCase } from '../../ventas/application/listar-cotizaciones.use-case.js';
import { ListarPedidosUseCase } from '../../ventas/application/listar-pedidos.use-case.js';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import type { FuenteDatosDashboard } from '../domain/fuente-datos-dashboard.js';
import type {
  DatoNombre,
  FilaCliente,
  FilaCotizacion,
  FilaPedido,
} from '../domain/kpis-dashboard.js';

// Adaptador con datos REALES (HU-32). Implementa el puerto del dashboard
// llamando a los casos de uso que exportan ventas y clientes: el dashboard
// nunca toca repositorios ni tablas de otros módulos.
@Injectable()
export class FuenteDatosReal implements FuenteDatosDashboard {
  constructor(
    private readonly listarCotizacionesUseCase: ListarCotizacionesUseCase,
    private readonly listarPedidosUseCase: ListarPedidosUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly listarPotencialesUseCase: ListarPotencialesUseCase,
    private readonly listarVisitasUseCase: ListarVisitasUseCase,
  ) {}

  async listarCotizaciones(): Promise<FilaCotizacion[]> {
    const cotizaciones = await this.listarCotizacionesUseCase.ejecutar();
    // El total lo calcula la entidad Cotizacion (suma de los subtotales).
    return cotizaciones.map((c) => ({
      idAsesor: c.idAsesor,
      estado: c.estado,
      valor: c.total,
    }));
  }

  async listarPedidos(): Promise<FilaPedido[]> {
    // El pedido no guarda el asesor: se toma el de la cotización que lo originó.
    const [pedidos, cotizaciones] = await Promise.all([
      this.listarPedidosUseCase.ejecutar(),
      this.listarCotizacionesUseCase.ejecutar(),
    ]);
    const asesorDeCotizacion = new Map(
      cotizaciones.map((c) => [c.id, c.idAsesor]),
    );
    return pedidos
      .map((p) => ({ idAsesor: asesorDeCotizacion.get(p.idCotizacion) }))
      .filter((fila): fila is FilaPedido => fila.idAsesor !== undefined);
  }

  async listarClientes(): Promise<FilaCliente[]> {
    // ListarClientes pagina de a máximo 100: se piden páginas hasta tenerlos todos.
    const clientes = [];
    for (let page = 1; ; page++) {
      const pagina = await this.listarClientesUseCase.ejecutar({
        page,
        limit: 100,
      });
      clientes.push(...pagina.datos);
      if (clientes.length >= pagina.total || pagina.datos.length === 0) break;
    }
    // El cliente no tiene asesor propio: se toma el de su visita más reciente.
    // Así el asesor ve en "clientes por potencial" solo los clientes que atiende.
    const visitas = await this.listarVisitasUseCase.ejecutar();
    const asesorDeCliente = new Map<number, number>();
    for (const v of [...visitas].sort(
      (a, b) => a.fechaProgramada.getTime() - b.fechaProgramada.getTime(),
    )) {
      asesorDeCliente.set(v.idCliente, v.idAsesor);
    }
    return clientes.map((c) => ({
      idPotencial: c.idPotencial,
      idAsesor: asesorDeCliente.get(c.id!),
    }));
  }

  async listarPotenciales(): Promise<DatoNombre[]> {
    const potenciales = await this.listarPotencialesUseCase.ejecutar();
    // Los que vienen de la base siempre tienen id (solo es null antes de guardar).
    return potenciales.map((p) => ({ id: p.id!, nombre: p.nombre }));
  }
}
