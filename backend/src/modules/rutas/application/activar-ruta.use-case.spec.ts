import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ProgramarVisitaUseCase } from '../../visitas/application/programar-visita.use-case.js';
import { Ruta } from '../domain/ruta.js';
import type { RutaRepository } from '../domain/ruta.repository.js';
import { ActivarRutaUseCase } from './activar-ruta.use-case.js';

// Repositorio en memoria con una sola ruta (id 1).
class RutaRepositoryEnMemoria implements RutaRepository {
  constructor(public ruta: Ruta) {}

  async guardar(ruta: Ruta) {
    this.ruta = ruta;
    return ruta;
  }

  async buscarPorId(id: number) {
    return id === 1 ? this.ruta : null;
  }

  async listar() {
    return [this.ruta];
  }
}

// Stub de visitas: anota cada visita que se pide programar.
class ProgramarVisitaStub {
  programadas: { idCliente: number; idAsesor: number; fecha: Date; idRuta: number | null }[] = [];

  async ejecutar(idCliente: number, idAsesor: number, fecha: Date, idRuta: number | null) {
    this.programadas.push({ idCliente, idAsesor, fecha, idRuta });
  }
}

const rutaPlaneada = (clientes: number[]) => {
  const ruta = new Ruta(1, 'Ruta Norte', 3, '2026-10-26', '2026-10-30');
  clientes.forEach((id) => ruta.agregarCliente(id));
  return ruta;
};

describe('ActivarRutaUseCase', () => {
  it('activa la ruta y programa una visita por cliente en orden', async () => {
    const repo = new RutaRepositoryEnMemoria(rutaPlaneada([10, 20]));
    const visitas = new ProgramarVisitaStub();
    const useCase = new ActivarRutaUseCase(repo, visitas as unknown as ProgramarVisitaUseCase);

    const ruta = await useCase.ejecutar(1);

    expect(ruta.estado).toBe('activa');
    expect(repo.ruta.estado).toBe('activa');
    expect(visitas.programadas.map((v) => [v.idCliente, v.idAsesor, v.idRuta, v.fecha.getHours()])).toEqual([
      [10, 3, 1, 8],
      [20, 3, 1, 9],
    ]);
  });

  it('no activa una ruta sin clientes ni crea visitas', async () => {
    const visitas = new ProgramarVisitaStub();
    const useCase = new ActivarRutaUseCase(
      new RutaRepositoryEnMemoria(rutaPlaneada([])),
      visitas as unknown as ProgramarVisitaUseCase,
    );
    await expect(useCase.ejecutar(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(visitas.programadas).toHaveLength(0);
  });

  it('responde 404 si la ruta no existe', async () => {
    const useCase = new ActivarRutaUseCase(
      new RutaRepositoryEnMemoria(rutaPlaneada([10])),
      new ProgramarVisitaStub() as unknown as ProgramarVisitaUseCase,
    );
    await expect(useCase.ejecutar(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
