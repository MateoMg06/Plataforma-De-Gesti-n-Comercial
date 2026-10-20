import { Inject, Injectable } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
} from '../domain/cliente.repository.js';

@Injectable()
export class ListarOpcionesClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
  ) {}

  async ejecutar() {
    const [tipos, potenciales, estados] = await Promise.all([
      this.clientes.listarTipos(),
      this.clientes.listarPotenciales(),
      this.clientes.listarEstados(),
    ]);
    return { tipos, potenciales, estados };
  }
}
