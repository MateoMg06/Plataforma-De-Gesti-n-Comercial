import { Visita } from '../domain/visita.js';
import type { VisitaRepository } from '../domain/visita.repository.js';
import { ProgramarVisitaUseCase } from './programar-visita.use-case.js';

// Gracias al puerto, el caso de uso se prueba con un repositorio en memoria, sin base de datos.
class VisitaRepositoryEnMemoria implements VisitaRepository {
  private visitas: Visita[] = [];

  async guardar(visita: Visita) {
    const guardada = new Visita(
      this.visitas.length + 1,
      visita.idCliente,
      visita.idAsesor,
      visita.idRuta,
      visita.fechaProgramada,
      visita.estado,
    );
    this.visitas.push(guardada);
    return guardada;
  }

  async listar() {
    return this.visitas;
  }
}

describe('ProgramarVisitaUseCase', () => {
  const fecha = new Date('2026-10-26T09:00:00');

  it('crea una visita en estado programada', async () => {
    const useCase = new ProgramarVisitaUseCase(new VisitaRepositoryEnMemoria());
    const visita = await useCase.ejecutar(1, 2, fecha);
    expect(visita.id).toBe(1);
    expect(visita.idCliente).toBe(1);
    expect(visita.idAsesor).toBe(2);
    expect(visita.fechaProgramada).toBe(fecha);
    expect(visita.estado).toBe('programada');
  });

  it('acepta ruta opcional', async () => {
    const useCase = new ProgramarVisitaUseCase(new VisitaRepositoryEnMemoria());
    const sinRuta = await useCase.ejecutar(1, 2, fecha);
    expect(sinRuta.idRuta).toBeNull();
    const conRuta = await useCase.ejecutar(1, 2, fecha, 5);
    expect(conRuta.idRuta).toBe(5);
  });

  it('exige cliente', async () => {
    const useCase = new ProgramarVisitaUseCase(new VisitaRepositoryEnMemoria());
    await expect(useCase.ejecutar(0, 2, fecha)).rejects.toThrow('cliente');
  });

  it('exige asesor', async () => {
    const useCase = new ProgramarVisitaUseCase(new VisitaRepositoryEnMemoria());
    await expect(useCase.ejecutar(1, 0, fecha)).rejects.toThrow('asesor');
  });

  it('exige fecha válida', async () => {
    const useCase = new ProgramarVisitaUseCase(new VisitaRepositoryEnMemoria());
    await expect(useCase.ejecutar(1, 2, new Date('no-es-fecha'))).rejects.toThrow('fecha');
  });
});
