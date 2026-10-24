import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import { Visita } from '../domain/visita.js';
import type { VisitaRepository } from '../domain/visita.repository.js';
import { ReprogramarVisitaUseCase } from './reprogramar-visita.use-case.js';

const fecha = new Date('2026-10-26T09:00:00');
const nuevaFecha = new Date('2026-10-28T10:00:00');

// Repositorio en memoria: visita 1 programada (asesor 1) y visita 2 realizada.
function repositorio() {
  const visitas = new Map<number, Visita>([
    [1, new Visita(1, 10, 1, null, fecha, 'programada')],
    [2, new Visita(2, 11, 1, null, fecha, 'realizada', fecha)],
  ]);
  return {
    visitas,
    repo: {
      buscarPorId: async (id: number) => visitas.get(id) ?? null,
      guardar: async (v: Visita) => {
        visitas.set(v.id!, v);
        return v;
      },
    } as unknown as VisitaRepository,
  };
}

// La sesión u-laura es del asesor 1; u-carlos del asesor 2.
const porUsuario = {
  ejecutar: async (idUsuario: string) => ({ id: idUsuario === 'u-laura' ? 1 : 2 }),
} as unknown as ObtenerAsesorPorUsuarioUseCase;

describe('ReprogramarVisitaUseCase (HU-13)', () => {
  it('cambia la fecha, guarda el motivo y queda reprogramada', async () => {
    const { repo, visitas } = repositorio();
    const visita = await new ReprogramarVisitaUseCase(repo, porUsuario).ejecutar(
      1,
      nuevaFecha,
      '  Cliente en inventario  ',
    );
    expect(visita.estado).toBe('reprogramada');
    expect(visita.fechaProgramada).toEqual(nuevaFecha);
    expect(visitas.get(1)!.motivoReprogramacion).toBe('Cliente en inventario');
  });

  it('exige el motivo', async () => {
    const { repo } = repositorio();
    await expect(
      new ReprogramarVisitaUseCase(repo, porUsuario).ejecutar(1, nuevaFecha, '  '),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no reprograma una visita realizada', async () => {
    const { repo } = repositorio();
    await expect(
      new ReprogramarVisitaUseCase(repo, porUsuario).ejecutar(2, nuevaFecha, 'Motivo'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('el asesor solo reprograma sus visitas', async () => {
    const { repo } = repositorio();
    const useCase = new ReprogramarVisitaUseCase(repo, porUsuario);
    await expect(
      useCase.ejecutar(1, nuevaFecha, 'Motivo', { id: 'u-carlos', role: 'asesor' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    const propia = await useCase.ejecutar(1, nuevaFecha, 'Motivo', { id: 'u-laura', role: 'asesor' });
    expect(propia.estado).toBe('reprogramada');
  });

  it('falla si la visita no existe', async () => {
    const { repo } = repositorio();
    await expect(
      new ReprogramarVisitaUseCase(repo, porUsuario).ejecutar(99, nuevaFecha, 'Motivo'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
