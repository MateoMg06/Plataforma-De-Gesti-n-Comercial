import { NotFoundException } from '@nestjs/common';
import type { ClienteRepository } from '../domain/cliente.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';

describe('ObtenerClienteUseCase', () => {
  it('devuelve el cliente que encuentra el repositorio', async () => {
    const cliente = { id: 3 };
    const buscarPorId = vi.fn().mockResolvedValue(cliente);
    const caso = new ObtenerClienteUseCase({
      buscarPorId,
    } as unknown as ClienteRepository);
    expect(await caso.ejecutar(3)).toBe(cliente);
    expect(buscarPorId).toHaveBeenCalledWith(3);
  });

  it('informa cuando el cliente no existe', async () => {
    const caso = new ObtenerClienteUseCase({
      buscarPorId: async () => null,
    } as unknown as ClienteRepository);
    await expect(caso.ejecutar(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});
