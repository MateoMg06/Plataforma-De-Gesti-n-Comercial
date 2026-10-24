import { NotFoundException } from '@nestjs/common';
import { Asesor } from '../domain/asesor.js';
import type { AsesorRepository } from '../domain/asesor.repository.js';
import { ObtenerAsesorUseCase } from './obtener-asesor.use-case.js';

// Gracias al puerto, el caso de uso se prueba con un repositorio en memoria, sin base de datos.
class AsesorRepositoryEnMemoria implements AsesorRepository {
  private asesores: Asesor[] = [];

  async guardar(asesor: Asesor) {
    const guardado = new Asesor(
      this.asesores.length + 1,
      asesor.nombre,
      asesor.correo,
      asesor.telefono,
      asesor.estado,
    );
    this.asesores.push(guardado);
    return guardado;
  }

  async listar() {
    return this.asesores;
  }

  async buscarPorId(id: number) {
    return this.asesores.find((a) => a.id === id) ?? null;
  }

  async buscarPorCorreo(correo: string) {
    return this.asesores.find((a) => a.correo === correo) ?? null;
  }

  async buscarPorIdUsuario() {
    return null;
  }
}

describe('ObtenerAsesorUseCase', () => {
  it('devuelve el asesor si existe', async () => {
    const repositorio = new AsesorRepositoryEnMemoria();
    await repositorio.guardar(
      Asesor.crear('Ana', 'ana@correo.com', '3001234567'),
    );
    const useCase = new ObtenerAsesorUseCase(repositorio);

    const asesor = await useCase.ejecutar(1);
    expect(asesor.nombre).toBe('Ana');
    expect(asesor.puedeRecibirRutas()).toBe(true);
  });

  it('falla si el asesor no existe', async () => {
    const useCase = new ObtenerAsesorUseCase(new AsesorRepositoryEnMemoria());
    await expect(useCase.ejecutar(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
