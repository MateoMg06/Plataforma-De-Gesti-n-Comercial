import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ResultadoRegistrado, ResultadoVisita } from '../domain/resultado-visita.js';
import { Visita } from '../domain/visita.js';
import type { VisitaRepository } from '../domain/visita.repository.js';
import { RegistrarResultadoVisitaUseCase } from './registrar-resultado-visita.use-case.js';

// Repositorio en memoria que implementa el puerto completo (sin base de datos).
class VisitaRepositoryEnMemoria implements VisitaRepository {
  resultadosCatalogo: ResultadoVisita[] = [{ id: 1, nombre: 'Cobro' }];
  resultadosDeVisita: ResultadoRegistrado[] = [];

  constructor(private visitas: Visita[] = []) {}

  async guardar(visita: Visita) {
    const guardada = new Visita(
      visita.id ?? this.visitas.length + 1,
      visita.idCliente,
      visita.idAsesor,
      visita.idRuta,
      visita.fechaProgramada,
      visita.estado,
      visita.fechaReal,
    );
    this.visitas = this.visitas.map((v) => (v.id === guardada.id ? guardada : v));
    return guardada;
  }

  async listar() {
    return this.visitas;
  }

  async buscarPorId(id: number) {
    return this.visitas.find((v) => v.id === id) ?? null;
  }

  async listarResultadosCatalogo() {
    return this.resultadosCatalogo;
  }

  async guardarResultadosVisita(_idVisita: number, resultados: ResultadoRegistrado[]) {
    this.resultadosDeVisita = resultados;
  }
}

const fechaReal = new Date('2026-10-26T11:30:00');

const visitaProgramada = () =>
  new Visita(1, 1, 2, null, new Date('2026-10-26T09:00:00'), 'programada');

describe('RegistrarResultadoVisitaUseCase', () => {
  it('registra fecha real y estado en la visita', async () => {
    const repo = new VisitaRepositoryEnMemoria([visitaProgramada()]);
    const useCase = new RegistrarResultadoVisitaUseCase(repo);
    const resultado = await useCase.ejecutar(1, fechaReal, 'realizada', []);
    expect(resultado.estado).toBe('realizada');
    expect(resultado.fechaReal).toBe(fechaReal);
  });

  it('guarda los resultados del catálogo con su observación', async () => {
    const repo = new VisitaRepositoryEnMemoria([visitaProgramada()]);
    const useCase = new RegistrarResultadoVisitaUseCase(repo);
    await useCase.ejecutar(1, fechaReal, 'realizada', [
      { idResultado: 1, observacion: 'El cliente pagó todo' },
    ]);
    expect(repo.resultadosDeVisita).toEqual([
      { idResultado: 1, observacion: 'El cliente pagó todo' },
    ]);
  });

  it('una visita realizada no se puede editar (responde 400, no 500)', async () => {
    const realizada = visitaProgramada().registrarResultado(fechaReal, 'realizada');
    const repo = new VisitaRepositoryEnMemoria([realizada]);
    const useCase = new RegistrarResultadoVisitaUseCase(repo);
    const intento = useCase.ejecutar(1, fechaReal, 'cancelada', []);
    await expect(intento).rejects.toBeInstanceOf(BadRequestException);
    await expect(intento).rejects.toThrow('realizada');
  });

  it('rechaza una visita inexistente', async () => {
    const useCase = new RegistrarResultadoVisitaUseCase(new VisitaRepositoryEnMemoria([]));
    await expect(useCase.ejecutar(99, fechaReal, 'realizada', [])).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('exige fecha real válida', async () => {
    const repo = new VisitaRepositoryEnMemoria([visitaProgramada()]);
    const useCase = new RegistrarResultadoVisitaUseCase(repo);
    await expect(
      useCase.ejecutar(1, new Date('no-es-fecha'), 'realizada', []),
    ).rejects.toThrow('fecha');
  });
});
