import { Inject, Injectable } from '@nestjs/common';
import {
  CONTACTO_CLIENTE_REPOSITORY,
  type ContactoClienteRepository,
} from '../domain/contacto-cliente.repository.js';
import { ObtenerClienteUseCase } from './obtener-cliente.use-case.js';
@Injectable()
export class ListarContactosUseCase {
  constructor(
    @Inject(CONTACTO_CLIENTE_REPOSITORY)
    private readonly contactos: ContactoClienteRepository,
    private readonly obtenerCliente: ObtenerClienteUseCase,
  ) {}
  async ejecutar(idCliente: number) {
    await this.obtenerCliente.ejecutar(idCliente);
    return this.contactos.listar(idCliente);
  }
}
