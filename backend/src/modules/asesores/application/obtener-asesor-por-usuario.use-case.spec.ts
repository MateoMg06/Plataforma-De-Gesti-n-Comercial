import { NotFoundException } from '@nestjs/common';
import { AsesorEstado } from '../../../common/enums/domain.enums.js';
import { Asesor } from '../domain/asesor.js';
import type { AsesorRepository } from '../domain/asesor.repository.js';
import { ObtenerAsesorPorUsuarioUseCase } from './obtener-asesor-por-usuario.use-case.js';

// Repositorio en memoria: guarda qué usuario está vinculado a qué asesor.
class AsesorRepositoryEnMemoria implements AsesorRepository {
  private vinculados: Record<string, Asesor> = {
    'u-laura': new Asesor(1, 'Laura', 'laura@correo.com', '3001234567', AsesorEstado.ACTIVO),
  };

  async guardar(asesor: Asesor) {
    return asesor;
  }

  async listar() {
    return Object.values(this.vinculados);
  }

  async buscarPorId() {
    return null;
  }

  async buscarPorCorreo() {
    return null;
  }

  async buscarPorIdUsuario(idUsuario: string) {
    return this.vinculados[idUsuario] ?? null;
  }
}

describe('ObtenerAsesorPorUsuarioUseCase', () => {
  const useCase = new ObtenerAsesorPorUsuarioUseCase(new AsesorRepositoryEnMemoria());

  it('devuelve el asesor vinculado al usuario', async () => {
    const asesor = await useCase.ejecutar('u-laura');
    expect(asesor.nombre).toBe('Laura');
  });

  it('responde 404 si el usuario no tiene asesor', async () => {
    await expect(useCase.ejecutar('u-otro')).rejects.toBeInstanceOf(NotFoundException);
  });
});
