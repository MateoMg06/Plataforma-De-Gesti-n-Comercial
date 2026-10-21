import { NotFoundException } from '@nestjs/common';
import type { ObtenerAsesorPorUsuarioUseCase } from '../../asesores/application/obtener-asesor-por-usuario.use-case.js';
import type { ListarVisitasUseCase } from '../../visitas/application/listar-visitas.use-case.js';
import { Visita } from '../../visitas/domain/visita.js';
import { ObtenerMiAgendaUseCase } from './obtener-mi-agenda.use-case.js';

const fecha = new Date('2026-10-26T09:00:00');

// Stub de asesores: solo el usuario "u-laura" está vinculado (asesor 1).
class ObtenerAsesorPorUsuarioStub {
  async ejecutar(idUsuario: string) {
    if (idUsuario !== 'u-laura') {
      throw new NotFoundException('Tu usuario no está vinculado a ningún asesor');
    }
    return { id: 1, nombre: 'Laura' };
  }
}

// Stub de visitas: dos del asesor 1 y una del asesor 2.
class ListarVisitasStub {
  async ejecutar() {
    return [
      new Visita(1, 10, 1, null, fecha, 'programada'),
      new Visita(2, 11, 2, null, fecha, 'programada'),
      new Visita(3, 12, 1, null, fecha, 'realizada'),
    ];
  }
}

const useCase = new ObtenerMiAgendaUseCase(
  new ObtenerAsesorPorUsuarioStub() as unknown as ObtenerAsesorPorUsuarioUseCase,
  new ListarVisitasStub() as unknown as ListarVisitasUseCase,
);

describe('ObtenerMiAgendaUseCase', () => {
  it('devuelve solo las visitas del asesor que inició sesión', async () => {
    const agenda = await useCase.ejecutar('u-laura');
    expect(agenda.asesor).toEqual({ id: 1, nombre: 'Laura' });
    expect(agenda.visitas.map((v) => v.id)).toEqual([1, 3]);
  });

  it('responde 404 si el usuario no está vinculado a un asesor', async () => {
    await expect(useCase.ejecutar('u-admin')).rejects.toBeInstanceOf(NotFoundException);
  });
});
