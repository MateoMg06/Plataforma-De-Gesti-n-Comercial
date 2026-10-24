import { NotFoundException } from '@nestjs/common';
import { ObtenerAsesorUseCase } from '../../asesores/application/obtener-asesor.use-case.js';
import { ObtenerClienteUseCase } from '../../clientes/application/obtener-cliente.use-case.js';
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

  async buscarPorId(id: number) {
    return this.visitas.find((v) => v.id === id) ?? null;
  }

  async listarResultadosCatalogo() {
    return [];
  }

  async guardarResultadosVisita() {}
}

// Stub del caso de uso de clientes: simula qué clientes existen sin tocar la base.
class ObtenerClienteStub {
  constructor(private readonly existentes: number[]) {}

  async ejecutar(id: number) {
    if (!this.existentes.includes(id)) {
      throw new NotFoundException('El cliente no existe');
    }
    return { id };
  }
}

const conClientes = (existentes: number[]) =>
  new ObtenerClienteStub(existentes) as unknown as ObtenerClienteUseCase;

// Stub del caso de uso de asesores: simula qué asesores existen.
class ObtenerAsesorStub {
  constructor(private readonly existentes: number[]) {}

  async ejecutar(id: number) {
    if (!this.existentes.includes(id)) {
      throw new NotFoundException(`No existe el asesor ${id}`);
    }
    return { id };
  }
}

const conAsesores = (existentes: number[]) =>
  new ObtenerAsesorStub(existentes) as unknown as ObtenerAsesorUseCase;

describe('ProgramarVisitaUseCase', () => {
  const fecha = new Date('2026-10-26T09:00:00');

  it('crea una visita en estado programada', async () => {
    const useCase = new ProgramarVisitaUseCase(
      new VisitaRepositoryEnMemoria(),
      conClientes([1, 2]),
      conAsesores([2]),
    );
    const visita = await useCase.ejecutar(1, 2, fecha);
    expect(visita.id).toBe(1);
    expect(visita.idCliente).toBe(1);
    expect(visita.idAsesor).toBe(2);
    expect(visita.fechaProgramada).toBe(fecha);
    expect(visita.estado).toBe('programada');
  });

  it('acepta ruta opcional', async () => {
    const useCase = new ProgramarVisitaUseCase(
      new VisitaRepositoryEnMemoria(),
      conClientes([1]),
      conAsesores([2]),
    );
    const sinRuta = await useCase.ejecutar(1, 2, fecha);
    expect(sinRuta.idRuta).toBeNull();
    const conRuta = await useCase.ejecutar(1, 2, fecha, 5);
    expect(conRuta.idRuta).toBe(5);
  });

  it('rechaza un cliente que no existe', async () => {
    const useCase = new ProgramarVisitaUseCase(
      new VisitaRepositoryEnMemoria(),
      conClientes([2]),
      conAsesores([2]),
    );
    await expect(useCase.ejecutar(99, 2, fecha)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza un asesor que no existe', async () => {
    const useCase = new ProgramarVisitaUseCase(
      new VisitaRepositoryEnMemoria(),
      conClientes([1]),
      conAsesores([2]),
    );
    await expect(useCase.ejecutar(1, 99, fecha)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('exige asesor', async () => {
    const useCase = new ProgramarVisitaUseCase(
      new VisitaRepositoryEnMemoria(),
      conClientes([1]),
      conAsesores([2]),
    );
    await expect(useCase.ejecutar(1, 0, fecha)).rejects.toThrow('asesor');
  });

  it('exige fecha válida', async () => {
    const useCase = new ProgramarVisitaUseCase(
      new VisitaRepositoryEnMemoria(),
      conClientes([1]),
      conAsesores([2]),
    );
    await expect(useCase.ejecutar(1, 2, new Date('no-es-fecha'))).rejects.toThrow('fecha');
  });
});
