import type { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import { Visita } from '../domain/visita.js';
import type { VisitaRepository } from '../domain/visita.repository.js';
import { ListarVisitasUseCase } from './listar-visitas.use-case.js';

const fecha = new Date('2026-10-26T09:00:00');

// Repositorio con dos visitas del asesor 1 y una del asesor 2.
const repo = {
  async listar() {
    return [
      new Visita(1, 10, 1, null, fecha, 'programada'),
      new Visita(2, 11, 2, null, fecha, 'programada'),
      new Visita(3, 12, 1, null, fecha, 'realizada'),
    ];
  },
} as unknown as VisitaRepository;

// El usuario "u-laura" es el asesor 1.
const asesores = {
  async ejecutar() {
    return { id: 1 };
  },
} as unknown as ObtenerAsesorPorUsuarioUseCase;

describe('ListarVisitasUseCase (HU-03)', () => {
  const useCase = new ListarVisitasUseCase(repo, asesores);

  it('el asesor solo ve sus visitas', async () => {
    const visitas = await useCase.ejecutar({ id: 'u-laura', role: 'asesor' });
    expect(visitas.map((v) => v.id)).toEqual([1, 3]);
  });

  it('administrador y líder ven todas', async () => {
    expect(await useCase.ejecutar({ id: 'u-admin', role: 'administrador' })).toHaveLength(3);
    expect(await useCase.ejecutar({ id: 'u-lider', role: 'lider' })).toHaveLength(3);
  });

  it('sin usuario (llamada desde otro módulo) devuelve todas', async () => {
    expect(await useCase.ejecutar()).toHaveLength(3);
  });
});
