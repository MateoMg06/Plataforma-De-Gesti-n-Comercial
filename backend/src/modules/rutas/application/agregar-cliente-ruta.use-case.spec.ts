import { NotFoundException } from '@nestjs/common';
import type { ObtenerClienteUseCase } from '../../clientes/application/obtener-cliente.use-case.js';
import { Ruta } from '../domain/ruta.js';
import type { RutaRepository } from '../domain/ruta.repository.js';
import { AgregarClienteRutaUseCase } from './agregar-cliente-ruta.use-case.js';

// Repositorio en memoria con una sola ruta (id 1).
class RutaRepositoryEnMemoria implements RutaRepository {
  ruta = new Ruta(1, 'Ruta Norte', 1, '2026-10-26', '2026-10-30');

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

// Stub del caso de uso de clientes: solo existen los clientes 1 y 2.
class ObtenerClienteStub {
  async ejecutar(id: number) {
    if (![1, 2].includes(id)) throw new NotFoundException('El cliente no existe');
    return { id };
  }
}

const crearUseCase = (repo: RutaRepository) =>
  new AgregarClienteRutaUseCase(repo, new ObtenerClienteStub() as unknown as ObtenerClienteUseCase);

describe('AgregarClienteRutaUseCase', () => {
  it('agrega un cliente que existe', async () => {
    const ruta = await crearUseCase(new RutaRepositoryEnMemoria()).ejecutar(1, 2);
    expect(ruta.clientes.map((c) => c.idCliente)).toEqual([2]);
  });

  it('rechaza un cliente que no existe', async () => {
    const repo = new RutaRepositoryEnMemoria();
    await expect(crearUseCase(repo).ejecutar(1, 999)).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.ruta.clientes).toHaveLength(0);
  });

  it('rechaza una ruta que no existe', async () => {
    await expect(
      crearUseCase(new RutaRepositoryEnMemoria()).ejecutar(99, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
