import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
} from '../domain/cliente.repository.js';

@Injectable()
export class ObtenerClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
  ) {}

  async ejecutar(id: number) {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) throw new NotFoundException('El cliente no existe');
    return cliente;
  }
}
