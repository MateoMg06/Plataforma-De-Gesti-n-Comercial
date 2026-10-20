import { ConflictException } from '@nestjs/common';
import { Zona } from '../domain/zona.js';
import type { ZonaRepository } from '../domain/zona.repository.js';
import { CrearZonaUseCase } from './crear-zona.use-case.js';

// Gracias al puerto, el caso de uso se prueba con un repositorio en memoria, sin base de datos.
class ZonaRepositoryEnMemoria implements ZonaRepository {
  private zonas: Zona[] = [];

  async guardar(zona: Zona) {
    const guardada = new Zona(this.zonas.length + 1, zona.nombre);
    this.zonas.push(guardada);
    return guardada;
  }

  async buscarPorId(id: number) {
    return this.zonas.find((zona) => zona.id === id) ?? null;
  }

  async listar() {
    return this.zonas;
  }

  async buscarPorNombre(nombre: string) {
    return this.zonas.find((z) => z.nombre === nombre) ?? null;
  }
}

describe('CrearZonaUseCase', () => {
  it('crea una zona nueva', async () => {
    const useCase = new CrearZonaUseCase(new ZonaRepositoryEnMemoria());
    const zona = await useCase.ejecutar('  Norte ');
    expect(zona.id).toBe(1);
    expect(zona.nombre).toBe('Norte');
  });

  it('no permite zonas duplicadas', async () => {
    const useCase = new CrearZonaUseCase(new ZonaRepositoryEnMemoria());
    await useCase.ejecutar('Norte');
    await expect(useCase.ejecutar('Norte')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('exige nombre', async () => {
    const useCase = new CrearZonaUseCase(new ZonaRepositoryEnMemoria());
    await expect(useCase.ejecutar('   ')).rejects.toThrow('obligatorio');
  });
});
