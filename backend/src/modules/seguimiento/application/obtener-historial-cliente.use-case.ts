import { Inject, Injectable } from '@nestjs/common';
import { ObtenerClienteUseCase } from '../../clientes/application/obtener-cliente.use-case.js';
import { ListarCotizacionesUseCase } from '../../ventas/application/listar-cotizaciones.use-case.js';
import { ListarPedidosUseCase } from '../../ventas/application/listar-pedidos.use-case.js';
import { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import { armarHistorial, type EventoHistorial } from '../domain/historial-cliente.js';
import { SEGUIMIENTO_REPOSITORY, type SeguimientoRepository } from '../domain/seguimiento.repository.js';

// HU-26: historial del cliente. Los seguimientos salen de su repositorio; lo demás,
// de los casos de uso que exportan clientes, visitas y ventas (nunca de sus tablas).
@Injectable()
export class ObtenerHistorialClienteUseCase {
  constructor(
    @Inject(SEGUIMIENTO_REPOSITORY) private readonly seguimientos: SeguimientoRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
    private readonly listarVisitas: ListarVisitasUseCase,
    private readonly listarCotizaciones: ListarCotizacionesUseCase,
    private readonly listarPedidos: ListarPedidosUseCase,
  ) {}

  async ejecutar(idCliente: number): Promise<EventoHistorial[]> {
    // Responde 404 si el cliente no existe.
    await this.obtenerCliente.ejecutar(idCliente);
    const [visitas, seguimientos, cotizaciones, pedidos] = await Promise.all([
      this.listarVisitas.ejecutar(),
      this.seguimientos.listar(),
      this.listarCotizaciones.ejecutar(),
      this.listarPedidos.ejecutar({ idCliente }),
    ]);
    return armarHistorial(idCliente, {
      visitas: visitas.map((v) => ({ ...v, id: v.id! })),
      seguimientos,
      cotizaciones,
      pedidos,
    });
  }
}
