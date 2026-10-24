import type { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { FiltrosPedido, PedidoRepository } from '../domain/pedido.repository.js';
import { ListarPedidosUseCase } from './listar-pedidos.use-case.js';

// Repositorio que solo recuerda con qué filtros lo llamaron.
function repositorio() {
  const llamadas: FiltrosPedido[] = [];
  const repo = {
    listar: async (filtros?: FiltrosPedido) => {
      llamadas.push(filtros ?? {});
      return [];
    },
  } as unknown as PedidoRepository;
  return { repo, llamadas };
}

// La sesión u-laura corresponde al asesor 3.
const porUsuario = {
  ejecutar: async () => ({ id: 3 }),
} as unknown as ObtenerAsesorPorUsuarioUseCase;

describe('ListarPedidosUseCase', () => {
  it('pasa los filtros del administrador sin cambiarlos', async () => {
    const { repo, llamadas } = repositorio();
    await new ListarPedidosUseCase(repo, porUsuario).ejecutar(
      { idCliente: 5, idAsesor: 2, estado: 'pendiente' },
      { id: 'u-admin', role: 'administrador' },
    );
    expect(llamadas[0]).toEqual({ idCliente: 5, idAsesor: 2, estado: 'pendiente' });
  });

  it('el asesor solo ve sus pedidos aunque pida los de otro', async () => {
    const { repo, llamadas } = repositorio();
    await new ListarPedidosUseCase(repo, porUsuario).ejecutar(
      { idAsesor: 2 },
      { id: 'u-laura', role: 'asesor' },
    );
    expect(llamadas[0].idAsesor).toBe(3);
  });

  it('la fecha "hasta" incluye todo ese día', async () => {
    const { repo, llamadas } = repositorio();
    await new ListarPedidosUseCase(repo, porUsuario).ejecutar({
      hasta: new Date('2026-10-21T00:00:00'),
    });
    const hasta = llamadas[0].hasta!;
    expect([hasta.getHours(), hasta.getMinutes()]).toEqual([23, 59]);
  });
});
