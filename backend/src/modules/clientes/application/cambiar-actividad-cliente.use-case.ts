import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CLIENTE_REPOSITORY,
  type ClienteRepository,
} from '../domain/cliente.repository.js';

@Injectable()
export class CambiarActividadClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
  ) {}

  async ejecutar(id: number, activo: boolean) {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) throw new NotFoundException('El cliente no existe');
    return this.clientes.guardar(cliente.cambiarActividad(activo));
  }
}
