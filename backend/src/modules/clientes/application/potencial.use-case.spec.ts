import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Potencial } from '../domain/potencial.js';
import type { PotencialRepository } from '../domain/potencial.repository.js';
import { CrearPotencialUseCase } from './crear-potencial.use-case.js';
import { EditarPotencialUseCase } from './editar-potencial.use-case.js';
import { EliminarPotencialUseCase } from './eliminar-potencial.use-case.js';

function preparar(): PotencialRepository {
  return {
    guardar: vi
      .fn()
      .mockImplementation(
        async (opcion: Potencial) =>
          new Potencial(opcion.id ?? 1, opcion.nombre, opcion.orden),
      ),
    listar: vi.fn().mockResolvedValue([]),
    buscarPorId: vi.fn().mockResolvedValue(new Potencial(1, 'Original', 1)),
    buscarPorNombre: vi.fn().mockResolvedValue(null),
    eliminar: vi.fn().mockResolvedValue(true),
  };
}

describe('Potencial: dominio y casos de uso', () => {
  it('crea y recorta el nombre', async () => {
    const opcion = await new CrearPotencialUseCase(preparar()).ejecutar(
      ' Nuevo ',
      1,
    );
    expect(opcion.id).toBe(1);
    expect(opcion.nombre).toBe('Nuevo');
  });

  it('rechaza un nombre vacío y no guarda', async () => {
    const repo = preparar();
    await expect(
      new CrearPotencialUseCase(repo).ejecutar('   ', 1),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('rechaza un nombre duplicado al crear', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorNombre).mockResolvedValue(
      new Potencial(2, 'Duplicado', 1),
    );
    await expect(
      new CrearPotencialUseCase(repo).ejecutar('Duplicado', 1),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('edita conservando el ID', async () => {
    const opcion = await new EditarPotencialUseCase(preparar()).ejecutar(
      1,
      ' Editado ',
      2,
    );
    expect(opcion).toEqual(new Potencial(1, 'Editado', 2));
  });

  it('permite conservar el nombre propio', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorNombre).mockResolvedValue(
      new Potencial(1, 'Original', 1),
    );
    await expect(
      new EditarPotencialUseCase(repo).ejecutar(1, 'Original', 1),
    ).resolves.toBeDefined();
  });

  it('rechaza el nombre de otra opción al editar', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorNombre).mockResolvedValue(
      new Potencial(2, 'Duplicado', 1),
    );
    await expect(
      new EditarPotencialUseCase(repo).ejecutar(1, 'Duplicado', 1),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('rechaza editar una opción inexistente', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(
      new EditarPotencialUseCase(repo).ejecutar(99, 'Nuevo', 1),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('elimina una opción sin referencias', async () => {
    const repo = preparar();
    await new EliminarPotencialUseCase(repo).ejecutar(1);
    expect(repo.eliminar).toHaveBeenCalledWith(1);
  });

  it('impide borrar una opción en uso', async () => {
    const repo = preparar();
    vi.mocked(repo.eliminar).mockResolvedValue(false);
    await expect(
      new EliminarPotencialUseCase(repo).ejecutar(1),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no intenta borrar una opción inexistente', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(
      new EliminarPotencialUseCase(repo).ejecutar(99),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.eliminar).not.toHaveBeenCalled();
  });

  it('el dominio rechaza nombres de más de 100 caracteres', () => {
    expect(() => Potencial.crear('a'.repeat(101), 1)).toThrow();
  });

  it.each([-1, 1.5, NaN, Infinity, 2147483648])(
    'rechaza el orden inválido %s',
    async (orden) => {
      expect(() => Potencial.crear('Alto', orden)).toThrow();
      await expect(
        new CrearPotencialUseCase(preparar()).ejecutar('Alto', orden),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('acepta cero como orden', () => {
    expect(Potencial.crear('Alto', 0).orden).toBe(0);
  });
});
