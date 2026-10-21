import { Inject, Injectable } from '@nestjs/common';
import { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import { PEDIDO_REPOSITORY, type PedidoRepository } from '../domain/pedido.repository.js';
import type { FiltrosPedido } from '../domain/pedido.repository.js';

// HU-31: consultar pedidos con filtros por cliente, asesor, estado y fechas.
@Injectable()
export class ListarPedidosUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly repo: PedidoRepository,
    private readonly obtenerAsesorPorUsuario: ObtenerAsesorPorUsuarioUseCase,
  ) {}

  async ejecutar(filtros: FiltrosPedido = {}, usuario?: { id: string; role?: string | null }) {
    const consulta = { ...filtros };
    // HU-03: el asesor solo ve sus pedidos, aunque pida los de otro asesor.
    if (usuario?.role === 'asesor') {
      consulta.idAsesor = (await this.obtenerAsesorPorUsuario.ejecutar(usuario.id)).id!;
    }
    // "Hasta" incluye todo ese día: 2026-10-21 llega hasta las 23:59:59.
    if (consulta.hasta) {
      const hasta = new Date(consulta.hasta);
      hasta.setHours(23, 59, 59, 999);
      consulta.hasta = hasta;
    }
    return this.repo.listar(consulta);
  }
}
