import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Zona } from '../domain/zona.js';
import type { ZonaRepository } from '../domain/zona.repository.js';
import { EditarZonaUseCase } from './editar-zona.use-case.js';
import { EliminarZonaUseCase } from './eliminar-zona.use-case.js';

function preparar() {
  const repositorio: ZonaRepository = {
    buscarPorId: vi.fn().mockResolvedValue(new Zona(1, 'Norte')),
    buscarPorNombre: vi.fn().mockResolvedValue(null),
    guardar: vi.fn().mockImplementation(async (zona: Zona) => zona),
    eliminar: vi.fn().mockResolvedValue(true),
    listar: vi.fn().mockResolvedValue([]),
  };
  return repositorio;
}

describe('EditarZonaUseCase', () => {
  it('conserva el ID y recorta el nuevo nombre', async () => {
    const repositorio = preparar();
    const zona = await new EditarZonaUseCase(repositorio).ejecutar(1, ' Sur ');
    expect(zona).toEqual(new Zona(1, 'Sur'));
  });

  it('permite conservar el nombre propio', async () => {
    const repositorio = preparar();
    vi.mocked(repositorio.buscarPorNombre).mockResolvedValue(
      new Zona(1, 'Norte'),
    );
    expect(
      (await new EditarZonaUseCase(repositorio).ejecutar(1, 'Norte')).nombre,
    ).toBe('Norte');
  });

  it('rechaza el nombre de otra zona sin guardar', async () => {
    const repositorio = preparar();
    vi.mocked(repositorio.buscarPorNombre).mockResolvedValue(
      new Zona(2, 'Sur'),
    );
    await expect(
      new EditarZonaUseCase(repositorio).ejecutar(1, 'Sur'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });

  it('rechaza nombres vacíos', async () => {
    const repositorio = preparar();
    await expect(
      new EditarZonaUseCase(repositorio).ejecutar(1, ' '),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });

  it('rechaza una zona inexistente', async () => {
    const repositorio = preparar();
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(null);
    await expect(
      new EditarZonaUseCase(repositorio).ejecutar(99, 'Sur'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('EliminarZonaUseCase', () => {
  it('elimina una zona sin referencias', async () => {
    const repositorio = preparar();
    await new EliminarZonaUseCase(repositorio).ejecutar(1);
    expect(repositorio.eliminar).toHaveBeenCalledWith(1);
  });

  it('impide eliminar una zona en uso', async () => {
    const repositorio = preparar();
    vi.mocked(repositorio.eliminar).mockResolvedValue(false);
    await expect(
      new EliminarZonaUseCase(repositorio).ejecutar(1),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no intenta borrar una zona inexistente', async () => {
    const repositorio = preparar();
    vi.mocked(repositorio.buscarPorId).mockResolvedValue(null);
    await expect(
      new EliminarZonaUseCase(repositorio).ejecutar(99),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repositorio.eliminar).not.toHaveBeenCalled();
  });
});
