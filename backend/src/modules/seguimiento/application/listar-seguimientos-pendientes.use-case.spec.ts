import type { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import { Seguimiento } from '../domain/seguimiento.js';
import type { SeguimientoRepository } from '../domain/seguimiento.repository.js';
import { ListarSeguimientosPendientesUseCase } from './listar-seguimientos-pendientes.use-case.js';

// Seguimientos de la visita 1 (de Laura) y de la visita 2 (de otro asesor).
const repo = {
  listar: async () => [
    new Seguimiento(1, 1, '2026-10-20', 'Llamar', '', false, null, null),
    new Seguimiento(2, 2, '2026-10-21', 'Visitar', '', false, null, null),
  ],
} as unknown as SeguimientoRepository;

// Con rol asesor, ListarVisitas ya devuelve solo las suyas.
const listarVisitas = {
  ejecutar: async (usuario?: { role?: string | null }) => (usuario?.role === 'asesor' ? [{ id: 1 }] : [{ id: 1 }, { id: 2 }]),
} as unknown as ListarVisitasUseCase;

describe('ListarSeguimientosPendientesUseCase (HU-24 + HU-03)', () => {
  const useCase = new ListarSeguimientosPendientesUseCase(repo, listarVisitas);

  it('el administrador ve todos los pendientes', async () => {
    expect((await useCase.ejecutar({ id: 'u-admin', role: 'administrador' })).map((s) => s.id)).toEqual([1, 2]);
  });

  it('el asesor solo ve los de sus visitas', async () => {
    expect((await useCase.ejecutar({ id: 'u-laura', role: 'asesor' })).map((s) => s.id)).toEqual([1]);
  });
});
