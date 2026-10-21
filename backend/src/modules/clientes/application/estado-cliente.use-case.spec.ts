import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCliente } from '../domain/estado-cliente.js';
import type { EstadoClienteRepository } from '../domain/estado-cliente.repository.js';
import { CrearEstadoClienteUseCase } from './crear-estado-cliente.use-case.js';
import { EditarEstadoClienteUseCase } from './editar-estado-cliente.use-case.js';
import { EliminarEstadoClienteUseCase } from './eliminar-estado-cliente.use-case.js';

function preparar(): EstadoClienteRepository {
  return {
    guardar: vi
      .fn()
      .mockImplementation(
        async (opcion: EstadoCliente) =>
          new EstadoCliente(opcion.id ?? 1, opcion.nombre),
      ),
    listar: vi.fn().mockResolvedValue([]),
    buscarPorId: vi.fn().mockResolvedValue(new EstadoCliente(1, 'Original')),
    buscarPorNombre: vi.fn().mockResolvedValue(null),
    eliminar: vi.fn().mockResolvedValue(true),
  };
}

describe('EstadoCliente: dominio y casos de uso', () => {
  it('crea y recorta el nombre', async () => {
    const opcion = await new CrearEstadoClienteUseCase(preparar()).ejecutar(
      ' Nuevo ',
    );
    expect(opcion.id).toBe(1);
    expect(opcion.nombre).toBe('Nuevo');
  });

  it('rechaza un nombre vacío y no guarda', async () => {
    const repo = preparar();
    await expect(
      new CrearEstadoClienteUseCase(repo).ejecutar('   '),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('rechaza un nombre duplicado al crear', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorNombre).mockResolvedValue(
      new EstadoCliente(2, 'Duplicado'),
    );
    await expect(
      new CrearEstadoClienteUseCase(repo).ejecutar('Duplicado'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('edita conservando el ID', async () => {
    const opcion = await new EditarEstadoClienteUseCase(preparar()).ejecutar(
      1,
      ' Editado ',
    );
    expect(opcion).toEqual(new EstadoCliente(1, 'Editado'));
  });

  it('permite conservar el nombre propio', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorNombre).mockResolvedValue(
      new EstadoCliente(1, 'Original'),
    );
    await expect(
      new EditarEstadoClienteUseCase(repo).ejecutar(1, 'Original'),
    ).resolves.toBeDefined();
  });

  it('rechaza el nombre de otra opción al editar', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorNombre).mockResolvedValue(
      new EstadoCliente(2, 'Duplicado'),
    );
    await expect(
      new EditarEstadoClienteUseCase(repo).ejecutar(1, 'Duplicado'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('rechaza editar una opción inexistente', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(
      new EditarEstadoClienteUseCase(repo).ejecutar(99, 'Nuevo'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.guardar).not.toHaveBeenCalled();
  });

  it('elimina una opción sin referencias', async () => {
    const repo = preparar();
    await new EliminarEstadoClienteUseCase(repo).ejecutar(1);
    expect(repo.eliminar).toHaveBeenCalledWith(1);
  });

  it('impide borrar una opción en uso', async () => {
    const repo = preparar();
    vi.mocked(repo.eliminar).mockResolvedValue(false);
    await expect(
      new EliminarEstadoClienteUseCase(repo).ejecutar(1),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no intenta borrar una opción inexistente', async () => {
    const repo = preparar();
    vi.mocked(repo.buscarPorId).mockResolvedValue(null);
    await expect(
      new EliminarEstadoClienteUseCase(repo).ejecutar(99),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.eliminar).not.toHaveBeenCalled();
  });

  it('el dominio rechaza nombres de más de 100 caracteres', () => {
    expect(() => EstadoCliente.crear('a'.repeat(101))).toThrow();
  });
});
