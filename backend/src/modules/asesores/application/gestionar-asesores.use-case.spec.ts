import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AsesorEstado } from '../../../common/enums/domain.enums.js';
import { Asesor } from '../domain/asesor.js';
import type { AsesorRepository } from '../domain/asesor.repository.js';
import { ActualizarAsesorUseCase } from './actualizar-asesor.use-case.js';
import { CambiarEstadoAsesorUseCase } from './cambiar-estado-asesor.use-case.js';
import { RegistrarAsesorUseCase } from './registrar-asesor.use-case.js';

// Repositorio en memoria: guardar() crea si no hay id y reemplaza si ya existe.
class AsesorRepositoryEnMemoria implements AsesorRepository {
  private asesores: Asesor[] = [];

  async guardar(asesor: Asesor) {
    const id = asesor.id ?? this.asesores.length + 1;
    const guardado = new Asesor(
      id,
      asesor.nombre,
      asesor.correo,
      asesor.telefono,
      asesor.estado,
      asesor.idUsuario,
    );
    this.asesores = this.asesores.filter((a) => a.id !== id);
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

  async buscarPorIdUsuario(idUsuario: string) {
    return this.asesores.find((a) => a.idUsuario === idUsuario) ?? null;
  }
}

describe('RegistrarAsesorUseCase', () => {
  it('registra un asesor activo', async () => {
    const useCase = new RegistrarAsesorUseCase(new AsesorRepositoryEnMemoria());
    const asesor = await useCase.ejecutar('Ana', 'ana@correo.com', '300');
    expect(asesor.id).toBe(1);
    expect(asesor.estado).toBe(AsesorEstado.ACTIVO);
  });

  it('no permite dos asesores con el mismo correo', async () => {
    const useCase = new RegistrarAsesorUseCase(new AsesorRepositoryEnMemoria());
    await useCase.ejecutar('Ana', 'ana@correo.com', '300');
    await expect(
      useCase.ejecutar('Otra Ana', ' ANA@correo.com ', '311'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('responde 400 si faltan datos', async () => {
    const useCase = new RegistrarAsesorUseCase(new AsesorRepositoryEnMemoria());
    await expect(
      useCase.ejecutar(' ', 'ana@correo.com', '300'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ActualizarAsesorUseCase', () => {
  it('actualiza los datos y puede dejar su mismo correo', async () => {
    const repositorio = new AsesorRepositoryEnMemoria();
    await new RegistrarAsesorUseCase(repositorio).ejecutar(
      'Ana',
      'ana@correo.com',
      '300',
    );
    const useCase = new ActualizarAsesorUseCase(repositorio);
    const asesor = await useCase.ejecutar(
      1,
      'Ana María',
      'ana@correo.com',
      '311',
    );
    expect(asesor.nombre).toBe('Ana María');
    expect(asesor.telefono).toBe('311');
  });

  it('no permite usar el correo de otro asesor', async () => {
    const repositorio = new AsesorRepositoryEnMemoria();
    const registrar = new RegistrarAsesorUseCase(repositorio);
    await registrar.ejecutar('Ana', 'ana@correo.com', '300');
    await registrar.ejecutar('Luis', 'luis@correo.com', '311');
    const useCase = new ActualizarAsesorUseCase(repositorio);
    await expect(
      useCase.ejecutar(2, 'Luis', 'ana@correo.com', '311'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('falla si el asesor no existe', async () => {
    const useCase = new ActualizarAsesorUseCase(
      new AsesorRepositoryEnMemoria(),
    );
    await expect(
      useCase.ejecutar(99, 'Ana', 'ana@correo.com', '300'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('Vínculo asesor - usuario (HU-12)', () => {
  it('guarda el usuario y no deja vincularlo a otro asesor', async () => {
    const repo = new AsesorRepositoryEnMemoria();
    const registrar = new RegistrarAsesorUseCase(repo);
    const ana = await registrar.ejecutar('Ana', 'ana@correo.com', '300', 'u-ana');
    expect(ana.idUsuario).toBe('u-ana');
    await expect(registrar.ejecutar('Otro', 'otro@correo.com', '301', 'u-ana')).rejects.toBeInstanceOf(ConflictException);
  });

  it('al editar puede conservar su usuario o quitarlo', async () => {
    const repo = new AsesorRepositoryEnMemoria();
    const ana = await new RegistrarAsesorUseCase(repo).ejecutar('Ana', 'ana@correo.com', '300', 'u-ana');
    const actualizar = new ActualizarAsesorUseCase(repo);
    expect((await actualizar.ejecutar(ana.id!, 'Ana', 'ana@correo.com', '300', 'u-ana')).idUsuario).toBe('u-ana');
    expect((await actualizar.ejecutar(ana.id!, 'Ana', 'ana@correo.com', '300', null)).idUsuario).toBeNull();
  });
});

describe('CambiarEstadoAsesorUseCase', () => {
  it('inactiva un asesor y deja de recibir rutas', async () => {
    const repositorio = new AsesorRepositoryEnMemoria();
    await new RegistrarAsesorUseCase(repositorio).ejecutar(
      'Ana',
      'ana@correo.com',
      '300',
    );
    const useCase = new CambiarEstadoAsesorUseCase(repositorio);
    const asesor = await useCase.ejecutar(1, AsesorEstado.INACTIVO);
    expect(asesor.estado).toBe(AsesorEstado.INACTIVO);
    expect(asesor.puedeRecibirRutas()).toBe(false);
  });

  it('falla si el asesor no existe', async () => {
    const useCase = new CambiarEstadoAsesorUseCase(
      new AsesorRepositoryEnMemoria(),
    );
    await expect(
      useCase.ejecutar(99, AsesorEstado.ACTIVO),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
